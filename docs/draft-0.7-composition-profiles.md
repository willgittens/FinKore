# Draft 0.7 Composition Profiles

## Status

Non-normative Draft 0.7 reference profile design.

These profiles are application-policy examples used to exercise existing
FinKore Core behavior. They do not define new Core financial domains, portable
operations, tax rules, ledger postings, payment settlement, authorization,
legal finality, or production workflow policy.

## Classification Legend

| Label | Meaning |
| --- | --- |
| `CORE` | Existing normative FinKore Core behavior, cited by requirement ID. |
| `PROFILE` | Non-normative reference application policy for Draft 0.7 scenarios. |
| `OBSERVATION` | Harness or scenario observation of specified behavior; not a financial rule. |
| `FINDING` | Unresolved issue that must not be encoded as expected behavior until resolved. |

## Shared Scenario Conventions

All scenario inputs are deterministic. Times, actor IDs, entity IDs, revision
IDs, relation IDs, audit event IDs, workflow definition versions, workflow
instance revisions, and Money rounding/allocation policy are supplied by the
fixture or caller. No scenario may use wall-clock time, host locale, external
services, network calls, generated IDs, or filesystem enumeration order as a
source of financial meaning.

Existing Core requirements used across both profiles include:

- `CORE-001` for monetary integrity.
- `CORE-002.3` for rejected actions without partial financial effect.
- `CORE-003` for financial history and evolution.
- `CORE-004` for approval integrity.
- `CORE-005` for stable identity and determinable financial meaning.
- `MONEY-ARITHMETIC-*`, `MONEY-ROUNDING-*`, `MONEY-ALLOCATION-*`, and
  `MONEY-CURRENCY-*` for exact Money behavior.
- `WORKFLOW-TRANSITION-*`, `WORKFLOW-GUARD-*`, `WORKFLOW-CONFLICT-*`, and
  `WORKFLOW-VERSION-*` for lifecycle movement.
- `APPROVAL-VALIDITY-*`, `APPROVAL-COMPOSITION-*`, and `APPROVAL-QUORUM-*`
  for current approval evaluation.
- `ENTITY-IDENTITY-*`, `ENTITY-LIFECYCLE-*`, `ENTITY-MUTABILITY-*`,
  `ENTITY-VALIDATION-*`, `ENTITY-REVISION-*`, and `ENTITY-EVOLUTION-*` for
  Entity observations and evolution.
- `AUDIT-EVENT-*`, `AUDIT-APPEND-*`, `AUDIT-CHANGE-*`, and
  `AUDIT-RELATIONSHIP-*` for required evidence and history preservation.

## Expense Approval Profile

### Purpose

Exercise submission and approval of a simple reimbursable expense through
Money calculation, allocation, Workflow transition, Approval composition,
Entity mutation/transition, and Audit-required evidence.

### Entity Shape

Profile policy defines an Entity type `expense`.

| Field | Type | Classification | Rule |
| --- | --- | --- | --- |
| `employeeId` | opaque string | `PROFILE` | Required at creation and immutable after submission. |
| `merchant` | string | `PROFILE` | Required at creation; mutable only in `DRAFT`. |
| `category` | string enum | `PROFILE` | One of `TRAVEL`, `MEALS`, `SUPPLIES`; mutable only in `DRAFT`. |
| `lineItems` | ordered list of Money values | `PROFILE` plus `CORE` Money | Nonempty, all values use the reimbursement currency, mutable only in `DRAFT`. |
| `tax` | Money | `PROFILE` plus `CORE` Money | Explicit supplied amount; no tax calculation rule is implied. |
| `total` | Money | `PROFILE` plus `CORE` Money | Must equal exact sum of `lineItems` plus `tax`. |
| `departmentAllocations` | ordered list of Money values | `PROFILE` plus `CORE` allocation | Derived by explicit ratio allocation policy below. |
| `submittedAt` | timestamp | `PROFILE` | Required for submission; caller supplied. |
| `memo` | string | `PROFILE` | Mutable in `DRAFT` and `SUBMITTED`; non-financial note. |

### Lifecycle

Profile policy defines workflow states `DRAFT`, `SUBMITTED`, `APPROVED`,
`REJECTED`, and `PAID`. `APPROVED`, `REJECTED`, and `PAID` are terminal for
this profile only. State names do not imply universal financial finality or
authorization.

| Transition | Classification | Rule |
| --- | --- | --- |
| `DRAFT` to `SUBMITTED` | `PROFILE` plus `CORE` Workflow | Requires exact total validation, allocation validation, submitted timestamp, and required Audit evidence. |
| `SUBMITTED` to `APPROVED` | `PROFILE` plus `CORE` Approval/Workflow | Requires current approval composition outcome `APPROVED`, matching expected state, matching expected workflow instance revision, and required Audit evidence. |
| `SUBMITTED` to `REJECTED` | `PROFILE` plus `CORE` Approval/Workflow | Allowed when current approval composition outcome is `REJECTED`; required Audit evidence records the rejection observation. |
| `APPROVED` to `PAID` | `PROFILE` | Out of Draft 0.7 scenario scope except as a rejected terminal-state boundary. |

### Money Policy

The reimbursement currency is supplied as an ISO 4217 code. Draft 0.7 fixtures
use `USD`.

Total calculation uses exact Money addition. Incompatible currencies fail under
`MONEY-CURRENCY-003`, `MONEY-CURRENCY-004`, and `MONEY-ERROR-003`.

