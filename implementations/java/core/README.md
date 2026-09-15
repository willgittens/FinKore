# FinKore Java Core

This package is the Draft 0.5 Java Money implementation track for FinKore. It
is derived from CoreDoc, `/spec`, `/conformance`, and `/agentic`, not from
TypeScript or Python financial implementation code.

Current status:

- Money representation, serialization, arithmetic, comparison, rates,
  rounding, and allocation are implemented.
- Non-Money FinKore domains are intentionally unsupported for the Java Draft
  0.5 claim.
- Public errors expose portable FinKore error codes; Java exception class names
  are not portable semantics.

Run the current local checks from the repository root:

```bash
npm run java:compile
npm run java:test
npm run java:coverage
npm run conformance:java:money
```

The packaged Java coverage gate uses Maven, JUnit Jupiter, and JaCoCo. It
currently enforces at least 85% line coverage for the Java core package.
Mutation tooling is not yet packaged for this module.
