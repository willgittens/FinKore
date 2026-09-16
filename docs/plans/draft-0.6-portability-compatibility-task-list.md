# FinKore Core Draft 0.6 Portability and Compatibility Hardening Task List

## 1. Purpose

Draft 0.6 defines the limits, compatibility rules, conformance claims, and
release evidence needed for independent FinKore implementations to remain
portable over time.

Draft 0.5 proved that the stabilized behavior can be implemented independently:
TypeScript and Python pass the complete manifest-listed scope, while Java passes
the complete Money scope. Draft 0.6 turns that point-in-time result into an
explicit maintenance contract. It does not add a new financial domain.

This plan continues task numbering after Draft 0.5. It is non-normative:
CoreDoc and `/spec` define financial obligations, `/conformance` defines
portable observations, `/agentic` defines canonical operation semantics, and
release notes record shipped results. Decisions made while executing this plan
become authoritative only when accepted and recorded in the appropriate
artifact.

## 2. Starting Baseline

Draft 0.6 starts from the closed Draft 0.5 release described by:

- [Draft 0.5 Release Notes](../releases/draft-0.5.md);
- [Draft 0.5 Portability Review](../releases/draft-0.5-portability-review.md);
- [Draft 0.5 Cross-Language Implementation Task List](draft-0.5-cross-language-task-list.md);
- [Draft 0.4 Cross-Language Portability Contract](../../spec/draft-0.4-portability-contract.md);
- [CoreDoc](../coreDoc/core-doc.md);
- [Conformance Conventions](../../conformance/conventions.md); and
- [Conformance Adapter Onboarding Guide](../conformance-adapter-onboarding.md).

The closed Draft 0.5 inventory contains:

- 381 indexed requirements;
- 244 manifest-listed vectors across 35 operation labels;
- 217 mutation-sensitive vectors;
- 31 portable error codes;
- 20 canonical Agentic operations;
- 15 conformance-local operation labels;
- TypeScript passing 244 of 244 vectors;
- Python passing 244 of 244 vectors; and
- Java passing all 83 Money vectors while reporting 161 non-Money vectors as
  unsupported.

The current conformance manifest and vector-file formats are both `0.1`. The
runner, TypeScript core, TypeScript conformance adapter, Python core, and Java
core are currently versioned independently at `0.1.0`. Draft 0.5 did not create
an immutable release tag, define a portable numeric capability floor, or
publish a general compatibility and deprecation policy.

TASK-238 must refresh this inventory and lock the exact Draft 0.6 opening
revision before later work relies on it. Counts above are starting evidence,
not permanent Draft 0.6 release claims.

## 3. Confirmed Planning Decisions

- Draft 0.6 hardens the existing Money, Workflow, Audit, Approvals, and Entities
  scope. It does not add a new domain.
- TypeScript and Python are the required full-manifest comparison tracks. Java
  remains the required independent Money comparison track; completing Java's
  other domains is not a Draft 0.6 prerequisite.
- A portable capability floor is a minimum that every implementation claiming
  the affected profile must satisfy. It is not a claim of unbounded arithmetic
  or unlimited resources.
- Implementation maxima above the portable floor may differ, but they must be
  declared honestly and must not alter outcomes inside the claimed floor.
- A capability advertisement does not prove conformance. A conformance claim
  must identify exact versions, profile, evidence, implementation revision, and
  result status.
- FinKore Core versions, conformance format versions, Agentic contract or
  descriptor versions, implementation package versions, and artifact revisions
  are separate compatibility dimensions. None may be inferred from another.
- The conformance format remains `0.1` unless accepted syntax or member-semantics
  changes require a bump. Adding a Core release does not itself bump the format.
- Stable requirement IDs, vector IDs, portable error codes, and canonical
  operation IDs are never silently reused or redefined.
- Numeric, Unicode, timestamp, nullability, ordering, identity, and error
  precedence cases must be derived from accepted specification behavior. Stress
  data must not become a second specification.
- The machine-readable metadata introduced in Draft 0.6 is limited to
  compatibility, capability, conformance-claim, and release evidence needed for
  this milestone. The canonical machine-readable Agentic operation manifest
  remains Draft 0.8 work.
- Immutable tags, checksums, and release evidence must refer to committed
  artifacts. Creating or publishing a tag requires explicit maintainer approval
  at the release gate.
- Any behavioral correction follows specification-first TDD and requires
  synchronized specification, conformance, Agentic, implementation, test, and
  documentation updates where affected.

## 4. Success Definition

Draft 0.6 is successful when:

1. the portable capability floor and implementation-limit declaration rules are
   unambiguous, testable, and published;
2. TypeScript, Python, and Java Money produce the same outcomes throughout the
   declared Money floor;
3. TypeScript and Python produce the same outcomes for the applicable
   full-profile structural, time, ordering, identity, nullability, and error
   boundaries;
4. version relationships and additive, compatible, deprecating, and breaking
   changes are defined for every governed artifact class;
5. full, domain, operation, and version-specific conformance claims have stable
   rules and mechanically validated evidence;
6. capability declarations cannot be mistaken for conformance claims or hide an
   unsupported outcome inside a claimed profile;
