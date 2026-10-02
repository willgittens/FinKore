# FinKore — Codex Agent Instructions

## Project overview

FinKore is an open-source, language-agnostic specification for predictable,
auditable, and portable financial domain behavior.

Core idea:

> CRUD is easy. Financial CRUD isn't.

FinKore is specification-first:

```text
Specification
      ↓
Conformance artifacts
      ↓
Agentic Contract
      ↓
Consumer-owned implementations and integrations
```

The repository publishes the contract and maintenance tooling. It does not
maintain a financial implementation, a Conformance Runner, a runner adapter API,
or installable language packages. Do not recreate those removed surfaces or
move financial behavior into repository tooling unless an accepted plan
explicitly changes the project scope.

## Repository responsibilities

### `/spec`

Canonical financial behavior. It defines normative requirements, invariants,
portable errors, domain terminology, and observable semantics.

Normative keywords include MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY. The
specification defines behavior, not implementation architecture. If behavior is
ambiguous, identify the specification gap instead of choosing semantics from a
fixture, historical implementation, language default, or imagined API.

### `/conformance`

Language-independent acceptance artifacts derived from `/spec`:

- the discovery manifest;
- JSON schemas;
- vector files;
- conventions and consumer guidance;
- requirement traceability;
- mutation-sensitive and boundary cases.

Conformance artifacts do not become a second specification. The repository
validates their structure and traceability but does not execute them against a
financial implementation. Consumers own implementation dispatch, normalized
observation, comparison, and reporting.

Do not add a runner contract, command-line protocol, transport envelope, or
language-specific adapter API to make the fixtures executable here.

### `/agentic`

The Agentic Contract describes canonical operation semantics for machine
clients. Operation identifiers use:

```text
finkore.<domain>.<operation>
```

Do not invent aliases for existing operations. Agentic metadata may describe
inputs, outputs, errors, effects, preconditions, postconditions, and safety
properties, but it must not override `/spec` or imply an executable server,
agent framework, transport, or authorization bypass.

### `/docs/coreDoc`

CoreDoc states foundation-level financial obligations. `/spec` refines those
obligations and must not silently contradict them. CoreDoc fields such as
`Introduced`, `Last updated`, and `Last updated on` are normative governance
metadata; do not alter them during editorial scope cleanup.

### `/docs/tools`

Repository-maintenance tools validate published artifacts, traceability,
architecture, documentation, and licensing. They must remain domain-neutral and
must not calculate financial outcomes or implement a FinKore operation.

Each executable tool must begin with a comment explaining its purpose, effects,
and that it does not define financial behavior. Verification runs locally; do
not add GitHub Actions.

## Source-of-truth order

When working on financial behavior, consult artifacts in this order:

1. `docs/coreDoc/core-doc.md` for foundation-level obligations.
2. `/spec` for precise normative behavior.
3. `/conformance` for portable acceptance cases and traceability.
4. `/agentic` for canonical operation semantics where applicable.
5. Historical plans and release notes for context only.

Current normative text wins over historical implementation behavior. A vector
that expects undefined behavior exposes an inconsistency; it does not authorize
inventing a rule.

## Development workflow

For new or changed financial behavior, use this sequence:

```text
Domain problem
      ↓
CoreDoc alignment
      ↓
Specification and stable requirement ID
      ↓
Conformance case and traceability
      ↓
Agentic metadata when applicable
      ↓
Artifact validation and adversarial review
      ↓
Consumer-owned implementation and execution
```

Before changing behavior:

1. Read the owning specification documents.
2. Identify existing requirement and portable error IDs.
3. Read related vectors and traceability entries.
4. Read Agentic metadata for affected canonical operations.
5. Confirm that the desired behavior is already defined or update the
   specification first.
6. Add positive, negative, boundary, invariant, and mutation-sensitive cases as
   appropriate.
7. Update all affected documentation and metadata in the same change.
8. Run the repository verification suite.

Do not start from a proposed class, method, package, runner feature, or
framework abstraction.

## Conformance artifact rules

Use `conformance/manifest.json` as the only vector discovery entry point. Keep
schema and format versions separate from the FinKore Core version.

Every vector must:

- have a stable, unique vector ID;
- reference valid normative requirement IDs;
- use canonical operation labels or the documented conformance-local label;
- express portable input and expected observation data;
- remain deterministic and language-independent;
- avoid prescribing a production API or internal architecture.

Do not silently change expected results to match historical implementation
behavior. If the specification and a vector disagree, investigate and repair
the correct layer.

Fixture metadata may retain historical labels such as `adapter` where they are
part of the published format or case history. Do not interpret those labels as
a maintained adapter API.

## Financial testing principles

Conformance cases should make plausible defects fail, not merely demonstrate a
happy path.

### Exactness

Never encode approximate binary floating-point comparison for Money. Monetary
values use exact FinKore decimal semantics.

