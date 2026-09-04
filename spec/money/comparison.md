# Money Comparison

## Status

**Draft**

## Purpose

This document defines equality and ordering of Money values.

## Requirements

- **MONEY-COMPARISON-001** — Numeric equality MUST compare exact decimal amounts and compatible currencies.
- **MONEY-COMPARISON-002** — Insignificant trailing zeros MUST NOT make numerically equal Money values unequal.
- **MONEY-COMPARISON-003** — Ordering MUST be defined only for compatible currencies.
- **MONEY-COMPARISON-004** — Equality or ordering across incompatible currencies MUST fail with `FINKORE_MONEY_CURRENCY_MISMATCH` unless an explicit conversion has occurred.
- **MONEY-COMPARISON-005** — Implementations MAY offer representation equality separately, provided it is clearly distinguished from numeric equality.
- **MONEY-COMPARISON-006** — Numeric comparison of compatible Money values MUST be reflexive.

## Invariants

For compatible currencies, comparison must be reflexive and consistent with exact decimal arithmetic. Currency compatibility must be evaluated consistently with [Currency](currency.md).

## Examples

```text
10.0 EUR equals 10.00 EUR
9.99 EUR is less than 10.00 EUR
```

## Invalid Examples

Ordering `10 EUR` and `10 USD` as equal because their amounts have the same digits violates this specification.

## Errors

The incompatible-comparison condition is defined in [Money Errors](errors.md).

