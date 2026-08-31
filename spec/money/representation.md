# Money Representation

## Status

**Draft**

## Purpose

This document defines the information carried by a Money value.

## Terminology

**Amount** is a conceptual, exact signed base-10 decimal quantity. **Scale** is the number of digits after its decimal point in a particular representation. A currency's **minor-unit scale** describes that currency, while **calculation scale** is selected for an operation; neither necessarily determines the other.

## Requirements

- Money MUST contain one amount and one [currency](currency.md).
- The amount MUST be finite and exactly representable in base 10.
- An amount MUST NOT be interpreted without its currency.
- Sign MUST carry ordinary numeric meaning; domain-specific restrictions on negative or zero amounts belong to the consuming specification.
- Numerical equality MUST NOT depend on differing insignificant trailing zeros.
- An implementation MAY use any internal representation that preserves these observable semantics; this document does not require storage as a decimal string or at a currency's customary minor-unit scale.
- The portable decimal-string encoding is defined separately by [Money Serialization](serialization.md).

## Invariants

The amount and currency form one value and MUST remain associated through every operation.

## Example

The following JSON is illustrative and non-normative; the normative interchange form is defined by [Money Serialization](serialization.md).

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

- What portable precision, scale, and overflow limits, if any, should a later revision require of implementations?

