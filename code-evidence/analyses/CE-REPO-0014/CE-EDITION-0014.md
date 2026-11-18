# TigerBeetle — Pending debits consume a configured posted-credit budget

**Finding:** CE-FINDING-0014. **Status:** Bounded source reading completed; independent technical/domain review and validation pending.

## Reading context

| Field | Recorded observation |
| --- | --- |
| Repository / edition | `CE-REPO-0014` / `CE-EDITION-0014`; `tigerbeetle/tigerbeetle`; `0.17.9` |
| Source commit | [cc1c06a924e49b11089c521b2209d34c92caaf18](https://github.com/tigerbeetle/tigerbeetle/tree/cc1c06a924e49b11089c521b2209d34c92caaf18) |
| Reading date / analyst | 18 November 2026 / Codex |
| Financial question | Which amounts count against an account limit before a transfer is inserted? |
| Prior reading reused | Initial catalog metadata and README triage only. The implementation/test reading in this record is new. The Money PHP pilot supplies process context, not evidence copied into this source edition. |
| Execution | Not performed. Source and test assertions were read; no upstream builds, dependency installation, financial harness or test execution occurred. Runtime availability was not assessed as a prerequisite for this reading. |
| FinKore baseline | Core `2.0.4`, commit `ba16f0d726bdf46adac8b58a5641d9872f7fd8ef`; comparison is bounded and proposed, not accepted conformance. |

## Source scope and function inventory

This reading covers the linked function bodies and selected test assertions below, not the entire repository. Public sources were retrieved at the catalog commit; temporary copies are not required to read these notes. Names, signatures and source locations preserve the upstream language. No upstream prose or whole function body is reproduced.

| Qualified symbol | Source signature | Pinned file and lines | Technical record |
| --- | --- | --- | --- |
| `tigerbeetle.Account.debits_exceed_credits` | `pub fn debits_exceed_credits(self: *const Account, amount: u128) bool` | [src/tigerbeetle.zig:34–37](https://github.com/tigerbeetle/tigerbeetle/blob/cc1c06a924e49b11089c521b2209d34c92caaf18/src/tigerbeetle.zig#L34-L37) | [FN01](#fn01) |
| `tigerbeetle.Account.credits_exceed_debits` | `pub fn credits_exceed_debits(self: *const Account, amount: u128) bool` | [src/tigerbeetle.zig:39–42](https://github.com/tigerbeetle/tigerbeetle/blob/cc1c06a924e49b11089c521b2209d34c92caaf18/src/tigerbeetle.zig#L39-L42) | [FN02](#fn02) |
| `state_machine.StateMachineType(Storage).create_transfer` | `fn create_transfer(self: *StateMachine, timestamp_event: u64, t: *const Transfer) CreateTransferStatusUnion` | [src/state_machine.zig:3719–3986](https://github.com/tigerbeetle/tigerbeetle/blob/cc1c06a924e49b11089c521b2209d34c92caaf18/src/state_machine.zig#L3719-L3986) | [FN03](#fn03) |

## Function technical records

<a id="fn01"></a>

### tigerbeetle.Account.debits_exceed_credits

**Definition and evidence.** [Source lines 34–37](https://github.com/tigerbeetle/tigerbeetle/blob/cc1c06a924e49b11089c521b2209d34c92caaf18/src/tigerbeetle.zig#L34-L37). Signature is recorded in the inventory.

**Inputs and financial context.** Account pending/posted counters, proposed unsigned amount and debits_must_not_exceed_credits flag.

1. If the debit constraint flag is false, do not reject through this predicate.
2. When enabled, compare pending debits + posted debits + proposed amount against posted credits.

**Outputs and errors.** Boolean limit predicate; no error enum or local overflow check here.

**State and effects.** Const account pointer; no explicit mutation.

**Dependencies and limits.** Caller must establish arithmetic safety. Pending credits are deliberately absent from the right-hand budget. Account flags default false in lines 45–62, so this is not an unconditional account rule.

<a id="fn02"></a>

### tigerbeetle.Account.credits_exceed_debits

**Definition and evidence.** [Source lines 39–42](https://github.com/tigerbeetle/tigerbeetle/blob/cc1c06a924e49b11089c521b2209d34c92caaf18/src/tigerbeetle.zig#L39-L42). Signature is recorded in the inventory.

**Inputs and financial context.** Account pending/posted counters, proposed amount and credits_must_not_exceed_debits flag.

1. If enabled, compare pending credits + posted credits + amount against posted debits.

**Outputs and errors.** Boolean symmetric limit predicate; no local domain error or mutation.

**State and effects.** Read-only calculation.

**Dependencies and limits.** This is the opposite configured accounting orientation, not a requirement that both flags be enabled.

<a id="fn03"></a>

### state_machine.StateMachineType(Storage).create_transfer

**Definition and evidence.** [Source lines 3719–3986](https://github.com/tigerbeetle/tigerbeetle/blob/cc1c06a924e49b11089c521b2209d34c92caaf18/src/state_machine.zig#L3719-L3986). Signature is recorded in the inventory.

**Inputs and financial context.** State-machine state, explicit event timestamp and transfer; the finding concerns the normal new-transfer path after prefetch.

1. Check transfer flags/identity and existing transfer IDs; post/void requests delegate to another path.
2. Resolve accounts and ledger consistency; handle explicit/imported timestamps and closed accounts.
3. Derive actual amount, including optional balancing flags; guard pending/posted counter and timeout overflow.
4. Reject exceeds_credits or exceeds_debits when the configured account predicates hold.
5. Only after those guards insert the transfer, update pending or posted account counters, record account event and update commit timestamp.

**Outputs and errors.** A created result or a typed upstream status. Existing-ID and pending-post/void semantics are separate paths, not fully analyzed.

**State and effects.** Successful path updates transfers/accounts and may schedule expiration. The cited budget rejection precedes those insertion/update lines; persistence, linked-chain rollback and distributed consensus are not proven by this reading.

**Dependencies and limits.** State storage, prefetch/commit machinery and std.math overflow helper internals were not independently audited. Boundary tests below are source scenarios, not reproduced state-machine execution.

<a id="ce-finding-0014"></a>

## CE-FINDING-0014 — Pending debits consume a configured posted-credit budget

**Observed financial rule.** For an account with the debit constraint enabled, pending debits plus posted debits plus the proposed amount must not exceed posted credits. Pending credits do not fund that budget. A symmetric optional constraint applies to credits. The normal create-transfer path checks overflow and these predicates before inserting the transfer.

**Implementing functions.** [FN01](#fn01), [FN02](#fn02), [FN03](#fn03). The explanations above distinguish input guards, calculations, result construction and state changes.

### Current FinKore relationship

[CoreDoc scope](../../../docs/coreDoc/core-doc.md#scope) and [Core scope discipline](../../../spec/README.md#scope-discipline-non-normative) were reviewed. **This behavior is not currently defined by FinKore Core.** No exact requirement mapping, conformance case or canonical Agentic operation is asserted for this deferred domain. The distinction between pending commitments and posted funds is a useful future ledger/payment discussion. It does not establish a current Core balance, settlement or reservation operation. General failure-atomicity principles do not supply these concrete accounting formulas or prove this database implementation conforms.

The source behavior is evidence for discussion. It is not a replacement for CoreDoc, `/spec`, conformance artifacts or Agentic metadata. Upstream errors retain their original identity; none is registered here as a FinKore portable error. No normative artifact or Learn page is changed by this reading.

## Test evidence

Every row is **an assertion or test scenario read from source, not an executed or passing test**. Examples described here are source expectations unless explicitly labeled analyst reasoning.

| Test symbol / scenario | Pinned location | Actual assertion read | Limits |
| --- | --- | --- | --- |
| `test "create_transfers/lookup_transfers" / configured budget failures` | [src/state_machine_tests.zig:1239–1299](https://github.com/tigerbeetle/tigerbeetle/blob/cc1c06a924e49b11089c521b2209d34c92caaf18/src/state_machine_tests.zig#L1239-L1299) | Configures debit/credit constrained accounts, sets counters, then expects exceeds_credits and exceeds_debits for amounts just above the relevant budgets. Also lists earlier overflow failures. | This is a declarative test table interpreted by its check harness; the full harness and all account-state transitions were not executed or audited. |

## Counterexamples, limitations and open discussions

- Proposed boundary cases: exactly equal to budget succeeds, one unit beyond fails, pending debit reduces available budget and pending credit does not increase it; these are static predicate implications, not local execution observations.
- Balancing flags can reduce the actual transfer amount before the predicates. A future financial contract must state whether it rejects excess or clips to available funds.
- Do not infer global transaction atomicity, distributed ordering or automatic authorization from the ordering of guards in one method.

**Independence and attribution.** A separate repository does not establish independent corroboration. Shared dependencies, copied algorithms and design ancestry were not exhaustively investigated; no independence claim is made.

## Reading history and review

- **18 November 2026 — Codex:** Read the pinned functions and test ranges listed above; recorded this bounded financial finding and its proposed relationship to Core. Earlier discovery metadata was reused explicitly, without claiming a repeated source reading.
- **Review status:** Self-checked reasoning against the cited branches and assertions; independent technical/domain review remains pending. No upstream execution, specialist sign-off, normative acceptance or editorial publication is implied.
- **Follow-up policy:** Preserve this edition and the prior reading extent. Append dated new readings, execution evidence or changed interpretations with their reasons rather than repointing source links or erasing limitations.