7. automated checks detect duplicate or orphan identifiers, traceability gaps,
   operation-registry drift, portable-error drift, and invalid compatibility or
   claim metadata;
8. reproducible release evidence includes exact source and artifact identities,
   checksums, toolchain inputs, and an approved immutable-tag procedure; and
9. no unresolved numeric, representation, ordering, timestamp, identity,
   nullability, error-precedence, or compatibility blocker remains.

## 5. Non-Goals

Draft 0.6 must not:

- add ledger, journal, reconciliation, payment, settlement, tax, interest, FX
  sourcing, or another financial domain;
- define currency minor-unit defaults, display formatting, private currency
  namespaces, or implicit rounding merely to create a numeric limit;
- require arbitrary-precision or unlimited-memory behavior from every
  implementation;
- classify a resource-exhaustion crash, timeout, silent coercion, or rounded
  result as acceptable unsupported behavior inside a claimed capability floor;
- invent a portable capability or resource-limit error code without first
  defining its semantics in `/spec` and tracing it through conformance and
  implementations;
- require Java to claim Workflow, Audit, Approvals, Entities, or full-manifest
  conformance;
- turn conformance fixture envelopes, normalized runner results, subprocess
  bridges, or claim files into required production APIs;
- create the Draft 0.8 machine-readable Agentic operation manifest early;
- promote conformance-local operations to canonical Agentic operations;
- publish language packages or claim ecosystem support, production readiness,
  certification, regulatory approval, security review, or external review;
- introduce cross-domain composition behavior reserved for Draft 0.7; or
- change a test expectation solely to accommodate an implementation limit or
  defect.

## 6. Governed Version and Identity Dimensions

Draft 0.6 must govern these dimensions independently:

| Dimension | Identifies | Must not be inferred from |
| --- | --- | --- |
| FinKore Core version | Normative behavioral baseline and declared scope | Conformance syntax or package version |
| Conformance manifest format | Manifest syntax and defined member semantics | Core release number |
| Conformance vector-file format | Vector syntax and defined member semantics | Manifest format or Core release number |
| Agentic contract/descriptor version | Compatibility of discoverable operation metadata | Core or conformance version |
| Implementation package version | One language package's API/artifact release | Conformance status |
| Adapter version or revision | Conformance translation/infrastructure artifact | Core implementation version |
| Conformance profile | Exact requirements, operations, and vectors included in a claim | Capability advertisement |
| Evidence revision | Immutable inputs and results used to support a claim | A moving branch name |
| Release artifact identity | Committed source, generated artifacts, checksums, and approved tag | A local working tree description |

TASK-244 decides the exact compatibility relationships and version-bump rules.
This table establishes separation of concerns; it does not pre-decide version
numbers or compatibility outcomes.

## 7. Capability-Floor Decision Rules

Draft 0.6 must decide, with cross-language evidence, whether and how to define a
portable minimum for at least:

- decimal significant digits and exact-result growth;
- positive and negative decimal scale;
- target scale accepted by rounding and allocation;
- scalar, Rate, and division boundaries;
- allocation ratio values, ratio sums, part counts, and intermediate units;
- overflow detection and non-silent failure;
- representation and serialization size at the portable boundary; and
- any implementation resource limit that can change an observable FinKore
  result within a claimed profile.

The decision must distinguish:

```text
inside the portable floor
    every implementation claiming the profile must produce the specified result

above the portable floor but inside an implementation's declared capability
    the implementation remains bound by the specification

outside an implementation's declared capability
    support must be discoverable before reliance and reported honestly

invalid domain input
    the applicable existing portable domain error is returned

infrastructure or resource failure
    never converted into a domain pass or a conformance pass
```

If current portable errors cannot express a required operation outcome, the task
must record a specification gap. It must not reuse `INVALID_AMOUNT`,
`INVALID_ROUNDING`, `INVALID_ALLOCATION`, `UNSUPPORTED`, or an infrastructure
status with a new meaning merely for convenience.

Representative stress values are evidence, not the floor by themselves. The
accepted floor must be justified by domain need, implementation feasibility,
cross-language behavior, denial-of-service considerations, migration impact,
and conformance cost.

## 8. Compatibility and Change Classes

TASK-245 must define change classes for at least:

- CoreDoc rules and normative specification requirements;
- stable requirement and vector identifiers;
- portable error codes and their defined conditions;
- canonical Agentic operation identifiers and semantics;
- normative serialization;
- conformance manifests, schemas, vector files, and normalized observations;
- conformance profiles and claim metadata;
- capability declarations;
- language package APIs and versions; and
- release evidence and checksums.

The policy must distinguish at least:

- **EDITORIAL** — no observable or compatibility effect;
- **ADDITIVE COMPATIBLE** — older compliant consumers can continue faithfully,
  subject to explicitly stated discovery rules;
- **BEHAVIORAL COMPATIBLE** — meaning is clarified or constrained without
  invalidating conforming behavior, with evidence that outcomes do not change;
- **DEPRECATING** — current behavior or identifier remains valid during a
  defined migration window and has a named replacement or retirement path; and
- **BREAKING** — a consumer, implementation, claim, or artifact valid under the
  previous contract may no longer be valid or faithfully interpreted.

