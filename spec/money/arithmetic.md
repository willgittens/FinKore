# Money Arithmetic

## Status

**Draft**

## Purpose

This document defines exact arithmetic on Money values.

## Requirements

- Addition and subtraction MUST require compatible currencies.
- Addition and subtraction MUST preserve the operands' currency.
- Negation MUST preserve currency and MUST reverse the amount's sign exactly.
- Multiplication by an exact decimal scalar MUST multiply the amount by that scalar and preserve currency.
- Division by a non-zero exact decimal scalar MUST divide the amount by that scalar and preserve currency.
- Division by zero MUST fail with `FINFLOW_MONEY_DIVISION_BY_ZERO`.
- When an arithmetic result can be represented exactly, the operation MUST preserve that exact decimal result and MUST NOT round it.
- An operation that requires precision reduction MUST NOT choose a rounding rule implicitly; it MUST use an explicitly supplied or domain-declared [rounding](rounding.md) rule.
- Arithmetic MUST NOT alter the observable value of any operand.

## Invariants

An operation described as exact MUST NOT lose significant decimal digits. Currency minor units MUST NOT be treated as an implicit calculation scale. Arithmetic MUST NOT create a Money value with an absent or changed currency except through an explicit conversion operation.

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

The applicable failure conditions and codes are defined in [Money Errors](errors.md).

## Non-Goals

This document does not define Money-by-Money multiplication or division, allocation, taxation, interest, exchange conversion, or aggregation policies.

