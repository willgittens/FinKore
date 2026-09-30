# FinKore Python Core

The [Core 0.9.7 plan](../../../docs/plans/plan-09.7.md) has accepted D1–D7
contracts. Milestone 3 now validates every declared composition group, including
unused references/cycles and quorum evidence, before choosing an outcome. All
176 composition vectors pass on TypeScript, Python 3.12/3.13, and Java. Applicable
quorum observations require explicit eligibility and distinct outcome mappings;
unused groups never add actionables. Depth four still applies to actual roots.
Milestone 4 also closes concrete Approval history, declaration, condition, and
fact-comparison corrections: all 579 Approval suite vectors pass on all four
runtimes. Milestone 5 implements the accepted native Approval/Workflow value profile and
required embedded Workflow collections. Milestone 6 closes Entity special-name
declaration preservation/reuse; all ten portable special-name controls pass on
every runtime. Milestone 7 closes malformed Entity/Workflow boundaries and Audit
failure observations; all 1719 manifest vectors pass on all four runtimes.
Final release verification/review remains M8 work. D8 redaction policy identity
and D9 Entity native-value policy remain unresolved. The 0.9.6 results below describe the tagged snapshot.

Entity definitions require a nonempty `identityScope` and an explicit mutability
field list for every declared State; `[]` permits no fields. Data must be an
object satisfying declared validation rules, including before applying changes.
An update cannot repair an invalid original Entity by overwriting it. Empty
changes use `FINKORE_ENTITY_INVALID_MUTATION`. Malformed current States use
`FINKORE_WORKFLOW_INVALID_INSTANCE`; nonempty undeclared States and unknown
transition targets use `FINKORE_WORKFLOW_INVALID_STATE`.

`import_evolution_history()` and `import_evolution_history([])` create empty
history; explicitly passing `None` is rejected. Evolution accepts omitted histories as empty and explicit empty histories;
explicit null remains malformed. Audit history/Event validation precedes
Entity correspondence checks. Failed operations preserve inputs, and adapters
retain the primary portable error without fabricating a valid Entity observation.
These corrections tighten previously permissive inputs; they do not select D9's
unresolved policy for arbitrary native values in Entity application data.

For `evaluate_composition`, omit `decisions` (or supply `[]`) for no votes.
Explicit `None` now raises `FINKORE_APPROVAL_INVALID_CHAIN`; callers that used
`None` as an omission placeholder must omit the argument instead. This preserves
composition's lightweight observations without requiring concrete subject data.

Approval fact comparison now uses all supplied facts when selectors are omitted.
Concrete Decision evaluation requires current facts; Requirement evaluation may
omit both facts and selectors for history-only evaluation. Null facts are values;
null/empty selectors are invalid even for expired or excluded Decisions. Paths
use dot-separated own object members, with no array indexing or literal dotted
key fallback. Missing leaves differ from present null/false/zero. Equality is
structural and type-sensitive, ignores object order and decimal scale, and
preserves array order and exact numeric values. Strings never become Money.
Condition declarations are validated before accepting an external result.

Omit `relevant_fact_paths` for complete comparison; migrate old `None` selector
placeholders to omission (use `evaluated_at=` for time). Omitted Requirement
decisions still default to an empty native history; explicit `None` is invalid.

Concrete histories/Decision lists and outcome mappings must be explicit;
swapped distinct mappings remain valid. Supplied Actor type must be nonempty,
and Chain rejection outcome must be `REJECTED`. Recording validates the proposed
history before returning, so a new Decision cannot make a retained lifecycle
reference ambiguous. Native unsupported-value rejection and ownership are verified for the accepted
Approval/Workflow profile. Broader Entity native numeric policy is an explicit
new gap (D9 in the plan); these checks do not claim full Entity closure.

