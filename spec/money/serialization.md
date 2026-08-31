# Money Serialization

## Status

**Draft**

## Purpose

This document defines the normative portable JSON representation of Money. It specifies interchange only and does not constrain internal amount representation; see [Money Representation](representation.md).

## Requirements

- Serialized Money MUST include `amount` and `currency`.
- `amount` MUST be a JSON string containing a base-10 decimal in plain notation: an optional minus sign, one or more integer digits, and an optional decimal point followed by one or more fractional digits.
- `amount` MUST NOT contain exponential notation, a leading plus sign, or non-finite tokens.
- `currency` MUST be a JSON string satisfying [Currency](currency.md).
- A parser MUST reject non-finite, malformed, or ambiguous amounts.
- Unknown members MAY be accepted by an implementation, but MUST NOT alter the meaning of `amount` or `currency`.

## Invariants

Serialization followed by deserialization MUST preserve numeric amount and currency.

## Normative Example

This example uses the normative member names and value encodings. It does not imply that presentation scale is significant.

```json
{
  "amount": "1299.90",
  "currency": "EUR"
}
```

## Invalid Examples

```json
{ "amount": 1299.90, "currency": "EUR" }
```

The numeric JSON form is not portable because its host may apply binary floating-point semantics.

## Errors

Malformed data MUST report `FINFLOW_MONEY_INVALID_AMOUNT` or `FINFLOW_MONEY_INVALID_CURRENCY` as applicable.

## Open Questions

- Must portable serialization preserve presentation scale as well as numeric value?

