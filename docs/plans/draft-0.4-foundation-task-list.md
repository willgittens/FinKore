# FinKore Draft 0.4 Specification Foundation Task List

## 1. Purpose

Draft 0.4 is a foundation-stabilization release. Its purpose is to finalize and
align the existing FinKore specifications, CoreDoc, conformance contract,
Agentic Contract, and implementation documentation so that Draft 0.5 can add
Python and Java implementations against one clear language-neutral behavioral
baseline.

Draft 0.4 is not a feature release. It does not add Python or Java production
code, new financial domains, or deferred financial behavior. It may correct or
clarify existing normative behavior only when repository evidence identifies an
ambiguity, contradiction, omission, or cross-language portability blocker. A
material semantic change requires an explicit decision record and synchronized
specification, conformance, implementation, Agentic, and documentation changes.

The target outcome is an **implementation-ready Draft 0.4 baseline**, not an
unchangeable specification. Stable identifiers and compatibility rules must make
later evolution deliberate and traceable.

## 2. Confirmed Planning Decisions

- Draft 0.4 is foundation-only.
- Existing Money, Workflow, Audit, Approvals, and Entities behavior is the scope.
- Deferred Draft 0.3 topics remain deferred unless one prevents an unambiguous
  Python or Java implementation of already accepted behavior.
- TypeScript remains the reference implementation and a regression oracle; it is
  not the source of financial semantics.
- TypeScript changes are limited to corrections required by an accepted Draft
  0.4 specification finding.
- Python and Java readiness reviews are mandatory Draft 0.4 work, but Python and
  Java implementation begins in Draft 0.5.
- The pre-Draft-0.4 CoreDoc `v0.5` label is incorrect for the repository's
  release sequence. Draft 0.4 will align the CoreDoc title metadata, rule
  `Introduced`/`Last updated` metadata, status, and current-release references to
  Draft 0.4. Draft 0.5 is reserved for the later Python and Java implementation
  milestone.
- FinKore Core Draft versions identify the shared specification baseline.
  Conformance file-format versions and language package versions are separate
  compatibility dimensions and must not be inferred from the Core Draft number.
- The runner remains domain-neutral. Adapter fixtures and normalized results do
  not become production API requirements.
- Draft 0.4 closure must not claim Python or Java conformance.

## 3. Current Baseline

The starting point is the closed Draft 0.3 repository summarized in
`docs/releases/draft-0.3.md`:

- 381 normative clauses are indexed in `conformance/traceability.md`: 312
  covered, 69 not directly testable, 0 partial, 0 uncovered, 0 deferred, and 0
  blocking specification gaps.
- The manifest contains 244 vectors, all passing through the TypeScript
  conformance adapter at Draft 0.3 closure.
- Money, Workflow, Audit, Approvals, and Entities are the existing domains.
- The CoreDoc contains `CORE-001` through `CORE-005` but, at Draft 0.4 planning
  start, incorrectly identified itself and its rules as `v0.5`, while the
  then-current repository status identified FinKore Core as Draft 0.3. Draft 0.4
  will correct the CoreDoc to Draft 0.4 and document the separate version
  dimensions before other stabilization edits.
- Draft 0.3 explicitly deferred Money portability limits and metadata, Audit
  provenance, portable condition expressions, Workflow migration, delegation,
  escalation, broader identity registries, and other future domains.
- The optional Draft 0.3 cross-language proof was not selected. No
  cross-language portability evidence is currently claimed.

Baseline counts are planning inputs, not permanent acceptance criteria. TASK-167
must refresh them before later tasks rely on them.

## 4. Draft 0.4 Success Definition

Draft 0.4 is successful when a Python or Java implementer can determine, without
reading TypeScript source or inventing financial semantics:

1. which documents are authoritative and how their versions relate;
2. every supported domain capability and explicit non-capability;
3. exact input, output, error, mutation, ordering, identity, and serialization
   behavior where the specification makes those observable;
4. which requirements are normative and which examples or fixtures are not;
5. how each directly testable requirement is exercised by conformance vectors;
6. how to implement an adapter without importing financial rules into the
   runner or copying conformance-only fixtures into a production API;
7. which implementation choices remain idiomatic and language-specific; and
8. which questions are intentionally deferred rather than accidentally
   unspecified.

## 5. Non-Goals

Draft 0.4 must not:

- implement Python, Java, or another new language package;
- add ledger, journal entry, reconciliation, tax, interest, payment, settlement,
  or other new financial domains;
- implement Workflow migration, approval delegation or escalation, a condition
  expression language, Audit retention/provenance expansion, private currency
  namespaces, or other Draft 0.3 deferrals merely because they are useful;
- turn conformance fixture shapes into required production object models;
- prescribe language architecture, class hierarchies, decimal libraries,
  persistence, HTTP, framework, or packaging choices;
