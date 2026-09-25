# SPDX-License-Identifier: MPL-2.0
"""Core 0.9.5 native boundaries; expected failures stay ordinary failing tests."""
import json
import unittest
from copy import deepcopy
from decimal import localcontext
from pathlib import Path

from finkore import FinKoreError, Money, WorkflowDefinition, WorkflowInstance
from finkore.workflow import create_workflow, import_workflow, transition_workflow
from finkore.approvals import record_decision, evaluate_decision, evaluate_requirement
from finkore.audit import append_event, validate_event, validate_history, redact_history
from finkore.entities import create_entity, import_entity, transition_entity

ROOT = Path(__file__).resolve().parents[4]
BINDING = {"definitionIdentity": "invoice-flow", "definitionVersionIdentity": "1"}
FLOW = {"states": ["DRAFT", "REVIEW", "DONE"], "initialState": "DRAFT", "terminalStates": ["DONE"],
        "transitions": [{"source": "DRAFT", "target": "REVIEW"}, {"source": "REVIEW", "target": "DONE"}]}
DEFINITION = {"type": "invoice", "identityScope": "tenant", "workflow": FLOW,
              "mutability": {"DRAFT": ["amount"], "REVIEW": ["amount"], "DONE": []},
              "validation": [{"id": "POSITIVE", "rule": "positive-money", "path": "amount"}]}
DATA = {"amount": {"amount": "1.239", "currency": "EUR"}}
EVENT = {"eventId": "event-1", "eventType": "ENTITY_CHANGED", "entity": {"type": "invoice", "id": "invoice-1"},
         "occurredAt": "2026-09-01T12:00:00Z"}
PREFIXES = ("approval.association.", "workflow.presence.", "entity.import.presence-", "entity.import.equal-revision-",
            "entity.import.distinct-token-", "entity.binding.", "entity.declaration.")


def vectors():
    manifest = json.loads((ROOT / "conformance/manifest.json").read_text())
    return [v for suite in manifest["suites"] for file in suite["vectorFiles"]
            for v in json.loads((ROOT / "conformance" / file).read_text())["vectors"] if v["id"].startswith(PREFIXES)]


def invoke(vector):
    """Call owning public cores directly; no conformance adapter or financial rules."""
    i = vector["input"]
    op = vector["operation"]
    if op == "approval.decision.record":
        return record_decision(i["requirement"], i["decision"], i["history"])
    if op == "approval.requirement.evaluate":
        return evaluate_requirement(i["requirement"], i["decisions"], i.get("currentSubjectFacts"), i.get("relevantFactPaths"), i.get("evaluatedAt"))
    if op == "approval.decision.evaluate":
        return evaluate_decision(i["requirement"], i["decision"], i.get("currentSubjectFacts"))
    if op == "finkore.workflow.transition":
        options = {native: i[field] for field, native in (("expectedCurrentState", "expected_current_state"),
                   ("expectedRevision", "expected_revision")) if field in i}
        definition = WorkflowDefinition.from_portable(i["definition"])
        instance = WorkflowInstance.from_portable(i["instance"])
        before = deepcopy(instance.to_portable())
        try:
            return transition_workflow(definition, instance, i["target"], i.get("facts"), **options).to_portable()
        finally:
            if instance.to_portable() != before:
                raise AssertionError("Transition changed the original State, binding, or revision")
    if op == "finkore.entity.create":
        return create_entity(i["definition"], i["id"], i["data"])
    if op == "finkore.entity.transition":
        return transition_entity(i["definition"], i["entity"], i["target"])
    if op == "entity.import":
        return import_entity(i["definition"], i["import"])
    raise AssertionError("Missing native test dispatch: " + op)


