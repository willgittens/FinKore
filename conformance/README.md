# FinKore Conformance Suite

## Reliability principle

> FinKore tests are designed not only to demonstrate that a correct implementation works, but to demonstrate that plausible incorrect implementations fail.

> In financial software, a passing test suite is useful only if it reliably rejects broken behavior.

This directory is the language-independent executable evidence for FinKore Core
0.9 release candidate: Money, Workflow, Audit, Approvals, and Entities. The
specification remains the source of truth. Vectors describe observable domain
behavior; they do not prescribe APIs, classes, exceptions, storage, or
frameworks.

The completed [Core 0.9.7 corrective release](../docs/plans/plan-09.7.md)
contains 1,775 vectors; all pass on TypeScript, Python 3.12/3.13 and Java with
no failed, unsupported or infrastructure outcomes. Native regressions supplement
JSON for ownership, exact values, cycles, sparse collections and returned-value
reuse. Full configured mutation and paired critical/native gates pass.
[Traceability](traceability.md) records 436 requirements: 352 covered, one partial
external-fact authoring requirement and 83 not directly testable by portable
vectors. Python/Java targeted mutation probes do not establish full implementation
mutation coverage. Earlier milestone counts below are historical.

## Scope and discovery

[manifest.json](manifest.json) is the only normative discovery entry point. A runner MUST load only the listed vector files, resolve paths relative to the manifest, reject duplicate vector IDs, and reject unsupported format versions. Filesystem traversal order carries no meaning.

The manifest and vector-file version fields describe syntax compatibility, not
FinKore release numbers. Release scope is determined by the manifest contents,
referenced requirement IDs, and traceability status.

The local `core-0.9.7` tag identifies the latest completed corrective snapshot.
The Core label remains `0.9-rc` and conformance syntax remains `0.1`.

[Core 0.9.7 Milestones 3–5](../docs/plans/plan-09.7.md) close composition and
concrete Approval histories, conditions, fact semantics, and the accepted native
Approval/Workflow value profile on all four runtimes:
all 579 Approval suite vectors pass. The manifest contains 1738 vectors and 189
supplementary cases remain. M4 promotes six history-collision cases with their
existing IDs and full observation envelopes and adds 31 fact/history controls.
M5 also closes all 34 explicit Workflow collection vectors, with native tests
for input/output ownership and unsupported numeric subclasses. Entity boundary corrections are recorded in M6–M7 below.

[Core 0.9.7 Milestone 6](../docs/plans/plan-09.7.md) closes Entity declaration
observation/reuse, including own special names and inherited-member rejection.
Four special-field controls extend the six special-state vectors; native tests
cover aliases and actual definition/observation reuse. M7 closes the published malformed-input regressions. D8 and D9 have implemented contracts and passing combined verification; D11 now has an accepted result-shape contract under ENTITY-IMPORT-012.

[Core 0.9.7 Milestone 2](../docs/plans/plan-09.7.md) published 699 new
full-envelope vectors and 197 supplementary native/adapter cases, alongside the
unchanged 884 vectors, establishing a 1,583-vector baseline. M7 now passes all 1719 manifest vectors on all four runtimes, with no failed,
unsupported, or infrastructure outcomes. The D9 Entity native-value policy is now
defined in ENTITY-VALIDATION-011; [traceability](traceability.md) distinguishes
these limits from tested requirements. Supplementary tests assert exact
domain results and input preservation where optional diagnostics have no single
portable envelope. They do not weaken the runner's exact comparison.

M7 adds 47 vectors and promotes one existing supplementary case without changing
its ID. Cases cover invalid original Entity data despite valid proposed changes,
nonstring Audit relationship types, and null Workflow facts on rejected transitions.
Eight supplementary cases distinguish omitted and null Audit histories combined
with invalid Actors across all four evolution kinds. One older vector's unknown
target expectation is corrected to `WORKFLOW_INVALID_STATE` under WORKFLOW-ERROR-007;
its ID and unchanged-input assertion are retained. See the plan for compatibility
and mutation evidence. Complete M8 verification passes for the accepted
contracts, including a fresh full run after D10.