Native ownership profile: exact built-in int/finite float and finite immutable Decimal for Approval;
Workflow guards retain their rejection of Decimal. Numeric subclasses are rejected. Lists and string-key dictionaries are independently
captured; shared acyclic children are valid and cycles fail portably. Concrete
Approval facts use `FINKORE_APPROVAL_INVALID_DECISION`; composition evidence
uses `FINKORE_APPROVAL_INVALID_CHAIN` after applicability and required context.
Retained Workflow guards use `FINKORE_WORKFLOW_INVALID_DEFINITION`, preserving
definition-first error priority. No arbitrary numeric conversion is used.

Portable Workflow definitions require explicit `terminalStates` and `transitions`
arrays, including inside Entities. Empty arrays remain valid. Malformed embedded
definitions do not produce reconstructed Entity diagnostics.

Core 0.9.6 status: [Completed corrective release](../../../docs/plans/plan-09.6.md).
Money, Workflow, Approval, Audit, and Entity corrections are verified. All 884 manifest
vectors pass on TypeScript, Python 3.12/3.13, and Java, with no unsupported cases
or infrastructure errors. Complete clean-candidate verification passes, including
coverage, full TypeScript mutation, all portable/native probes, and isolated
package consumers. Fresh review and local release closure are complete.
The annotated local `core-0.9.6` tag identifies the snapshot; remote and package
publication remain separate, and stable 1.0 promotion remains uncompleted.

Entity import accepts complete mapping evidence without a separate Source
Identity, preserving its opaque values without synthesizing Source Identity.
When supplied, Source Identity must be complete and agree with its mapping;
null and malformed values raise `FINKORE_ENTITY_INVALID_IDENTITY`. Returned
versioned observations retain their original Workflow binding for later
mutation, transition, and evolution. Omitted evolution State/Revision
expectations impose no check; null, malformed, or unequal expectations raise
`FINKORE_ENTITY_STATE_CONFLICT` without changing Entities or either history.
Currentness expectations have a separate Boolean contract: malformed values
raise `FINKORE_ENTITY_INVALID_MUTATION`, while a Boolean mismatch is a state
conflict.

The Milestone 8 review additionally checks supplied revision `current` markers:
when present they must be Boolean and agree with the current/historical role.
Malformed or contradictory markers raise `FINKORE_ENTITY_INVALID_IDENTITY`
without rewriting the supplied observation. Permanent portable/native regressions
and paired mutation controls cover this boundary.

`redact_history(history, policy, redaction_event)` requires a nonempty string
`policy["authority"]` and declared `protectedPaths`. Omitted, null, empty, numeric,
Boolean, list, or dictionary authority raises `FINKORE_AUDIT_REDACTION_INVALID`.
Failure leaves history, policy, and candidate evidence unchanged. The declared
authority is opaque; FinKore does not look it up or authenticate it.

```python
result = redact_history(
    committed_history,
    {"authority": "retention-policy", "protectedPaths": ["actor.metadata"]},
    evidence_event,
)
```

The result contains the redacted `event`, `evidenceEvent`, and a new `history`
containing the original Events followed by evidence. Actor identity/type, Event
identity/type, Entity reference, occurrence timestamp, and relationships remain
intact. Redacted values are distinguishable from absent members and explicit
null; returned observations cannot mutate caller-owned source or evidence.

Concrete Decision evaluation uses `evaluate_decision(requirement, decision, current_subject_facts, evaluated_at=None)`.
It validates the concrete Requirement, Decision association, and Actor eligibility,
then checks relevant facts and exact expiration. Invalid required evaluation
time raises `FINKORE_APPROVAL_INVALID_CONTEXT`; at the expiration instant the
Decision is `INEFFECTIVE`. Without lifecycle history it makes no withdrawal or
supersession claim. Imported histories validate committed kinds, unique Decision
references, and local-order withdrawal/supersession constraints before reuse.
References compare timestamps by instant while retaining their original spelling.
Requirement evaluation checks required context for every considered Decision
before returning a decisive outcome. Composition requires explicit applicability,
required State/effectiveness evidence, and valid portable timestamps, in the
portable error priority. Explicit PENDING and empty valid vote sets remain valid.

