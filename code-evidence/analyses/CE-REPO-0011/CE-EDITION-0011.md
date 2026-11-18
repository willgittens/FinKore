# Moov ACH — Payment control totals are checked at file and batch levels

**Finding:** CE-FINDING-0011. **Status:** Bounded source reading completed; independent technical/domain review and validation pending.

## Reading context

| Field | Recorded observation |
| --- | --- |
| Repository / edition | `CE-REPO-0011` / `CE-EDITION-0011`; `moov-io/ach`; `v1.69.0` |
| Source commit | [314f990cf2809d6f9848d0b8df5767eb19b0cf17](https://github.com/moov-io/ach/tree/314f990cf2809d6f9848d0b8df5767eb19b0cf17) |
| Reading date / analyst | 18 November 2026 / Codex |
| Financial question | Can a financially inconsistent payment file pass because its syntax was accepted or ordinary validation was skipped? |
| Prior reading reused | Initial catalog metadata and README triage only. The implementation/test reading in this record is new. The Money PHP pilot supplies process context, not evidence copied into this source edition. |
| Execution | Not performed. Source and test assertions were read; no upstream builds, dependency installation, financial harness or test execution occurred. Runtime availability was not assessed as a prerequisite for this reading. |
| FinKore baseline | Core `2.0.4`, commit `ba16f0d726bdf46adac8b58a5641d9872f7fd8ef`; comparison is bounded and proposed, not accepted conformance. |

## Source scope and function inventory

This reading covers the linked function bodies and selected test assertions below, not the entire repository. Public sources were retrieved at the catalog commit; temporary copies are not required to read these notes. Names, signatures and source locations preserve the upstream language. No upstream prose or whole function body is reproduced.

| Qualified symbol | Source signature | Pinned file and lines | Technical record |
| --- | --- | --- | --- |
| `ach.(*File).ValidateTotals` | `func (f *File) ValidateTotals() error` | [file.go:1170–1192](https://github.com/moov-io/ach/blob/314f990cf2809d6f9848d0b8df5767eb19b0cf17/file.go#L1170-L1192) | [FN01](#fn01) |
| `ach.(*File).isFileAmount` | `func (f *File) isFileAmount(IsADV bool) error` | [file.go:1249–1289](https://github.com/moov-io/ach/blob/314f990cf2809d6f9848d0b8df5767eb19b0cf17/file.go#L1249-L1289) | [FN02](#fn02) |
| `ach.(*Batch).isBatchAmount` | `func (batch *Batch) isBatchAmount() error` | [batch.go:738–770](https://github.com/moov-io/ach/blob/314f990cf2809d6f9848d0b8df5767eb19b0cf17/batch.go#L738-L770) | [FN03](#fn03) |
| `ach.(*Batch).calculateBatchAmounts` | `func (batch *Batch) calculateBatchAmounts() (credit int, debit int)` | [batch.go:772–787](https://github.com/moov-io/ach/blob/314f990cf2809d6f9848d0b8df5767eb19b0cf17/batch.go#L772-L787) | [FN04](#fn04) |

## Function technical records

<a id="fn01"></a>

### ach.(*File).ValidateTotals

**Definition and evidence.** [Source lines 1170–1192](https://github.com/moov-io/ach/blob/314f990cf2809d6f9848d0b8df5767eb19b0cf17/file.go#L1170-L1192). Signature is recorded in the inventory.

**Inputs and financial context.** Parsed ACH File, its control record and ordinary/IAT batches.

1. Determine ADV mode and validate entry/addenda count.
2. Check file amount totals and entry hash, returning the first error.
3. Validate totals on ordinary and IAT batches, then check batch count.

**Outputs and errors.** Nil on the inspected successful path or the first validation error.

**State and effects.** No direct assignments to file or batch fields in this dispatcher. Called helpers have their own behavior; no full application transaction claim is made.

**Dependencies and limits.** The method does not consult SkipAll in this body; the selected test explicitly calls it after reading with ordinary validation disabled. IAT helper internals were not reviewed.

<a id="fn02"></a>

### ach.(*File).isFileAmount

**Definition and evidence.** [Source lines 1249–1289](https://github.com/moov-io/ach/blob/314f990cf2809d6f9848d0b8df5767eb19b0cf17/file.go#L1249-L1289). Signature is recorded in the inventory.

**Inputs and financial context.** File plus explicit selection of ADV/non-ADV controls.

1. Sum debit and credit totals from ordinary and IAT batch controls for a non-ADV file.
2. For ADV, sum ADV batch controls instead.
3. Compare declared file debit total, then credit total; return a calculated-control equality error when either differs.

**Outputs and errors.** Nil or an upstream NewErrFileCalculatedControlEquality result identifying the mismatching field.

**State and effects.** Uses local integer accumulators and does not repair source controls.

**Dependencies and limits.** This check trusts batch control values, so it must be composed with batch-level checks; native int bounds are not an arbitrary-precision guarantee.

<a id="fn03"></a>

### ach.(*Batch).isBatchAmount

**Definition and evidence.** [Source lines 738–770](https://github.com/moov-io/ach/blob/314f990cf2809d6f9848d0b8df5767eb19b0cf17/batch.go#L738-L770). Signature is recorded in the inventory.

**Inputs and financial context.** Batch, its declared totals and the selected ADV classification.

1. Recalculate ordinary or ADV amounts through the respective helper.
2. Compare debit and then credit against the matching control.
3. Wrap a mismatch with the batch field and a calculated-control equality error.

**Outputs and errors.** Nil or the first batch amount error; helper/type validity is checked elsewhere.

**State and effects.** No explicit batch-control update; recalculation is used for comparison.

**Dependencies and limits.** Batch classification, full format validity and IAT processing are outside this bounded source path.

<a id="fn04"></a>

### ach.(*Batch).calculateBatchAmounts

**Definition and evidence.** [Source lines 772–787](https://github.com/moov-io/ach/blob/314f990cf2809d6f9848d0b8df5767eb19b0cf17/batch.go#L772-L787). Signature is recorded in the inventory.

**Inputs and financial context.** Ordinary batch entries with transaction codes and stored integer Amount values.

1. Iterate entry details.
2. Add amounts to the credit accumulator for the listed credit codes, or debit accumulator for listed debit codes.
3. Return the two local totals.

**Outputs and errors.** Credit and debit integer totals; the switch has no local invalid-code error branch.

**State and effects.** Reads entries and mutates only local accumulators.

**Dependencies and limits.** Invalid code handling belongs to other validators. Amount units/limits and current Nacha authority are not independently standardized by this code reading.

<a id="ce-finding-0011"></a>

## CE-FINDING-0011 — Payment control totals are checked at file and batch levels

**Observed financial rule.** ValidateTotals separately compares declared file debit/credit totals to batch totals and asks batches to validate their own controls. For ordinary batches, entry transaction codes determine which amounts contribute to debit or credit. A totals mismatch is returned as an error, without silently rewriting a control value.

**Implementing functions.** [FN01](#fn01), [FN02](#fn02), [FN03](#fn03), [FN04](#fn04). The explanations above distinguish input guards, calculations, result construction and state changes.

### Current FinKore relationship

[CoreDoc scope](../../../docs/coreDoc/core-doc.md#scope) and [Core scope discipline](../../../spec/README.md#scope-discipline-non-normative) were reviewed. **This behavior is not currently defined by FinKore Core.** No exact requirement mapping, conformance case or canonical Agentic operation is asserted for this deferred domain. ACH file totals and transaction-code classifications are payment-domain rules. Their useful design lesson is that structural acceptance and financial consistency are separate checks. No Nacha rule is adopted as a FinKore requirement, and this reading does not certify compliance with a particular Nacha edition.

The source behavior is evidence for discussion. It is not a replacement for CoreDoc, `/spec`, conformance artifacts or Agentic metadata. Upstream errors retain their original identity; none is registered here as a FinKore portable error. No normative artifact or Learn page is changed by this reading.

## Test evidence

Every row is **an assertion or test scenario read from source, not an executed or passing test**. Examples described here are source expectations unless explicitly labeled analyst reasoning.

| Test symbol / scenario | Pinned location | Actual assertion read | Limits |
| --- | --- | --- | --- |
| `TestFile_ValidateTotals / after reading with ordinary validation disabled` | [file_test.go:2696–2716](https://github.com/moov-io/ach/blob/314f990cf2809d6f9848d0b8df5767eb19b0cf17/file_test.go#L2696-L2716) | Reads with SkipAll, expects an initial totals check to succeed, increments file debit total and expects its field error, restores it, then increments an entry amount and expects a batch total error. | A scenario assertion read from source, not a local parse or payment execution. |
| `testFileDebitAmount / TestFileDebitAmount` | [file_test.go:170–185](https://github.com/moov-io/ach/blob/314f990cf2809d6f9848d0b8df5767eb19b0cf17/file_test.go#L170-L185) | Changes declared debit total to 63 and expects a calculated-control equality error for expected total zero versus declared 63. | The fixture builder and all batch variants were not exhaustively inspected. |

## Counterexamples, limitations and open discussions

- File-to-batch agreement alone cannot detect matching errors in both levels; independent entry-to-batch recomputation matters.
- Batch.ValidateTotals, lines 324–335, was also read: it calls entry-count, batch-amount and hash checks. That dispatch is not evidence of all helper correctness.
- Proposed follow-up: coordinated control corruption, credit/debit classification substitutions, invalid codes, overflow and all IAT/ADV amount paths.
- The selected tests check specific mismatches, not settlement, authorization, network acceptance or failure rollback.

**Independence and attribution.** A separate repository does not establish independent corroboration. Shared dependencies, copied algorithms and design ancestry were not exhaustively investigated; no independence claim is made.

## Reading history and review

- **18 November 2026 — Codex:** Read the pinned functions and test ranges listed above; recorded this bounded financial finding and its proposed relationship to Core. Earlier discovery metadata was reused explicitly, without claiming a repeated source reading.
- **Review status:** Self-checked reasoning against the cited branches and assertions; independent technical/domain review remains pending. No upstream execution, specialist sign-off, normative acceptance or editorial publication is implied.
- **Follow-up policy:** Preserve this edition and the prior reading extent. Append dated new readings, execution evidence or changed interpretations with their reasons rather than repointing source links or erasing limitations.
