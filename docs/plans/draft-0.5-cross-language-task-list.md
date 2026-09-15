# FinKore Draft 0.5 Cross-Language Implementation Task List

## 1. Purpose

Draft 0.5 is the independent cross-language proof release. Its purpose is to
demonstrate that the closed FinKore Core Draft 0.4 behavior can be implemented
from `/spec` and verified through `/conformance` without copying TypeScript
financial logic or inventing language-specific semantics.

Draft 0.5 will use two deliberately asymmetric implementation tracks:

- **Python is the primary full-conformance track.** It targets the complete
  manifest-listed Draft 0.4 behavior.
- **Java is the independent second-language Money track.** It targets the full
  current Money suite and establishes a sound base for later completion of the
  remaining domains.

This is a staging decision, not a statement that Python is normative or that
Java is less important. A maintainer may reverse the primary and secondary
languages before implementation begins, provided the same independence and
closure gates are preserved.

This plan continues task numbering after Draft 0.4. It is non-normative:
CoreDoc and `/spec` define financial obligations, `/conformance` defines
portable observations, `/agentic` defines canonical operation semantics, and
release notes record shipped results.

## 2. Starting Baseline

Draft 0.5 starts from the closed Draft 0.4 repository described by:

- [Draft 0.4 Closure Record](../releases/draft-0.4-closure.md);
- [Draft 0.5 Python and Java Handoff](../draft-0.5-python-java-handoff.md);
- [Cross-Language Portability Contract](../../spec/draft-0.4-portability-contract.md);
- [Language-Neutral Implementation Guide](../implementation-guide.md); and
- [Conformance Adapter Onboarding Guide](../conformance-adapter-onboarding.md).

The planning baseline currently contains:

- 381 indexed requirements;
- 244 manifest-listed vectors across 35 operation labels;
- 83 Money vectors;
- 217 mutation-sensitive vectors;
- 31 portable error codes;
- 20 canonical Agentic operations; and
- 15 conformance-local operation labels.

TASK-207 must refresh these counts before implementation work relies on them.
They are planning inputs, not permanent release claims.

## 3. Confirmed Planning Decisions

- Draft 0.5 proves portability; it does not add a new financial domain.
- Python is the primary full-manifest implementation target.
- Java is the secondary full-Money implementation target.
- Both implementations begin with Money representation, serialization,
  addition, subtraction, comparison, and rounding.
- Implementers derive behavior from `/spec`, `/conformance`, and canonical
  Agentic metadata, not from TypeScript source.
- TypeScript remains a regression oracle after independent behavior has been
  derived. It is never the authority for resolving ambiguity.
- Public Python and Java APIs remain idiomatic. Only observable FinKore behavior,
  portable errors, normative serialization, and conformance outcomes are shared.
- Language cores must not depend on the runner, conformance fixtures, Agentic
  tooling, JavaScript, TypeScript, or each other.
- Cross-process bridges are adapter infrastructure. Their wire shape is not a
  FinKore production API or normative serialization.
- Unsupported operations remain explicit. Unsupported and infrastructure
  outcomes cannot be counted as passes.
- A specification ambiguity discovered by either implementation is a finding,
  not permission to imitate TypeScript.
- Draft 0.5 closes only with full Python conformance and full Java Money
  conformance against the final manifest applicable to each claim.
- No external review, production readiness, Java full-domain conformance, or
  1.0 compatibility guarantee is implied by Draft 0.5.

## 4. Success Definition

Draft 0.5 is successful when:

1. a Python implementation derived from the specification passes the complete
   Draft 0.4 manifest with zero failures, unsupported results, or infrastructure
   errors;
2. an independently designed Java implementation passes the complete Money
   suite with zero failures, unsupported results, or infrastructure errors;
3. both implementations expose idiomatic public APIs with portable FinKore
   error codes and meaningful public documentation;
4. the language cores preserve architectural independence from the runner and
   adapter fixtures;
5. every cross-language disagreement has been classified and resolved through
   the correct authority;
6. TypeScript remains green against the final Draft 0.5 artifact set;
7. critical financial mutants do not survive in the implemented scopes;
8. implementation and conformance claims identify exact revisions and supported
   scopes; and
9. documentation clearly distinguishes full Python conformance, Money-only Java
   conformance, unsupported Java domains, deferred behavior, and behavior that
   is not yet specified.

