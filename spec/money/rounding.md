# Money Rounding

## Status

**Draft**

## Purpose

This document governs deliberate precision reduction of monetary amounts.

## Terminology

**Rounding mode** determines how a discarded remainder affects the retained digits. **Target scale** identifies the retained number of fractional decimal digits.

## Requirements

- Rounding MUST specify a target scale and a rounding mode.
- Rounding MUST be deterministic for the same amount, target scale, and mode.
- An implementation MUST NOT silently substitute a currency's customary scale for an explicit target scale.
- A domain specification MAY declare a rounding policy; that declaration MUST identify both scale derivation and mode.
- If no applicable policy exists when precision reduction is required, the operation MUST fail with `FINFLOW_MONEY_ROUNDING_REQUIRED`.
Rounding at explicit domain boundaries avoids unintended cumulative precision loss.

## Invariants

Rounding MUST preserve currency. If no digits are discarded, rounding MUST preserve numeric value.

## Examples

```text
round(1.235 EUR, scale 2, HALF_UP) = 1.24 EUR
```

The example is non-normative. Mode names are descriptive; no portable rounding-mode catalog is defined in this draft.

## Invalid Examples

Returning `1.23 EUR` or `1.24 EUR` from `1.235 EUR` without identifying the rule is invalid.

## Errors

Missing or unsupported rounding policy MUST report `FINFLOW_MONEY_ROUNDING_REQUIRED` or `FINFLOW_MONEY_INVALID_ROUNDING` as applicable.

## Open Questions

- Which rounding modes must every conforming implementation support?
- Should currency metadata provide a recommended scale without making it mandatory?