- promote conformance-local operation labels without the normal Agentic review;
- weaken tests, traceability, or mutation gates to simplify future ports;
- change stable requirement IDs, portable error codes, vector IDs, or canonical
  operation IDs without an explicit compatibility decision; or
- claim that passing TypeScript tests proves Python or Java readiness.

## 6. Finding and Decision Rules

Every audit finding must be classified as one of:

- **EDITORIAL** — wording or navigation changes with no semantic effect;
- **CLARIFICATION** — makes already-evidenced behavior explicit without changing
  observable outcomes;
- **NORMATIVE CHANGE** — changes, adds, or removes an observable obligation;
- **CONTRADICTION** — authoritative artifacts prescribe incompatible behavior;
- **PORTABILITY BLOCKER** — two reasonable Python, Java, and TypeScript
  implementations could produce different conforming observations; or
- **DEFERRED TOPIC** — intentionally outside the Draft 0.4 baseline.

For every `NORMATIVE CHANGE`, `CONTRADICTION`, or `PORTABILITY BLOCKER`:

1. cite the exact current artifacts and stable identifiers;
2. record alternatives, recommendation, financial/control impact, and backward
   compatibility impact;
3. obtain explicit scoped maintainer acceptance;
4. change `/spec` before using conformance or implementation as the answer;
5. update vectors, traceability, errors, Agentic metadata, JSDoc, and READMEs
   wherever affected; and
6. retain regression and mutation-sensitive coverage for the accepted result.

If financial semantics remain ambiguous, the task is `BLOCKED BY SPEC GAP`. Do
not choose the behavior that happens to match TypeScript.

## 7. Execution Protocol

1. Execute one task at a time in numeric order unless its dependency field
   explicitly permits parallel work.
2. Before each task, read `AGENTS.md`, this task list, the cited artifacts, and
   the current Draft 0.4 decision/evidence records once they exist.
3. Begin with read-only evidence. Do not edit normative text until the finding is
   classified and any required decision is accepted.
4. Record release-level verification in `docs/releases/draft-0.4.md`. Record
   durable normative history, attributed material findings, and accepted
   foundation decisions in CoreDoc or the affected specification beside stable
   identifiers. Do not create a developer-task evidence archive.
5. Check a task only after every acceptance item passes. A blocked task remains
   unchecked and records the exact missing decision or evidence.
6. Preserve unrelated user changes and do not renumber completed task IDs.
7. Before Node-based verification, follow the repository Node toolchain rule.
8. Every accepted change evaluates required updates to unit tests, conformance,
   mutation-sensitive tests, JSDoc, READMEs, `/spec`, `/conformance`, `/agentic`,
   and `AGENTS.md`.

Recommended status block:

```text
NEXT TASK: TASK-177
LAST COMPLETED: TASK-176 (Milestone B — CoreDoc Alignment)
BLOCKED ON: NONE
```

Recommended completion note:

```text
Completion:
- Status: COMPLETE | BLOCKED
- Findings: <classification, identifiers, and decision references>
- Verification: <commands/checks, source revision, and outcomes>
- Documentation: <updated artifacts or explicit no-change rationale>
- Next task: <stable task ID or blocker>
```

## 8. Milestone Dashboard

- [x] Foundation and authority: TASK-167–TASK-171
- [x] CoreDoc alignment: TASK-172–TASK-176
- [ ] Domain specification stabilization: TASK-177–TASK-185
- [ ] Cross-language portability contract: TASK-186–TASK-193
- [ ] Conformance and implementer documentation: TASK-194–TASK-198
- [ ] Alignment and Draft 0.5 handoff: TASK-199–TASK-202
- [ ] Draft 0.4 closure: TASK-203–TASK-206

## 9. Dependency Overview

```text
TASK-167 baseline refresh
  -> TASK-168 scope/deferred lock
  -> TASK-169 authority and version taxonomy
  -> TASK-170 Draft 0.5 readiness contract
  -> TASK-171 review and decision framework

TASK-169 + TASK-171
  -> TASK-172 CoreDoc inventory
  -> TASK-173 bidirectional CoreDoc/spec mapping
  -> TASK-174 counterexample and contradiction review
  -> TASK-175 accepted CoreDoc corrections
  -> TASK-176 CoreDoc alignment gate

TASK-176
  -> TASK-177 shared conventions/glossary
  -> TASK-178 Money
  -> TASK-179 Workflow
  -> TASK-180 Audit
  -> TASK-181 Approvals
  -> TASK-182 Entities

TASK-177..182
  -> TASK-183 cross-domain consistency
  -> TASK-184 portable error consistency
  -> TASK-185 specification stabilization gate

TASK-185
  -> TASK-186 abstract value and representation review
  -> TASK-187 numeric/decimal portability
  -> TASK-188 optionality/time/order/identity portability
  -> TASK-189 operation/effect/atomicity inventory
  -> TASK-190 Python readiness review
  -> TASK-191 Java readiness review
  -> TASK-192 portability blocker remediation
  -> TASK-193 portability gate

TASK-193
  -> TASK-194 conformance schema/manifest audit
  -> TASK-195 vector and traceability audit
  -> TASK-196 runner/adapter contract audit
  -> TASK-197 implementation guide
  -> TASK-198 conformance onboarding guide

TASK-198
  -> TASK-199 Agentic alignment
  -> TASK-200 repository documentation alignment
  -> TASK-201 Draft 0.5 implementation handoff
  -> TASK-202 full TypeScript regression oracle
  -> TASK-203 final inventory and traceability
  -> TASK-204 final review and unresolved-finding gate
  -> TASK-205 Draft 0.4 baseline record
  -> TASK-206 Draft 0.4 closure
```

