# Money Rounding

## Status

**FinKore Core 1.1 stable.**

## Purpose

This document governs deliberate precision reduction of monetary amounts.

## Terminology

**Rounding mode** determines how a discarded remainder affects the retained digits. **Target scale** is a non-negative integer identifying the number of fractional decimal digits in the rounded result. Calculation scale is the scale selected for an operation; it is not necessarily a currency's customary minor-unit scale.

## Requirements

- **MONEY-ROUNDING-001** — Rounding MUST specify a target scale and a rounding mode.
- **MONEY-ROUNDING-002** — Rounding MUST be deterministic for the same amount, target scale, and mode.
- **MONEY-ROUNDING-003** — Every conforming implementation MUST support `HALF_UP`, `HALF_EVEN`, `DOWN`, `UP`, `FLOOR`, and `CEILING` with the semantics defined below.
- **MONEY-ROUNDING-004** — An implementation MUST NOT silently substitute a currency's customary scale for an explicit target scale.
- **MONEY-ROUNDING-005** — A domain specification MAY declare a rounding policy.
- **MONEY-ROUNDING-006** — If no applicable policy exists when precision reduction is required, the operation MUST fail with `FINKORE_MONEY_ROUNDING_REQUIRED`.
- **MONEY-ROUNDING-007** — A declared rounding policy MUST identify both scale derivation and mode.
- **MONEY-ROUNDING-008** — Rounding MUST preserve currency.
- **MONEY-ROUNDING-009** — If no digits are discarded, rounding MUST preserve numeric value.

Rounding at explicit domain boundaries avoids unintended cumulative precision loss.

When a valid explicit policy is supplied to `finkore.money.divide`, the policy
is applied only to a quotient without an exact finite decimal representation
under **MONEY-ARITHMETIC-010** and **MONEY-ARITHMETIC-011**. Exact finite
quotients remain exact; deliberate rounding of such a value uses the separate
rounding operation.

## Portable Rounding Modes

For these definitions, the two **nearest candidates** are the adjacent values representable at the target scale. A **tie** occurs when the exact value is equally distant from them.

| Mode | Required result |
| --- | --- |
| `HALF_UP` | The nearest candidate; on a tie, the candidate farther from zero. |
| `HALF_EVEN` | The nearest candidate; on a tie, the candidate whose last retained decimal digit is even. |
| `DOWN` | The candidate toward zero. |
| `UP` | The candidate away from zero. |
| `FLOOR` | The candidate toward negative infinity. |
| `CEILING` | The candidate toward positive infinity. |

These meanings apply to positive and negative values. A mode affects the result only when non-zero digits are discarded.

## Invariants

Rounding preserves currency and preserves numeric value when no digits are discarded, as required by **MONEY-ROUNDING-008** and **MONEY-ROUNDING-009**.

## Examples

The examples are non-normative illustrations of the normative mode definitions.

```text
round(10.005 EUR, scale 2, HALF_UP)    = 10.01 EUR
round(10.005 EUR, scale 2, HALF_EVEN)  = 10.00 EUR
round(10.015 EUR, scale 2, HALF_EVEN)  = 10.02 EUR

round( 1.239 EUR, scale 2, DOWN)       =  1.23 EUR
round(-1.239 EUR, scale 2, DOWN)       = -1.23 EUR
round( 1.231 EUR, scale 2, UP)         =  1.24 EUR
round(-1.231 EUR, scale 2, UP)         = -1.24 EUR
round( 1.239 EUR, scale 2, FLOOR)      =  1.23 EUR
round(-1.231 EUR, scale 2, FLOOR)      = -1.24 EUR
round( 1.231 EUR, scale 2, CEILING)    =  1.24 EUR
round(-1.239 EUR, scale 2, CEILING)    = -1.23 EUR
```

## Invalid Examples

Returning `1.23 EUR` or `1.24 EUR` from `1.235 EUR` without identifying the rule is invalid.

## Errors

Missing and invalid rounding-policy failures are defined by **MONEY-ERROR-005** and **MONEY-ERROR-006** in [Money Errors](errors.md).

## Open Questions

- Should currency metadata provide a recommended scale without making it mandatory?
