# FinKore Release Notes

This is the complete release history kept in the working tree. Precise financial
behavior belongs to `/spec`; detailed change history remains available in Git.

Entries before the 0.9.8 repository transition describe historical snapshots
that included maintained implementations, a Conformance Runner, package
artifacts, and their verification results. Those records are preserved as
history and are not claims about the current repository's supported surface or
current execution evidence.

## Unreleased

Clarifies the existing Core 2.0 Approval history boundary as a patch-compatible
correction, provisionally Core 2.0.1. One immutable approval context and exact
subject may contain Decisions for several Requirement identities. Every member
is structurally validated; exact Requirement identity selects eligibility,
effectiveness, and outcome evidence. Foreign-context or foreign-subject evidence
remains `FINKORE_APPROVAL_INVALID_DECISION`, and unrelated same-scope evidence
does not acquire the evaluated Requirement's eligibility or expiration-context
rules. Required input shape, success results, portable errors, history
preservation, and failure atomicity are unchanged.

Consumers need no history rewrite or evidence relabeling. They must preserve one
context-and-subject scope through record, evaluation, lifecycle mutation, and
reuse; validate excluded evidence; and keep Decision identity unique across all
Requirements in that context.

## FinKore Core 2.0 — 2026-10-04

Incompatible major release completing the financial-contract remediation with
order-independent rejection precedence for standalone Approval Requirements,
scoped Requirement and Decision identities, explicit Audit redaction source and
evidence linkage, and a defined malformed Entity guard-context failure. The
existing `finkore.entity.transition` operation follows its documented major-
version supersession path; no alias, runner, transport, implementation, or
package surface is added.

The contract contains 447 requirements, 1,818 vectors in 47 files, and 20
canonical Agentic operations. It adds `APPROVAL-REQUIREMENT-008`,
`APPROVAL-DECISION-013`, `APPROVAL-DECISION-014`, `APPROVAL-VALIDITY-017`,
`AUDIT-REDACTION-009`, `AUDIT-REDACTION-010`, `ENTITY-LIFECYCLE-009`, and
`WORKFLOW-ERROR-008`, plus the portable
`FINKORE_WORKFLOW_INVALID_CONTEXT` error. Conformance manifest and vector-file
formats remain `0.1`; the private maintenance package remains `0.1.0`.

Consumers migrating retained Approval data must provide an explicit, reviewable
mapping to scoped identities without rewriting or merging historical Decisions.
Ambiguous legacy lifecycle references require consumer resolution. Redaction
requests now select exactly one committed source Event and supply matching
evidence metadata. Supplied null, array, or scalar Entity transition facts now
fail with the new invalid-context error at the documented priority.

This release retires thirteen Core 1.x Approval vectors whose outcomes
depended on Actor/timestamp tuple addressing:
`approval.boundary096.history-evaluate-ambiguous-target-001`,
`approval.boundary096.history-record-ambiguous-target-001`,
`approval.boundary096.history-offset-control-001`,
`approval.boundary096.record-history-offset-control-001`,
`approval.boundary096.history-offset-ambiguous-001`,
`approval.boundary096.supersession-offset-self-001`,
`approval.withdraw.target-ambiguous-001`,
`approval.boundary097.record-withdrawal-same-001`,
`approval.boundary097.record-withdrawal-offset-001`,
`approval.boundary097.record-supersession-target-same-001`,
`approval.boundary097.record-supersession-target-offset-001`,
`approval.boundary097.record-supersession-successor-same-001`, and
`approval.boundary097.record-supersession-successor-offset-001`. Their
definitions remain in Git history and their identifiers are not
reusable. Scoped Decision-ID cases replace their coverage without rewriting
retained Approval evidence.

Locked installation and local verification pass on Node 24.15.0, including 30
maintenance-tool tests and both the disposable-tree and final-tree publication
gates. A fresh npm registry advisory query on 2026-10-04 reported zero
vulnerabilities in the five-package locked maintenance dependency graph. These
checks validate repository artifacts, not financial execution or external
implementation conformance.

