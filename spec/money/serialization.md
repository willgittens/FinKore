# Money Serialization

## Status

**FinKore Core 0.9 release candidate.**

## Purpose

This document defines the normative portable JSON representation of Money. It specifies interchange only and does not constrain internal amount representation; see [Money Representation](representation.md).

## Requirements

- **MONEY-SERIALIZATION-001** — Serialized Money MUST include `amount` and `currency`.
- **MONEY-SERIALIZATION-002** — `amount` MUST be a JSON string containing a base-10 decimal in plain notation: an optional minus sign, one or more integer digits, and an optional decimal point followed by one or more fractional digits.
- **MONEY-SERIALIZATION-003** — `amount` MUST NOT contain exponential notation, a leading plus sign, or non-finite tokens.
- **MONEY-SERIALIZATION-004** — `currency` MUST be a JSON string satisfying [Currency](currency.md).
- **MONEY-SERIALIZATION-005** — A parser MUST reject non-finite, malformed, or ambiguous amounts.
- **MONEY-SERIALIZATION-006** — Unknown members MAY be accepted by an implementation.
- **MONEY-SERIALIZATION-007** — Unknown members MUST NOT alter the meaning of `amount` or `currency`.
- **MONEY-SERIALIZATION-008** — Serialization followed by deserialization MUST preserve numeric amount and currency.

## Invariants

Serialization followed by deserialization preserves numeric amount and currency as required by **MONEY-SERIALIZATION-008**.

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

Malformed data fails as defined by **MONEY-ERROR-001** or **MONEY-ERROR-002** in [Money Errors](errors.md), as applicable.

## Open Questions

- Must portable serialization preserve presentation scale as well as numeric value?