M8 native review adds 300 collection cases across 32 boundaries, including
holes, malformed containers and caller-defined iteration, plus 28 paired probes. These supplement existing malformed-member vectors because
JSON cannot encode a missing array position. A further 717 deterministic native
cases exercise shared composition graphs and fact comparisons. Portable vector
identifiers are unchanged. D10 is now resolved under AUDIT-EVENT-009: the separate
`audit/event-metadata.json` adds 19 vectors for metadata presence, JSON categories,
member preservation and error priority. Native tests cover unsupported values,
cycles, ownership and reuse. The plan distinguishes the pre-D10 verification
from the corrected candidate's fresh result.

The completed [Core 0.9.5 plan](../docs/plans/plan-09.5.md) corrects native Money
serialization, Workflow binding and precondition presence, concrete Approval
association and eligibility, native Audit ownership and cycle rejection, and
Entity binding, declaration, and import boundaries. The accepted Entity
ownership, validator, and bounded revision/conflict decisions are defined by
`/spec` and documented in the [fixture conventions](conventions.md).
All earlier corrective regressions remain in the suite.

At the completed Core 0.9.5 snapshot, all 667 vectors passed on TypeScript,
CPython 3.12, CPython 3.13, and Java
with zero failed, unsupported, or infrastructure outcomes. This includes 102
Money, 103 Workflow, 76 Audit, 162 Approval, 212 Entity, and 12 shared vectors.
Native public API tests cover exact serializer scales, cycles, aliases, and
actual returned-value sequences that isolated JSON vectors cannot express.
Complete clean-checkout verification includes coverage, full mutation suites,
paired critical/native probes, and isolated npm, wheel/sdist, and JAR consumers.

That snapshot recorded 330 COVERED and 83 NOT DIRECTLY TESTABLE requirements,
with no PARTIAL or blocking specification gaps. Native tests and
mutation probes support the relevant non-JSON boundaries. These finite checks
do not establish exhaustive correctness or complete the separate Core 1.0
promotion process. Canonical Agentic operation promotion and unpublished
reference-package status are unchanged.

The historical [Core 0.9.6 corrective snapshot](../docs/plans/plan-09.6.md)
contains 884 vectors. Milestones 3–8 verify Money, Workflow, Approval, Audit,
and Entity corrections. All vectors pass on TypeScript, Python 3.12/3.13, and
Java, with no unsupported cases or infrastructure errors. Native tests cover
returned-history reuse, versioned imports, source/mapping presence pairs, and
failure preservation, supplied revision currentness, and composition Decision
container validation. Coverage, mutation probes, and isolated consumers
support those corrected boundaries. At that snapshot, traceability
records 334 COVERED, 0 PARTIAL, and 83 NOT DIRECTLY TESTABLE, with no blocking gaps.
Milestone 8 passes complete clean-candidate verification, full configured
TypeScript mutation, all 222 portable critical probes, all 92 native probes,
and the 47-probe Python 3.13 native repeat. These targeted Python/Java probes
do not establish full implementation mutation coverage. The fresh review is
complete. Milestone 9 closes the local corrective release; remote tag and package
publication remain separate.

For FinKore Core 0.9 release candidate, [manifest.json](manifest.json) is the
frozen release-candidate manifest and `finkoreConformance` remains `0.1`. This
freeze does not permit manifest-listed behavior to change except through the
release-candidate correction policy in the specification compatibility rules.

The initial suites are grouped by specification behavior:

- Money: representation, serialization, arithmetic, comparison, currency, rounding, Rates, and Allocation.
- Workflow: states, directed transitions, guards, terminal states, definition versioning, import, conflict preconditions, and failure atomicity.
- Audit: events, actors, changes, append-only history, redaction, relationships, and ordering.
- Approvals: requirements, decisions, validity lifecycle events, explicit expiration context, conditions, chains, subject facts, and bounded composition groups/stages/quorums.
- Entities: identity, lifecycle, declared mutability, validation, evolution, import mapping, business revision observations, and conflict preconditions.

See [conventions.md](conventions.md) for the vector format and runner contract.
See [traceability.md](traceability.md) for the current requirement coverage, known specification gaps, mutation design, and readiness assessment.
See the [language-neutral implementation guide](../docs/implementation-guide.md)
for consumer-owned implementation and verification guidance.

## Conformance Claim Model