The final policy may refine names, but it must not label an observable semantic
change as editorial. It must define replacement, supersession, migration,
support-window, and historical-traceability rules without promising a 1.0
stability guarantee prematurely.

## 9. Conformance Profile and Claim Model

Draft 0.6 must define exact evidence rules for:

- full-Core conformance at one Core version;
- domain conformance;
- canonical-operation conformance;
- version-specific historical claims; and
- official/reference implementation quality statements that include mutation
  or equivalent defect-resistance evidence.

A claim must identify at least:

- claim-schema version;
- FinKore Core version;
- conformance manifest and vector-file format versions;
- exact manifest and evidence revision or digest;
- profile identifier and included scope;
- implementation name, language, version, and source/artifact identity;
- adapter name and version or revision;
- execution command and required toolchain identity;
- pass, fail, unsupported, and infrastructure-error counts;
- mutation-sensitive results and critical-requirement failures;
- declared capability limits relevant to the claim;
- timestamp as recorded evidence, not as a domain input; and
- checksum or signature fields required by the accepted provenance policy.

Profiles must be closed, discoverable sets. An implementation cannot obtain a
full or domain claim by filtering out required vectors, and an operation claim
must include every applicable vector and requirement dependency defined by the
accepted profile rules.

## 10. Finding and Decision Rules

Every Draft 0.6 finding must receive a stable `D06-*` identifier and one of
these classifications:

- **EDITORIAL** — no semantic or compatibility effect;
- **CLARIFICATION** — makes evidenced meaning explicit without changing
  observable outcomes;
- **NORMATIVE CHANGE** — adds, changes, or removes an observable obligation;
- **CONTRADICTION** — authoritative artifacts prescribe incompatible behavior;
- **PORTABILITY BLOCKER** — reasonable conforming implementations can produce
  different outcomes;
- **COMPATIBILITY BLOCKER** — version or change rules permit incompatible
  interpretations or unsafe upgrade claims;
- **CONFORMANCE DEFECT** — vectors, schemas, profiles, traceability, or runner
  behavior conflict with the specification;
- **IMPLEMENTATION DEFECT** — a language implementation violates defined
  behavior;
- **CLAIM DEFECT** — capability or conformance evidence overstates the proven
  scope; or
- **TOOLING DEFECT** — validation, build, provenance, or reporting tooling
  prevents faithful evidence without changing domain semantics.

Every material finding must record affected stable identifiers and artifacts,
minimal reproduction, exact revision, alternatives, compatibility and migration
impact, relevant domain/accounting/technical/security/privacy analysis,
resolution, synchronized changes, and explicit maintainer acceptance.

A `NORMATIVE CHANGE`, `CONTRADICTION`, `PORTABILITY BLOCKER`,
`COMPATIBILITY BLOCKER`, or `CONFORMANCE DEFECT` blocks the affected claim until
resolved. Unrelated work may proceed, but Draft 0.6 cannot close with one of
these findings open.

## 11. Quality and Verification Gates

Every affected behavior or policy must be verified at the layer where it is
authoritative. Depending on the task, the required evidence includes:

- specification and CoreDoc consistency;
- requirement, error, operation, and vector inventory checks;
- JSON Schema or equivalent metadata validation;
- backward- and forward-compatibility fixtures;
- runner unit tests for profile selection and claim generation;
- exact cross-language boundary comparisons;
- positive, negative, boundary, invariant, regression, and
  mutation-sensitive vectors;
- language-native unit and property tests justified by `/spec`;
- build, strict type/static checks, coverage, and mutation or accepted
  defect-resistance checks;
- failure non-mutation and unsupported/infrastructure separation;
- architecture and dependency checks;
- reproducibility from a clean checkout and declared toolchains;
- deterministic artifact checksum reproduction;
- documentation, reference, license, and diff checks; and
- complete unfiltered runs for every claimed profile.

No test may depend on network access, host locale, host timezone, wall clock,
filesystem enumeration order, unseeded randomness, or implementation-specific
diagnostic prose. Resource-boundary tests must use bounded, reviewable fixtures
that are safe for normal CI.

## 12. Milestone and Dependency Map

```text
Milestone A — Baseline and decision evidence
    TASK-238 → TASK-239 → TASK-240 → TASK-241

Milestone B — Portability contract
    TASK-241 → { TASK-242, TASK-243 }

Milestone C — Compatibility governance
    TASK-240 → TASK-244 → TASK-245
    { TASK-242, TASK-243, TASK-245 } → TASK-246 → TASK-247
    { TASK-244, TASK-245 } → TASK-248

Milestone D — Automation and implementation proof
    { TASK-247, TASK-248 } → TASK-249 → TASK-250
    { TASK-246, TASK-249 } → TASK-251
    { TASK-242, TASK-243, TASK-249, TASK-251 } → TASK-252
    { TASK-250, TASK-251, TASK-252 } → TASK-253

Milestone E — Release hardening and closure
    TASK-254 → TASK-255
```

Tasks may proceed in parallel where dependencies permit. Findings must be
recorded when discovered rather than deferred to the closure audit.

## 13. Detailed Task List

