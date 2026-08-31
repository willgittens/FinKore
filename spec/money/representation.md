# Money Representation

## Status

Draft.

## Purpose

This document defines the information carried by a Money value.

## Terminology

**Amount** is an exact signed base-10 decimal quantity. **Scale** is the number of digits after its decimal point.

## Requirements

- Money MUST contain one amount and one [currency](currency.md).
- The amount MUST be finite and exactly representable in base 10.
- An amount MUST NOT be interpreted without its currency.
- Sign MUST carry ordinary numeric meaning; domain-specific restrictions on negative or zero amounts belong to the consuming specification.
- An implementation MAY preserve input scale, but numerical equality MUST NOT depend solely on differing insignificant trailing zeros.

## Invariants

The amount and currency form one value and MUST remain associated through every operation.

## Examples

```json
{
  "amount": "1299.90",
  "currency": "EUR"
}
```

`"10.0"` and `"10.00"` represent the same numeric amount, although their presentation scale differs.

## Invalid Examples

- An amount without a currency.
- `NaN`, positive infinity, or negative infinity.
- A value whose amount has already been rounded without a declared rule where precision was lost.

## Errors

Invalid components MUST fail with an applicable code from [Money Errors](errors.md).

## Open Questions

- Should a later revision define limits on precision or scale for portable conformance?

