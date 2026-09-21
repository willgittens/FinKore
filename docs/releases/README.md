# FinKore Release Notes

This is the complete release history kept in the working tree. Precise financial
behavior belongs to `/spec`; detailed change history remains available in Git.

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
