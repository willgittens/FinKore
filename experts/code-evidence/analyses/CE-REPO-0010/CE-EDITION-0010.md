# QuantLib — Interest year fractions depend on day-count and endpoint policy

**Finding:** CE-FINDING-0010. **Status:** Bounded source reading completed; independent technical/domain review and validation pending.

## Reading context

| Field | Recorded observation |
| --- | --- |
| Repository / edition | `CE-REPO-0010` / `CE-EDITION-0010`; `lballabio/QuantLib`; `v1.44` |
| Source commit | [ab4cb476d35f7275834bc05b47d1324403d1823b](https://github.com/lballabio/QuantLib/tree/ab4cb476d35f7275834bc05b47d1324403d1823b) |
| Reading date / analyst | 18 November 2026 / Codex |
| Financial question | What financial context changes the year fraction for an otherwise identical date interval? |
| Prior reading reused | Initial catalog metadata and README triage only. The implementation/test reading in this record is new. The Money PHP pilot supplies process context, not evidence copied into this source edition. |
| Execution | Not performed. Source and test assertions were read; no upstream builds, dependency installation, financial harness or test execution occurred. Runtime availability was not assessed as a prerequisite for this reading. |
| FinKore baseline | Core `2.0.4`, commit `ba16f0d726bdf46adac8b58a5641d9872f7fd8ef`; comparison is bounded and proposed, not accepted conformance. |

## Source scope and function inventory

This reading covers the linked function bodies and selected test assertions below, not the entire repository. Public sources were retrieved at the catalog commit; temporary copies are not required to read these notes. Names, signatures and source locations preserve the upstream language. No upstream prose or whole function body is reproduced.

| Qualified symbol | Source signature | Pinned file and lines | Technical record |
| --- | --- | --- | --- |
| `QuantLib::Actual360::Impl::dayCount` | `Date::serial_type dayCount(const Date& d1, const Date& d2) const override` | [ql/time/daycounters/actual360.hpp:50–52](https://github.com/lballabio/QuantLib/blob/ab4cb476d35f7275834bc05b47d1324403d1823b/ql/time/daycounters/actual360.hpp#L50-L52) | [FN01](#fn01) |
| `QuantLib::Actual360::Impl::yearFraction` | `Time yearFraction(const Date& d1, const Date& d2, const Date&, const Date&) const override` | [ql/time/daycounters/actual360.hpp:53–57](https://github.com/lballabio/QuantLib/blob/ab4cb476d35f7275834bc05b47d1324403d1823b/ql/time/daycounters/actual360.hpp#L53-L57) | [FN02](#fn02) |
| `QuantLib::Actual360::Actual360` | `explicit Actual360(const bool includeLastDay = false)` | [ql/time/daycounters/actual360.hpp:60–61](https://github.com/lballabio/QuantLib/blob/ab4cb476d35f7275834bc05b47d1324403d1823b/ql/time/daycounters/actual360.hpp#L60-L61) | [FN03](#fn03) |

## Function technical records

<a id="fn01"></a>

### QuantLib::Actual360::Impl::dayCount

**Definition and evidence.** [Source lines 50–52](https://github.com/lballabio/QuantLib/blob/ab4cb476d35f7275834bc05b47d1324403d1823b/ql/time/daycounters/actual360.hpp#L50-L52). Signature is recorded in the inventory.

**Inputs and financial context.** Start/end dates and the Impl includeLastDay_ setting initialized at lines 43–44.

1. Subtract the date serial values.
2. Add one when includeLastDay_ is true.

**Outputs and errors.** A signed day count; no local ordering/valid-date guard.

**State and effects.** Const method; no date mutation.

**Dependencies and limits.** Date arithmetic implementation and treatment of invalid/reversed intervals were not independently reviewed.

<a id="fn02"></a>

### QuantLib::Actual360::Impl::yearFraction

**Definition and evidence.** [Source lines 53–57](https://github.com/lballabio/QuantLib/blob/ab4cb476d35f7275834bc05b47d1324403d1823b/ql/time/daycounters/actual360.hpp#L53-L57). Signature is recorded in the inventory.

**Inputs and financial context.** Date endpoints and inclusion setting; the two reference-period parameters are unnamed and unused in this implementation.

1. Call daysBetween(d1,d2).
2. Add 1.0 for inclusive-last-day mode, otherwise 0.0.
3. Divide by 360.0.

**Outputs and errors.** A Time year fraction, not a monetary amount; no local guard or error normalization.

**State and effects.** Const calculation only.

**Dependencies and limits.** daysBetween and high-resolution Date internals were not traced. This does not verify an entire interest/pricing formula or market convention.

<a id="fn03"></a>

### QuantLib::Actual360::Actual360

**Definition and evidence.** [Source lines 60–61](https://github.com/lballabio/QuantLib/blob/ab4cb476d35f7275834bc05b47d1324403d1823b/ql/time/daycounters/actual360.hpp#L60-L61). Signature is recorded in the inventory.

**Inputs and financial context.** Explicit endpoint flag, default false.

1. Create a DayCounter implementation carrying the selected flag.

**Outputs and errors.** An Actual360 day counter; constructor/dependency failures were not analyzed.

**State and effects.** Creates implementation state for the policy; no wall-clock lookup occurs in this constructor.

**Dependencies and limits.** Default flag is an upstream policy; consumers of a future financial operation would need to declare the applicable convention.

<a id="ce-finding-0010"></a>

## CE-FINDING-0010 — Interest year fractions depend on day-count and endpoint policy

**Observed financial rule.** Actual360 uses actual elapsed days and a fixed 360-day denominator. Its includeLastDay option adds a day to both day count and year fraction, so the endpoint convention is an explicit part of the financial calculation.

**Implementing functions.** [FN01](#fn01), [FN02](#fn02), [FN03](#fn03). The explanations above distinguish input guards, calculations, result construction and state changes.

### Current FinKore relationship

[CoreDoc scope](../../../../docs/coreDoc/core-doc.md#scope) and [Core scope discipline](../../../../spec/README.md#scope-discipline-non-normative) were reviewed. **This behavior is not currently defined by FinKore Core.** No exact requirement mapping, conformance case or canonical Agentic operation is asserted for this deferred domain. Core does not currently define interest accrual or financial day-count conventions. The potential benefit is identifying explicit calculation context for a future domain; no interest or date requirement ID is invented. The general need for reproducible context is not a semantic mapping to a current Money operation.

The source behavior is evidence for discussion. It is not a replacement for CoreDoc, `/spec`, conformance artifacts or Agentic metadata. Upstream errors retain their original identity; none is registered here as a FinKore portable error. No normative artifact or Learn page is changed by this reading.

## Test evidence

Every row is **an assertion or test scenario read from source, not an executed or passing test**. Examples described here are source expectations unless explicitly labeled analyst reasoning.

| Test symbol / scenario | Pinned location | Actual assertion read | Limits |
| --- | --- | --- | --- |
| `BOOST_AUTO_TEST_CASE(testActualConsistency)` | [test-suite/daycounters.cpp:1268–1314](https://github.com/lballabio/QuantLib/blob/ab4cb476d35f7275834bc05b47d1324403d1823b/test-suite/daycounters.cpp#L1268-L1314) | Constructs Actual360 and Actual360(true), compares them across several date pairs, and checks the one-day inclusion adjustment using a 1e-14 numerical tolerance. | This tolerance applies to Time fractions, not exact Money. The test is comparative, not an independent validation of every day-count convention. |

## Counterexamples, limitations and open discussions

- A future rule must distinguish day-count basis, endpoint inclusion, reference periods, date validity and the later rounding of monetary interest.
- The test comparison uses floating arithmetic for a time ratio; this is not a recommendation for approximate Money conformance comparison.
- Proposed follow-up: equal endpoints, reversed endpoints, leap years, sub-day dates and declared conversion from a time ratio to an exact-decimal financial amount.

**Independence and attribution.** A separate repository does not establish independent corroboration. Shared dependencies, copied algorithms and design ancestry were not exhaustively investigated; no independence claim is made.

## Reading history and review

- **18 November 2026 — Codex:** Read the pinned functions and test ranges listed above; recorded this bounded financial finding and its proposed relationship to Core. Earlier discovery metadata was reused explicitly, without claiming a repeated source reading.
- **Review status:** Self-checked reasoning against the cited branches and assertions; independent technical/domain review remains pending. No upstream execution, specialist sign-off, normative acceptance or editorial publication is implied.
- **Follow-up policy:** Preserve this edition and the prior reading extent. Append dated new readings, execution evidence or changed interpretations with their reasons rather than repointing source links or erasing limitations.