Domain audits TASK-178–TASK-182 may run independently after TASK-177, but their
findings must be merged serially through TASK-183. Python and Java readiness
reviews may run independently after TASK-189, but both feed TASK-192. Shared
normative, traceability, manifest, Agentic, and status files should be edited
serially.

## 10. Detailed Task List

### Milestone A — Foundation and Authority

### - [x] TASK-167 — Refresh the Closed Draft 0.3 Baseline

**Depends on:** TASK-166.

**Objective:** Reproduce the current repository inventory and verification
baseline before Draft 0.4 edits begin.

**Deliverables:** Add the refreshed baseline to the `UNRELEASED` Draft 0.4
release note; record the source revision, dirty-worktree state,
specification/requirement/vector/operation/error inventories, current deferred
topics, Node toolchain, build, strict typecheck, unit tests, full conformance,
coverage, mutation reports, and documentation-link checks available in the
repository.

**Acceptance:** Counts and commands are reproducible; failures and stale evidence
are identified rather than copied from TASK-166; no normative behavior changes.

**Stop:** Any regression, uncovered mandatory requirement, blocking spec gap, or
critical surviving mutant blocks reliance on the Draft 0.3 baseline.

### - [x] TASK-168 — Lock Draft 0.4 Scope and Deferred Topics

**Depends on:** TASK-167.

**Objective:** Turn the confirmed foundation-only direction into a precise scope
boundary.

**Deliverables:** Inventory all open questions and Draft 0.3 deferrals; label each
`IN 0.4 ONLY IF PORTABILITY-BLOCKING` or `DEFERRED BEYOND 0.4`; reconcile the
Draft 0.3 release note, conformance gap notes, CoreDoc boundaries, READMEs, and
`AGENTS.md`.

**Acceptance:** No deferred feature silently becomes 0.4 work; each existing
domain and artifact layer is included in the stabilization review.

### - [x] TASK-169 — Align Authority, Release, Draft, and Format Version Taxonomy

**Depends on:** TASK-168.

**Objective:** Apply the confirmed version model: the shared specification and
CoreDoc stabilization baseline is FinKore Core Draft 0.4; Draft 0.5 is the later
Python and Java implementation milestone; conformance formats and language
packages have separate compatibility versions.

**Deliverables:** Record the accepted decision and compatibility effects. Change
the CoreDoc `v0.5` header, status/current-release wording, rule `Introduced` and
`Last updated` metadata, and relationship section to Draft 0.4 terminology.
Reconcile current-status references in `README.md`, `/spec`, `/conformance`,
`/agentic`, implementation documentation, and `AGENTS.md`. State which artifact
is authoritative when labels differ and distinguish the shared behavioral
baseline from conformance syntax and package versions.

**Acceptance:** The maintainer decision in this task list is recorded in
CoreDoc's evolution history; current CoreDoc metadata says Draft 0.4 consistently;
conformance format `0.1` remains a syntax compatibility version unless its shape
actually changes; package versions remain independently governed; no label
implies Python or Java implementation already exists.

**Stop:** If historical metadata shows that changing an existing `Introduced`
value would erase a published provenance fact, preserve that fact and request a
specific metadata migration decision rather than silently rewriting history.

### - [x] TASK-170 — Define the Draft 0.5 Implementation-Readiness Contract

**Depends on:** TASK-169.

**Objective:** Define the evidence that must exist before Python and Java work may
begin.

**Deliverables:** A checklist covering authoritative behavior, portable values,
errors, effects, atomicity, mutation, deterministic context, operation coverage,
conformance adapter obligations, unsupported behavior, documentation, and
verification. Separate mandatory readiness from desirable later enhancements.

**Acceptance:** The checklist can be applied independently to both Python and
Java without requiring either language's architecture to be chosen in Draft 0.4.

### - [x] TASK-171 — Establish Draft 0.4 Review and Decision Governance

**Depends on:** TASK-169.

**Objective:** Adapt D03-REVIEW-001 for a stabilization release.

**Deliverables:** Define CoreDoc's durable evolution and review record structure,
including finding ownership, required domain/accounting/technical/security/
privacy review, exact artifact revision, maintainer acceptance, external-review
status, superseded normative decisions, and blocker handling. Release-level
implementation and verification facts belong in the release note, not CoreDoc.