A FinKore conformance claim is a statement about observable behavior against a
specific Core release and conformance manifest. It is not a statement about API
shape, storage design, framework integration, package maturity, mutation score,
or Agentic advertising.

A complete FinKore Core 0.9 release-candidate conformance claim means the
implementation passed every applicable vector in every suite listed by the Core
0.9 release-candidate manifest, using the stated `finkoreConformance` manifest
format. The claim MUST identify at least:

- Core release: `FinKore Core 0.9 release candidate`;
- manifest path or release manifest identity;
- `finkoreConformance` version;
- all suites included in the run;
- the implementation and adapter under test.

A domain-scoped claim is allowed when an implementation intentionally implements
only named domains. The claim MUST name the domain suites it covers, use the
same Core release and manifest version, and pass every applicable vector in
those suites. It MUST NOT be described as complete FinKore Core conformance.

Passing only selected vectors, selected tags, or selected vector IDs is useful
for development and regression checks, but it is not a complete Core claim or a
complete domain-scoped claim. A filtered run MAY be reported as a selected-vector
or selected-tag result only when the filters are disclosed.

`UNSUPPORTED` is not passing. A complete Core claim cannot contain any
`UNSUPPORTED` vector in the release manifest. A domain-scoped claim cannot
contain any `UNSUPPORTED` vector in its claimed domain suites. Unsupported
vectors outside the claimed domain scope do not invalidate the domain-scoped
claim, but they MUST NOT be hidden when publishing the complete run report.

Advertising an Agentic operation or capability is not evidence of conformance.
Agentic metadata may describe a contract, but conformance is demonstrated only
by passing the relevant manifest-listed vectors through a faithful runner and
adapter.

The reference runner report includes the Core release, manifest path,
`finkoreConformance` version, declared suites and vector files, applied filters,
suite counts, requirement counts, critical failures, and individual vector
results. That information is intended to make a claim reproducible locally from
the repository without checksums, attestations, hosted CI, provenance reports, or
profile machinery.

## Specification-first TDD

The preferred workflow for official/reference implementations is:

```text
Domain problem
      ↓
Specification
      ↓
Normative requirement
      ↓
Conformance vectors
      ↓
Tests fail
      ↓
Implementation
      ↓
Tests pass
      ↓
Mutation testing
      ↓
Mutants killed
      ↓
Refactor
```

Implementation code does not define FinKore behavior. A new normative rule begins in the specification, receives a stable requirement ID, and receives conformance evidence before implementation.

## Requirement and vector stability

