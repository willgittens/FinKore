# SPDX-License-Identifier: MPL-2.0
"""FinKore Workflow behavior for definitions, imports, and transitions."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .errors import FinKoreError

INVALID_DEFINITION = "FINKORE_WORKFLOW_INVALID_DEFINITION"
INVALID_INSTANCE = "FINKORE_WORKFLOW_INVALID_INSTANCE"
INVALID_STATE = "FINKORE_WORKFLOW_INVALID_STATE"
INVALID_TRANSITION = "FINKORE_WORKFLOW_INVALID_TRANSITION"
GUARD_REJECTED = "FINKORE_WORKFLOW_GUARD_REJECTED"
TERMINAL_STATE = "FINKORE_WORKFLOW_TERMINAL_STATE"
VERSION_MISMATCH = "FINKORE_WORKFLOW_VERSION_MISMATCH"
STATE_CONFLICT = "FINKORE_WORKFLOW_STATE_CONFLICT"


def _string_list(value: Any) -> list[str] | None:
    if not isinstance(value, list) or any(not isinstance(item, str) for item in value):
        return None
    return value


def _opaque(value: Any) -> bool:
    return isinstance(value, str) and len(value) > 0


def _version_sequence_valid(value: Any) -> bool:
    return isinstance(value, str) and value.isdecimal() and value != "0" and not value.startswith("0")


def _binding(value: Any) -> dict[str, str] | None:
    if not isinstance(value, dict):
        return None
    definition_identity = value.get("definitionIdentity")
    version_identity = value.get("definitionVersionIdentity")
    if not _opaque(definition_identity) or not _opaque(version_identity):
        return None
    return {"definitionIdentity": definition_identity, "definitionVersionIdentity": version_identity}


@dataclass(frozen=True)
class WorkflowTransition:
    """Directed Workflow transition with optional deterministic fact guards.

    @see WORKFLOW-TRANSITION-001
    @see WORKFLOW-GUARD-001
    """

    source: str
    target: str
    guards: tuple[dict[str, Any], ...] = ()

    @staticmethod
    def from_portable(value: Any, states: set[str], terminal_states: set[str]) -> "WorkflowTransition":
        """Parse a transition and validate declared source, target, and guards."""

        if not isinstance(value, dict):
            raise FinKoreError(INVALID_DEFINITION)
        source = value.get("source")
        target = value.get("target")
        if not isinstance(source, str) or not isinstance(target, str) or source not in states or target not in states:
            raise FinKoreError(INVALID_DEFINITION)
        if source in terminal_states:
            raise FinKoreError(INVALID_DEFINITION)
        guards = value.get("guards", [])
        if "guard" in value:
            if guards != []:
                raise FinKoreError(INVALID_DEFINITION)
            guards = [value["guard"]]
        if not isinstance(guards, list):
            raise FinKoreError(INVALID_DEFINITION)
        for guard in guards:
            if not isinstance(guard, dict) or not isinstance(guard.get("fact"), str) or "equals" not in guard:
                raise FinKoreError(INVALID_DEFINITION)
        return WorkflowTransition(source=source, target=target, guards=tuple(dict(guard) for guard in guards))

    def guards_pass(self, facts: dict[str, Any]) -> bool:
        """Evaluate all transition guards against explicitly supplied facts."""

        return all(facts.get(guard["fact"]) == guard["equals"] for guard in self.guards)


@dataclass(frozen=True)
class WorkflowDefinition:
    """A FinKore Workflow definition with optional immutable version identity.

    @see WORKFLOW-STATES-001
    @see WORKFLOW-VERSION-001
    """

    states: tuple[str, ...]
    initial_state: str
    terminal_states: tuple[str, ...]
    transitions: tuple[WorkflowTransition, ...]
    definition_identity: str | None = None
    definition_version_identity: str | None = None

    @staticmethod
    def from_portable(value: Any) -> "WorkflowDefinition":
        """Validate and parse a portable Workflow definition observation."""

        if not isinstance(value, dict):
            raise FinKoreError(INVALID_DEFINITION)
        states = _string_list(value.get("states"))
        if states is None or len(states) == 0 or len(set(states)) != len(states):
            raise FinKoreError(INVALID_DEFINITION)
        state_set = set(states)
        initial_state = value.get("initialState")
        if not isinstance(initial_state, str) or initial_state not in state_set:
            raise FinKoreError(INVALID_DEFINITION)
        if "initialStates" in value:
            raise FinKoreError(INVALID_DEFINITION)
        terminal_states = _string_list(value.get("terminalStates", []))
        if terminal_states is None or any(state not in state_set for state in terminal_states):
            raise FinKoreError(INVALID_DEFINITION)
        terminal_set = set(terminal_states)
        if len(terminal_set) != len(terminal_states):
            raise FinKoreError(INVALID_DEFINITION)

        definition_identity = value.get("definitionIdentity")
        version_identity = value.get("definitionVersionIdentity")
        if (definition_identity is None) != (version_identity is None):
            raise FinKoreError(INVALID_DEFINITION)
        if definition_identity is not None and (not _opaque(definition_identity) or not _opaque(version_identity)):
            raise FinKoreError(INVALID_DEFINITION)
        if "versionSequence" in value and not _version_sequence_valid(value["versionSequence"]):
            raise FinKoreError(INVALID_DEFINITION)

        raw_transitions = value.get("transitions", [])
        if not isinstance(raw_transitions, list):
            raise FinKoreError(INVALID_DEFINITION)
        transitions = tuple(WorkflowTransition.from_portable(item, state_set, terminal_set) for item in raw_transitions)
        return WorkflowDefinition(
            states=tuple(states),
            initial_state=initial_state,
            terminal_states=tuple(terminal_states),
            transitions=transitions,
            definition_identity=definition_identity,
            definition_version_identity=version_identity,
        )

    def is_versioned(self) -> bool:
        """Return whether this definition declares an immutable version binding."""

        return self.definition_identity is not None

    def binding(self) -> dict[str, str] | None:
        """Return the portable bound definition version for versioned definitions."""

        if self.definition_identity is None or self.definition_version_identity is None:
            return None
        return {"definitionIdentity": self.definition_identity, "definitionVersionIdentity": self.definition_version_identity}

    def transition(self, source: str, target: str) -> WorkflowTransition | None:
        """Find a declared directed transition from source to target."""

        for transition in self.transitions:
            if transition.source == source and transition.target == target:
                return transition
        return None


@dataclass(frozen=True)
class WorkflowInstance:
    """A FinKore Workflow instance observation.

    @see WORKFLOW-STATES-007
    @see WORKFLOW-IMPORT-004
    """

    current_state: str
    binding: dict[str, str] | None = None
    revision: str | None = None

    @staticmethod
    def from_portable(value: Any) -> "WorkflowInstance":
        """Parse a portable Workflow instance observation."""

        if not isinstance(value, dict) or "currentStates" in value:
            raise FinKoreError(INVALID_INSTANCE)
        current_state = value.get("currentState")
        if not isinstance(current_state, str):
            raise FinKoreError(INVALID_INSTANCE)
        revision = value.get("revision")
        if revision is not None and not _opaque(revision):
            raise FinKoreError(INVALID_INSTANCE)
        raw_binding = value.get("binding")
        binding = None if raw_binding is None else _binding(raw_binding)
        if raw_binding is not None and binding is None:
            raise FinKoreError(INVALID_INSTANCE)
        return WorkflowInstance(current_state=current_state, binding=binding, revision=revision)

    def to_portable(self) -> dict[str, Any]:
        """Return the portable observation for this instance."""

        value: dict[str, Any] = {"currentState": self.current_state}
        if self.binding is not None:
            value["binding"] = dict(self.binding)
        if self.revision is not None:
            value["revision"] = self.revision
        return value


def create_workflow(definition: WorkflowDefinition) -> WorkflowInstance:
    """Create an instance in the definition's declared initial State.

    @see WORKFLOW-STATES-003
    @see WORKFLOW-VERSION-007
    """

    return WorkflowInstance(current_state=definition.initial_state, binding=definition.binding())


def import_workflow(definition: WorkflowDefinition, instance: WorkflowInstance) -> WorkflowInstance:
    """Validate and preserve an existing Workflow instance observation.

    @see WORKFLOW-IMPORT-001
    @see WORKFLOW-IMPORT-005
    """

    _validate_binding(definition, instance)
    if instance.current_state not in definition.states:
        raise FinKoreError(INVALID_STATE)
    return instance


def transition_workflow(
    definition: WorkflowDefinition,
    instance: WorkflowInstance,
    target: Any,
    facts: Any | None = None,
    expected_current_state: Any | None = None,
    expected_revision: Any | None = None,
) -> WorkflowInstance:
    """Request a declared Workflow transition without mutating the input instance.

    @see WORKFLOW-ERROR-007
    @see WORKFLOW-TRANSITION-006
    """

    _validate_binding(definition, instance)
    if instance.current_state not in definition.states:
        raise FinKoreError(INVALID_STATE)
    if expected_current_state is not None:
        if not isinstance(expected_current_state, str) or expected_current_state not in definition.states:
            raise FinKoreError(INVALID_STATE)
        if expected_current_state != instance.current_state:
            raise FinKoreError(STATE_CONFLICT)
    if expected_revision is not None:
        if not _opaque(expected_revision) or instance.revision != expected_revision:
            raise FinKoreError(STATE_CONFLICT)
    if instance.current_state in definition.terminal_states:
        raise FinKoreError(TERMINAL_STATE)
    if not isinstance(target, str) or target not in definition.states:
        raise FinKoreError(INVALID_STATE)
    transition = definition.transition(instance.current_state, target)
    if transition is None:
        raise FinKoreError(INVALID_TRANSITION)
    request_facts = facts if isinstance(facts, dict) else {}
    if not transition.guards_pass(request_facts):
        raise FinKoreError(GUARD_REJECTED)
    return WorkflowInstance(current_state=target, binding=instance.binding, revision=instance.revision)


def _validate_binding(definition: WorkflowDefinition, instance: WorkflowInstance) -> None:
    if definition.is_versioned():
        if instance.binding is None:
            raise FinKoreError(INVALID_INSTANCE)
        if instance.binding != definition.binding():
            raise FinKoreError(VERSION_MISMATCH)
    elif instance.binding is not None:
        raise FinKoreError(VERSION_MISMATCH)
