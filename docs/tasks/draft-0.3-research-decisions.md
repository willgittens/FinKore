# Draft 0.3 Research Decisions

This file records Draft 0.3 research decisions, review packets, maintainer
acceptance, and any subsequent community or independent review evidence. It is
not a source of financial semantics.

## D03-REVIEW-001 — Draft Review Policy

- Status: ACCEPTED — project review policy only; no financial semantics accepted.
- Date: 2026-09-12.
- Decision authority: the project maintainer, through the current project
  discussion. The maintainer clarified that this is a solo open-source project
  based on CoreDoc, intended for later community and audit review.
- Scope: Draft 0.3 planning, research, review tasks, and closure gates.
- Basis: [CoreDoc](../coreDoc/core-doc.md#relationship-with-specifications)
  establishes foundation-level obligations that domain specifications refine.
  Its [external review section](../coreDoc/core-doc.md#external-review) permits
  challenges by stable Financial Rule identifier; it does not impose external
  signoff before draft development. CoreDoc v0.5 is an initial normative draft,
  not evidence that the Draft 0.3 implementation is complete.

### Decision

Required domain, accounting, technical, security, and privacy review topics remain
required analysis. For Draft 0.3, the maintainer may accept that analysis and its
scoped decisions without an external reviewer. Assistant analysis must be
attributed as such; maintainer acceptance records project authority, not a claim
of professional credentials or independent assurance.

Each review task must record:

- Applicable CoreDoc rule IDs, domain requirement IDs, and scope.
- Concrete examples, alternatives, rationale, findings, and their resolutions.
- Explicit maintainer acceptance, deferral, or rejection, with date and scope.
- Exact artifact revision: a commit containing all reviewed files, or a manifest
  of file paths and content hashes for a working-tree snapshot.
- Remaining limitations and future community/accounting/security/audit review
  topics, explicitly marked NOT EXTERNALLY REVIEWED until actual evidence exists.

Missing maintainer decisions, unresolved normative ambiguity, conflicts with
CoreDoc, failed conformance, and critical surviving mutants still block the
relevant task. A blanket policy acceptance does not accept later financial
choices, close review tasks, or waive their verification requirements.

External review is a future open-source review opportunity, not a Draft 0.3
prerequisite. No new release deadline or external certification requirement is
introduced by this decision. Future findings must identify affected stable rule
IDs and revisions; accepted changes must propagate through specification,
conformance, implementation, and documentation. Retain prior decisions and record
superseding rationale so a reviewer can reconstruct the evolution. Do not claim
independent review or audit acceptance without actual scoped evidence.

### Current application

TASK-073 is COMPLETE. All six worklist findings have recorded resolutions,
scoped maintainer acceptance, and verification evidence in the final review
record below. TASK-074 is ready to create the conformance families.
Community and independent domain/security/audit review of the resulting Approval
Composition packet is NOT EXTERNALLY REVIEWED and remains open for future review.

CoreDoc itself needs no governance or normative edit for this decision. In
particular, `CORE-004.4` defines all-required Approval Chains and explicitly does
not define quorum. Composition decisions must preserve that distinction and
respect `CORE-004.1`–`CORE-004.3` and `CORE-005.2`–`CORE-005.3`.

## Approval Composition Review Packet

### TASK-073 - Approval Composition Domain and Security Review

- Status: COMPLETE — scoped analysis and decisions accepted; see final review record.
- External review: NOT EXTERNALLY REVIEWED; future review under D03-REVIEW-001.
- Prepared date: 2026-09-12.
- Initial inspected revision: working tree containing TASK-068 through TASK-072
  updates. Final accepted specification translation and review record:
  [TASK-073 content-hash manifest](review-snapshots/task-073-final.json).
- Scope for accounting/domain review:
  - `ALL_OF`, `ANY_OF`, and `N_OF_M` outcome semantics.
  - Quorum threshold boundary behavior, including N-1, N, and N+1 evidence.
  - Rejection versus pending treatment and the rule that no implied abstention
    exists.
  - Duplicate voter treatment: one voter identity contributes at most one vote
    to one quorum group.
  - The rule that a group with no applicable members after explicit
    applicability evaluation is currently approved because it imposes no
    current approval obligation.
- Scope for technical/security review:
  - Maximum nested group depth of four, including the root.
  - Cycle rejection and deterministic declared-order traversal.
  - Safe diagnostics through existing portable error categories without
    disclosing restricted eligibility or decision data.
  - No executable callback, expression language, authorization, IAM/RBAC,
    dynamic approver lookup, notification, persistence, or arbitrary graph
    engine.
- Required evidence before TASK-073 can complete:
  - Attributed accounting/domain and technical/security analysis.
  - Maintainer decision authority and explicit scoped disposition under D03-REVIEW-001.
  - Artifact revision reviewed.
  - Findings, requested changes, and resolution for each review.
  - Explicit acceptance, deferral, or rejection of the scoped semantics above.


### Decision Worklist — 2026-09-12

Status: RESOLVED. Items 1–6 have recorded maintainer decisions. TASK-073 is
complete; TASK-074 must derive expectations from the remediated canonical
specification. Earlier decision records retain their historical intermediate
statuses; the final review record below states the current disposition.

The source inspected was the working tree based on commit
`5b96ad14fdb82e5e182d92b925f8bd1db5daa23c`, including the uncommitted composition
specification. That commit alone does not identify the reviewed artifact. The final
content-hashed snapshot linked above identifies the resulting specification and
review packet; historical decision snapshots retain their original hashes.

Work through these questions in order, recording each decision and rationale:

1. **Review authority and timing — RESOLVED.**
   [D03-REVIEW-001](#d03-review-001--draft-review-policy) records the maintainer
   decision. External review does not block Draft 0.3 development; documented
   analysis, explicit scoped maintainer decisions, and traceable evidence remain
   required. Items 2–6 are resolved below.
2. **Quorum membership and counting unit — RESOLVED.**
   D03-QUORUM-001 accepts Requirement members with explicit distinct voter Actor
   identities. Child groups cannot be voting members; quorums can be nested
   beneath any-of/all-of groups. Applicability and threshold outcomes are resolved
   under item 3. Repeated Decision evidence still counts at most once.
3. **Applicability and fixed thresholds — RESOLVED.**
   D03-QUORUM-002 fixes N against declared membership and rejects an unreachable
   quorum with at least one applicable voter. D03-COMPOSITION-001 omits entirely
   inapplicable child groups from parent evaluation, propagates that omission,
   and returns APPROVED for a valid composition with no applicable requirements.
   No approval evidence is fabricated. Missing applicability facts remain errors.
4. **Stages and validation scope — RESOLVED.**
   D03-COMPOSITION-002 accepts ALL_OF aggregation between applicable groups in
   each stage; a stage with no applicable groups imposes no current obligation.
   D03-COMPOSITION-003 accepts nonempty stage lists and stage group declarations,
   with depth counted from each root group and not the stage container.
   D03-COMPOSITION-004 requires complete validation before any outcome, including
   later stages and alternative branches. D03-COMPOSITION-005 resolves actionable
   Requirement selection and recursive declared reporting order.
   D03-COMPOSITION-006 resolves deterministic error selection when failures coexist.
5. **Effectiveness errors and safe diagnostics — RESOLVED.**
   D03-COMPOSITION-006 preserves INVALID_CONTEXT for missing/malformed required
   evaluation context, INVALID_CHAIN for invalid structure or required evidence,
   and CONDITION_UNRESOLVED for unresolved applicability. Error categories follow
   structure, applicability, required context, then state/effectiveness priority.
   Restricted eligibility and Decision data remain excluded from diagnostics.
6. **Conflicting effective vote evidence — RESOLVED (D03-QUORUM-003).**
   A declared voter can have both an effective approving and rejecting Decision
   for the same Requirement and current facts, with neither withdrawn or
   superseded. Quorum duplicate counting alone does not resolve the contradiction.
   APPROVAL-QUORUM-002/005 could count the approval while the member's rejected
   observation affects 006. The specification must settle the input's validity
   before implementations or vectors choose an outcome.

   Recommendation: composition evaluation should reject that conflicting evidence
   with FINKORE_APPROVAL_INVALID_CHAIN in the state/effectiveness category until
   explicit lifecycle evidence or changed effectiveness removes the conflict.
   Repeated same-outcome evidence would remain permitted and deduplicated. This
   recommendation was explicitly accepted by the maintainer and translated into
   APPROVAL-QUORUM-009. APPROVAL-QUORUM-010 also makes member-specific state explicit
   under the maintainer's auto-accept instruction. Standalone Draft 0.2 API
   behavior is outside this decision.

   Inspection evidence: ApprovalDecisionHistory.evaluateRequirement currently
   returns REJECTED when it encounters an effective rejecting Decision. Neither
   the cited Requirement/Decision/Validity specifications nor the existing
   conformance vectors define the opposing-effective-votes case. Do not treat
   that implementation choice as normative or change its tests in this spec task.

### D03-QUORUM-001 — Explicit Quorum Voter Membership

- Status: ACCEPTED — membership scope only.
- Date: 2026-09-12.
- Authority: project maintainer; explicitly instructed to follow the proposed
  named-voter recommendation in the current discussion.
- Disposition: INCLUDE in Draft 0.3; specification remediation completed below.
- Analysis: assistant-prepared domain and technical findings, maintainer accepted.
- External review: NOT EXTERNALLY REVIEWED; retain for future community/audit
  challenge, particularly role-based quorum needs and duplicate-voter controls.
- CoreDoc: `CORE-004.1`, `CORE-004.3`, `CORE-004.4`, `CORE-005.3`.
- Source proposal: the preceding “Quorum Membership Proposal” in this discussion
  required one explicit voter per Requirement member, no repeated declared voter,
  no child group as a vote, and permitted quorum nesting under any-of/all-of.
- Resulting specification snapshot: [content-hash manifest](review-snapshots/d03-quorum-001.json).
  This identifies the specification translation of the accepted proposal, not
  acceptance of the unresolved contents of the entire composition packet.

Each `N_OF_M` member references an Approval Requirement and declares exactly one
voter Actor identity. No voter may appear in two members of the same quorum,
including conditionally inapplicable members. A child group cannot be a voting
member. A quorum can still be nested beneath `ALL_OF` or `ANY_OF`.

Rationale: approval count and remaining voting capacity use the same distinct
Actor unit. No dynamic actor lookup or conversion of a group outcome into an
Actor vote is needed. An explicit voter must still meet the referenced
Requirement's eligibility and current-effectiveness rules.

The alternative of a role-based seat whose voter becomes known at decision time
is not included in Draft 0.3 quorum membership. Broader eligibility remains
available for ordinary Approval Requirements. This is a scope restriction, not a
claim that role-based approvals are generally invalid.

Concrete contrast cases for later TASK-074 vectors:

| Case | Membership or counting result |
| --- | --- |
| Two-of-three with distinct Alice, Bob, Carol; effective eligible Alice and Bob approvals | Two approving voter identities. |
| Repeated effective approving Decisions from Alice | At most one approving voter identity. |
| Two members both declare Alice, even when one is inapplicable | Invalid definition: `FINKORE_APPROVAL_INVALID_CHAIN`. |
| Member references a child group | Invalid definition: `FINKORE_APPROVAL_INVALID_CHAIN`. |
| Member supplies only a role or no voter identity | Invalid definition: `FINKORE_APPROVAL_INVALID_CHAIN`. |
| Eligible Bob approves the Requirement referenced by Alice's member | Bob's Decision cannot contribute to Alice's member. |
| `ALL_OF(finance-review, board-quorum)` | Allowed membership structure; overall result still depends on applicable evidence. |

Specification changes: refine `APPROVAL-COMPOSITION-004` and
`APPROVAL-QUORUM-002`; add `APPROVAL-QUORUM-007` and `008`; map invalid member
and voter declarations through existing `APPROVAL-ERROR-008`. Stable existing IDs
are preserved. New requirements remain UNCOVERED pending TASK-074. No runtime
implementation or conformance coverage is claimed.

This focused specification remediation was directly authorized by the maintainer's
instruction to follow the recommendation. TASK-073 remains open for items 3–5;
TASK-074 and later implementation have not started. Membership acceptance does
not settle applicability, fixed-threshold validation, conflicting Decision
evidence, or exact rejection/pending rules. The final review must revisit those
questions before declaring composition vector-ready.

### D03-QUORUM-002 — Fixed Threshold and Unreachable Nonempty Quorum

- Status: ACCEPTED — fixed threshold and nonempty-applicability scope only.
- Date: 2026-09-12.
- Authority: the maintainer answered “Yes” to retaining the declared threshold
  and rejecting a two-of-three quorum where only Alice remains applicable. The
  proposal expressly left the nobody-applies case for the next decision.
- Analysis: assistant-prepared domain and technical findings; maintainer accepted.
- Disposition: INCLUDE in Draft 0.3; directly authorized specification remediation.
- CoreDoc: `CORE-004.1`, `CORE-004.2`, `CORE-004.3`, `CORE-005.2`, `CORE-005.3`.
- Requirements: refine APPROVAL-QUORUM-001 and APPROVAL-QUORUM-006; clarify
  existing APPROVAL-ERROR-008. No identifiers or portable error codes are added.
- Resulting specification snapshot: [content-hash manifest](review-snapshots/d03-quorum-002.json).
  It identifies this translation of the accepted proposal, not acceptance of the
  entire composition packet. The earlier D03-QUORUM-001 manifest is retained as
  a historical snapshot identifier and is not expected to match later file edits.
- External review: NOT EXTERNALLY REVIEWED; retain threshold/applicability and
  aggregate rejection meaning for future community/accounting/security review.

Validate `1 <= N <= M` using distinct declared voters before applicability is
applied. Applicability cannot silently reduce `N`. With at least one applicable
member, if approvals are below `N` and approvals plus remaining pending applicable
voters cannot reach `N`, return `REJECTED`. Otherwise the unmet quorum remains
`PENDING`. Reaching `N` remains `APPROVED` under APPROVAL-QUORUM-005.

Rationale: conditional membership must not silently weaken a declared control.
Reduced applicability does not make a structurally valid definition malformed.
Aggregate rejection expresses an unreachable current threshold; it neither
records a rejecting Decision nor treats pending evidence as rejection. Existing
history and member evidence remain unchanged.

Contrast cases for TASK-074, assuming valid definitions and resolved evidence:

| Definition and current evidence | Expected result |
| --- | --- |
| Two-of-three; only Alice applies and approves | `REJECTED`; N remains two. |
| Two-of-three; only Alice applies and is pending | `REJECTED`; Alice's Requirement remains pending. |
| Two-of-three; Alice approves, Bob is pending, Carol is inapplicable | `PENDING`; one plus one can reach two. |
| Two-of-three; Alice and Bob approve, Carol is inapplicable | `APPROVED`. |
| Two-of-three; Alice approves, Bob rejects, Carol is inapplicable | `REJECTED`. |
| Three-of-three; Alice and Bob approve, Carol is inapplicable | `REJECTED`; N remains three. |
| Two-of-three; all three approve | `APPROVED`; above-threshold evidence is accepted. |
| N is zero, non-integer, or greater than declared M | `FINKORE_APPROVAL_INVALID_CHAIN`. |
| No member applies | Excluded from this decision; subsequently resolved by D03-COMPOSITION-001. |
| Required applicability facts are missing | Existing unresolved-condition error; cannot be treated as not applicable. |

Alternative not selected: lowering the threshold to the remaining applicable
membership. At acceptance, entirely inapplicable groups, stage aggregation/
validation scope, and effectiveness-error mapping remained open. Inapplicable
groups were subsequently resolved by D03-COMPOSITION-001.
No runtime implementation or conformance coverage is claimed. TASK-073 remains
open and TASK-074 has not started.

### D03-COMPOSITION-001 — Entirely Inapplicable Groups

- Status: ACCEPTED — entirely inapplicable groups and parent contribution.
- Date: 2026-09-12.
- Authority: maintainer acceptance of omitting entirely inapplicable groups,
  preventing an empty ANY_OF branch from satisfying a pending obligation, and
  returning APPROVED when the whole composition has no applicable requirements.
- Analysis: assistant-prepared domain and technical findings; maintainer accepted.
- Disposition: INCLUDE in Draft 0.3; directly authorized specification remediation.
- CoreDoc: `CORE-004.2`, `CORE-004.3`, `CORE-004.4`, `CORE-005.2`, `CORE-005.3`.
- Requirements: refine APPROVAL-COMPOSITION-011/012, clarify nonempty outcome
  rules 013/014, and add APPROVAL-COMPOSITION-022. No portable error code added.
- Resulting specification snapshot: [content-hash manifest](review-snapshots/d03-composition-001.json).
  Earlier manifests remain historical revision identifiers; this does not imply
  acceptance of the unresolved stage/validation or error semantics.
- External review: NOT EXTERNALLY REVIEWED; retain empty-group exemption and
  nested ANY_OF controls for future community/accounting/security/audit challenge.

A structurally valid group whose members are all explicitly inapplicable imposes
no current approval obligation. Its standalone group outcome is APPROVED, but it
is omitted when its parent combines applicable members. Omission propagates
through nested groups. A valid composition with no applicable Requirements
returns APPROVED, meaning no approval is required. That observation does not
create or imply a Decision or erase the distinction from effective voter evidence.

Rationale: explicit exemptions should remove an obligation without creating a
vote that could satisfy an alternative branch. A fixed quorum threshold remains
unchanged; an entirely inapplicable quorum is exempt, whereas a quorum with at
least one applicable member must still meet its full threshold.

Contrast cases for TASK-074, with structurally valid definitions unless stated:

| Case | Expected result |
| --- | --- |
| ANY_OF(inapplicable-group, pending-review) | PENDING. |
| ANY_OF(inapplicable-group, rejected-review) | REJECTED. |
| ANY_OF(inapplicable-group, approved-review) | APPROVED from the applicable review. |
| ALL_OF(inapplicable-group, pending-review) | PENDING. |
| ALL_OF(inapplicable-group, approved-review) | APPROVED. |
| Nested group becomes entirely inapplicable after child omission | Omit that group from its parent as well. |
| Root ALL_OF, ANY_OF, or valid N_OF_M has only explicitly inapplicable members | APPROVED; no current approval obligation or implied votes. |
| Valid composition has no applicable Requirements | APPROVED; no approving Decisions created or inferred. |
| Two-of-three has one applicable approving voter | REJECTED under D03-QUORUM-002. |
| Group declares zero members or invalid N | INVALID_CHAIN; inapplicability does not cure structural defects. |
| Required applicability facts are missing | CONDITION_UNRESOLVED; cannot infer an exemption. |

Alternatives not selected: count an exempt child as an approving branch, or
require votes when every obligation has explicitly become inapplicable. The
existing nonempty quorum and member-evidence rules remain intact. Stage
aggregation/validation scope and effectiveness-error mapping remain open.

This is specification work only. Conformance vectors remain TASK-074 after the
remaining semantics close; no implementation or conformance coverage is claimed.

### D03-COMPOSITION-002 — Stage Group Aggregation

- Status: ACCEPTED — stage outcome scope only.
- Date: 2026-09-12.
- Authority: maintainer acceptance of ALL_OF semantics between applicable groups
  in a stage, including no obligation when no groups apply.
- Analysis: assistant-prepared domain and technical findings; maintainer accepted.
- Disposition: INCLUDE in Draft 0.3; directly authorized specification remediation.
- CoreDoc: `CORE-004.2`, `CORE-004.4`, `CORE-005.2`, `CORE-005.3`.
- Requirements: add APPROVAL-COMPOSITION-023; retain declared-order stage gating
  and first-non-approved-stage semantics in APPROVAL-COMPOSITION-016 through 018.
- Resulting specification snapshot: [content-hash manifest](review-snapshots/d03-composition-002.json).
  This identifies the scoped specification translation. Earlier snapshots remain
  historical identifiers; no complete composition review acceptance is implied.
- External review: NOT EXTERNALLY REVIEWED; preserve stage rejection and
  no-obligation progression cases for future community/domain/security review.

A stage omits entirely inapplicable groups. Of the remaining groups, all approved
means APPROVED, any rejected means REJECTED, and otherwise the stage is PENDING.
A valid stage with no applicable groups is APPROVED because it imposes no current
obligation. It does not itself block progression, but any earlier non-approved
stage still does. Parallel groups have no prerequisite ordering between them.

Rationale: each declared applicable stage group is an obligation. Alternatives
belong inside an explicit ANY_OF group; silently treating sibling groups as
alternatives would skip another declared obligation. An aggregate stage outcome
does not create or rewrite any voter Decision.

Contrast cases for TASK-074, assuming structurally valid, resolved observations:

| Stage groups or ordered stages | Expected result |
| --- | --- |
| Same stage: APPROVED, APPROVED | APPROVED. |
| Same stage: APPROVED, PENDING | PENDING. |
| Same stage: APPROVED, REJECTED | REJECTED. |
| Same stage: PENDING, REJECTED (either order) | REJECTED. |
| Same stage: all groups explicitly inapplicable | APPROVED; no current obligation. |
| Same stage: inapplicable group, PENDING | PENDING. |
| Stage 1 entirely inapplicable; stage 2 PENDING | Overall PENDING; stage 1 does not block stage 2. |
| Stage 1 PENDING; stage 2 REJECTED | Overall PENDING; later stage is not actionable. |
| Stage 1 REJECTED; stage 2 APPROVED | Overall REJECTED; later stage is not actionable. |
| All stages APPROVED or entirely inapplicable | Overall APPROVED. |

Alternative not selected: ANY_OF aggregation between groups in a stage. A stage
can instead contain an explicit ANY_OF group when alternatives are intended.
Still OPEN: stage/list structure, staged-root depth, precise actionable leaves,
validation of later/otherwise unnecessary branches, and portable error precedence.
This decision does not classify absent evidence as PENDING or bypass validation.
No runtime implementation or conformance coverage is claimed.

### D03-COMPOSITION-003 — Stage Structure and Group Depth

- Status: ACCEPTED — stage declarations and depth counting.
- Date: 2026-09-12.
- Authority: maintainer acceptance of a nonempty stage list, at least one
  declared group per stage, and a four-group limit starting at each stage root.
- Analysis: assistant-prepared domain and technical findings; maintainer accepted.
- Disposition: INCLUDE in Draft 0.3; directly authorized specification remediation.
- CoreDoc: `CORE-004.4`, `CORE-005.3`. CoreDoc does not prescribe a numeric depth;
  the existing four-group domain bound is retained with explicit counting.
- Requirements: refine APPROVAL-COMPOSITION-001/007 and clarify existing
  APPROVAL-ERROR-008. Stable IDs and portable error categories are preserved.
- Resulting specification snapshot: [content-hash manifest](review-snapshots/d03-composition-003.json).
  Earlier snapshots remain historical records; full composition review is pending.
- External review: NOT EXTERNALLY REVIEWED; retain structural boundaries and
  excessive-depth rejection for future community/security review.

A staged composition declares a nonempty ordered stage list. Each stage declares
at least one reference to a declared root group. For either a standalone root or
each stage root, that group counts as level one and each child adds one level.
Every path is limited to four groups. Stage containers and Requirement leaves
are not group levels; depth does not accumulate across stage roots or stages.

Rationale: empty declarations are missing structure, distinct from explicit
inapplicability. Identical group nesting should have the same depth limit whether
used alone or inside a stage. The stage is sequencing context, not another group.

Contrast cases for TASK-074:

| Case | Structural result |
| --- | --- |
| Empty stage list | INVALID_CHAIN. |
| Stage with zero declared groups | INVALID_CHAIN. |
| Stage reference does not resolve to a declared group | INVALID_CHAIN. |
| One declared stage/group whose Requirements all become inapplicable | Valid structure; no-obligation outcome under D03-COMPOSITION-002. |
| Standalone or staged root plus three nested child groups | Valid depth four. |
| Standalone or staged root plus four nested child groups | INVALID_CHAIN at depth five. |
| Several stages or parallel roots, each with depth four | Valid depth; levels do not accumulate across roots. |
| Stage contains one ALL_OF root with one Requirement | Group depth one. |

Alternatives not selected: permitting empty declarations or counting stage
containers as group levels. No new stage identifier, serialization, callback,
authorization, or graph engine is introduced. Root references retain existing
resolution/cycle constraints. Validation scope, actionable-Requirement selection,
and error precedence remain open. No runtime or conformance completion is claimed.

### D03-COMPOSITION-004 — Complete Validation Before Outcomes

- Status: ACCEPTED — complete validation scope.
- Date: 2026-09-12.
- Authority: maintainer acceptance of validating the entire composition's structure
  and required evidence, including later stages and alternative branches, without
  treating missing state as pending or making inspected stages actionable.
- Analysis: assistant-prepared domain and technical findings; maintainer accepted.
- Disposition: INCLUDE in Draft 0.3; directly authorized specification remediation.
- CoreDoc: `CORE-002.2`, `CORE-002.3`, `CORE-004.2`, `CORE-004.4`, `CORE-005.2`,
  `CORE-005.3`.
- Requirements: add APPROVAL-COMPOSITION-024; clarify the declared-Requirement
  scope of APPROVAL-COMPOSITION-009. Existing error mapping remains under item 5.
- Resulting specification snapshot: [content-hash manifest](review-snapshots/d03-composition-004.json).
  Earlier manifests retain historical revision identities; full review is pending.
- External review: NOT EXTERNALLY REVIEWED; retain hidden-invalid-branch and
  inactive-stage validation cases for future community/domain/security review.

All declared structure, member applicability, and required current-state and
effectiveness observations must pass validation before an outcome is returned.
This includes later stages and otherwise unnecessary ANY_OF alternatives. An
apparently decisive approval, rejection, pending, or no-obligation result cannot
mask required validation failure. Inspecting a later stage does not activate it.

Rationale: the same invalid composition should not appear valid merely because
an earlier branch or stage determines its aggregate state. Explicit PENDING
is valid state evidence; missing required state is not a substitute for it.
An applicable Requirement with no effective Decision legitimately remains PENDING,
so validation must not manufacture a Decision. Explicitly inapplicable members still require valid
applicability and structure; they do not require approving Decisions.

Contrast cases for TASK-074, each with only the named validation defect:

| Case | Expected result |
| --- | --- |
| ANY_OF approved branch plus another member with unresolved applicability | CONDITION_UNRESOLVED. |
| ANY_OF approved branch plus another applicable member missing required state | INVALID_CHAIN. |
| Early pending stage plus later stage with unresolved applicability | CONDITION_UNRESOLVED. |
| Early rejected stage plus later stage with an invalid group reference | INVALID_CHAIN. |
| Otherwise satisfied composition plus a malformed declared group | INVALID_CHAIN. |
| ANY_OF approved branch plus another member explicitly PENDING, all inputs valid | APPROVED. |
| Early PENDING stage plus later APPROVED stage, all inputs valid | PENDING; later stage remains non-actionable. |
| No-obligation observations with an invalid declared group | INVALID_CHAIN; inapplicability does not cure structural defects. |

Alternative not selected: outcome-driven short-circuiting that skips required
validation. Returning a validation error early is not prohibited; collecting all
errors or a particular software architecture is not required. Error selection
when multiple defects coexist and exact actionable-Requirement selection remain
open. No runtime implementation or conformance coverage is claimed.

### D03-COMPOSITION-005 — Actionable Requirements

- Status: ACCEPTED — staged actionability, reporting order, and terminal outcomes.
- Date: 2026-09-12.
- Authority: maintainer acceptance of pending applicable Requirements through
  pending groups in the first pending stage, once in declared traversal order,
  and no actionable Requirements for approved or rejected compositions.
- Analysis: assistant-prepared domain and technical findings; maintainer accepted.
- Disposition: INCLUDE in Draft 0.3; directly authorized specification remediation.
- CoreDoc: `CORE-004.1`, `CORE-004.4`, `CORE-005.2`, `CORE-005.3`.
- Requirements: refine APPROVAL-COMPOSITION-019; preserve complete validation,
  stage gating, and ALL_OF/ANY_OF/quorum outcomes. No new requirement or error ID.
- Resulting specification snapshot: [content-hash manifest](review-snapshots/d03-composition-005.json).
  Earlier snapshots retain their historical identity; error review is pending.
- External review: NOT EXTERNALLY REVIEWED; retain skipped branches, alternatives,
  and duplicate-Requirement reporting for future community/domain/security review.

For a pending staged composition, recursively traverse the first pending stage's
root groups and their members in declared order, descending only into pending
groups. Return each pending, applicable Requirement identifier once at its first
eligible occurrence. Skip later stages and approved, rejected, or entirely
inapplicable groups. Approved or rejected compositions return no actionables.

Rationale: report current available approval work without reopening a satisfied
alternative or presenting a rejected branch as capable of satisfying its group
through pending leaves alone. The result order is deterministic, not a sequence
of prerequisites. Reported alternatives are candidates; not every candidate
must approve. Existing group and quorum rules still determine satisfaction.

Contrast cases for TASK-074, all after successful complete validation:

| First pending stage / composition | Actionable Requirements |
| --- | --- |
| ANY_OF(A approved, B pending), ALL_OF(C pending) | C only. |
| ANY_OF(A pending, B pending) | A, B as alternatives. |
| Pending quorum with more pending voters than the remaining approvals needed | All pending applicable member Requirements, as candidates. |
| ANY_OF(ALL_OF(A rejected, B pending), C pending) | C only; B is inside a rejected group. |
| Pending group declares Z, child group declaring B then A, then Y | Z, B, A, Y. |
| Same pending Requirement reachable through two pending group paths | Once, at first eligible occurrence. |
| Earlier occurrence in an approved branch; later occurrence through pending groups | Include at the later eligible occurrence. |
| First stage PENDING, later stage has pending Requirements | Only eligible Requirements from the first stage. |
| Composition APPROVED or REJECTED | None. |
| Entirely inapplicable composition | None; it has no current obligation. |

Alternatives not selected: all pending leaves regardless of parent outcome,
identifier sorting, duplicate occurrences, or a requirement to approve every
listed alternative. Actionability grants no authority and does not bypass full
validation. Pending standalone-root actionability is not newly required by this
staged rule. Deterministic error selection and mapping remain open; no runtime
implementation or conformance coverage is claimed.

### D03-COMPOSITION-006 — Error Mapping and Priority

- Status: ACCEPTED — composition validation error mapping and precedence.
- Date: 2026-09-12.
- Authority: maintainer acceptance of the proposed four-category order; the
  maintainer also requested that recommendations continue to accompany decisions.
- Analysis: assistant-prepared domain and technical findings; maintainer accepted.
- Disposition: INCLUDE in Draft 0.3; directly authorized specification remediation.
- CoreDoc: `CORE-002.3`, `CORE-004.2`, `CORE-005.2`, `CORE-005.3`.
- Requirements: refine APPROVAL-COMPOSITION-010 and APPROVAL-ERROR-009; add
  APPROVAL-ERROR-010. Existing portable codes are preserved.
- Resulting specification snapshot: [content-hash manifest](review-snapshots/d03-composition-006.json).
  Earlier manifests retain historical identities; conflicting votes remain open.
- External review: NOT EXTERNALLY REVIEWED; retain mixed-defect priority and safe
  diagnostic cases for future community/domain/security/audit review.

The highest-priority applicable validation category determines the returned code:

| Priority | Category | Portable code |
| --- | --- | --- |
| 1 | Invalid composition structure | FINKORE_APPROVAL_INVALID_CHAIN |
| 2 | Unresolved required applicability | FINKORE_APPROVAL_CONDITION_UNRESOLVED |
| 3 | Missing/malformed required evaluation context | FINKORE_APPROVAL_INVALID_CONTEXT |
| 4 | Missing/malformed required state/effectiveness evidence | FINKORE_APPROVAL_INVALID_CHAIN |

Rationale: retain the distinction between invalid evidence and missing context,
while making the code independent of branch/stage order. Identical code spelling
in categories 1 and 4 does not give them equal priority. All failures in a single
category use its code; no portable diagnostic selection or all-errors report is
required. Restricted eligibility or Decision data must not appear in diagnostics.

Contrast cases for TASK-074:

| Coexisting defects or single failure | Expected code suffix |
| --- | --- |
| Invalid structure plus unresolved applicability or missing context | INVALID_CHAIN (structure). |
| Unresolved applicability plus missing required context or state | CONDITION_UNRESOLVED. |
| Missing required evaluation instant plus malformed state evidence | INVALID_CONTEXT. |
| Expiring Decision with no required evaluation instant, otherwise valid input | INVALID_CONTEXT. |
| Missing required member state, otherwise valid input | INVALID_CHAIN (evidence). |
| Same defects moved between earlier/later stages or alternative branches | Same highest-priority category. |

A valid PENDING or REJECTED composition result remains a domain observation;
REQUIRED concerns a composing action blocked by unsatisfied approval. This change
adds no quorum-specific portable code, prescribes no evaluator architecture, and
does not require exposing every defect. It does not resolve the new conflicting-
vote finding in item 6 or change runtime code/conformance expectations.

### D03-QUORUM-003 — Conflicting Votes and Member-Specific Evidence

- Status: ACCEPTED; disposition INCLUDE in Draft 0.3.
- Date: 2026-09-12.
- Authority: project maintainer explicitly accepted the conflicting-vote
  recommendation and instructed: “Agree and I want to auto accept all recommended
  options”. This separately authorizes applying and recording further recommended
  resolutions within this Approval Composition review. It does not derive domain
  acceptance merely from D03-REVIEW-001's governance policy.
- Analysis: assistant-prepared domain and technical analysis; accepted under that
  instruction, not an independent accounting or security signoff.
- Recommendation: fail opposing effective votes as invalid evidence; derive each
  quorum member's state from its named voter and referenced Requirement only.
- Requirements: add APPROVAL-QUORUM-009 and APPROVAL-QUORUM-010; align
  APPROVAL-ERROR-008 and explanatory error/index text. Preserve portable codes.
- CoreDoc: CORE-004.1, CORE-004.3, CORE-005.2, CORE-005.3, CORE-002.3.
- Resulting revision: [final review manifest](review-snapshots/task-073-final.json).
- External review: NOT EXTERNALLY REVIEWED.

Opposing effective satisfying and rejecting Decisions from one applicable
member's declared voter for its Requirement/current subject context are invalid
composition evidence. They use INVALID_CHAIN in error-priority category 4.
Outcome interpretation follows the Requirement's declared mapping. Only explicit
lifecycle/effectiveness evidence can remove the conflict; evaluation changes
neither Decisions nor lifecycle history.

The additional member-state clarification is necessary because a Requirement can
admit other eligible Actors. Another Actor's rejection must not consume the named
voter's pending capacity, just as another Actor's approval cannot supply its vote.
An applicable member with valid evidence but no effective matching Decision is
pending. Same-outcome repeats give one approved or rejected member. Actionability
uses that member's state and still reports unique Requirement identifiers. This
introduces no voter assignment API or change to ordinary Requirement evaluation.

Alternatives considered and rejected:

- Latest timestamp or first encountered Decision wins: silently introduces a
  supersession policy and makes evidence ordering determine the vote.
- Approval wins or rejection wins: invents a preferred outcome for contradictory
  current evidence instead of requiring an explicit lifecycle resolution.
- Reuse an aggregate Requirement state for every voter: permits another Actor's
  evidence to change a named voter's counting capacity or actionability.
- Reject all repeated evidence: breaks the accepted same-outcome deduplication
  rule and confuses redundant evidence with opposing outcomes.

Contrast cases for TASK-074, derived from APPROVAL-QUORUM-009/010:

| Evidence or scenario | Expected behavior |
| --- | --- |
| Alice has effective satisfying and rejecting Decisions for her member | INVALID_CHAIN, evidence category; no outcome or history mutation. |
| Same conflict with reversed input order or different Decision timestamps | Same error; no implicit latest/first wins. |
| Same conflict while other voters meet N or an ANY_OF alternative approves | Same error; complete validation precedes outcomes. |
| Same conflict plus unresolved applicability elsewhere | CONDITION_UNRESOLVED, by category priority. |
| Same conflict plus missing required evaluation context elsewhere | INVALID_CONTEXT, by category priority. |
| Alice has two effective satisfying Decisions and no rejecting Decision | One approved member and one vote. |
| Alice has two effective rejecting Decisions and no satisfying Decision | One rejected member, zero approvals, zero pending capacity. |
| Alice's rejection is withdrawn or otherwise ineffective; approval remains effective | Approved member; both historical Decisions remain recorded. |
| Alice's approval is ineffective; her rejection remains effective | Rejected member. |
| All matching Decisions are ineffective, or valid supplied history is empty | Pending applicable member; no fabricated abstention. |
| Bob is eligible and rejects Alice's referenced Requirement; Alice has no effective Decision | Alice's member remains pending; Bob cannot consume her capacity. |
| Bob approves Alice's referenced Requirement; Alice has no effective Decision | Alice's member remains pending; Bob supplies no vote for her. |
| Same Requirement occurs under different declared voters in separate groups | Each occurrence uses its own voter's state; actionable Requirement IDs remain deduplicated. |

### TASK-073 Final Review Record

- Disposition: ACCEPTED for continued Draft 0.3 development; TASK-073 COMPLETE.
- Date: 2026-09-12.
- Decision authority: project maintainer, through the individually accepted
  decisions and the explicit auto-accept instruction in D03-QUORUM-003.
- Analysis attribution: assistant analysis of the required domain/accounting and
  technical/security topics; no external reviewer or professional credential is
  represented. Acceptance applies to the recommended semantics and their scoped
  specification translation. It does not claim the maintainer independently
  inspected every final file byte.
- Exact resulting artifact: [SHA-256 manifest](review-snapshots/task-073-final.json),
  covering CoreDoc, governance, Approval specification/index/errors/chains,
  traceability, decisions, implementation plan, backlog, and execution evidence.
- External review: NOT EXTERNALLY REVIEWED. Community, accounting, security, and
  audit review may revisit these decisions by stable IDs and snapshot revisions.

The final review covered the following obligations and resolutions:

| Review topic | CoreDoc / canonical requirements | Finding and resolution |
| --- | --- | --- |
| Counting, eligibility, repeated and opposing votes | CORE-004.1/.3; APPROVAL-QUORUM-002/003/004/007/008/009/010 | Named distinct voters; match voter and Requirement; deduplicate same outcome; opposing effective outcomes are invalid evidence. D03-QUORUM-001/003. |
| Threshold, rejection, pending, applicability | CORE-004.2; CORE-005.2; APPROVAL-QUORUM-001/005/006; APPROVAL-COMPOSITION-009/011/012/015/022 | N is fixed against declared M; unmet but reachable is pending, unreachable with applicable voters is rejected; explicitly empty applicable scope imposes no obligation. D03-QUORUM-002 and D03-COMPOSITION-001. |
| Alternatives and stage sequencing | CORE-004.4; APPROVAL-COMPOSITION-013/014/016/017/018/023 | ALL_OF within stages; first non-approved stage controls overall outcome. Composition extends the domain without redefining CoreDoc's all-required chain. D03-COMPOSITION-002. |
| Structure, references, cycles, depth | CORE-005.3; APPROVAL-COMPOSITION-001 through 007 | Nonempty declarations, unique identifiers, resolvable references, no cycles, max four group levels from each root. D03-COMPOSITION-003. |
| Validation and actionability | CORE-002.2; CORE-004.2; APPROVAL-COMPOSITION-010/019/024 | Validate required evidence across the entire definition; report only eligible pending paths in first pending stage, in declared order, deduplicated. D03-COMPOSITION-004/005. |
| Errors and safe diagnostics | CORE-005.2/.3; APPROVAL-ERROR-004/008/009/010 | Preserve portable categories and deterministic priority; no restricted eligibility/Decision disclosure or requirement to expose all defects. D03-COMPOSITION-006. |
| Lifecycle, non-mutation, evidence boundary | CORE-002.3; CORE-004.3; APPROVAL-COMPOSITION-020/021; APPROVAL-VALIDITY-001 through 012 | Reuse explicit effectiveness and preserve history; state observations are not Decision proof. Conflict handling does not silently supersede evidence. |
| Security and scope boundaries | APPROVAL-COMPOSITION Non-Goals; existing domain separation | No authorization bypass, dynamic lookup, callbacks, executable expressions, persistence, notification, or arbitrary graph engine. Depth bound and deterministic evaluation are specified; no runtime security assurance is claimed. |

No unresolved finding remains within this review's defined scope. The contrast
tables above are design examples for vector authors, not executed tests or a
second source of financial behavior. Future reviewers should especially challenge
fixed electorates and applicability, no-obligation outcomes, contradictory votes,
complete validation versus optional diagnostics, and nested actionability. New
findings require an attributed follow-up or superseding decision; preserve this
record and the prior manifests.

Verification for this artifact-only review checks local Markdown paths/anchors,
unique and mapped normative IDs, traceability totals and unchanged closed vector
references, stable task IDs and dependency/pointer state, final snapshot hashes,
and git diff --check. Results are recorded in the execution evidence. There are
334 indexed requirements: 231 COVERED, 37 UNCOVERED, 66 NOT DIRECTLY TESTABLE, and
zero currently identified BLOCKING SPEC GAP rows. All 199 existing manifest
vectors remain unchanged. These counts do not establish composition conformance.

### Decision and Review Recording

D03-REVIEW-001, D03-QUORUM-001/002/003, and D03-COMPOSITION-001 through 006 resolve
all six worklist items. The canonical specification carries the accepted
behavior; this record preserves rationale, alternatives, attribution, limitations,
and exact resulting revisions. Individual records above describe the state at
their decision time; their former blockers are superseded by this final record.

The initial research packet required specification remediation. The maintainer
explicitly authorized those scoped edits during the decision discussion,
separately from the research task's default prohibition on normative edits. No
new runtime implementation or vector expectations were introduced here. TASK-074
is the next task and must publish conformance families before implementation work.

Completion applicability was evaluated: Approval specification/index/errors,
traceability, planning, backlog, and evidence needed updates and were synchronized.
AGENTS.md already records the accepted review governance. CoreDoc remains
unchanged: its foundation obligations are refined, not overridden. Unit tests,
conformance vectors, mutation tests, public JSDoc, root/package implementation
READMEs, and Agentic metadata require no edits for this review closure: runtime
behavior, public APIs, canonical operation IDs, and implemented capabilities are
unchanged. Conformance creation remains TASK-074; runtime tests and mandatory
financial mutation testing remain gates for their named implementation tasks.

### TASK-089 — Workflow Versioning Technical and Domain Review

- Status: ACCEPTED for continued Draft 0.3 Workflow versioning implementation.
- Date: 2026-09-13.
- Decision authority: project maintainer, through the instruction to continue
  with TASK-089, TASK-090, and TASK-091 after the already recorded
  TASK-085 through TASK-088 specification work.
- Analysis attribution: assistant analysis of the required domain/accounting and
  technical/security topics; no external reviewer or professional credential is
  represented. Acceptance applies to the scoped specification translation and
  the next implementation step, not to future migration, storage, concurrency,
  or Agentic promotion decisions.
- Exact reviewed artifact: [SHA-256 manifest](review-snapshots/task-089-workflow-versioning.json).
- External review: NOT EXTERNALLY REVIEWED. Future community, accounting,
  audit, and security review may challenge these decisions by stable requirement
  ID and artifact hash.

The review covered the following obligations and resolutions:

| Review topic | CoreDoc / canonical requirements | Finding and resolution |
| --- | --- | --- |
| Opaque definition and version identity | CORE-002.1, CORE-002.3, SPEC-IDENTIFIER-001 to -003, WORKFLOW-VERSION-001 to -006 | Definition/version identity is caller or composing-domain supplied, stable, opaque, and separated from Entity Revision and storage counters. Default numeric sequence is ordering metadata only and does not create migration semantics. |
| Bound-instance stability | CORE-002.1, CORE-002.3, WORKFLOW-VERSION-007 to -011 | A versioned instance remains governed by its bound definition version. Newer definitions cannot silently add, remove, or reinterpret transitions for existing instances. |
| Import boundary | CORE-002.1, CORE-002.2, CORE-002.3, WORKFLOW-IMPORT-001 to -006 | Import observes a supplied current State, binding, and optional Workflow Instance Revision. It is not create, transition, event replay, Audit evidence, or migration. |
| Expected-state/revision portability | CORE-002.2, CORE-002.3, WORKFLOW-CONFLICT-001 to -008 | Expected-current-state and expected-revision are optional exact preconditions. Omission has no default; mismatch is a rejected operation, not a storage lock or distributed concurrency winner. |
| Portable errors and precedence | CORE-005.2, CORE-005.3, WORKFLOW-ERROR-004 to -007 | Distinct version mismatch, invalid instance, and state conflict categories are justified. Deterministic precedence keeps structural/binding/precondition failures stable while preserving terminal-state precedence over invalid transition. |
| Security and privacy boundary | CORE-005.2, WORKFLOW-VERSION-012, WORKFLOW-ERROR-002 | Diagnostics may include expected/supplied identifiers when safe but must not expose unrelated guard facts, Actor data, or domain records. No authorization or IAM model is introduced. |

No unresolved finding remains within this review's defined scope. The review
does not approve Workflow migration, BPMN, locking, persistence, distributed
concurrency, Workflow Instance Revision generation, state mapping across
versions, or production interchange schemas. TASK-090 may publish conformance
vectors from these accepted requirements, and TASK-091 may implement only the
definition identity/version representation and validation subset.
