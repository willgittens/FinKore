# Draft 0.4 Domain Specification Stabilization Record

## Status

Accepted for FinKore Core Draft 0.4 on 2026-09-15.

This record closes the Draft 0.4 "Domain specification stabilization" milestone
for TASK-177 through TASK-185. It records the review result for the existing
Money, Workflow, Audit, Approvals, and Entities scope. It does not add new
financial-domain behavior.

## Reviewed Artifacts

- `spec/` Markdown files: 47.
- Normative-keyword occurrences in `spec/`: 388.
- Open questions reviewed in `spec/`: 30.
- Consolidated portable error catalog entries: 31.
- Cross-check scope for portable error references: `spec/`, `conformance/`,
  `agentic/`, TypeScript core source and README, and the TypeScript conformance
  adapter source.

## Finding Summary

| Finding ID | Area | Classification | Resolution |
| --- | --- | --- | --- |
| `D04-SPEC-177-001` | Shared glossary | CLARIFICATION | Added shared glossary entries for Absent, Current, Invalid, Null, Revision, Unsupported, and Version. |
| `D04-SPEC-178-001` | Money | ACCEPTED | Existing Money requirements are deterministic across exact decimal implementations. Deferred precision, minor-unit metadata, and private currency namespace questions remain non-blocking. |
| `D04-SPEC-179-001` | Workflow | ACCEPTED | Existing Workflow requirements distinguish definition identity, definition version, instance state, instance revision, import observation, and conflict preconditions. Migration and distributed concurrency remain non-capabilities. |
| `D04-SPEC-180-001` | Audit | ACCEPTED | Existing Audit requirements distinguish logical history from storage, append order from distributed order, redaction from absence/null, and actor unknownness from omission. |
| `D04-SPEC-181-001` | Approvals | ACCEPTED | Existing Approval requirements define bounded deterministic composition without requiring IAM, delegation, escalation, dynamic lookup, or a rules engine. |
| `D04-SPEC-182-001` | Entities | ACCEPTED | Existing Entity requirements distinguish stable identity, business revision, conflict version, lifecycle state, import mapping, evolution relation, and required Audit evidence. |
| `D04-SPEC-183-001` | Cross-domain terminology | ACCEPTED | Shared terms have one meaning or an explicit domain refinement. No silent cross-domain contradiction was found. |
| `D04-SPEC-184-001` | Portable errors | ACCEPTED | All 31 cataloged portable error codes are referenced; no missing or orphan catalog entries were found in the reviewed scope. |
| `D04-SPEC-185-001` | Stabilization gate | ACCEPTED | Zero unresolved contradictions and zero blocking specification gaps were found. Requirement IDs remain stable. |

All findings are documentation or review findings. No conformance vector,
TypeScript behavior, Agentic operation descriptor, or portable error code changed.

## Shared Conventions and Glossary

Normative requirements remain governed by `MUST`, `MUST NOT`, `SHOULD`, `SHOULD
NOT`, and `MAY` as defined by `SPEC-CONFORMANCE-001` and
`SPEC-CONFORMANCE-002`. Requirement identifiers remain stable under
`SPEC-REQUIREMENT-001` through `SPEC-REQUIREMENT-004`. Examples do not create
obligations unless explicitly identified as normative, and Money Serialization
remains the only current normative JSON example.

The following shared terms now have explicit Draft 0.4 treatment:

| Term | Stabilized interpretation |
| --- | --- |
| Absent | Member or value omitted entirely; distinct from explicit null. |
| Null | Explicit JSON `null` or equivalent portable null marker; allowed only when specified. |
| Invalid | Violates an applicable FinKore requirement. |
| Unsupported | Outside the current capability surface, or outside a closed operation value set when the domain maps that unsupported value to invalid input. |
| Current | Presently effective, selected, or observed under domain rules; not inferred from storage order or wall-clock time unless specified. |
| Revision | Opaque identity for a declared observation where revision semantics are defined; distinct from stable identity, versions, counters, and timestamps unless explicitly combined. |
| Version | Opaque definition/artifact/format/package compatibility dimension where version semantics are defined; distinct from business revision and conflict-version tokens unless explicitly combined. |

