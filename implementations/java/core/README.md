# FinKore Java Core

The development tree now includes the [Core 0.9.5 Milestone 2 regressions](../../../docs/plans/plan-09.5.md).
They intentionally fail against unresolved native API and cross-domain defects.
The 0.9.4 results below describe that tagged snapshot; the expanded development
manifest is not yet passing conformance. Milestone 3 corrects Money serialization;
its native regressions, Money conformance, and targeted mutation gates pass.
Milestone 4 corrects Workflow supplied preconditions and error precedence.
Milestone 5 corrects concrete Approval association, eligibility, and historical
Decision validation; all 162 Approval vectors and targeted mutation gates pass.
Native Audit and Entity regressions remain open.

This package is the Java implementation track for FinKore Core 0.9 release
candidate. It is derived from CoreDoc, `/spec`, `/conformance`, and `/agentic`,
not from TypeScript or Python financial implementation code.

The Core 0.9.4 corrective snapshot passes all 542 manifest vectors on TypeScript,
Python 3.12/3.13, and Java. Native tests and mutation probes also protect
Approval lifecycle sequences, Entity history reuse, and immutable Workflow
guard ownership. Complete clean-checkout verification passes; see the
[0.9.4 plan](../../../docs/plans/plan-09.4.md). Passing the finite manifest does
not establish exhaustive boundary coverage or declare Core 1.0 stable.

Audit Actor metadata and ordinary Change values preserve every own JSON
member recursively, including `__proto__` and `constructor`, without assigning
runtime meaning to names. Construction, history import, repeated observations,
and redaction preserve these values and keep committed source history unchanged.
Equal Changes remain invalid; Boolean/number, absence/null, and explicitly
declared Money comparisons retain their existing rules. Unsupported non-JSON
values remain invalid. Public API signatures are unchanged.

Workflow definitions own nested guard inputs. Guards require a nonempty fact
name and a present JSON comparison value; explicit null comparisons are valid,
while null guard containers and unsupported native values are rejected with
`FINKORE_WORKFLOW_INVALID_DEFINITION`. A single `guard` may coexist with
`guards: []`; a nonempty competing list is invalid. `versionSequence: "DEFAULT"`
selects validation of `definitionVersionIdentity` as `[1-9][0-9]*`. Without the
selector, version identities remain opaque; no global sequencing or migration
is performed.

`Workflow.Transition` keeps its record constructor and accessor signatures.
It validates and deeply copies guards; nested maps and lists returned by
`guards()` are unmodifiable and preserve explicit nulls. Caller-owned inputs
remain mutable. Definition declaration lists are also owned and unmodifiable.

This artifact is a repository reference implementation for the 0.9
release-candidate phase. It is not published to a Maven repository. The Maven
artifact version identifies this implementation artifact; `FinKore.CORE_VERSION`
identifies the FinKore Core behavioral baseline it implements.

The `core-0.9.4` local repository tag identifies the corrective snapshot.
`FinKore.CORE_VERSION` and packaged Core compatibility metadata remain `0.9-rc`;
the unpublished Maven artifact version remains `0.1.0`.

Current status:

- Money representation, serialization, arithmetic, comparison, rates,
  rounding, and allocation are implemented.
- Workflow definitions, instances, recursive type-sensitive JSON guards,
  transitions, terminal behavior, version binding, import observations, and
  conflict preconditions are implemented.
- Audit Events, presence-preserving Actors, recursively type-sensitive ordinary
  JSON and explicitly declared Money Changes, append-only history, redaction
  representations, and Audit Relationships are implemented, including portable
  history/event/actor/duplicate/relationship error precedence.
- Approval Requirements, Decisions, validity lifecycle, Conditions, Chains, and
  bounded Composition are implemented.
- Entity identity, lifecycle, mutability, validation, revisions, import, and
  bounded evolution with required Audit evidence are implemented.
- Public errors expose portable FinKore error codes; Java exception class names
  are not portable semantics.
- Audit and Approval timestamps use the strict portable FinKore RFC 3339
  profile and Approval expiration compares exact instants through nanoseconds.

Entity validation supports the `positive-money` and cross-field
`money-not-greater-than` conformance fixture predicates. The latter reads
`path` and `otherPath` from the complete proposed data and accepts exact
compatible-currency Money values when the first is less than or equal to the
second. Invalid or incompatible values fail the declared Entity rule. These
predicates exercise declared validation; they do not standardize a general
validation language or impose a universal amount/limit policy.

## Public Package Surface

Use `Workflow.transition(definition, instance, target, facts)` to omit both
preconditions. The six-argument overload accepts `Workflow.OMITTED` for either
omitted precondition. Explicit `null` now means supplied input: null expected
State fails with `FINKORE_WORKFLOW_INVALID_STATE`, and null expected revision
fails with `FINKORE_WORKFLOW_STATE_CONFLICT`. Migrate calls that used null
placeholders to the four-argument overload or `Workflow.OMITTED`:

```java
Workflow.transition(definition, instance, "SUBMITTED", Map.of());
Workflow.transition(definition, instance, "SUBMITTED", Map.of(), Workflow.OMITTED, "rev-7");
```

This preserves omission independently of null across the native API and JSON
adapter. Version checks precede all State validation, then conflicts, terminal
State, declared Transition, and guards. Both success and failure preserve the
original instance; successful results retain its binding and revision.

The intentional Java package surface is `org.finkore`. The public classes are:

- `FinKoreException`, carrying the portable `code()`.
- `FinKore`, carrying package-level implementation metadata.
- `Money`, including portable Money parsing, serialization, arithmetic,
  comparison, rounding, Rate application, and Allocation.