## 5. Non-Goals

Draft 0.5 must not:

- add ledger, journal, reconciliation, payment, settlement, tax, interest, or
  other new financial domains;
- resolve deferred precision, overflow, private-currency, Workflow migration,
  distributed ordering, approval delegation, escalation, or IAM topics unless
  one blocks implementation of existing behavior;
- require Python or Java to copy TypeScript classes, method names, decimal
  internals, error classes, or package structure;
- make a subprocess adapter protocol normative;
- turn a conformance fixture into a required production API;
- weaken a vector or requirement to accommodate an implementation defect;
- use binary floating point for financial decimal behavior;
- silently round, normalize identifiers, infer time, infer facts, or convert
  currencies;
- claim full Java FinKore conformance;
- publish packages or create immutable tags without separate maintainer
  authorization;
- claim production readiness, certification, regulatory approval, independent
  review, or external community signoff; or
- advance Agentic operation promotion beyond the stabilized Draft 0.4 registry.

## 6. Authority and Independence Protocol

### 6.1 Source Order

When behavior is unclear, use this order:

```text
CoreDoc foundation rule
        ↓
/spec precise behavior
        ↓
/conformance portable observation
        ↓
/agentic operation metadata
        ↓
language implementation
```

`/spec` remains authoritative for precise domain behavior. A conformance vector
that cannot be justified from `/spec` is a conformance finding. A TypeScript
behavior that cannot be justified from `/spec` is an implementation finding.

### 6.2 Spec-First Independence

This plan uses **spec-first independent implementation**, not a legal or
organizational clean-room claim.

Before completing a domain slice, its implementer must:

1. read the relevant CoreDoc, `/spec`, `/conformance`, `/agentic`, and
   implementation-guide material;
2. record any ambiguity before inspecting TypeScript financial logic;
3. write language-native tests derived from requirements and boundary cases;
4. implement the smallest correct language-native behavior;
5. run the applicable conformance vectors; and
6. inspect TypeScript only afterward for regression comparison or integration
   diagnosis, never to decide unspecified semantics.

Reading runner types, adapter contracts, vector schemas, and CLI behavior is
allowed when building adapter infrastructure. Copying or translating TypeScript
core financial algorithms is prohibited.

No financial-domain source code may be generated from another implementation.
Generated conformance plumbing is allowed only when it contains no domain rule
and its generated origin is documented.

## 7. Finding and Decision Rules

Every Draft 0.5 finding must be assigned a stable `D05-*` identifier and one of
these classifications:

- **EDITORIAL** — documentation or navigation correction with no semantic
  effect;
- **CLARIFICATION** — makes existing, evidenced behavior explicit without
  changing observable outcomes;
- **NORMATIVE CHANGE** — changes, adds, or removes an observable obligation;
- **CONTRADICTION** — authoritative artifacts prescribe incompatible behavior;
- **PORTABILITY BLOCKER** — two reasonable conforming implementations can
  produce different observable outcomes;
- **CONFORMANCE DEFECT** — a vector, schema, traceability row, or runner
  expectation is inconsistent with the specification;
- **IMPLEMENTATION DEFECT** — a language implementation violates defined
  behavior; or
- **TOOLING DEFECT** — build, bridge, runner, or reporting infrastructure
  prevents faithful verification without changing domain semantics.

Every `NORMATIVE CHANGE`, `CONTRADICTION`, `PORTABILITY BLOCKER`, or
`CONFORMANCE DEFECT` must record:

- affected CoreDoc and requirement identifiers;
- affected vectors, operations, errors, and implementations;
- a minimal cross-language reproducer;
- alternatives considered;
- compatibility and migration impact;
- domain, accounting, technical, security, and privacy consequences appropriate
  to the finding;
- the accepted resolution and maintainer acceptance; and
- synchronized changes required across specification, conformance, Agentic
  metadata, implementations, tests, and documentation.

A blocking finding stops the affected slice. Work may continue on independent
slices, but the release cannot close while a portability blocker,
contradiction, or unresolved normative change remains.

## 8. Target Repository Shape

The exact language build tools are selected in TASK-210. The intended dependency
direction is:

```text
Conformance Runner
    ↓
Language Conformance Adapter / Process Bridge
    ↓
Language Core
```