The completed [Core 0.9.5 corrective release](../../../docs/plans/plan-09.5.md)
passes all 667 manifest vectors on TypeScript, Python 3.12/3.13, and Java.
Native public API and operation-sequence regressions protect exact serialization,
Workflow binding and preconditions, Approval association, Audit value ownership,
and Entity declaration/import boundaries. Complete clean-checkout verification
passes, including mutation suites and isolated package consumers. Passing these
finite checks does not establish exhaustive correctness or declare Core 1.0 stable.

Versioned Entity observations carry their original Workflow `binding` through
create, import, mutation, transition, and evolution. Import requires that explicit
binding: missing/malformed binding returns `FINKORE_WORKFLOW_INVALID_INSTANCE`,
and a different definition/version returns `FINKORE_WORKFLOW_VERSION_MISMATCH`.
Binding is independent of Entity identity, business revision, and conflict token.
The bounded import API rejects equal current-revision/conflict tokens; it has no
shared-meaning declaration mechanism. Supplied null or nonmatching expected
State/revision/conflict tokens return `FINKORE_ENTITY_STATE_CONFLICT` after
observed identities are validated. Omitted expectations impose no check.
Malformed/unsupported validator declarations return
`FINKORE_ENTITY_INVALID_MUTATION` before evaluating predicates; supported rules
that reject financial data retain `FINKORE_ENTITY_VALIDATION_FAILED`.

The stateless native API validates the supplied definition and binding on each
call; it does not retain a declaration across unrelated calls.

This package is the Python implementation track for FinKore Core 0.9 release
candidate. It is derived from CoreDoc, `/spec`, `/conformance`, and `/agentic`,
not from TypeScript financial implementation code.

Audit Actor metadata and ordinary Change values preserve every own JSON
member recursively, including `__proto__` and `constructor`, without assigning
runtime meaning to names. Construction, history import, repeated observations,
and redaction preserve these values and keep committed source history unchanged.
Equal Changes remain invalid; Boolean/number, absence/null, and explicitly
declared Money comparisons retain their existing rules. Unsupported non-JSON
values remain invalid. Public API signatures are unchanged.

Native Audit input accepts null, strings, Booleans, integers, finite floats,
lists, and dictionaries with string keys. Cyclic containers raise
`FINKORE_AUDIT_ACTOR_INVALID` in Actor context and
`FINKORE_AUDIT_INVALID_EVENT` in other Event content, including ordinary Changes
and Event metadata. Shared acyclic references remain valid. Validation, history
import, append, and redaction return owned observations; changing caller input
or another returned observation cannot change their retained source values.
History and non-actor validation retain their existing error priority.

Workflow definitions own nested guard inputs. Guards require a nonempty fact
name and a present JSON comparison value; explicit null comparisons are valid,
while null guard containers and unsupported native values are rejected with
`FINKORE_WORKFLOW_INVALID_DEFINITION`. A single `guard` may coexist with
`guards: []`; a nonempty competing list is invalid. `versionSequence: "DEFAULT"`
selects validation of `definitionVersionIdentity` as `[1-9][0-9]*`. Without the
selector, version identities remain opaque; no global sequencing or migration
is performed.

`WorkflowTransition(source, target, guards=())` keeps its constructor signature.
Its `guards` property returns fresh nested JSON copies; mutating them cannot
change the predicate. Guard storage is now private, so dataclass field
introspection is not a portable serialization interface. `WorkflowDefinition`
retains declaration containers as tuples, including direct native construction.

`WorkflowInstance(current_state, binding=None, revision=None)` also owns its
binding. The `binding` property and `to_portable()` return independent
observations; mutating original or returned dictionaries cannot change the
instance's governing version. Its constructor signature is unchanged, while
the retained binding is now a private dataclass field. Use the public properties
or `to_portable()` rather than dataclass field introspection for interchange.

