# Money Arithmetic

## Status

**FinKore Core 2.0.2 stable.**

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
- **MONEY-ARITHMETIC-010** — `finkore.money.divide` MUST accept an optional explicit rounding policy containing a non-negative integer target scale and a supported rounding mode. For a non-zero divisor whose exact quotient has no finite decimal representation, a valid supplied policy MUST produce the rounded quotient at that scale and mode while preserving currency. Omission MUST retain **MONEY-ARITHMETIC-008** and **MONEY-ROUNDING-006**; explicit null, an incomplete or malformed policy, a negative or non-integer scale, or an unsupported mode MUST fail with `FINKORE_MONEY_INVALID_ROUNDING`.
- **MONEY-ARITHMETIC-011** — Division MUST check a zero scalar before validating an optional rounding policy and MUST retain `FINKORE_MONEY_DIVISION_BY_ZERO` for that request. For a non-zero scalar, a supplied policy MUST be validated even when the quotient is exactly representable. A valid policy MUST be applied only when the quotient has no exact finite decimal representation; an exact quotient MUST remain exact under **MONEY-ARITHMETIC-007**, even when its scale is finer than the policy's target scale.

## Invariants

An operation described as exact must not lose significant decimal digits. Currency minor units must not be treated as an implicit calculation scale. Arithmetic must not create a Money value with an absent or changed currency except through an explicit conversion operation.

## Explicit policy for division

The canonical division operation exposes one optional request policy. A
composing domain may instead bind a domain-declared policy under
**MONEY-ROUNDING-005** and **MONEY-ROUNDING-007**, but this generic boundary does
not accept simultaneous caller and domain policy sources or define precedence
between them. A composing specification exposing both sources must define its
selection rule before invoking these Money semantics; no ambient policy lookup
or currency-minor-unit default is implied.

Rounded nonterminating results have exactly the supplied target scale. Exact
finite quotients retain their exact value and canonical unscaled observation;
supplying a coarser policy is not an implicit call to `finkore.money.round`.

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