The target layout is:

```text
implementations/
├── typescript/
│   ├── core/
│   └── adapters/conformance/
├── python/
│   ├── core/
│   └── adapters/conformance/
└── java/
    ├── core/
    └── adapters/conformance/
```

The Python and Java cores must not import or depend on:

- `/runner`;
- `/conformance`;
- `/agentic`;
- TypeScript implementation packages;
- MCP, agent, HTTP, persistence, or UI frameworks; or
- the other language implementation.

Adapters may depend on their language core and the minimum infrastructure needed
to translate conformance fixtures. Financial validation must remain in the core.

## 9. Quality and Verification Gates

Every implemented domain slice must include, where applicable:

- language build and package validation;
- strict static analysis or compiler checks;
- unit tests derived from stable requirement IDs;
- exact assertions for Money;
- positive, negative, boundary, invariant, and regression cases;
- explicit failure non-mutation observations;
- selected and full-scope conformance execution;
- coverage reporting;
- mutation testing or a documented equivalent defect-resistance technique;
- public API documentation linked to relevant requirement IDs;
- architecture/dependency checks;
- documentation and license checks; and
- formatting or diff checks.

The mutation target is at least 95% for meaningful financial behavior, but the
aggregate score is secondary. No critical financial mutant may survive.
Equivalent mutants require explicit justification. Tooling timeouts must be
inspected rather than counted silently as success.

Coverage percentages are diagnostic evidence, not a substitute for behavior
coverage. Any uncovered financial branch in a claimed scope must be tested or
explicitly justified.

## 10. Milestone and Dependency Map

```text
Milestone A — Scope, governance, toolchains
    TASK-207 → TASK-208 → TASK-209 → TASK-210 → TASK-211 → TASK-212
                                                    │
                         ┌──────────────────────────┴──────────────────────────┐
                         ▼                                                     ▼
Milestone B — Python full track                         Milestone C — Java Money track
    TASK-213 → 214 → 215 → 216 → 217 → 218            TASK-226 → 227 → 228 → 229
       → 219 → 220 → 221 → 222 → 223 → 224 → 225          → 230 → 231
                         └──────────────────────────┬──────────────────────────┘
                                                    ▼
Milestone D — Cross-language resolution and closure
    TASK-232 → TASK-233 → TASK-234 → TASK-235 → TASK-236 → TASK-237
```

Python and Java tasks may proceed in parallel after TASK-212. Findings must be
recorded as they are discovered rather than deferred until TASK-232.

## 11. Detailed Task List

### Milestone A — Baseline, Governance, and Shared Infrastructure

### - [x] TASK-207 — Open Draft 0.5 and Lock the Implementation Baseline

**Depends on:** FinKore Core Draft 0.4 closure.

**Objective:** Establish the exact artifacts and revision that both new
implementations target.

**Deliverables:** Refresh requirement, vector, suite, operation, portable-error,
and mutation-sensitive counts; record the Core version, conformance format,
schema, TypeScript package versions, runner version, and source revision; create
the Draft 0.5 release-note shell without claiming implementation progress.

**Verification:** Run the complete existing TypeScript build, typecheck, unit
tests, conformance suite, documentation checks, license checks, and diff checks.

**Acceptance:** The baseline is reproducible, all existing checks are green, and
the release note distinguishes a target from completed work.

### - [x] TASK-208 — Establish the Draft 0.5 Finding Register

**Depends on:** TASK-207.

**Objective:** Ensure cross-language disagreements are investigated instead of
hidden in implementation choices.

**Deliverables:** A durable Draft 0.5 finding register or release-note section
using the classifications in Section 7, with owner, status, affected artifacts,
resolution, evidence, and maintainer-acceptance fields.

**Acceptance:** Every blocking class has an explicit release effect, and the
register cannot treat TypeScript behavior as dispositive evidence.

### - [x] TASK-209 — Record the Spec-First Independence Procedure

**Depends on:** TASK-207.

**Objective:** Make the implementation method auditable and realistic for a
shared repository.

**Deliverables:** Contributor-facing rules identifying allowed specification and
adapter references, prohibited financial-code copying, slice-level reading and
test order, ambiguity escalation, and when TypeScript comparison is allowed.