### Determinism

Portable behavior must not depend on wall-clock time, host timezone, locale,
network calls, external FX providers, filesystem order, or uncontrolled
randomness. Inject explicit context when time, facts, policy, or state matters.

### Failure atomicity

Where a failed operation is non-mutating, expected observations must cover the
unchanged state as well as the portable error.

### Mutation sensitivity

Critical cases must detect defects such as removed currency checks, changed
arithmetic operators, altered rounding modes, bypassed workflow guards,
mutable audit history, invalid approval reuse, Entity identity changes, and
portable error substitutions. Consumers may use mutation testing or an
equivalent defect-resistance method; the repository publishes cases and
traceability, not language-specific mutation runs.

## Stable identifiers and portable errors

Do not casually rename requirement IDs, vector IDs, portable error codes, or
canonical operation IDs. Search all references before changing a stable
identifier and document the compatibility impact.

Portable error codes are language-independent. Exception types, messages,
stack traces, HTTP statuses, and result-wrapper designs are consumer choices.
Do not create a portable error that `/spec` does not define.

## Money and rounding

Before changing Money behavior, inspect `spec/money/` and
`conformance/money/`.

Money uses exact decimal semantics. Currency compatibility is explicit.
Rounding is explicit when required, and calculation scale is not automatically
the currency minor-unit scale. Portable modes are defined in
`spec/money/rounding.md`; in particular, `DOWN` and `FLOOR` are not
interchangeable for negative values.

Do not infer private/non-fiat currency namespace semantics beyond the current
specification.

## Scope discipline and deferred topics

Do not implement or specify a future domain merely because it appears useful.
Deferred areas include private currency namespaces, concrete ledger posting,
tax, FX sourcing, reconciliation, payment settlement, workflow migration and
distributed coordination, distributed audit total ordering, unrestricted
approval graphs, dynamic approver resolution, delegation, escalation, and
concrete correction/reversal accounting effects.

If a requested artifact requires resolving a deferred issue, report the gap.

## Documentation synchronization

Tests and documentation are part of the contract. For each meaningful change,
review whether it requires updates to:

- CoreDoc;
- `/spec`;
- conformance schemas, vectors, conventions, and traceability;
- Agentic operation metadata;
- the root or package-level README files;
- `docs/implementation-guide.md` and consumer guidance;
- repository tools and their tests;
- `AGENTS.md`;
- the current release plan.

Documentation must describe the repository that exists now. Historical plans
and release notes may describe removed implementations and past execution
results, but current-facing documentation must label those claims as historical
and must not present old install commands, API examples, support tables, or test
counts as current capability.

Release summaries belong only in `docs/releases/README.md`. Keep them concise.
Do not create closure reports, alignment records, checksums, provenance reports,
or review-evidence documents. Do not record planned or unreleased work as a
completed release.

## Node toolchain and local verification

The maintained toolchain requires Node `>=24.11.0 <25`.

Before running Node commands, check the machine environment. If a suitable
`node` is unavailable, look under the repository-local `.tools` directory and
use its Node binary. If neither exists, bootstrap the supported Node toolchain
under `.tools` according to `docs/tools/README.md`.

Python, Java, Maven, language-package builds, native unit tests, implementation
coverage, financial conformance execution, and implementation mutation testing
are not repository-maintained verification gates.

For a meaningful repository change, run:

```text
npm ci --no-audit
npm run verify
```

The verification suite checks artifact schemas, conformance vectors,
traceability, Agentic consistency, repository architecture, tool tests,
documentation links, and licenses. It is local after dependency installation
and does not query a vulnerability advisory service. Run
`npm run dependencies:audit` separately when a fresh network-backed dependency
review is required, and report its time and scope independently. Passing either
check does not prove that an external implementation conforms or that financial
behavior is exhaustively tested.

## Change discipline

Keep changes scoped. Do not refactor unrelated artifacts, broaden a milestone,
weaken mutation-sensitive cases, or change normative behavior during editorial
cleanup. Preserve architectural boundaries and stable identifiers.

If code and specification disagree, investigate rather than assuming either is
correct. Correct incompleteness is better than false financial precision.

Before completing significant work, explicitly evaluate:

```text
Did this change affect CoreDoc or normative requirements?
Did it require new or updated conformance cases and traceability?
Did it affect portable errors or stable identifiers?
Did it affect Agentic operations, effects, or safety metadata?
Did it require repository-tool or tool-test changes?
Did it leave any current-facing documentation stale?
Did all applicable local verification checks and separately required dependency
reviews pass?
```

## When requirements are unclear

Search `/spec`, `/conformance`, `/agentic`, CoreDoc, and traceability. If the
observable result is still undefined, state:

> This behavior is not currently defined by FinKore Core.

Describe the artifacts reviewed, plausible interpretations, and financial or
control impact. Do not fill the gap with an implementation guess.
