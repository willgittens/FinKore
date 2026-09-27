// SPDX-License-Identifier: MPL-2.0
/**
 * Mutates temporary source copies and runs existing public-API tests for defects
 * that isolated JSON calls cannot expose. Verifies baselines and paired controls;
 * leaves repository sources untouched and defines no financial behavior.
 */
import { cpSync, existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { delimiter, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { assessNativeResult, nativeBaselinePassed } from './mutation-native-result.js'

const root = process.cwd()
const py = 'test_readiness_regressions.ReadinessRegressionTests.'
const workflowControl = 'Workflow retained definition ownership retains state, terminal and transition arrays after construction'
const integration = 'test/integration/readiness-regressions.test.ts'
const boundaryPy = 'test_boundary_regressions.BoundaryRegressions.'
const constructionPy = 'test_construction_evaluation_regressions.ConstructionEvaluationRegressions.'
const probes = [
{
  "id": "python-entity096-revision-currentness-number",
  "language": "python",
  "path": "entities.py",
  "from": "if \"current\" in value and (not isinstance(value[\"current\"], bool) or value[\"current\"] != current):",
  "to": "if \"current\" in value and value[\"current\"] != current:",
  "target": "test_construction_evaluation_regressions.ConstructionEvaluationRegressions.test_entity_boundary096_import_revision_current_one_001",
  "control": "test_construction_evaluation_regressions.ConstructionEvaluationRegressions.test_entity_boundary096_import_revision_current_matching_001"
},
{
  "id": "python-entity096-revision-currentness-bypass",
  "language": "python",
  "path": "entities.py",
  "from": "if \"current\" in value and (not isinstance(value[\"current\"], bool) or value[\"current\"] != current):",
  "to": "if False:",
  "target": "test_construction_evaluation_regressions.ConstructionEvaluationRegressions.test_entity_boundary096_import_revision_current_opposite_001",
  "control": "test_construction_evaluation_regressions.ConstructionEvaluationRegressions.test_entity_boundary096_import_revision_current_matching_001"
},
{
  "id": "python-entity096-source-null-omitted",
  "language": "python",
  "path": "entities.py",
  "from": "if \"sourceIdentity\" in import_value:",
  "to": "if import_value.get(\"sourceIdentity\") is not None:",
  "target": "test_construction_evaluation_regressions.ConstructionEvaluationRegressions.test_entity_boundary096_import_source_null_001",
  "control": "test_construction_evaluation_regressions.ConstructionEvaluationRegressions.test_entity_boundary096_import_control_001"
},
{
  "id": "python-entity096-source-type-omitted",
  "language": "python",
  "path": "entities.py",
  "from": "if \"sourceIdentity\" in import_value:",
  "to": "if isinstance(import_value.get(\"sourceIdentity\"), dict):",
  "target": "test_construction_evaluation_regressions.ConstructionEvaluationRegressions.test_entity_boundary096_import_source_array_001",
  "control": "test_construction_evaluation_regressions.ConstructionEvaluationRegressions.test_entity_boundary096_import_control_001"
},
{
  "id": "python-entity096-standalone-mapping-rejected",
  "language": "python",
  "path": "entities.py",
  "from": "elif \"identityMapping\" in import_value:\n        mapping = _identity_mapping(import_value[\"identityMapping\"], entity, None)",
  "to": "elif \"identityMapping\" in import_value:\n        raise FinKoreError(INVALID_IDENTITY)",
  "target": "test_construction_evaluation_regressions.ConstructionEvaluationRegressions.test_entity_boundary096_import_standalone_mapping_001",
  "control": "test_construction_evaluation_regressions.ConstructionEvaluationRegressions.test_entity_boundary096_import_control_001"
},
{
  "id": "python-entity096-evolution-null-state",
  "language": "python",
  "path": "entities.py",
  "from": "if input_value.get(\"expectedSourceState\", source[\"state\"]) != source[\"state\"]:",
  "to": "if input_value.get(\"expectedSourceState\") is not None and input_value[\"expectedSourceState\"] != source[\"state\"]:",
  "target": "test_construction_evaluation_regressions.ConstructionEvaluationRegressions.test_entity_boundary096_evolution_correct_expectedsourcestate_null_001",
  "control": "test_construction_evaluation_regressions.ConstructionEvaluationRegressions.test_entity_boundary096_evolution_correct_control_001"
},
{
  "id": "python-entity096-evolution-null-revision",
  "language": "python",
  "path": "entities.py",
  "from": "if input_value.get(\"expectedSourceRevision\", source_revision) != source_revision:",
  "to": "if input_value.get(\"expectedSourceRevision\") is not None and input_value[\"expectedSourceRevision\"] != source_revision:",
  "target": "test_construction_evaluation_regressions.ConstructionEvaluationRegressions.test_entity_boundary096_evolution_correct_expectedsourcerevision_null_001",
  "control": "test_construction_evaluation_regressions.ConstructionEvaluationRegressions.test_entity_boundary096_evolution_correct_control_001"
},
{
  "id": "java-entity096-source-null-omitted",
  "language": "java",
  "path": "Entities.java",
  "from": "if (input.containsKey(\"sourceIdentity\")) {",
  "to": "if (input.get(\"sourceIdentity\") != null) {",
  "target": "entity.boundary096.import-source-null-001",
  "control": "entity.boundary096.import-control-001"
},
{
  "id": "java-entity096-source-type-omitted",
  "language": "java",
  "path": "Entities.java",
  "from": "if (input.containsKey(\"sourceIdentity\")) {",
  "to": "if (input.get(\"sourceIdentity\") instanceof Map<?, ?>) {",
  "target": "entity.boundary096.import-source-array-001",
  "control": "entity.boundary096.import-control-001"
},
{
  "id": "java-entity096-standalone-mapping-rejected",
  "language": "java",
  "path": "Entities.java",
  "from": "mapping = identityMapping(input.get(\"identityMapping\"), entity, null);",
  "to": "throw new FinKoreException(INVALID_IDENTITY);",
  "target": "entity.boundary096.import-standalone-mapping-001",
  "control": "entity.boundary096.import-control-001"
},
{
  "id": "java-entity096-evolution-null-state",
  "language": "java",
  "path": "Entities.java",
  "from": "if (input.containsKey(\"expectedSourceState\") && !source.get(\"state\").equals(input.get(\"expectedSourceState\"))) {",
  "to": "if (input.get(\"expectedSourceState\") != null && !source.get(\"state\").equals(input.get(\"expectedSourceState\"))) {",
  "target": "entity.boundary096.evolution-correct-expectedsourcestate-null-001",
  "control": "entity.boundary096.evolution-correct-control-001"
},
{
  "id": "java-entity096-evolution-null-revision",
  "language": "java",
  "path": "Entities.java",
  "from": "if (input.containsKey(\"expectedSourceRevision\") && !sourceRevision.equals(input.get(\"expectedSourceRevision\"))) {",
  "to": "if (input.get(\"expectedSourceRevision\") != null && !sourceRevision.equals(input.get(\"expectedSourceRevision\"))) {",
  "target": "entity.boundary096.evolution-correct-expectedsourcerevision-null-001",
  "control": "entity.boundary096.evolution-correct-control-001"
},
{
  "id": "python-audit096-authority-preservation",
  "language": "python",
  "path": "audit.py",
  "from": "if not _opaque(policy.get(\"authority\")):",
  "to": "if False:",
  "target": "test_audit_redaction_policy.AuditRedactionPolicyTests.test_invalid_authority_preserves_history_policy_and_evidence",
  "control": "test_audit_redaction_policy.AuditRedactionPolicyTests.test_authorized_change_only_control"
},
{
  "id": "python-audit096-source-history-redacted",
  "language": "python",
  "path": "audit.py",
  "from": "redacted = deepcopy(event)",
  "to": "redacted = event",
  "target": "test_audit_redaction_policy.AuditRedactionPolicyTests.test_authorized_redaction_preserves_meaning_and_owns_observations",
  "control": "test_audit.AuditTests.test_appends_event_without_mutating_history"
},
{
  "id": "python-audit096-evidence-input-alias",
  "language": "python",
  "path": "audit.py",
  "from": "\"evidenceEvent\": evidence, \"history\": [*current, evidence]",
  "to": "\"evidenceEvent\": redaction_event, \"history\": [*current, evidence]",
  "target": "test_audit_redaction_policy.AuditRedactionPolicyTests.test_authorized_redaction_preserves_meaning_and_owns_observations",
  "control": "test_audit_redaction_policy.AuditRedactionPolicyTests.test_authorized_change_only_control"
},
{
  "id": "python-workflow-constructor-initial",
  "language": "python",
  "path": "workflow.py",
  "from": " or self.initial_state not in self.states",
  "to": "",
  "target": "test_construction_evaluation_regressions.ConstructionEvaluationRegressions.test_workflow_constructor_initial",
  "control": "test_construction_evaluation_regressions.ConstructionEvaluationRegressions.test_workflow_native_control"
},
{
  "id": "python-workflow-constructor-duplicate",
  "language": "python",
  "path": "workflow.py",
  "from": "len(set(self.states)) != len(self.states) or ",
  "to": "",
  "target": "test_construction_evaluation_regressions.ConstructionEvaluationRegressions.test_workflow_constructor_duplicate",
  "control": "test_construction_evaluation_regressions.ConstructionEvaluationRegressions.test_workflow_native_control"
},
{
  "id": "python-workflow-constructor-terminal",
  "language": "python",
  "path": "workflow.py",
  "from": "or state not in self.states for state in self.terminal_states",
  "to": "for state in self.terminal_states",
  "target": "test_construction_evaluation_regressions.ConstructionEvaluationRegressions.test_workflow_constructor_terminal",
  "control": "test_construction_evaluation_regressions.ConstructionEvaluationRegressions.test_workflow_native_control"
},
{
  "id": "python-workflow-constructor-endpoint",
  "language": "python",
  "path": "workflow.py",
  "from": "transition.target not in self.states",
  "to": "False",
  "target": "test_construction_evaluation_regressions.ConstructionEvaluationRegressions.test_workflow_constructor_endpoint",
  "control": "test_construction_evaluation_regressions.ConstructionEvaluationRegressions.test_workflow_native_control"
},
{
  "id": "python-workflow-constructor-outgoing-terminal",
  "language": "python",
  "path": "workflow.py",
  "from": "transition.source in self.terminal_states",
  "to": "False",
  "target": "test_construction_evaluation_regressions.ConstructionEvaluationRegressions.test_workflow_constructor_outgoing_terminal",
  "control": "test_construction_evaluation_regressions.ConstructionEvaluationRegressions.test_workflow_native_control"
},
{
  "id": "python-workflow-constructor-version",
  "language": "python",
  "path": "workflow.py",
  "from": "if self.definition_identity is not None or self.definition_version_identity is not None:",
  "to": "if False:",
  "target": "test_construction_evaluation_regressions.ConstructionEvaluationRegressions.test_workflow_constructor_version",
  "control": "test_construction_evaluation_regressions.ConstructionEvaluationRegressions.test_workflow_native_control"
},
{
  "id": "java-workflow-constructor-initial",
  "language": "java",
  "path": "Workflow.java",
  "from": "|| initialState == null || !states.contains(initialState)",
  "to": "|| initialState == null",
  "target": "workflow.native.constructor-initial",
  "control": "workflow.native.control"
},
{
  "id": "java-workflow-constructor-duplicate",
  "language": "java",
  "path": "Workflow.java",
  "from": "stringList(states) == null || states.isEmpty() || new HashSet<>(states).size() != states.size()",
  "to": "stringList(states) == null || states.isEmpty()",
  "target": "workflow.native.constructor-duplicate",
  "control": "workflow.native.control"
},
{
  "id": "java-workflow-constructor-terminal",
  "language": "java",
  "path": "Workflow.java",
  "from": "|| !states.containsAll(terminalStates)",
  "to": "|| false",
  "target": "workflow.native.constructor-terminal",
  "control": "workflow.native.control"
},
{
  "id": "java-workflow-constructor-endpoint",
  "language": "java",
  "path": "Workflow.java",
  "from": "!states.contains(transition.target())",
  "to": "false",
  "target": "workflow.native.constructor-endpoint",
  "control": "workflow.native.control"
},
{
  "id": "java-workflow-constructor-outgoing-terminal",
  "language": "java",
  "path": "Workflow.java",
  "from": "terminalStates.contains(transition.source())",
  "to": "false",
  "target": "workflow.native.constructor-outgoing-terminal",
  "control": "workflow.native.control"
},
{
  "id": "java-workflow-constructor-version",
  "language": "java",
  "path": "Workflow.java",
  "from": "if (definitionIdentity != null || definitionVersionIdentity != null) {",
  "to": "if (false) {",
  "target": "workflow.native.constructor-version",
  "control": "workflow.native.control"
},
{
  "id": "typescript-workflow-instance-priority-reversed",
  "language": "typescript",
  "path": "src/workflow/workflow.ts",
  "from": "    const revision = 'revision' in instance ? parseRevision(instance.revision) : undefined\n    const expectedBinding = definition.versionBinding()\n    let binding: WorkflowDefinitionVersionBinding | undefined\n    if (expectedBinding !== undefined) {\n      binding = parseObservedBinding(instance.binding)\n      if (!bindingsMatch(binding, expectedBinding)) {\n        throw new WorkflowVersionMismatchError()\n      }\n    } else if ('binding' in instance) {\n      parseObservedBinding(instance.binding)\n      throw new WorkflowVersionMismatchError()\n    }\n\n    const currentState = instance.currentState\n    if (!definition.hasState(currentState as WorkflowStateIdentifier)) {\n      throw new InvalidWorkflowStateError()\n    }\n",
  "to": "    const expectedBinding = definition.versionBinding()\n    let binding: WorkflowDefinitionVersionBinding | undefined\n    if (expectedBinding !== undefined) {\n      binding = parseObservedBinding(instance.binding)\n      if (!bindingsMatch(binding, expectedBinding)) {\n        throw new WorkflowVersionMismatchError()\n      }\n    } else if ('binding' in instance) {\n      parseObservedBinding(instance.binding)\n      throw new WorkflowVersionMismatchError()\n    }\n\n    const currentState = instance.currentState\n    if (!definition.hasState(currentState as WorkflowStateIdentifier)) {\n      throw new InvalidWorkflowStateError()\n    }\n    const revision = 'revision' in instance ? parseRevision(instance.revision) : undefined\n",
  "tests": [
    "test/workflow/errors.test.ts"
  ],
  "target": "Workflow errors complete instance validation precedes version mismatch",
  "control": "Workflow errors valid instance mismatch control precedes State and conflict checks"
},
  ...[
    { id: 'amount-validation-removed',
      from: 'if not isinstance(self.amount, Decimal) or not self.amount.is_finite():', to: 'if False:',
      target: constructionPy + 'test_money_constructor_nan' },
    { id: 'infinity-accepted',
      from: 'not self.amount.is_finite()', to: 'self.amount.is_nan()',
      target: constructionPy + 'test_money_constructor_negative_infinity' },
    { id: 'integer-coerced',
      from: '        if not isinstance(self.amount, Decimal) or not self.amount.is_finite():',
      to: '        if isinstance(self.amount, int):\n            object.__setattr__(self, "amount", Decimal(self.amount))\n        if not isinstance(self.amount, Decimal) or not self.amount.is_finite():',
      target: constructionPy + 'test_money_constructor_integer' },
    { id: 'amount-error-changed',
      from: 'if not isinstance(self.amount, Decimal) or not self.amount.is_finite():\n            raise FinKoreError(INVALID_AMOUNT)',
      to: 'if not isinstance(self.amount, Decimal) or not self.amount.is_finite():\n            raise FinKoreError(INVALID_CURRENCY)',
      target: constructionPy + 'test_money_constructor_signaling_nan' },
    { id: 'currency-validation-removed',
      from: 'if not isinstance(self.currency, str) or _CURRENCY_RE.fullmatch(self.currency) is None:', to: 'if False:',
      target: constructionPy + 'test_money_currency_empty' },
    { id: 'currency-type-accepted',
      from: 'if not isinstance(self.currency, str) or _CURRENCY_RE.fullmatch(self.currency) is None:',
      to: 'if isinstance(self.currency, str) and _CURRENCY_RE.fullmatch(self.currency) is None:',
      target: constructionPy + 'test_money_currency_object' },
    { id: 'currency-case-normalized',
      from: '_CURRENCY_RE.fullmatch(self.currency)', to: '_CURRENCY_RE.fullmatch(self.currency.upper())',
      target: constructionPy + 'test_money_currency_lowercase' },
    { id: 'currency-error-changed',
      from: 'if not isinstance(self.currency, str) or _CURRENCY_RE.fullmatch(self.currency) is None:\n            raise FinKoreError(INVALID_CURRENCY)',
      to: 'if not isinstance(self.currency, str) or _CURRENCY_RE.fullmatch(self.currency) is None:\n            raise FinKoreError(INVALID_AMOUNT)',
      target: constructionPy + 'test_money_currency_null' },
  ].map(probe => ({ ...probe, id: 'python-money-construction-' + probe.id, language: 'python', path: 'money.py',
    control: constructionPy + 'test_money_decimal_controls' })),
  ...[
    { id: 'context-rounded',
      from: '        if not isinstance(self.amount, Decimal) or not self.amount.is_finite():',
      to: '        if isinstance(self.amount, Decimal):\n            object.__setattr__(self, "amount", +self.amount)\n        if not isinstance(self.amount, Decimal) or not self.amount.is_finite():' },
    { id: 'exponent-rejected',
      from: 'not self.amount.is_finite()', to: 'not self.amount.is_finite() or self.amount.as_tuple().exponent > 0' },
  ].map(probe => ({ ...probe, id: 'python-money-construction-' + probe.id, language: 'python', path: 'money.py',
    target: constructionPy + 'test_money_decimal_controls',
    control: constructionPy + 'test_money_boundary096_rate_control_001' })),
{
  "id": "typescript-entity-definition-from-input-alias",
  "language": "typescript",
  "path": "src/entities/entity.ts",
  "from": "workflow: cloneJsonValue(input.workflow)",
  "to": "workflow: input.workflow",
  "tests": [
    "test/entities/boundaries.test.ts"
  ],
  "target": "Entity result reuse and retained declarations from: rejects an undeclared transition after changing input transitions",
  "control": "Entity result reuse and retained declarations new independently declared Entity control uses its own transitions"
},
{
  "id": "typescript-entity-definition-create-observation-alias",
  "language": "typescript",
  "path": "src/entities/entity.ts",
  "from": "return cloneJsonValue(this.retainedDefinition)",
  "to": "return this.retainedDefinition",
  "tests": [
    "test/entities/boundaries.test.ts"
  ],
  "target": "Entity result reuse and retained declarations create: preserves rejected data after changing observation validators",
  "control": "Entity result reuse and retained declarations new independently declared Entity control uses its own transitions"
},
  {
  "id": "typescript-entity-definition-input-alias",
  "language": "typescript",
  "path": "src/entities/entity.ts",
  "from": "workflow: cloneJsonValue(input.workflow)",
  "to": "workflow: input.workflow",
  "target": "Entity result reuse and retained declarations create: rejects an undeclared transition after changing input transitions",
  "control": "Entity result reuse and retained declarations new independently declared Entity control uses its own transitions",
  "tests": [
    "test/entities/boundaries.test.ts"
  ]
},
  {
  "id": "typescript-entity-definition-observation-alias",
  "language": "typescript",
  "path": "src/entities/entity.ts",
  "from": "return cloneJsonValue(this.retainedDefinition)",
  "to": "return this.retainedDefinition",
  "target": "Entity result reuse and retained declarations from: preserves rejected data after changing observation validators",
  "control": "Entity result reuse and retained declarations new independently declared Entity control uses its own transitions",
  "tests": [
    "test/entities/boundaries.test.ts"
  ]
},
  {
    "id": "python-audit-cycle-silently-accepted",
    "language": "python",
    "path": "audit.py",
    "from": "if identity in ancestors:\n        raise FinKoreError(error_code)",
    "to": "if identity in ancestors:\n        return",
    "target": "test_boundary_regressions.BoundaryRegressions.test_audit_cycles_are_portable_errors",
    "control": "test_boundary_regressions.BoundaryRegressions.test_audit_shared_acyclic_and_ownership_controls"
  },
  {
    "id": "python-audit-cycle-error-context-lost",
    "language": "python",
    "path": "audit.py",
    "from": "if identity in ancestors:\n        raise FinKoreError(error_code)",
    "to": "if identity in ancestors:\n        raise FinKoreError(INVALID_EVENT)",
    "target": "test_boundary_regressions.BoundaryRegressions.test_audit_cycles_are_portable_errors",
    "control": "test_boundary_regressions.BoundaryRegressions.test_audit_shared_acyclic_and_ownership_controls"
  },
  {
    "id": "python-audit-shared-values-rejected",
    "language": "python",
    "path": "audit.py",
    "from": "ancestors.remove(identity)",
    "to": "pass",
    "target": "test_boundary_regressions.BoundaryRegressions.test_audit_shared_acyclic_and_ownership_controls",
    "control": "test_audit.AuditTests.test_appends_event_without_mutating_history"
  },
  {
    "id": "python-audit-event-context-validation-bypass",
    "language": "python",
    "path": "audit.py",
    "from": "    _validate_json_value({key: value for key, value in event.items() if key != \"actor\"}, INVALID_EVENT)",
    "to": "    pass",
    "target": "test_boundary_regressions.BoundaryRegressions.test_audit_event_metadata_is_owned_json",
    "control": "test_boundary_regressions.BoundaryRegressions.test_audit_shared_acyclic_and_ownership_controls"
  },
  {
    "id": "python-audit-event-input-alias",
    "language": "python",
    "path": "audit.py",
    "from": "return deepcopy(event)",
    "to": "return event",
    "target": "test_boundary_regressions.BoundaryRegressions.test_audit_shared_acyclic_and_ownership_controls",
    "control": "test_audit.AuditTests.test_rejects_duplicate_event_identity"
  },
  {
    "id": "java-audit-cycle-silently-repaired",
    "language": "java",
    "path": "Audit.java",
    "from": "if (!ancestors.add(value)) {\n      throw new FinKoreException(code);",
    "to": "if (!ancestors.add(value)) {\n      return null;",
    "target": "audit.cycle.actor.append.map",
    "control": "audit.immutable-numbers-shared-ownership-control"
  },
  {
    "id": "java-audit-cycle-error-context-lost",
    "language": "java",
    "path": "Audit.java",
    "from": "if (!ancestors.add(value)) {\n      throw new FinKoreException(code);",
    "to": "if (!ancestors.add(value)) {\n      throw new FinKoreException(INVALID_EVENT);",
    "target": "audit.cycle.actor.append.list",
    "control": "audit.immutable-numbers-shared-ownership-control"
  },
  {
    "id": "java-audit-shared-values-rejected",
    "language": "java",
    "path": "Audit.java",
    "from": "ancestors.remove(value);",
    "to": "// Retain all visited containers.",
    "target": "audit.immutable-numbers-shared-ownership-control",
    "control": "audit.scalar-control"
  },
  {
    "id": "java-audit-mutable-number-accepted",
    "language": "java",
    "path": "Audit.java",
    "from": "if (kind != Byte.class && kind != Short.class",
    "to": "if (false && kind != Byte.class && kind != Short.class",
    "target": "audit.mutable-number.actor.append.integer",
    "control": "audit.immutable-numbers-shared-ownership-control"
  },
  {
    "id": "java-audit-number-subclass-accepted",
    "language": "java",
    "path": "Audit.java",
    "from": "kind != java.math.BigDecimal.class",
    "to": "!(value instanceof java.math.BigDecimal)",
    "target": "audit.unsupported-number-subclasses",
    "control": "audit.immutable-numbers-shared-ownership-control"
  },
  {
    "id": "java-audit-numeric-coercion",
    "language": "java",
    "path": "Audit.java",
    "from": "      return value;\n    }\n    if (!ancestors.add(value))",
    "to": "      return ((Number) value).doubleValue();\n    }\n    if (!ancestors.add(value))",
    "target": "audit.immutable-numbers-shared-ownership-control",
    "control": "audit.scalar-control"
  },
  {
    "id": "java-audit-actor-observation-alias",
    "language": "java",
    "path": "Audit.java",
    "from": "return copyJson(metadata, ACTOR_INVALID);",
    "to": "return metadata;",
    "target": "audit.native-record-ownership",
    "control": "audit.immutable-numbers-shared-ownership-control"
  },
  {
    "id": "java-audit-event-observation-alias",
    "language": "java",
    "path": "Audit.java",
    "from": "return copyJson(metadata, INVALID_EVENT);",
    "to": "return metadata;",
    "target": "audit.native-record-ownership",
    "control": "audit.immutable-numbers-shared-ownership-control"
  },
  {
    "id": "java-audit-change-before-observation-alias",
    "language": "java",
    "path": "Audit.java",
    "from": "return copyJson(before, INVALID_EVENT);",
    "to": "return before;",
    "target": "audit.native-record-ownership",
    "control": "audit.immutable-numbers-shared-ownership-control"
  },
  {
    "id": "java-audit-change-after-observation-alias",
    "language": "java",
    "path": "Audit.java",
    "from": "return copyJson(after, INVALID_EVENT);",
    "to": "return after;",
    "target": "audit.native-record-ownership",
    "control": "audit.immutable-numbers-shared-ownership-control"
  },
  {
    "id": "java-audit-change-input-alias",
    "language": "java",
    "path": "Audit.java",
    "from": "before = copyJson(before, INVALID_EVENT);",
    "to": "before = before;",
    "target": "audit.native-record-ownership",
    "control": "audit.immutable-numbers-shared-ownership-control"
  },
  { id: 'python-workflow-binding-input-alias', language: 'python', path: 'workflow.py',
    from: 'object.__setattr__(self, "_bound_version", deepcopy(binding))',
    to: 'object.__setattr__(self, "_bound_version", binding)',
    target: boundaryPy + 'test_binding_constructor_input_is_owned', control: boundaryPy + 'test_binding_observation_control' },
  { id: 'python-workflow-binding-observation-alias', language: 'python', path: 'workflow.py',
    from: 'return deepcopy(self._bound_version)', to: 'return self._bound_version',
    target: boundaryPy + 'test_exposed_binding_cannot_rebind', control: boundaryPy + 'test_binding_observation_control' },
  ...[
    { id: 'loss-check-removed',
      from: 'if any(digit != "0" for digit in fraction[scale:]):', to: 'if False:',
      target: boundaryPy + 'test_money_lossy_serialization_rejected' },
    { id: 'implicit-rounding',
      from: 'if any(digit != "0" for digit in fraction[scale:]):\n            raise FinKoreError(ROUNDING_REQUIRED)',
      to: 'if any(digit != "0" for digit in fraction[scale:]):\n            return _format_decimal(_round_decimal(value, scale, "HALF_UP"), scale)',
      target: boundaryPy + 'test_money_lossy_serialization_rejected' },
    { id: 'wrong-portable-error',
      from: 'if any(digit != "0" for digit in fraction[scale:]):\n            raise FinKoreError(ROUNDING_REQUIRED)',
      to: 'if any(digit != "0" for digit in fraction[scale:]):\n            raise FinKoreError(INVALID_ROUNDING)',
      target: boundaryPy + 'test_money_lossy_serialization_rejected' },
    { id: 'scale-validation-removed', from: '        _valid_scale(scale)', to: '        pass',
      target: 'test_money.MoneyTests.test_serialization_rejects_negative_and_boolean_scales' },
    { id: 'boolean-scale-accepted', from: 'not isinstance(value, int) or isinstance(value, bool) or value < 0',
      to: 'not isinstance(value, int) or value < 0',
      target: 'test_money.MoneyTests.test_serialization_rejects_negative_and_boolean_scales' },
    { id: 'retained-scale-ignored', from: 'self.presentation_scale if scale is None else scale', to: 'scale',
      target: 'test_money.MoneyTests.test_serialization_checks_native_presentation_scale' },
    { id: 'zero-scale-ignored', from: '        if scale == 0:\n            return integer',
      to: '        if scale == 0:\n            return text', target: boundaryPy + 'test_money_zero_requested_scale' },
  ].map(probe => ({ ...probe, id: 'python-money-serialization-' + probe.id, language: 'python', path: 'money.py',
    control: boundaryPy + 'test_money_explicit_rounding_control' })),
  ...[
    { id: 'implicit-truncation',
      from: 'if (value.stripTrailingZeros().scale() > scale) throw new FinKoreException(ROUNDING_REQUIRED);',
      to: 'if (value.stripTrailingZeros().scale() > scale) return value.setScale(scale, RoundingMode.DOWN).toPlainString();',
      target: 'money.serialization.lossy-1.239' },
    { id: 'implicit-rounding',
      from: 'if (value.stripTrailingZeros().scale() > scale) throw new FinKoreException(ROUNDING_REQUIRED);',
      to: 'if (value.stripTrailingZeros().scale() > scale) return value.setScale(scale, RoundingMode.HALF_UP).toPlainString();',
      target: 'money.serialization.lossy--1.239' },
    { id: 'wrong-portable-error',
      from: 'if (value.stripTrailingZeros().scale() > scale) throw new FinKoreException(ROUNDING_REQUIRED);',
      to: 'if (value.stripTrailingZeros().scale() > scale) throw new FinKoreException(INVALID_ROUNDING);',
      target: 'money.serialization.lossy-1.239' },
    { id: 'negative-scale-accepted', from: 'if (scale < 0) throw new FinKoreException(INVALID_ROUNDING);',
      to: 'if (scale < 0) return value.toPlainString();', target: 'money.serialization.invalid-scale--1' },
    { id: 'unsupported-scale-wrong-error', from: 'catch (ArithmeticException unsupportedScale) {\n        // Loss was checked above; remaining arithmetic failures are capacity limits.\n        throw new FinKoreException(INVALID_ROUNDING);',
      to: 'catch (ArithmeticException unsupportedScale) {\n        throw new FinKoreException(ROUNDING_REQUIRED);',
      target: 'money.serialization.unsupported-scale' },
    { id: 'exact-reduction-rejected', from: 'value.stripTrailingZeros().scale() > scale', to: 'value.scale() > scale',
      target: 'money.serialization.exact-control' },
  ].map(probe => ({ ...probe, id: 'java-money-serialization-' + probe.id, language: 'java', path: 'Money.java',
    control: 'money.serialization.rounding-control' })),
  ...['actor', 'change'].map((name) => {
    const fn = name === 'actor' ? 'cloneJsonValue' : 'cloneAuditValue'
    return { id: `typescript-audit-${name}-unsafe-copy`, language: 'typescript',
      path: `src/audit/${name === 'actor' ? 'actor' : 'audit-change'}.ts`,
      from: `    const result = Object.fromEntries(\n      Object.entries(value).map(([key, item]) => [key, ${fn}(item, ancestors)]),\n    )`,
      to: `    const result: Record<string, unknown> = {}\n    for (const [key, item] of Object.entries(value)) {\n      result[key] = ${fn}(item, ancestors)\n    }`,
      tests: ['test/audit/actors.test.ts', 'test/audit/changes.test.ts'],
      target: 'Audit own JSON member preservation ' + (name === 'actor'
        ? 'preserves __proto__ value 0 through construction, append, import, and redaction'
        : 'rejects equal __proto__ value 0 without changing committed history'),
      control: 'Audit own JSON member preservation preserves constructor value 0 through construction, append, import, and redaction' }
  }),
  { id: 'typescript-workflow-input-alias', language: 'typescript', path: 'src/workflow/definition.ts',
    from: 'equals: retainJson(value.equals)', to: 'equals: value.equals', tests: [integration],
    target: 'Workflow retained definition ownership create retains object input guard when approved=false', control: workflowControl },
  { id: 'typescript-workflow-observation-alias', language: 'typescript', path: 'src/workflow/definition.ts',
    from: 'return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, retainJson(item, ancestors)])))',
    to: 'return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, retainJson(item, ancestors)]))', tests: [integration],
    target: 'Workflow retained definition ownership create retains object observation guard when approved=false', control: workflowControl },
  { id: 'python-workflow-input-alias', language: 'python', path: 'workflow.py',
    from: '_copy_json(guard["equals"])', to: 'guard["equals"]',
    target: py + 'test_workflow_nested_definition_ownership', control: py + 'test_workflow_declaration_arrays_are_owned' },
  { id: 'python-workflow-observation-alias', language: 'python', path: 'workflow.py',
    from: 'return deepcopy(self._guards)', to: 'return self._guards',
    target: py + 'test_workflow_nested_definition_ownership', control: py + 'test_workflow_declaration_arrays_are_owned' },
  {"id": "python-approval096-imported-lifecycle-validation", "language": "python", "path": "approvals.py", "from": "validated.append(_validate_lifecycle(event, current, validated))", "to": "validated.append(deepcopy(event))", "target": "test_construction_evaluation_regressions.ConstructionEvaluationRegressions.test_approval_invalid_history_reuse_boundaries", "control": "test_construction_evaluation_regressions.ConstructionEvaluationRegressions.test_approval_returned_history_control"},
  {"id": "java-approval096-imported-lifecycle-validation", "language": "java", "path": "Approvals.java", "from": "validated.add(validateLifecycle(event, current, validated));", "to": "validated.add(copyMap(stringObjectMap((Map<?, ?>) event, INVALID_DECISION), INVALID_DECISION));", "target": "approval.sequence.invalid-history-record", "control": "approval.boundary096.record-history-control-001"},
  {"id": "python-approval096-required-context", "language": "python", "path": "approvals.py", "from": "_instant(context.get(\"evaluatedAt\") if isinstance(context, dict) else None, INVALID_CONTEXT)", "to": "pass", "target": "test_construction_evaluation_regressions.ConstructionEvaluationRegressions.test_approval_boundary096_context_calendar_001", "control": "test_construction_evaluation_regressions.ConstructionEvaluationRegressions.test_approval_boundary096_context_control_001"},
  {"id": "java-approval096-required-context", "language": "java", "path": "Approvals.java", "from": "instant(context instanceof Map<?, ?> map ? map.get(\"evaluatedAt\") : null, INVALID_CONTEXT);", "to": "// omitted context validation", "target": "approval.boundary096.context-calendar-001", "control": "approval.boundary096.context-control-001"},
  { id: 'python-approval-reused-history-validation', language: 'python', path: 'approvals.py',
    from: 'return [_validate_decision_shape(item) for item in decisions], []', to: 'return deepcopy(decisions), []',
    target: boundaryPy + 'test_approval_record_rejects_incomplete_reused_history', control: boundaryPy + 'test_approval_record_evaluate_control' },
  { id: 'java-approval-reused-history-validation', language: 'java', path: 'Approvals.java',
    from: 'validated.add(validateDecisionShape(decision))', to: 'validated.add(copyMap(stringObjectMap((Map<?, ?>) decision, INVALID_DECISION), INVALID_DECISION))',
    target: 'approval.sequence.incomplete-reused-history', control: 'approval.sequence.control' },
  { id: 'python-approval-sequence-evidence-loss', language: 'python', path: 'approvals.py',
    from: 'result["lifecycle"] = lifecycle', to: 'result["lifecycle"] = []',
    target: py + 'test_lifecycle_record_evaluate_sequences', control: py + 'test_record_without_lifecycle_preserves_effective_decision' },
  { id: 'python-entity-sequence-constant-currentness', language: 'python', path: 'entities.py',
    from: 'current = observed.get(_reference_key(source_reference, scope), True)', to: 'current = True',
    target: py + 'test_evolution_consumes_actual_returned_history', control: py + 'test_combined_audit_failure_preserves_all_supplied_observations' },
  { id: 'java-workflow-input-alias', language: 'java', path: 'Workflow.java',
    from: 'guard.put("equals", retainJson(map.get("equals"), Collections.newSetFromMap(new IdentityHashMap<>())));',
    to: 'guard.put("equals", map.get("equals"));', target: 'workflow.input', control: 'workflow.control' },
  { id: 'java-workflow-observation-map-alias', language: 'java', path: 'Workflow.java',
    from: 'return Collections.unmodifiableMap(result);', to: 'return result;', target: 'workflow.observation', control: 'workflow.control' },
  { id: 'java-workflow-observation-list-alias', language: 'java', path: 'Workflow.java',
    from: 'return Collections.unmodifiableList(result);', to: 'return result;', target: 'workflow.list', control: 'workflow.control' },
  { id: 'java-approval-sequence-evidence-loss', language: 'java', path: 'Approvals.java',
    from: 'return historyEnvelope(append(current.history(), recorded), current.lifecycle());',
    to: 'return historyEnvelope(append(current.history(), recorded), List.of());', target: 'approval.sequence', control: 'approval.control' },
  { id: 'java-entity-sequence-constant-currentness', language: 'java', path: 'Entities.java',
    from: 'boolean current = observed.getOrDefault(evolutionKey(sourceReference, scope), Boolean.TRUE);',
    to: 'boolean current = true;', target: 'entity.sequence', control: 'entity.control' },
]

function run(command, args, options = {}) {
  return spawnSync(command, args, { cwd: root, encoding: 'utf8', timeout: 120_000, maxBuffer: 8 * 1024 * 1024, ...options })
}
function sources(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? sources(path) : [path]
  })
}
function execute(probe, directory) {
  const cases = [probe.target, probe.control]
  if (probe.language === 'python') return run(process.env.FINKORE_PYTHON_PATH ?? join(root, '.tools/bin/python3.12'), [
    join(root, 'docs/tools/mutation-native-python.py'), ...cases,
  ], { env: { ...process.env, PYTHONPATH: [directory, join(root, 'implementations/python/core/tests')].join(delimiter) } })
  if (probe.language === 'java') {
    const output = join(directory, 'classes')
    mkdirSync(output, { recursive: true })
    const files = [...sources(directory).filter((path) => path.endsWith('.java')),
      ...sources(join(root, 'implementations/java/core/src/test/java')).filter((path) => path.endsWith('.java') && !path.endsWith('CoverageTest.java')),
      join(root, 'docs/tools/NativeMutationProbe.java')]
    const compiled = run(join(root, '.tools/bin/javac'), ['-Xlint:all', '-Werror', '-d', output, ...files])
    if (compiled.status !== 0) return { ...compiled, status: 2 }
    return run(join(root, '.tools/bin/java'), ['-cp', output, 'org.finkore.NativeMutationProbe', ...cases])
  }
  const reportPath = join(directory, 'vitest.json')
  rmSync(reportPath, { force: true })
  const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const result = run(process.execPath, [join(root, 'node_modules/vitest/vitest.mjs'), 'run', ...probe.tests,
    '--testNamePattern', `^(?:${cases.map(escape).join('|')})$`, '--reporter=json', '--outputFile', reportPath], { cwd: directory })
  if (!existsSync(reportPath)) return result
  let report
  try { report = JSON.parse(readFileSync(reportPath, 'utf8')) } catch { return { ...result, status: 2 } }
  if ((report.numRuntimeErrorTestSuites ?? 0) !== 0 || report.unhandledErrors?.length
      || report.testResults.some((file) => file.status === 'failed' && file.message)) return { ...result, status: 2 }
  const rows = report.testResults.flatMap((file) => file.assertionResults).filter((test) => cases.includes(test.fullName)).map((test) => ({
    caseId: test.fullName,
    status: test.status === 'passed' ? 'PASS' : test.status === 'failed' ? 'FAIL' : 'INFRASTRUCTURE_ERROR',
    failureKind: test.failureMessages?.length > 0 && test.failureMessages.every((message) => /^AssertionError[:\s]/.test(message)) ? 'ASSERTION' : 'UNEXPECTED_EXCEPTION',
  }))
  const failed = rows.filter((row) => row.status === 'FAIL').length
  return { ...result, stdout: JSON.stringify({ results: rows,
    summary: { total: rows.length, passed: rows.length - failed, failed, unsupported: 0, infrastructureErrors: 0 } }) }
}

