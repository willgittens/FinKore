# Draft 0.2 Execution Evidence

This file records durable execution evidence for the Draft 0.2 backlog. It is
not a source of financial semantics.

## Foundation

### TASK-001 - Draft 0.1 Baseline Verification and Draft 0.2 Scope Lock

- Status: COMPLETE
- Source revision: `79f2e683c8367d3e5266670b5de9b081e47c1516`
- Date: 2026-09-09
- Toolchain: system `node` absent; repository-local
  `.tools/node-v24.20.0-linux-x64/bin/node` reported `v24.20.0`.
- Commands:
  - `PATH=/home/will/Documents/FinFlow/.tools/node-v24.20.0-linux-x64/bin:$PATH npm run typecheck --workspaces` exited 0.
  - `PATH=/home/will/Documents/FinFlow/.tools/node-v24.20.0-linux-x64/bin:$PATH npm run test --workspaces` exited 0.
  - `PATH=/home/will/Documents/FinFlow/.tools/node-v24.20.0-linux-x64/bin:$PATH npm run build --workspaces` exited 0.
  - `PATH=/home/will/Documents/FinFlow/.tools/node-v24.20.0-linux-x64/bin:$PATH node runner/dist/cli/cli.js --manifest conformance/manifest.json --adapter implementations/typescript/adapters/conformance/dist/adapter.js --json` exited 0.
- Unit evidence:
  - Runner: 10 files, 110 tests passed.
  - TypeScript core: 25 files, 211 tests passed.
  - Conformance adapter: 1 file, 10 tests passed.
- Conformance evidence:
  - Total: 138 passed / 138 total; 0 failed, 0 unsupported, 0 infrastructure errors.
  - Mutation-sensitive vectors: 114 passed / 114 total.
  - By suite: Money 55/55, Workflow 20/20, Audit 19/19, Approvals 34/34, Entities 10/10.
- Traceability inventory:
  - Manifest format `0.1`; five suites; eight manifest-listed vector files.
  - Total requirements: 213; 149 covered; 64 not directly testable; 0 partial; 0 uncovered; 0 deferred; 0 blocking spec gaps.
  - Domain counts remain Shared 29, Money 50, Workflow 27, Audit 38, Approvals 35, Entities 34.
- Portable error inventory:
  - Money: `FINKORE_MONEY_INVALID_AMOUNT`, `FINKORE_MONEY_INVALID_CURRENCY`, `FINKORE_MONEY_CURRENCY_MISMATCH`, `FINKORE_MONEY_DIVISION_BY_ZERO`, `FINKORE_MONEY_ROUNDING_REQUIRED`, `FINKORE_MONEY_INVALID_ROUNDING`.
  - Workflow: `FINKORE_WORKFLOW_INVALID_DEFINITION`, `FINKORE_WORKFLOW_INVALID_STATE`, `FINKORE_WORKFLOW_INVALID_TRANSITION`, `FINKORE_WORKFLOW_GUARD_REJECTED`, `FINKORE_WORKFLOW_TERMINAL_STATE`.
  - Audit: `FINKORE_AUDIT_INVALID_EVENT`, `FINKORE_AUDIT_DUPLICATE_EVENT`, `FINKORE_AUDIT_APPEND_ONLY_VIOLATION`, `FINKORE_AUDIT_REDACTION_INVALID`, `FINKORE_AUDIT_ACTOR_INVALID`.
  - Approval: `FINKORE_APPROVAL_REQUIRED`, `FINKORE_APPROVAL_INVALID_DECISION`, `FINKORE_APPROVAL_INELIGIBLE_ACTOR`, `FINKORE_APPROVAL_INVALID_CHAIN`, `FINKORE_APPROVAL_CONDITION_UNRESOLVED`.
  - Entity: `FINKORE_ENTITY_INVALID_IDENTITY`, `FINKORE_ENTITY_IMMUTABLE`, `FINKORE_ENTITY_INVALID_MUTATION`, `FINKORE_ENTITY_STATE_CONFLICT`, `FINKORE_ENTITY_VALIDATION_FAILED`.