**Acceptance:** A contributor can distinguish infrastructure reuse from copying
domain semantics, and the procedure does not make an unverifiable legal
clean-room claim.

### - [x] TASK-210 — Select Python and Java Toolchains and Package Layouts

**Depends on:** TASK-208 and TASK-209.

**Objective:** Choose maintainable, reproducible language foundations without
embedding financial policy in tooling decisions.

**Deliverables:** Supported runtime/JDK ranges; package/build/test/static-analysis,
coverage, mutation, formatting, and documentation tooling; exact decimal and
timestamp strategy candidates; dependency policy; package coordinates; and the
final directory layout.

**Acceptance:** Selected tools run in local development and CI, support the
required quality gates, avoid binary floating-point financial arithmetic, and do
not impose framework or persistence dependencies on either core.

### - [x] TASK-211 — Design the Cross-Process Conformance Adapter Boundary

**Depends on:** TASK-210.

**Objective:** Allow the existing domain-neutral TypeScript runner to execute
Python and Java implementations without making the bridge protocol normative.

**Deliverables:** Adapter-owned request/response framing, process lifecycle,
reset/isolation behavior, timeout and crash mapping, stderr/diagnostic handling,
path resolution, deterministic ordering, and normalized result validation.

**Acceptance:** The runner remains domain-neutral; adapters contain translation
but no financial rules; crashes and malformed responses become infrastructure
errors; unsupported remains distinct; and the bridge is documented as
conformance infrastructure only.

### - [x] TASK-212 — Add the Draft 0.5 CI and Quality Matrix

**Depends on:** TASK-210 and TASK-211.

**Objective:** Make partial and final claims mechanically distinguishable.

**Deliverables:** CI jobs for TypeScript regression, Python, Java, selected
vectors, full claimed-scope conformance, coverage, mutation, architecture,
documentation, licensing, and clean-environment package installation. Jobs must
label experimental or unsupported scopes accurately.

**Acceptance:** A failed, unsupported, timed-out, or infrastructure-error vector
cannot produce a green conformance claim; required and advisory checks are
clearly identified; and incomplete Java domains are not run or reported as
supported.

### Milestone B — Python Full-Conformance Track

### - [x] TASK-213 — Create the Python Core Skeleton and Portable Error Model

**Depends on:** TASK-210 and TASK-212.

**Objective:** Establish an idiomatic Python package with strict architectural
boundaries.

**Deliverables:** Python core package, public entry point, portable-code-bearing
error model, package metadata, static checks, unit-test structure, API
documentation conventions, and dependency-boundary tests.

**Acceptance:** The core imports no runner/conformance/Agentic/TypeScript code;
public errors expose stable FinKore codes without making Python class names
portable; package build, static checks, and initial tests pass.

### - [x] TASK-214 — Create the Python Conformance Bridge and Unsupported Smoke Test

**Depends on:** TASK-211 and TASK-213.

**Objective:** Prove the runner can invoke Python and report partial capability
honestly before financial behavior is added.

**Deliverables:** Python process entry point, TypeScript adapter wrapper or
equivalent bridge integration, support discovery, normalized result translation,
reset behavior where needed, and tests for success plumbing, unsupported,
process failure, malformed output, and timeout handling.

**Acceptance:** An infrastructure smoke operation can cross the boundary;
unimplemented FinKore operations report `UNSUPPORTED`; bridge failures report
`INFRASTRUCTURE_ERROR`; and no financial rule exists in bridge code.

### - [x] TASK-215 — Implement Python Money Representation, Currency, and Serialization

**Depends on:** TASK-213 and TASK-214.

**Objective:** Implement the normative Money value and interchange boundary from
the specification.

**Deliverables:** Exact amount/currency value model; plain-decimal validation;
currency validation; numeric equality independent of insignificant trailing
zeros; canonical serialization/deserialization; portable input errors; API
documentation; and requirement-linked unit tests.

**Acceptance:** Relevant representation and serialization vectors pass; JSON
numbers, exponent notation, leading plus, non-finite values, missing members,
and invalid currency fail with the specified portable codes; unknown-member and
canonicalization behavior matches `/spec`.

### - [x] TASK-216 — Implement Python Money Addition, Subtraction, Negation, and Comparison

**Depends on:** TASK-215.

