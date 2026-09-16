# FinKore Core Draft 0.6 Release Notes

## Status

Draft 0.6 is in progress. Milestone A is complete; Milestones B through E are
pending. This document is an opening record and does not make a Draft 0.6
conformance, compatibility, capability-floor, immutable-tag, or release-closure
claim.

## Target Scope

Draft 0.6 hardens portability and compatibility for the existing Money,
Workflow, Audit, Approvals, and Entities scope. It targets:

- an evidence-backed portable capability floor;
- version compatibility and deprecation rules;
- full, domain, operation, and version-specific conformance profiles;
- implementation capability declarations distinct from conformance claims;
- automated identifier, traceability, registry, error, and metadata drift
  detection; and
- reproducible release identity, checksums, and an approved immutable tag.

It does not add a financial domain, complete Java non-Money domains, create the
Draft 0.8 Agentic operation manifest, publish packages, or claim production or
external-review status.

## Opening Baseline

The opening source revision is
`67298ec6582574c05175ef335d220eb861bd0f8f`. The exact worktree qualification,
artifact versions, inventory, and toolchains are recorded in
[Draft 0.6 Portability and Compatibility Governance](../draft-0.6-portability-compatibility-governance.md).

| Inventory item | Opening value |
| --- | ---: |
| Indexed requirements | 381 |
| Manifest-listed suites | 5 |
| Manifest-listed vector files | 16 |
| Manifest-listed vectors | 244 |
| Money vectors | 83 |
| Manifest operation labels | 35 |
| Canonical Agentic operations | 20 |
| Conformance-local operation labels | 15 |
| Mutation-sensitive vectors | 217 |
| Portable error codes | 31 |

Manifest and vector-file formats remain `0.1`. The runner, TypeScript core,
TypeScript adapter, Python core, and Java core remain independently versioned at
`0.1.0`.

## Finding and Decision Register

| Finding | Classification | Status | Owner | Affected artifacts | Release or claim effect | Evidence | Resolution | Maintainer acceptance |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `D06-EDITORIAL-240-001` | `EDITORIAL` | RESOLVED | Documentation maintainers | Live CoreDoc/spec/conformance/onboarding/implementation navigation and status wording | None; no semantic or claim change | TASK-240 freshness inventory | Current documentation updated to distinguish closed Draft 0.5 implementation results from historical Draft 0.4 statements | Accepted with Milestone A |
| `D06-PORT-241-001` | `PORTABILITY BLOCKER` | OPEN | Money maintainers | Python Money arithmetic/rounding, capability-floor decision, boundary corpus | Blocks any Python claim covering observed values, TASK-242 acceptance, and Draft 0.6 closure; does not alter the closed 244-vector claim | Five documented corpus differences in `docs/research/draft-0.6-boundary-evidence.md` | Pending TASK-242 decision and later spec-first remediation | Pending |

### D06-PORT-241-001 analysis

- **Minimal reproduction:** execute the five corpus cases that cite the finding
  with `npm run research:boundaries:draft0.6`.
- **Observed revision:** opening source revision
  `67298ec6582574c05175ef335d220eb861bd0f8f` plus the Milestone A research
  corpus and runner recorded by this change.
- **Observed behavior:** Python uses the ambient 28-digit decimal context for
  large addition, subtraction, multiplication, and Rate results, producing
  silently reduced values; scale-50 quantization escapes as
  `decimal.InvalidOperation`. TypeScript and Java return matching exact results.
- **Affected stable identifiers:** `SPEC-DECIMAL-001`,
  `MONEY-REPRESENTATION-002`, `MONEY-REPRESENTATION-006`,
  `MONEY-ARITHMETIC-004`, `MONEY-ARITHMETIC-007`,
  `MONEY-ARITHMETIC-008`, `MONEY-RATE-002`, `MONEY-RATE-003`,
  `MONEY-RATE-005`, and `MONEY-ROUNDING-001` through
  `MONEY-ROUNDING-004`. The affected canonical operations are
  `finkore.money.add`, `finkore.money.subtract`, `finkore.money.multiply`,
  `finkore.money.applyrate`, and `finkore.money.round`. No portable error,
  conformance vector, profile, or format identifier is assigned by Milestone A.
- **Alternatives reserved for TASK-242:** define and implement a portable floor;
  use context-independent exact arithmetic inside Python; define capability
  discovery above the floor; decide whether a specified out-of-capability
  operation outcome needs new normative semantics.
- **Compatibility impact:** current manifest evidence is unchanged. Any chosen
  floor or error behavior may affect future claims and must be analyzed before
  acceptance.
- **Domain/accounting impact:** silent loss of significant digits is
  unacceptable for exact Money behavior. No accounting policy or new financial
  domain is introduced.
- **Security/resource impact:** unbounded input cannot be assumed safe; the
  floor decision must balance exactness with memory/CPU denial-of-service risk.
- **Privacy impact:** none identified; corpus values contain no personal data.

## Milestone A Deliverables

- `npm run baseline:draft0.6` validates opening counts, formats, and package
  versions.
- The governance record defines authority, finding, and research rules.
- The compatibility-surface inventory assigns authority, risk, ownership, and
  disposition to current artifacts and deferred boundaries.
- The non-normative boundary corpus covers 19 cases and 49 executions.
- The boundary evidence records 14 matching cases and five differences assigned
  to `D06-PORT-241-001`.

## Verification Status

The Milestone A opening quality matrix is complete. Draft 0.6 closure
verification remains pending.

| Check | Milestone A result |
| --- | --- |
| Toolchain check | PASS; CPython 3.12/3.13, JDK 21, and Maven 3.9.x repository-local tools valid |
| Draft 0.6 baseline inventory | PASS; 381 requirements, 244 vectors, 217 mutation-sensitive vectors, 31 errors |
| TypeScript build and strict typecheck | PASS |
| TypeScript unit tests | PASS; runner 110, core 371, adapter 15 |
| Python compile and adapter tests | PASS; adapter 4/4 |
| Java tests and adapter tests | PASS; adapter 4/4 |
| TypeScript full conformance | PASS; 244/244, zero failure/unsupported/infrastructure |
| Python full conformance | PASS; 244/244, zero failure/unsupported/infrastructure |
| Java Money conformance | PASS; 83/83, zero failure/unsupported/infrastructure |
| Runner coverage | PASS; 98.31% statements, 95.29% branches, 100% functions, 98.75% lines |
| TypeScript core coverage | PASS; 99.09% statements, 98.69% branches, 100% functions, 99.49% lines |
| Python packaged coverage | PASS; 86% lines across `finkore` source with full manifest execution |
| Java packaged coverage | PASS; 135/144 lines covered, 85% gate satisfied |
| Python/Java critical-mutant probes | PASS; 14/14 killed |
| Draft 0.5 portability regression | PASS; TypeScript 244/244, Python 244/244, Java Money 83/83, zero actual-result differences in declared scopes |
| Boundary research harness | PASS; 19 cases, 49 executions, 14 matches, five differences assigned to one open blocker |
| Architecture boundaries | PASS |
| Documentation references | PASS; 269 CoreDoc/spec references checked |
| License validation | PASS |
| Whitespace/diff sanity | PASS |

## Unsupported and Deferred Scope

Java non-Money domains remain unsupported. Numeric and allocation capability
floors remain undecided until TASK-242. Compatibility taxonomy, deprecation,
profiles, claims, capability declarations, provenance, drift automation, and
profile-aware runner evidence remain pending later Draft 0.6 milestones.

No Draft 0.6 immutable tag or checksum manifest exists yet.