- Operation inventory:
  - Canonical Agentic operations: 11, as listed in `agentic/operations.md`.
  - Conformance-local operations remain `money.deserialize`, `money.serialize`, `workflow.create`, `audit.redact`, `approval.requirement.evaluate`, `approval.decision.record`, `approval.decision.evaluate`, `approval.condition.evaluate`, `approval.chain.evaluate`, `entity.create`, `entity.mutate`, and `entity.transition`.
- Draft 0.2 scope lock:
  - Selected 0.2 scope remains Money rates, Money allocation, Entity evolution specification and implementation, Audit relationships, Approval validity, Agentic alignment, and 0.2 closure.
  - Explicit 0.2 non-goals remain ledger/journal/reconciliation, tax jurisdiction, interest, FX providers, payments, UI/task routing, persistence, authorization/RBAC, distributed audit ordering, BPMN/general workflow engine, general policy/rules engine, and mandatory multi-language proof.
  - `MONEY-RATE-*`, `MONEY-ALLOCATION-*`, `ENTITY-EVOLUTION-*`, `AUDIT-RELATIONSHIP-*`, and `APPROVAL-LIFECYCLE-*` appear only in planning/backlog files at this point; no Draft 0.2 feature semantics or implementation was marked complete by this task.
- Review touchpoints:
  - Draft 0.2 domain/security/technical review touchpoints are recommended until a later task records a concrete mandatory review requirement. No external reviewer signoff was fabricated.
- Mutation:
  - Runtime mutation was not rerun for this artifact-only scope lock. Later feature tasks must record applicable mutation evidence before closure.

### TASK-002 - Conformance Draft Version Policy

- Status: COMPLETE
- Decision: `finkoreConformance` and `finkoreVectorFile` are syntax/format
  compatibility versions, not Draft release numbers.
- Policy:
  - Draft 0.2 and Draft 0.3 vectors may continue to use format `0.1` while
    their manifest and vector-file shape remains compatible.
  - Draft/release scope is discovered from the manifest-listed files and
    requirement IDs, not from bumping a format field.
  - A format bump is required only when manifest or vector-file syntax changes
    incompatibly or when accepting the old syntax as-is would misrepresent the
    meaning of defined members.
  - Runners MUST continue to reject unsupported format versions.
- Verification:
  - Documentation policy updated in `conformance/conventions.md`,
    `conformance/README.md`, and `runner/README.md`.
  - No conformance vectors, financial requirements, public APIs, portable error
    codes, or Agentic operation IDs changed.
- Mutation: Not applicable; documentation-only policy task.

### TASK-003 - Conformance Version Compatibility Support

- Status: COMPLETE
- Decision: No runner/schema code change is required by TASK-002 because the
  approved policy preserves format `0.1` for Draft 0.2/0.3 artifacts until a
  syntax change exists.
- Existing support verified:
  - `runner/src/manifest.ts` accepts only supported manifest format `0.1`.
  - `runner/src/validator.ts` accepts only supported vector-file format `0.1`.
  - `conformance/vector.schema.json` accepts only supported vector-file format `0.1`.
  - Existing tests already cover valid `0.1` fixtures and unknown-version rejection.
- Runtime evidence:
  - `git diff --check` exited 0 after documentation updates.
  - Workspace build/typecheck/tests re-ran after documentation updates and exited 0.
  - Focused adapter test: 1 file, 10 tests passed.
  - Full conformance re-ran after documentation updates: 138 passed / 138 total; 0 failed, 0 unsupported, 0 infrastructure errors.
  - Runner tests: 10 files, 110 tests passed.
  - Runner coverage: 98.31% statements, 95.29% branches, 100% functions, 98.75% lines.
  - Runner mutation: 99.73% mutation score, 367 killed, 1 survived, 0 timeout, 0 no coverage; report at `runner/reports/mutation/mutation.html` and `runner/reports/mutation/mutation.json`.
  - Surviving runner mutant: `src/validator.ts:74` string-literal change of the default diagnostic source from `vector` to an empty string. This is diagnostic infrastructure, not financial behavior or accepted/unsupported version semantics; no critical runner compatibility mutant survived.