**Acceptance:** No review credential or signoff is inferred; external review
status is factual; material semantic findings cannot close as editorial edits.

**Completion:** COMPLETE. Milestone A is recorded in
[Draft 0.4 release notes](../releases/draft-0.4.md) and
[CoreDoc](../coreDoc/core-doc.md). Findings were classified as EDITORIAL and
CLARIFICATION only; no normative financial behavior changed. Verification used
source revision `68e576b` with a clean starting worktree: build, strict
TypeScript, unit tests, coverage, full conformance, TypeScript core mutation,
runner mutation, and license validation passed. No configured Markdown link
checker was found. Next task: TASK-172.

### Milestone B — CoreDoc Alignment

### - [x] TASK-172 — Inventory CoreDoc Rules and Metadata

**Depends on:** TASK-169 and TASK-171.

**Objective:** Audit every `CORE-*` principle and rule as a stable normative
foundation.

**Deliverables:** Inventory rule text, rationale, interpretation, boundaries,
domain references, introduced/updated metadata, terminology, and status. Flag
missing, stale, contradictory, circular, or over-broad references.

**Acceptance:** Every CoreDoc identifier has one inventory row and a finding
classification; editorial-only metadata rules are respected.

### - [x] TASK-173 — Build Bidirectional CoreDoc-to-Spec Traceability

**Depends on:** TASK-172.

**Objective:** Prove that CoreDoc and domain specifications refine one another
without collapsing their different levels of abstraction.

**Deliverables:** Map each CoreDoc rule to exact requirement IDs and map each
normative domain family to a CoreDoc rule or an explicit `DOMAIN-LOCAL` rationale.
Record missing refinements and references that merely point at a document range
without establishing the relationship.

**Acceptance:** Both directions are complete; a mapping does not claim that
CoreDoc itself defines detailed domain behavior.

### - [x] TASK-174 — Review CoreDoc Counterexamples and Contradictions

**Depends on:** TASK-173.

**Objective:** Challenge foundation rules using financial, accounting, control,
security, privacy, and cross-domain counterexamples.

**Deliverables:** Attributed findings by stable CoreDoc rule, proposed resolution
or explicit deferral, and impact on existing specification behavior. Include
negative amounts, currency mismatch, rounding/allocation, failed state changes,
history/redaction, approval applicability/effectiveness, and identity/revision
examples.

**Acceptance:** Review distinguishes a true contradiction from a valid domain
refinement or an intentionally bounded non-goal.

**Stop:** Unresolved financial meaning or a silent CoreDoc/spec contradiction is
`BLOCKED BY SPEC GAP`.

### - [x] TASK-175 — Apply Accepted CoreDoc Corrections

**Depends on:** TASK-174 and accepted decision records.

**Objective:** Correct CoreDoc wording, boundaries, references, metadata, and
version terminology accepted for Draft 0.4.

**Deliverables:** Minimal CoreDoc edits plus synchronized spec/conformance/docs
changes when a correction affects normative behavior. Preserve stable IDs and
historical traceability.

**Acceptance:** Every edit cites its finding; changes do not pull deferred
domains into scope; normative changes receive tests and traceability where
observable.

### - [x] TASK-176 — Close the CoreDoc Alignment Gate

**Depends on:** TASK-175.

**Objective:** Confirm CoreDoc is a sound foundation for the existing domain
specifications and the Draft 0.5 implementation work.

**Acceptance:** Bidirectional mapping is complete; zero unresolved
contradictions; version/status language is consistent; review evidence and
external-review status are explicit; Markdown links and stable references pass.

**Completion:** COMPLETE. Milestone B is recorded in the
[Draft 0.4 CoreDoc Alignment Record](../coreDoc/draft-0.4-alignment.md), linked
from [CoreDoc](../coreDoc/core-doc.md), and summarized in the
[Draft 0.4 release note](../releases/draft-0.4.md). Findings were classified as
EDITORIAL or CLARIFICATION only; no normative financial behavior changed.
Verification: `npm run docs:check`, `npm run typecheck`, `npm run license:check`,
`npm test`, and `git diff --check` passed. Next task: TASK-177.

### Milestone C — Domain Specification Stabilization

### - [ ] TASK-177 — Stabilize Shared Conventions and Glossary

**Depends on:** TASK-176.

**Objective:** Make normative-language, terminology, identifier, decimal,
timestamp, JSON, nullability, error, example, and compatibility conventions
unambiguous across languages.

**Deliverables:** Audit `spec/conventions.md`, `spec/glossary.md`, all uses of
normative keywords, all open questions, and conflicts between shared and domain
terms. Record whether language such as “unsupported,” “invalid,” “absent,”
“null,” “current,” “revision,” and “version” has one stable meaning or an
explicit refinement.

**Acceptance:** Normative examples are identifiable; non-normative examples do
not create obligations; every portable value states omission/null behavior at
the appropriate layer.

### - [ ] TASK-178 — Stabilize the Money Specification