The existing open questions remain future-scope questions. None blocks the
current Draft 0.4 domain baseline:

| Area | Open-question subject | Draft 0.4 disposition |
| --- | --- | --- |
| Conventions | Formal future revision and compatibility policy | Deferred; Draft 0.4 authority/version taxonomy is sufficient for current scope. |
| Conventions | Common identifier envelope | Deferred; identifiers remain opaque values. |
| Money | Precision, scale, overflow limits | Deferred; current exact-decimal operations are determinate without a common floor. |
| Money | Recommended currency scale metadata | Deferred; explicit target scale remains required where precision is reduced. |
| Money | Private/non-ISO currency namespace | Deferred; current compatibility is ISO 4217 scoped. |
| Money | Presentation-scale preservation | Deferred; canonical serialization preserves numeric amount and currency. |
| Workflow | Definition migration | Deferred; import observes existing state and does not migrate. |
| Workflow | Transition identifiers | Deferred; current directed source/target transition semantics are deterministic. |
| Workflow | Simultaneous transition conflict semantics | Deferred; distributed concurrency is outside Core Draft 0.4. |
| Workflow | Time-sensitive or external guard facts | Deferred; current guards require declared supplied facts or declared external dependence. |
| Audit | Unknown actor representation | Deferred; known actors are required when known, and actor omission/null remain governed by actor requirements. |
| Audit | Entity-local sequencing or causal relationships | Deferred; explicit relationships can be recorded, but total ordering is not claimed. |
| Audit | Domain-path syntax | Deferred; stable domain representations are required without a common path syntax. |
| Audit | Large or structured value summaries | Deferred; evidentiary meaning and redaction rules govern current behavior. |
| Audit | Ingestion time separate from occurrence time | Deferred; occurrence time remains the required domain value. |
| Audit | Cryptographic redaction evidence | Deferred; redaction evidence must preserve required meaning without standardizing cryptographic proof. |
| Audit | Generic relationship type | Deferred; current relationship kinds are bounded to specified evidence links. |
| Audit | Relationship redaction policy | Deferred; existing redaction rules govern event meaning and protected content. |
| Approvals | Approval chain definition migration | Deferred; bounded chain behavior remains deterministic. |
| Approvals | Portable condition expression model | Deferred; explicit domain facts remain required. |
| Approvals | Separate portable rejection-blocking code | Deferred; rejection remains distinguishable from missing approval without adding a code. |
| Approvals | Portable subject-state association representation | Deferred; semantic association is required without prescribing an envelope. |
| Entities | Dedicated evolution error catalog | Deferred; existing Entity and Audit codes are sufficient for current evolution requirements. |
| Entities | Evolution relation envelope | Deferred; relation semantics are specified without a common serialized envelope. |
| Entities | Branch-aware supersession graphs | Deferred; bounded supersession relation semantics remain current scope. |
| Entities | Common identity scope model | Deferred; composing domains define identity scope. |
| Entities | Imported lifecycle history initial state | Deferred; import requirements preserve supplied observations without inventing migration. |
| Entities | Post-finalization operational metadata policy | Deferred; immutable state rules remain current scope. |
| Entities | Cancellation or Adjustment evolution concepts | Deferred; correction, reversal, void, and supersession remain the current portable set. |
| Entities | Validation severity and warnings | Deferred; current validation failure semantics are sufficient. |

## Domain Stabilization

### Money

The Money specification is stable for Draft 0.4. Exact decimal behavior is
defined by `SPEC-DECIMAL-001`, `SPEC-DECIMAL-002`,
`MONEY-REPRESENTATION-001` through `MONEY-REPRESENTATION-006`, and
`MONEY-SERIALIZATION-001` through `MONEY-SERIALIZATION-008`.