### Milestone A — Baseline, Governance, and Decision Evidence

### - [x] TASK-238 — Open Draft 0.6 and Lock the Compatibility Baseline

**Depends on:** Draft 0.5 closure.

**Objective:** Establish the exact artifacts and evidence Draft 0.6 will harden.

**Deliverables:** Refresh requirement, vector, suite, operation, portable-error,
mutation-sensitive, implementation-support, format-version, package-version,
toolchain, and release-artifact inventories; record the source revision and
working-tree state; create a Draft 0.6 release-note shell without claiming work
as complete.

**Verification:** Run the full existing TypeScript and Python manifests, Java
Money scope, builds, static checks, unit tests, coverage gates, critical-mutant
checks, portability review, architecture checks, documentation checks, license
checks, and diff checks.

**Acceptance:** The opening baseline is reproducible; all Draft 0.5 claims still
hold; every existing version dimension is recorded separately; and planned
Draft 0.6 outcomes are clearly labeled as targets.

**Current status:** Complete. The opening source revision and qualified
worktree state, exact toolchains, package/format versions, and 381-requirement /
244-vector inventory are recorded in the Draft 0.6 governance and release-note
shell. `npm run baseline:draft0.6` validates the opening inventory. The full
Milestone A quality matrix retained the Draft 0.5 TypeScript, Python, and Java
claims.

### - [x] TASK-239 — Establish the Draft 0.6 Finding and Decision Register

**Depends on:** TASK-238.

**Objective:** Make portability and compatibility decisions attributable and
prevent implementation limits from silently becoming domain rules.

**Deliverables:** A durable `D06-*` register with classification, owner, status,
affected artifacts and identifiers, exact revision, reproducer, alternatives,
compatibility impact, required review perspectives, resolution, evidence,
synchronized-change checklist, and maintainer acceptance.

**Acceptance:** Every blocking classification has an explicit release effect;
normative decisions cannot close as editorial work; and TypeScript, Python, or
Java behavior alone cannot settle unspecified semantics.

**Current status:** Complete. The governance record defines all `D06-*`
classifications, authority order, required fields, blocking effects, and
synchronized-change rules. The durable release-note register contains resolved
editorial finding `D06-EDITORIAL-240-001` and portability blocker
`D06-PORT-241-001`, which was later resolved in Milestone B.

### - [x] TASK-240 — Inventory Compatibility Surfaces and Deferred Boundaries

**Depends on:** TASK-239.

**Objective:** Identify every current surface that can affect compatibility or a
conformance claim before writing policy.

**Deliverables:** A bidirectional inventory covering CoreDoc rules,
specification requirements, normative serialization, portable errors,
conformance formats and schema members, vectors, normalized observations,
canonical and conformance-local operations, capability statements, package
APIs/versions, adapters, runner behavior, toolchain inputs, release records, and
known deferred topics.

**Verification:** Compare the inventory against `/spec`, `/conformance`,
`/agentic`, all three implementations, package metadata, scripts, and release
notes. Identify stale Draft 0.4/0.5 wording and any unowned version field.

**Acceptance:** Every governed surface has one authority, an evolution owner,
current version/identity where applicable, compatibility risk, and a stated
Draft 0.6 disposition. Deferred topics are not treated as implemented behavior.

**Current status:** Complete. The Draft 0.6 compatibility-surface inventory
maps normative, conformance, Agentic, runner, adapter, package, claim,
toolchain, research, and release surfaces to their authority, risk, owner, and
disposition. Deferred topics are classified, and live pre-Draft-0.5 status
wording was corrected under `D06-EDITORIAL-240-001` without editing historical
release records.

### - [x] TASK-241 — Build the Cross-Language Boundary Evidence Corpus

**Depends on:** TASK-240.

**Objective:** Gather reproducible evidence for capability-floor and structural
portability decisions without making exploratory values normative prematurely.

**Deliverables:** A bounded non-normative research corpus and comparison harness
covering large positive and negative decimals, significant-digit growth,
positive and negative scale, terminating and non-terminating division,
rounding ties, Rates, large allocation ratios and part counts, intermediate
unit growth, Unicode identifiers, equivalent timestamp offsets, absent versus
null, declared array order, object-member order, identity preservation, and
error precedence.

**Verification:** Execute applicable Money cases in TypeScript, Python, and
Java, and non-Money structural cases in TypeScript and Python. Record language
runtime limits, performance bounds, errors, timeouts, and adapter normalization
without changing expected conformance outcomes.

**Acceptance:** Results are reproducible and clearly marked exploratory; every
difference receives a `D06-*` finding; no stress fixture is promoted to
normative conformance without an accepted specification decision.

**Current status:** Complete. The non-normative 19-case corpus executes 49
adapter observations across the declared scopes, including 14 controls sourced
from normative vectors. Milestone A originally recorded fourteen matching cases
and five Python decimal-context differences assigned to `D06-PORT-241-001`;
Milestone B resolved the blocker and the corpus now records 19 expected
matches. The corpus remains outside the manifest, and all executions completed
within the 5-second adapter timeout.

### Milestone B — Portable Capability Contract

### - [x] TASK-242 — Decide the Portable Numeric and Allocation Capability Floor

