# FinKore Release Notes

This is the complete release history kept in the working tree. Precise financial
behavior belongs to `/spec`; detailed change history remains available in Git.

Entries before the 0.9.8 repository transition describe historical snapshots
that included maintained implementations, a Conformance Runner, package
artifacts, and their verification results. Those records are preserved as
history and are not claims about the current repository's supported surface or
current execution evidence.

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
