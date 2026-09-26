// SPDX-License-Identifier: MPL-2.0
/**
 * Runs targeted mutation probes for critical Python and Java financial rules.
 *
 * This developer tool mutates temporary copies only, reports whether the
 * conformance suite kills each probe, and never changes repository sources.
 * It does not define financial behavior. Infrastructure failures are not kills.
 */
import { cpSync, existsSync, mkdtempSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { delimiter, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { assessMutationResult, conformanceBaselinePassed } from './mutation-result.js'

const repositoryRoot = process.cwd()
const requestedTarget = process.argv[2] ?? 'all'
const requestedSuite = process.argv[3]
const validTargets = new Set(['all', 'python', 'java'])

if (!validTargets.has(requestedTarget)) {
  console.error('Usage: node docs/tools/mutation-critical.js [all|python|java] [suite]')
  process.exit(2)
}

const pythonMutants = [
{
  "id": "python-entity096-source-null-omitted",
  "suite": "entities",
  "path": "core/src/finkore/entities.py",
  "from": "if \"sourceIdentity\" in import_value:",
  "to": "if import_value.get(\"sourceIdentity\") is not None:",
  "expectedVector": "entity.boundary096.import-source-null-001",
  "expectedPassVectors": [
    "entity.boundary096.import-control-001"
  ]
},
{
  "id": "python-entity096-source-type-omitted",
  "suite": "entities",
  "path": "core/src/finkore/entities.py",
  "from": "if \"sourceIdentity\" in import_value:",
  "to": "if isinstance(import_value.get(\"sourceIdentity\"), dict):",
  "expectedVector": "entity.boundary096.import-source-array-001",
  "expectedPassVectors": [
    "entity.boundary096.import-control-001"
  ]
},
{
  "id": "python-entity096-standalone-mapping-rejected",
  "suite": "entities",
  "path": "core/src/finkore/entities.py",
  "from": "elif \"identityMapping\" in import_value:\n        mapping = _identity_mapping(import_value[\"identityMapping\"], entity, None)",
  "to": "elif \"identityMapping\" in import_value:\n        raise FinKoreError(INVALID_IDENTITY)",
  "expectedVector": "entity.boundary096.import-standalone-mapping-001",
  "expectedPassVectors": [
    "entity.boundary096.import-control-001"
  ]
},
{
  "id": "python-entity096-evolution-null-state",
  "suite": "entities",
  "path": "core/src/finkore/entities.py",
  "from": "if input_value.get(\"expectedSourceState\", source[\"state\"]) != source[\"state\"]:",
  "to": "if input_value.get(\"expectedSourceState\") is not None and input_value[\"expectedSourceState\"] != source[\"state\"]:",
  "expectedVector": "entity.boundary096.evolution-correct-expectedsourcestate-null-001",
  "expectedPassVectors": [
    "entity.boundary096.evolution-correct-control-001"
  ]
},
{
  "id": "python-entity096-evolution-null-revision",
  "suite": "entities",
  "path": "core/src/finkore/entities.py",
  "from": "if input_value.get(\"expectedSourceRevision\", source_revision) != source_revision:",
  "to": "if input_value.get(\"expectedSourceRevision\") is not None and input_value[\"expectedSourceRevision\"] != source_revision:",
  "expectedVector": "entity.boundary096.evolution-correct-expectedsourcerevision-null-001",
  "expectedPassVectors": [
    "entity.boundary096.evolution-correct-control-001"
  ]
},
{
  "id": "python-audit096-authority-bypass",
  "suite": "audit",
  "path": "core/src/finkore/audit.py",
  "from": "if not _opaque(policy.get(\"authority\")):",
  "to": "if False:",
  "expectedVector": "audit.boundary096.authority-absent-001",
  "expectedPassVectors": [
    "audit.boundary096.authority-control-001"
  ]
},
{
  "id": "python-audit096-authority-empty-accepted",
  "suite": "audit",
  "path": "core/src/finkore/audit.py",
  "from": "if not _opaque(policy.get(\"authority\")):",
  "to": "if not isinstance(policy.get(\"authority\"), str):",
  "expectedVector": "audit.boundary096.authority-empty-001",
  "expectedPassVectors": [
    "audit.boundary096.authority-control-001"
  ]
},
{
  "id": "python-audit096-authority-truthiness",
  "suite": "audit",
  "path": "core/src/finkore/audit.py",
  "from": "if not _opaque(policy.get(\"authority\")):",
  "to": "if not policy.get(\"authority\"):",
  "expectedVector": "audit.boundary096.authority-number-001",
  "expectedPassVectors": [
    "audit.boundary096.authority-control-001"
  ]
},
{
  "id": "python-audit096-authority-wrong-error",
  "suite": "audit",
  "path": "core/src/finkore/audit.py",
  "from": "if not _opaque(policy.get(\"authority\")):\n        raise FinKoreError(REDACTION_INVALID)",
  "to": "if not _opaque(policy.get(\"authority\")):\n        raise FinKoreError(INVALID_EVENT)",
  "expectedVector": "audit.boundary096.authority-null-001",
  "expectedPassVectors": [
    "audit.boundary096.authority-control-001"
  ]
},
{
  "id": "python-approval096-reference-instant",
  "suite": "approvals",
  "path": "core/src/finkore/approvals.py",
  "from": "_instant(left[\"decidedAt\"]) == _instant(right[\"decidedAt\"])",
  "to": "left[\"decidedAt\"] == right[\"decidedAt\"]",
  "expectedVector": "approval.boundary096.history-offset-control-001",
  "expectedPassVectors": [
    "approval.boundary096.history-control-001"
  ]
},
{
  "id": "python-approval096-missing-state",
  "suite": "approvals",
  "path": "core/src/finkore/approvals.py",
  "from": "if req[\"applicability\"] == \"APPLICABLE\" and group[\"kind\"] != \"N_OF_M\" and \"state\" not in req:\n            raise FinKoreError(INVALID_CHAIN)",
  "to": "if req[\"applicability\"] == \"APPLICABLE\" and group[\"kind\"] != \"N_OF_M\" and \"state\" not in req:\n            req[\"state\"] = \"PENDING\"",
  "expectedVector": "approval.boundary096.state-all-of-absent-001",
  "expectedPassVectors": [
    "approval.boundary096.state-all-of-control-001"
  ]
},
{
  "id": "python-approval096-context-parser",
  "suite": "approvals",
  "path": "core/src/finkore/approvals.py",
  "from": "_instant(context.get(\"evaluatedAt\") if isinstance(context, dict) else None, INVALID_CONTEXT)",
  "to": "pass",
  "expectedVector": "approval.boundary096.context-calendar-001",
  "expectedPassVectors": [
    "approval.boundary096.context-control-001"
  ]
},
{
  "id": "python-approval096-association",
  "suite": "approvals",
  "path": "core/src/finkore/approvals.py",
  "from": "item = validate_decision(req, decision)",
  "to": "item = _validate_decision_shape(decision)",
  "expectedVector": "approval.boundary096.decision-association-001",
  "expectedPassVectors": [
    "approval.boundary096.decision-control-001"
  ]
},
{
  "id": "python-approval096-history-validation",
  "suite": "approvals",
  "path": "core/src/finkore/approvals.py",
  "from": "validated.append(_validate_lifecycle(event, current, validated))",
  "to": "if event.get(\"type\") in (\"WITHDRAWN\", \"DECISION_SUPERSEDED\", \"REQUIREMENT_SUPERSEDED\"):\n                validated.append(_validate_lifecycle(event, current, validated))",
  "expectedVector": "approval.boundary096.history-record-unknown-kind-001",
  "expectedPassVectors": [
    "approval.boundary096.record-history-control-001"
  ]
},
{
  "id": "python-approval096-self-supersession",
  "suite": "approvals",
  "path": "core/src/finkore/approvals.py",
  "from": "kind == \"DECISION_SUPERSEDED\" and _same_decision_ref(value[\"target\"], value[\"successor\"])",
  "to": "False",
  "expectedVector": "approval.boundary096.supersession-self-001",
  "expectedPassVectors": [
    "approval.boundary096.supersession-successor-withdrawn-001"
  ]
},
{
  "id": "python-approval096-repeat-requirement",
  "suite": "approvals",
  "path": "core/src/finkore/approvals.py",
  "from": "any(item[\"type\"] == kind and item[\"targetRequirementId\"] == target for item in previous)",
  "to": "False",
  "expectedVector": "approval.boundary096.requirement-supersession-repeat-001",
  "expectedPassVectors": [
    "approval.boundary096.requirement-supersession-valid-001"
  ]
},
{
  "id": "python-approval096-decisive-return",
  "suite": "approvals",
  "path": "core/src/finkore/approvals.py",
  "from": "    for decision in history:\n        if _decision_considered(req, decision, lifecycle) and \"expiresAt\" in decision:\n            _instant(evaluated_at, INVALID_CONTEXT)",
  "to": "    if any(decision.get(\"outcome\") == \"REJECTED\" for decision in history):\n        return \"REJECTED\"",
  "expectedVector": "approval.boundary096.complete-context-reject-first-001",
  "expectedPassVectors": [
    "approval.boundary096.complete-context-control-001"
  ]
},
{
  "id": "python-workflow-observed-null-revision-omitted",
  "suite": "workflow",
  "path": "core/src/finkore/workflow.py",
  "from": "if \"revision\" in value and not _opaque(revision):",
  "to": "if revision is not None and not _opaque(revision):",
  "expectedVector": "workflow.boundary096.import-revision-null-before-mismatch-001",
  "expectedPassVectors": [
    "workflow.boundary096.import-mismatch-control-001"
  ]
},
  {
    id: 'python-money-rate-container-accepted',
    suite: 'money', path: 'core/src/finkore/money.py',
    from: 'if not isinstance(kind, str) or kind not in {"DECIMAL", "PERCENTAGE"}:',
    to: 'if isinstance(kind, str) and kind not in {"DECIMAL", "PERCENTAGE"}:',
    expectedVector: 'money.boundary096.rate-kind-object-001',
    expectedPassVectors: ['money.boundary096.rate-control-001'],
  },
  {
    id: 'python-money-rate-unknown-kind-accepted',
    suite: 'money', path: 'core/src/finkore/money.py',
    from: 'if not isinstance(kind, str) or kind not in {"DECIMAL", "PERCENTAGE"}:',
    to: 'if not isinstance(kind, str):',
    expectedVector: 'money.boundary096.rate-kind-unknown-001',
    expectedPassVectors: ['money.boundary096.rate-control-001'],
  },
  {
    id: 'python-money-rate-wrong-error',
    suite: 'money', path: 'core/src/finkore/money.py',
    from: 'if not isinstance(kind, str) or kind not in {"DECIMAL", "PERCENTAGE"}:\n            raise FinKoreError(INVALID_AMOUNT)',
    to: 'if not isinstance(kind, str) or kind not in {"DECIMAL", "PERCENTAGE"}:\n            raise FinKoreError(INVALID_ROUNDING)',
    expectedVector: 'money.boundary096.rate-kind-array-001',
    expectedPassVectors: ['money.boundary096.rate-control-001'],
  },
  {
  "id": "python-entity-create-binding-lost",
  "suite": "entities",
  "path": "core/src/finkore/entities.py",
  "from": "        entity[\"binding\"] = instance.binding",
  "to": "        pass",
  "expectedVector": "entity.binding.versioned-create-001",
  "expectedPassVectors": [
    "entity.binding.unversioned-create-001"
  ]
},
  {
  "id": "python-entity-binding-validation-bypass",
  "suite": "entities",
  "path": "core/src/finkore/entities.py",
  "from": "    import_workflow(workflow, _workflow_instance(entity))",
  "to": "    pass",
  "expectedVector": "entity.binding.import-mismatch-001",
  "expectedPassVectors": [
    "entity.binding.versioned-import-001"
  ]
},
  {
  "id": "python-entity-revision-conflict-conflated",
  "suite": "entities",
  "path": "core/src/finkore/entities.py",
  "from": "if current_revision is not None and current_revision[\"revision\"] == conflict_version:",
  "to": "if False:",
  "expectedVector": "entity.import.equal-revision-conflict-token-001",
  "expectedPassVectors": [
    "entity.import.distinct-token-control-001"
  ]
},
  {
  "id": "python-entity-validator-unknown-skipped",
  "suite": "entities",
  "path": "core/src/finkore/entities.py",
  "from": "rule.get(\"rule\") not in (\"positive-money\", \"money-not-greater-than\")",
  "to": "False",
  "expectedVector": "entity.declaration.unknown-create-001",
  "expectedPassVectors": [
    "entity.declaration.cross-field-control-001"
  ]
},
  {
  "id": "python-entity-state-null-omitted",
  "suite": "entities",
  "path": "core/src/finkore/entities.py",
  "from": "if import_value.get(\"expectedState\", entity[\"state\"]) != entity[\"state\"]:",
  "to": "if import_value.get(\"expectedState\") is not None and import_value[\"expectedState\"] != entity[\"state\"]:",
  "expectedVector": "entity.import.presence-state-null-001",
  "expectedPassVectors": [
    "entity.import.presence-state-matching-control-001"
  ]
},
  {
  "id": "python-entity-revision-null-omitted",
  "suite": "entities",
  "path": "core/src/finkore/entities.py",
  "from": "if \"expectedRevision\" in import_value and ",
  "to": "if import_value.get(\"expectedRevision\") is not None and ",
  "expectedVector": "entity.import.presence-revision-null-001",
  "expectedPassVectors": [
    "entity.import.presence-revision-matching-control-001"
  ]
},
  {
  "id": "python-entity-conflict-version-null-omitted",
  "suite": "entities",
  "path": "core/src/finkore/entities.py",
  "from": "if \"expectedConflictVersion\" in import_value and ",
  "to": "if import_value.get(\"expectedConflictVersion\") is not None and ",
  "expectedVector": "entity.import.presence-conflict-version-null-001",
  "expectedPassVectors": [
    "entity.import.presence-conflict-version-matching-control-001"
  ]
},
  {
    "id": "python-approval-missing-association-accepted",
    "suite": "approvals",
    "path": "core/src/finkore/approvals.py",
    "from": "if \"subjectFacts\" not in decision:",
    "to": "if False and \"subjectFacts\" not in decision:",
    "expectedVector": "approval.association.record-missing-facts-001",
    "expectedPassVectors": [
      "approval.association.record-null-control-001"
    ]
  },
  {
    "id": "python-approval-explicit-null-association-rejected",
    "suite": "approvals",
    "path": "core/src/finkore/approvals.py",
    "from": "if \"subjectFacts\" not in decision:",
    "to": "if decision.get(\"subjectFacts\") is None:",
    "expectedVector": "approval.association.record-null-control-001",
    "expectedPassVectors": [
      "approval.association.record-empty-object-control-001"
    ]
  },
  {
    "id": "python-approval-subject-type-validation-bypass",
    "suite": "approvals",
    "path": "core/src/finkore/approvals.py",
    "from": " or not _opaque(subject.get(\"type\"))",
    "to": "",
    "expectedVector": "approval.association.record-subject-missing-type-001",
    "expectedPassVectors": [
      "approval.association.record-null-control-001"
    ]
  },
  {
    "id": "python-approval-subject-id-validation-bypass",
    "suite": "approvals",
    "path": "core/src/finkore/approvals.py",
    "from": " or not _opaque(subject.get(\"id\"))",
    "to": "",
    "expectedVector": "approval.association.record-subject-missing-id-001",
    "expectedPassVectors": [
      "approval.association.record-null-control-001"
    ]
  },
  {
    "id": "python-approval-duplicate-eligibility-accepted",
    "suite": "approvals",
    "path": "core/src/finkore/approvals.py",
    "from": " or len(set(eligible)) != len(eligible)",
    "to": "",
    "expectedVector": "approval.association.record-duplicate-eligibility-001",
    "expectedPassVectors": [
      "approval.association.record-null-control-001"
    ]
  },
  {
    "id": "python-approval-empty-eligibility-accepted",
    "suite": "approvals",
    "path": "core/src/finkore/approvals.py",
    "from": " or not eligible or any(",
    "to": " or any(",
    "expectedVector": "approval.association.record-empty-eligibility-001",
    "expectedPassVectors": [
      "approval.association.record-null-control-001"
    ]
  },
  {
    "id": "python-approval-null-eligibility-inferred",
    "suite": "approvals",
    "path": "core/src/finkore/approvals.py",
    "from": "eligible = requirement.get(\"eligibleActors\")",
    "to": "eligible = requirement.get(\"eligibleActors\")\n    if eligible is None:\n        requirement = {**requirement, \"eligibleActors\": [\"alice\"]}\n        eligible = requirement[\"eligibleActors\"]",
    "expectedVector": "approval.association.evaluate-null-eligibility-001",
    "expectedPassVectors": [
      "approval.association.record-null-control-001"
    ]
  },
  {
    "id": "python-approval-list-history-validation-bypass",
    "suite": "approvals",
    "path": "core/src/finkore/approvals.py",
    "from": "return [_validate_decision_shape(item) for item in decisions], []",
    "to": "return [_validate_decision_shape(dict(item, subjectFacts=item.get(\"subjectFacts\"))) if isinstance(item, dict) else _validate_decision_shape(item) for item in decisions], []",
    "expectedVector": "approval.association.history-after-valid-001",
    "expectedPassVectors": [
      "approval.association.evaluate-null-control-001"
    ]
  },
  {
    "id": "python-approval-envelope-history-validation-bypass",
    "suite": "approvals",
    "path": "core/src/finkore/approvals.py",
    "from": "current = [_validate_decision_shape(item) for item in history]",
    "to": "current = [_validate_decision_shape(dict(item, subjectFacts=item.get(\"subjectFacts\"))) if isinstance(item, dict) else _validate_decision_shape(item) for item in history]",
    "expectedVector": "approval.association.history-withdrawn-001",
    "expectedPassVectors": [
      "approval.association.evaluate-null-control-001"
    ]
  },
  {
    "id": "python-workflow-adapter-null-state-omitted",
    "suite": "workflow",
    "expectedVector": "workflow.presence.state-null-001",
    "expectedPassVectors": [
      "workflow.presence.omitted-control-001"
    ],
    "path": "adapters/conformance/bridge.py",
    "from": ") if portable in input_value}",
    "to": ") if portable in input_value and (portable != \"expectedCurrentState\" or input_value[portable] is not None)}"
  },
  {
    "id": "python-workflow-adapter-null-revision-omitted",
    "suite": "workflow",
    "expectedVector": "workflow.presence.revision-null-001",
    "expectedPassVectors": [
      "workflow.presence.omitted-control-001"
    ],
    "path": "adapters/conformance/bridge.py",
    "from": ") if portable in input_value}",
    "to": ") if portable in input_value and (portable != \"expectedRevision\" or input_value[portable] is not None)}"
  },
  {
    "id": "python-workflow-state-null-omitted",
    "expectedVector": "workflow.presence.state-null-001",
    "expectedPassVectors": [
      "workflow.presence.omitted-control-001"
    ],
    "suite": "workflow",
    "path": "core/src/finkore/workflow.py",
    "from": "if expected_current_state is not _OMITTED:",
    "to": "if expected_current_state is not _OMITTED and expected_current_state is not None:"
  },
  {
    "id": "python-workflow-revision-null-omitted",
    "expectedVector": "workflow.presence.revision-null-001",
    "expectedPassVectors": [
      "workflow.presence.omitted-control-001"
    ],
    "suite": "workflow",
    "path": "core/src/finkore/workflow.py",
    "from": "if expected_revision is not _OMITTED:",
    "to": "if expected_revision is not _OMITTED and expected_revision is not None:"
  },
  {
    "id": "python-workflow-invalid-target-priority",
    "expectedVector": "workflow.presence.target-before-conflict-001",
    "expectedPassVectors": [
      "workflow.presence.omitted-control-001"
    ],
    "suite": "workflow",
    "path": "core/src/finkore/workflow.py",
    "from": "if not isinstance(target, str) or target not in definition.states:",
    "to": "if not isinstance(target, str):"
  },
  {
    "id": "python-workflow-binding-mismatch-bypass",
    "expectedVector": "workflow.presence.version-mismatch-before-null-001",
    "expectedPassVectors": [
      "workflow.presence.omitted-control-001"
    ],
    "suite": "workflow",
    "path": "core/src/finkore/workflow.py",
    "from": "if instance.binding != definition.binding():",
    "to": "if False:"
  },
  {
    "id": "python-workflow-empty-fact",
    "expectedVector": "workflow.guard.empty-fact-regression-001",
    "expectedPassVectors": [
      "workflow.guard.valid-regression-001"
    ],
    "suite": "workflow",
    "path": "core/src/finkore/workflow.py",
    "from": "not _opaque(guard.get(\"fact\"))",
    "to": "not isinstance(guard.get(\"fact\"), str)"
  },
  {
    "id": "python-workflow-competing-list",
    "expectedVector": "workflow.guard.nonempty-competing-list-regression-001",
    "expectedPassVectors": [
      "workflow.guard.empty-competing-list-regression-001"
    ],
    "suite": "workflow",
    "path": "core/src/finkore/workflow.py",
    "from": "if guards != []:",
    "to": "if False:"
  },
  {
    "id": "python-workflow-null-guard-omitted",
    "expectedVector": "workflow.guard.null-guard-regression-001",
    "expectedPassVectors": [
      "workflow.guard.null-equals-regression-001"
    ],
    "suite": "workflow",
    "path": "core/src/finkore/workflow.py",
    "from": "guards = [value[\"guard\"]]",
    "to": "guards = [] if value[\"guard\"] is None else [value[\"guard\"]]"
  },
  {
    "id": "python-workflow-selector-as-position",
    "expectedVector": "workflow.version.sequence-one-001",
    "expectedPassVectors": [
      "workflow.version.sequence-opaque-001"
    ],
    "suite": "workflow",
    "path": "core/src/finkore/workflow.py",
    "from": "not _version_sequence_valid(version_identity)",
    "to": "not _version_sequence_valid(value[\"versionSequence\"])"
  },
  {
    "id": "python-workflow-position-bypass",
    "expectedVector": "workflow.version.sequence-zero-001",
    "expectedPassVectors": [
      "workflow.version.sequence-multi-digit-001"
    ],
    "suite": "workflow",
    "path": "core/src/finkore/workflow.py",
    "from": "not _version_sequence_valid(version_identity)",
    "to": "False"
  },
  {
    "id": "python-workflow-selector-bypass",
    "expectedVector": "workflow.version.sequence-null-selector-001",
    "expectedPassVectors": [
      "workflow.version.sequence-one-001"
    ],
    "suite": "workflow",
    "path": "core/src/finkore/workflow.py",
    "from": "value[\"versionSequence\"] != \"DEFAULT\"",
    "to": "False"
  },
  {
    id: 'python-entity-conflicting-required-effects',
    expectedVector: 'entity.evolution.history.same-step-required-effects-current-001',
    expectedPassVectors: ['entity.evolution.history.same-step-consistent-control-001'],
    suite: 'entities',
    path: 'core/src/finkore/entities.py',
    from: 'if related in effects and effects[related] is not True:',
    to: 'if False:',
  },
  {
    id: 'python-entity-correspondence-before-audit',
    expectedVector: 'entity.evolution.correct.audit-timestamp-before-correspondence-001',
    expectedPassVectors: ['entity.evolution.correct.evidence-valid-control-001'],
    suite: 'entities',
    path: 'core/src/finkore/entities.py',
    from: '    audit_history = append_event(input_value.get("auditHistory"), input_value.get("auditEvent"))\n    relation = _relation(kind, relation_id, source, source_revision, related, related_revision, scope, input_value["auditEvent"]["eventId"])\n    if kind in ("CORRECTION", "REVERSAL"):\n        relation["sourceCurrent"] = current\n    _validate_evolution_evidence(input_value["auditEvent"], relation)',
    to: '    relation = _relation(kind, relation_id, source, source_revision, related, related_revision, scope, input_value.get("auditEvent", {}).get("eventId"))\n    if kind in ("CORRECTION", "REVERSAL"):\n        relation["sourceCurrent"] = current\n    _validate_evolution_evidence(input_value["auditEvent"], relation)\n    audit_history = append_event(input_value.get("auditHistory"), input_value.get("auditEvent"))',
  },
  {
    id: 'python-entity-correspondence-bypass',
    expectedVector: 'entity.evolution.correct.evidence-wrong-related-001',
    expectedPassVectors: ['entity.evolution.correct.evidence-valid-control-001'],
    suite: 'entities',
    path: 'core/src/finkore/entities.py',
    from: '    _validate_evolution_evidence(input_value["auditEvent"], relation)',
    to: '    pass',
  },
  {
    id: 'python-entity-history-contradiction-accepted',
    expectedVector: 'entity.evolution.history.contradiction-001',
    expectedPassVectors: ['entity.evolution.history.valid-void-sequence-001'],
    suite: 'entities',
    path: 'core/src/finkore/entities.py',
    from: 'if key in observed and observed[key] != current and key not in effects:',
    to: 'if False:',
  },
  {
    id: 'python-entity-result-history-unvalidated',
    expectedVector: 'entity.evolution.history.related-noncurrent-001',
    expectedPassVectors: ['entity.evolution.correct.evidence-valid-control-001'],
    suite: 'entities',
    path: 'core/src/finkore/entities.py',
    from: 'next_history = import_evolution_history({"relations": [*current_relations, relation]})',
    to: 'next_history = {"relations": [*current_relations, relation]}',
  },
  {
    id: 'python-entity-required-currentness-effect-bypass',
    expectedVector: 'entity.evolution.history.void-effect-invalid-001',
    expectedPassVectors: ['entity.evolution.history.valid-void-sequence-001'],
    suite: 'entities',
    path: 'core/src/finkore/entities.py',
    from: 'if key in effects and effects[key] != current:',
    to: 'if False:',
  },
  {
    id: 'python-entity-same-step-conflict-accepted',
    expectedVector: 'entity.evolution.history.same-step-correction-contradiction-001',
    expectedPassVectors: ['entity.evolution.history.valid-supersession-sequence-001'],
    suite: 'entities',
    path: 'core/src/finkore/entities.py',
    from: '(related in step and step[related] != related_current)',
    to: 'False',
  },
  {
    id: 'python-entity-currentness-assumed-true',
    expectedVector: 'entity.evolution.history.noncurrent-match-001',
    expectedPassVectors: ['entity.evolution.correct.evidence-valid-control-001'],
    suite: 'entities',
    path: 'core/src/finkore/entities.py',
    from: 'current = observed.get(_reference_key(source_reference, scope), True)',
    to: 'current = True',
  },
  {
    id: 'python-entity-source-currentness-restored',
    expectedVector: 'entity.evolution.history.noncurrent-omitted-001',
    expectedPassVectors: ['entity.evolution.correct.evidence-valid-control-001'],
    suite: 'entities',
    path: 'core/src/finkore/entities.py',
    from: 'relation["sourceCurrent"] = current',
    to: 'relation["sourceCurrent"] = True',
  },
  {
    id: 'python-entity-scope-conflated',
    expectedVector: 'entity.evolution.history.scoped-different-scope-001',
    expectedPassVectors: ['entity.evolution.history.scoped-same-scope-001'],
    suite: 'entities',
    path: 'core/src/finkore/entities.py',
    from: 'return scope, reference["type"], reference["id"], reference["revision"]',
    to: 'return None, reference["type"], reference["id"], reference["revision"]',
  },
  {
    id: 'python-entity-revision-conflated',
    expectedVector: 'entity.evolution.history.different-revision-001',
    // A collapsed revision also corrupts same-Entity source/related pairs;
    // the single-reference Void control isolates this defect.
    expectedPassVectors: ['entity.evolution.void.evidence-valid-control-001'],
    suite: 'entities',
    path: 'core/src/finkore/entities.py',
    from: 'return scope, reference["type"], reference["id"], reference["revision"]',
    to: 'return scope, reference["type"], reference["id"], ""',
  },
  {
    id: 'python-entity-entity-type-conflated',
    expectedVector: 'entity.evolution.history.different-entity-type-001',
    expectedPassVectors: ['entity.evolution.history.noncurrent-match-001'],
    suite: 'entities',
    path: 'core/src/finkore/entities.py',
    from: 'return scope, reference["type"], reference["id"], reference["revision"]',
    to: 'return scope, "", reference["id"], reference["revision"]',
  },
  {
    id: 'python-entity-duplicate-reversal-accepted',
    expectedVector: 'entity.evolution.reverse.history-duplicate-policy-001',
    expectedPassVectors: ['entity.evolution.reverse.history-unrelated-control-001'],
    suite: 'entities',
    path: 'core/src/finkore/entities.py',
    from: 'if kind == "REVERSAL" and any(',
    to: 'if False and any(',
  },
  {
    id: 'python-entity-scope-evidence-bypass',
    expectedVector: 'entity.evolution.supersede.evidence-wrong-scope-001',
    expectedPassVectors: ['entity.evolution.supersede.evidence-valid-control-001'],
    suite: 'entities',
    path: 'core/src/finkore/entities.py',
    from: 'or evidence.get("supersessionScope") != relation.get("supersessionScope")',
    to: 'or False',
  },
  {
    id: 'python-entity-audit-relationship-bypass',
    expectedVector: 'entity.evolution.correct.evidence-wrong-relationship-001',
    expectedPassVectors: ['entity.evolution.correct.evidence-valid-control-001'],
    suite: 'entities',
    path: 'core/src/finkore/entities.py',
    from: 'if not any(item["type"] == relationship_type for item in event.get("relationships", [])):',
    to: 'if False:',
  },
  {
    id: 'python-approval-record-drops-lifecycle',
    expectedVector: 'approval.record.preserves-withdrawn-001',
    expectedPassVectors: ['approval.withdraw.target-unique-001'],
    suite: 'approvals',
    path: 'core/src/finkore/approvals.py',
    from: 'result["lifecycle"] = lifecycle',
    to: 'result["lifecycle"] = []',
  },
  {
    id: 'python-approval-withdraw-request-type-override',
    expectedVector: 'approval.lifecycle.withdraw.request-type-conflicting-001',
    expectedPassVectors: ['approval.lifecycle.withdraw.request-type-omitted-001'],
    suite: 'approvals',
    path: 'core/src/finkore/approvals.py',
    from: 'return {**deepcopy(value), "type": lifecycle_type}',
    to: 'return {"type": lifecycle_type, **deepcopy(value)} if lifecycle_type == "WITHDRAWN" else {**deepcopy(value), "type": lifecycle_type}',
  },
  {
    id: 'python-approval-supersede-request-type-override',
    expectedVector: 'approval.lifecycle.supersede.request-type-conflicting-001',
    expectedPassVectors: ['approval.lifecycle.supersede.request-type-omitted-001'],
    suite: 'approvals',
    path: 'core/src/finkore/approvals.py',
    from: 'return {**deepcopy(value), "type": lifecycle_type}',
    to: 'return {"type": lifecycle_type, **deepcopy(value)} if lifecycle_type == "DECISION_SUPERSEDED" else {**deepcopy(value), "type": lifecycle_type}',
  },
  {
    id: 'python-approval-requirement-request-type-override',
    expectedVector: 'approval.lifecycle.requirement.request-type-conflicting-001',
    expectedPassVectors: ['approval.lifecycle.requirement.request-type-omitted-001'],
    suite: 'approvals',
    path: 'core/src/finkore/approvals.py',
    from: '{**supersession, "type": "REQUIREMENT_SUPERSEDED"}',
    to: '{"type": "REQUIREMENT_SUPERSEDED", **supersession}',
  },
  {
    id: 'python-approval-withdraw-first-match',
    expectedVector: 'approval.withdraw.target-ambiguous-001',
    expectedPassVectors: ['approval.withdraw.target-unique-001'],
    suite: 'approvals',
    path: 'core/src/finkore/approvals.py',
    from: 'sum(_same_decision_ref(_decision_key(decision), ref) for decision in history) != 1',
    to: 'not any(_same_decision_ref(_decision_key(decision), ref) for decision in history)',
  },
  {
    id: 'python-approval-withdraw-superseded-accepted',
    expectedVector: 'approval.withdraw.target-superseded-001',
    expectedPassVectors: ['approval.withdraw.target-unique-001'],
    suite: 'approvals',
    path: 'core/src/finkore/approvals.py',
    from: 'item["type"] in ("WITHDRAWN", "DECISION_SUPERSEDED") and _same_decision_ref(item["target"], value["target"])',
    to: 'item["type"] == "WITHDRAWN" and _same_decision_ref(item["target"], value["target"])',
  },
  {
    id: 'python-approval-withdraw-withdrawn-accepted',
    expectedVector: 'approval.validity.withdraw-duplicate-invalid-001',
    expectedPassVectors: ['approval.withdraw.target-unique-001'],
    suite: 'approvals',
    path: 'core/src/finkore/approvals.py',
    from: 'item["type"] in ("WITHDRAWN", "DECISION_SUPERSEDED") and _same_decision_ref(item["target"], value["target"])',
    to: 'item["type"] == "DECISION_SUPERSEDED" and _same_decision_ref(item["target"], value["target"])',
  },
  {
    id: 'python-approval-effectiveness-validation-bypass',
    expectedVector: 'approval.quorum.effectiveness-string-001',
    expectedPassVectors: ['approval.quorum.effectiveness-true-001', 'approval.quorum.effectiveness-false-001'],
    suite: 'approvals',
    path: 'core/src/finkore/approvals.py',
    from: 'if not isinstance(decision.get("effective"), bool):',
    to: 'if False:',
  },
  {
    id: 'python-approval-missing-effectiveness-default',
    expectedVector: 'approval.quorum.effectiveness-missing-001',
    expectedPassVectors: ['approval.quorum.effectiveness-true-001', 'approval.quorum.effectiveness-false-001'],
    suite: 'approvals',
    path: 'core/src/finkore/approvals.py',
    from: 'if not isinstance(decision.get("effective"), bool):',
    to: 'if not isinstance(decision.get("effective", True), bool):',
  },
  {
    id: 'python-approval-numeric-effectiveness-accepted',
    expectedVector: 'approval.quorum.effectiveness-number-001',
    expectedPassVectors: ['approval.quorum.effectiveness-true-001', 'approval.quorum.effectiveness-false-001'],
    suite: 'approvals',
    path: 'core/src/finkore/approvals.py',
    from: 'if not isinstance(decision.get("effective"), bool):',
    to: 'if not isinstance(decision.get("effective"), (bool, int)):',
  },
  {
    id: 'python-approval-false-effectiveness-rejected',
    expectedVector: 'approval.quorum.effectiveness-false-001',
    expectedPassVectors: ['approval.quorum.effectiveness-true-001'],
    suite: 'approvals',
    path: 'core/src/finkore/approvals.py',
    from: 'if not isinstance(decision.get("effective"), bool):',
    to: 'if decision.get("effective") is not True:',
  },
  {
    id: 'python-approval-ineffective-vote-counted',
    expectedVector: 'approval.quorum.effectiveness-false-001',
    expectedPassVectors: ['approval.quorum.effectiveness-true-001'],
    suite: 'approvals',
    path: 'core/src/finkore/approvals.py',
    from: 'or decision.get("effective") is False:\n            continue',
    to: 'or False:\n            continue',
  },
  {
    id: 'python-entity-import-validation-bypass',
    expectedVector: 'entity.import.validation-positive-money-invalid-001',
    expectedPassVectors: ['entity.import.validation-positive-money-valid-001'],
    suite: 'entities',
    path: 'core/src/finkore/entities.py',
    from: 'entity = validate_entity(entity_definition, import_value.get("entity"))\n    _validate_entity_data(entity_definition, entity)',
    to: 'entity = validate_entity(entity_definition, import_value.get("entity"))',
  },
  {
    id: 'python-workflow-boolean-number-coercion',
    expectedVector: 'workflow.guard.boolean-expected-number-actual-rejected-001',
    expectedPassVectors: ['workflow.guard.pass-001'],
    suite: 'workflow',
    path: 'core/src/finkore/workflow.py',
    from: 'return isinstance(left, bool) and isinstance(right, bool) and left == right',
    to: 'return left == right',
  },
  {
    id: 'python-workflow-missing-null-coercion',
    expectedVector: 'workflow.guard.missing-fact-not-null-001',
    expectedPassVectors: ['workflow.guard.explicit-null-pass-001'],
    suite: 'workflow',
    path: 'core/src/finkore/workflow.py',
    from: 'guard["fact"] in facts and _json_equal(facts[guard["fact"]], guard["equals"])',
    to: '_json_equal(facts.get(guard["fact"]), guard["equals"])',
  },
  {
    id: 'python-audit-display-name-validation-bypass',
    expectedVector: 'audit.actor.empty-display-name-001',
    expectedPassVectors: ['audit.actor.display-name-not-identity-001'],
    suite: 'audit',
    path: 'core/src/finkore/audit.py',
    from: 'if "displayName" in actor and not _opaque(actor["displayName"]):\n        raise FinKoreError(ACTOR_INVALID)',
    to: 'if False and "displayName" in actor and not _opaque(actor["displayName"]):\n        raise FinKoreError(ACTOR_INVALID)',
  },
  {
    id: 'python-audit-boolean-number-coercion',
    expectedVector: 'audit.change.boolean-to-number-distinct-001',
    expectedPassVectors: ['audit.change.unchanged-boolean-rejected-001'],
    suite: 'audit',
    path: 'core/src/finkore/audit.py',
    from: 'return isinstance(left, bool) and isinstance(right, bool) and left == right',
    to: 'return left == right',
  },
  {
    id: 'python-audit-money-domain-equality-bypass',
    expectedVector: 'audit.change.money-trailing-zero-unchanged-001',
    expectedPassVectors: ['audit.change.money-amount-changed-001'],
    suite: 'audit',
    path: 'core/src/finkore/audit.py',
    from: 'return left.currency == right.currency and left.compare(right) == "EQUAL"',
    to: 'return left.to_portable() == right.to_portable()',
  },
  {
    id: 'python-entity-validates-patch-only',
    expectedPassVectors: ['entity.validation.cross-field-paired-increase-001'],
    expectedVector: 'entity.validation.cross-field-retained-limit-valid-001',
    suite: 'entities',
    path: 'core/src/finkore/entities.py',
    from: '_validate_entity_data(entity_definition, result)',
    to: '_validate_entity_data(entity_definition, {**result, "data": changes})',
  },
  {
    id: 'python-entity-cross-field-validation-bypass',
    expectedPassVectors: ['entity.validation.cross-field-retained-limit-valid-001'],
    expectedVector: 'entity.validation.cross-field-combined-invalid-001',
    suite: 'entities',
    path: 'core/src/finkore/entities.py',
    from: 'valid = value.compare(other) != "GREATER"',
    to: 'valid = True',
  },
  {
    id: 'python-entity-cross-field-equality-rejected',
    expectedPassVectors: ['entity.validation.cross-field-retained-limit-valid-001'],
    expectedVector: 'entity.validation.cross-field-paired-increase-001',
    suite: 'entities',
    path: 'core/src/finkore/entities.py',
    from: 'valid = value.compare(other) != "GREATER"',
    to: 'valid = value.compare(other) == "LESS"',
  },
  {
    id: 'python-entity-validates-old-result',
    expectedPassVectors: ['entity.validation.cross-field-retained-limit-valid-001'],
    expectedVector: 'entity.validation.cross-field-combined-invalid-001',
    suite: 'entities',
    path: 'core/src/finkore/entities.py',
    from: '_validate_entity_data(entity_definition, result)',
    to: '_validate_entity_data(entity_definition, current)',
  },
  {
    id: 'python-entity-validates-intermediate-result',
    expectedPassVectors: ['entity.validation.cross-field-retained-limit-valid-001'],
    expectedVector: 'entity.validation.cross-field-paired-increase-001',
    suite: 'entities',
    path: 'core/src/finkore/entities.py',
    from: 'result["data"] = {**result["data"], **deepcopy(changes)}',
    to: 'for path, value in changes.items():\n        result["data"][path] = deepcopy(value)\n        _validate_entity_data(entity_definition, result)',
  },
  {
    id: 'python-approval-native-fact-equality',
    expectedPassVectors: ['approval.validity.structured-facts-unchanged-001'],
    expectedVector: 'approval.validity.boolean-number-fact-change-001',
    suite: 'approvals',
    path: 'core/src/finkore/approvals.py',
    from: 'if left is _MISSING or right is _MISSING or not _json_fact_equal(left, right):',
    to: 'if left is _MISSING or right is _MISSING or left != right:',
  },
  {
    id: 'python-approval-shallow-object-fact-equality',
    expectedPassVectors: ['approval.validity.structured-facts-unchanged-001'],
    expectedVector: 'approval.validity.nested-number-boolean-fact-change-001',
    suite: 'approvals',
    path: 'core/src/finkore/approvals.py',
    from: 'return all(_json_fact_equal(left[key], right[key]) for key in left)',
    to: 'return left == right',
  },
  {
    id: 'python-approval-shallow-array-fact-equality',
    expectedPassVectors: ['approval.validity.structured-facts-unchanged-001'],
    expectedVector: 'approval.validity.array-number-boolean-fact-change-001',
    suite: 'approvals',
    path: 'core/src/finkore/approvals.py',
    from: 'return all(_json_fact_equal(a, b) for a, b in zip(left, right))',
    to: 'return left == right',
  },
  {
    id: 'python-approval-unchanged-boolean-facts-rejected',
    expectedPassVectors: ['approval.validity.boolean-number-fact-change-001'],
    expectedVector: 'approval.validity.structured-facts-unchanged-001',
    suite: 'approvals',
    path: 'core/src/finkore/approvals.py',
    from: 'return left is right',
    to: 'return False',
  },
  {
    id: 'python-money-subtraction-context-rounding',
    expectedPassVectors: ['money.subtract.basic-001'],
    expectedVector: 'money.subtract.high-precision-right-operand-001',
    suite: 'money',
    path: 'core/src/finkore/money.py',
    from: 'return Money(_add_decimal(self.amount, other.amount.copy_negate()), self.currency)',
    to: 'return Money(_add_decimal(self.amount, -other.amount), self.currency)',
  },
  {
    id: 'python-money-negation-context-rounding',
    expectedPassVectors: ['money.negate.positive-001'],
    expectedVector: 'money.negate.high-precision-001',
    suite: 'money',
    path: 'core/src/finkore/money.py',
    from: 'return Money(self.amount.copy_negate(), self.currency, self.presentation_scale)',
    to: 'return Money(-self.amount, self.currency, self.presentation_scale)',
  },
  {
    id: 'python-money-allocation-context-rounding',
    expectedPassVectors: ['money.allocate.equal.remainder-positive-001'],
    expectedVector: 'money.allocate.equal.high-precision-single-part-001',
    suite: 'money',
    path: 'core/src/finkore/money.py',
    from: 'Money(_decimal_from_units(sign * units_for_part, target_scale), self.currency, target_scale)',
    to: 'Money(Decimal(sign * units_for_part).scaleb(-target_scale), self.currency, target_scale)',
  },
  {
    id: 'python-money-currency-mismatch-bypass',
    expectedVector: 'money.add.currency-mismatch-001',
    expectedPassVectors: ['money.add.same-currency.basic-001'],
    suite: 'money',
    path: 'core/src/finkore/money.py',
    from: 'if self.currency != other.currency:\n            raise FinKoreError(CURRENCY_MISMATCH)',
    to: 'if False and self.currency != other.currency:\n            raise FinKoreError(CURRENCY_MISMATCH)',
  },
  {
    id: 'python-money-addition-subtracts',
    expectedVector: 'money.add.same-currency.basic-001',
    expectedPassVectors: ['money.add.zero-001'],
    suite: 'money',
    path: 'core/src/finkore/money.py',
    from: 'return Money(_add_decimal(self.amount, other.amount), self.currency)',
    to: 'return Money(_add_decimal(self.amount, -other.amount), self.currency)',
  },
  {
    id: 'python-money-floor-becomes-down',
    expectedVector: 'money.round.floor.negative-001',
    expectedPassVectors: ['money.round.floor.positive-001'],
    suite: 'money',
    path: 'core/src/finkore/money.py',
    from: 'elif mode == "FLOOR":\n            increment = sign < 0',
    to: 'elif mode == "FLOOR":\n            increment = False',
  },
  {
    id: 'python-money-allocation-upper-bound-bypass',
    expectedVector: 'money.allocate.scale.out-of-range-001',
    expectedPassVectors: ['money.allocate.scale.maximum-001'],
    suite: 'money',
    path: 'core/src/finkore/money.py',
    from: 'if integer < minimum or integer > maximum:\n        raise FinKoreError(INVALID_ALLOCATION)',
    to: 'if integer < minimum:\n        raise FinKoreError(INVALID_ALLOCATION)',
  },
  {
    id: 'python-money-allocation-maximum-rejected',
    expectedVector: 'money.allocate.scale.maximum-001',
    expectedPassVectors: ['money.allocate.equal.remainder-positive-001'],
    suite: 'money',
    path: 'core/src/finkore/money.py',
    from: 'if integer < minimum or integer > maximum:\n        raise FinKoreError(INVALID_ALLOCATION)',
    to: 'if integer < minimum or integer >= maximum:\n        raise FinKoreError(INVALID_ALLOCATION)',
  },
  {
    id: 'python-workflow-guard-bypass',
    expectedVector: 'workflow.guard.reject-001',
    expectedPassVectors: ['workflow.guard.pass-001'],
    suite: 'workflow',
    path: 'core/src/finkore/workflow.py',
    from: 'if not transition.guards_pass(request_facts):\n        raise FinKoreError(GUARD_REJECTED)',
    to: 'if False and not transition.guards_pass(request_facts):\n        raise FinKoreError(GUARD_REJECTED)',
  },
  {
    id: 'python-audit-replace-append-only-bypass',
    expectedVector: 'audit.append-only.replace-forbidden-001',
    expectedPassVectors: ['audit.relationship.corrects.append-001'],
    suite: 'audit',
    path: 'core/src/finkore/audit.py',
    from: 'if not _opaque(event_id) or not isinstance(replacement, dict):\n        raise FinKoreError(INVALID_EVENT)\n    raise FinKoreError(APPEND_ONLY_VIOLATION)',
    to: 'if not _opaque(event_id) or not isinstance(replacement, dict):\n        raise FinKoreError(INVALID_EVENT)\n    return {"history": [replacement]}',
  },
  {
    id: 'python-approval-expiration-bypass',
    expectedVector: 'approval.validity.expiration-at-boundary-001',
    expectedPassVectors: ['approval.validity.expiration-before-boundary-001'],
    suite: 'approvals',
    path: 'core/src/finkore/approvals.py',
    from: 'return _instant(evaluated_at, INVALID_CONTEXT) >= _instant(decision["expiresAt"], INVALID_CONTEXT)',
    to: 'return False',
  },
  {
    id: 'python-timestamp-nanoseconds-truncated',
    expectedVector: 'shared.timestamp.expiration-subnanosecond-before-001',
    expectedPassVectors: ['shared.timestamp.expiration-equivalent-offset-nanoseconds-001'],
    suite: 'shared',
    path: 'core/src/finkore/_timestamp.py',
    from: 'return local_second - offset_seconds, nanosecond',
    to: 'return local_second - offset_seconds, nanosecond // 1_000_000',
  },
  {
    id: 'python-timestamp-unknown-offset-accepted',
    expectedVector: 'shared.timestamp.unknown-offset-invalid-001',
    expectedPassVectors: ['shared.timestamp.maximum-precision-001'],
    suite: 'shared',
    path: 'core/src/finkore/_timestamp.py',
    from: 'if offset_hour > 23 or offset_minute > 59 or (sign == "-" and offset_hour == 0 and offset_minute == 0):',
    to: 'if offset_hour > 23 or offset_minute > 59:',
  },
  {
    id: 'python-approval-ineligible-actor-bypass',
    expectedVector: 'approval.association.ineligible-control-001',
    expectedPassVectors: ['approval.association.record-null-control-001'],
    suite: 'approvals',
    path: 'core/src/finkore/approvals.py',
    from: 'if actor_id not in requirement.get("eligibleActors", [actor_id]):\n        raise FinKoreError(INELIGIBLE_ACTOR)',
    to: 'if False and actor_id not in requirement.get("eligibleActors", [actor_id]):\n        raise FinKoreError(INELIGIBLE_ACTOR)',
  },
  {
    id: 'python-audit-actor-identity-bypass',
    expectedVector: 'audit.actor.missing-id-001',
    expectedPassVectors: ['audit.actor.opaque-identity-001'],
    suite: 'audit',
    path: 'core/src/finkore/audit.py',
    from: 'if not isinstance(actor, dict) or not _opaque(actor.get("id")):\n        raise FinKoreError(ACTOR_INVALID)',
    to: 'if not isinstance(actor, dict):\n        raise FinKoreError(ACTOR_INVALID)',
  },
  {
    id: 'python-entity-immutability-bypass',
    expectedVector: 'entity.mutate.immutable-financial-field-001',
    expectedPassVectors: ['entity.mutate.mutable-field-001'],
    suite: 'entities',
    path: 'core/src/finkore/entities.py',
    from: 'if any(path not in mutable for path in changes):\n        raise FinKoreError(IMMUTABLE)',
    to: 'if False and any(path not in mutable for path in changes):\n        raise FinKoreError(IMMUTABLE)',
  },
  {
    id: 'python-entity-positive-money-validation-bypass',
    expectedVector: 'entity.import.validation-positive-money-invalid-001',
    expectedPassVectors: ['entity.import.validation-positive-money-valid-001'],
    suite: 'entities',
    path: 'core/src/finkore/entities.py',
    from: 'if money.amount <= Decimal("0"):\n                findings.append({"rule": rule.get("id"), "path": rule.get("path")})',
    to: 'if False and money.amount <= Decimal("0"):\n                findings.append({"rule": rule.get("id"), "path": rule.get("path")})',
  },
  {
    id: 'python-entity-duplicate-revision-bypass',
    expectedVector: 'entity.import.duplicate-revision-invalid-identity-001',
    expectedPassVectors: ['entity.import.distinct-token-control-001'],
    suite: 'entities',
    path: 'core/src/finkore/entities.py',
    from: 'if len({revision["revision"] for revision in revisions}) != len(revisions):\n        raise FinKoreError(INVALID_IDENTITY)',
    to: 'if False and len({revision["revision"] for revision in revisions}) != len(revisions):\n        raise FinKoreError(INVALID_IDENTITY)',
  },
]

const javaMutants = [
{
  "id": "java-entity096-source-null-omitted",
  "suite": "entities",
  "path": "core/src/main/java/org/finkore/Entities.java",
  "from": "if (input.containsKey(\"sourceIdentity\")) {",
  "to": "if (input.get(\"sourceIdentity\") != null) {",
  "expectedVector": "entity.boundary096.import-source-null-001",
  "expectedPassVectors": [
    "entity.boundary096.import-control-001"
  ]
},
{
  "id": "java-entity096-source-type-omitted",
  "suite": "entities",
  "path": "core/src/main/java/org/finkore/Entities.java",
  "from": "if (input.containsKey(\"sourceIdentity\")) {",
  "to": "if (input.get(\"sourceIdentity\") instanceof Map<?, ?>) {",
  "expectedVector": "entity.boundary096.import-source-array-001",
  "expectedPassVectors": [
    "entity.boundary096.import-control-001"
  ]
},
{
  "id": "java-entity096-standalone-mapping-rejected",
  "suite": "entities",
  "path": "core/src/main/java/org/finkore/Entities.java",
  "from": "mapping = identityMapping(input.get(\"identityMapping\"), entity, null);",
  "to": "throw new FinKoreException(INVALID_IDENTITY);",
  "expectedVector": "entity.boundary096.import-standalone-mapping-001",
  "expectedPassVectors": [
    "entity.boundary096.import-control-001"
  ]
},
{
  "id": "java-entity096-evolution-null-state",
  "suite": "entities",
  "path": "core/src/main/java/org/finkore/Entities.java",
  "from": "if (input.containsKey(\"expectedSourceState\") && !source.get(\"state\").equals(input.get(\"expectedSourceState\"))) {",
  "to": "if (input.get(\"expectedSourceState\") != null && !source.get(\"state\").equals(input.get(\"expectedSourceState\"))) {",
  "expectedVector": "entity.boundary096.evolution-correct-expectedsourcestate-null-001",
  "expectedPassVectors": [
    "entity.boundary096.evolution-correct-control-001"
  ]
},
{
  "id": "java-entity096-evolution-null-revision",
  "suite": "entities",
  "path": "core/src/main/java/org/finkore/Entities.java",
  "from": "if (input.containsKey(\"expectedSourceRevision\") && !sourceRevision.equals(input.get(\"expectedSourceRevision\"))) {",
  "to": "if (input.get(\"expectedSourceRevision\") != null && !sourceRevision.equals(input.get(\"expectedSourceRevision\"))) {",
  "expectedVector": "entity.boundary096.evolution-correct-expectedsourcerevision-null-001",
  "expectedPassVectors": [
    "entity.boundary096.evolution-correct-control-001"
  ]
},
{
  "id": "java-approval096-reference-instant",
  "suite": "approvals",
  "path": "core/src/main/java/org/finkore/Approvals.java",
  "from": "instant(a.get(\"decidedAt\"), INVALID_DECISION).compareTo(instant(b.get(\"decidedAt\"), INVALID_DECISION)) == 0",
  "to": "Objects.equals(a.get(\"decidedAt\"), b.get(\"decidedAt\"))",
  "expectedVector": "approval.boundary096.history-offset-control-001",
  "expectedPassVectors": [
    "approval.boundary096.history-control-001"
  ]
},
{
  "id": "java-approval096-missing-state",
  "suite": "approvals",
  "path": "core/src/main/java/org/finkore/Approvals.java",
  "from": "req.containsKey(\"state\") || needsState",
  "to": "req.containsKey(\"state\")",
  "expectedVector": "approval.boundary096.state-all-of-absent-001",
  "expectedPassVectors": [
    "approval.boundary096.state-all-of-control-001"
  ]
},
{
  "id": "java-approval096-context-parser",
  "suite": "approvals",
  "path": "core/src/main/java/org/finkore/Approvals.java",
  "from": "instant(context instanceof Map<?, ?> map ? map.get(\"evaluatedAt\") : null, INVALID_CONTEXT);",
  "to": "// omitted context validation",
  "expectedVector": "approval.boundary096.context-calendar-001",
  "expectedPassVectors": [
    "approval.boundary096.context-control-001"
  ]
},
{
  "id": "java-approval096-association",
  "suite": "approvals",
  "path": "core/src/main/java/org/finkore/Approvals.java",
  "from": "Map<String, Object> item = validateDecision(validateRequirement(requirement), decision);",
  "to": "Map<String, Object> item = validateDecisionShape(decision);",
  "expectedVector": "approval.boundary096.decision-association-001",
  "expectedPassVectors": [
    "approval.boundary096.decision-control-001"
  ]
},
{
  "id": "java-approval096-history-validation",
  "suite": "approvals",
  "path": "core/src/main/java/org/finkore/Approvals.java",
  "from": "validated.add(validateLifecycle(event, current, validated));",
  "to": "if (event instanceof Map<?, ?> rawEvent && (\"WITHDRAWN\".equals(rawEvent.get(\"type\")) || \"DECISION_SUPERSEDED\".equals(rawEvent.get(\"type\")) || \"REQUIREMENT_SUPERSEDED\".equals(rawEvent.get(\"type\")))) validated.add(validateLifecycle(event, current, validated));",
  "expectedVector": "approval.boundary096.history-record-unknown-kind-001",
  "expectedPassVectors": [
    "approval.boundary096.record-history-control-001"
  ]
},
{
  "id": "java-approval096-self-supersession",
  "suite": "approvals",
  "path": "core/src/main/java/org/finkore/Approvals.java",
  "from": "\"DECISION_SUPERSEDED\".equals(kind) && sameDecisionRef(event.get(\"target\"), event.get(\"successor\"))",
  "to": "false",
  "expectedVector": "approval.boundary096.supersession-self-001",
  "expectedPassVectors": [
    "approval.boundary096.supersession-successor-withdrawn-001"
  ]
},
{
  "id": "java-approval096-repeat-requirement",
  "suite": "approvals",
  "path": "core/src/main/java/org/finkore/Approvals.java",
  "from": "previous.stream().anyMatch(item -> \"REQUIREMENT_SUPERSEDED\".equals(item.get(\"type\")) && target.equals(item.get(\"targetRequirementId\")))",
  "to": "false",
  "expectedVector": "approval.boundary096.requirement-supersession-repeat-001",
  "expectedPassVectors": [
    "approval.boundary096.requirement-supersession-valid-001"
  ]
},
{
  "id": "java-approval096-decisive-return",
  "suite": "approvals",
  "path": "core/src/main/java/org/finkore/Approvals.java",
  "from": "    for (Map<String, Object> decision : decisionSet.history()) {\n      if (decisionConsidered(req, decision, decisionSet.lifecycle()) && decision.containsKey(\"expiresAt\")) {\n        instant(evaluatedAt, INVALID_CONTEXT);\n      }\n    }",
  "to": "    if (decisionSet.history().stream().anyMatch(decision -> \"REJECTED\".equals(decision.get(\"outcome\")))) return \"REJECTED\";",
  "expectedVector": "approval.boundary096.complete-context-reject-first-001",
  "expectedPassVectors": [
    "approval.boundary096.complete-context-control-001"
  ]
},
{
  "id": "java-workflow-observed-null-revision-omitted",
  "suite": "workflow",
  "path": "core/src/main/java/org/finkore/Workflow.java",
  "from": "if (map.containsKey(\"revision\") && !opaque(revision)) {",
  "to": "if (revision != null && !opaque(revision)) {",
  "expectedVector": "workflow.boundary096.import-revision-null-before-mismatch-001",
  "expectedPassVectors": [
    "workflow.boundary096.import-mismatch-control-001"
  ]
},
  {
  "id": "java-entity-create-binding-lost",
  "suite": "entities",
  "path": "core/src/main/java/org/finkore/Entities.java",
  "from": "if (instance.binding() != null) entity.put(\"binding\", instance.binding());",
  "to": "// Lost binding.",
  "expectedVector": "entity.binding.versioned-create-001",
  "expectedPassVectors": [
    "entity.binding.unversioned-create-001"
  ]
},
  {
  "id": "java-entity-binding-validation-bypass",
  "suite": "entities",
  "path": "core/src/main/java/org/finkore/Entities.java",
  "from": "    Workflow.importInstance(workflow, workflowInstance(value));",
  "to": "    // Skip binding validation.",
  "expectedVector": "entity.binding.import-mismatch-001",
  "expectedPassVectors": [
    "entity.binding.versioned-import-001"
  ]
},
  {
  "id": "java-entity-revision-conflict-conflated",
  "suite": "entities",
  "path": "core/src/main/java/org/finkore/Entities.java",
  "from": "if (currentRevision != null && currentRevision.get(\"revision\").equals(conflictVersion)) {",
  "to": "if (false) {",
  "expectedVector": "entity.import.equal-revision-conflict-token-001",
  "expectedPassVectors": [
    "entity.import.distinct-token-control-001"
  ]
},
  {
  "id": "java-entity-validator-unknown-skipped",
  "suite": "entities",
  "path": "core/src/main/java/org/finkore/Entities.java",
  "from": "(!\"positive-money\".equals(rule.get(\"rule\")) && !\"money-not-greater-than\".equals(rule.get(\"rule\")))",
  "to": "false",
  "expectedVector": "entity.declaration.unknown-create-001",
  "expectedPassVectors": [
    "entity.declaration.cross-field-control-001"
  ]
},
  {
  "id": "java-entity-state-null-omitted",
  "suite": "entities",
  "path": "core/src/main/java/org/finkore/Entities.java",
  "from": "if (input.containsKey(\"expectedState\")",
  "to": "if (input.get(\"expectedState\") != null",
  "expectedVector": "entity.import.presence-state-null-001",
  "expectedPassVectors": [
    "entity.import.presence-state-matching-control-001"
  ]
},
  {
  "id": "java-entity-revision-null-omitted",
  "suite": "entities",
  "path": "core/src/main/java/org/finkore/Entities.java",
  "from": "if (input.containsKey(\"expectedRevision\")",
  "to": "if (input.get(\"expectedRevision\") != null",
  "expectedVector": "entity.import.presence-revision-null-001",
  "expectedPassVectors": [
    "entity.import.presence-revision-matching-control-001"
  ]
},
  {
  "id": "java-entity-conflict-version-null-omitted",
  "suite": "entities",
  "path": "core/src/main/java/org/finkore/Entities.java",
  "from": "if (input.containsKey(\"expectedConflictVersion\")",
  "to": "if (input.get(\"expectedConflictVersion\") != null",
  "expectedVector": "entity.import.presence-conflict-version-null-001",
  "expectedPassVectors": [
    "entity.import.presence-conflict-version-matching-control-001"
  ]
},
  {
    "id": "java-approval-missing-association-accepted",
    "suite": "approvals",
    "path": "core/src/main/java/org/finkore/Approvals.java",
    "from": "if (!item.containsKey(\"subjectFacts\")) {",
    "to": "if (false && !item.containsKey(\"subjectFacts\")) {",
    "expectedVector": "approval.association.record-missing-facts-001",
    "expectedPassVectors": [
      "approval.association.record-null-control-001"
    ]
  },
  {
    "id": "java-approval-explicit-null-association-rejected",
    "suite": "approvals",
    "path": "core/src/main/java/org/finkore/Approvals.java",
    "from": "if (!item.containsKey(\"subjectFacts\")) {",
    "to": "if (item.get(\"subjectFacts\") == null) {",
    "expectedVector": "approval.association.record-null-control-001",
    "expectedPassVectors": [
      "approval.association.record-empty-object-control-001"
    ]
  },
  {
    "id": "java-approval-subject-type-validation-bypass",
    "suite": "approvals",
    "path": "core/src/main/java/org/finkore/Approvals.java",
    "from": "    requiredString(subject.get(\"type\"), INVALID_DECISION);",
    "to": "",
    "expectedVector": "approval.association.record-subject-missing-type-001",
    "expectedPassVectors": [
      "approval.association.record-null-control-001"
    ]
  },
  {
    "id": "java-approval-subject-id-validation-bypass",
    "suite": "approvals",
    "path": "core/src/main/java/org/finkore/Approvals.java",
    "from": "    requiredString(subject.get(\"id\"), INVALID_DECISION);",
    "to": "",
    "expectedVector": "approval.association.record-subject-missing-id-001",
    "expectedPassVectors": [
      "approval.association.record-null-control-001"
    ]
  },
  {
    "id": "java-approval-duplicate-eligibility-accepted",
    "suite": "approvals",
    "path": "core/src/main/java/org/finkore/Approvals.java",
    "from": " || new HashSet<>(eligible).size() != eligible.size()",
    "to": "",
    "expectedVector": "approval.association.record-duplicate-eligibility-001",
    "expectedPassVectors": [
      "approval.association.record-null-control-001"
    ]
  },
  {
    "id": "java-approval-empty-eligibility-accepted",
    "suite": "approvals",
    "path": "core/src/main/java/org/finkore/Approvals.java",
    "from": "eligible.isEmpty() || new HashSet<>(eligible)",
    "to": "new HashSet<>(eligible)",
    "expectedVector": "approval.association.record-empty-eligibility-001",
    "expectedPassVectors": [
      "approval.association.record-null-control-001"
    ]
  },
  {
    "id": "java-approval-null-eligibility-inferred",
    "suite": "approvals",
    "path": "core/src/main/java/org/finkore/Approvals.java",
    "from": "List<String> eligible = stringList(req.get(\"eligibleActors\"), INVALID_DECISION);",
    "to": "List<String> eligible = req.get(\"eligibleActors\") == null ? List.of(\"alice\") : stringList(req.get(\"eligibleActors\"), INVALID_DECISION);",
    "expectedVector": "approval.association.evaluate-null-eligibility-001",
    "expectedPassVectors": [
      "approval.association.record-null-control-001"
    ]
  },
  {
    "id": "java-approval-history-validation-bypass",
    "suite": "approvals",
    "path": "core/src/main/java/org/finkore/Approvals.java",
    "from": "validated.add(validateDecisionShape(decision))",
    "to": "validated.add(copyMap(stringObjectMap((Map<?, ?>) decision, INVALID_DECISION), INVALID_DECISION))",
    "expectedVector": "approval.association.history-after-valid-001",
    "expectedPassVectors": [
      "approval.association.evaluate-null-control-001"
    ]
  },
  {
    "id": "java-workflow-adapter-null-state-omitted",
    "suite": "workflow",
    "expectedVector": "workflow.presence.state-null-001",
    "expectedPassVectors": [
      "workflow.presence.omitted-control-001"
    ],
    "path": "adapters/conformance/src/main/java/org/finkore/conformance/Bridge.java",
    "from": "inputValue.getOrDefault(\"expectedCurrentState\", Workflow.OMITTED)",
    "to": "(inputValue.get(\"expectedCurrentState\") == null ? Workflow.OMITTED : inputValue.get(\"expectedCurrentState\"))"
  },
  {
    "id": "java-workflow-adapter-null-revision-omitted",
    "suite": "workflow",
    "expectedVector": "workflow.presence.revision-null-001",
    "expectedPassVectors": [
      "workflow.presence.omitted-control-001"
    ],
    "path": "adapters/conformance/src/main/java/org/finkore/conformance/Bridge.java",
    "from": "inputValue.getOrDefault(\"expectedRevision\", Workflow.OMITTED)",
    "to": "(inputValue.get(\"expectedRevision\") == null ? Workflow.OMITTED : inputValue.get(\"expectedRevision\"))"
  },
  {
    "id": "java-workflow-state-null-omitted",
    "expectedVector": "workflow.presence.state-null-001",
    "expectedPassVectors": [
      "workflow.presence.omitted-control-001"
    ],
    "suite": "workflow",
    "path": "core/src/main/java/org/finkore/Workflow.java",
    "from": "if (expectedCurrentState != OMITTED) {",
    "to": "if (expectedCurrentState != OMITTED && expectedCurrentState != null) {"
  },
  {
    "id": "java-workflow-revision-null-omitted",
    "expectedVector": "workflow.presence.revision-null-001",
    "expectedPassVectors": [
      "workflow.presence.omitted-control-001"
    ],
    "suite": "workflow",
    "path": "core/src/main/java/org/finkore/Workflow.java",
    "from": "if (expectedRevision != OMITTED) {",
    "to": "if (expectedRevision != OMITTED && expectedRevision != null) {"
  },
  {
    "id": "java-workflow-invalid-target-priority",
    "expectedVector": "workflow.presence.target-before-conflict-001",
    "expectedPassVectors": [
      "workflow.presence.omitted-control-001"
    ],
    "suite": "workflow",
    "path": "core/src/main/java/org/finkore/Workflow.java",
    "from": "if (!(target instanceof String targetState) || !definition.states().contains(targetState)) {",
    "to": "if (!(target instanceof String targetState)) {"
  },
  {
    "id": "java-workflow-binding-mismatch-bypass",
    "expectedVector": "workflow.presence.version-mismatch-before-null-001",
    "expectedPassVectors": [
      "workflow.presence.omitted-control-001"
    ],
    "suite": "workflow",
    "path": "core/src/main/java/org/finkore/Workflow.java",
    "from": "if (!definition.binding().equals(instance.binding())) {",
    "to": "if (false) {"
  },
  {
    "id": "java-workflow-empty-fact",
    "expectedVector": "workflow.guard.empty-fact-regression-001",
    "expectedPassVectors": [
      "workflow.guard.valid-regression-001"
    ],
    "suite": "workflow",
    "path": "core/src/main/java/org/finkore/Workflow.java",
    "from": "!opaque(map.get(\"fact\"))",
    "to": "!(map.get(\"fact\") instanceof String)"
  },
  {
    "id": "java-workflow-competing-list",
    "expectedVector": "workflow.guard.nonempty-competing-list-regression-001",
    "expectedPassVectors": [
      "workflow.guard.empty-competing-list-regression-001"
    ],
    "suite": "workflow",
    "path": "core/src/main/java/org/finkore/Workflow.java",
    "from": "if (!List.of().equals(guards)) {",
    "to": "if (false) {"
  },
  {
    "id": "java-workflow-null-guard-omitted",
    "expectedVector": "workflow.guard.null-guard-regression-001",
    "expectedPassVectors": [
      "workflow.guard.null-equals-regression-001"
    ],
    "suite": "workflow",
    "path": "core/src/main/java/org/finkore/Workflow.java",
    "from": "guards = Collections.singletonList(map.get(\"guard\"));",
    "to": "guards = map.get(\"guard\") == null ? List.of() : Collections.singletonList(map.get(\"guard\"));"
  },
  {
    "id": "java-workflow-selector-as-position",
    "expectedVector": "workflow.version.sequence-one-001",
    "expectedPassVectors": [
      "workflow.version.sequence-opaque-001"
    ],
    "suite": "workflow",
    "path": "core/src/main/java/org/finkore/Workflow.java",
    "from": "!versionSequenceValid(version)",
    "to": "!versionSequenceValid(map.get(\"versionSequence\"))"
  },
  {
    "id": "java-workflow-position-bypass",
    "expectedVector": "workflow.version.sequence-zero-001",
    "expectedPassVectors": [
      "workflow.version.sequence-multi-digit-001"
    ],
    "suite": "workflow",
    "path": "core/src/main/java/org/finkore/Workflow.java",
    "from": "!versionSequenceValid(version)",
    "to": "false"
  },
  {
    "id": "java-workflow-selector-bypass",
    "expectedVector": "workflow.version.sequence-null-selector-001",
    "expectedPassVectors": [
      "workflow.version.sequence-one-001"
    ],
    "suite": "workflow",
    "path": "core/src/main/java/org/finkore/Workflow.java",
    "from": "!\"DEFAULT\".equals(map.get(\"versionSequence\"))",
    "to": "false"
  },
  {
    id: 'java-entity-conflicting-required-effects',
    expectedVector: 'entity.evolution.history.same-step-required-effects-current-001',
    expectedPassVectors: ['entity.evolution.history.same-step-consistent-control-001'],
    suite: 'entities',
    path: 'core/src/main/java/org/finkore/Entities.java',
    from: 'if (effects.containsKey(related) && !Boolean.TRUE.equals(effects.get(related)))',
    to: 'if (false)',
  },
  {
    id: 'java-entity-correspondence-before-audit',
    expectedVector: 'entity.evolution.correct.audit-timestamp-before-correspondence-001',
    expectedPassVectors: ['entity.evolution.correct.evidence-valid-control-001'],
    suite: 'entities',
    path: 'core/src/main/java/org/finkore/Entities.java',
    from: '    Audit.Log auditLog = Audit.Log.create(input.get("auditHistory"));\n    Map<String, Object> auditHistory = auditLog.append(input.get("auditEvent")).toPortable();\n    Map<String, Object> relation = relation(kind, relationId, source, sourceRevision, related, relatedRevision, scope, auditEventId(input.get("auditEvent")));\n    if ("CORRECTION".equals(kind) || "REVERSAL".equals(kind)) relation.put("sourceCurrent", current);\n    validateEvolutionEvidence(input.get("auditEvent"), relation);',
    to: '    Map<String, Object> relation = relation(kind, relationId, source, sourceRevision, related, relatedRevision, scope, auditEventId(input.get("auditEvent")));\n    if ("CORRECTION".equals(kind) || "REVERSAL".equals(kind)) relation.put("sourceCurrent", current);\n    validateEvolutionEvidence(input.get("auditEvent"), relation);\n    Audit.Log auditLog = Audit.Log.create(input.get("auditHistory"));\n    Map<String, Object> auditHistory = auditLog.append(input.get("auditEvent")).toPortable();',
  },
  {
    id: 'java-entity-correspondence-bypass',
    expectedVector: 'entity.evolution.correct.evidence-wrong-related-001',
    expectedPassVectors: ['entity.evolution.correct.evidence-valid-control-001'],
    suite: 'entities',
    path: 'core/src/main/java/org/finkore/Entities.java',
    from: '    validateEvolutionEvidence(input.get("auditEvent"), relation);',
    to: '    // correspondence omitted',
  },
  {
    id: 'java-entity-history-contradiction-accepted',
    expectedVector: 'entity.evolution.history.contradiction-001',
    expectedPassVectors: ['entity.evolution.history.valid-void-sequence-001'],
    suite: 'entities',
    path: 'core/src/main/java/org/finkore/Entities.java',
    from: 'if (observed.containsKey(key) && !observed.get(key).equals(value) && !effects.containsKey(key))',
    to: 'if (false)',
  },
  {
    id: 'java-entity-result-history-unvalidated',
    expectedVector: 'entity.evolution.history.related-noncurrent-001',
    expectedPassVectors: ['entity.evolution.correct.evidence-valid-control-001'],
    suite: 'entities',
    path: 'core/src/main/java/org/finkore/Entities.java',
    from: 'Map<String, Object> nextHistory = importEvolutionHistory(historyEnvelope(append(currentRelations, relation)));',
    to: 'Map<String, Object> nextHistory = historyEnvelope(append(currentRelations, relation));',
  },
  {
    id: 'java-entity-required-currentness-effect-bypass',
    expectedVector: 'entity.evolution.history.void-effect-invalid-001',
    expectedPassVectors: ['entity.evolution.history.valid-void-sequence-001'],
    suite: 'entities',
    path: 'core/src/main/java/org/finkore/Entities.java',
    from: 'if (effects.containsKey(key) && !effects.get(key).equals(value))',
    to: 'if (false)',
  },
  {
    id: 'java-entity-same-step-conflict-accepted',
    expectedVector: 'entity.evolution.history.same-step-correction-contradiction-001',
    expectedPassVectors: ['entity.evolution.history.valid-supersession-sequence-001'],
    suite: 'entities',
    path: 'core/src/main/java/org/finkore/Entities.java',
    from: '(step.containsKey(related) && !step.get(related).equals(relatedCurrent))',
    to: 'false',
  },
  {
    id: 'java-entity-currentness-assumed-true',
    expectedVector: 'entity.evolution.history.noncurrent-match-001',
    expectedPassVectors: ['entity.evolution.correct.evidence-valid-control-001'],
    suite: 'entities',
    path: 'core/src/main/java/org/finkore/Entities.java',
    from: 'boolean current = observed.getOrDefault(evolutionKey(sourceReference, scope), Boolean.TRUE);',
    to: 'boolean current = true;',
  },
  {
    id: 'java-entity-source-currentness-restored',
    expectedVector: 'entity.evolution.history.noncurrent-omitted-001',
    expectedPassVectors: ['entity.evolution.correct.evidence-valid-control-001'],
    suite: 'entities',
    path: 'core/src/main/java/org/finkore/Entities.java',
    from: 'relation.put("sourceCurrent", current);',
    to: 'relation.put("sourceCurrent", true);',
  },
  {
    id: 'java-entity-scope-conflated',
    expectedVector: 'entity.evolution.history.scoped-different-scope-001',
    expectedPassVectors: ['entity.evolution.history.scoped-same-scope-001'],
    suite: 'entities',
    path: 'core/src/main/java/org/finkore/Entities.java',
    from: 'return new EvolutionKey(type, id, revision, scope);',
    to: 'return new EvolutionKey(type, id, revision, null);',
  },
  {
    id: 'java-entity-revision-conflated',
    expectedVector: 'entity.evolution.history.different-revision-001',
    // A collapsed revision also corrupts same-Entity source/related pairs;
    // the single-reference Void control isolates this defect.
    expectedPassVectors: ['entity.evolution.void.evidence-valid-control-001'],
    suite: 'entities',
    path: 'core/src/main/java/org/finkore/Entities.java',
    from: 'return new EvolutionKey(type, id, revision, scope);',
    to: 'return new EvolutionKey(type, id, "", scope);',
  },
  {
    id: 'java-entity-entity-type-conflated',
    expectedVector: 'entity.evolution.history.different-entity-type-001',
    expectedPassVectors: ['entity.evolution.history.noncurrent-match-001'],
    suite: 'entities',
    path: 'core/src/main/java/org/finkore/Entities.java',
    from: 'return new EvolutionKey(type, id, revision, scope);',
    to: 'return new EvolutionKey("", id, revision, scope);',
  },
  {
    id: 'java-entity-duplicate-reversal-accepted',
    expectedVector: 'entity.evolution.reverse.history-duplicate-policy-001',
    expectedPassVectors: ['entity.evolution.reverse.history-unrelated-control-001'],
    suite: 'entities',
    path: 'core/src/main/java/org/finkore/Entities.java',
    from: 'if ("REVERSAL".equals(kind) && currentRelations.stream().anyMatch(',
    to: 'if (false && currentRelations.stream().anyMatch(',
  },
  {
    id: 'java-entity-scope-evidence-bypass',
    expectedVector: 'entity.evolution.supersede.evidence-wrong-scope-001',
    expectedPassVectors: ['entity.evolution.supersede.evidence-valid-control-001'],
    suite: 'entities',
    path: 'core/src/main/java/org/finkore/Entities.java',
    from: '!relation.get("supersessionScope").equals(evidence.get("supersessionScope"))',
    to: 'false',
  },
  {
    id: 'java-entity-audit-relationship-bypass',
    expectedVector: 'entity.evolution.correct.evidence-wrong-relationship-001',
    expectedPassVectors: ['entity.evolution.correct.evidence-valid-control-001'],
    suite: 'entities',
    path: 'core/src/main/java/org/finkore/Entities.java',
    from: 'relationships.stream().noneMatch(item -> item instanceof Map<?, ?> relationship && type.equals(relationship.get("type")))',
    to: 'false',
  },
  {
    id: 'java-approval-record-drops-lifecycle',
    expectedVector: 'approval.record.preserves-withdrawn-001',
    expectedPassVectors: ['approval.withdraw.target-unique-001'],
    suite: 'approvals',
    path: 'core/src/main/java/org/finkore/Approvals.java',
    from: 'return historyEnvelope(append(current.history(), recorded), current.lifecycle());',
    to: 'return historyEnvelope(append(current.history(), recorded), List.of());',
  },
  {
    id: 'java-approval-withdraw-request-type-override',
    expectedVector: 'approval.lifecycle.withdraw.request-type-conflicting-001',
    expectedPassVectors: ['approval.lifecycle.withdraw.request-type-omitted-001'],
    suite: 'approvals',
    path: 'core/src/main/java/org/finkore/Approvals.java',
    from: 'event.put("type", type);\n    return event;',
    to: 'event.put("type", type);\n    if ("WITHDRAWN".equals(type)) event.putAll(stringObjectMap(raw, INVALID_DECISION));\n    return event;',
  },
  {
    id: 'java-approval-supersede-request-type-override',
    expectedVector: 'approval.lifecycle.supersede.request-type-conflicting-001',
    expectedPassVectors: ['approval.lifecycle.supersede.request-type-omitted-001'],
    suite: 'approvals',
    path: 'core/src/main/java/org/finkore/Approvals.java',
    from: 'event.put("type", type);\n    return event;',
    to: 'event.put("type", type);\n    if ("DECISION_SUPERSEDED".equals(type)) event.putAll(stringObjectMap(raw, INVALID_DECISION));\n    return event;',
  },
  {
    id: 'java-approval-requirement-request-type-override',
    expectedVector: 'approval.lifecycle.requirement.request-type-conflicting-001',
    expectedPassVectors: ['approval.lifecycle.requirement.request-type-omitted-001'],
    suite: 'approvals',
    path: 'core/src/main/java/org/finkore/Approvals.java',
    from: 'lifecycle.putAll(copyMap(event, INVALID_DECISION));\n    lifecycle.put("type", "REQUIREMENT_SUPERSEDED");',
    to: 'lifecycle.put("type", "REQUIREMENT_SUPERSEDED");\n    lifecycle.putAll(copyMap(event, INVALID_DECISION));',
  },
  {
    id: 'java-approval-withdraw-first-match',
    expectedVector: 'approval.withdraw.target-ambiguous-001',
    expectedPassVectors: ['approval.withdraw.target-unique-001'],
    suite: 'approvals',
    path: 'core/src/main/java/org/finkore/Approvals.java',
    from: 'history.stream().filter(decision -> sameDecisionRef(decisionKey(decision), ref)).count() != 1',
    to: 'history.stream().filter(decision -> sameDecisionRef(decisionKey(decision), ref)).count() == 0',
  },
  {
    id: 'java-approval-withdraw-superseded-accepted',
    expectedVector: 'approval.withdraw.target-superseded-001',
    expectedPassVectors: ['approval.withdraw.target-unique-001'],
    suite: 'approvals',
    path: 'core/src/main/java/org/finkore/Approvals.java',
    from: 'lifecycleContains(previous, "DECISION_SUPERSEDED", target)',
    to: '(false && lifecycleContains(previous, "DECISION_SUPERSEDED", target))',
  },
  {
    id: 'java-approval-withdraw-withdrawn-accepted',
    expectedVector: 'approval.validity.withdraw-duplicate-invalid-001',
    expectedPassVectors: ['approval.withdraw.target-unique-001'],
    suite: 'approvals',
    path: 'core/src/main/java/org/finkore/Approvals.java',
    from: 'lifecycleContains(previous, "WITHDRAWN", target)',
    to: '(false && lifecycleContains(previous, "WITHDRAWN", target))',
  },
  {
    id: 'java-approval-effectiveness-validation-bypass',
    expectedVector: 'approval.quorum.effectiveness-string-001',
    expectedPassVectors: ['approval.quorum.effectiveness-true-001', 'approval.quorum.effectiveness-false-001'],
    suite: 'approvals',
    path: 'core/src/main/java/org/finkore/Approvals.java',
    from: 'if (!(decision.get("effective") instanceof Boolean)) {',
    to: 'if (false) {',
  },
  {
    id: 'java-approval-missing-effectiveness-default',
    expectedVector: 'approval.quorum.effectiveness-missing-001',
    expectedPassVectors: ['approval.quorum.effectiveness-true-001', 'approval.quorum.effectiveness-false-001'],
    suite: 'approvals',
    path: 'core/src/main/java/org/finkore/Approvals.java',
    from: 'if (!(decision.get("effective") instanceof Boolean)) {',
    to: 'if (decision.containsKey("effective") && !(decision.get("effective") instanceof Boolean)) {',
  },
  {
    id: 'java-approval-numeric-effectiveness-accepted',
    expectedVector: 'approval.quorum.effectiveness-number-001',
    expectedPassVectors: ['approval.quorum.effectiveness-true-001', 'approval.quorum.effectiveness-false-001'],
    suite: 'approvals',
    path: 'core/src/main/java/org/finkore/Approvals.java',
    from: 'if (!(decision.get("effective") instanceof Boolean)) {',
    to: 'if (!(decision.get("effective") instanceof Boolean) && !(decision.get("effective") instanceof Number)) {',
  },
  {
    id: 'java-approval-false-effectiveness-rejected',
    expectedVector: 'approval.quorum.effectiveness-false-001',
    expectedPassVectors: ['approval.quorum.effectiveness-true-001'],
    suite: 'approvals',
    path: 'core/src/main/java/org/finkore/Approvals.java',
    from: 'if (!(decision.get("effective") instanceof Boolean)) {',
    to: 'if (!Boolean.TRUE.equals(decision.get("effective"))) {',
  },
  {
    id: 'java-approval-ineffective-vote-counted',
    expectedVector: 'approval.quorum.effectiveness-false-001',
    expectedPassVectors: ['approval.quorum.effectiveness-true-001'],
    suite: 'approvals',
    path: 'core/src/main/java/org/finkore/Approvals.java',
    from: '|| Boolean.FALSE.equals(decision.get("effective"))) {\n        continue;',
    to: '|| false) {\n        continue;',
  },
  {
    id: 'java-entity-import-validation-bypass',
    expectedVector: 'entity.import.validation-positive-money-invalid-001',
    expectedPassVectors: ['entity.import.validation-positive-money-valid-001'],
    suite: 'entities',
    path: 'core/src/main/java/org/finkore/Entities.java',
    from: 'Map<String, Object> result = copyMap(value, INVALID_IDENTITY);\n    validateEntityData(definition, result);\n    return result;',
    to: 'Map<String, Object> result = copyMap(value, INVALID_IDENTITY);\n    return result;',
  },
  {
    id: 'java-workflow-missing-null-coercion',
    expectedVector: 'workflow.guard.missing-fact-not-null-001',
    expectedPassVectors: ['workflow.guard.explicit-null-pass-001'],
    suite: 'workflow',
    path: 'core/src/main/java/org/finkore/Workflow.java',
    from: 'if (!facts.containsKey(guard.get("fact")) || !jsonEquals(facts.get(guard.get("fact")), guard.get("equals"))) {',
    to: 'if (!jsonEquals(facts.get(guard.get("fact")), guard.get("equals"))) {',
  },
  {
    id: 'java-workflow-null-equality-rejected',
    expectedVector: 'workflow.guard.explicit-null-pass-001',
    expectedPassVectors: ['workflow.guard.missing-fact-not-null-001'],
    suite: 'workflow',
    path: 'core/src/main/java/org/finkore/Workflow.java',
    from: 'if (left == null || right == null) {\n      return left == null && right == null;\n    }',
    to: 'if (left == null || right == null) {\n      return false;\n    }',
  },
  {
    id: 'java-workflow-structural-equality-bypass',
    expectedVector: 'workflow.guard.object-member-order-pass-001',
    expectedPassVectors: ['workflow.guard.nested-boolean-number-rejected-001'],
    suite: 'workflow',
    path: 'core/src/main/java/org/finkore/Workflow.java',
    from: 'if (left instanceof Map<?, ?> || right instanceof Map<?, ?>) {\n      if (!(left instanceof Map<?, ?> leftValues) || !(right instanceof Map<?, ?> rightValues)\n          || leftValues.size() != rightValues.size()) {\n        return false;\n      }\n      for (Map.Entry<?, ?> entry : leftValues.entrySet()) {\n        if (!rightValues.containsKey(entry.getKey())\n            || !jsonEquals(entry.getValue(), rightValues.get(entry.getKey()))) {\n          return false;\n        }\n      }\n      return true;\n    }',
    to: 'if (left instanceof Map<?, ?> || right instanceof Map<?, ?>) {\n      return left == right;\n    }',
  },
  {
    id: 'java-audit-display-name-validation-bypass',
    expectedVector: 'audit.actor.null-display-name-001',
    expectedPassVectors: ['audit.actor.display-name-not-identity-001'],
    suite: 'audit',
    path: 'core/src/main/java/org/finkore/Audit.java',
    from: 'String displayName = map.containsKey("displayName") ? requiredString(map.get("displayName"), ACTOR_INVALID) : null;',
    to: 'String displayName = map.get("displayName") instanceof String text ? text : null;',
  },
  {
    id: 'java-audit-metadata-null-presence-loss',
    expectedVector: 'audit.actor.metadata-null-preserved-001',
    expectedPassVectors: ['audit.redaction.actor-metadata-omitted-001'],
    suite: 'audit',
    path: 'core/src/main/java/org/finkore/Audit.java',
    from: 'boolean hasMetadata = map.containsKey("metadata");',
    to: 'boolean hasMetadata = map.get("metadata") != null;',
  },
  {
    id: 'java-audit-boolean-number-coercion',
    expectedVector: 'audit.change.boolean-to-number-distinct-001',
    expectedPassVectors: ['audit.change.unchanged-boolean-rejected-001'],
    suite: 'audit',
    path: 'core/src/main/java/org/finkore/Audit.java',
    from: 'return left.getClass().equals(right.getClass()) && left.equals(right);',
    to: 'return (left instanceof Boolean && right instanceof Number)\n          || (left instanceof Number && right instanceof Boolean)\n          || (left.getClass().equals(right.getClass()) && left.equals(right));',
  },
  {
    id: 'java-audit-money-domain-equality-bypass',
    expectedVector: 'audit.change.money-trailing-zero-unchanged-001',
    expectedPassVectors: ['audit.change.money-amount-changed-001'],
    suite: 'audit',
    path: 'core/src/main/java/org/finkore/Audit.java',
    from: 'return leftCurrency.equals(rightCurrency) && "EQUAL".equals(left.compare(right));',
    to: 'return left.toPortable().equals(right.toPortable());',
  },
  {
    id: 'java-entity-validates-patch-only',
    expectedPassVectors: ['entity.validation.cross-field-paired-increase-001'],
    expectedVector: 'entity.validation.cross-field-retained-limit-valid-001',
    suite: 'entities',
    path: 'core/src/main/java/org/finkore/Entities.java',
    from: 'resultData.putAll(copyMap(changeMap, INVALID_MUTATION));\n    validateEntityData(entityDefinition, result);',
    to: 'resultData.putAll(copyMap(changeMap, INVALID_MUTATION));\n    validateEntityData(entityDefinition, Map.of("data", changeMap));',
  },
  {
    id: 'java-entity-cross-field-validation-bypass',
    expectedPassVectors: ['entity.validation.cross-field-retained-limit-valid-001'],
    expectedVector: 'entity.validation.cross-field-combined-invalid-001',
    suite: 'entities',
    path: 'core/src/main/java/org/finkore/Entities.java',
    from: 'invalid = "GREATER".equals(value.compare(other));',
    to: 'invalid = false;',
  },
  {
    id: 'java-entity-cross-field-equality-rejected',
    expectedPassVectors: ['entity.validation.cross-field-retained-limit-valid-001'],
    expectedVector: 'entity.validation.cross-field-paired-increase-001',
    suite: 'entities',
    path: 'core/src/main/java/org/finkore/Entities.java',
    from: 'invalid = "GREATER".equals(value.compare(other));',
    to: 'invalid = !"LESS".equals(value.compare(other));',
  },
  {
    id: 'java-entity-validates-old-result',
    expectedPassVectors: ['entity.validation.cross-field-retained-limit-valid-001'],
    expectedVector: 'entity.validation.cross-field-combined-invalid-001',
    suite: 'entities',
    path: 'core/src/main/java/org/finkore/Entities.java',
    from: 'resultData.putAll(copyMap(changeMap, INVALID_MUTATION));\n    validateEntityData(entityDefinition, result);',
    to: 'resultData.putAll(copyMap(changeMap, INVALID_MUTATION));\n    validateEntityData(entityDefinition, current);',
  },
  {
    id: 'java-entity-validates-intermediate-result',
    expectedPassVectors: ['entity.validation.cross-field-retained-limit-valid-001'],
    expectedVector: 'entity.validation.cross-field-paired-increase-001',
    suite: 'entities',
    path: 'core/src/main/java/org/finkore/Entities.java',
    from: 'resultData.putAll(copyMap(changeMap, INVALID_MUTATION));',
    to: 'for (Map.Entry<String, Object> entry : changeMap.entrySet()) {\n      resultData.put(entry.getKey(), entry.getValue());\n      validateEntityData(entityDefinition, result);\n    }',
  },
  {
    id: 'java-money-currency-mismatch-bypass',
    expectedVector: 'money.add.currency-mismatch-001',
    expectedPassVectors: ['money.add.same-currency.basic-001'],
    suite: 'money',
    path: 'core/src/main/java/org/finkore/Money.java',
    from: 'if (!currency.equals(other.currency)) {\n      throw new FinKoreException(CURRENCY_MISMATCH);\n    }',
    to: 'if (false && !currency.equals(other.currency)) {\n      throw new FinKoreException(CURRENCY_MISMATCH);\n    }',
  },
  {
    id: 'java-money-addition-subtracts',
    expectedVector: 'money.add.same-currency.basic-001',
    expectedPassVectors: ['money.add.zero-001'],
    suite: 'money',
    path: 'core/src/main/java/org/finkore/Money.java',
    from: 'return new Money(amount.add(other.amount), currency, null);',
    to: 'return new Money(amount.subtract(other.amount), currency, null);',
  },
  {
    id: 'java-money-floor-becomes-down',
    expectedVector: 'money.round.floor.negative-001',
    expectedPassVectors: ['money.round.floor.positive-001'],
    suite: 'money',
    path: 'core/src/main/java/org/finkore/Money.java',
    from: 'case "FLOOR" -> RoundingMode.FLOOR;',
    to: 'case "FLOOR" -> RoundingMode.DOWN;',
  },
  {
    id: 'java-money-percentage-not-scaled',
    expectedVector: 'money.rate.percentage-conversion-001',
    expectedPassVectors: ['money.rate.decimal-exact-001'],
    suite: 'money',
    path: 'core/src/main/java/org/finkore/Money.java',
    from: 'scalar = scalar.divide(new BigDecimal("100"));',
    to: 'scalar = scalar.multiply(BigDecimal.ONE);',
  },
  {
    id: 'java-money-allocation-remainder-reversed',
    expectedVector: 'money.allocate.equal.remainder-positive-001',
    expectedPassVectors: ['money.allocate.ratio.zero-source-001'],
    suite: 'money',
    path: 'core/src/main/java/org/finkore/Money.java',
    from: 'base.set(index, base.get(index).add(BigInteger.ONE));',
    to: 'base.set(base.size() - 1 - index, base.get(base.size() - 1 - index).add(BigInteger.ONE));',
  },
  {
    id: 'java-money-allocation-upper-bound-bypass',
    expectedVector: 'money.allocate.scale.out-of-range-001',
    expectedPassVectors: ['money.allocate.scale.maximum-001'],
    suite: 'money',
    path: 'core/src/main/java/org/finkore/Money.java',
    from: 'if (integer.compareTo(BigInteger.valueOf(minimum)) < 0\n        || integer.compareTo(BigInteger.valueOf(maximum)) > 0) {\n      throw new FinKoreException(INVALID_ALLOCATION);\n    }',
    to: 'if (integer.compareTo(BigInteger.valueOf(minimum)) < 0) {\n      throw new FinKoreException(INVALID_ALLOCATION);\n    }',
  },
  {
    id: 'java-money-allocation-maximum-rejected',
    expectedVector: 'money.allocate.scale.maximum-001',
    expectedPassVectors: ['money.allocate.equal.remainder-positive-001'],
    suite: 'money',
    path: 'core/src/main/java/org/finkore/Money.java',
    from: 'if (integer.compareTo(BigInteger.valueOf(minimum)) < 0\n        || integer.compareTo(BigInteger.valueOf(maximum)) > 0) {\n      throw new FinKoreException(INVALID_ALLOCATION);\n    }',
    to: 'if (integer.compareTo(BigInteger.valueOf(minimum)) < 0\n        || integer.compareTo(BigInteger.valueOf(maximum)) >= 0) {\n      throw new FinKoreException(INVALID_ALLOCATION);\n    }',
  },
  {
    id: 'java-workflow-guard-bypass',
    expectedVector: 'workflow.guard.reject-001',
    expectedPassVectors: ['workflow.guard.pass-001'],
    suite: 'workflow',
    path: 'core/src/main/java/org/finkore/Workflow.java',
    from: 'if (!transition.guardsPass(factMap)) {\n      throw new FinKoreException(GUARD_REJECTED);\n    }',
    to: 'if (false && !transition.guardsPass(factMap)) {\n      throw new FinKoreException(GUARD_REJECTED);\n    }',
  },
  {
    id: 'java-workflow-terminal-bypass',
    expectedVector: 'workflow.terminal.transition-rejected-001',
    expectedPassVectors: ['workflow.terminal.entry-allowed-001'],
    suite: 'workflow',
    path: 'core/src/main/java/org/finkore/Workflow.java',
    from: 'if (definition.terminalStates().contains(instance.currentState())) {\n      throw new FinKoreException(TERMINAL_STATE);\n    }',
    to: 'if (false && definition.terminalStates().contains(instance.currentState())) {\n      throw new FinKoreException(TERMINAL_STATE);\n    }',
  },
  {
    id: 'java-audit-duplicate-event-bypass',
    expectedVector: 'audit.event.duplicate-identity-001',
    expectedPassVectors: ['audit.relationship.corrects.append-001'],
    suite: 'audit',
    path: 'core/src/main/java/org/finkore/Audit.java',
    from: 'if (eventIds.contains(event.eventId())) {\n        throw new FinKoreException(DUPLICATE_EVENT);\n      }',
    to: 'if (false && eventIds.contains(event.eventId())) {\n        throw new FinKoreException(DUPLICATE_EVENT);\n      }',
  },
  {
    id: 'java-audit-replace-append-only-bypass',
    expectedVector: 'audit.append-only.replace-forbidden-001',
    expectedPassVectors: ['audit.relationship.corrects.append-001'],
    suite: 'audit',
    path: 'core/src/main/java/org/finkore/Audit.java',
    from: 'public void replace() {\n      throw new FinKoreException(APPEND_ONLY_VIOLATION);\n    }',
    to: 'public void replace() {\n    }',
  },
  {
    id: 'java-audit-relationship-target-bypass',
    expectedVector: 'audit.relationship.target-entity-mismatch-001',
    expectedPassVectors: ['audit.relationship.corrects.append-001'],
    suite: 'audit',
    path: 'core/src/main/java/org/finkore/Audit.java',
    from: 'if (target == null || !relationship.target().entity().equals(target.entity())) {\n        throw new FinKoreException(INVALID_EVENT);\n      }',
    to: 'if (false && (target == null || !relationship.target().entity().equals(target.entity()))) {\n        throw new FinKoreException(INVALID_EVENT);\n      }',
  },
  {
    id: 'java-approval-expiration-bypass',
    expectedVector: 'approval.validity.expiration-at-boundary-001',
    expectedPassVectors: ['approval.validity.expiration-before-boundary-001'],
    suite: 'approvals',
    path: 'core/src/main/java/org/finkore/Approvals.java',
    from: 'return instant(evaluatedAt, INVALID_CONTEXT).compareTo(instant(decision.get("expiresAt"), INVALID_CONTEXT)) >= 0;',
    to: 'return false;',
  },
  {
    id: 'java-timestamp-nanoseconds-truncated',
    expectedVector: 'shared.timestamp.expiration-subnanosecond-before-001',
    expectedPassVectors: ['shared.timestamp.expiration-equivalent-offset-nanoseconds-001'],
    suite: 'shared',
    path: 'core/src/main/java/org/finkore/PortableTimestamp.java',
    from: 'return new InstantValue(localSecond - offsetSeconds, nanosecond);',
    to: 'return new InstantValue(localSecond - offsetSeconds, nanosecond / 1_000_000);',
  },
  {
    id: 'java-timestamp-unknown-offset-accepted',
    expectedVector: 'shared.timestamp.unknown-offset-invalid-001',
    expectedPassVectors: ['shared.timestamp.maximum-precision-001'],
    suite: 'shared',
    path: 'core/src/main/java/org/finkore/PortableTimestamp.java',
    from: '|| ("-".equals(sign) && offsetHour == 0 && offsetMinute == 0)) {',
    to: '|| (false && "-".equals(sign) && offsetHour == 0 && offsetMinute == 0)) {',
  },
  {
    id: 'java-approval-ineligible-actor-bypass',
    expectedVector: 'approval.association.ineligible-control-001',
    expectedPassVectors: ['approval.association.record-null-control-001'],
    suite: 'approvals',
    path: 'core/src/main/java/org/finkore/Approvals.java',
    from: 'if (requirement.containsKey("eligibleActors") && !stringList(requirement.get("eligibleActors"), INVALID_DECISION).contains(actorId)) {\n      throw new FinKoreException(INELIGIBLE_ACTOR);\n    }',
    to: 'if (false && requirement.containsKey("eligibleActors") && !stringList(requirement.get("eligibleActors"), INVALID_DECISION).contains(actorId)) {\n      throw new FinKoreException(INELIGIBLE_ACTOR);\n    }',
  },
  {
    id: 'java-approval-opposing-quorum-bypass',
    expectedVector: 'approval.composition.quorum-opposing-effective-votes-invalid-001',
    expectedPassVectors: ['approval.composition.quorum-two-of-three-approved-boundary-001'],
    suite: 'approvals',
    path: 'core/src/main/java/org/finkore/Approvals.java',
    from: 'if (approved && rejected) {\n      throw new FinKoreException(INVALID_CHAIN);\n    }',
    to: 'if (false && approved && rejected) {\n      throw new FinKoreException(INVALID_CHAIN);\n    }',
  },
  {
    id: 'java-audit-actor-identity-bypass',
    expectedVector: 'audit.actor.missing-id-001',
    expectedPassVectors: ['audit.actor.opaque-identity-001'],
    suite: 'audit',
    path: 'core/src/main/java/org/finkore/Audit.java',
    from: 'String id = requiredString(map.get("id"), ACTOR_INVALID);',
    to: 'String id = map.get("id") instanceof String text ? text : null;',
  },
  {
    id: 'java-entity-immutability-bypass',
    expectedVector: 'entity.mutate.immutable-financial-field-001',
    expectedPassVectors: ['entity.mutate.mutable-field-001'],
    suite: 'entities',
    path: 'core/src/main/java/org/finkore/Entities.java',
    from: 'if (!mutable.contains(path)) {\n        throw new FinKoreException(IMMUTABLE);\n      }',
    to: 'if (false && !mutable.contains(path)) {\n        throw new FinKoreException(IMMUTABLE);\n      }',
  },
  {
    id: 'java-entity-positive-money-validation-bypass',
    expectedVector: 'entity.import.validation-positive-money-invalid-001',
    expectedPassVectors: ['entity.import.validation-positive-money-valid-001'],
    suite: 'entities',
    path: 'core/src/main/java/org/finkore/Entities.java',
    from: 'invalid = new BigDecimal(amount).compareTo(BigDecimal.ZERO) <= 0;',
    to: 'invalid = false;',
  },
  {
    id: 'java-entity-duplicate-revision-bypass',
    expectedVector: 'entity.import.duplicate-revision-invalid-identity-001',
    expectedPassVectors: ['entity.import.distinct-token-control-001'],
    suite: 'entities',
    path: 'core/src/main/java/org/finkore/Entities.java',
    from: 'if (!seen.add(revision.get("revision"))) {',
    to: 'if (false && !seen.add(revision.get("revision"))) {',
  },
]

function files(directory) {
  if (!existsSync(directory)) return []
  const result = []
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      result.push(...files(path))
    } else if (entry.isFile()) {
      result.push(path)
    }
  }
  return result
}