**Depends on:** TASK-241.

**Objective:** Replace the deferred precision, scale, allocation-unit, and
overflow question with an implementable minimum contract or an explicit scoped
decision that identifies remaining blockers.

**Deliverables:** An accepted decision for each concern in Section 7; rationale
and alternatives; security/resource analysis; compatibility impact; exact
meaning of inside-floor, above-floor, and outside-declared-capability behavior;
error and discovery implications; and required changes across CoreDoc, `/spec`,
conformance, Agentic metadata, implementations, and documentation.

**Acceptance:** The decision does not rely on binary floating point, implicit
rounding, currency minor-unit defaults, or one language's native bounds; an
implementation can determine whether it satisfies the floor; inputs inside the
floor have one portable outcome; any remaining deferred item is shown not to
block the declared Draft 0.6 profiles.

**Current status:** Complete. The accepted floor is recorded in
[`spec/draft-0.6-portability-capability-contract.md`](../../spec/draft-0.6-portability-capability-contract.md).
It covers decimal significant digits, scale, exact-result growth, rounding
target scale, division, Rates, allocation target scale, ratio values, part
counts, and allocation units. `D06-PORT-241-001` is resolved as a Python
implementation defect by exact coefficient-and-scale Money arithmetic; no
portable capability-exceeded error is introduced.

### - [x] TASK-243 — Decide Structural and Representation Boundary Obligations

**Depends on:** TASK-241.

**Objective:** Confirm portable behavior for the non-numeric boundaries named in
the Draft 0.6 roadmap.

**Deliverables:** Accepted dispositions for Unicode identifiers and exact
preservation, normalization/case-folding prohibitions, timestamp offset parsing
and instant equivalence, absent/null/redacted distinctions, array and history
order, JSON object order, opaque identity, canonical Money serialization, and
portable error precedence. Record whether each item needs a normative
clarification, new vector, regression test, capability declaration, or no
change.

**Acceptance:** Every boundary has one language-neutral interpretation in its
specified scope; invalid values remain distinct from unsupported capability and
infrastructure failure; no global identifier format, presentation format,
distributed ordering rule, or host-runtime default is invented.

**Current status:** Complete. The accepted dispositions are recorded in
[`spec/draft-0.6-portability-capability-contract.md`](../../spec/draft-0.6-portability-capability-contract.md).
Unicode identifiers are exact and not normalized, timestamp offset controls use
specified instant semantics, absent/null/redacted distinctions remain scoped,
declared array/history order is preserved, object-member order is non-semantic,
opaque identities remain opaque, Money serialization stays plain and
locale-independent, and no global portable-error precedence is invented.

### Milestone C — Compatibility, Claims, and Provenance Governance

### - [x] TASK-244 — Define the Version Compatibility Taxonomy

**Depends on:** TASK-240.

**Objective:** Define how independently versioned FinKore artifacts relate and
how compatibility is discovered.

**Deliverables:** Published rules for every dimension in Section 6, including
version syntax, ownership, bump triggers, supported-version declarations,
compatibility matrices, unknown-version handling, Core-to-conformance evidence
mapping, adapter/runner support, and package-version independence.

**Acceptance:** A consumer can determine whether a runner, manifest, vector
file, profile, adapter, implementation, and Core target can be used together;
unsupported versions fail explicitly; a Core release does not force an
unnecessary format bump; no package version implies conformance by itself.

**Current status:** Complete. The accepted taxonomy is recorded in
[`docs/draft-0.6-compatibility-claims-provenance-policy.md`](../draft-0.6-compatibility-claims-provenance-policy.md).
It keeps Core, conformance formats, Agentic contract descriptors, package
versions, adapter revisions, profiles, evidence revisions, and release artifact
identity separate, with explicit unknown-version rejection rules.

### - [x] TASK-245 — Define Change Classification, Deprecation, and Migration Policy

**Depends on:** TASK-244.

**Objective:** Make compatible evolution predictable for stable semantic
identifiers and published artifacts.

**Deliverables:** The change classes in Section 8; artifact-specific examples;
required review and version effects; deprecation entry criteria; minimum
recorded migration information; supersession and removal rules; historical
traceability; rollback considerations; and release-note requirements.

**Acceptance:** Requirement IDs, vector IDs, portable errors, operation IDs, and
profile IDs cannot be silently reused; changed error conditions and serialization
are treated as semantic changes; deprecation is not deletion; editorial changes
cannot conceal behavior changes; pre-1.0 policy is explicit without implying a
1.0 freeze.

**Current status:** Complete. The accepted policy defines `EDITORIAL`,
`ADDITIVE_COMPATIBLE`, `BEHAVIORAL_COMPATIBLE`, `DEPRECATING`, and `BREAKING`
changes, artifact-specific version effects, deprecation records, supersession,
historical traceability, and release-note requirements.

### - [x] TASK-246 — Define Conformance Profiles and Evidence-Based Claims

**Depends on:** TASK-242, TASK-243, and TASK-245.

**Objective:** Allow precise full, domain, operation, and version-specific claims
without enabling selective or misleading test subsets.

