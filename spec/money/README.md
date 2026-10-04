# Money

## Status

**FinKore Core 2.0.2 stable.**

## Purpose

This domain defines exact monetary values and their fundamental behavior. A Money value combines an [amount and currency](representation.md); neither is meaningful as Money without the other.

## Requirements

The canonical Money requirements are defined by [Representation](representation.md), [Arithmetic](arithmetic.md), [Comparison](comparison.md), [Rounding](rounding.md), [Rates](rates.md), [Allocation](allocation.md), [Currency](currency.md), [Serialization](serialization.md), and [Errors](errors.md).

## Documents

- [Representation](representation.md)
- [Arithmetic](arithmetic.md)
- [Comparison](comparison.md)
- [Rounding](rounding.md)
- [Rates](rates.md)
- [Allocation](allocation.md)
- [Currency](currency.md)
- [Serialization](serialization.md)
- [Errors](errors.md)

## Invariants

A Money value has exactly one valid amount and one valid currency. Its amount is denominated only in that currency. The canonical rules are **MONEY-REPRESENTATION-001** through **MONEY-REPRESENTATION-003**.

## Non-Goals

This domain does not define exchange-rate providers, market prices, accounting entries, formatting for display, or jurisdiction-specific tax/allocation rules.
