# FinKore Python Core

This package is the Python implementation track for FinKore Core 0.9 release candidate. It is
derived from CoreDoc, `/spec`, `/conformance`, and `/agentic`, not from
TypeScript financial implementation code. It passes the complete current
conformance manifest.

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
- Money arithmetic, Rate application, allocation-unit detection, and rounding
  use exact coefficient-and-scale arithmetic where Python `decimal` context
  precision could otherwise alter FinKore results.

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

This package requires Python 3.12 or newer and uses Python `int` and exact
`Decimal` construction from plain decimal strings. Portable allocation scales
are bounded by `50`, equal-part counts by `100`, and ratios by
`9007199254740991`. Money amount precision and other practical limits depend on
the Python runtime and available memory. Portable timestamps have the normative
nine-digit fractional limit.

The wheel and source distribution intentionally include package source,
`py.typed`, this README, `LICENSE`, `NOTICE.md`, and
`THIRD_PARTY_LICENSES.md`. Tests, coverage data, generated reports,
repository-local toolchains, and build outputs are excluded from the source
distribution.

Run the current local checks from the repository root:

```bash
npm run python:compile
npm run python:unit
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