**Deliverables:** Stable profile identifiers and composition rules; mapping from
profiles to requirements, operations, vectors, and capability floor; claim
schema requirements from Section 9; pass/fail rules; historical-claim rules;
official/reference quality evidence; expiry or supersession semantics; and
human-readable claim wording templates.

**Acceptance:** Every profile is a closed, reproducible scope; filters cannot
silently remove required vectors; zero unsupported or infrastructure-error
results are permitted inside a successful claim; operation profiles include
cross-cutting validation and error dependencies; Java Money-only and Python
full-scope claims can be expressed without ambiguity.

**Current status:** Complete. Draft 0.6 reserves stable profile IDs including
`finkore.core.draft0_6.full`, `finkore.core.draft0_6.domain.money`, and
`finkore.core.draft0_6.operation.<operation-id>`, and defines evidence-based
claim fields, pass/fail rules, historical-claim handling, official/reference
quality evidence, and human-readable claim wording.

### - [x] TASK-247 — Define Implementation Capability Declarations

**Depends on:** TASK-242 and TASK-246.

**Objective:** Let clients discover supported operations and implementation
limits without confusing discovery with proof.

**Deliverables:** A versioned capability-declaration contract covering Core
target, exposed canonical operations, supported profiles, numeric/allocation
limits, known unsupported domains or operations, adapter availability, and
links or digests for optional conformance evidence. Define conservative handling
of missing, unknown, inconsistent, or stale declarations.

**Acceptance:** Capability metadata cannot assert a conformance pass; declared
limits cannot undercut a claimed profile's floor; conformance-local operations
are not advertised as canonical capabilities; absent metadata does not imply
support; inconsistent claims fail validation.

**Current status:** Complete. The accepted declaration contract distinguishes
operation discovery from evidence, requires Core target, canonical operations,
known unsupported scope, numeric/allocation limits, adapter identity, and
optional claim links or digests, and defines conservative handling for missing,
unknown, stale, or inconsistent declarations.

### - [x] TASK-248 — Define Release Identity, Provenance, and Checksum Policy

**Depends on:** TASK-244 and TASK-245.

**Objective:** Make a closed draft and its conformance evidence independently
identifiable and reproducible.

**Deliverables:** Rules for release source revisions, clean working trees,
immutable tag naming, annotated tag content, generated versus committed
artifacts, checksum algorithm and canonical checksum manifest, toolchain and
dependency identities, reproducibility instructions, correction or revocation
records, and maintainer approval.

**Acceptance:** A verifier can identify the exact specification, conformance,
runner, adapter, implementation, and evidence inputs; checksums are deterministic
from a clean checkout; mutable branch names are insufficient; tag creation and
publication occur only after explicit approval; provenance language does not
imply signing or external attestation unless actually present.

**Current status:** Complete. The accepted policy defines exact source identity,
clean-tree requirements, closure-gated tag `core-draft-0.6`, annotated tag
content, SHA-256 checksum manifest rules, generated-artifact reproduction,
toolchain identity, correction/revocation records, and factual no-signing /
no-external-attestation language.

### Milestone D — Automated Enforcement and Cross-Language Proof

### - [x] TASK-249 — Add Machine-Readable Compatibility, Capability, and Claim Metadata

**Depends on:** TASK-246, TASK-247, and TASK-248.

**Objective:** Encode the accepted Draft 0.6 contracts so they can be validated
without creating a second source of financial semantics.

**Deliverables:** Minimal versioned schemas and repository records for
compatibility relationships, implementation capabilities, conformance profiles,
claims, and release checksums; positive and negative fixtures; deterministic
serialization rules where checksums require them; ownership and authority
documentation.

**Acceptance:** Metadata references authoritative stable identifiers instead of
restating domain rules; unknown required versions are rejected; optional
extension behavior is explicit; invalid or contradictory records fail; the work
does not create a machine-readable Agentic operation registry or production API.

**Current status:** Complete. Draft 0.6 metadata now lives under
`conformance/draft-0.6`, including compatibility, profile, capability, claim,
checksum, schema, and fixture records. The metadata references existing
specification, conformance, Agentic, adapter, and policy authorities without
creating financial semantics or a Draft 0.8 operation manifest.

### - [x] TASK-250 — Add Identifier, Traceability, Registry, and Metadata Drift Checks

**Depends on:** TASK-249.

**Objective:** Detect compatibility defects before they can enter a release.

**Deliverables:** Automated checks for duplicate requirement/vector/profile IDs;
orphan requirements and vectors; missing or invalid specification paths;
operation-registry versus conformance drift; canonical versus conformance-local
classification drift; portable-error catalog/domain/Agentic/implementation
drift; profile closure; capability-floor contradictions; unsupported claim
scope; version-matrix consistency; and invalid checksum metadata.

**Verification:** Add mutation-style negative fixtures proving each check fails
when the guarded defect is introduced. Keep legitimate non-testable requirements
and conformance-local operations represented through explicit classifications,
not broad exclusions.

**Acceptance:** Every roadmap-required drift class has a failing fixture; checks
are deterministic and runnable in CI; no check derives normative behavior from
an implementation; existing intentional gaps are named and justified.

