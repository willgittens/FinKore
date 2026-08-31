# Currency

## Status

**Draft**

## Purpose

This document defines currency identity and compatibility for Money values.

## Requirements

- A currency identifier MUST be non-empty and unambiguous within its declared context.
- ISO 4217 alphabetic codes SHOULD be used where applicable and MUST be uppercase when used.
- Private identifiers MAY be used when documented and MUST NOT masquerade as a different ISO 4217 currency.
- Two Money values are currency-compatible only when their currency identifiers denote the same currency under the same identifier scheme.
- Operations that require currency compatibility MUST fail with `FINFLOW_MONEY_CURRENCY_MISMATCH` when currencies are incompatible. Conversion is a separate explicit operation outside this specification.
- Currency metadata MUST NOT be treated as an exchange rate.

## Invariants

A Money operation other than explicit conversion MUST NOT change currency.

## Examples

`EUR` and `EUR` are compatible. `EUR` and `USD` are not compatible.

## Invalid Examples

- Treating all dollar-named currencies as compatible.
- Relabeling `10 USD` as `10 EUR` without conversion.

## Errors

The applicable failure conditions are defined in [Money Errors](errors.md).

## Open Questions

- What identifier scheme or namespace rules are needed for unambiguous private and non-fiat currencies?

## Non-Goals

This document does not define exchange rates, redenomination, currency availability dates, or display symbols.