- Required follow-up boundary:
  - Later Draft 0.2 vector tasks may add manifest-listed files using format
    `0.1`; they must not add new operation IDs without updating the explicit
    runner metadata allowlists and Agentic registry when applicable.
  - If a later task needs new vector syntax, that task must add a focused
    format/version compatibility change before publishing vectors that require it.

## Money Rates

### TASK-004 through TASK-011 - Draft 0.2 Money Rates Slice

- Status: COMPLETE
- Source revision: `e334de83b95109f88f961fd72461a6fec7d83729` plus working-tree Money Rates changes.
- Date: 2026-09-09
- Toolchain: system `node` absent; repository-local `.tools/node-v24.20.0-linux-x64/bin/node` reported `v24.20.0` in earlier TASK-001 verification and was used for all Node/npm commands.
- Normative decisions:
  - Added `MONEY-RATE-001` through `MONEY-RATE-009` in `spec/money/rates.md`.
  - Portable Rate input has `kind: DECIMAL | PERCENTAGE` and a plain exact decimal string `value`.
  - `DECIMAL` applies the value directly as scalar; `PERCENTAGE` divides by 100 exactly before multiplication.
  - Zero and negative Rates are valid; Money currency is preserved; source Money is never mutated.
  - Exact products are returned by default with no implicit minor-unit rounding; optional explicit rounding is applied after exact multiplication.
  - Invalid/malformed/non-finite/unsupported Rate inputs use `FINKORE_MONEY_INVALID_AMOUNT`; invalid explicit rounding uses `FINKORE_MONEY_INVALID_ROUNDING`. No new portable Money error code was introduced.
  - `money.rate.apply` is conformance-local until a later Agentic promotion review; no `finkore.*` operation was added.
- Conformance vectors:
  - Added `conformance/money/rates.json` with 12 vectors: exact decimal, percentage conversion, zero, negative, fractional decimal, fractional percentage, HALF_UP rounding, HALF_EVEN rounding, numeric rate rejection, exponent rejection, unsupported kind rejection, and invalid rounding rejection.
  - Registered the file in `conformance/manifest.json`, updated `conformance/conventions.md`, runner metadata/tests, and `conformance/traceability.md`.
  - Initial pre-adapter Money conformance run after vector registration exited 3 as expected: 55 passed / 67 total, 12 unsupported Rate vectors, 0 failed, 0 infrastructure errors.
- Implementation and adapter:
  - Added `Money.applyRate(rate, options)` and exported `MoneyRateKind`, `MoneyRateInput`, and `MoneyRateApplicationOptions` from the TypeScript core.
  - Added focused Money Rate unit tests for exact scalar behavior, percentage conversion, rounding order, malformed rate inputs, malformed rounding options, portable errors and non-mutation.
  - Added adapter support for `money.rate.apply` that delegates Rate semantics to core and reports normalized Money/error observations.
  - Updated root README, TypeScript core README, adapter README, Money spec index and glossary.
- Commands:
  - `PATH=/home/will/Documents/FinFlow/.tools/node-v24.20.0-linux-x64/bin:$PATH npm run typecheck --workspaces` exited 0.
  - `PATH=/home/will/Documents/FinFlow/.tools/node-v24.20.0-linux-x64/bin:$PATH npm run test --workspaces` exited 0.
  - `PATH=/home/will/Documents/FinFlow/.tools/node-v24.20.0-linux-x64/bin:$PATH npm run build --workspaces` exited 0.
  - `PATH=/home/will/Documents/FinFlow/.tools/node-v24.20.0-linux-x64/bin:$PATH npm run test:coverage --workspace @finkore/typescript` exited 0.
  - `PATH=/home/will/Documents/FinFlow/.tools/node-v24.20.0-linux-x64/bin:$PATH npm run test:mutation --workspace @finkore/typescript` exited 0.
  - `PATH=/home/will/Documents/FinFlow/.tools/node-v24.20.0-linux-x64/bin:$PATH node runner/dist/cli/cli.js --manifest conformance/manifest.json --adapter implementations/typescript/adapters/conformance/dist/adapter.js --suite money --json` exited 0.
  - `PATH=/home/will/Documents/FinFlow/.tools/node-v24.20.0-linux-x64/bin:$PATH node runner/dist/cli/cli.js --manifest conformance/manifest.json --adapter implementations/typescript/adapters/conformance/dist/adapter.js --json` exited 0.
  - `git diff --check` exited 0.
