# Money

## Status

Draft.

## Purpose

This domain defines exact monetary values and their fundamental behavior. A Money value combines an [amount and currency](representation.md); neither is meaningful as Money without the other.

## Requirements

- Money MUST contain an amount and a currency.
- Money operations SHOULD produce new values without changing their operands.
- Monetary behavior MUST use exact base-10 semantics and MUST NOT rely on unsafe binary floating-point semantics.
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

A Money value always has exactly one valid amount and one valid currency. Its amount is denominated only in that currency.

## Non-Goals

This domain does not define exchange-rate providers, market prices, accounting entries, formatting for display, or jurisdiction-specific rules.

