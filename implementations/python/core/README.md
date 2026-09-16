# FinKore Python Core

This package is the Draft 0.5 Python implementation track for FinKore. It is
derived from CoreDoc, `/spec`, `/conformance`, and `/agentic`, not from
TypeScript financial implementation code.

Current status:

- Money representation, serialization, arithmetic, comparison, rates,
  rounding, and allocation are implemented.
- Workflow definitions, imports, transitions, guards, terminal behavior,
  version binding, and conflict preconditions are implemented.
- Audit event append, append-only rejection, actor/change validation,
  redaction representations, and relationships are implemented.
- Approval requirement, decision, condition, chain, lifecycle, and bounded
  composition behavior are implemented.
- Entity create, mutate, transition, import, revision observation, and
  evolution behavior are implemented.
- Public errors expose portable FinKore error codes; Python exception class
  names are not portable semantics.
- Money arithmetic, Rate application, allocation-unit detection, and rounding
  use exact coefficient-and-scale arithmetic where Python `decimal` context
  precision could otherwise alter FinKore results. This includes the resolved
  Draft 0.6 `D06-PORT-241-001` boundary controls.

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