**Current status:** Complete. `npm run metadata:check:draft0.6` validates
format versions, duplicate profile/vector identifiers, missing specs and
requirements, canonical operation drift, portable error drift, profile closure,
capability-floor contradictions, unsupported scope, claim/profile consistency,
checksum metadata, and invalid fixtures.

### - [x] TASK-251 — Add Profile-Aware Runner Evidence and Compatibility Tests

**Depends on:** TASK-246 and TASK-249.

**Objective:** Produce trustworthy evidence for a selected accepted profile
while preserving the runner's domain neutrality.

**Deliverables:** Runner support for resolving profiles, rejecting unknown or
incomplete scopes, recording exact input identities and result counts, and
emitting schema-valid claim evidence; compatibility tests for current and
historical supported metadata/format versions; negative tests for unsupported
versions, filtered required vectors, mismatched digests, malformed claims, and
unsupported/infrastructure laundering.

**Acceptance:** The runner contains no financial rules; profile contents come
from validated metadata; a partial run cannot be emitted as a successful full
claim; old supported formats retain their defined meaning; incompatible formats
fail explicitly; current unfiltered execution remains available.

**Current status:** Complete. The runner resolves profiles from metadata,
rejects unknown profiles, rejects profile runs combined with ad hoc filters,
emits profile evidence in JSON and console reports, and keeps ordinary
unfiltered/filter execution available.

### - [x] TASK-252 — Specify and Implement the Accepted Portability Boundaries

**Depends on:** TASK-242, TASK-243, TASK-249, and TASK-251.

**Objective:** Turn accepted Draft 0.6 decisions into synchronized normative
behavior and implementation evidence.

**Deliverables:** Where decisions require change, update CoreDoc, `/spec`, stable
requirement IDs, portable errors, conformance vectors/schema/traceability,
Agentic metadata, TypeScript, Python, Java Money, public API documentation,
READMEs, and release notes using specification-first TDD. Add bounded large
decimal, extreme scale, allocation, Unicode, timestamp offset, absent/null,
declared-order, identity, and error-precedence cases justified by the accepted
rules.

**Acceptance:** Each vector traces to an accepted normative requirement; each
behavioral change first fails against the defective or incomplete behavior;
every in-scope implementation passes inside its claimed profile; failures are
non-mutating where required; critical new mutants are killed; no adapter
implements financial policy.

**Current status:** Complete. Ten accepted Money boundary cases were promoted
into manifest-listed conformance vectors covering large significant digits,
deep positive scale, large negative subtraction, large product growth,
terminating scale-40 division, plain quotient expansion, scale-50 HALF_EVEN
rounding, large percentage Rate application, safe-integer allocation ratios,
and 100-part equal allocation. TypeScript, Python, and Java Money pass their
declared profile scopes with these vectors included.

### - [x] TASK-253 — Prove Cross-Language Portability Inside the Declared Floor

**Depends on:** TASK-250 through TASK-252.

**Objective:** Demonstrate that the new policies and boundaries work across the
actual implementation set rather than only on paper.

**Deliverables:** A final comparison matrix for TypeScript full scope, Python
full scope, and Java Money scope; profile-specific claim records; capability
declarations; exact actual-result comparison for all shared vectors; boundary
corpus results; performance/resource observations; coverage; mutation or
accepted equivalent evidence; architecture results; and final `D06-*` finding
dispositions.

**Acceptance:** All implementations claiming a profile produce the same
specified results inside its floor; zero failures, unsupported results, or
infrastructure errors occur in successful claims; differing implementation
maxima are declared and do not affect claimed results; no critical portability
or metadata-validation mutant survives; all blockers are closed.

**Current status:** Complete. TypeScript and Python pass
`finkore.core.draft0_6.full` at 254/254 vectors. Java passes
`finkore.core.draft0_6.domain.money` at 93/93 vectors and does not claim
non-Money domains. Claim records are stored in
`conformance/draft-0.6/claims`, and capability declarations point to those
profile-specific records.

### Milestone E — Release Hardening and Closure

### - [x] TASK-254 — Synchronize Documentation and Produce Reproducible Release Evidence

**Depends on:** TASK-253.

**Objective:** Make the compatibility contract usable and the Draft 0.6 result
reproducible without repository-private knowledge.

**Deliverables:** Update CoreDoc evolution records, specification and
conformance navigation, Agentic capability guidance, implementation READMEs,
adapter onboarding, migration guidance, compatibility matrix, conformance-claim
examples, unsupported/deferred registers, release notes, and release index.
Generate the checksum manifest and reproduce it from a clean checkout using the
declared toolchains. Prepare the immutable tag command and annotation for
maintainer approval; do not create or publish the tag without that approval.

**Verification:** Run link/reference checks, metadata validators, clean-checkout
build and conformance commands, checksum reproduction, license checks, and
`git diff --check`. Review all statements using the vocabulary: specified,
implemented, conformant, unsupported, deferred, and not yet specified.

**Acceptance:** Documentation describes the repository state that exists;
claims identify exact versions, profiles, limits, revisions, and evidence;
checksums reproduce; no Java full-domain, package-publication, production,
certification, signing, or external-review claim is implied.