| Required contrast | Stabilized result |
| --- | --- |
| Canonical vs valid decimal strings | Plain decimal string syntax is normative for portable serialization; canonical display scale is not made significant. |
| Negative zero | Exact numeric equality and ordinary sign semantics mean insignificant representation differences cannot change numeric value. |
| Scale preservation vs numeric equality | Numeric equality ignores insignificant trailing zeros; representation equality may exist only when distinguished. |
| Division and rate precision | Exact results are preserved when possible; precision reduction requires explicit rounding policy. |
| Rounding-required triggers | Required precision reduction without policy fails with `FINKORE_MONEY_ROUNDING_REQUIRED`. |
| Negative rounding boundaries | `DOWN`, `UP`, `FLOOR`, and `CEILING` have distinct signed semantics. |
| Allocation order and remainder | Allocation distributes exact units in declared order and preserves total and currency. |
| Currency compatibility | Current normative compatibility is same ISO 4217 identifier; conversion is out of scope. |
| Input non-mutation | Failed and successful Money operations do not alter operand observable values unless a new value is returned. |
| Invalid/unsupported precedence | Missing, malformed, unsupported, and invalid value categories map through Money error requirements; unsupported future capabilities remain outside current scope. |

Precision limits, currency minor-unit policy, overflow behavior, and private
currency namespaces remain deferred because existing operations are determinate
without them.

### Workflow

The Workflow specification is stable for Draft 0.4. Definition identity,
definition version identity, bound instance version, current State, Transition
Request validation, import observation, and expected-state/revision conflicts
are explicitly separated.

| Required contrast | Stabilized result |
| --- | --- |
| Definition vs instance identity | Workflow Definition Identity names a definition family; an instance has current State and optional revision observation. |
| Definition version vs instance revision | Workflow Definition Version Identity is immutable definition semantics; Workflow Instance Revision is an opaque observation precondition. |
| Exact state identity | State identifiers are domain names unique within a definition, not presentation labels. |
| Guard context | Guards evaluate declared supplied facts or declared external dependence without mutating state. |
| Error precedence | `WORKFLOW-ERROR-007` establishes primary-code priority. |
| Expected preconditions | Expected current State or revision mismatch uses `FINKORE_WORKFLOW_STATE_CONFLICT`. |
| Atomicity | Failed transition/import/mismatch/conflict checks leave current State and binding unchanged. |
| Import vs migration | Import preserves supplied current State and binding; it does not migrate or replay. |
| Persistence and locking | Storage locking, transaction isolation, and distributed winner selection are non-goals. |

Workflow migration and distributed concurrency remain explicit non-capabilities.

### Audit

The Audit specification is stable for Draft 0.4. Audit history is logical
history of financially relevant occurrences, not storage logging or event-sourced
state reconstruction.

| Required contrast | Stabilized result |
| --- | --- |
| Logical history vs storage | Append-only requirements govern logical committed history, not a mandated event store. |
| Append order vs distributed order | Explicit ordering relationships are preserved; independent concurrent events have no guaranteed total order. |
| Unknown vs omitted actor | Known responsible Actors must be identified; a future representation for unknown Actor is deferred. |
| Redacted vs absent vs null | Redaction must leave compliant evidence and preserve required meaning; absent and null remain distinct under shared glossary and Audit Change rules. |
| Relationship validation | Invalid relationship content maps to `FINKORE_AUDIT_INVALID_EVENT`; no dedicated relationship code exists. |
| Original fact preservation | Append-only and redaction requirements preserve existence and meaning of committed events. |
| Error precedence | Audit relationship mapping and actor/redaction rules preserve domain-specific codes without inventing storage errors. |
| Non-mutating failure | Rejected audit operations do not partially commit invalid events. |

No event store, global ordering, retention-law model, or expanded provenance
model is required.

### Approvals

The Approvals specification is stable for Draft 0.4. Approval behavior remains a
business-decision model distinct from authorization.