Department allocation uses ratio allocation with explicit target scale `2`,
declared ratio order `[70, 30]`, and `HALF_EVEN` only where a separate explicit
rounding operation is requested. Allocation itself must conserve source value
under `MONEY-ALLOCATION-008` and assign remainders by declared order under
`MONEY-ALLOCATION-010`.

### Approval Policy

Approval subject facts are:

- `expenseId`;
- `entityRevision`;
- `total.amount`;
- `total.currency`;
- `category`; and
- `employeeId`.

Profile policy defines these requirements:

| Requirement | Classification | Rule |
| --- | --- | --- |
| `manager-review` | `PROFILE` plus `CORE` Approval | Applicable for every submitted expense; approved by an eligible manager Decision. |
| `finance-review` | `PROFILE` plus `CORE` Approval | Applicable when `total` is greater than `1000.00 USD` or category is `TRAVEL`. |
| `executive-quorum` | `PROFILE` plus `CORE` Approval | Two-of-three quorum, applicable when `total` is greater than or equal to `10000.00 USD`. |

The composition is staged: stage 1 requires `manager-review`; stage 2 contains
parallel `finance-review` and `executive-quorum`, each of which may be
explicitly inapplicable. Explicitly no-obligation approval outcomes remain
distinguishable from committed approving Decisions under
`APPROVAL-COMPOSITION-022`.

### Audit Policy

The profile requires Audit Events for submission, approval transition, rejection
transition, and any correction relation introduced by later scenarios. Event,
relationship, and actor identities are supplied explicitly. Audit evidence may
record safe field paths and Money values required to preserve financial
meaning, but diagnostics must not expose unrelated sensitive values.

## Invoice Correction Profile

### Purpose

Exercise correction of an issued invoice-shaped Entity without rewriting source
facts. The profile uses existing Entity evolution, Audit relationships,
Approval validity, Money exactness, and Workflow conflict behavior.

### Entity Shape

Profile policy defines an Entity type `invoice`.

| Field | Type | Classification | Rule |
| --- | --- | --- | --- |
| `customerId` | opaque string | `PROFILE` | Required and immutable after `ISSUED`. |
| `lineItems` | ordered list of Money values | `PROFILE` plus `CORE` Money | Required and immutable after `ISSUED`. |
| `tax` | Money | `PROFILE` plus `CORE` Money | Caller supplied; no jurisdictional tax rule is implied. |
| `total` | Money | `PROFILE` plus `CORE` Money | Exact sum of line items plus tax. |
| `invoiceNumber` | opaque display string | `PROFILE` | Not stable Entity identity. |
| `sourceRevision` | revision identity | `PROFILE` plus `CORE` Entity | Caller supplied and distinct from Entity identity. |
| `correctionReason` | string | `PROFILE` | Required for correction requests. |

### Lifecycle

Profile policy defines workflow states `DRAFT`, `ISSUED`, `CORRECTED`, and
`VOIDED`. `ISSUED` invoices are correction-eligible only when profile policy
declares them eligible and the expected source revision/currentness
preconditions match. State names do not by themselves establish eligibility
under `ENTITY-EVOLUTION-006`.

### Correction Policy

A correction request references one source invoice and one related corrected
revision or corrected invoice Entity. The source's original Money values,
identity, lifecycle state, revision identity, and Audit history remain
observable. The corrected related value carries corrected financial facts.

The correction relation, Audit Event, and Audit Relationship identifiers are
caller supplied. Duplicate relation IDs are rejected under
`ENTITY-EVOLUTION-014`; stale source preconditions are rejected under
`ENTITY-EVOLUTION-025`; invalid or mismatched Audit evidence retains the
primary Audit error under `ENTITY-EVOLUTION-027` and `ENTITY-EVOLUTION-033`.

Correction does not imply reversal, supersession, payment cancellation, ledger
posting, currentness migration, or customer notification.

### Approval Policy

Approval subject facts for correction evaluation are:

- `invoiceId`;
- `sourceRevision`;
- `correctedRevision`;
- `correctedTotal.amount`;
- `correctedTotal.currency`; and
- `correctionReason`.

Profile policy defines:

| Requirement | Classification | Rule |
| --- | --- | --- |
| `accounts-receivable-review` | `PROFILE` plus `CORE` Approval | Applicable for every correction. |
| `controller-review` | `PROFILE` plus `CORE` Approval | Applicable when absolute total delta is greater than `500.00 USD`. |
| `customer-impact-review` | `PROFILE` plus `CORE` Approval | Explicitly inapplicable when total and customer identity are unchanged. |

Existing Approval Decisions are re-evaluated against explicitly supplied
corrected facts or revision context. The profile never synthesizes a new
approving Decision.

### Audit Policy

Correction success requires an Audit Event with relationship type `CORRECTS`
targeting the original invoice Audit Event. Invalid relationship type, unknown
target, duplicate relationship identity, or target Entity mismatch rejects the
correction without exposing a correction relation or success result.

## Capability Limits

The profiles intentionally do not define:

- authorization or actor directory lookup;
- tax, FX, payments, settlement, or ledger effects;
- automatic ID, revision, or timestamp generation;
- database transactions, locks, retries, or crash recovery;
- global ordering beyond declared fixture order and Audit relationship content;
- dynamic approver resolution, delegation, escalation, or unbounded approval
  graphs; or
- post-finalization metadata policy beyond the declared profile fields.
