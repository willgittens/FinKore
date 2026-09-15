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

Run the current local checks from the repository root:

```bash
npm run python:compile
npm run python:unit
npm run conformance:python
```

Coverage and mutation tooling for the Python track are not yet packaged in this
module.