**Objective:** Implement the first exact Money operation slice.

**Deliverables:** Same-currency addition/subtraction, exact negation, exact
compatible-currency comparison, currency mismatch behavior, non-mutation tests,
negative and zero boundaries, and public documentation.

**Acceptance:** Applicable arithmetic and comparison vectors pass; no operation
uses binary floating point; operands remain unchanged on success and failure;
currency mismatch is never normalized or converted.

### - [x] TASK-217 — Implement Python Money Multiplication, Division, and Rates

**Depends on:** TASK-216.

**Objective:** Complete exact scalar and Rate behavior without implicit precision
loss.

**Deliverables:** Exact scalar multiplication; exact terminating division;
division-by-zero and rounding-required errors; decimal and percentage Rate
application; optional explicit rounding integration; invalid Rate handling; and
boundary tests.

**Acceptance:** Applicable arithmetic and Rate vectors pass; non-terminating
division never rounds implicitly; percentage conversion is exact; source Money
remains unchanged.

### - [x] TASK-218 — Implement Python Money Rounding

**Depends on:** TASK-215.

**Objective:** Implement every portable rounding mode with correct signed
boundaries.

**Deliverables:** Explicit target scale; `HALF_UP`, `HALF_EVEN`, `DOWN`, `UP`,
`FLOOR`, and `CEILING`; invalid-policy errors; positive, negative, tie, non-tie,
and no-discard tests; and API documentation.

**Acceptance:** All rounding vectors pass, especially negative `DOWN` versus
`FLOOR` and `UP` versus `CEILING`; scale is never derived silently from
currency metadata.

### - [x] TASK-219 — Implement Python Money Allocation

**Depends on:** TASK-216 and TASK-218.

**Objective:** Complete the Money domain with deterministic conservation.

**Deliverables:** Equal and positive-integer-ratio allocation, explicit target
scale, declared-order remainder distribution, positive/negative/zero totals,
invalid request handling, large-ratio tests, conservation assertions, and public
documentation.

**Acceptance:** Every allocation result preserves currency and sums exactly to
the source; all allocation vectors pass; invalid or unrepresentable requests
produce the specified error and no partial allocation.

### - [ ] TASK-220 — Close the Python Money Slice

**Depends on:** TASK-215 through TASK-219.

**Objective:** Demonstrate complete Python Money conformance before entering
stateful domains.

**Deliverables:** Full Money suite execution, coverage report, mutation report,
critical-mutant review, architecture check, public README/JSDoc-equivalent
review, and Money capability statement.

**Acceptance:** All manifest-listed Money vectors pass with zero unsupported or
infrastructure outcomes; mutation score meets the project target; zero critical
Money mutants survive; documentation lists exact supported and deferred Money
behavior.

**Current status:** Python Money implementation and conformance are complete:
83 Money vectors pass with zero failures, unsupported results, or infrastructure
errors. Packaged Python coverage now passes as part of the full Python coverage
gate. Mutation and critical-mutant evidence remain open.

### - [x] TASK-221 — Implement the Python Workflow Domain

**Depends on:** TASK-220.

**Objective:** Implement Workflow definitions, instances, transitions, guards,
terminal behavior, version binding, import observations, and conflict
preconditions.

**Deliverables:** Requirement-linked tests and APIs for exact state identity,
definition validation, initial/current state, directed transitions, explicit
facts, terminal rules, version mismatch, import, expected-state/revision
conflicts, error precedence, and failure state preservation.

**Acceptance:** All Workflow vectors pass; no wall clock, locale, persistence,
or distributed concurrency behavior is introduced; rejected operations preserve
state, revision, and binding as specified; critical mutants are killed.

### - [x] TASK-222 — Implement the Python Audit Domain

**Depends on:** TASK-221.

**Objective:** Implement logical Audit evidence without pretending to provide a
persistence or distributed-order system.

**Deliverables:** Events, actors, changes, append-only history, duplicate
handling, denied replace/remove operations, redaction representations and
evidence, relationships, deterministic ordering, portable errors, immutable
observations, and requirement-linked tests.

**Acceptance:** All Audit vectors pass; committed logical history cannot be
silently rewritten; redaction remains distinguishable from absence; failed
operations preserve history; critical Audit mutants are killed.

