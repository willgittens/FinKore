# FinKore Conformance Suite

## Reliability principle

> FinKore tests are designed not only to demonstrate that a correct implementation works, but to demonstrate that plausible incorrect implementations fail.

> In financial software, a passing test suite is useful only if it reliably rejects broken behavior.

This directory is the language-independent executable evidence for FinKore Core
0.9 release candidate: Money, Workflow, Audit, Approvals, and Entities. The
specification remains the source of truth. Vectors describe observable domain
behavior; they do not prescribe APIs, classes, exceptions, storage, or
frameworks.

## Scope and discovery

[manifest.json](manifest.json) is the only normative discovery entry point. A runner MUST load only the listed vector files, resolve paths relative to the manifest, reject duplicate vector IDs, and reject unsupported format versions. Filesystem traversal order carries no meaning.

The manifest and vector-file version fields describe syntax compatibility, not
FinKore release numbers. Release scope is determined by the manifest contents,
referenced requirement IDs, and traceability status.

The `core-0.9.3` tag identifies the corrective snapshot of this manifest.
Its regression vectors exercise the existing `0.9-rc` behavioral baseline;
the conformance syntax version remains `0.1`.

The [Core 0.9.4 plan](../docs/plans/plan-09.4.md) reopens demonstrated boundary
gaps after that snapshot. Milestone 1 clarifies contracts and fixtures and
corrects [traceability](traceability.md); it adds no vectors or implementation
fixes. Passing the existing manifest does not close the reopened requirements
or establish Core 1.0 readiness.

The accepted Entity decisions add `ENTITY-EVOLUTION-034` (Audit validation before
evolution correspondence) and `ENTITY-EVOLUTION-035` (reject unresolved
contradictory currentness history while accepting valid historical changes).
Milestone 2 adds permanent regressions for both and the other review findings:
the manifest now contains 532 vectors, including 201 new regression/control
cases. Native API tests supplement it for operation sequences and ownership.
The new tests intentionally expose the unfixed baseline; full conformance is
not currently passing. Implementation corrections follow in Milestones 3–6.

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
See the [Conformance Adapter Onboarding Guide](../docs/conformance-adapter-onboarding.md)
for integration steps.

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
