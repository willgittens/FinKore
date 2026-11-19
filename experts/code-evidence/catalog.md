# Code Evidence — Repository catalog

<!-- Generated from repositories.json. Run npm run code-evidence:build; do not edit directly. -->

Discovery updated on 2026-11-18: 15 repositories, 15 source editions, 9 primary languages.

These are discovery observations: selected README passages and GitHub metadata were inspected at discovery time. Topics and questions are editorial hypotheses. Later implementation readings, findings, contract comparisons and execution/review status are listed in the [analysis records](README.md#analysis-records); they do not change this discovery history.

Versions identify selected source editions. Follow each commit link for the exact source. The owner is the GitHub account holding the repository; original authors are recorded separately when verified. License identifiers are GitHub metadata, not an independent review of license files. `NOASSERTION` means the metadata does not identify a license.

| Project / repository | GitHub owner | Primary language | Kind | Selected version | License metadata | Investigation scope |
| --- | --- | --- | --- | --- | --- | --- |
| [Money PHP](https://github.com/moneyphp/money) (moneyphp/money) | [moneyphp](https://github.com/moneyphp) | PHP | library | [v4.9.0](https://github.com/moneyphp/money/tree/d49ee625c6ba79b9d7a228ce153b02fc1032152b) | MIT | core_related |
| [Brick Money](https://github.com/brick/money) (brick/money) | [brick](https://github.com/brick) | PHP | library | [0.15.2](https://github.com/brick/money/tree/d025eb4a105071028764859d93537d394a147c31) | MIT | mixed |
| [RubyMoney](https://github.com/RubyMoney/money) (RubyMoney/money) | [RubyMoney](https://github.com/RubyMoney) | Ruby | library | [v7.1.1](https://github.com/RubyMoney/money/tree/26e2829c34f165847040a5a40d4d2daa5eb72927) | MIT | mixed |
| [Joda-Money](https://github.com/JodaOrg/joda-money) (JodaOrg/joda-money) | [JodaOrg](https://github.com/JodaOrg) | Java | library | [v2.0.3](https://github.com/JodaOrg/joda-money/tree/2e8a1fd4263de2ce6fcc9c2ae703d559dd86c61e) | Apache-2.0 | core_related |
| [Dinero.js](https://github.com/dinerojs/dinero.js) (dinerojs/dinero.js) | [dinerojs](https://github.com/dinerojs) | TypeScript | library | [v2.0.2](https://github.com/dinerojs/dinero.js/tree/cc7df3e6d986445eab42dffc33f8c2d14e4d588a) | MIT | mixed |
| [GoMoney](https://github.com/Rhymond/go-money) (Rhymond/go-money) | [Rhymond](https://github.com/Rhymond) | Go | library | [v1.0.15](https://github.com/Rhymond/go-money/tree/b43ce49343a684c955ffb1a4e4165b81db8989b7) | MIT | core_related |
| [NodaMoney](https://github.com/RemyDuijkeren/NodaMoney) (RemyDuijkeren/NodaMoney) | [RemyDuijkeren](https://github.com/RemyDuijkeren) | C# | library | [2.10.0](https://github.com/RemyDuijkeren/NodaMoney/tree/1844718cc007b0699ab8aefbbdbcd3f532103708) | Apache-2.0 | mixed |
| [py-moneyed](https://github.com/py-moneyed/py-moneyed) (py-moneyed/py-moneyed) | [py-moneyed](https://github.com/py-moneyed) | Python | library | [v3.0](https://github.com/py-moneyed/py-moneyed/tree/f45c0078b5ca2af098d5d75f2c54295e7196388e) | BSD-3-Clause | core_related |
| [Beancount](https://github.com/beancount/beancount) (beancount/beancount) | [beancount](https://github.com/beancount) | Python | language_and_library | [3.2.3](https://github.com/beancount/beancount/tree/eeda2aa2a3204ffb980dab11220b2abde5e80b38) | GPL-2.0 | exploratory |
| [QuantLib](https://github.com/lballabio/QuantLib) (lballabio/QuantLib) | [lballabio](https://github.com/lballabio) | C++ | library | [v1.44](https://github.com/lballabio/QuantLib/tree/ab4cb476d35f7275834bc05b47d1324403d1823b) | NOASSERTION | exploratory |
| [Moov ACH](https://github.com/moov-io/ach) (moov-io/ach) | [moov-io](https://github.com/moov-io) | Go | library_and_service | [v1.69.0](https://github.com/moov-io/ach/tree/314f990cf2809d6f9848d0b8df5767eb19b0cf17) | Apache-2.0 | exploratory |
| [Apache Fineract](https://github.com/apache/fineract) (apache/fineract) | [apache](https://github.com/apache) | Java | application | [1.16.1](https://github.com/apache/fineract/tree/c643dab306fe29798951591ce825fd5e5272923e) | Apache-2.0 | exploratory |
| [Formance Ledger](https://github.com/formancehq/ledger) (formancehq/ledger) | [formancehq](https://github.com/formancehq) | Go | service | [v2.4.18](https://github.com/formancehq/ledger/tree/83cd8dc7a66ba02a0418a36ec45663b19e26dcb3) | MIT | exploratory |
| [TigerBeetle](https://github.com/tigerbeetle/tigerbeetle) (tigerbeetle/tigerbeetle) | [tigerbeetle](https://github.com/tigerbeetle) | Zig | database | [0.17.9](https://github.com/tigerbeetle/tigerbeetle/tree/cc1c06a924e49b11089c521b2209d34c92caaf18) | Apache-2.0 | exploratory |
| [ERPNext](https://github.com/frappe/erpnext) (frappe/erpnext) | [frappe](https://github.com/frappe) | Python | application | [v16.60.0](https://github.com/frappe/erpnext/tree/886ab6ae187244e7f1b852393384ab6019d56264) | GPL-3.0 | exploratory |

## Investigation queue

### CE-REPO-0001 — Money PHP

**Why selected.** The README presents a Money value object and a proportional allocation example.

**Topics.** monetary representation; allocation; currency compatibility.

**Author attribution.** Individual authors have not been verified; the repository owner is listed above.

Questions for code and test inspection:

- How are allocation remainders assigned for positive, negative and zero amounts?
- Which arithmetic and comparison operations reject mismatched currencies?

**Context and limits.** The README credits Fowler’s Money pattern; similar libraries may share design ancestry.

**CE-EDITION-0001.** Version v4.9.0; release_tag; source commit [d49ee625c6ba79b9d7a228ce153b02fc1032152b](https://github.com/moneyphp/money/tree/d49ee625c6ba79b9d7a228ce153b02fc1032152b).

[Inspected README](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/README.md) · [Repository metadata](https://api.github.com/repos/moneyphp/money) · [Version selection](https://api.github.com/repos/moneyphp/money/releases/latest) · [Commit resolution](https://api.github.com/repos/moneyphp/money/commits/v4.9.0)

**Selection.** GitHub latest release at observation time; resolved the release tag through the commits API.

**Dates.** Observed 2026-11-18; source commit 2026-05-04T20:23:15Z; GitHub release publication 2026-05-04T20:25:17Z.

### CE-REPO-0002 — Brick Money

**Why selected.** The README describes exact arithmetic, explicit rounding and several allocation strategies.

**Topics.** rounding; calculation scale; allocation; currency conversion.

**Author attribution.** Individual authors have not been verified; the repository owner is listed above.

Questions for code and test inspection:

- Where do contexts impose a scale or require a rounding decision?
- Which allocation policies preserve totals, and how do tie and negative cases differ?

**Context and limits.** Another PHP Money library; language diversity and independence require separate assessment.

**CE-EDITION-0002.** Version 0.15.2; release_tag; source commit [d025eb4a105071028764859d93537d394a147c31](https://github.com/brick/money/tree/d025eb4a105071028764859d93537d394a147c31).

[Inspected README](https://github.com/brick/money/blob/d025eb4a105071028764859d93537d394a147c31/README.md) · [Repository metadata](https://api.github.com/repos/brick/money) · [Version selection](https://api.github.com/repos/brick/money/releases/latest) · [Commit resolution](https://api.github.com/repos/brick/money/commits/0.15.2)

**Selection.** GitHub latest release at observation time; resolved the release tag through the commits API.

**Dates.** Observed 2026-11-18; source commit 2026-09-29T22:27:31Z; GitHub release publication 2026-09-29T22:29:26Z.

### CE-REPO-0003 — RubyMoney

**Why selected.** The README presents amount/currency values, integer subunits and exchange operations.

**Topics.** monetary representation; currency compatibility; currency conversion.

**Author attribution.** Individual authors have not been verified; the repository owner is listed above.

Questions for code and test inspection:

- Which defaults or mutable configuration can affect an otherwise identical calculation?
- How are numeric subunits, currency changes and exchange operations distinguished?

**CE-EDITION-0003.** Version v7.1.1; tag; source commit [26e2829c34f165847040a5a40d4d2daa5eb72927](https://github.com/RubyMoney/money/tree/26e2829c34f165847040a5a40d4d2daa5eb72927).

[Inspected README](https://github.com/RubyMoney/money/blob/26e2829c34f165847040a5a40d4d2daa5eb72927/README.md) · [Repository metadata](https://api.github.com/repos/RubyMoney/money) · [Version selection](https://api.github.com/repos/RubyMoney/money/tags?per_page=5) · [Commit resolution](https://api.github.com/repos/RubyMoney/money/commits/v7.1.1)

**Selection.** Highest numeric stable tag in the inspected tag page; not a claim about all tags or package registries.

**Dates.** Observed 2026-11-18; source commit 2026-07-31T09:54:23Z; GitHub release publication not available for this tag.

### CE-REPO-0004 — Joda-Money

**Why selected.** The README distinguishes Money from BigMoney and illustrates explicit rounding.

**Topics.** monetary representation; calculation scale; rounding.

**Author attribution.** Individual authors have not been verified; the repository owner is listed above.

Questions for code and test inspection:

- What differs between currency-scale Money and the scale of BigMoney?
- Which paths preserve an exact result and which require rounding?

**CE-EDITION-0004.** Version v2.0.3; release_tag; source commit [2e8a1fd4263de2ce6fcc9c2ae703d559dd86c61e](https://github.com/JodaOrg/joda-money/tree/2e8a1fd4263de2ce6fcc9c2ae703d559dd86c61e).

[Inspected README](https://github.com/JodaOrg/joda-money/blob/2e8a1fd4263de2ce6fcc9c2ae703d559dd86c61e/README.md) · [Repository metadata](https://api.github.com/repos/JodaOrg/joda-money) · [Version selection](https://api.github.com/repos/JodaOrg/joda-money/releases/latest) · [Commit resolution](https://api.github.com/repos/JodaOrg/joda-money/commits/v2.0.3)

**Selection.** GitHub latest release at observation time; resolved the release tag through the commits API.

**Dates.** Observed 2026-11-18; source commit 2025-12-14T11:11:31Z; GitHub release publication 2025-12-14T11:15:16Z.

### CE-REPO-0005 — Dinero.js

**Why selected.** The README describes monetary calculations, configurable numeric precision and non-decimal subdivisions.

**Topics.** monetary representation; precision; currency subdivisions.

**Author attribution.** Individual authors have not been verified; the repository owner is listed above.

Questions for code and test inspection:

- How do number and bigint backends bound precision and overflow?
- Which assumptions about scale and non-decimal subdivisions differ from FinKore Core?

**CE-EDITION-0005.** Version v2.0.2; release_tag; source commit [cc7df3e6d986445eab42dffc33f8c2d14e4d588a](https://github.com/dinerojs/dinero.js/tree/cc7df3e6d986445eab42dffc33f8c2d14e4d588a).

[Inspected README](https://github.com/dinerojs/dinero.js/blob/cc7df3e6d986445eab42dffc33f8c2d14e4d588a/README.md) · [Repository metadata](https://api.github.com/repos/dinerojs/dinero.js) · [Version selection](https://api.github.com/repos/dinerojs/dinero.js/releases/latest) · [Commit resolution](https://api.github.com/repos/dinerojs/dinero.js/commits/v2.0.2)

**Selection.** GitHub latest release at observation time; resolved the release tag through the commits API.

**Dates.** Observed 2026-11-18; source commit 2026-03-13T15:37:57Z; GitHub release publication 2026-03-13T15:39:30Z.

### CE-REPO-0006 — GoMoney

**Why selected.** The README describes integer subunits, currency checks, splitting and allocation.

**Topics.** monetary representation; allocation; currency compatibility.

**Author attribution.** Individual authors have not been verified; the repository owner is listed above.

Questions for code and test inspection:

- How are residual units distributed, including negative amounts and zero ratios?
- Which input paths can lose precision or exceed the representation range?

**Context and limits.** The repository explicitly identifies its design as Fowler’s Money pattern.

**CE-EDITION-0006.** Version v1.0.15; release_tag; source commit [b43ce49343a684c955ffb1a4e4165b81db8989b7](https://github.com/Rhymond/go-money/tree/b43ce49343a684c955ffb1a4e4165b81db8989b7).

[Inspected README](https://github.com/Rhymond/go-money/blob/b43ce49343a684c955ffb1a4e4165b81db8989b7/README.md) · [Repository metadata](https://api.github.com/repos/Rhymond/go-money) · [Version selection](https://api.github.com/repos/Rhymond/go-money/releases/latest) · [Commit resolution](https://api.github.com/repos/Rhymond/go-money/commits/v1.0.15)

**Selection.** GitHub latest release at observation time; resolved the release tag through the commits API.

**Dates.** Observed 2026-11-18; source commit 2025-04-30T05:15:53Z; GitHub release publication 2025-04-30T05:16:30Z.

### CE-REPO-0007 — NodaMoney

**Why selected.** The README describes money contexts, default minor-unit rounding and a fixed-scale FastMoney type.

**Topics.** rounding; calculation scale; currency compatibility; monetary context.

**Author attribution.** Individual authors have not been verified; the repository owner is listed above.

Questions for code and test inspection:

- When does default rounding occur, and can repeated operations change monetary meaning?
- Which implicit currency or context choices would require an explicit fact in FinKore?

**Context and limits.** The README identifies Joda-Money as an inspiration; these are not automatically independent evidence.

**CE-EDITION-0007.** Version 2.10.0; release_tag; source commit [1844718cc007b0699ab8aefbbdbcd3f532103708](https://github.com/RemyDuijkeren/NodaMoney/tree/1844718cc007b0699ab8aefbbdbcd3f532103708).

[Inspected README](https://github.com/RemyDuijkeren/NodaMoney/blob/1844718cc007b0699ab8aefbbdbcd3f532103708/README.md) · [Repository metadata](https://api.github.com/repos/RemyDuijkeren/NodaMoney) · [Version selection](https://api.github.com/repos/RemyDuijkeren/NodaMoney/releases/latest) · [Commit resolution](https://api.github.com/repos/RemyDuijkeren/NodaMoney/commits/2.10.0)

**Selection.** GitHub latest release at observation time; resolved the release tag through the commits API.

**Dates.** Observed 2026-11-18; source commit 2026-11-16T10:22:50Z; GitHub release publication 2026-11-16T13:07:52Z.

### CE-REPO-0008 — py-moneyed

**Why selected.** The README provides Money and Currency abstractions for Python.

**Topics.** monetary representation; currency compatibility; decimal inputs.

**Author attribution.** Individual authors have not been verified; the repository owner is listed above.

Questions for code and test inspection:

- How are decimal inputs and host decimal context handled at operation boundaries?
- Which arithmetic operations enforce currency compatibility?

**Context and limits.** The README records that some code derives from python-money.

**CE-EDITION-0008.** Version v3.0; release_tag; source commit [f45c0078b5ca2af098d5d75f2c54295e7196388e](https://github.com/py-moneyed/py-moneyed/tree/f45c0078b5ca2af098d5d75f2c54295e7196388e).

[Inspected README](https://github.com/py-moneyed/py-moneyed/blob/f45c0078b5ca2af098d5d75f2c54295e7196388e/README.rst) · [Repository metadata](https://api.github.com/repos/py-moneyed/py-moneyed) · [Version selection](https://api.github.com/repos/py-moneyed/py-moneyed/releases/latest) · [Commit resolution](https://api.github.com/repos/py-moneyed/py-moneyed/commits/v3.0)

**Selection.** GitHub latest release at observation time; resolved the release tag through the commits API.

**Dates.** Observed 2026-11-18; source commit 2022-11-27T21:27:16Z; GitHub release publication 2022-11-27T21:28:28Z.

### CE-REPO-0009 — Beancount

**Why selected.** The README describes a language for financial transaction records and reports.

**Topics.** double-entry accounting; balance validation; financial records.

**Author attribution.** [Martin Blais](https://github.com/beancount/beancount/blob/eeda2aa2a3204ffb980dab11220b2abde5e80b38/README.rst).

Questions for code and test inspection:

- How are balancing tolerances derived, and which assumptions are commodity-specific?
- How do transaction validation and historical record corrections interact?

**Context and limits.** Study accounting semantics as future-domain questions; ledger posting is outside current Core.

**CE-EDITION-0009.** Version 3.2.3; tag; source commit [eeda2aa2a3204ffb980dab11220b2abde5e80b38](https://github.com/beancount/beancount/tree/eeda2aa2a3204ffb980dab11220b2abde5e80b38).

[Inspected README](https://github.com/beancount/beancount/blob/eeda2aa2a3204ffb980dab11220b2abde5e80b38/README.rst) · [Repository metadata](https://api.github.com/repos/beancount/beancount) · [Version selection](https://api.github.com/repos/beancount/beancount/tags?per_page=100) · [Commit resolution](https://api.github.com/repos/beancount/beancount/commits/3.2.3)

**Selection.** Highest numeric stable tag in the inspected tag page; not a claim about all tags or package registries.

**Dates.** Observed 2026-11-18; source commit 2026-05-05T22:57:11Z; GitHub release publication not available for this tag.

### CE-REPO-0010 — QuantLib

**Why selected.** The README describes a quantitative-finance library for modeling, trading and risk management.

**Topics.** quantitative finance; financial dates; interest conventions; valuation.

**Author attribution.** Individual authors have not been verified; the repository owner is listed above.

Questions for code and test inspection:

- Which date, calendar and day-count conventions change financial outcomes?
- Which calculations depend on market data or evaluation dates that must be explicit?

**Context and limits.** Interest/date topics are investigation hypotheses; the inspected README does not verify specific algorithms.

**CE-EDITION-0010.** Version v1.44; release_tag; source commit [ab4cb476d35f7275834bc05b47d1324403d1823b](https://github.com/lballabio/QuantLib/tree/ab4cb476d35f7275834bc05b47d1324403d1823b).

[Inspected README](https://github.com/lballabio/QuantLib/blob/ab4cb476d35f7275834bc05b47d1324403d1823b/README.md) · [Repository metadata](https://api.github.com/repos/lballabio/QuantLib) · [Version selection](https://api.github.com/repos/lballabio/QuantLib/releases/latest) · [Commit resolution](https://api.github.com/repos/lballabio/QuantLib/commits/v1.44)

**Selection.** GitHub latest release at observation time; resolved the release tag through the commits API.

**Dates.** Observed 2026-11-18; source commit 2026-10-13T07:07:18Z; GitHub release publication 2026-10-13T10:44:57Z.

### CE-REPO-0011 — Moov ACH

**Why selected.** The README describes reading, writing and validating ACH payment files against Nacha formats.

**Topics.** payment file validation; payment amounts; control totals.

**Author attribution.** Individual authors have not been verified; the repository owner is listed above.

Questions for code and test inspection:

- Which amount limits, control totals and cross-record checks protect financial meaning?
- Which validations depend on a particular Nacha edition or jurisdiction?

**Context and limits.** Payment and settlement rules are outside current Core; implementation code is not an authoritative Nacha rulebook.

**CE-EDITION-0011.** Version v1.69.0; release_tag; source commit [314f990cf2809d6f9848d0b8df5767eb19b0cf17](https://github.com/moov-io/ach/tree/314f990cf2809d6f9848d0b8df5767eb19b0cf17).

[Inspected README](https://github.com/moov-io/ach/blob/314f990cf2809d6f9848d0b8df5767eb19b0cf17/README.md) · [Repository metadata](https://api.github.com/repos/moov-io/ach) · [Version selection](https://api.github.com/repos/moov-io/ach/releases/latest) · [Commit resolution](https://api.github.com/repos/moov-io/ach/commits/v1.69.0)

**Selection.** GitHub latest release at observation time; resolved the release tag through the commits API.

**Dates.** Observed 2026-11-18; source commit 2026-11-18T20:56:10Z; GitHub release publication 2026-11-18T21:03:21Z.

### CE-REPO-0012 — Apache Fineract

**Why selected.** The README describes a core banking platform; lending and lifecycle rules are candidates for deeper inspection.

**Topics.** core banking; lending; repayment allocation; financial lifecycle.

**Author attribution.** Individual authors have not been verified; the repository owner is listed above.

Questions for code and test inspection:

- How do repayment allocation, accrual and recalculation policies affect loan outcomes?
- Which changes invalidate a prior approval or prevent a lifecycle transition?

**Context and limits.** A large platform with configurable product policies; no particular lending or approval behavior has been verified.

**CE-EDITION-0012.** Version 1.16.1; release_tag; source commit [c643dab306fe29798951591ce825fd5e5272923e](https://github.com/apache/fineract/tree/c643dab306fe29798951591ce825fd5e5272923e).

[Inspected README](https://github.com/apache/fineract/blob/c643dab306fe29798951591ce825fd5e5272923e/README.md) · [Repository metadata](https://api.github.com/repos/apache/fineract) · [Version selection](https://api.github.com/repos/apache/fineract/releases/latest) · [Commit resolution](https://api.github.com/repos/apache/fineract/commits/1.16.1)

**Selection.** GitHub latest release at observation time; resolved the release tag through the commits API.

**Dates.** Observed 2026-11-18; source commit 2026-10-26T16:21:58Z; GitHub release publication 2026-10-26T19:22:08Z.

### CE-REPO-0013 — Formance Ledger

**Why selected.** The README describes an account-based programmable ledger and atomic multi-posting transactions.

**Topics.** ledger posting; transaction atomicity; financial history.

**Author attribution.** Individual authors have not been verified; the repository owner is listed above.

Questions for code and test inspection:

- What is the exact atomicity boundary of a multi-posting transaction?
- How are duplicate instructions, reversals and recorded history distinguished?

**Context and limits.** Ledger posting and concrete reversal effects remain outside current Core; a README claim is not execution evidence.

**CE-EDITION-0013.** Version v2.4.18; release_tag; source commit [83cd8dc7a66ba02a0418a36ec45663b19e26dcb3](https://github.com/formancehq/ledger/tree/83cd8dc7a66ba02a0418a36ec45663b19e26dcb3).

[Inspected README](https://github.com/formancehq/ledger/blob/83cd8dc7a66ba02a0418a36ec45663b19e26dcb3/README.md) · [Repository metadata](https://api.github.com/repos/formancehq/ledger) · [Version selection](https://api.github.com/repos/formancehq/ledger/releases/latest) · [Commit resolution](https://api.github.com/repos/formancehq/ledger/commits/v2.4.18)

**Selection.** GitHub latest release at observation time; resolved the release tag through the commits API.

**Dates.** Observed 2026-11-18; source commit 2026-11-05T16:03:57Z; GitHub release publication 2026-11-05T16:13:03Z.

### CE-REPO-0014 — TigerBeetle

**Why selected.** The README presents a financial-transactions database with debit, credit, pending and posted account fields.

**Topics.** financial transactions; debit and credit controls; pending transfers.

**Author attribution.** Individual authors have not been verified; the repository owner is listed above.

Questions for code and test inspection:

- Which invariants connect pending transfers, posted transfers and account limits?
- How are transfer identity, repeated requests and failure atomicity handled?

**Context and limits.** Distributed coordination and ledger effects are outside current Core; database guarantees require their own assumptions.

**CE-EDITION-0014.** Version 0.17.9; release_tag; source commit [cc1c06a924e49b11089c521b2209d34c92caaf18](https://github.com/tigerbeetle/tigerbeetle/tree/cc1c06a924e49b11089c521b2209d34c92caaf18).

[Inspected README](https://github.com/tigerbeetle/tigerbeetle/blob/cc1c06a924e49b11089c521b2209d34c92caaf18/README.md) · [Repository metadata](https://api.github.com/repos/tigerbeetle/tigerbeetle) · [Version selection](https://api.github.com/repos/tigerbeetle/tigerbeetle/releases/latest) · [Commit resolution](https://api.github.com/repos/tigerbeetle/tigerbeetle/commits/0.17.9)

**Selection.** GitHub latest release at observation time; resolved the release tag through the commits API.

**Dates.** Observed 2026-11-18; source commit 2026-07-03T21:58:57Z; GitHub release publication 2026-07-06T17:24:50Z.

### CE-REPO-0015 — ERPNext

**Why selected.** The README describes an ERP with accounting, cash-flow and order-management functions.

**Topics.** accounting; invoices; financial documents; financial lifecycle.

**Author attribution.** Individual authors have not been verified; the repository owner is listed above.

Questions for code and test inspection:

- Which changes to financial documents require cancellation, amendment or renewed approval?
- How are invoice totals, taxes and reconciliation policies bounded by configuration and jurisdiction?

**Context and limits.** Only financial modules are relevant to this catalog; tax, reconciliation and concrete accounting effects remain deferred.

**CE-EDITION-0015.** Version v16.60.0; release_tag; source commit [886ab6ae187244e7f1b852393384ab6019d56264](https://github.com/frappe/erpnext/tree/886ab6ae187244e7f1b852393384ab6019d56264).

[Inspected README](https://github.com/frappe/erpnext/blob/886ab6ae187244e7f1b852393384ab6019d56264/README.md) · [Repository metadata](https://api.github.com/repos/frappe/erpnext) · [Version selection](https://api.github.com/repos/frappe/erpnext/releases/latest) · [Commit resolution](https://api.github.com/repos/frappe/erpnext/commits/v16.60.0)

**Selection.** GitHub latest release at observation time; resolved the release tag through the commits API.

**Dates.** Observed 2026-11-18; source commit 2026-11-17T15:01:10Z; GitHub release publication 2026-11-17T15:01:17Z.

See [the workflow](README.md) for reading, review, deduplication and contract-comparison rules.