## FinKore Core 1.1 — 2026-10-03

Compatible minor release completing explicit rounded Money division and Entity
guard-fact/target-State validation, with stronger Approval subject-binding
guidance, conformance-case applicability, and failure-atomicity observations.
The contract contains 439 requirements, 1,808 vectors in 44 files, and 20
canonical Agentic operations. Three requirement IDs and 18 vectors are added;
no published requirement, vector, portable error, or operation identifier is
renamed or retired.

Consumers claiming the complete release must include the added cases, honor the
two declared conditional-case rules, support the optional Entity facts and
Money division policy inputs, and compare the completed post-state observations.
Omission preserves earlier operation meanings. Existing domain records require
no rewrite, no Agentic operation is superseded, and conformance formats remain
`0.1`. Stronger Approval identity, redaction targeting, standalone conflict
aggregation, and malformed Entity-context outcomes remain outside this release.

Locked installation and local verification pass on Node 24.15.0, including 30
maintenance-tool tests and the plan-free publication gate. A fresh npm registry
advisory query on 2026-10-03 reported zero vulnerabilities in the five-package
locked maintenance dependency graph. These checks validate repository artifacts,
not financial execution or external implementation conformance.

## FinKore Core 1.0 — 2026-10-03

First stable language-neutral baseline for Money, Workflow, Audit, Approvals,
and Financial Entities, with 436 requirements, 1,790 conformance vectors, and
20 canonical Agentic operations. The accepted candidate's financial behavior is
preserved; no consumer behavior migration is required. Compatibility protects
requirement identities, portable errors, operation contracts, and normative
serializations. Manifest and vector-file formats remain `0.1`. Implementations,
runners, transports, ledger posting, and other deferred domains remain outside
the release.

Locked installation and local verification pass on Node 24.15.0, including
28 maintenance-tool tests and the final publication gate. A fresh npm registry
advisory query on 2026-10-03 reported zero vulnerabilities in the locked
maintenance dependency graph. These checks validate repository artifacts, not
financial execution or external implementation conformance. The stable tree
contains no working plans; detailed development history remains in Git.

Retired SPEC-FREEZE-001, SPEC-FREEZE-002, SPEC-FREEZE-003, and SPEC-FREEZE-004
from the active specification; their temporary Core 0.9 release-candidate
applicability has ended. Their original definitions remain in Git history and
their identifiers remain unavailable for reuse under SPEC-REQUIREMENT-004.
Lasting compatibility and financial obligations are unchanged; coordinated
artifact updates follow contributor guidance.

## FinKore Core 0.9.7 Release Candidate

Corrected complete Approval composition and history validation, explicit quorum
evidence, fact selection and exact equality, native value ownership, and
Workflow/Entity declaration and malformed-input handling. Defined optional
redaction policy identity, presence-preserving Audit Event metadata, supported
Entity native values, and explicit empty history in successful Entity imports.
These compatibility corrections reject previously accepted unsupported inputs
and add the empty import-history field to Python/Java results. Permanent
regressions protect earlier corrections. The annotated `core-0.9.7` tag is local;
Core remains `0.9-rc`, package versions `0.1.0`, and conformance syntax `0.1`.
Reference packages remain unpublished; stable 1.0 promotion is separate.

## FinKore Core 0.9.6 Release Candidate

Corrected native Money and Workflow construction, concrete Approval evaluation,
complete context and lifecycle-history validation, Audit redaction authority,
and Workflow/Entity input presence and error priority. Defined bounded concrete
Decision evaluation, complete considered-evidence validation, committed lifecycle
relationships, and standalone Entity import mappings. Corrected supplied revision
currentness and malformed composition Decision containers. Permanent regressions
and mutation controls protect these boundaries. The Core label remains `0.9-rc`,
package versions remain `0.1.0`, and conformance syntax remains `0.1`. Reference
packages remain unpublished; no new domain or stable 1.0 declaration is included.

## FinKore Core 0.9.5 Release Candidate