**Current status:** Complete. Documentation, implementation READMEs, Agentic
capability guidance, adapter onboarding, release notes, release index,
compatibility matrix, migration guidance, claim examples, unsupported/deferred
scope, profile claim records, and checksum metadata are synchronized. `npm run
checksums:generate:draft0.6` produces the deterministic checksum manifest and
`npm run checksums:check:draft0.6` verifies it. The immutable tag command and
annotation were prepared in the release notes and executed during TASK-255.

### - [x] TASK-255 — Close FinKore Core Draft 0.6

**Depends on:** TASK-254.

**Objective:** Close Draft 0.6 only after portability limits, compatibility
rules, conformance claims, and release evidence are enforceable.

**Required closure statement:**

```text
FINKORE CORE DRAFT 0.6 COMPLETE

FinKore now publishes and mechanically validates the portability floor,
compatibility and deprecation rules, conformance profiles, implementation
capability declarations, and reproducible evidence for the existing Core scope.
TypeScript and Python pass their declared full profile, and Java passes its
declared Money profile, with matching outcomes inside the applicable portable
floor. This statement does not claim full Java conformance, public package
availability, production readiness, external certification, cross-domain
composition proof, or behavior outside the named Draft 0.6 profiles.
```

**Verification:** Run the complete required Draft 0.6 quality matrix from a
clean checkout. Confirm final artifact and checksum identities against the
release record. If maintainers approve the immutable tag, create it only from
the verified committed revision and verify that it resolves to the recorded
artifact; otherwise record tag status factually as pending and do not claim the
immutable-tag exit gate is complete.

**Acceptance:** TASK-238 through TASK-254 are complete; all successful claims
validate and have zero failure, unsupported, or infrastructure outcomes;
mandatory checks are green; exact capability limits and compatibility
relationships are published; every material finding has a final disposition;
release evidence is reproducible; and the approved immutable tag has been
created and verified. If tag approval is unavailable, TASK-255 remains pending
and the release record identifies that blocker without using the closure
statement.

**Current status:** Complete. The immutable `core-draft-0.6` tag resolves to
`f7c5a1857fad4f71e8cc7801cbbefde80c640bfb`. The tag annotation records the
checksum manifest SHA-256.

## 14. Draft 0.6 Closure Checklist

- [x] Opening revision, versions, inventories, and toolchains are locked.
- [x] Draft 0.6 finding and decision governance is active.
- [x] Every compatibility surface has an authority and evolution rule.
- [x] Numeric and allocation capability floors are decided and testable.
- [x] Structural, timestamp, nullability, ordering, identity, and error
  boundaries have explicit dispositions.
- [x] Core, conformance, Agentic, package, adapter, profile, evidence, and release
  versions are not conflated.
- [x] Additive, compatible, deprecating, and breaking changes are defined.
- [x] Stable identifiers cannot be silently reused or semantically replaced.
- [x] Full, domain, operation, and version-specific profile rules are published.
- [x] Capability declarations are distinct from conformance evidence.
- [x] Claim records identify exact scope, versions, revision, limits, and result
  counts.
- [x] Duplicate/orphan/drift and invalid-metadata checks have a CI-runnable
  command.
- [x] Profile-aware runner output cannot launder partial, unsupported, or
  infrastructure results into a pass.
- [x] Large decimals, extreme scales, allocation units, Unicode identifiers,
  timestamp offsets, absent/null, and declared order are exercised as required
  by accepted decisions.
- [x] TypeScript and Python pass the declared full profile.
- [x] Java passes the declared Money profile and reports other domains honestly.
- [x] Critical financial and compatibility-enforcement mutants are killed.
- [x] Specification, conformance, Agentic, implementation, tests, public API
  documentation, READMEs, and release notes are synchronized.
- [x] Release-relevant artifacts and checksums are reproducible from the current
  verified working tree.
- [x] Immutable release-tag status is factual and maintainer-approved.
- [x] No external review, certification, public-package, production-readiness,
  Draft 0.7 composition, or Draft 0.8 Agentic-manifest claim is invented.

## 15. Completion Review Questions

Before TASK-255 can close, answer explicitly:

```text
Did this work change normative financial behavior or only define its limits?
Did it require new or changed CoreDoc/specification requirements?
Did every new conformance vector derive from an accepted requirement?
Did portable error meaning or precedence change?
Did any canonical operation identifier or semantic contract change?
Did conformance format syntax or member meaning require a version bump?
Did profile, capability, claim, or compatibility metadata remain non-normative
with respect to financial behavior?
Did all affected TypeScript, Python, and Java scopes receive tests and public
documentation updates?
Did any implementation limit leak into the specification without an accepted
portable-floor decision?
Can a clean checkout reproduce the recorded claims and checksums?
Are unsupported, deferred, and not-yet-specified behavior still stated honestly?
```

Any `yes` answer requiring synchronized work must be resolved before closure.

## 16. Current Execution Status

```text
  NEXT CODEX TASK: Draft 0.6 is closed. Choose the next planned draft or maintenance task.
```

TASK-238 through TASK-255 are complete. The immutable `core-draft-0.6` tag has
been created and verified, so Draft 0.6 is the current closed portability and
compatibility hardening release.
