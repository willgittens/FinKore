# FinKore Core Draft 0.3 Release Notes

**Status:** Closed

## Purpose

Draft 0.3 added bounded orchestration, version/conflict safety, and import/revision
semantics while explicitly researching—and deferring—broader portability and
policy topics that were not ready for normative standardization.

## Added

### Approval Composition

- Bounded `ALL_OF`, `ANY_OF`, and `N_OF_M` groups.
- Explicit quorum voters and fixed membership/threshold semantics.
- Ordered stages, bounded nesting, applicability, current-effective evidence,
  opposing-vote handling, actionable requirements, complete validation, and
  deterministic error precedence.

Approval lifecycle and composition labels remain conformance-local rather than
canonical Agentic operations.

### Workflow Versioning, Import, and Conflicts

- Workflow definition and version identity.
- Immutable instance binding and version-mismatch rejection.
- Import of existing state/version observations.
- Expected-current-state and expected-instance-revision conflict preconditions.
- Alignment of canonical `finkore.workflow.transition` metadata.

Workflow import remains conformance-local. Migration, state mapping across
versions, persistence locking, and distributed concurrency remain outside Core.

### Entity Revision and Import

- Business revision identity distinct from stable Entity identity and storage or
  conflict versions.
- Source identity mapping and import of current/historical observations.
- Expected-state, expected-revision, and expected-conflict-version preconditions.

Entity import remains conformance-local. No global registry or concrete migration
format was introduced.

## Research dispositions

Draft 0.3 deliberately made no normative expansion for:

- decimal precision floors, overflow/capability reporting, currency minor-unit
  metadata, or private/non-fiat currency namespaces;
- standardized Audit reason, source, correlation, causation, or trace-context
  provenance; or
- a portable condition expression/operator language.

The existing explicit-fact Approval condition boundary remains in force. These
topics are deferred rather than implemented or silently resolved.

## Verification at closure

- 381 normative clauses: 312 covered and 69 not directly testable.
- 0 partial, uncovered, deferred, or blocking specification-gap rows within the
  selected closed scope.
- 244/244 manifest-listed vectors passed, including 217 mutation-sensitive
  vectors.
- TypeScript core mutation score: 98.28% aggregate and 98.40% covered, with zero
  critical surviving mutants after classification.
- Runner mutation score: 99.73%, with one noncritical diagnostic-string survivor.
- Workspace build, strict typecheck, unit tests, coverage, license, architecture,
  portable-error, operation-registry, Agentic, public API/JSDoc, and documentation
  gates passed at closure.

## Review status

Required scoped maintainer review and domain/accounting/technical/security/privacy
analysis were recorded during development. No independent or community review is
claimed; the affected Draft 0.3 artifacts remain **NOT EXTERNALLY REVIEWED**.

## Explicit exclusions

Draft 0.3 did not add Workflow migration, delegation, escalation, dynamic
approver resolution, IAM/RBAC, persistence, unrestricted workflow/approval
graphs, new accounting domains, or a complete second-language implementation.