Corrected exact Money serialization and portable failures; Workflow instance
binding ownership and supplied preconditions; concrete Approval association,
eligibility, and reused-history validation; native Audit cycles and value
ownership; and Entity binding retention, declaration validation, and import
identity handling. Defined retained Entity declaration ownership and malformed
validator rejection, and clarified the bounded revision/conflict contract.
Permanent native sequences and paired regression/control mutation checks protect
these corrections. The Core label remains `0.9-rc`, package versions remain
`0.1.0`, and conformance syntax remains `0.1`. Reference packages remain
unpublished; no new domain or stable 1.0 declaration is included.

## FinKore Core 0.9.4 Release Candidate

Corrected Approval lifecycle preservation, request validation, and effective
quorum evidence; Entity evolution history, currentness, business validation,
and Audit correspondence; Workflow definition ownership and guard/version
fixtures; and Audit preservation of arbitrary JSON member names. Clarified
Audit validation precedence and contradictory evolution history through
`ENTITY-EVOLUTION-034` and `ENTITY-EVOLUTION-035`. Permanent sequence, ownership,
and paired regression/control tests protect these corrections. The Core label
remains `0.9-rc`; package versions and repository-reference publication status
are unchanged. No new financial domain or stable 1.0 declaration is included.

## FinKore Core 0.9.3 Release Candidate

Corrected Entity import validation, recursive Workflow guard comparison, Audit
Actor validation and metadata presence, and Audit ordinary JSON and declared
Money comparison across TypeScript, Python, and Java. Added permanent
regressions and mutation protection for those portability boundaries, including
the existing cross-field Entity validation cases. Clarified that Audit redaction
representations are implementation-defined and that conformance markers do not
prescribe production encoding. The frozen Core 0.9 behavioral baseline and
repository-reference publication status are unchanged.

## FinKore Core 0.9.2 Release Candidate

Corrected Python Money subtraction, negation, and allocation to preserve exact
amounts independently of the caller's Decimal context. Approval fact comparison
now distinguishes Booleans from numbers, including nested values, so changed
relevant facts invalidate prior decisions while preserving history. Permanent
regressions and stricter mutation verification protect both corrections. The
frozen Core 0.9 contract and repository-reference publication status are unchanged.

## FinKore Core 0.9.1 Release Candidate

Corrected the frozen Core 0.9 candidate by defining one strict portable
timestamp profile with exact nanosecond comparison, bounding JSON-number Money
allocation integers to a cross-language domain, and completing Audit actor
error precedence and requirement traceability. No domain or planned 1.0
behavior was added.

## FinKore Core 0.9 Release Candidate

Froze the Money, Workflow, Audit, Approvals, and Financial Entities behavioral
candidate intended to become FinKore Core 1.0. Existing requirement IDs,
portable error codes, canonical operation IDs, and normative serialization
shapes are frozen; future normative changes before 1.0 are limited to correcting
demonstrated contradictions, ambiguities, or portability defects.

## FinKore Core 0.8

Unified the Money, Workflow, Audit, Approvals, and Financial Entities baseline
as FinKore Core 0.8, with explicit compatibility, conformance-claim, and
Agentic Contract boundaries.

## Draft 0.7

Removed the non-normative composition proof and simplified repository governance,
documentation, developer tooling, and local verification. No financial domain
was removed.

## Draft 0.6

Hardened exact Money behavior at large precision and scale boundaries and brought
the TypeScript, Python, and Java implementations to the same manifest scope.

## Draft 0.5

Added independent Python and Java implementations and their conformance adapters.

## Draft 0.4

Introduced CoreDoc and stabilized the existing specification baseline for
cross-language implementation.

## Draft 0.3

Added bounded Approval composition, Workflow version and conflict behavior, and
Entity revision and import behavior.

## Draft 0.2

Added Money Rates and Allocation, Audit Relationships, Entity Evolution, and
Approval Validity.

## Draft 0.1

Established the Money, Workflow, Audit, Approvals, and Entities domains.
