# FinKore Java Core

This package is the Java implementation track for FinKore Core 0.9 release candidate. It is
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

## Public Package Surface

The intentional Java package surface is `org.finkore`. The public classes are:

- `FinKoreException`, carrying the portable `code()`.
- `Money`, including portable Money parsing, serialization, arithmetic,
  comparison, rounding, Rate application, and Allocation.
- `Workflow`, including `Workflow.Definition`, `Workflow.Instance`, and
  `Workflow.Transition`.
- `Audit`, including `Audit.EntityReference`, `Audit.Actor`, `Audit.Change`,
  `Audit.RelationshipTarget`, `Audit.Relationship`, `Audit.Event`,
  `Audit.RedactionPolicy`, `Audit.RedactionResult`, and `Audit.Log`.
- `Approvals`, exposing static Approval requirement, decision, validity,
  condition, chain, and bounded-composition operations.
- `Entities`, exposing static Entity create, mutate, transition, import, and
  evolution operations.
- Domain classes expose portable error-code constants for the errors they can
  raise.

Portable consumers should catch `FinKoreException` and inspect `code()` rather
than depending on Java class names or exception messages. The implementation
uses portable JSON-shaped `Map` and `List` observations for non-Money domains;
those shapes follow the conformance vectors and specification, not Java object
identity.

Implementation-specific limits: this package requires JDK 21. Money amounts use
`BigDecimal` from plain decimal strings. Rounding/allocation target scales must
fit Java `int` because `BigDecimal` scale is an `int`; equal-allocation part
counts also fit Java `int`. These are Java API limits, not portable FinKore
requirements.

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
