# Money Errors

## Status

Draft.

## Purpose

This document defines initial portable failure categories for Money behavior.

## Requirements

Money failures MUST be predictable and MUST NOT return a plausible monetary result when a required invariant cannot be satisfied. Implementations MAY provide additional structured details in accordance with [conventions](../conventions.md).

## Error Codes

| Code | Meaning |
| --- | --- |
| `FINFLOW_MONEY_INVALID_AMOUNT` | The amount is missing, malformed, non-finite, or unsupported. |
| `FINFLOW_MONEY_INVALID_CURRENCY` | The currency identifier is missing or invalid. |
| `FINFLOW_MONEY_CURRENCY_MISMATCH` | An operation requires compatible currencies but received incompatible ones. |
| `FINFLOW_MONEY_DIVISION_BY_ZERO` | A monetary division used a zero divisor. |
| `FINFLOW_MONEY_ROUNDING_REQUIRED` | Precision loss would occur without an applicable explicit rounding policy. |
| `FINFLOW_MONEY_INVALID_ROUNDING` | The requested rounding scale or mode is invalid or unsupported. |

## Invariants

Failure MUST leave all Money operands unchanged.

## Open Questions

- Should overflow be portable if implementations may support arbitrary precision?

## Non-Goals

This is not a complete catalog and does not define exception, response, or localization formats.

