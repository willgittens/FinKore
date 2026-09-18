# Draft 0.7 Composition Observation Contract

## Status

Non-normative Milestone B decision record for the Draft 0.7 reference
composition profiles.

This document resolves the Milestone A scenario questions as reference
application policy unless a statement explicitly cites existing FinKore Core
requirements. It does not add portable errors, canonical operation IDs,
normative conformance vectors, or Core financial behavior.

## Milestone B Decisions

| Decision | Classification | Resolution |
| --- | --- | --- |
| Approval-gated profile actions | `PROFILE` | A profile action that requires current approval first evaluates the declared Approval composition. If the result is not currently approving, the profile action rejects with a profile-local failure code and does not invoke or publish the candidate Workflow transition or Entity evolution. No `FINKORE_*` portable error is invented for this application gate. |
| Late Audit failure | `PROFILE` plus `CORE` | Reference orchestration treats required Audit evidence as inside the profile action boundary. If required Audit append or relationship validation fails, the profile action rejects and preserves all previously committed history. When the underlying failure is an existing Core Audit or Entity evolution failure, the scenario records the existing `FINKORE_*` code as the primary portable failure. |
| Invoice correction observation | `CORE` plus `PROFILE` | Draft 0.7 invoice correction uses Entity evolution correction plus required Audit evidence as the portable observation. A lifecycle transition to `CORRECTED` is not required for Milestone B fixtures. A later profile may add it only as separate profile policy. |
| Normative specification changes | `CORE` | No new Core requirement, portable error, canonical operation, or conformance vector is required for the Milestone B reference contract. Existing requirements are sufficient for the bounded examples when profile policy is kept outside Core. |
| Reference fixture location | `OBSERVATION` | Language-independent reference fixtures live under `examples/composition/draft-0.7/` and are not referenced from `conformance/manifest.json`. They are scenario inputs and expected reference observations, not a Core conformance profile. |

## Action Boundaries

### Expense Submission

Boundary: validate the profile expense payload, perform exact Money total and
allocation checks, create the candidate submitted Entity observation, and append
the required submission Audit Event.

Success observation:

- Entity identity is unchanged.
- Lifecycle state is `SUBMITTED`.
- Money totals and department allocations match exact Core Money semantics.
- The submission Audit Event is appended after prior history.

Failure observation:

- Existing Entity, Money source values, Workflow observation, Approval history,
  and Audit history remain unchanged.
- A failed Money validation exposes the existing Money portable error where the
  failure is a Core Money operation.
- A failed Audit append exposes the existing Audit portable error where the
  failure is the primary Core failure.

### Expense Approval Transition

Boundary: evaluate the declared Approval composition against supplied current
facts and context, validate expected Workflow state and revision, create the
candidate approved Entity observation, and append the required approval Audit
Event.

Previously committed Approval Decisions are outside this boundary. A rejected
transition must not delete or rewrite them.

Success observation:

- Entity identity is unchanged.
- Lifecycle state is `APPROVED`.
- Approval history remains append-only and distinguishable from inapplicable
  no-obligation requirements.
- The approval Audit Event is appended.

Failure observation:

- Pending, rejected, stale, expired, withdrawn, superseded, or unresolved
  approval evidence causes a profile-local approval-gate failure before a
  candidate transition is published.
- Expected-state or expected-revision mismatch exposes
  `FINKORE_WORKFLOW_STATE_CONFLICT`.
- Late Audit failure preserves the pre-action Entity and committed Approval and
  Audit histories.

### Invoice Correction

Boundary: evaluate the declared correction approval policy, validate source
eligibility and expected source preconditions, record the Entity evolution
correction relation, and produce required Audit evidence with a `CORRECTS`
relationship.

Previously committed invoice source facts, Approval Decisions, and prior Audit
Events are outside this boundary.

Success observation:

- Source invoice identity, original financial facts, source revision, and prior
  Audit history remain observable.
