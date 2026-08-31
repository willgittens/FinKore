# Money Serialization

## Status

Draft.

## Purpose

This document defines a portable JSON representation for interchange examples and future conformance work.

## Requirements

- Serialized Money MUST include `amount` and `currency`.
- `amount` SHOULD be a decimal string and MUST preserve its exact numeric value.
- `currency` MUST be a string satisfying [Currency](currency.md).
- A serializer MUST NOT emit exponential notation unless the consuming specification explicitly permits it.
- A parser MUST reject non-finite, malformed, or ambiguous amounts.
- Unknown members MAY be accepted by an implementation, but MUST NOT alter the meaning of `amount` or `currency`.

## Invariants

Serialization followed by deserialization MUST preserve numeric amount and currency.

## Examples

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