### - [x] TASK-223 — Implement the Python Approvals Domain

**Depends on:** TASK-222.

**Objective:** Implement the current bounded Approval model from explicit facts
and histories.

**Deliverables:** Requirements, Decisions, eligibility, conditions, validity,
withdrawal, expiration, supersession, lifecycle history, ordered/unordered
chains, any/all groups, N-of-M quorum, ordered stages, bounded nesting,
actionable requirements, error precedence, and requirement-linked tests.

**Acceptance:** All Approval vectors pass; missing facts never create silent
approval; stale, withdrawn, expired, rejected, and superseded states remain
distinguishable; no IAM, delegation, escalation, dynamic lookup, or unrestricted
graph behavior is invented; critical Approval mutants are killed.

### - [x] TASK-224 — Implement the Python Entities Domain

**Depends on:** TASK-221 through TASK-223.

**Objective:** Implement Entity behavior while preserving the underlying
Workflow, Audit, and Approval boundaries.

**Deliverables:** Identity, definition, lifecycle, declared field mutability,
validation, revision observations, import mapping and conflicts, correction,
reversal, void, supersession, required Audit evidence, portable error
preservation, failure atomicity, and requirement-linked tests.

**Acceptance:** All Entity vectors pass; stable identity and source mapping are
not conflated; ordinary mutation and evolution remain distinct; primary
Workflow/Audit errors are preserved where required; failures leave no partial
Entity, evolution, or Audit observation; critical Entity mutants are killed.

### - [ ] TASK-225 — Close Full Python Conformance

**Depends on:** TASK-220 through TASK-224.

**Objective:** Produce the first complete non-TypeScript conformance result for
the stabilized FinKore baseline.

**Deliverables:** Unfiltered manifest run; per-suite, requirement, critical, and
mutation-sensitive results; full unit/static/build/coverage/mutation reports;
architecture checks; clean-environment package installation; public API and
README review; and exact evidence revision.

**Acceptance:** The complete final manifest passes with zero failures,
unsupported results, or infrastructure errors; all critical financial mutants
are killed; no test depends on TypeScript behavior, host locale/timezone, wall
clock, network, or uncontrolled randomness; the full-Python claim is precisely
scoped to the Draft 0.5 baseline.

**Current status:** The Python adapter passes the complete current manifest: 244
vectors pass with zero failures, unsupported results, or infrastructure errors.
Packaged Python coverage passes at 86% line coverage across `finkore` source
with the complete manifest included in the measured run. Mutation and
critical-mutant evidence remain open before TASK-225 can close.

### Milestone C — Java Independent Money Track

### - [x] TASK-226 — Create the Java Core Skeleton and Portable Error Model

**Depends on:** TASK-210 and TASK-212.

**Objective:** Establish an idiomatic Java package independent from Python and
TypeScript designs.

**Deliverables:** Java core module, public entry point, portable-code-bearing
error model, package/build metadata, compiler/static checks, unit-test structure,
Javadoc conventions, and dependency-boundary tests.

**Acceptance:** The core imports no runner/conformance/Agentic/TypeScript/Python
code; error types expose portable codes without making Java class names
portable; build, static checks, and initial tests pass.

### - [x] TASK-227 — Create the Java Conformance Bridge and Unsupported Smoke Test

**Depends on:** TASK-211 and TASK-226.

**Objective:** Prove the runner can invoke Java with the same status integrity as
the Python bridge.

**Deliverables:** Java process entry point, adapter wrapper, support discovery,
normalized translation, reset/isolation behavior, and tests for unsupported,
crash, malformed output, timeout, and diagnostic handling.

**Acceptance:** Bridge results preserve PASS/FAIL/UNSUPPORTED/INFRASTRUCTURE_ERROR
distinctions; no financial behavior exists in adapter code; the protocol remains
implementation infrastructure.

### - [x] TASK-228 — Implement Java Money Representation, Currency, and Serialization

**Depends on:** TASK-226 and TASK-227.

**Objective:** Independently implement the normative Money boundary using an
exact Java decimal strategy.

**Deliverables:** Exact value model, syntax validation before decimal parsing,
scale-insensitive numeric equality, currency validation, canonical
serialization/deserialization, portable errors, Javadoc, and requirement-linked
tests.

