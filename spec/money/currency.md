# Currency

## Status

**Draft**

## Purpose

This document defines currency identity and compatibility for Money values that use ISO 4217 identifiers in FinFlow Core Draft 0.1.

## Requirements

- A currency identifier MUST be non-empty and unambiguous within its declared context.
- Currency identifiers SHOULD use ISO 4217 alphabetic codes when representing currencies covered by ISO 4217; those codes MUST be uppercase when used.
- Within this document's normative scope, two Money values are currency-compatible only when they use the same ISO 4217 currency identifier.
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

- Should a future FinFlow specification define a namespace for application-defined or non-ISO currency identifiers?

## Non-Goals

This document does not define exchange rates, redenomination, currency availability dates, or display symbols. Application-defined currencies, crypto assets, tokens, loyalty points, internal credits, and other non-ISO identifiers are outside the normative scope of FinFlow Core Draft 0.1; this exclusion does not prohibit a composing application from supporting them.