- `Workflow`, including `Workflow.Definition`, `Workflow.Instance`, and
  `Workflow.Transition`.
- `Audit`, including `Audit.EntityReference`, `Audit.Actor`, `Audit.Change`,
  `Audit.RelationshipTarget`, `Audit.Relationship`, `Audit.Event`,
  `Audit.RedactionPolicy`, `Audit.RedactionResult`, and `Audit.Log`.
  `Audit.Actor.hasMetadata()` distinguishes omitted metadata from supplied
  metadata, including explicit `null`; `Audit.Change.valueType()` exposes the
  supported explicit `MONEY` declaration when present.
- `Approvals`, exposing static Approval requirement, decision, validity,
  condition, chain, and bounded-composition operations.
- `Entities`, exposing static Entity create, mutate, transition, import, and
  evolution operations. `Entities.validationFindingsForMutation` reports safe
  rule/path findings for the complete proposed data without mutating the source;
  the conformance adapter obtains these findings from the core.
- Domain classes expose portable error-code constants for the errors they can
  raise.

Portable consumers should catch `FinKoreException` and inspect `code()` rather
than depending on Java class names or exception messages. The implementation
uses portable JSON-shaped `Map` and `List` observations for non-Money domains;
those shapes follow the conformance vectors and specification, not Java object
identity.

Concrete Approval Requirements need a `subject` with nonempty `type` and `id`,
and a nonempty list of distinct eligible Actor identifiers. Every concrete
Decision requires explicit `subjectFacts`; null, scalar, object, and array facts
are valid without a universal revision field. Missing association or malformed
subject/eligibility raises `FINKORE_APPROVAL_INVALID_DECISION`. A valid eligibility
declaration excluding the deciding Actor raises `FINKORE_APPROVAL_INELIGIBLE_ACTOR`
at record time. Record and Requirement evaluation validate every historical
Decision before filtering unrelated, withdrawn, superseded, expired, or
ineffective evidence. They neither infer missing facts nor discard bad entries.
These rules do not change lightweight chain/composition observation shapes.

Approval operations return a history envelope. Pass the complete envelope to
subsequent recording and evaluation so withdrawal and supersession evidence
remains available. Recording preserves both histories without mutating inputs.
Withdrawal requires exactly one committed target that has not already been
withdrawn or superseded; invalid targets raise
`FINKORE_APPROVAL_INVALID_DECISION` without changing prior evidence. Lifecycle
operations determine the event kind even when the request supplies `type`.
Composition Decision observations require explicit Boolean `effective`:
`false` is valid ineffective evidence; missing or malformed evidence raises
`FINKORE_APPROVAL_INVALID_CHAIN` under the specified error priority.

This package requires JDK 21 and its release workflow uses Maven 3.9.x. Money
amounts use `BigDecimal` from plain decimal strings. Portable allocation scales
are bounded by `50`, equal-part counts by `100`, and ratios by
`9007199254740991`. Money rounding scales must fit Java `int` as an
implementation-specific `BigDecimal` constraint.

`Money.toPortable(Integer scale)` accepts non-negative Java `Integer` scales,
subject to `BigDecimal` capacity and available memory. `null` uses the value's
scale; the no-argument overload uses its retained presentation scale. Scale
extension and removal of trailing zeros preserve the exact amount. Discarding
nonzero digits raises `FINKORE_MONEY_ROUNDING_REQUIRED`; negative or unsupported
scales raise `FINKORE_MONEY_INVALID_ROUNDING`. Both success and failure preserve
the operand. Fractional, Boolean, and string scales are not representable by
this typed overload. Explicit rounding remains a separate operation:

```java
Money value = Money.fromPortable(Map.of("amount", "1.239", "currency", "EUR"));
value.toPortable(3); // amount "1.239", currency "EUR"
value.toPortable(2); // throws FinKoreException: FINKORE_MONEY_ROUNDING_REQUIRED
value.round(2, "HALF_UP").toPortable(2); // amount "1.24", currency "EUR"
```

The JAR intentionally includes compiled `org.finkore` classes plus
`META-INF/LICENSE`, `META-INF/NOTICE.md`, `META-INF/THIRD_PARTY_LICENSES.md`,
and `META-INF/finkore-core.properties`. Tests, coverage data, generated
reports, repository-local toolchains, and build outputs are not packaged in the
runtime JAR. The release package gate installs the JAR into an isolated Maven
repository, compiles an external consumer against it, and runs that consumer.

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

### Evolution history reuse

`Entities.importEvolutionHistory(Map.of("relations", priorRelations))` validates
and owns an ordered history observation. Pass its envelope as `evolutionHistory`
to `Entities.evolve`, or reuse a previous evolution result's `evolutionHistory`
directly. Reuse its Audit history's `history` list as the next `auditHistory`.
Source and related observations must each satisfy all declared business
validators, including cross-field rules.

Imported and resulting histories reject unexplained currentness changes with
`FINKORE_ENTITY_INVALID_MUTATION`; explicit Void and Supersession effects may
change prior observations. Expectations compare against the exact Entity,
Revision, and scope. Missing or invalid Audit evidence retains its Audit error;
valid Audit evidence with mismatched evolution correspondence returns
`FINKORE_ENTITY_INVALID_MUTATION`. Failures leave both histories and Entity
facts unchanged. The bounded reference duplicate policy rejects a second
Reversal of the same source Revision, without defining a universal reversal
policy for other composing domains.
