# FinKore Java Core

This package is the Java implementation track for FinKore Core 0.8. It is
derived from CoreDoc, `/spec`, `/conformance`, and `/agentic`, not from
TypeScript or Python financial implementation code. It passes the complete
current conformance manifest.

Current status:

- Money representation, serialization, arithmetic, comparison, rates,
  rounding, and allocation are implemented.
- Workflow definitions, instances, guards, transitions, terminal behavior,
  version binding, import observations, and conflict preconditions are
  implemented.
- Audit Events, Actors, Changes, append-only history, redaction
  representations, and Audit Relationships are implemented.
- Approval Requirements, Decisions, validity lifecycle, Conditions, Chains, and
  bounded Composition are implemented.
- Entity identity, lifecycle, mutability, validation, revisions, import, and
  bounded evolution with required Audit evidence are implemented.
- Public errors expose portable FinKore error codes; Java exception class names
  are not portable semantics.

Run the current local checks from the repository root:

```bash
npm run java:compile
npm run java:test
npm run java:coverage
npm run java:mutation:critical
npm run conformance:java
```

The packaged Java coverage gate uses Maven, JUnit Jupiter, and JaCoCo. It
currently enforces at least 85% line coverage for the Java core package.
The critical-mutant probe mutates temporary Java Money, Workflow, Audit,
Approvals, and Entities implementations and requires the relevant conformance
suites to kill every probe.