**Depends on:** TASK-177.

**Objective:** Audit existing Money representation, serialization, currency,
arithmetic, comparison, rounding, rates, allocation, and portable errors for
complete language-neutral behavior.

**Required contrasts:** Canonical versus merely valid decimal strings, negative
zero, scale preservation versus numeric equality, division and rate precision,
rounding-required triggers, all negative rounding boundaries, allocation order
and remainder conservation, currency compatibility, input non-mutation, and
invalid/unsupported precedence.

**Acceptance:** A Python `decimal` implementation and Java `BigDecimal`
implementation could agree without copying TypeScript decimal internals. Draft
0.3 precision limits, minor-unit policy, and private currencies stay deferred
unless an existing operation is otherwise indeterminate.

### - [ ] TASK-179 — Stabilize the Workflow Specification

**Depends on:** TASK-177.

**Objective:** Audit definitions, states, transitions, guards, terminal states,
version identity/binding, import, conflicts, and errors.

**Required contrasts:** Definition versus instance identity, definition version
versus instance revision, exact state identity, guard evaluation context,
validation/error precedence, expected preconditions, rejected-operation
atomicity, import observation versus migration, and absence of persistence or
locking semantics.

**Acceptance:** Existing transition/import observations are deterministic;
Workflow migration and distributed concurrency remain explicit non-capabilities.

### - [ ] TASK-180 — Stabilize the Audit Specification

**Depends on:** TASK-177.

**Objective:** Audit events, actors, changes, append-only behavior, relationships,
redaction, ordering statements, and errors.

**Required contrasts:** Logical history versus storage, append order versus
distributed order, unknown versus omitted actor, redacted versus absent versus
null, relationship validation, original fact preservation, error precedence,
and non-mutating failure.

**Acceptance:** Implementers can preserve required evidence without inventing an
event store, global order, retention law, or expanded provenance model.

### - [ ] TASK-181 — Stabilize the Approvals Specification

**Depends on:** TASK-177.

**Objective:** Audit requirements, decisions, conditions, chains, composition,
validity, lifecycle evidence, evaluation context, and errors.

**Required contrasts:** Eligibility versus authorization, applicable versus
inapplicable, missing fact versus null, pending versus rejected, Decision
history versus current effectiveness, subject/revision binding, opposing and
duplicate votes, fixed quorum membership, ordered stages, bounded nesting,
actionable requirements, complete validation, and error precedence.

**Acceptance:** Existing bounded composition is deterministic without a rules
engine, IAM/RBAC, delegation, escalation, or dynamic approver lookup.

### - [ ] TASK-182 — Stabilize the Entities Specification

**Depends on:** TASK-177.

**Objective:** Audit identity, definitions, lifecycle, mutability, validation,
revision, import, evolution, Audit integration, and errors.

**Required contrasts:** Stable identity versus business revision versus conflict
version, mutation versus transition, correction/reversal/void/supersession,
current versus historical observations, import mapping versus registry,
precondition ordering, required Audit evidence, duplicate relations, and failure
atomicity.

**Acceptance:** Implementers can reproduce existing Entity behavior without
assuming a database version, registry, migration file format, or concrete
accounting posting effect.

### - [ ] TASK-183 — Resolve Cross-Domain Terminology and Invariant Findings

**Depends on:** TASK-178–TASK-182.

**Objective:** Reconcile findings that cannot be judged inside one domain.

**Deliverables:** A cross-domain matrix for identity, revision/version,
currentness, applicability, validation, atomicity, Audit evidence, timestamps,
portable values, and shared error priority. Resolve actual conflicts through the
decision process; document legitimate refinements explicitly.

**Acceptance:** The same term is not assigned incompatible meanings silently;
dependency direction between domain rules remains explicit.

### - [ ] TASK-184 — Audit the Consolidated Portable Error Contract

**Depends on:** TASK-183.

**Objective:** Ensure portable error categories and precedence are complete and
consistent across specifications, vectors, TypeScript, adapters, JSDoc, and
Agentic descriptors.

**Deliverables:** Inventory every code, triggering conditions, precedence,
exhaustiveness statement, details/privacy policy, failure atomicity, and
language-neutral mapping expectation. Class names and messages must remain
non-portable.

**Acceptance:** No orphan, conflicting, or implementation-invented portable code;
future Python and Java exceptions can map to the same category without matching
TypeScript class names.

### - [ ] TASK-185 — Close the Specification Stabilization Gate

**Depends on:** TASK-184.

**Objective:** Establish one internally consistent Draft 0.4 specification
baseline before authoring portability guidance.

**Acceptance:** All findings are resolved, explicitly deferred, or blocking;
zero unresolved contradictions and zero blocking gaps; requirement IDs remain
stable; directly testable changes have failing-then-passing vectors; affected
TypeScript behavior and documentation are synchronized.

### Milestone D — Cross-Language Portability Contract

### - [ ] TASK-186 — Define the Abstract Value and Representation Boundary