function applyMutation(path, from, to) {
  const original = readFileSync(path, 'utf8')
  const occurrences = original.split(from).length - 1
  if (occurrences !== 1) {
    throw new Error(`${path} expected exactly one mutation target for ${JSON.stringify(from)}, found ${occurrences}`)
  }
  writeFileSync(path, original.replace(from, to))
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    maxBuffer: 8 * 1024 * 1024,
    ...options,
  })
  if (result.error !== undefined) throw result.error
  return result
}

function conformanceKilled(env, mutant) {
  const result = run('node', [
    'runner/dist/cli/cli.js',
    '--manifest',
    'conformance/manifest.json',
    '--adapter',
    env.FINKORE_MUTANT_ADAPTER,
    '--suite',
    mutant.suite,
    '--json',
  ], { env: { ...process.env, ...env } })
  return {
    ...assessMutationResult(result, mutant.expectedVector, mutant.expectedPassVectors),
    baselinePassed: conformanceBaselinePassed(result, mutant.requiredVectors),
    output: result.stdout,
    error: result.stderr,
  }
}

function runPythonMutant(mutant) {
  const directory = mkdtempSync(join(tmpdir(), 'finkore-python-mutant-'))
  try {
    const implementationRoot = join(directory, 'python')
    cpSync(resolve(repositoryRoot, 'implementations/python'), implementationRoot, { recursive: true })
    applyMutation(join(implementationRoot, mutant.path), mutant.from, mutant.to)
    const result = conformanceKilled({
      FINKORE_MUTANT_ADAPTER: 'implementations/python/adapters/conformance/adapter.js',
      FINKORE_PYTHON_PATH: process.env.FINKORE_PYTHON_PATH ?? resolve(repositoryRoot, '.tools/bin/python3.12'),
      FINKORE_PYTHON_BRIDGE_PATH: join(implementationRoot, 'adapters/conformance/bridge.py'),
    }, mutant)
    return { ...result, id: mutant.id }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}

function compileJava(implementationRoot) {
  const javac = existsSync(resolve(repositoryRoot, '.tools/bin/javac')) ? resolve(repositoryRoot, '.tools/bin/javac') : 'javac'
  const output = join(implementationRoot, 'target/classes')
  mkdirSync(output, { recursive: true })
  const sources = [
    ...files(join(implementationRoot, 'core/src/main/java')),
    ...files(join(implementationRoot, 'adapters/conformance/src/main/java')),
  ].filter((path) => path.endsWith('.java'))
  const result = run(javac, ['-Xlint:all', '-Werror', '-d', output, ...sources])
  return { result, output }
}

function runJavaMutant(mutant) {
  const directory = mkdtempSync(join(tmpdir(), 'finkore-java-mutant-'))
  try {
    const implementationRoot = join(directory, 'java')
    cpSync(resolve(repositoryRoot, 'implementations/java'), implementationRoot, { recursive: true })
    applyMutation(join(implementationRoot, mutant.path), mutant.from, mutant.to)
    const compile = compileJava(implementationRoot)
    if (compile.result.status !== 0) {
      return { id: mutant.id, killed: false, reason: 'Mutant compilation failed', output: compile.result.stdout, error: compile.result.stderr }
    }
    const result = conformanceKilled({
      FINKORE_MUTANT_ADAPTER: 'implementations/java/adapters/conformance/adapter.js',
      FINKORE_JAVA_PATH: resolve(repositoryRoot, '.tools/bin/java'),
      FINKORE_JAVA_CLASSPATH: compile.output,
    }, mutant)
    return { ...result, id: mutant.id }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}

function report(results) {
  let failures = 0
  for (const result of results) {
    if (result.killed) {
      console.log(`KILLED ${result.id}: ${result.reason}`)
    } else {
      failures += 1
      console.error(`NOT KILLED ${result.id}: ${result.reason}`)
      process.stderr.write(result.output)
      process.stderr.write(result.error)
    }
  }
  console.log(`Critical mutant probes: ${results.length - failures}/${results.length} killed`)
  if (failures > 0) process.exit(1)
}

for (const mutant of [...pythonMutants, ...javaMutants]) {
  if (typeof mutant.expectedVector !== 'string' || mutant.expectedVector.length === 0
      || !Array.isArray(mutant.expectedPassVectors) || mutant.expectedPassVectors.length === 0
      || mutant.expectedPassVectors.includes(mutant.expectedVector)) {
    throw new Error(`${mutant.id}: declare a named regression and independent paired controls`)
  }
}

const results = []
if (process.argv.length > 4 || (requestedSuite !== undefined && ![...pythonMutants, ...javaMutants].some((mutant) => mutant.suite === requestedSuite))) {
  console.error('Unknown mutation suite or extra arguments')
  process.exit(2)
}
const selected = (mutants) => mutants.filter((mutant) => requestedSuite === undefined || mutant.suite === requestedSuite)
function requireBaselines(mutants, env) {
  for (const suite of new Set(mutants.map((mutant) => mutant.suite))) {
    const requiredVectors = mutants.filter((mutant) => mutant.suite === suite)
      .flatMap((mutant) => [mutant.expectedVector, ...(mutant.expectedPassVectors ?? [])]).filter(Boolean)
    const result = conformanceKilled(env, { suite, requiredVectors })
    if (!result.baselinePassed) throw new Error(`Invalid ${suite} baseline\n${result.output}\n${result.error}`)
    console.log(`BASELINE PASS ${env.FINKORE_MUTANT_ADAPTER} ${suite}`)
  }
}
if (requestedTarget === 'all' || requestedTarget === 'python') {
  requireBaselines(selected(pythonMutants), {
    FINKORE_MUTANT_ADAPTER: 'implementations/python/adapters/conformance/adapter.js',
    FINKORE_PYTHON_PATH: process.env.FINKORE_PYTHON_PATH ?? resolve(repositoryRoot, '.tools/bin/python3.12'),
    FINKORE_PYTHON_BRIDGE_PATH: resolve(repositoryRoot, 'implementations/python/adapters/conformance/bridge.py'),
  })
  for (const mutant of selected(pythonMutants)) { const result = runPythonMutant(mutant); results.push(result); report([result]) }
}
if (requestedTarget === 'all' || requestedTarget === 'java') {
  const baseline = compileJava(resolve(repositoryRoot, 'implementations/java'))
  if (baseline.result.status !== 0) throw new Error(`Java baseline compilation failed\n${baseline.result.stderr}`)
  requireBaselines(selected(javaMutants), {
    FINKORE_MUTANT_ADAPTER: 'implementations/java/adapters/conformance/adapter.js',
    FINKORE_JAVA_PATH: resolve(repositoryRoot, '.tools/bin/java'),
    FINKORE_JAVA_CLASSPATH: baseline.output,
  })
  for (const mutant of selected(javaMutants)) { const result = runJavaMutant(mutant); results.push(result); report([result]) }
}
report(results)