- Unit evidence:
  - Runner: 10 files, 110 tests passed.
  - TypeScript core: 26 files, 216 tests passed.
  - Conformance adapter: 1 file, 11 tests passed.
  - Focused Money Rates unit file: 5 tests passed.
- Conformance evidence:
  - Money suite: 67 passed / 67 total; 0 failed, 0 unsupported, 0 infrastructure errors.
  - Full manifest: 150 passed / 150 total; 0 failed, 0 unsupported, 0 infrastructure errors.
  - Mutation-sensitive vectors: 126 passed / 126 total.
  - By suite: Money 67/67, Workflow 20/20, Audit 19/19, Approvals 34/34, Entities 10/10.
- Coverage:
  - TypeScript core all files: 99.03% statements, 98.19% branches, 100% functions, 99.58% lines.
  - Money package: 98.34% statements, 98.05% branches, 100% functions, 98.83% lines.
  - `src/money/money.ts`: 98.66% statements, 98.80% branches, 100% functions, 98.59% lines.
- Mutation:
  - TypeScript core final mutation score: 99.58%; report at `implementations/typescript/core/reports/mutation/mutation.html` and `implementations/typescript/core/reports/mutation/mutation.json`.
  - Money `src/money/money.ts`: 100.00% mutation score, 200 killed, 10 timeout, 0 survived, 0 no coverage.
  - No Money Rate or other Money critical mutants survived.
  - Six remaining survivors are pre-existing Entity-scope mutants in `src/entities/entity.ts` and `src/entities/errors.ts`; they are outside the Money Rates slice.
- Traceability inventory after closure:
  - Manifest format `0.1`; five suites; nine manifest-listed vector files.
  - Total requirements: 222; 158 covered; 64 not directly testable; 0 partial; 0 uncovered; 0 deferred; 0 blocking spec gaps.
  - Money requirements: 59 total; 54 covered; 5 not directly testable; 0 uncovered; 0 blocking spec gaps.
  - MONEY-RATE-001 through MONEY-RATE-009 are all COVERED and mapped to manifest-listed vectors.
- Documentation/update applicability:
  - Unit tests: updated.
  - Conformance vectors: updated.
  - Mutation-sensitive tests: updated and verified.
  - JSDoc: updated for public API additions.
  - README documentation: root, core and adapter READMEs updated.
  - `/spec`: updated with Money Rates requirements and index/glossary links.
  - `/conformance`: manifest, conventions and traceability updated.
  - `/agentic`: no change; Rate operation intentionally remains conformance-local.
  - `AGENTS.md`: no change required.

## Money Allocation

### TASK-012 - Allocation Normative Semantics

- Status: COMPLETE
- Source revision: `941564830b2f2b824c4c052802f39f53677c4ac2` plus working-tree Money Allocation specification changes.
- Date: 2026-09-10
- Scope:
  - Added `MONEY-ALLOCATION-001` through `MONEY-ALLOCATION-013` in `spec/money/allocation.md`.
  - Equal-part allocation now requires a positive integer part count and returns exactly that many ordered Money results.
  - Ratio allocation now requires a non-empty ordered list of positive integer ratios and returns one ordered Money result per ratio.
  - Target scale is explicit calculation context and is not inferred from currency metadata, source amount scale, locale, or implementation defaults.
  - Source zero and negative amounts are valid; negative-source remainder distribution uses the same declared order and increases the affected negative-result magnitude.
  - The source must be exactly representable as whole allocation units at the target scale; otherwise allocation fails with `FINKORE_MONEY_ROUNDING_REQUIRED` and must not silently round the source total.
  - Allocated results preserve source currency, sum exactly to the source amount, distribute remainders to earliest declared positions, and never mutate the source Money operand.