**Depends on:** TASK-185.

**Objective:** State which value semantics are normative, which serialized forms
are normative, which representations are conformance-only, and which production
API choices remain idiomatic.

**Deliverables:** A language-neutral representation inventory for Money,
identifiers, states, timestamps, collections, histories, results, portable
errors, absence/redaction sentinels, operation inputs, and observations.

**Acceptance:** Conformance fixtures are not mislabeled as production schemas;
normative serialization is identified where it truly exists; unspecified
serialization remains unspecified rather than inferred.

### - [ ] TASK-187 — Close Decimal and Numeric Portability Ambiguities

**Depends on:** TASK-186.

**Objective:** Compare existing semantics against realistic Python decimal and
Java decimal/integer models without selecting libraries as normative.

**Deliverables:** A matrix for exact base-10 parsing, canonical output, equality,
scale, exponent rejection/acceptance, signed zero, precision growth, division,
rounding modes including negative ties, ratios, integer bounds, overflow, and
unsupported capability handling.

**Acceptance:** Every current Money vector has one intended outcome in both
languages. If no portable outcome exists, record a blocker; do not silently add
precision floors or overflow behavior deferred by Draft 0.3.

### - [ ] TASK-188 — Close Structural, Time, Ordering, and Identity Portability Ambiguities

**Depends on:** TASK-186.

**Objective:** Review non-numeric differences likely to diverge across Python,
Java, JavaScript, and JSON tooling.

**Deliverables:** Decisions or explicit boundaries for omitted versus null,
unknown fields, duplicate keys/members, map versus array order, stable declared
order, Unicode/ASCII constraints, case sensitivity, RFC 3339 offsets and instant
comparison, timezone independence, immutable observations, opaque identifiers,
and deterministic diagnostic details.

**Acceptance:** Observable order and equality are specified; host locale,
timezone, hash/map order, object identity, and wall clock cannot alter results.

### - [ ] TASK-189 — Inventory Operations, Effects, Preconditions, and Atomicity

**Depends on:** TASK-187 and TASK-188.

**Objective:** Give future implementers a behavior-centered operation map without
prescribing class APIs.

**Deliverables:** For every canonical and conformance-local operation, record
authority, inputs, outputs, explicit context, preconditions, error precedence,
mutation/no-mutation, postconditions, determinism, requirement IDs, vectors, and
whether the error list is exhaustive.

**Acceptance:** Canonical IDs and fixture labels remain distinct; all rejected
state-changing operations have an observable atomicity statement where required.

### - [ ] TASK-190 — Conduct a Python Implementation-Readiness Desk Review

**Depends on:** TASK-189.

**Objective:** Walk through every existing operation as a prospective Python
implementer using only specifications, operation metadata, conformance docs, and
public implementation guidance.

**Deliverables:** A gap report covering decimal behavior, immutable/value
semantics, exceptions to portable errors, datetimes, mappings/order, recursion
limits, JSON boundaries, adapter normalization, packaging-independent API
freedom, and test execution. Small disposable probes may validate platform
behavior but must not become a Python implementation.

**Acceptance:** Every question is answered by an authoritative artifact or
classified as a finding; the review does not depend on reading TypeScript source
for semantics.

### - [ ] TASK-191 — Conduct a Java Implementation-Readiness Desk Review

**Depends on:** TASK-189.

**Objective:** Walk through every existing operation as a prospective Java
implementer using the same language-neutral artifacts.

**Deliverables:** A gap report covering `BigDecimal` value/scale distinctions,
rounding mode mapping, integer limits, immutable/value semantics, exceptions,
`java.time`, collection order, recursion limits, JSON boundaries, adapter
normalization, packaging-independent API freedom, and test execution. Small
disposable probes may validate platform behavior but must not become a Java
implementation.

**Acceptance:** Every question is answered or classified; Java-specific defaults
are not promoted into FinKore semantics.

### - [ ] TASK-192 — Resolve Python and Java Portability Blockers

**Depends on:** TASK-190 and TASK-191.

**Objective:** Resolve only the ambiguities that prevent equivalent
implementations of accepted behavior.

**Deliverables:** Accepted decisions, minimal spec-first corrections, new or
updated conformance vectors, TypeScript regression corrections where required,
mutation-sensitive tests, JSDoc/README/Agentic updates, and explicit deferrals
for non-blocking enhancements.

**Acceptance:** Both desk-review reports have zero unresolved blockers; no new
feature is disguised as portability remediation.

### - [ ] TASK-193 — Close the Cross-Language Portability Gate

**Depends on:** TASK-192.

**Objective:** Confirm Draft 0.4 behavior is implementable in Python and Java
without language-specific semantic invention.

**Acceptance:** Numeric and structural matrices are complete; all operations are
walked through; zero unresolved portability blockers; deferred capability limits
are explicit; no implementation/conformance claim is made for either language.

### Milestone E — Conformance and Implementer Documentation

