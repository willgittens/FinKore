# FinKore Java Core

This package is the Java implementation track for FinKore. It is derived
from CoreDoc, `/spec`, `/conformance`, and `/agentic`, not from TypeScript or
Python financial implementation code. For Draft 0.6 evidence, Java claims
`finkore.core.draft0_6.domain.money` and now implements the Workflow, Audit,
and Approvals domain slices as part of TASK-257. It does not yet claim the full
profile.

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
- Entities remain unsupported for Java until their TASK-257 slice is
  implemented and proven.
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
```

The packaged Java coverage gate uses Maven, JUnit Jupiter, and JaCoCo. It
currently enforces at least 85% line coverage for the Java core package.
The critical-mutant probe mutates temporary Java Money, Workflow, Audit, and
Approvals implementations and requires the relevant conformance suites to kill
every probe.
