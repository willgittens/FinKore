# FinKore Python Core

This package is the Python implementation track for FinKore Core 0.9 release candidate. It is
derived from CoreDoc, `/spec`, `/conformance`, and `/agentic`, not from
TypeScript financial implementation code. The historical Core 0.9.3 snapshot passes its 331-vector manifest and release
checks; see the [0.9.3 plan](../../../docs/plans/plan-09.3.md).

The current manifest contains 536 vectors. Core 0.9.4 Milestones 3–5 restore
all 112 Approval, 157 Entity, and 83 Workflow vectors across TypeScript,
Python 3.12/3.13, and Java. Native tests also verify lifecycle sequences,
Entity history reuse, and immutable Workflow guard ownership.
Python passes all 536 vectors. Full cross-language release verification
remains open in the [0.9.4 plan](../../../docs/plans/plan-09.4.md).

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

This artifact is a repository reference implementation for the 0.9
release-candidate phase. It is not published to a Python package registry. The
Python package version identifies this implementation artifact; `CORE_VERSION`
identifies the FinKore Core behavioral baseline it implements.

The `core-0.9.3` repository tag identifies the corrective snapshot. `CORE_VERSION`
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
`Decimal` construction from plain decimal strings. Portable allocation scales
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
manifest through coverage. It currently enforces at least 85% line coverage
across `finkore` source. The critical-mutant probe mutates temporary copies of
Money, Workflow, Audit, Approvals, and Entities and requires the real
conformance runner to kill every probe.

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
