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
