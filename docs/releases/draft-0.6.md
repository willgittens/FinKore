# FinKore Core Draft 0.6 Release Notes

## Status

Draft 0.6 is in progress. Milestones A through C are complete; Milestones D and
E are pending. This document does not make a Draft 0.6 conformance,
compatibility, immutable-tag, or release-closure claim.

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
| `D06-PORT-241-001` | `PORTABILITY BLOCKER` | RESOLVED | Money maintainers | Python Money arithmetic/rounding, capability-floor decision, boundary corpus | No longer blocks TASK-242 or the Draft 0.6 numeric floor; later profile/evidence tasks still must prove accepted claims | Five Milestone A corpus differences, now matching controls in `docs/research/draft-0.6-boundary-evidence.md` | Resolved by the accepted Milestone B portability capability contract and Python exact coefficient-and-scale Money arithmetic | Accepted with Milestone B |

### D06-PORT-241-001 analysis

- **Minimal reproduction:** execute the five corpus cases that cite the finding
  with `npm run research:boundaries:draft0.6`.
- **Observed revision:** opening source revision
  `67298ec6582574c05175ef335d220eb861bd0f8f` plus the Milestone A research
  corpus and runner recorded by this change.
- **Observed behavior before remediation:** Python used the ambient 28-digit
  decimal context for large addition, subtraction, multiplication, and Rate
  results, producing silently reduced values; scale-50 quantization escaped as
  `decimal.InvalidOperation`. TypeScript and Java returned matching exact
  results.
- **Affected stable identifiers:** `SPEC-DECIMAL-001`,
  `MONEY-REPRESENTATION-002`, `MONEY-REPRESENTATION-006`,
  `MONEY-ARITHMETIC-004`, `MONEY-ARITHMETIC-007`,
  `MONEY-ARITHMETIC-008`, `MONEY-RATE-002`, `MONEY-RATE-003`,
  `MONEY-RATE-005`, and `MONEY-ROUNDING-001` through
  `MONEY-ROUNDING-004`. The affected canonical operations are
  `finkore.money.add`, `finkore.money.subtract`, `finkore.money.multiply`,
  `finkore.money.applyrate`, and `finkore.money.round`. No portable error,
  conformance vector, profile, or format identifier is assigned by Milestone A.
- **Accepted resolution:** TASK-242 defines a bounded numeric and allocation
  floor in
  [`spec/draft-0.6-portability-capability-contract.md`](../../spec/draft-0.6-portability-capability-contract.md).
  Python now uses context-independent coefficient-and-scale arithmetic for the
  affected Money operations. No new portable capability-exceeded error is
  introduced.
- **Compatibility impact:** current manifest evidence is unchanged. The Python
  fix expands correct behavior already required by exact Money requirements; it
  does not retroactively expand the closed Draft 0.5 claim.
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
- The Milestone A boundary evidence originally recorded 14 matching cases and
  five differences assigned to `D06-PORT-241-001`.

## Milestone B Deliverables

- The accepted portable numeric and allocation floor is recorded in
  [Draft 0.6 Portability Capability Contract](../../spec/draft-0.6-portability-capability-contract.md).
- Structural dispositions for Unicode identity, timestamp offsets, nullability,
  declared order, object-member order, opaque identity, Money serialization,
  and portable error precedence are accepted.
- `D06-PORT-241-001` is resolved as a Python implementation defect under
  existing exact Money requirements.
- The boundary corpus now treats all 19 cases as expected cross-language
  matches; it remains non-normative and outside `conformance/manifest.json`.

## Milestone C Deliverables

- The accepted compatibility, claims, and provenance policy is recorded in
  [Draft 0.6 Compatibility, Claims, and Provenance Policy](../draft-0.6-compatibility-claims-provenance-policy.md).
- Core, conformance format, Agentic contract, package, adapter, profile,
  evidence, and release artifact versions are governed as independent
  dimensions.
- Change classes, deprecation, migration, supersession, rollback, and
  historical-traceability rules are accepted.
- Stable profile ID forms are reserved, including
  `finkore.core.draft0_6.full`, `finkore.core.draft0_6.domain.<domain>`, and
  `finkore.core.draft0_6.operation.<operation-id>`.
- Capability declarations are defined as discovery metadata only, distinct from
  successful conformance claims.
- Release identity, closure-gated tag `core-draft-0.6`, SHA-256 checksum
  manifest, correction/revocation, and no-implied-signing rules are accepted.

## Verification Status

The Milestone A opening quality matrix is complete, and the Milestone B
blocker-remediation checks listed below are current. Draft 0.6 closure
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
| Python Money regression tests | PASS; Draft 0.6 large-decimal and high-scale rounding/Rate controls included |
| Boundary research harness | PASS; 19 cases, 49 executions, 19 matches, zero documented differences |
| Milestone C policy references | PASS; compatibility, profile, claim, capability, and provenance policy linked from live navigation |
| Architecture boundaries | PASS |
| Documentation references | PASS; 269 CoreDoc/spec references checked |
| License validation | PASS |
| Whitespace/diff sanity | PASS |

## Unsupported and Deferred Scope

Java non-Money domains remain unsupported. Numeric and allocation capability
floors are accepted for Milestone B but are not yet encoded as profile or
capability metadata. Compatibility taxonomy, deprecation, profiles, claims,
capability declarations, and provenance are accepted as Milestone C policy but
not yet encoded as machine-readable metadata. Drift automation and profile-aware
runner evidence remain pending later Draft 0.6 milestones.

No Draft 0.6 immutable tag or checksum manifest exists yet.