**Acceptance:** Relevant representation and serialization vectors pass;
`BigDecimal.equals` or equivalent scale-sensitive equality is not used as Money
numeric equality; exponent/numeric/non-finite invalid inputs are rejected as
specified; no value is parsed through `double`.

### - [x] TASK-229 — Implement Java Money Arithmetic, Comparison, and Rounding

**Depends on:** TASK-228.

**Objective:** Complete the recommended independent Money vertical slice.

**Deliverables:** Addition, subtraction, negation, multiplication, terminating
division, comparison, six portable rounding modes, explicit scale, currency
mismatch, division/rounding errors, non-mutation tests, and Javadoc.

**Acceptance:** Applicable arithmetic, comparison, and rounding vectors pass;
no implicit `MathContext` precision loss occurs; negative rounding boundaries
match the FinKore definitions; operands remain unchanged.

### - [x] TASK-230 — Implement Java Money Rates and Allocation

**Depends on:** TASK-229.

**Objective:** Complete the Java Money domain rather than closing after the
minimum vertical slice.

**Deliverables:** Decimal/percentage Rate application; exact or explicitly
rounded results; equal/ratio allocation with checked or unbounded integer unit
arithmetic; declared-order remainder handling; conservation and invalid-input
tests; and Javadoc.

**Acceptance:** Rate and allocation vectors pass; large ratios cannot overflow
silently; allocation results sum exactly to the source; failures return no
partial result.

### - [ ] TASK-231 — Close Full Java Money Conformance

**Depends on:** TASK-228 through TASK-230.

**Objective:** Produce a second independent implementation proof for the
complete Money suite.

**Deliverables:** Unfiltered Money suite execution, coverage and mutation
reports, critical-mutant review, architecture checks, clean-environment package
installation, README/Javadoc review, supported-operation list, and exact
evidence revision.

**Acceptance:** Every manifest-listed Money vector passes with zero failures,
unsupported results, or infrastructure errors; zero critical Money mutants
survive; non-Money operations remain explicitly unsupported and are not included
in the Java conformance claim.

**Current status:** Java Money implementation and conformance are complete: 83
Money vectors pass with zero failures, unsupported results, or infrastructure
errors. Non-Money operations remain explicitly unsupported. Packaged Java
coverage passes through Maven/JUnit/JaCoCo at 135 covered lines out of 144
package lines, with an 85% line-coverage gate enforced. Mutation and
critical-mutant evidence remain open before TASK-231 can close.

### Milestone D — Cross-Language Resolution, Evidence, and Closure

### - [ ] TASK-232 — Perform the Cross-Language Portability Review

**Depends on:** TASK-225 and TASK-231.

**Objective:** Use the independent implementations to challenge the Draft 0.4
portability assumptions.

**Deliverables:** Compare TypeScript, Python, and Java outcomes and implementation
questions for Money; compare TypeScript and Python for all other domains;
inventory differences in decimal behavior, absent/null handling, timestamps,
ordering, identity, error precedence, mutation, adapter normalization, and
unsupported capability reporting; finalize `D05-*` finding classifications.

**Acceptance:** Every observed difference is explained by allowed implementation
freedom or has a finding; implementation similarity is not treated as evidence;
no blocker is hidden by normalization.

### - [ ] TASK-233 — Resolve Accepted Draft 0.5 Findings Spec-First

**Depends on:** TASK-232.

**Objective:** Correct the authoritative layer responsible for each confirmed
problem.

**Deliverables:** Minimal synchronized edits to CoreDoc, `/spec`, conformance,
Agentic metadata, implementations, tests, Javadoc/docstrings, READMEs, and
release notes as required by each accepted finding; retained regressions for
every defect.

**Acceptance:** Every material change cites its finding; no requirement, vector,
portable error, or operation ID changes silently; new financial behavior is not
added merely to make an API convenient; no unresolved contradiction,
portability blocker, or conformance defect remains.

### - [ ] TASK-234 — Revalidate Every Affected Implementation and the Runner

**Depends on:** TASK-233.

**Objective:** Ensure finding resolution did not align one language by breaking
another or by moving financial logic into infrastructure.

**Deliverables:** Final TypeScript full verification, Python full verification,
Java Money verification, runner verification, coverage, mutation, architecture,
documentation, licensing, and diff checks; survivor inspection and failure
reporting.

