# Money Rates

## Status

**FinKore Core 0.9 release candidate.**

## Purpose

This document defines portable application of an exact decimal Rate to a Money
value. It provides a neutral primitive for rate-like calculations without
introducing tax, interest, fee, discount, exchange-rate, or jurisdiction policy.

## Terminology

A **Rate** is an exact decimal scalar applied to Money. A Rate representation
MUST identify whether its decimal value is already the scalar or is a percentage
value that must first be divided by 100 exactly.

A **decimal Rate** uses its value directly as the scalar. A **percentage Rate**
uses its value divided by 100 as the scalar. For example, `12.5` as a percentage
Rate is the scalar `0.125`.

## Requirements

- **MONEY-RATE-001** - A portable Rate input MUST identify its representation as either `DECIMAL` or `PERCENTAGE` and MUST carry its value as a plain exact decimal string.
- **MONEY-RATE-002** - A `DECIMAL` Rate MUST apply its value directly as the exact decimal scalar, and a `PERCENTAGE` Rate MUST divide its value by 100 exactly before application.
- **MONEY-RATE-003** - Applying a Rate to Money MUST multiply the Money amount by the Rate's exact decimal scalar and MUST preserve the Money currency.
- **MONEY-RATE-004** - Zero and negative Rates MUST be accepted and MUST follow ordinary exact scalar multiplication sign semantics.
- **MONEY-RATE-005** - When Rate application can return an exact decimal result, it MUST preserve that exact result and MUST NOT apply implicit currency minor-unit rounding.
- **MONEY-RATE-006** - If Rate application is requested at a reduced precision, it MUST apply an explicit Money rounding policy after computing the exact product.
- **MONEY-RATE-007** - A missing, malformed, non-finite, or unsupported Rate value or representation MUST fail with `FINKORE_MONEY_INVALID_AMOUNT` and MUST NOT return a Money result.
- **MONEY-RATE-008** - An invalid or unsupported explicit rounding policy supplied for Rate application MUST fail with `FINKORE_MONEY_INVALID_ROUNDING` and MUST NOT return a Money result.
- **MONEY-RATE-009** - Rate application MUST NOT alter the observable value of the source Money operand, whether the operation succeeds or fails.

## Invariants

Rate application preserves the source Money currency. It never performs exchange
conversion, rate lookup, tax classification, interest accrual, fee policy, or
minor-unit rounding by implication. Any precision reduction happens only through
an explicit rounding policy governed by [Money Rounding](rounding.md).

## Examples

```text
apply decimal Rate 0.125 to 100.00 EUR = 12.50000 EUR
apply percentage Rate 12.5 to 100.00 EUR = 12.50000 EUR
apply decimal Rate -0.10 to 100.00 EUR = -10.0000 EUR
apply decimal Rate 0.10005 to 100.00 EUR, scale 2, HALF_UP = 10.01 EUR
```

## Invalid Examples

- Treating percentage Rate `12.5` as scalar `12.5` instead of `0.125`.
- Returning a two-decimal result because EUR customarily has two minor-unit digits.
- Applying rounding without an explicit target scale and mode.
- Accepting JSON number `0.125` as a portable Rate value.

## Errors

Rate value and representation failures use `FINKORE_MONEY_INVALID_AMOUNT` under
**MONEY-ERROR-001**. Invalid explicit rounding policies use
`FINKORE_MONEY_INVALID_ROUNDING` under **MONEY-ERROR-006**. Failed Rate
application leaves the source Money operand unchanged under **MONEY-ERROR-007**.

## Non-Goals

This document does not define tax jurisdiction rules, discount policy, fee
policy, interest conventions, FX conversion, market data, currency data services,
rate lookup, percentage display formatting, or allocation.
