# Money Errors

## Status

**FinKore Core 1.0 stable.**

## Purpose

This document defines portable failure categories for Money behavior.

## Requirements

- **MONEY-ERROR-001** — A missing, malformed, non-finite, or unsupported amount MUST fail with `FINKORE_MONEY_INVALID_AMOUNT` and MUST NOT return a Money result.
- **MONEY-ERROR-002** — A missing or invalid currency identifier MUST fail with `FINKORE_MONEY_INVALID_CURRENCY` and MUST NOT return a Money result.
- **MONEY-ERROR-003** — An operation requiring compatible currencies that receives incompatible currencies MUST fail with `FINKORE_MONEY_CURRENCY_MISMATCH` and MUST NOT return a Money result.
- **MONEY-ERROR-004** — Division by a zero scalar MUST fail with `FINKORE_MONEY_DIVISION_BY_ZERO` and MUST NOT return a Money result.
- **MONEY-ERROR-005** — Required precision reduction without an applicable explicit rounding policy MUST fail with `FINKORE_MONEY_ROUNDING_REQUIRED` and MUST NOT return a Money result.
- **MONEY-ERROR-006** — An invalid or unsupported rounding scale or mode MUST fail with `FINKORE_MONEY_INVALID_ROUNDING` and MUST NOT return a Money result.
- **MONEY-ERROR-007** — A failed Money operation MUST leave the observable value of every Money operand unchanged.
- **MONEY-ERROR-008** — An allocation request with a missing, malformed, unsupported, invalid, or out-of-range allocation method, part count, ratio list, ratio value, or target scale MUST fail with `FINKORE_MONEY_INVALID_ALLOCATION` and MUST NOT return an allocation result.

Implementations can provide additional structured details in accordance with [conventions](../conventions.md).

## Error Codes

| Code | Meaning |
| --- | --- |
| `FINKORE_MONEY_INVALID_AMOUNT` | The amount is missing, malformed, non-finite, or unsupported. |
| `FINKORE_MONEY_INVALID_CURRENCY` | The currency identifier is missing or invalid. |
| `FINKORE_MONEY_CURRENCY_MISMATCH` | An operation requires compatible currencies but received incompatible ones. |
| `FINKORE_MONEY_DIVISION_BY_ZERO` | A monetary division used a zero divisor. |
| `FINKORE_MONEY_ROUNDING_REQUIRED` | Precision loss would occur without an applicable explicit rounding policy. |
| `FINKORE_MONEY_INVALID_ROUNDING` | The requested rounding scale or mode is invalid or unsupported. |
| `FINKORE_MONEY_INVALID_ALLOCATION` | The requested allocation method, count, ratios, or target scale is invalid. |

## Invariants

A failed operation leaves the observable value of every Money operand unchanged, as required by **MONEY-ERROR-007**.

For division, **MONEY-ARITHMETIC-011** makes the zero-divisor category primary
before optional rounding-policy validation. For a non-zero divisor, explicit
null, incomplete policy structure, negative or non-integer scale, and an
unsupported mode are invalid rounding under **MONEY-ERROR-006**. These failures
return no Money result and leave the operand unchanged.

## Non-Goals

This is not a complete catalog and does not define exception, response, or localization formats.