**Acceptance:** TypeScript and Python pass the complete applicable manifest;
Java passes the complete Money suite; required mutation targets hold; zero
critical financial or runner mutants survive; runner and adapters preserve their
architectural boundaries.

### - [ ] TASK-235 — Synchronize Implementation and Contributor Documentation

**Depends on:** TASK-234.

**Objective:** Make each implementation usable without overstating its status.

**Deliverables:** Root and package README updates; installation and usage
examples; supported-operation and unsupported-domain tables; error-handling and
exact-decimal guidance; adapter commands; contributor workflow; API docs;
architecture diagrams where still accurate; and links to conformance evidence.

**Acceptance:** Documentation describes current code, not plans; Python full
conformance and Java Money-only conformance are impossible to confuse; examples
run in clean environments; no implementation claims to define FinKore.

### - [ ] TASK-236 — Close Draft 0.5 Inventories and Conformance Claims

**Depends on:** TASK-235.

**Objective:** Produce an auditable final scope and evidence record.

**Deliverables:** Final requirement/vector/error/operation inventories; supported
operation matrices for TypeScript, Python, and Java; finding dispositions;
coverage and mutation summaries; exact source and artifact revisions; deferred
and unsupported registers; and external-review status.

**Acceptance:** Counts reconcile across manifest, traceability, runner metadata,
Agentic registry, implementation support, and release notes; no unsupported
result is counted as a pass; external review is not implied; no stale capability
claim remains.

### - [ ] TASK-237 — Close FinKore Core Draft 0.5

**Depends on:** TASK-236.

**Objective:** Close the release only after independent portability has been
demonstrated for the declared scopes.

**Required closure statement:**

```text
FINKORE CORE DRAFT 0.5 COMPLETE

The stabilized FinKore Core behavior has been implemented independently in
Python for the complete manifest-listed scope and in Java for the complete Money
scope. TypeScript remains the reference implementation, not the source of
financial semantics. All declared conformance scopes pass with zero failures,
unsupported results, or infrastructure errors. This statement does not claim
full Java conformance, production readiness, external certification, or FinKore
behavior beyond the named Draft 0.5 scopes.
```

**Acceptance:** All TASK-207 through TASK-236 items are complete; mandatory
checks are green; findings have final dispositions; Python and Java claims match
their exact passing scopes; documentation and release evidence are current; no
blocker is hidden by TypeScript behavior, adapter normalization, or deferral.

## 12. Draft 0.5 Closure Checklist

- [ ] Baseline revision and inventories are recorded.
- [ ] Draft 0.5 finding governance is active.
- [ ] Spec-first independence procedure is documented and followed.
- [ ] Python and Java core dependency boundaries are enforced.
- [ ] Cross-process adapters contain no financial behavior.
- [ ] Python passes the complete final manifest.
- [ ] Java passes the complete final Money suite.
- [ ] TypeScript passes the complete final manifest.
- [ ] Unsupported and infrastructure outcomes are never counted as passes.
- [ ] Exact decimal behavior uses no binary floating-point shortcut.
- [ ] Failure atomicity and non-mutation observations are tested.
- [ ] Critical financial mutants are killed in every claimed scope.
- [ ] Public APIs have meaningful docstrings or Javadoc with requirement links.
- [ ] All portability disagreements have explicit findings and dispositions.
- [ ] CoreDoc, specification, conformance, Agentic metadata, implementations,
  tests, and documentation are synchronized where findings required changes.
- [ ] Python full-conformance and Java Money-only claims are clearly separated.
- [ ] Deferred behavior remains deferred unless an accepted blocker required a
  scoped resolution.
- [ ] No production, certification, or external-review status is invented.
- [ ] Release evidence identifies exact versions and revisions.

## 13. Current Execution Status

```text
NEXT CODEX TASK: Package mutation or accepted equivalent defect-resistance evidence for TASK-220, TASK-225, and TASK-231 before Milestone D closure review.
```

Milestone A is complete. Milestone B and Milestone C implementation and
conformance work are complete for their declared scopes, and packaged coverage
now passes for both Python and Java. TASK-220, TASK-225, and TASK-231 remain
open only for mutation or accepted equivalent defect-resistance evidence,
critical-mutant review, and final closure verification.