### - [ ] TASK-194 — Audit Conformance Schema and Manifest Portability

**Depends on:** TASK-193.

**Objective:** Ensure a non-TypeScript adapter can parse, validate, select, and
execute the conformance corpus consistently.

**Deliverables:** Review schema dialect, format-version handling, unknown-member
policy, path resolution, unique IDs, operation registration, input/context
separation, expected-result exclusivity, JSON-number avoidance, deterministic
file/vector ordering, and validation diagnostics.

**Acceptance:** Any format change is compatibility-decision-driven and tested;
no financial validation enters the runner; manifest version is not confused
with Core Draft 0.4.

### - [ ] TASK-195 — Audit Vectors and Traceability for Language Neutrality

**Depends on:** TASK-194.

**Objective:** Verify that vectors derive from `/spec` and do not encode
TypeScript API or normalization accidents.

**Deliverables:** Requirement-to-vector and vector-to-requirement checks,
operation coverage, deterministic fixtures, portable JSON values, success/error
observations, atomicity observations, positive/negative/boundary/invariant/
regression/mutation-sensitive balance, and justification for every `NOT DIRECTLY
TESTABLE` row.

**Acceptance:** Zero orphan vectors, invalid requirement references, partial or
uncovered directly testable mandatory requirements, and blocking spec gaps.

### - [ ] TASK-196 — Audit the Runner and Adapter Contract Boundary

**Depends on:** TASK-195.

**Objective:** Make the adapter contract implementable without importing domain
logic into the runner or fixture logic into production core.

**Deliverables:** Document dispatch, input translation, normalized success/error
results, observations, unsupported versus infrastructure errors, metadata,
process/transport expectations, exit status, deterministic execution, and
diagnostic privacy. Audit the TypeScript adapter for behavior that belongs in
core or conformance docs.

**Acceptance:** Runner remains domain-neutral; adapter owns translation only;
unsupported behavior cannot be reported as passing; Python and Java adapters may
use different internal APIs.

### - [ ] TASK-197 — Publish the Language-Neutral Implementation Guide

**Depends on:** TASK-196.

**Objective:** Provide a concise entry point for future implementation authors.

**Deliverables:** Create an implementation guide under `docs/` covering source
of truth, reading order, architecture boundaries, normative versus idiomatic
choices, value semantics, errors, effects/atomicity, deterministic context,
conformance workflow, mutation expectations, JSDoc-equivalent public API docs,
and how to report a specification gap.

**Acceptance:** The guide links to authoritative rules instead of restating them
as a second specification; examples for Python and Java are explicitly
non-normative unless backed by a normative serialization.

### - [ ] TASK-198 — Publish the Conformance Adapter Onboarding Guide

**Depends on:** TASK-197.

**Objective:** Make bringing a new language implementation under conformance a
repeatable process.

**Deliverables:** Document build/run boundary, adapter handshake or invocation,
operation discovery, vector selection, normalization, unsupported and
infrastructure outcomes, debugging, complete-suite reporting, regression policy,
and evidence needed before claiming conformance.

**Acceptance:** A Python or Java contributor can identify every integration step
without treating the TypeScript adapter as normative architecture.

### Milestone F — Alignment and Draft 0.5 Handoff

### - [ ] TASK-199 — Align the Agentic Contract with the Stabilized Baseline

**Depends on:** TASK-198.

**Objective:** Verify operation descriptors remain a faithful, language-neutral
view of accepted specification behavior.

**Deliverables:** Audit operation IDs, requirements, inputs/outputs, effects,
preconditions, postconditions, errors, determinism, mutation, safety, discovery,
capabilities, and conformance-local boundaries.

**Acceptance:** No AI-specific bypass; no new financial behavior; no premature
operation promotion; descriptor version terminology follows TASK-169.

### - [ ] TASK-200 — Synchronize Repository Documentation and Navigation

**Depends on:** TASK-199.

**Objective:** Make all current-status documentation describe Draft 0.4 as it
actually exists.

**Deliverables:** Review root/spec/conformance/agentic/runner/TypeScript READMEs,
CoreDoc, `AGENTS.md`, architecture diagrams, package paths, supported operation
tables, error lists, examples, deferred topics, and links. Add navigation to the
implementation and adapter guides.

**Acceptance:** No stale Draft 0.3 current-status claim, no planned feature
described as implemented, no Python/Java conformance claim, and historical
records remain clearly historical.

### - [ ] TASK-201 — Create the Draft 0.5 Python and Java Handoff Checklist

**Depends on:** TASK-200.

**Objective:** Convert the Draft 0.4 baseline into bounded starting work for
Draft 0.5 without designing either implementation prematurely.

**Deliverables:** Shared prerequisites plus separate Python and Java bootstrap
checklists covering package skeleton, public API documentation, adapter boundary,
first vertical slice, test/conformance order, exact decimal choices to validate,
mutation tooling evaluation, CI expectations, and prohibition on implementing
unspecified behavior.