Omit `expected_current_state` or `expected_revision` from `transition_workflow`
to skip that check. Explicit `None` is supplied input and fails with
`FINKORE_WORKFLOW_INVALID_STATE` or `FINKORE_WORKFLOW_STATE_CONFLICT`,
respectively. Calls that previously passed `None` as an omission placeholder
must omit the argument instead; keyword arguments permit independent omission:

```python
transition_workflow(definition, instance, "SUBMITTED")
transition_workflow(definition, instance, "SUBMITTED", expected_revision="rev-7")
```

Version checks precede State validation; all State checks precede conflicts,
terminal State, declared Transition, and guards. Neither failure nor success
mutates the original instance. Successful results retain its binding and revision.

This artifact is a repository reference implementation for the 0.9
release-candidate phase. It is not published to a Python package registry. The
Python package version identifies this implementation artifact; `CORE_VERSION`
identifies the FinKore Core behavioral baseline it implements.

The `core-0.9.6` local repository tag identifies the corrective snapshot. `CORE_VERSION`
remains `0.9-rc`, and the unpublished package version remains `0.1.0`.

Current status:

- Money representation, serialization, arithmetic, comparison, rates,
  rounding, and allocation are implemented.
- Workflow definitions, imports, transitions, recursive type-sensitive JSON
  fact guards, terminal behavior, version binding, and conflict preconditions
  are implemented.
- Audit event append, append-only rejection, presence-preserving actor
  validation, recursive type-sensitive ordinary JSON and explicitly declared
  Money Change comparison, portable error precedence, redaction
  representations, and relationships are implemented.
- Approval requirement, decision, condition, chain, lifecycle, and bounded
  composition behavior are implemented.
- Entity create, mutate, transition, validated import, revision observation,
  and evolution behavior are implemented.
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

Entity validation supports the `positive-money` and cross-field
`money-not-greater-than` conformance fixture predicates. The latter reads
`path` and `otherPath` from the complete proposed data and accepts exact
compatible-currency Money values when the first is less than or equal to the
second. Invalid or incompatible values fail the declared Entity rule. These
predicates exercise declared validation; they do not standardize a general
validation language or impose a universal amount/limit policy.

## Public Package Surface

Native `WorkflowDefinition(states, initial_state, terminal_states, transitions,
definition_identity=None, definition_version_identity=None)` validates before
exposing the definition. State, terminal, and Transition containers accept lists
or tuples and are owned independently. States are unique, the initial State and
all Transition endpoints are declared, terminal States have no outgoing
Transitions, and version identities form a valid pair. Invalid input raises
`FINKORE_WORKFLOW_INVALID_DEFINITION`; guards retain their existing validated,
defensively copied JSON semantics.

`WorkflowInstance(current_state, binding=None, revision=None)` validates instance
structure and retains its own binding. Native `None` means no optional binding or
revision. Portable `from_portable` input instead preserves member presence:
supplied null binding/revision is `FINKORE_WORKFLOW_INVALID_INSTANCE`.

Import and transition apply WORKFLOW-ERROR-007: invalid definition, malformed
instance, version mismatch, invalid State, expected-State/revision conflict,
terminal State, undeclared Transition, then rejected guard. A well-formed
undeclared State retains `FINKORE_WORKFLOW_INVALID_STATE`; an invalid observed
revision differs from a supplied invalid expected revision, which is a conflict.
No historical binding is inferred or replaced, and failures preserve all supplied
observations. These checks implement existing requirements, not Workflow migration.

`Money(amount, currency, presentation_scale=None)` requires a finite Python
`Decimal` amount and a three-letter uppercase currency string. It validates
both components immediately, including when called by `from_portable`.
NaN (including signaling NaN), infinities, strings, floats, integers, Booleans,
and other unsupported amount types raise `FINKORE_MONEY_INVALID_AMOUNT`.
Invalid currencies raise `FINKORE_MONEY_INVALID_CURRENCY`. There is no implicit
coercion, currency normalization, or currency registry lookup.

