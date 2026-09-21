# FinKore Python Core

This package is the Python implementation track for FinKore Core 0.9 release candidate. It is
derived from CoreDoc, `/spec`, `/conformance`, and `/agentic`, not from
TypeScript financial implementation code. It passes all 290 manifest vectors
on CPython 3.12 and 3.13, including 102 Money and 72 Approval vectors.
The implemented Money and Approval corrections pass clean-checkout release
verification. The [Core 0.9.2 plan](../../../docs/plans/plan-09.2.md) tracks the
remaining corrective release preparation.

This artifact is a repository reference implementation for the 0.9
release-candidate phase. It is not published to a Python package registry. The
Python package version identifies this implementation artifact; `CORE_VERSION`
identifies the FinKore Core behavioral baseline it implements.

Current status:

- Money representation, serialization, arithmetic, comparison, rates,
  rounding, and allocation are implemented.
- Workflow definitions, imports, transitions, guards, terminal behavior,
  version binding, and conflict preconditions are implemented.
- Audit event append, append-only rejection, actor/change validation with
  portable history/event/actor/duplicate/relationship error precedence,
  redaction representations, and relationships are implemented.
- Approval requirement, decision, condition, chain, lifecycle, and bounded
  composition behavior are implemented.
- Entity create, mutate, transition, import, revision observation, and
  evolution behavior are implemented.
- Public errors expose portable FinKore error codes; Python exception class
  names are not portable semantics.
- Audit and Approval timestamps use the strict portable FinKore RFC 3339
  profile. Values retain up to nine fractional digits, and Approval expiration
  compares exact nanoseconds rather than Python `datetime` microseconds.
- Money arithmetic, Rate application, allocation, and rounding preserve exact
  values independently of the caller's Decimal precision and rounding mode.
  Subtraction and negation use exact sign reversal; allocation constructs
  results directly from integer units and scale. These operations preserve
  operands and the caller's Decimal context. Precision reduction uses the
  explicit FinKore rounding arguments.
- Approval decision and requirement evaluation distinguish JSON Boolean and
  numeric facts such as `true` and `1`, including inside objects and arrays.
  Object member order is ignored; array order matters. Changed relevant facts
  invalidate prior decisions without modifying history or caller-supplied facts.

## Public Package Surface

The intentional Python package surface is the top-level `finkore` package and
its `__all__` list. Submodule helpers that are not re-exported from
`finkore.__all__` are implementation details for the current package and
conformance adapter, even when Python allows direct import by module path.

The public exports are:

- Metadata: `CORE_VERSION`.
- Error model: `FinKoreError`; portable consumers should inspect `error.code`.
- Money: `Money`.
- Workflow: `WorkflowDefinition`, `WorkflowInstance`, `create_workflow`,
  `import_workflow`, and `transition_workflow`.
- Audit: `append_event`, `replace_event`, `remove_event`, and
  `redact_history`.
- Approvals: `record_decision`, `evaluate_decision`, `evaluate_requirement`,
  `evaluate_condition`, `evaluate_chain`, `evaluate_composition`,
  `withdraw_decision`, `supersede_decision`, and `supersede_requirement`.
- Entities: `create_entity`, `mutate_entity`, `transition_entity`,
  `import_entity`, and `evolve_entity`.

This package supports CPython 3.12 and 3.13 and uses Python `int` and exact
`Decimal` construction from plain decimal strings. Portable allocation scales
are bounded by `50`, equal-part counts by `100`, and ratios by
`9007199254740991`. Money amount precision and other practical limits depend on
the Python runtime and available memory. Portable timestamps have the normative
nine-digit fractional limit.

The wheel and source distribution intentionally include package source,
`py.typed`, this README, `LICENSE`, `NOTICE.md`, and
`THIRD_PARTY_LICENSES.md`. Tests, coverage data, generated reports,
repository-local toolchains, and build outputs are excluded from the source
distribution. The release package gate installs the wheel into a new isolated
virtual environment and imports the documented top-level package surface.

Run the current local checks from the repository root:

```bash
npm run python:compile
npm run python:unit
npm run python:compat
npm run python:coverage:setup
npm run python:coverage
npm run python:mutation:critical
npm run conformance:python
```

The packaged Python coverage gate runs unit tests and the complete conformance
manifest through coverage. It currently enforces at least 85% line coverage
across `finkore` source. The critical-mutant probe mutates temporary copies of
Money, Workflow, Audit, Approvals, and Entities and requires the real
conformance runner to kill every probe.