- The corrected related Entity or Revision carries corrected financial facts.
- The correction relation and required Audit evidence identify supplied
  relation, event, relationship, source, and related identities.

Failure observation:

- Ineligible source correction exposes `FINKORE_ENTITY_INVALID_MUTATION`.
- Stale source preconditions expose `FINKORE_ENTITY_STATE_CONFLICT`.
- Invalid source or related identity exposes `FINKORE_ENTITY_INVALID_IDENTITY`.
- Invalid required Audit evidence exposes the primary existing Audit error and
  prevents the correction relation, currentness change, and success result from
  becoming observable.
- Profile-local approval-gate failure does not synthesize a new Approval
  Decision and does not publish candidate correction output.

## Error Precedence

Within reference profile orchestration, validate in this order:

1. Scenario fixture structure and profile policy inputs.
2. Approval gate, when the profile action declares one.
3. Existing Core preconditions for the selected Money, Workflow, Entity, or
   Audit operation.
4. Required Audit evidence that is part of the action boundary.

This order is reference application policy. It is not a universal FinKore Core
precedence rule. Existing Core operations keep their own primary-error rules:
Workflow conflicts use Workflow errors, Entity evolution retains primary
Workflow/Money/Approval/Audit failures when those are the primary failure, and
Audit relationship failures use existing Audit errors.

Profile-local failure codes are scoped to the reference fixtures and are never
portable `FINKORE_*` error codes:

| Code | Meaning |
| --- | --- |
| `D07_PROFILE_APPROVAL_NOT_CURRENT` | The profile required current approval, but the supplied Approval evaluation was pending, rejected, stale, expired, withdrawn, superseded, unresolved, or otherwise not currently approving. |
| `D07_PROFILE_POLICY_INVALID` | The fixture violates declared profile policy before a Core operation is selected. |

## Specification and Agentic Review

Milestone B requires no `/spec` change because:

- Money calculation, rounding, allocation, and currency errors are already
  defined by existing Money requirements.
- Workflow version binding, guards, terminal behavior, and expected-state or
  expected-revision conflicts are already defined.
- Approval current effectiveness, staged composition, no-obligation outcomes,
  and quorum semantics are already defined.
- Entity evolution correction, stale source preconditions, preserved source
  facts, and required Audit atomicity are already defined.
- Audit append-only behavior and relationship validation are already defined.

Milestone B requires no `/agentic` change because Draft 0.7 reference scenarios
do not introduce new canonical operations. Scenario names use `D07-*` fixture
identifiers, not `finkore.*` operation IDs.

Milestone B requires no normative `/conformance` vector additions. The scenario
fixtures are reference application evidence and remain outside
`conformance/manifest.json`.

## Execution Contract

Reference scenario implementations will live under language-specific
`examples/composition/draft-0.7/` directories when Milestone C begins:

```text
implementations/
  typescript/examples/composition/draft-0.7/
  python/examples/composition/draft-0.7/
  java/examples/composition/draft-0.7/
```

Shared inputs live under:

```text
examples/composition/draft-0.7/
```

Each language implementation must:

- read the same scenario fixture identifiers and deterministic policy inputs;
- call real language Core APIs rather than runner or adapter shortcuts;
- return the same portable observation shape for comparison;
- keep profile policy outside Core packages and outside conformance adapters;
- preserve previously committed Approval Decisions and Audit Events on failure;
- distinguish profile-local rejection codes from portable `FINKORE_*` errors;
  and
- report unsupported reference scenarios separately from Core conformance.

## Fixture Status

Milestone B added the reference fixture contract and fixture inputs. Milestone C
adds language scenario runners in TypeScript, Python, and Java, so the fixtures
now carry `implementationStatus: "implemented"` for the reference application
scenario set.

This status means only that the non-normative examples execute the shared
scenarios through real Core APIs. It is not a Core conformance profile or a
Draft 0.7 release-closure claim.
