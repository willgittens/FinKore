# Portable Conformance Operation Contracts

## Status and scope

This document is the fixture contract for all 35 operation labels in the
FinKore Core 1.0 [manifest](manifest.json): 20 canonical `finkore.*` operations
and 15 conformance-local labels. It defines how consumers bind portable vectors.
These are logical test boundaries, not production APIs, transport messages, or a
repository-owned runner protocol.

Canonical `finkore.*` operations also have Agentic descriptors. Other labels are
conformance-local. In every case `/spec` remains authoritative; this document
only defines how a vector supplies and observes that behavior.

## Common request and observation rules

The operation tables list the members of a valid ordinary request. Vectors may
deliberately omit a required member or supply null, an empty value, or a wrong
type to require the specified portable error. A binding must preserve those
distinctions and must not fill defaults unless this document explicitly permits
omission. An optional member has no effect when omitted; explicit null remains
supplied input unless its fixture definition explicitly accepts null as a domain
value.

On success, `expected.value` is the complete normalized result. On failure,
`expected.error.code` is the portable error. `expected.observations` requests
post-operation state in addition to the result or error. A binding must obtain
those observations from the implementation boundary or retained supplied state;
it must not copy them from `expected`. If malformed input cannot be imported,
an unchanged-input observation does not claim it became valid committed state.

All arrays preserve declared order. Object member order is insignificant.
Absent, null, empty, and redacted values remain distinct. The error codes present
in current vectors are not an exhaustive replacement for the owning
specification's error contract or precedence rules.

## Money operations