Finite Decimal exponent forms, signed zero, trailing zeros, and arbitrary
supported precision remain valid. Construction and exact operations do not apply
or change the caller's Decimal context. Portable parsing still requires a plain
decimal string; native exponent notation is not passed through that parser.

```python
from decimal import Decimal
from finkore import Money

native = Money(Decimal("1E+3"), "EUR")
native.to_portable()  # {"amount": "1000", "currency": "EUR"}
Money(Decimal("sNaN"), "EUR")  # raises FINKORE_MONEY_INVALID_AMOUNT
```

`apply_rate` rejects malformed Rate kinds (including arrays and objects) with
`FINKORE_MONEY_INVALID_AMOUNT`, preserves the source on failure, and retains the
existing explicit-rounding contract. These checks implement
MONEY-REPRESENTATION-002, MONEY-CURRENCY-001, MONEY-ERROR-001/002/007, and
MONEY-RATE-007/009; no new financial rule or portable error is introduced.

`Money.to_portable(scale)` changes presentation only. A requested scale must be
a non-negative Python `int`, excluding Boolean values, no greater than
`sys.maxsize`; practical output sizes depend on available memory. Omission or
`None` uses the retained `presentation_scale`, or the Decimal's scale when none
is retained. Direct `Money(Decimal(...), currency, presentation_scale)` values
receive the same scale and exactness checks when serialized.

Removing nonzero digits raises `FINKORE_MONEY_ROUNDING_REQUIRED`. Invalid or
unsupported scales raise `FINKORE_MONEY_INVALID_ROUNDING` before checking loss.
Success and failure preserve the operand and the caller's Decimal context.
To reduce precision deliberately, round first with an explicit policy:

```python
from finkore import Money

value = Money.from_portable({"amount": "1.239", "currency": "EUR"})
value.to_portable(3)  # {"amount": "1.239", "currency": "EUR"}
value.to_portable(2)  # raises FinKoreError: FINKORE_MONEY_ROUNDING_REQUIRED
value.round(2, "HALF_UP").to_portable(2)  # {"amount": "1.24", "currency": "EUR"}
```

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
  `import_entity`, `import_evolution_history`, and `evolve_entity`.

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
`False` is valid ineffective evidence; missing or malformed evidence raises
`FINKORE_APPROVAL_INVALID_CHAIN` under the specified error priority.

This package supports CPython 3.12 and 3.13 and uses Python `int` and exact
`Decimal` values (plain decimal strings at the portable boundary). Portable allocation scales
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
manifest through branch-enabled coverage. It enforces at least 85% combined
statement/branch coverage across `finkore` source. The critical-mutant probe mutates temporary copies of
Money, Workflow, Audit, Approvals, and Entities and requires the real
conformance runner to kill every probe through a named regression while an
independent valid control passes. Crashes and infrastructure failures do not
count as kills. These targeted probes supplement native tests; they do not
provide full mutation coverage of the Python implementation.

### Evolution history reuse

`import_evolution_history({"relations": prior_relations})` validates and owns an
ordered history observation. Pass the complete returned envelope as
`evolutionHistory` to `evolve_entity`, or reuse a previous evolution result's
`evolutionHistory` directly. Use its `auditHistory["history"]` as the next
request's `auditHistory`. Source and related observations must each satisfy all
declared business validators, including cross-field rules.

Imported and resulting histories reject unexplained currentness changes with
`FINKORE_ENTITY_INVALID_MUTATION`; explicit Void and Supersession effects may
change prior observations. Expectations compare against the exact Entity,
Revision, and scope. Missing or invalid Audit evidence retains its Audit error;
valid Audit evidence with mismatched evolution correspondence returns
`FINKORE_ENTITY_INVALID_MUTATION`. Failures leave both histories and Entity
facts unchanged. The bounded reference duplicate policy rejects a second
Reversal of the same source Revision, without defining a universal reversal
policy for other composing domains.