| Required contrast | Stabilized result |
| --- | --- |
| Eligibility vs authorization | Eligibility for Approval is independent from technical permission to act. |
| Applicable vs inapplicable | Applicability is explicit; entirely inapplicable valid groups or compositions impose no current obligation. |
| Missing fact vs null | Missing or malformed required context/evidence maps through the Approval error priority rules; null is allowed only if a governing portable value permits it. |
| Pending vs rejected | Missing effective approval is distinguishable from explicit rejection. |
| Decision history vs current effectiveness | Committed Decisions remain in history but may stop satisfying current Requirements. |
| Subject/revision binding | Current effectiveness depends on relevant subject facts or revisions without requiring one portable binding envelope. |
| Opposing/duplicate votes | Opposing effective quorum votes from the same declared voter are invalid evidence; repeated same-outcome Decisions are not automatically conflicting. |
| Fixed quorum membership | Quorum threshold is fixed against declared membership before applicability evaluation. |
| Ordered stages | Stages evaluate in declared order; later validation does not make later stages actionable. |
| Bounded nesting | Composition nesting is bounded and cycles are invalid. |
| Actionable requirements | Pending staged compositions report unique pending applicable Requirements from the first pending stage. |
| Complete validation | Later stages and alternative branches are validated before outcome return. |
| Error precedence | `APPROVAL-ERROR-010` defines composition validation priority. |

Rules engines, IAM/RBAC, delegation, escalation, and dynamic approver lookup
remain non-goals.

### Entities

The Entities specification is stable for Draft 0.4. Stable identity, lifecycle,
mutability, validation, revision, import, and evolution requirements remain
bounded to reusable financial entity primitives.

| Required contrast | Stabilized result |
| --- | --- |
| Stable identity vs revision vs conflict version | Stable Entity identity, Entity Revision, and Entity Conflict Version are distinct opaque values. |
| Mutation vs transition | Entity Mutations and Workflow Transitions remain separate concepts that composing domains may combine. |
| Correction/reversal/void/supersession | Evolution records relations and required evidence without defining concrete accounting postings. |
| Current vs historical observations | Current Entity Revision and Historical Entity Revision are explicitly distinguished. |
| Import mapping vs registry | Source Identity mapping is evidence for import, not a global identity registry. |
| Precondition ordering | Expected state/revision/conflict-version failures use Entity conflict semantics without replacing primary Money, Workflow, Approval, or Audit failures. |
| Audit evidence | Composing domains identify audited operations; evolution requires caller-supplied Audit evidence where specified. |
| Duplicate relations | Duplicate or invalid evolution relations fail without partial Entity, evolution, or Audit observations. |
| Atomicity | Failed Entity operations leave identity, current State, and entity data unchanged. |

No database version, registry, migration file format, or concrete ledger posting
effect is assumed.

## Cross-Domain Matrix

| Concern | Draft 0.4 cross-domain rule |
| --- | --- |
| Identity | Identifiers are opaque and scoped. Domain-specific identities keep their declared meaning. |
| Revision/version | Revision identifies a business/domain observation; version identifies a definition, artifact, format, or package compatibility dimension. Conflict-version tokens are preconditions, not business revisions. |
| Currentness | Current is determined by domain rules and explicit observations, not ambient ordering, storage order, or wall-clock inference. |
| Applicability | Applicability is explicit where used, especially for Approvals; inapplicability is not approval evidence. |
| Validation | Structure, value validity, preconditions, guards, and business validation keep their domain-specific error categories. |
| Atomicity | Failed operations must not create partial observable state in Money, Workflow, Audit, Approvals, or Entities. |
| Audit evidence | Audit records evidence of domain events; Audit does not define concrete accounting effects or reconstruct domain state. |
| Timestamps | Domain timestamps identify unambiguous instants; timestamp order is not automatically total domain order. |
| Portable values | JSON member order carries no meaning; exact decimals are base-10; omission and explicit null are distinct. |
| Error priority | Domain error documents define primary-code priority where multiple failures coexist; portable code meaning is language-neutral. |

No dependency direction changed. Domain rules remain in `/spec`; conformance
vectors verify but do not define behavior; the runner remains domain-neutral.

## Portable Error Inventory

The consolidated portable error contract is stable for Draft 0.4. Codes are
language-neutral categories; class names, exception hierarchies, messages,
transport statuses, and stack traces are non-portable.