Money operands use the normative `{ "amount": string, "currency": string }`
serialization. The binding applies the current Money observation rule in
[Conformance Vector Conventions](conventions.md#canonical-values): canonical
plain-decimal result spelling when no target scale is declared, exact target
scale for round/allocation and explicitly rounded Rate application, and the
input amount's fractional digit count for requested unchanged-operand
observations. The exact comparator performs no Money normalization.

| Operation | Valid request members | Success value | Requested post-state and failure contract |
| --- | --- | --- | --- |
| `money.deserialize` | required `value` portable Money object | canonical Money observation | Invalid amount/currency uses the owning Money component error. Unknown members inside the Money value follow MONEY-SERIALIZATION-006/-007; unknown vector syntax does not. |
| `money.serialize` | required `value` Money observation | canonical normative portable Money object | No scale preservation is inferred. A production serializer may emit another numerically equivalent valid spelling. |
| `finkore.money.add` | required `left`, `right` | canonical exact Money sum | `observations.left/right` show unchanged operands when requested; currency mismatch uses the Money mismatch code. |
| `finkore.money.subtract` | required `left`, `right` | canonical exact Money difference | Same operand and currency rules as addition. |
| `finkore.money.negate` | required `value` | canonical exact sign reversal | `observations.operand` shows the unchanged source. |
| `finkore.money.multiply` | required `value`, exact decimal `scalar` | canonical exact Money product | `observations.operand` shows the unchanged source; no implicit rounding. |
| `finkore.money.divide` | required `value`, exact decimal `scalar`; optional complete `rounding` with non-negative integer `scale` and supported `mode` | canonical exact Money quotient when finite; otherwise the rounded quotient with exactly `rounding.scale` fractional digits | Omitted rounding preserves exact-or-rounding-required behavior. Explicit null, incomplete/malformed policy, invalid scale, or unsupported mode uses `FINKORE_MONEY_INVALID_ROUNDING` for a nonzero scalar. Zero division retains precedence. A valid policy does not round an exact quotient. Source observation remains unchanged when requested. |
| `finkore.money.compare` | required `left`, `right` | `LESS`, `EQUAL`, or `GREATER` | Requested operand observations retain the input presentation scale; incompatible currencies fail. |
| `finkore.money.round` | required `value`, integer `scale`, supported `mode` | Money with exactly `scale` fractional digits | `observations.operand` is the unchanged source; malformed policy uses the rounding error. |
| `finkore.money.applyrate` | required `value`, `rate`; optional complete `rounding` | canonical exact Money when rounding is omitted, otherwise exactly `rounding.scale` digits | Omitted rounding means exact application, not a default. Malformed Rate or rounding input uses the owning Money error; source remains unchanged when requested. |
| `finkore.money.allocate` | required `value`, `allocation`, integer `scale` | ordered Money array, every amount rendered at exactly `scale` | `allocation` is exactly one `EQUAL`/`parts` or `RATIO`/`ratios` request. Invalid shape/range or precision loss uses the Allocation/rounding-required error; source remains unchanged when requested. |

## Workflow operations

A portable definition supplies declared States, exactly one initial State,
explicit terminal-State and Transition arrays, guards when present, and version
identity/binding data when versioned. State identifiers are nonempty, opaque,
and case-sensitive. Definition validation precedes instance and request
validation under WORKFLOW-ERROR-007.

| Operation | Valid request members | Success value | Omission, null, error, and post-state interpretation |
| --- | --- | --- | --- |
| `workflow.create` | required `definition` | `{currentState}` plus `binding` when versioned | Initial State comes only from the valid definition. Missing required definition collections are invalid; convenience defaults do not repair portable input. |
| `workflow.import` | required `definition`, `instance` | observed `{currentState}`, optional supplied `revision`, and required retained `binding` when versioned | Import does not replay a transition. Missing/null/malformed instance data and binding use the owning Workflow errors. |
| `finkore.workflow.transition` | required `definition`, `instance`, `target`; optional `facts`, `expectedCurrentState`, `expectedRevision`, and fixture-specific `availableDefinitions` | resulting `{currentState}` with retained binding/revision when applicable | Omitted preconditions perform no check; explicit null is supplied input. Requested observations cover unchanged State, binding, revision, and facts after failure. |

Explicit null `expectedCurrentState` uses `FINKORE_WORKFLOW_INVALID_STATE`;
explicit null `expectedRevision` uses `FINKORE_WORKFLOW_STATE_CONFLICT`.
Malformed observed revisions are instance errors, preceding version mismatch.
Invalid-instance cases omit normalized error observations when no valid instance
can be observed; consumers still need evidence that failed calls preserve inputs.

The guard fixture and version-sequence fixture remain defined in
[Declarative fixtures](conventions.md#declarative-fixtures). Bindings translate
them; they do not evaluate guard truth or select definition versions themselves.

## Audit operations

Audit history is a declared ordered array of committed logical Events. Append
may return `{history}`; replace/remove are deliberately rejected append-only
attempts. Change value declarations and absence/redaction sentinels are defined in
[Conformance Vector Conventions](conventions.md#declarative-fixtures).
Relationships follow [Audit Relationships](../spec/audit/relationships.md).

| Operation | Valid request members | Success value | Omission, null, error, and post-state interpretation |
| --- | --- | --- | --- |
| `finkore.audit.append` | required `history`, `event` | `{history}` containing prior Events followed by the accepted Event | Invalid Actor/Event, duplicate identity, or relationship evidence uses the owning Audit error. Failure observations preserve supplied committed history. |
| `finkore.audit.replace` | required `history`, `eventId`, `replacement` | none in current contract; the request is rejected | Uses `FINKORE_AUDIT_APPEND_ONLY_VIOLATION` and observes unchanged history. |
| `finkore.audit.remove` | required `history`, `eventId` | none in current contract; the request is rejected | Uses `FINKORE_AUDIT_APPEND_ONLY_VIOLATION` and observes unchanged history. |
| `audit.redact` | required `history`, `policy`, `redactionEvent` | `{event,evidenceEvent}` | Policy presence/null rules, candidate validation, protected representation, and unchanged history follow Audit Redaction and its documented priority. |

Redaction uses a nonempty string `policy.authority` and declared protected
targets. Missing, null, empty, or wrong-type authority uses
`FINKORE_AUDIT_REDACTION_INVALID`; it is a declaration, not an authorization
service. Under **AUDIT-REDACTION-008**, `policy.id` is optional and, when supplied,
is a nonempty string. Null, empty, or non-string identifiers fail during policy
validation before candidate evidence validation. Identifier presence cannot
replace authority or targets and does not select redacted content.
[Audit Redaction](../spec/audit/redaction.md) governs validation priority,
unchanged history on failure, and the implementation-defined production encoding.

## Approval fixture definitions

A concrete Requirement supplies nonempty `id`, a `subject` with nonempty string
`type` and `id`, a nonempty list of distinct nonempty `eligibleActors`, and
explicit distinct approved/rejected outcome mappings. Missing or malformed
declarations use `FINKORE_APPROVAL_INVALID_DECISION`; a valid rule excluding an
Actor uses `FINKORE_APPROVAL_INELIGIBLE_ACTOR`. Composition's quorum observation
is different: an explicit empty eligible-Actor list is valid evidence that no
declared voter qualifies.

A concrete Actor supplies a nonempty identity; its optional `type`, when supplied,
is a nonempty string under APPROVAL-DECISION-011. Null is not omission.

A concrete Decision supplies Requirement identity, Actor, supported outcome,
decision time, and explicit `subjectFacts`. The facts value may be null, scalar,
array, or object; omission is invalid. Concrete Decision/history fixtures reject
an `effective` member. History is either a Decision array or
`{"history":[...],"lifecycle":[...]}`; where lifecycle is absent, the array means
no lifecycle Events. Operations requiring history do not accept omission/null or
an envelope missing its history array merely because a native convenience API
has an empty default.

These bounded history shapes do not encode an approval-context or subject
identifier for the history as a whole. A consumer binding must therefore scope
each history immutably to exactly one approval context and subject and retain
that association across record, import, reuse, evaluation, withdrawal, and
supersession. It must reject detected cross-context or cross-subject reuse with
`FINKORE_APPROVAL_INVALID_DECISION` while preserving both arrays. Equal
Requirement identifiers and equal facts do not establish the missing identity.
Because two differently scoped histories can otherwise have identical JSON,
that protection requires consumer-owned evidence in addition to portable cases.

`relevantFactPaths` and condition `requiredFacts` are dot-separated object-own
member paths. The list, when supplied, is nonempty and each path and segment is
nonempty. Paths are case-sensitive, do not trim, do not index arrays, and have no
wildcards, brackets, escaping, prototype lookup, or fallback to a literal dotted
key. Missing/traversal-failed selected facts are unavailable; present null,
false, numeric zero, and empty string are available. JSON equality is recursive
and type-sensitive, ignores object member order, and preserves array order.

A condition declaration has nonempty string `id` and `evaluation`, plus an
explicit nonempty distinct `requiredFacts` list. `evaluation` identifies the
external evaluation boundary; it is not executable code. Omitted facts make a
required fact unavailable, while a supplied null/non-object facts container is
malformed. With complete facts, `result` is exactly `APPLICABLE` or
`NOT_APPLICABLE`.

Composition supplies one root or ordered stages, declared bounded groups, an
observation for every referenced Requirement, and Decision evidence where
needed. Applicable non-quorum members require State. Applicable quorum members
require explicit eligible Actors and outcome mappings; each Decision requires a
Boolean `effective`. Missing/null/malformed evidence is not a default. An
inapplicable member needs no eligibility/mapping evidence, although supplied
optional evidence must still be valid. Bindings do not calculate applicability,
eligibility, effectiveness, group outcomes, actionability, or error priority.

Lifecycle Decision references use Requirement identity, Actor identity, and
the exact `decidedAt` instant. Equivalent offsets identify the same instant;
nanosecond distinctions remain significant. Two matching Decisions make a
reference ambiguous even if their timestamp spellings differ. Successful
history observations preserve supplied spellings. Committed lifecycle array
order, supported discriminators, and target/successor relationships follow
APPROVAL-VALIDITY-014; the fixture infers no registry or timestamp-based order.

Record failure diagnostics use `observations.history` for the Decision array.
For missing input history, diagnostics may show an empty list while the
operation still rejects the missing collection. This projection does not
establish valid history import or prove lifecycle preservation; consumers need
additional evidence that both histories remain unchanged.

## Approval operations

| Operation | Valid request members | Success value | Omission, null, error, and post-state interpretation |
| --- | --- | --- | --- |
| `approval.requirement.evaluate` | required `requirement`, explicit `decisions`; optional `currentSubjectFacts`, `relevantFactPaths`, `evaluatedAt`, `observeHistory` | `PENDING`, `APPROVED`, or `REJECTED` | Omitted current facts and selectors make no current-fact comparison. Selectors without current facts are invalid. Expiration requires explicit context when the specification says so. `observeHistory:true` requests unchanged committed history. |
| `approval.requirement.supersede` | required `history`, `supersession` | `{history,lifecycle}` | Appends Requirement-supersession evidence without rewriting Decisions; invalid or duplicate relationships preserve both histories. |
| `approval.decision.record` | required `requirement`, `decision`, `history` | `{history}` or `{history,lifecycle}` with the accepted Decision appended | Complete proposed history is validated. Missing history is invalid even when diagnostic observations project an empty list. Failure preserves supplied histories. |
| `approval.decision.evaluate` | required `requirement`, `decision`, `currentSubjectFacts`; optional `relevantFactPaths`, `evaluatedAt` | `EFFECTIVE` or `INEFFECTIVE` | This concrete facts/expiration boundary makes no lifecycle claim without history. Current facts are required here even though they are optional on Requirement evaluation. |
| `approval.decision.withdraw` | required `requirement`, `history`, `withdrawal` | `{history,lifecycle}` | Operation identity fixes lifecycle kind; a redundant request `type` has no effect. Target must resolve uniquely and remain current. |
| `approval.decision.supersede` | required `history`, `supersession` | `{history,lifecycle}` | Operation identity fixes Decision-supersession kind. Target/successor relationships and committed local event order are validated. |
| `approval.condition.evaluate` | required `condition`; `facts` and `result` according to the declaration/evidence rules above | `APPLICABLE` or `NOT_APPLICABLE` | Missing required fact or unsupported result is unresolved; malformed declaration/evidence is invalid Decision input. |
| `approval.chain.evaluate` | required `chain`, complete `states` observations | unordered result State string, or sequential `{state,activeRequirements}` | Every state is validated. Sequential actionability follows the first non-approved Requirement and does not reuse staged-composition semantics. |
| `approval.composition.evaluate` | required `composition`, `requirements`; Decision/context evidence when required | `{outcome,actionableRequirements}` | Omitted Decision collection retains its documented empty-list convenience; explicit null is malformed. Structure, applicability, required context, then evidence/state priority applies. |

## Entity fixture definitions

Every bounded Entity definition supplies a nonempty `identityScope` under
ENTITY-IDENTITY-007. Data is object-valued under ENTITY-VALIDATION-010; missing,
null, or non-object data uses `FINKORE_ENTITY_VALIDATION_FAILED`. Missing,
malformed, or empty current State uses `FINKORE_WORKFLOW_INVALID_INSTANCE`;
a nonempty undeclared State uses `FINKORE_WORKFLOW_INVALID_STATE`, after
definition validation under ENTITY-LIFECYCLE-007.

A versioned Entity observation carries Workflow `binding` inside `entity`,
`source`, `related`, or `successor`. Bindings translate but never synthesize it
from the definition currently supplied to an operation. Unversioned observations
omit it. Import's optional `expectedState`, `expectedRevision`, and
`expectedConflictVersion` preserve member presence: omission skips the check;
supplied null, malformed, mismatching, or absent observed values use the Entity
state-conflict rule after structural validation.

The bounded `definition.mutability` object maps every declared State to an array
of nonempty mutable field names; an empty array means no fields may change.
Evolution `evolutionHistory` is an ordered relation array. `auditHistory` may be
omitted only where the fixture contract explicitly supplies the empty-history
default; null or malformed history is not omission. Evolution bindings preserve
and return actual relation/Audit histories and do not implement currentness,
duplicate, correspondence, or precedence rules themselves.

Validator declarations follow ENTITY-VALIDATION-009: unsupported rules, malformed
lists/entries, missing or empty string `id`/`path`, and missing or empty
`otherPath` for `money-not-greater-than` use `FINKORE_ENTITY_INVALID_MUTATION`
before predicate evaluation. Omitted validation and an empty list are valid.
The two supported predicates, `positive-money` and `money-not-greater-than`,
are defined in [Declarative fixtures](conventions.md#declarative-fixtures).

An import's supplied `sourceIdentity` has nonempty string `sourceSystem` and
`sourceId`. Null or malformed Source Identity fails with
`FINKORE_ENTITY_INVALID_IDENTITY` even when complete mapping is supplied.
ENTITY-IMPORT-011 permits complete standalone mapping when Source Identity is
omitted, without synthesizing a Source Identity; omitting both remains valid.
Successful imports always include `historicalRevisions`, using an empty list
for omitted or empty supplied history under ENTITY-IMPORT-012. This describes
supplied evidence only; null or malformed history remains invalid and failure
observations preserve original member presence.

An imported revision may omit `current`; its enclosing `currentRevision` or
`historicalRevisions` field declares its role. A supplied marker is Boolean
and agrees with that role. Contradictory/malformed markers use
`FINKORE_ENTITY_INVALID_IDENTITY` under ENTITY-REVISION-007/ENTITY-IMPORT-009
without rewriting the supplied observation. Equal business-revision and
conflict-version tokens are invalid in this bounded fixture, which has no
shared-meaning declaration switch. This does not require global lexical
uniqueness; the composing-specification exception remains in
[Entity Revisions](../spec/entities/revisions.md).

Evolution's optional `expectedSourceState` and `expectedSourceRevision` preserve
presence: omission skips the check; supplied null, malformed, or mismatching
expectations against a valid source use `FINKORE_ENTITY_STATE_CONFLICT`.
Evolution history ordering, currentness, Audit correspondence, combined-error
examples, and preservation follow the
[Entity conventions](conventions.md#semantic-operation-catalog).

## Entity operations

| Operation | Valid request members | Success value | Omission, null, error, and post-state interpretation |
| --- | --- | --- | --- |
| `finkore.entity.create` | required `definition`, `id`, object-valued `data` | complete Entity observation, including binding when versioned | Missing/null/non-object data is a validation failure; definition/identity/mutability validation precedes creation. |
| `finkore.entity.mutate` | required `definition`, `entity`, nonempty `changes` | complete resulting Entity | Requested failure observations preserve Entity identity/state/data and expose findings only where specified. Empty changes are invalid mutation, not success. |
| `finkore.entity.transition` | required `definition`, `entity`, `target`; optional object-valued `facts` | complete resulting Entity | Supplied facts pass unchanged to declared Workflow guards and are not persisted as Entity data; omission supplies no facts. Guard rejection preserves Entity and facts. After Workflow acceptance, the complete target-State Entity is validated. Malformed non-object facts have no current portable outcome and receive no format `0.1` expectation. |
| `finkore.entity.evolution.correct` | required definition, source/related and revisions, relation identity, eligibility, evolution/Audit evidence; expected-source preconditions when supplied | source, related, relation, evolution history, Audit Event/history | Correction does not silently change established currentness. Omitted preconditions skip checks; explicit null is supplied input. |
| `finkore.entity.evolution.reverse` | required definition, source/related and revisions, relation identity, eligibility, evolution/Audit evidence; optional expected source State/revision | source, related, relation, evolution history, Audit Event/history | Reversal correspondence and Audit evidence are validated before commit; failures preserve requested source/related/histories. |
| `finkore.entity.evolution.void` | required definition, source/revision, relation identity, eligibility, evolution/Audit evidence; optional expected source State/revision | non-current source, relation, evolution history, Audit Event/history | Void nullifies currentness without deleting source facts/history. |
| `finkore.entity.evolution.supersede` | required definition, source/successor and revisions, relation identity, eligibility, evolution/Audit evidence, explicit `supersessionScope`; expected-source preconditions when supplied | source, successor as `related`, relation, evolution history, Audit Event/history | Supersession currentness is scoped; missing required scope/relation/Audit evidence is not repaired. |
| `entity.import` | required `definition`, `import` envelope containing the Entity observation and any supplied mapping/revision/conflict evidence | `{entity,historicalRevisions}` plus supplied/derived current revision, conflict version, and identity mapping where applicable | Import preserves current State, stable identity, binding, revisions, and presence distinctions. It does not create or replay lifecycle operations. |
