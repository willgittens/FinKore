# Money

## Status

**Draft**

## Purpose

This domain defines exact monetary values and their fundamental behavior. A Money value combines an [amount and currency](representation.md); neither is meaningful as Money without the other.

## Requirements

- Money MUST contain an amount and a currency.
- Operations on Money values MUST NOT alter the observable amount or currency of their operands.
- A Money operation's observable result MUST equal the result of exact base-10 arithmetic, except when an explicit rounding rule applies.
- Cross-currency behavior MUST follow [currency compatibility](currency.md).
- Any loss of precision MUST follow an explicit [rounding](rounding.md) rule.

## Documents

- [Representation](representation.md)
- [Arithmetic](arithmetic.md)
- [Comparison](comparison.md)
- [Rounding](rounding.md)
- [Currency](currency.md)
- [Serialization](serialization.md)
- [Errors](errors.md)

## Invariants

A Money value MUST have exactly one valid amount and one valid currency. Its amount MUST be denominated only in that currency.

## Non-Goals

This domain does not define exchange-rate providers, market prices, accounting entries, formatting for display, or jurisdiction-specific rules.

