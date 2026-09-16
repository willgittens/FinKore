# Draft 0.6 Portability and Compatibility Governance

## Status

Accepted as the Milestone A governance record for Draft 0.6 on 2026-09-16.

This document records the opening baseline, authority rules, finding process,
compatibility-surface ownership, and research boundary for Draft 0.6. It is
non-normative. CoreDoc and `/spec` remain the sources of financial obligations;
`/conformance` records portable observations; `/agentic` records canonical
operation semantics; release notes record shipped results.

## Scope

Draft 0.6 hardens the existing Money, Workflow, Audit, Approvals, and Entities
scope. It defines portability limits, compatibility and deprecation rules,
conformance profiles and claims, capability declarations, validation, and
release provenance. Milestone A gathers evidence and opens decisions; it does
not yet choose the numeric capability floor or change normative behavior.

Required implementation comparison scopes remain asymmetric:

- TypeScript: complete manifest regression scope;
- Python: complete manifest implementation scope; and
- Java: complete Money implementation scope, with non-Money operations
  explicitly unsupported.

## Opening Baseline

The Draft 0.6 opening source revision is
`67298ec6582574c05175ef335d220eb861bd0f8f`. Work began with two requested,
uncommitted planning changes already present:

- `docs/plans/draft-0.6-portability-compatibility-task-list.md` was untracked;
- `docs/plans/good-to-have.md` contained the link to that plan.

Those planning files are part of the Draft 0.6 work, not part of the closed
Draft 0.5 artifact revision. No other pre-existing working-tree changes were
present.

| Artifact | Opening value |
| --- | --- |
| Behavioral stabilization baseline | FinKore Core Draft 0.4 |
| Closed implementation proof release | FinKore Core Draft 0.5 |
| Conformance manifest format | `0.1` |
| Conformance vector-file format | `0.1` |
| Runner package | `@finkore/conformance-runner` `0.1.0` |
| TypeScript core | `@finkore/typescript` `0.1.0` |
| TypeScript adapter | `@finkore/typescript-conformance-adapter` `0.1.0` |
| Python core | `finkore-python` `0.1.0` |
| Java core | `org.finkore:finkore-java-core` `0.1.0` |
| Node used for opening verification | `24.15.0` |
| npm used for opening verification | `11.12.1` |
| Required Python floor | CPython `3.12`; observed `3.12.14` |
| Python compatibility runtime | CPython `3.13`; observed `3.13.15` |
| Required Java floor | JDK `21`; observed Temurin `21.0.12.1` |
| Maven | `3.9.9` |
| Immutable Draft 0.6 release tag | Not created; closure-gated |

The machine-checked opening inventory is:

| Inventory item | Count |
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

Run `npm run baseline:draft0.6` to reproduce the inventory and version checks.
A later accepted task may change an inventory value, but it must update the
validator, affected authorities, release evidence, and compatibility analysis
together.

## Authority and Decision Order

When artifacts disagree, use this order:

```text
CoreDoc foundation obligation
        ↓
/spec precise domain behavior
        ↓
/conformance portable observation
        ↓
/agentic operation semantics
        ↓
language implementations and adapters
        ↓
research corpus and diagnostic evidence
```

The research corpus may expose a problem, but it cannot define the solution.
TypeScript, Python, and Java results are evidence, not normative votes. A
conformance vector without specification support is a conformance finding. An
implementation result without specification support cannot be copied into the
other implementations to manufacture agreement.

## Finding Register Rules

The durable register is in the
[Draft 0.6 Release Notes](releases/draft-0.6.md#finding-and-decision-register).
Every finding uses a stable `D06-*` identifier and one classification:

- `EDITORIAL`;
- `CLARIFICATION`;
- `NORMATIVE CHANGE`;
- `CONTRADICTION`;
- `PORTABILITY BLOCKER`;
- `COMPATIBILITY BLOCKER`;
- `CONFORMANCE DEFECT`;
- `IMPLEMENTATION DEFECT`;
- `CLAIM DEFECT`; or
- `TOOLING DEFECT`.

Each finding records:

- owner and status;
- affected CoreDoc rules, requirements, vectors, operations, errors, profiles,
  metadata, implementations, and documentation;
- exact artifact revision and minimal reproducer;
- alternatives considered;
- compatibility and migration impact;
- domain, accounting, technical, security, and privacy consequences appropriate
  to the scope;
- release and claim effect;
- accepted resolution and synchronized changes; and
- explicit maintainer acceptance.

Blocking classifications remain blocking as defined by the Draft 0.6 task
list. An implementation defect blocks that implementation's affected claim. A
tooling defect blocks any evidence path that cannot distinguish faithful domain
results from infrastructure behavior. A claim defect blocks publication or use
of the overstated claim.

## Change Synchronization

Material decisions must update every affected layer in one change:

```text
CoreDoc, when a foundation obligation changes
        ↓
/spec requirement and stable semantic identity
        ↓
/conformance vectors, schema, traceability, and profile membership
        ↓
/agentic operations, errors, effects, and capabilities
        ↓
TypeScript, Python, and Java in their declared scopes
        ↓
unit, boundary, regression, coverage, and mutation evidence
        ↓
public API documentation, READMEs, migration guidance, and release notes
```

An accepted limit must not appear only in implementation code or claim metadata.
Conversely, research values do not become normative merely because they are
listed in the boundary corpus.

## Milestone A Research Boundary

The corpus at
`docs/research/draft-0.6-boundary-corpus.json` has status
`NON_NORMATIVE_RESEARCH` and is deliberately absent from
`conformance/manifest.json`. It may:

- invoke adapters with bounded stress inputs;
- reuse manifest vectors as known normative controls;
- compare normalized actual results;
- measure whether execution stays within the adapter timeout; and
- require differences to cite a registered `D06-*` finding.

It must not:

- assign normative expected results to exploratory cases;
- create requirement, vector, error, operation, or profile semantics;
- count a documented mismatch as a conformance pass;
- convert an infrastructure error into a portable domain error; or
- establish the Draft 0.6 capability floor before TASK-242.

Run `npm run research:boundaries:draft0.6` to build the required adapters,
compile Java, and execute the corpus.

## Milestone A Outcome

At Milestone A, TASK-238 through TASK-241 were complete. The opening Draft 0.5
claims remained green. The compatibility surfaces and deferred boundaries were
inventoried. The research corpus found one open portability blocker,
`D06-PORT-241-001`, concerning Python decimal-context behavior beyond the
current manifest values. TASK-242 was the next task and had to resolve the
portable numeric and allocation capability-floor decision without assuming that
the current TypeScript or Java range was automatically normative.

## Milestone B Update

TASK-242 and TASK-243 are complete. The accepted portable numeric floor,
allocation floor, and structural boundary dispositions are recorded in
[`spec/draft-0.6-portability-capability-contract.md`](../spec/draft-0.6-portability-capability-contract.md).
`D06-PORT-241-001` is resolved as a Python implementation defect under existing
exact Money requirements. The boundary corpus now contains 19 expected matching
cases and remains non-normative until later tasks promote any accepted boundary
case into manifest-listed conformance.

## Milestone C Update

TASK-244 through TASK-248 are complete. The accepted version compatibility,
change classification, deprecation, profile, claim, capability-declaration, and
release provenance rules are recorded in
[`docs/draft-0.6-compatibility-claims-provenance-policy.md`](draft-0.6-compatibility-claims-provenance-policy.md).
The policy reserves stable Draft 0.6 profile ID forms and a closure-gated
`core-draft-0.6` tag name, but does not create machine-readable metadata,
checksums, release claims, or the immutable tag. Those remain Milestone D and E
work.