class BoundaryRegressions(unittest.TestCase):
    def portable_error(self, code, action):
        try:
            action()
        except FinKoreError as error:
            self.assertEqual(error.code, code)
        else:
            self.fail("Expected " + code + "; operation succeeded")

    def approval_sequence(self):
        requirement = {"id": "review", "subject": {"type": "invoice", "id": "invoice-1"}, "eligibleActors": ["alice"],
                       "approvedOutcome": "APPROVED", "rejectedOutcome": "REJECTED"}
        decision = {"requirementId": "review", "subjectFacts": None, "outcome": "APPROVED", "actor": {"id": "alice"},
                    "decidedAt": "2026-09-01T12:00:00Z"}
        history = record_decision(requirement, decision, [])
        self.assertEqual(history, {"history": [decision]})
        self.assertEqual(evaluate_requirement(requirement, history), "APPROVED")
        return requirement, history

    def test_approval_record_evaluate_control(self):
        """APPROVAL-DECISION-002: an actual recorded null association remains valid."""
        self.approval_sequence()

    def test_approval_record_rejects_incomplete_reused_history(self):
        """APPROVAL-DECISION-001/002: recording validates all imported evidence."""
        requirement, valid = self.approval_sequence()
        for vector in vectors():
            if not vector["id"].startswith("approval.association.history-"):
                continue
            with self.subTest(vector=vector["id"]):
                history = deepcopy(vector["input"]["decisions"])
                before = deepcopy(history)
                try:
                    self.portable_error("FINKORE_APPROVAL_INVALID_DECISION", lambda: record_decision(
                        requirement, valid["history"][0], history))
                finally:
                    self.assertEqual(history, before)
                    self.assertEqual(evaluate_requirement(requirement, valid), "APPROVED")

    def test_missing_association_preserves_committed_history(self):
        requirement, history = self.approval_sequence()
        missing = deepcopy(history["history"][0])
        del missing["subjectFacts"]
        missing["decidedAt"] = "2026-09-02T12:00:00Z"
        before = deepcopy(history)
        try:
            self.portable_error("FINKORE_APPROVAL_INVALID_DECISION", lambda: record_decision(requirement, missing, history))
        finally:
            self.assertEqual(history, before)
            self.assertEqual(evaluate_requirement(requirement, history), "APPROVED")

    def test_money_exact_serialization_controls(self):
        """MONEY-SERIALIZATION-008: safe reduction, extension, zero and exact round trips."""
        for amount, scale, expected in (("1.2300", 2, "1.23"), ("-1.2300", 2, "-1.23"),
                                        ("1.239", 3, "1.239"), ("1.239", 5, "1.23900"),
                                        ("0", 0, "0"), ("-0.000", 2, "0.00"),
                                        ("123456789012345678901.123456789", 9, "123456789012345678901.123456789")):
            with self.subTest(amount=amount, scale=scale), localcontext() as context:
                context.prec = 6
                value = Money.from_portable({"amount": amount, "currency": "EUR"})
                before = value.to_portable()
                flags = dict(context.flags)
                result = value.to_portable(scale=scale)
                self.assertEqual(result, {"amount": expected, "currency": "EUR"})
                self.assertEqual(Money.from_portable(result).amount, value.amount)
                self.assertEqual(value.to_portable(), before)
                self.assertEqual(context.prec, 6)
                self.assertEqual(context.flags, flags)

    def test_money_zero_requested_scale(self):
        """The native presentation request also applies to zero with trailing zeros."""
        value = Money.from_portable({"amount": "0.000", "currency": "EUR"})
        self.assertEqual(value.to_portable(scale=0), {"amount": "0", "currency": "EUR"})

    def test_money_lossy_serialization_rejected(self):
        """MONEY-ERROR-005/007: neither sign may truncate without explicit rounding."""
        for amount in ("1.239", "-1.239", "0.001", "-0.001"):
            with self.subTest(amount=amount), localcontext() as context:
                context.prec = 6
                value = Money.from_portable({"amount": amount, "currency": "EUR"})
                before, flags = value.to_portable(), dict(context.flags)
                try:
                    self.portable_error("FINKORE_MONEY_ROUNDING_REQUIRED", lambda: value.to_portable(scale=2))
                finally:
                    self.assertEqual(value.to_portable(), before)
                    self.assertEqual(context.flags, flags)
                    self.assertEqual(context.prec, 6)

    def test_money_invalid_scale_rejected(self):
        """MONEY-ERROR-006: invalid scale is not an implicit presentation instruction."""
        for scale in (-1, -2, 1.5, True, "2", [], {}):
            with self.subTest(scale=scale):
                value = Money.from_portable(DATA["amount"])
                before = value.to_portable()
                try:
                    self.portable_error("FINKORE_MONEY_INVALID_ROUNDING", lambda: value.to_portable(scale=scale))
                finally:
                    self.assertEqual(value.to_portable(), before)

    def test_money_explicit_rounding_control(self):
        for amount, expected in (("1.239", "1.24"), ("-1.239", "-1.24")):
            value = Money.from_portable({"amount": amount, "currency": "EUR"})
            self.assertEqual(value.round(2, "HALF_UP").to_portable(scale=2), {"amount": expected, "currency": "EUR"})
            self.assertEqual(value.to_portable()["amount"], amount)

    def test_binding_constructor_input_is_owned(self):
        """WORKFLOW-VERSION-008: the native constructor must own its original binding."""
        source = deepcopy(BINDING)
        first = WorkflowInstance("DRAFT", source, "r1")
        second = WorkflowInstance("DRAFT", source, "r2")
        source["definitionVersionIdentity"] = "2"
        self.assertEqual(first.to_portable(), {"currentState": "DRAFT", "binding": BINDING, "revision": "r1"})
        self.assertEqual(second.to_portable(), {"currentState": "DRAFT", "binding": BINDING, "revision": "r2"})

    def test_exposed_binding_cannot_rebind(self):
        """WORKFLOW-VERSION-008/010: exposed create/import/transition bindings stay owned."""
        for boundary in ("create", "import", "transition"):
            with self.subTest(boundary=boundary):
                definition = WorkflowDefinition.from_portable({**FLOW, **BINDING})
                original = create_workflow(definition)
                value = original
                if boundary == "import":
                    value = import_workflow(definition, WorkflowInstance.from_portable(original.to_portable()))
                if boundary == "transition":
                    value = transition_workflow(definition, original, "REVIEW")
                before, original_before = deepcopy(value.to_portable()), deepcopy(original.to_portable())
                try:
                    value.binding["definitionVersionIdentity"] = "2"
                except TypeError:
                    pass  # An immutable binding is an allowed public representation.
                newer = WorkflowDefinition.from_portable({**FLOW, **BINDING, "definitionVersionIdentity": "2"})
                try:
                    self.portable_error("FINKORE_WORKFLOW_VERSION_MISMATCH", lambda: transition_workflow(newer, value, "DONE" if boundary == "transition" else "REVIEW"))
                finally:
                    self.assertEqual(value.to_portable(), before)
                    self.assertEqual(original.to_portable(), original_before)
                accepted = transition_workflow(definition, value, "DONE" if boundary == "transition" else "REVIEW")
                self.assertEqual(accepted.binding, BINDING)
                self.assertEqual(accepted.revision, value.revision)

    def test_binding_observation_control(self):
        definition = WorkflowDefinition.from_portable({**FLOW, **BINDING})
        value = create_workflow(definition)
        observation = value.to_portable()
        observation["binding"]["definitionVersionIdentity"] = "2"
        result = transition_workflow(definition, value, "REVIEW")
        self.assertEqual(result.to_portable(), {"currentState": "REVIEW", "binding": BINDING})
        self.assertEqual(value.to_portable(), {"currentState": "DRAFT", "binding": BINDING})

    def test_entity_versioned_sequence(self):
        self.entity_sequence(True)

    def test_entity_unversioned_sequence_control(self):
        self.entity_sequence(False)

    def entity_sequence(self, versioned):
        """ENTITY-LIFECYCLE-001/003, ENTITY-IMPORT-002: pass actual outputs onward."""
        definition = deepcopy(DEFINITION)
        if versioned:
            definition["workflow"].update(BINDING)
        first = create_entity(definition, "invoice-1", deepcopy(DATA))
        before = deepcopy(first)
        try:
            second = transition_entity(definition, first, "REVIEW")
            imported = import_entity(definition, {"entity": second})
            final = transition_entity(definition, imported["entity"], "DONE")
            self.assertEqual(final, {"type": "invoice", "id": "invoice-1", "state": "DONE", "data": DATA,
                                     **({"binding": BINDING} if versioned else {})})
            observation = deepcopy(final)
            observation["data"]["amount"]["amount"] = "999"
            self.assertEqual(first, before)
        finally:
            self.assertEqual(first, before)

    def test_audit_cycles_are_portable_errors(self):
        """AUDIT-ACTOR-010/CHANGE-008/ERROR-004: cycles are errors, shared DAGs are valid."""
        for location in ("actor", "change"):
            for shape in ("map", "list", "nested"):
                for boundary in ("construct", "import", "append"):
                    with self.subTest(location=location, shape=shape, boundary=boundary):
                        value = {} if shape != "list" else []
                        if shape == "map":
                            value["cycle"] = value
                        elif shape == "list":
                            value.append(value)
                        else:
                            value["nested"] = [{"cycle": value}]
                        candidate = deepcopy(EVENT)
                        if location == "actor":
                            candidate["actor"] = {"id": "alice", "metadata": value}
                        else:
                            candidate["changes"] = [{"path": "payload", "before": None, "after": value}]
                        history = [{**EVENT, "eventId": "prior"}]
                        before = deepcopy(history)
                        action = (lambda: validate_event(candidate, {}, set())) if boundary == "construct" else (
                            (lambda: validate_history([candidate])) if boundary == "import" else lambda: append_event(history, candidate))
                        try:
                            self.portable_error("FINKORE_AUDIT_ACTOR_INVALID" if location == "actor" else "FINKORE_AUDIT_INVALID_EVENT", action)
                        finally:
                            self.assertEqual(history, before)

    def test_audit_shared_acyclic_and_ownership_controls(self):
        shared = {"number": 1, "values": [None, False, 3.5, {"exact": 1234567890123456789}]}
        payload = {"left": shared, "right": [shared]}
        candidate = {**EVENT, "actor": {"id": "alice", "metadata": payload},
                     "changes": [{"path": "payload", "before": None, "after": payload}]}
        expected = deepcopy(candidate)
        constructed = validate_event(candidate, {}, set())
        imported = validate_history([candidate])
        appended = append_event([], candidate)
        shared["number"] = 999
        self.assertEqual(constructed, expected)
        self.assertEqual(imported, [expected])
        self.assertEqual(appended, {"history": [expected]})
        evidence = {**EVENT, "eventId": "redacted", "eventType": "AUDIT_CONTENT_REDACTED"}
        redacted = redact_history(appended["history"], {"id": "policy", "authority": "retention", "protectedPaths": ["actor.metadata"]}, evidence)
        self.assertEqual(redacted["event"]["actor"]["metadata"], {"presence": "REDACTED"})
        self.assertEqual(appended, {"history": [expected]})
        exposed = appended
        exposed["history"][0]["actor"]["metadata"]["left"]["number"] = 777
        self.assertEqual(imported, [expected])
        self.assertEqual(constructed, expected)
        self.assertEqual(redacted["history"], [expected, evidence])


def native_vector_test(vector):
    def test(self):
        candidate = deepcopy(vector)
        before = deepcopy(candidate["input"])
        try:
            if candidate["expected"]["status"] == "error":
                self.portable_error(candidate["expected"]["error"]["code"], lambda: invoke(candidate))
            else:
                self.assertEqual(invoke(candidate), candidate["expected"]["value"])
        finally:
            self.assertEqual(candidate["input"], before)
    test.__doc__ = vector["id"] + ': ' + ', '.join(vector["requirements"])
    return test


CASES = vectors()
if not CASES:
    raise AssertionError("No Core 0.9.5 native vector cases discovered")
for case in CASES:
    setattr(BoundaryRegressions, "test_native_" + case["id"].replace(".", "_").replace("-", "_"), native_vector_test(case))
