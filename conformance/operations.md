# Portable Conformance Operation Contracts

## Status and scope

This document is the current fixture contract for every operation label in the
FinKore manifest. It lets a consumer bind portable vectors without consulting a
removed adapter or a historical implementation. These are logical test
boundaries, not production APIs, transport messages, or a repository-owned
runner protocol.

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
| `finkore.money.divide` | required `value`, exact decimal non-zero `scalar` | canonical exact Money quotient when representable | Division by zero and required-rounding failures use their Money errors; source observation remains unchanged when requested. |
| `finkore.money.compare` | required `left`, `right` | `LESS`, `EQUAL`, or `GREATER` | Requested operand observations retain the input presentation scale; incompatible currencies fail. |
| `finkore.money.round` | required `value`, integer `scale`, supported `mode` | Money with exactly `scale` fractional digits | `observations.operand` is the unchanged source; malformed policy uses the rounding error. |
| `finkore.money.applyrate` | required `value`, `rate`; optional complete `rounding` | canonical exact Money when rounding is omitted, otherwise exactly `rounding.scale` digits | Omitted rounding means exact application, not a default. Malformed Rate or rounding input uses the owning Money error; source remains unchanged when requested. |
| `finkore.money.allocate` | required `value`, `allocation`, integer `scale` | ordered Money array, every amount rendered at exactly `scale` | `allocation` is exactly one `EQUAL`/`parts` or `RATIO`/`ratios` request. Invalid shape/range or precision loss uses the Allocation/rounding-required error; source remains unchanged when requested. |

Examples of binding normalization:

| Actual exact native result | Operation context | Normalized observation |
| --- | --- | --- |
| `15.50`, `15.5`, or coefficient `1550` with scale 2 | unrounded addition | `{"amount":"15.5","currency":"EUR"}` |
| `-2.500` | unrounded subtraction | `{"amount":"-2.5","currency":"EUR"}` |
| negative zero | unrounded operation | `{"amount":"0","currency":"EUR"}` |
| `15.5` | round with target scale 2 | `{"amount":"15.50","currency":"EUR"}` |
| `15.5001` | unrounded operation | `{"amount":"15.5001","currency":"EUR"}`; it must not normalize to `15.5` |

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

The guard fixture and version-sequence fixture remain defined in
[Declarative fixtures](conventions.md#declarative-fixtures). Bindings translate
them; they do not evaluate guard truth or select definition versions themselves.

## Audit operations

Audit history is a declared ordered array of committed logical Events. Append
may return `{history}`; replace/remove are deliberately rejected append-only
attempts. Relationship and redaction fixture details remain in
[Conformance Vector Conventions](conventions.md#declarative-fixtures).

| Operation | Valid request members | Success value | Omission, null, error, and post-state interpretation |
| --- | --- | --- | --- |
| `finkore.audit.append` | required `history`, `event` | `{history}` containing prior Events followed by the accepted Event | Invalid Actor/Event, duplicate identity, or relationship evidence uses the owning Audit error. Failure observations preserve supplied committed history. |
| `finkore.audit.replace` | required `history`, `eventId`, `replacement` | none in current contract; the request is rejected | Uses `FINKORE_AUDIT_APPEND_ONLY_VIOLATION` and observes unchanged history. |
| `finkore.audit.remove` | required `history`, `eventId` | none in current contract; the request is rejected | Uses `FINKORE_AUDIT_APPEND_ONLY_VIOLATION` and observes unchanged history. |
| `audit.redact` | required `history`, `policy`, `redactionEvent` | `{event,evidenceEvent}` | Policy presence/null rules, candidate validation, protected representation, and unchanged history follow Audit Redaction and its documented priority. |

## Approval fixture definitions

A concrete Requirement supplies nonempty `id`, a `subject` with nonempty string
`type` and `id`, a nonempty list of distinct nonempty `eligibleActors`, and
explicit distinct approved/rejected outcome mappings. Missing or malformed
declarations use `FINKORE_APPROVAL_INVALID_DECISION`; a valid rule excluding an
Actor uses `FINKORE_APPROVAL_INELIGIBLE_ACTOR`. Composition's quorum observation
is different: an explicit empty eligible-Actor list is valid evidence that no
declared voter qualifies.

A concrete Decision supplies Requirement identity, Actor, supported outcome,
decision time, and explicit `subjectFacts`. The facts value may be null, scalar,
array, or object; omission is invalid. Concrete Decision/history fixtures reject
an `effective` member. History is either a Decision array or
`{"history":[...],"lifecycle":[...]}`; where lifecycle is absent, the array means
no lifecycle Events. Operations requiring history do not accept omission/null or
an envelope missing its history array merely because a native convenience API
has an empty default.

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

## Entity operations

| Operation | Valid request members | Success value | Omission, null, error, and post-state interpretation |
| --- | --- | --- | --- |
| `finkore.entity.create` | required `definition`, `id`, object-valued `data` | complete Entity observation, including binding when versioned | Missing/null/non-object data is a validation failure; definition/identity/mutability validation precedes creation. |
| `finkore.entity.mutate` | required `definition`, `entity`, nonempty `changes` | complete resulting Entity | Requested failure observations preserve Entity identity/state/data and expose findings only where specified. Empty changes are invalid mutation, not success. |
| `finkore.entity.transition` | required `definition`, `entity`, `target` | complete resulting Entity | The Entity remains bound to its retained Workflow definition. Failed validation/transition preserves Entity and identity when requested. |
| `finkore.entity.evolution.correct` | required definition, source/related and revisions, relation identity, eligibility, evolution/Audit evidence; expected-source preconditions when supplied | source, related, relation, evolution history, Audit Event/history | Correction does not silently change established currentness. Omitted preconditions skip checks; explicit null is supplied input. |
| `finkore.entity.evolution.reverse` | required definition, source/related and revisions, relation identity, eligibility, evolution/Audit evidence; optional expected source State/revision | source, related, relation, evolution history, Audit Event/history | Reversal correspondence and Audit evidence are validated before commit; failures preserve requested source/related/histories. |
| `finkore.entity.evolution.void` | required definition, source/revision, relation identity, eligibility, evolution/Audit evidence; optional expected source State/revision | non-current source, relation, evolution history, Audit Event/history | Void nullifies currentness without deleting source facts/history. |
| `finkore.entity.evolution.supersede` | required definition, source/successor and revisions, relation identity, eligibility, evolution/Audit evidence, explicit `supersessionScope`; expected-source preconditions when supplied | source, successor as `related`, relation, evolution history, Audit Event/history | Supersession currentness is scoped; missing required scope/relation/Audit evidence is not repaired. |
| `entity.import` | required `definition`, `import` envelope containing the Entity observation and any supplied mapping/revision/conflict evidence | `{entity,historicalRevisions}` plus supplied/derived current revision, conflict version, and identity mapping where applicable | Import preserves current State, stable identity, binding, revisions, and presence distinctions. It does not create or replay lifecycle operations. |

## Review disposition

All 35 manifest operation labels have a current request, success observation,
omission/null rule, error ownership, and requested-post-state interpretation in
this document and the linked current conventions. No review gap required
inventing financial behavior. Historical runtime type profiles, package APIs,
old adapter mechanics, and execution results remain historical evidence only.
