# Core 2.0 publication blockers

Reviewed on 2026-10-04 against commit `265a62a`, which is also the target of the
annotated local `core-2.0` tag. This document records actionable contract issues;
it does not change normative requirements or conformance expectations.

**Recommendation:** Resolve the two high-priority issues below before presenting
this tree as a stable Core 2.0 baseline. They concern consistency between the
published specification and acceptance artifacts. Repository visibility itself
does not resolve them; public development review can still proceed with their
status disclosed.

| Issue | Priority | Publication impact |
| --- | --- | --- |
| B1 Shared Approval timestamp cases still use Core 1.x records | High | Existing success expectations require accepting inputs that Core 2.0 requires rejecting. |
| B2 Scoped association and unrelated-history treatment disagree | High | Consumers cannot derive one clear collection-evaluation boundary from the specification and its fixtures. |
| C1 Entity context-priority case has a malformed validator | Medium | The case does not isolate the target-State validation priority it claims to exercise. |

Priorities here describe contract review findings, not vulnerability scores or
Agentic safety classifications. No consumer financial implementation was
executed, and these findings do not establish a production authorization bypass.

## B1 Shared timestamp cases omit mandatory Approval identity

[APPROVAL-DECISION-013 and APPROVAL-DECISION-014](../spec/approvals/decisions.md)
require the bounded concrete Requirement's `contextId`, the Decision's scoped
`requirementRef`, and its stable `decisionId`. Missing identity or association
uses `FINKORE_APPROVAL_INVALID_DECISION`. The
[published operation contract](../conformance/operations.md#approval-fixture-definitions)
also describes these members as part of concrete Approval input.

The manifest still discovers five Approval cases in
[shared/timestamps.json](../conformance/shared/timestamps.json) whose records
lack those members. Three expect successful Requirement evaluation:

| Vector | Published expected result |
| --- | --- |
| `shared.timestamp.expiration-subnanosecond-before-001` | `APPROVED` |
| `shared.timestamp.expiration-equivalent-offset-nanoseconds-001` | `PENDING` |
| `shared.timestamp.expiration-subnanosecond-after-001` | `PENDING` |

For example, the first case supplies a Requirement without `contextId` and a
Decision without `decisionId` or `requirementRef`. The nanosecond expiration
calculation is otherwise the intended subject of the test. A faithful Core 2.0
implementation cannot return its expected success while enforcing the required
input structure. This is a specification/fixture contradiction, independent of
how timestamps are calculated.

The other two cases also need repair:

- `shared.timestamp.invalid-evaluation-precision-001` adds malformed evaluation
  context to already invalid Approval identity. Its expected invalid-context
  result does not isolate timestamp validation from the additional structural
  failures.
- `shared.timestamp.invalid-decision-precision-001` expects invalid Decision
  input but omits the new identity fields from both the candidate and existing
  history. Returning the right error solely because identity is missing can
  conceal a defect that accepts excessive timestamp precision.

**Required follow-up:**

1. Review all manifest suites for uses of changed operations; discovery must
   include shared cases, not just files under the owning domain directory.
2. Supply coherent context, subject, Requirement reference, and distinct Decision
   identities in all five cases, including retained history and observations.
3. Preserve the exact timestamp spellings and nanosecond boundary distinctions.
   Leave only the intentionally invalid timestamp/context invalid in negative
   cases. Do not change success expectations into structural errors merely to
   make the cases pass; that would discard their timestamp coverage.
4. Review stable vector identity and traceability, adding the requirements
   actually exercised. Apply the compatibility policy to the precise correction.
   Existing normative timestamp outcomes do not require new financial semantics.

**Resolution condition:** The three positive cases use valid Core 2.0 Approval
records, and each negative case can detect its intended precision defect without
an unrelated missing-identity failure satisfying the expectation.

## B2 Scoped association has no clear unrelated-history exception

[APPROVAL-DECISION-013](../spec/approvals/decisions.md) says that a Decision's
reference matches the Requirement context, identity, and subject at record and
evaluation boundaries, and that mismatched association uses
`FINKORE_APPROVAL_INVALID_DECISION`. The
[conformance definitions](../conformance/operations.md#approval-fixture-definitions)
likewise say that the reference equals the evaluated Requirement's scoped
identity and that cross-context or cross-subject history reuse is rejected.

Other current clauses retain a broader collection boundary:

- APPROVAL-DECISION-012 describes structurally validated Decisions identifying
  another Requirement, excludes them from the evaluated Requirement's
  eligibility checks, and says they do not affect its outcome.
- [APPROVAL-VALIDITY-013](../spec/approvals/validity.md) excludes unrelated
  Decisions from required expiration-context checks.
- The [Agentic registry's Approval scope notes](../agentic/operations.md#scope)
  still describe evaluated-Requirement eligibility as distinct from eligibility
  for another Requirement.

The specification does not clearly delimit the new exact-association rule for a
single Decision from its use on a supplied multi-Requirement history. Four
manifest-listed cases still expect `PENDING` from collections containing
different Requirement references:

| File | Vector |
| --- | --- |
| [decisions.json](../conformance/approvals/decisions.json) | `approval.requirement.wrong-association-001` |
| [validity.json](../conformance/approvals/validity.json) | `approval.validity.requirement-superseded-not-transferred-001` |
| [construction-evaluation-regressions.json](../conformance/approvals/construction-evaluation-regressions.json) | `approval.boundary096.excluded-context-unrelated-001` |
| [corrections-098.json](../conformance/approvals/corrections-098.json) | `approval.eligibility.unrelated-history-not-misclassified-001` |

These cases are not merely different Requirement IDs for the same subject.
Their migrated unrelated records also use synthetic `approval-subject`
references, whereas the evaluated Requirement names an `invoice` subject. For
example, `approval.requirement.wrong-association-001` evaluates `finance-review`
for invoice `inv-42`, but supplies `manager-review` for a different subject type
and identity in the same context. It expects `PENDING`, while the new boundary
says to reject mismatched association.

Two plausible interpretations now give different observations:

1. Require every supplied Decision to match the evaluated Requirement's scoped
   identity; the cases above are invalid Decision evidence.
2. Permit unrelated Requirement Decisions and filter them before association,
   eligibility, and expiration checks; the cases can remain pending, but the
   permitted history scope and rejection of foreign subjects need explicit rules.

**This behavior is not currently defined by FinKore Core** with sufficient
clarity at the boundary between exact scoped matching and unrelated collection
members. An implementation must not choose that boundary from a fixture or an
assumed first-match filter.

**Required follow-up:**

1. Specify the population a concrete Requirement evaluation may consume. State
   whether one history contains multiple Requirements, multiple subjects, or
   multiple approval contexts, and which of those combinations are invalid.
2. Distinguish validating history scope from selecting Decisions for the current
   Requirement. If unrelated Requirements are permitted within one subject and
   context, qualify exact Requirement matching accordingly; valid unrelated
   evidence must retain the existing limited eligibility/context treatment.
3. Repair synthetic subject associations in cases intended to represent valid
   history. Add separate controls for another Requirement on the same subject,
   a different subject with the same Requirement ID, a foreign context, and
   malformed unrelated evidence.
4. Review related Requirement-supersession histories and both record/import and
   evaluation guidance. Preserve complete structural validation of excluded
   evidence, and do not invent an absent Requirement registry.
5. Synchronize specification, fixture contracts, traceability, and Agentic scope
   notes after selecting semantics. Assess compatibility against the already
   tagged Core 2.0 contract; this review does not authorize changing existing
   requirement meanings under their IDs or moving the tag.

**Resolution condition:** The contract gives one reproducible success/error
classification for each permitted history population, and every listed case
follows that rule without allowing facts or bare IDs to substitute for subject
and context identity.

## C1 Context-priority case uses field instead of path

The case `entity.transition.invalid-context-before-target-validation-001` in
[context-errors.json](../conformance/entities/context-errors.json) declares:

```json
{"id":"positive","rule":"positive-money","field":"amount","states":["FINAL"]}
```

The bounded validator requires a nonempty `path`, as described under
[ENTITY-VALIDATION-009](../spec/entities/validation.md#validator-declarations)
and the [fixture contract](../conformance/operations.md#entity-fixture-definitions).
`field` is not the required `path` member. Consequently this is a malformed
validator declaration, rather than the supported target-State predicate the
description claims would reject the zero amount.

The request also supplies malformed `facts` and expects
`FINKORE_WORKFLOW_INVALID_CONTEXT`. This finding does not independently prove
that this error must lose to every malformed Entity declaration: the supplied
case introduces an additional failure category rather than isolating the
documented context-before-target-predicate order. It cannot establish the
claimed priority between malformed context and a well-formed rejecting rule.

**Required follow-up:** Use `path: "amount"` in this case and retain the zero
amount, target-State selector, malformed facts, and complete unchanged-state
observations. Keep malformed validator declarations in separate cases governed
by their own defined errors. If competing malformed-definition errors need an
additional priority rule, specify it before publishing expectations.

**Resolution condition:** This case contains a well-formed target-State rule and
can fail an implementation that evaluates that rule before malformed context.

## Checks and scope limits

The following checks passed on the reviewed tree with Node 24.15.0:

- Locked maintenance dependency installation with audit lookup disabled.
- `npm run verify`, including 30 maintenance-tool tests, documentation links,
  licensing checks, 447 requirement references, 1,818 vectors in 47 files, and
  20 canonical Agentic operations.
- `npm run release:check` on the actual checkout.
- A fresh network-backed `npm run dependencies:audit` query on 2026-10-04:
  zero reported vulnerabilities in the five installed maintenance dependencies.

A normalized exact-request inventory found no contradictory primary expected
results for byte-equivalent logical operation/input/context data after ignoring
JSON object member order. A limited high-confidence credential-pattern scan
across 196 reachable Git commits found no matching paths. That scan is not a
general guarantee against confidential data or every credential format.

The review followed current CoreDoc, affected normative requirements,
manifest-wide structural inventories and targeted acceptance cases, then
Agentic descriptions. It did not independently recalculate every financial
vector or execute a consumer implementation. Deferred banking domains remain
deliberate scope limits rather than new release blockers.

The passing gates validate structure, references, and publication content.
They do not prove that financial expectations follow the specification, which
is why B1 and B2 remain blockers despite those results. Fix the correct owning
layer, repeat applicable local and publication checks, and keep release/version
decisions distinct from repository visibility.
