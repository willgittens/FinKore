# FinKore Java Core

This package is the Java implementation track for FinKore. It is derived
from CoreDoc, `/spec`, `/conformance`, and `/agentic`, not from TypeScript or
Python financial implementation code. For Draft 0.6 evidence, Java now claims
`finkore.core.draft0_6.full` as post-Draft-0.6 TASK-257 parity evidence.

Current status:

- Money representation, serialization, arithmetic, comparison, rates,
  rounding, and allocation are implemented.
- Workflow definitions, instances, guards, transitions, terminal behavior,
  version binding, import observations, and conflict preconditions are
  implemented and pass the 41-vector Workflow domain profile.
- Audit Events, Actors, Changes, append-only history, redaction
  representations, and Audit Relationships are implemented and pass the
  29-vector Audit domain profile.
- Approval Requirements, Decisions, validity lifecycle, Conditions, Chains, and
  bounded Composition are implemented and pass the 66-vector Approvals domain
  profile.
- Entity identity, lifecycle, mutability, validation, revisions, import, and
  bounded evolution with required Audit evidence are implemented and pass the
  25-vector Entities domain profile.
- The complete Draft 0.6 full profile passes at 254/254 vectors with zero
  failures, unsupported results, or infrastructure errors.
- Public errors expose portable FinKore error codes; Java exception class names
  are not portable semantics.

Run the current local checks from the repository root:

```bash
npm run java:compile
npm run java:test
npm run java:coverage
npm run java:mutation:critical
npm run conformance:java:money
npm run conformance:java:profile:money
npm run conformance:java:workflow
npm run conformance:java:profile:workflow
npm run conformance:java:audit
npm run conformance:java:profile:audit
npm run conformance:java:approvals
npm run conformance:java:profile:approvals
npm run conformance:java:entities
npm run conformance:java:profile:entities
npm run conformance:java:profile:full
```

The packaged Java coverage gate uses Maven, JUnit Jupiter, and JaCoCo. It
currently enforces at least 85% line coverage for the Java core package.
The critical-mutant probe mutates temporary Java Money, Workflow, Audit,
Approvals, and Entities implementations and requires the relevant conformance
suites to kill every probe.
