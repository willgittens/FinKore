# Money Arithmetic

## Status

**FinKore Core 0.9 release candidate.**

## Purpose

This document defines exact arithmetic on Money values.

## Requirements

- **MONEY-ARITHMETIC-001** — Addition and subtraction MUST require compatible currencies.
- **MONEY-ARITHMETIC-002** — Addition and subtraction MUST preserve the operands' currency.
- **MONEY-ARITHMETIC-003** — Negation MUST preserve currency and MUST reverse the amount's sign exactly.
- **MONEY-ARITHMETIC-004** — Multiplication by an exact decimal scalar MUST multiply the amount by that scalar and preserve currency.
- **MONEY-ARITHMETIC-005** — Division by a non-zero exact decimal scalar MUST divide the amount by that scalar and preserve currency.
- **MONEY-ARITHMETIC-006** — Division by zero MUST fail with `FINKORE_MONEY_DIVISION_BY_ZERO`.
- **MONEY-ARITHMETIC-007** — When an arithmetic result can be represented exactly, the operation MUST preserve that exact decimal result and MUST NOT round it.
- **MONEY-ARITHMETIC-008** — An operation that requires precision reduction MUST NOT choose a rounding rule implicitly; it MUST use an explicitly supplied or domain-declared [rounding](rounding.md) rule.
- **MONEY-ARITHMETIC-009** — Arithmetic MUST NOT alter the observable value of any operand.

## Invariants

An operation described as exact must not lose significant decimal digits. Currency minor units must not be treated as an implicit calculation scale. Arithmetic must not create a Money value with an absent or changed currency except through an explicit conversion operation.

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

