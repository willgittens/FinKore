# Money Arithmetic

## Status

Draft.

## Purpose

This document defines exact arithmetic on Money values.

## Requirements

- Addition and subtraction MUST require compatible currencies.
- Addition and subtraction MUST preserve the operands' currency.
- Negation MUST preserve currency and MUST reverse the amount's sign exactly.
- Multiplication or division by a scalar MUST treat the scalar as an exact decimal value.
- Division by zero MUST fail predictably.
- An operation that requires precision reduction MUST NOT choose a rounding rule implicitly; it MUST use an explicitly supplied or domain-declared [rounding](rounding.md) rule.
- Arithmetic SHOULD leave all operands unchanged.

## Invariants

Exact operations MUST NOT lose significant decimal digits. Arithmetic MUST NOT create a Money value with an absent or changed currency except through an explicit conversion operation.

## Examples

```text
10.25 EUR + 2.75 EUR = 13.00 EUR
10.00 EUR × 1.5 = 15.000 EUR
```

## Invalid Examples

- `10 EUR + 10 USD` without explicit conversion.
- `10 EUR ÷ 0`.
- Silently rounding `1 EUR ÷ 3` to two decimal places.

## Errors

Currency mismatch and invalid arithmetic MUST use codes defined in [Money Errors](errors.md).

## Non-Goals

This document does not define allocation, taxation, interest, exchange conversion, or aggregation policies.