- Traceability:
  - Requirements inventory updated to 235 total requirements: 158 covered, 13 uncovered, 64 not directly testable, 0 partial, 0 deferred, 0 blocking spec gaps.
  - Money inventory updated to 72 requirements: 54 covered, 13 uncovered, 5 not directly testable.
  - All `MONEY-ALLOCATION-*` requirements are marked UNCOVERED until the dedicated conformance vector task publishes vector mappings.
  - Critical later-test scenarios recorded for unrepresentable source rejection, exact total preservation, ordered remainder distribution including negative sources, and source non-mutation.
- Commands:
  - `git diff --check` exited 0.
- Conformance:
  - Not run; this task added no conformance vectors and no adapter operation. Allocation conformance coverage is intentionally pending TASK-014.
- Mutation:
  - Not applicable; this was an artifact-only specification task with no runtime code changes.
- Documentation/update applicability:
  - Unit tests: no change; implementation is pending.
  - Conformance vectors: no change; TASK-014 owns vectors.
  - Mutation-sensitive tests: no runtime tests added; critical scenarios were recorded for later tasks.
  - JSDoc: no change; no public TypeScript API was added.
  - README documentation: root and TypeScript package README status remained accurate at this task boundary because allocation was specified but not yet implemented.
  - `/spec`: added Allocation document and linked it from the Money index and glossary.
  - `/conformance`: traceability updated; conventions and manifest unchanged because no vector syntax or vector file changed.
  - `/agentic`: no change; allocation operation promotion remains a later review task.
  - `AGENTS.md`: no change required.

### TASK-013 - Allocation Portable Error Design

- Status: COMPLETE
- Source revision: `0be7baaff8a00504692c2222579fd5126130e597` plus working-tree Money Allocation portable error specification changes.
- Date: 2026-09-10
- Decision:
  - Existing Money errors do not suffice for invalid allocation methods, part counts, ratio lists, ratio values, or target scales.
  - These failures are allocation-contract failures rather than invalid Money amount, invalid currency, currency mismatch, division-by-zero, or invalid Money rounding-policy failures.
  - Added portable error code `FINKORE_MONEY_INVALID_ALLOCATION`.
  - Added `MONEY-ERROR-008` requiring invalid allocation requests to fail with `FINKORE_MONEY_INVALID_ALLOCATION` and return no allocation result.
  - Unrepresentable source-at-target-scale remains `FINKORE_MONEY_ROUNDING_REQUIRED` under `MONEY-ERROR-005`; it is precision-loss prevention, not an invalid allocation-shape failure.
  - Failed allocation continues to leave the source Money operand unchanged under `MONEY-ERROR-007`.
- Traceability:
  - Requirements inventory updated to 236 total requirements: 158 covered, 14 uncovered, 64 not directly testable, 0 partial, 0 deferred, 0 blocking spec gaps.
  - Money inventory updated to 73 requirements: 54 covered, 14 uncovered, 5 not directly testable.
  - `MONEY-ERROR-008` is marked UNCOVERED until the dedicated conformance vector task publishes vector mappings.
  - Critical later-test scenario recorded for invalid allocation requests collapsing into an incorrect portable error code.
- Commands:
  - `git diff --check` exited 0.
- Conformance:
  - Not run; this task added no conformance vectors and no adapter operation. Allocation error coverage is intentionally pending TASK-014.
- Mutation:
  - Not applicable; this was an artifact-only specification task with no runtime code changes.
- Documentation/update applicability:
  - Unit tests: no change; implementation is pending.
  - Conformance vectors: no change; TASK-014 owns vectors.
  - Mutation-sensitive tests: no runtime tests added; critical error-code scenario was recorded for later tasks.
  - JSDoc: no change; no public TypeScript API was added.
  - README documentation: root and TypeScript package README status remained accurate at this task boundary because allocation was specified but not yet implemented.
  - `/spec`: Money errors, Allocation errors, and the shared error catalog were updated.
  - `/conformance`: traceability updated; conventions and manifest unchanged because no vector syntax or vector file changed.
  - `/agentic`: no change; `agentic/errors.md` delegates portable error authority to the specification catalog, and no allocation operation was promoted.
  - `AGENTS.md`: no change required.

