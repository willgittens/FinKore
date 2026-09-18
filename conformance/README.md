# FinKore Conformance Suite

## Reliability principle

> FinKore tests are designed not only to demonstrate that a correct implementation works, but to demonstrate that plausible incorrect implementations fail.

> In financial software, a passing test suite is useful only if it reliably rejects broken behavior.

This directory is the language-independent executable evidence for FinKore Draft
0.1 plus the implemented Draft 0.2 Money Rates, Money Allocation, Audit
Relationships, Entity Evolution, and Approval Validity slices, the implemented
Draft 0.3 Approval Composition slice, the implemented Draft 0.3 Workflow
definition/version identity, import, instance binding/mismatch, and conflict
slice, and the implemented Draft 0.3 Entity Revision and Import slice. Draft
0.4 stabilizes this behavioral baseline and authority model; it does not add new
vector syntax or new financial behavior. The specification remains the source of
truth. Vectors describe observable domain behavior; they do not prescribe APIs,
classes, exceptions, storage, or frameworks.

## Scope and discovery

[manifest.json](manifest.json) is the only normative discovery entry point. A runner MUST load only the listed vector files, resolve paths relative to the manifest, reject duplicate vector IDs, and reject unsupported format versions. Filesystem traversal order carries no meaning.

The manifest and vector-file version fields describe syntax compatibility, not
the FinKore Draft release number. Draft 0.2 and later vectors may remain on
format `0.1` while they use the same manifest and vector-file shape; Draft 0.4
keeps format `0.1` because no manifest or vector-file syntax change is made.
Draft scope is determined by the manifest contents, referenced requirement IDs,
and traceability status.

Draft 0.6 Milestone B accepts a portable numeric/allocation floor and structural
boundary dispositions in
[Draft 0.6 Portability Capability Contract](../spec/draft-0.6-portability-capability-contract.md).
Those decisions do not add manifest-listed vectors by themselves; later Draft
0.6 profile and boundary tasks must promote any accepted case into this
directory explicitly.

Draft 0.6 Milestone C accepts profile and evidence-based claim policy in
[Draft 0.6 Compatibility, Claims, and Provenance Policy](../docs/draft-0.6-compatibility-claims-provenance-policy.md).
Draft 0.6 Milestone D encodes the current compatibility, profile, capability,
claim, and checksum metadata under [draft-0.6](draft-0.6/README.md). The
profile-aware runner can now emit closed-profile evidence for TypeScript full
scope, Python full scope, historical Java Money scope, and current Java full
scope.

Draft 0.7 cross-domain composition uses non-normative reference application
fixtures under
[examples/composition/draft-0.7](../examples/composition/draft-0.7/). Those
fixtures are intentionally outside [manifest.json](manifest.json), are not
closed Core conformance profiles, and do not add Draft 0.7 profile metadata,
portable errors, or canonical operation IDs.

Draft 0.7 release-candidate checksum evidence is recorded under
[draft-0.7](draft-0.7/README.md). That evidence is a closure/provenance gate
only; it does not promote the reference application profiles into normative
conformance vectors.

The initial suites are grouped by specification behavior:

- Money: representation, serialization, arithmetic, comparison, currency, rounding, Rates, and Allocation.
- Workflow: states, directed transitions, guards, terminal states, definition versioning, import, conflict preconditions, and failure atomicity.
- Audit: events, actors, changes, append-only history, redaction, relationships, and ordering.
- Approvals: requirements, decisions, validity lifecycle events, explicit expiration context, conditions, chains, subject facts, and Draft 0.3 composition groups/stages/quorums.
- Entities: identity, lifecycle, declared mutability, validation, evolution, import mapping, business revision observations, and conflict preconditions.

See [conventions.md](conventions.md) for the vector format and runner contract.
See [traceability.md](traceability.md) for the current requirement coverage, known specification gaps, mutation design, and readiness assessment.
See the [Draft 0.4 conformance and implementer documentation audit](draft-0.4-audit.md)
for the historical schema, manifest, vector, traceability, runner, and adapter
boundary review that prepared the completed Draft 0.5 Python and Java work.
See the [Conformance Adapter Onboarding Guide](../docs/conformance-adapter-onboarding.md)
for integration steps.

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

Requirement IDs are permanent semantic anchors. Once published, an ID MUST NOT be reused for a different rule or renumbered merely to close a gap. If a rule is replaced, preserve its historical ID and assign a new ID to the replacement.

Vector IDs are likewise unique, stable, human-readable, and domain-prefixed. Moving a document or vector file does not change either kind of ID. Every vector references one or more normative requirements. A vector may exercise more than one rule, but its description should make the primary behavior clear.

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