**Acceptance:** The recommended first slice is mature, isolated, and exercises
the full spec-to-conformance path; choosing it does not imply full-domain
conformance.

### - [ ] TASK-202 — Revalidate the TypeScript Reference Oracle

**Depends on:** TASK-192, TASK-196, and TASK-200.

**Objective:** Ensure stabilization edits did not leave the current reference
implementation or adapter inconsistent.

**Verification:** Run workspace build, strict typecheck, all unit tests, full
conformance, core and runner coverage, full core and runner mutation testing,
architecture checks, license checks, and documentation checks. Inspect all
survivors and report complete paths/counts.

**Acceptance:** All 0.4 vectors pass; aggregate mutation targets remain satisfied;
zero critical financial or runner mutants survive; no implementation behavior is
used to waive a specification finding.

### Milestone G — Draft 0.4 Closure

### - [ ] TASK-203 — Close Final Requirement, Vector, Error, and Operation Inventories

**Depends on:** TASK-202.

**Objective:** Produce the final machine- and human-auditable Draft 0.4 inventory.

**Deliverables:** Exact counts by domain and modality; requirement ID uniqueness;
CoreDoc mappings; vector coverage; error inventory; canonical and
conformance-local operation inventory; unsupported/deferred capability register;
and changes from the TASK-167 baseline.

**Acceptance:** Zero partial, uncovered directly testable mandatory requirements,
blocking spec gaps, invalid references, orphan portable codes, or unclassified
operation labels.

### - [ ] TASK-204 — Close Review Findings and Decisions

**Depends on:** TASK-203.

**Objective:** Confirm every Draft 0.4 finding has a valid disposition.

**Deliverables:** Final CoreDoc review/evolution matrix with finding
classification, owner, artifacts/revision reviewed, decision, resolution
evidence, remaining external review topics, and maintainer acceptance where
required. Record release verification separately in the Draft 0.4 release note.

**Acceptance:** No unresolved contradiction, normative change, security/privacy
issue, or portability blocker; deferred topics are explicit and do not affect
the implementation-ready claim.

### - [ ] TASK-205 — Record the Draft 0.4 Implementation Baseline

**Depends on:** TASK-204.

**Objective:** Identify exactly what Python and Java implementations will target
at the start of Draft 0.5.

**Deliverables:** Record source revision, authoritative artifact versions,
manifest/vector schema versions, vector and requirement inventories, accepted
decision set, verification results, implementation-readiness checklist, and
compatibility/change process. Use immutable release/tag references only if the
maintainer separately authorizes creating them.

**Acceptance:** The baseline is reproducible from repository content and does
not imply permanent immutability, publication, or unimplemented-language
conformance.

### - [ ] TASK-206 — Close FinKore Core Draft 0.4

**Depends on:** TASK-205.

**Objective:** Declare the stabilization release complete only when all prior
gates are satisfied.

**Required closure statement:**

```text
FINKORE CORE DRAFT 0.4 COMPLETE

The existing Money, Workflow, Audit, Approvals, and Entities specification
baseline is aligned with CoreDoc, traceable to language-neutral conformance,
documented for independent implementation, and ready to begin bounded Python
and Java implementation work in Draft 0.5. This statement does not claim Python
or Java implementation or conformance.
```

**Acceptance:** All TASK-167–TASK-205 items are complete; all mandatory checks are
green; documentation is current; external review status is factual; no blocker
is hidden by a deferral or by the TypeScript reference behavior.

## 11. Final Draft 0.4 Closure Checklist

- [ ] Scope remained foundation-only.
- [ ] Authority and version terminology are explicit.
- [ ] CoreDoc/spec traceability is complete in both directions.
- [ ] Existing domain specifications have zero unresolved contradictions or
  blocking gaps.
- [ ] Deferred Draft 0.3 topics were not silently implemented.
- [ ] Portable value, decimal, time, order, identity, error, effect, and atomicity
  semantics are sufficient for Python and Java.
- [ ] Python and Java desk reviews have zero unresolved portability blockers.
- [ ] Conformance schema, vectors, runner, and adapter contract are
  language-neutral.
- [ ] Directly testable mandatory requirements have vector coverage.
- [ ] TypeScript remains green as a reference oracle, including critical mutation
  review.
- [ ] Agentic metadata adds no separate financial behavior.
- [ ] Implementer and adapter onboarding guides are current.
- [ ] The Draft 0.5 handoff is bounded and does not claim full conformance early.
- [ ] Every material finding has scoped maintainer acceptance and exact evidence.
- [ ] Final documentation distinguishes implemented, passing conformance,
  unsupported, not yet specified, and deferred behavior.

## 12. Next Task

```text
NEXT CODEX TASK: TASK-177 — Stabilize Shared Conventions and Glossary
```

TASK-177 begins Milestone C. It must use the completed Milestone A authority
records and Milestone B CoreDoc alignment record before changing shared
conventions or glossary terms.