| Domain | Codes | Trigger and precedence summary | Atomicity/privacy summary |
| --- | --- | --- | --- |
| Money | `FINKORE_MONEY_INVALID_AMOUNT`, `FINKORE_MONEY_INVALID_CURRENCY`, `FINKORE_MONEY_CURRENCY_MISMATCH`, `FINKORE_MONEY_DIVISION_BY_ZERO`, `FINKORE_MONEY_ROUNDING_REQUIRED`, `FINKORE_MONEY_INVALID_ROUNDING`, `FINKORE_MONEY_INVALID_ALLOCATION` | Money errors cover malformed/unsupported values, incompatible currencies, zero divisor, missing rounding policy, invalid rounding, and invalid allocation. | Failed Money operations return no Money/allocation result and leave operands unchanged. |
| Workflow | `FINKORE_WORKFLOW_INVALID_DEFINITION`, `FINKORE_WORKFLOW_INVALID_INSTANCE`, `FINKORE_WORKFLOW_INVALID_STATE`, `FINKORE_WORKFLOW_INVALID_TRANSITION`, `FINKORE_WORKFLOW_GUARD_REJECTED`, `FINKORE_WORKFLOW_TERMINAL_STATE`, `FINKORE_WORKFLOW_VERSION_MISMATCH`, `FINKORE_WORKFLOW_STATE_CONFLICT` | `WORKFLOW-ERROR-007` orders invalid definition, invalid instance, version mismatch, invalid State, conflict, terminal State, invalid Transition, then guard rejection. | Failed Workflow operations leave current State and binding unchanged; diagnostics must be safe. |
| Audit | `FINKORE_AUDIT_INVALID_EVENT`, `FINKORE_AUDIT_DUPLICATE_EVENT`, `FINKORE_AUDIT_APPEND_ONLY_VIOLATION`, `FINKORE_AUDIT_REDACTION_INVALID`, `FINKORE_AUDIT_ACTOR_INVALID` | Audit errors cover invalid event content, duplicate committed identity, append-only violation, invalid redaction, and invalid actor attribution. Relationships reuse `FINKORE_AUDIT_INVALID_EVENT`. | Failed appends do not partially commit; error details must not disclose redacted content. |
| Approval | `FINKORE_APPROVAL_REQUIRED`, `FINKORE_APPROVAL_INVALID_DECISION`, `FINKORE_APPROVAL_INELIGIBLE_ACTOR`, `FINKORE_APPROVAL_INVALID_CHAIN`, `FINKORE_APPROVAL_CONDITION_UNRESOLVED`, `FINKORE_APPROVAL_INVALID_CONTEXT` | `APPROVAL-ERROR-010` orders invalid composition structure, unresolved applicability, missing/malformed context, then required state/effectiveness evidence. Missing approval is distinct from rejection. | Failed Approval operations leave committed Decisions and lifecycle events unchanged; details must not disclose restricted eligibility or decision data. |
| Entity | `FINKORE_ENTITY_INVALID_IDENTITY`, `FINKORE_ENTITY_IMMUTABLE`, `FINKORE_ENTITY_INVALID_MUTATION`, `FINKORE_ENTITY_STATE_CONFLICT`, `FINKORE_ENTITY_VALIDATION_FAILED` | Entity errors cover identity conflicts, immutable-state mutation, unrecognized/disallowed mutation, expected-state conflict, and validation failure. Primary Money, Workflow, Approval, or Audit failures retain their domain code. | Failed Entity operations leave identity, current State, and data unchanged and must not produce partially valid Entities. |

The reviewed artifact set referenced exactly the 31 cataloged codes: zero
missing catalog entries and zero orphan catalog entries.

## Stabilization Gate

TASK-185 is accepted.

- All findings are resolved or explicitly deferred.
- No blocking specification gap was found.
- No unresolved contradiction was found between shared conventions and domain
  specifications.
- Requirement identifiers remain stable.
- No directly testable behavior changed, so no failing-then-passing conformance
  vectors or TypeScript behavior changes were required.
- JSDoc, README, conformance, Agentic, and implementation behavior remain
  synchronized because the milestone added clarification and review evidence
  only.
- No external review is claimed for this milestone.