const selected = probes.filter(probe => process.argv[2] === undefined || probe.id.includes(process.argv[2]))
if (selected.length === 0) throw new Error('No native mutation probes match the requested ID fragment')
for (const probe of selected) {
  const directory = mkdtempSync(join(tmpdir(), 'finkore-native-mutant-'))
  try {
    let path
    if (probe.language === 'typescript') {
      const core = join(root, 'implementations/typescript/core')
      for (const part of ['src', 'test', 'package.json']) cpSync(join(core, part), join(directory, part), { recursive: true })
      symlinkSync(join(root, 'node_modules'), join(directory, 'node_modules'), 'dir')
      path = join(directory, probe.path)
    } else if (probe.language === 'python') {
      cpSync(join(root, 'implementations/python/core/src/finkore'), join(directory, 'finkore'), { recursive: true, filter: (path) => !path.includes('__pycache__') })
      path = join(directory, 'finkore', probe.path)
    } else {
      cpSync(join(root, 'implementations/java/core/src/main/java'), directory, { recursive: true })
      path = join(directory, 'org/finkore', probe.path)
    }
    const baseline = execute(probe, directory)
    if (!nativeBaselinePassed(baseline, [probe.target, probe.control])) throw new Error(`${probe.id}: invalid baseline\n${baseline.stdout}\n${baseline.stderr}`)
    const original = readFileSync(path, 'utf8')
    if (original.split(probe.from).length !== 2) throw new Error(`${probe.id}: expected exactly one mutation target`)
    writeFileSync(path, original.replace(probe.from, probe.to))
    const result = execute(probe, directory)
    const assessment = assessNativeResult(result, probe.target, [probe.control])
    if (!assessment.killed) throw new Error(`${probe.id}: ${assessment.reason}\n${result.stdout}\n${result.stderr}`)
    console.log(`KILLED ${probe.id}: ${assessment.reason}; paired control PASS`)
  } finally { rmSync(directory, { recursive: true, force: true }) }
}
console.log(`Native public-API mutant probes: ${selected.length}/${selected.length} killed`)