Requirement IDs are permanent semantic anchors governed by the
[Specification compatibility policy](../spec/conventions.md#compatibility-policy).
Once published, an ID MUST NOT be reused for a different rule or renumbered
merely to close a gap. If a rule is replaced, preserve its historical ID and
assign a new ID to the replacement.

Vector IDs are likewise unique, stable, human-readable, and domain-prefixed. Moving a document or vector file does not change either kind of ID. Every vector references one or more normative requirements. A vector may exercise more than one rule, but its description should make the primary behavior clear.

A regression vector may be added without changing the Core version only when it
exercises existing normative behavior. A vector that requires new observable
semantics, a changed portable result, or a changed portable error mapping is a
specification change, not a version-neutral regression.

## Test design

For each normative behavior, use engineering judgment to cover:

```text
valid behavior
invalid behavior
boundary behavior
inverse behavior
mutation-sensitive behavior
```

Vectors are chosen for a specific reason. Paired contrast cases are preferred when plausible defects otherwise produce the same answer. Monetary comparisons are exact; approximate floating-point tolerances are forbidden.

Static vectors are the portable baseline. Implementations MAY add property-based tests for properties justified by the specification, such as compatible-currency exact addition identity and operand non-mutation. This suite does not define a property-testing DSL.

## Determinism

A conforming evaluation of the same vector MUST return the same normalized observation. Runners MUST NOT depend on wall clocks, network services, unseeded randomness, machine locale, host timezone, database ordering, operating-system behavior, or external FX services. Explicit timestamps and facts are vector inputs. JSON object member order has no meaning.

Decimal strings use a period as separator and no grouping characters. Localized display formatting is outside scope. Money values are compared by exact base-10 numeric value and currency; a runner MUST NOT use an epsilon.

## Regression policy

Every confirmed implementation defect should follow this sequence:

1. Reproduce the defect with a language-independent vector.
2. Confirm that the vector fails against the defective implementation.
3. Fix the implementation.
4. Retain the vector permanently with the `regression` tag.

Issue references MAY be recorded as non-normative metadata, but repository-specific issue data is never required for conformance.

## Mutation testing policy

Mutation testing is first-class for official/reference implementations. Mutation score is a quality signal, not proof of financial correctness.

The target mutation score for normative FinKore Core behavior is at least 95%. In addition, no known critical financial mutant may survive, even when the aggregate score exceeds the target. A surviving currency check removal, rounding-mode substitution, guard bypass, immutability bypass, approval-validity bypass, or audit-history mutation makes an official implementation non-compliant with project quality policy.

This policy applies to official/reference implementation quality, not to the language-independent specification and not as a tooling mandate for third-party implementations. Third parties may demonstrate conformance with any runner that faithfully evaluates these vectors.

Developers MUST NOT game mutation scores by excluding meaningful business logic, ignoring difficult mutants without justification, asserting implementation details, or adding meaningless assertions. An equivalent or genuinely unkillable mutant MAY be excluded only with a written justification.

### Initial mutation model

- Money: swap addition/subtraction; reverse signs; remove or invert currency checks; use binary floating point; substitute rounding modes; ignore target scale; alter tie boundaries; replace `FLOOR` with `DOWN` or `CEILING` with `UP`.
- Workflow: remove validation; reverse transition direction; accept undeclared or reject declared transitions; invert guard results; leave terminal states; omit state update; mutate state on failure; ignore version binding; infer imported state or revision; accept stale expected-current-state or expected-revision preconditions; return the wrong portable error precedence.
- Audit: omit actor/timestamp/entity identity; reverse before/after; replace or delete committed events; expose redacted values; infer causality from arbitrary order.
- Approvals: swap approved/rejected; ignore requirements; bind a decision to the wrong requirement; retain effectiveness after relevant facts change; count withdrawn, expired, superseded, rejected, duplicate, ineligible, or stale decisions toward quorum approval; invert a condition; treat pending as approved; bypass ordered-stage or nested-group validation.
- Entities: change identity; bypass declared immutability; mutate before failed validation; partially apply a failed operation; change lifecycle state unexpectedly; replace FinKore identity with source identity; drop import mapping or revision history; confuse business revision with conflict version.

The vector-level `guardsAgainst` field identifies especially relevant mutants without making implementation technique normative.

## Conformance and implementation quality

FinKore conformance asks whether observable behavior matches the specification and is measured by the portable vectors.

Reference implementation quality asks how strongly an implementation resists defects and is measured by conformance tests plus language unit tests, appropriate property tests, mutation testing, static analysis, and language-specific checks. Conformance does not require a production API to expose the normalized test protocol.

## Future CI philosophy

Official implementations should eventually run:

```text
Specification checks
        ↓
Conformance vectors
        ↓
Language unit tests
        ↓
Mutation tests
        ↓
Static analysis
        ↓
Build
```

A change to normative financial behavior must pass conformance tests and kill all relevant critical mutants.

## Definition of done

New normative financial behavior is complete in an official implementation only when applicable items are satisfied:

- [ ] Domain problem documented.
- [ ] Specification requirement defined and assigned a stable ID.
- [ ] Positive vector exists.
- [ ] Negative vector exists where applicable.
- [ ] Boundary vectors exist where applicable.
- [ ] Relevant invariants and non-mutation are observed.
- [ ] Mutation-sensitive vectors exist for critical behavior.
- [ ] Implementation passes conformance tests.
- [ ] Relevant mutants are killed.
- [ ] Regression vectors are retained for discovered defects.

Not every trivial rule needs every category. Critical financial behavior receives the strongest treatment.

D8 policy identity is now specified by AUDIT-REDACTION-008. The separate
`audit/policy-identity.json` supplies 20 vectors for omission, opaque valid labels,
malformed supplied values, unchanged history, and authority/target/error-priority
boundaries. Native tests add supplied undefined, constructor absence conventions,
input preservation and actual-history reuse. All 125 Audit vectors pass on all
four runtimes; the 1758-vector candidate passes fresh complete verification.