### TASK-014 through TASK-020 - Draft 0.2 Money Allocation Slice

- Status: COMPLETE
- Source revision: `0be7baaff8a00504692c2222579fd5126130e597` plus working-tree Money Allocation conformance, implementation, adapter, documentation, and closure changes.
- Date: 2026-09-10
- Toolchain: system `node` absent; repository-local `.tools/node-v24.11.1-linux-x64/bin/node` reported `v24.11.1` and was used for all Node/npm commands in this run.
- Normative scope implemented:
  - `MONEY-ALLOCATION-001` through `MONEY-ALLOCATION-013` are implemented in the TypeScript Money core.
  - Equal allocation uses a positive integer part count and explicit target scale.
  - Ratio allocation uses a non-empty ordered list of positive integer ratios and explicit target scale.
  - Source zero and negative amounts are valid; signed results preserve ordinary numeric semantics.
  - The source amount must be exactly representable as whole units at the target scale or allocation fails with `FINKORE_MONEY_ROUNDING_REQUIRED`.
  - Invalid allocation methods, part counts, ratio lists, ratio values, and target scales fail with `FINKORE_MONEY_INVALID_ALLOCATION`.
  - Allocated Money results preserve source currency, sum exactly to the source amount, distribute remainders by declared order, and never mutate the source Money operand.
- Conformance vectors:
  - Added `conformance/money/allocation.json` with 16 vectors covering equal split, ratio split, zero and negative sources, positive and negative remainders, declared ratio order, large integer ratios, unrepresentable source scale, invalid part counts, invalid ratios, empty ratios, invalid scale, invalid method, portable error codes, and source observations.
  - Registered the file in `conformance/manifest.json`.
  - Updated `conformance/conventions.md`, `runner/src/metadata.ts`, runner metadata/integration tests, and `conformance/traceability.md`.
  - Initial conformance-first run after vector registration and before adapter support exited 3 as expected: 150 passed / 166 total, 16 unsupported allocation vectors, 0 failed, 0 infrastructure errors. The previously closed 150-vector baseline remained PASS.
- Implementation and adapter:
  - Added `Money.allocate(request)` plus `MoneyAllocationMethod`, `MoneyAllocationRequest`, and `InvalidMoneyAllocationError`.
  - Added focused core allocation tests for equal and ratio allocation, zero/negative sources, large ratios, invalid requests, unrepresentable source totals, portable errors, exact sum preservation, ordered remainder placement, and source non-mutation.
  - Added conformance adapter support for `money.allocate`; the adapter delegates financial behavior to `Money.allocate` and normalizes results/errors/observations.
  - `money.allocate` remains conformance-local until a later Agentic promotion review; no `finkore.*` operation was added.
  - Updated root README, TypeScript core README, adapter README, conformance README, and traceability readiness/gap wording.
- Commands:
  - `PATH=/home/will/Documents/FinFlow/.tools/node-v24.11.1-linux-x64/bin:$PATH npm run build --workspaces` exited 0.
  - `PATH=/home/will/Documents/FinFlow/.tools/node-v24.11.1-linux-x64/bin:$PATH npm run typecheck --workspaces` exited 0.
  - `PATH=/home/will/Documents/FinFlow/.tools/node-v24.11.1-linux-x64/bin:$PATH npm run test --workspaces` exited 0.
  - `PATH=/home/will/Documents/FinFlow/.tools/node-v24.11.1-linux-x64/bin:$PATH npm run test --workspace @finkore/typescript -- test/money` exited 0.
  - `PATH=/home/will/Documents/FinFlow/.tools/node-v24.11.1-linux-x64/bin:$PATH npm run test --workspace @finkore/typescript-conformance-adapter` exited 0.
  - `PATH=/home/will/Documents/FinFlow/.tools/node-v24.11.1-linux-x64/bin:$PATH npm run test --workspace @finkore/conformance-runner` exited 0.
  - `PATH=/home/will/Documents/FinFlow/.tools/node-v24.11.1-linux-x64/bin:$PATH node runner/dist/cli/cli.js --manifest conformance/manifest.json --adapter implementations/typescript/adapters/conformance/dist/adapter.js --suite money --json` exited 0.
  - `PATH=/home/will/Documents/FinFlow/.tools/node-v24.11.1-linux-x64/bin:$PATH node runner/dist/cli/cli.js --manifest conformance/manifest.json --adapter implementations/typescript/adapters/conformance/dist/adapter.js --json` exited 0.
  - `PATH=/home/will/Documents/FinFlow/.tools/node-v24.11.1-linux-x64/bin:$PATH npm run test:coverage --workspace @finkore/typescript` exited 0.
  - `PATH=/home/will/Documents/FinFlow/.tools/node-v24.11.1-linux-x64/bin:$PATH npm run test:coverage --workspace @finkore/conformance-runner` exited 0.
  - `PATH=/home/will/Documents/FinFlow/.tools/node-v24.11.1-linux-x64/bin:$PATH npm run test:mutation --workspace @finkore/typescript` exited 0 after escalation was required for Stryker's local logging server binding.
  - `git diff --check` exited 0.
- Unit evidence:
  - Runner: 10 files, 110 tests passed.
  - TypeScript core: 27 files, 222 tests passed.
  - Conformance adapter: 1 file, 12 tests passed.
  - Focused Money tests: 9 files, 52 tests passed.
- Conformance evidence:
  - Money suite: 83 passed / 83 total; 0 failed, 0 unsupported, 0 infrastructure errors.
  - Full manifest: 166 passed / 166 total; 0 failed, 0 unsupported, 0 infrastructure errors.
  - Mutation-sensitive vectors: 142 passed / 142 total.
  - By suite: Money 83/83, Workflow 20/20, Audit 19/19, Approvals 34/34, Entities 10/10.
- Coverage:
  - TypeScript core all files: 98.63% statements, 97.70% branches, 100% functions, 99.21% lines.
  - Money package: 96.99% statements, 95.94% branches, 100% functions, 97.72% lines.
  - `src/money/money.ts`: 97.00% statements, 96.09% branches, 100% functions, 97.34% lines.
  - Runner: 98.31% statements, 95.29% branches, 100% functions, 98.75% lines.
- Mutation:
  - TypeScript core final mutation score: 99.58%; report at `implementations/typescript/core/reports/mutation/mutation.html` and `implementations/typescript/core/reports/mutation/mutation.json`.
  - Money `src/money/money.ts`: 100.00% mutation score, 200 killed, 10 timeout, 0 survived, 0 no coverage.
  - No Money Allocation or other Money critical mutants survived.
  - Six remaining survivors are Entity-scope mutants in `src/entities/entity.ts` and `src/entities/errors.ts`; they are outside the Money Allocation slice.
- Traceability inventory after closure:
  - Manifest format `0.1`; five suites; ten manifest-listed vector files.
  - Total requirements: 236; 172 covered; 64 not directly testable; 0 partial; 0 uncovered; 0 deferred; 0 blocking spec gaps.
  - Money requirements: 73 total; 68 covered; 5 not directly testable; 0 uncovered; 0 blocking spec gaps.
  - `MONEY-ALLOCATION-001` through `MONEY-ALLOCATION-013` and `MONEY-ERROR-008` are all COVERED and mapped to manifest-listed vectors.
- Documentation/update applicability:
  - Unit tests: updated.
  - Conformance vectors: updated.
  - Mutation-sensitive tests: updated and verified.
  - JSDoc: updated for public API and error additions.
  - README documentation: root, conformance, core, and adapter READMEs updated.
  - `/spec`: previously updated by TASK-012/TASK-013; reviewed and still authoritative for this implementation.
  - `/conformance`: manifest, conventions and traceability updated.
  - `/agentic`: no change; Allocation operation intentionally remains conformance-local.
  - `AGENTS.md`: no change required.
