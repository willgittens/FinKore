# Money

## Status

**FinKore Core 2.0.2 stable.**

## Purpose

This domain defines exact monetary values and their fundamental behavior. A Money value combines an [amount and currency](representation.md); neither is meaningful as Money without the other.

## Requirements

The documents below define the canonical Money requirements. Start with
representation and currency, then read the operations you need. Calculation
scale and a currency's customary minor-unit scale are separate concepts;
[rounding](rounding.md) explains when precision reduction is permitted.

## Documents

| Document | What you will learn |
| --- | --- |
| [Representation](representation.md) | What an exact monetary amount and its scale mean |
| [Currency](currency.md) | Which currencies are valid and compatible |
| [Arithmetic](arithmetic.md) | Addition, subtraction, multiplication, division, and exact results |
| [Comparison](comparison.md) | Equality and ordering within a currency |
| [Rounding](rounding.md) | Explicit target scales and portable rounding modes |
| [Rates](rates.md) | Applying exact scalar and percentage rates |
| [Allocation](allocation.md) | Splitting an amount while preserving its total |
| [Serialization](serialization.md) | Preserving Money in portable data |
| [Errors](errors.md) | Portable failure codes and their conditions |

## Invariants

A Money value has exactly one valid amount and one valid currency. Its amount is denominated only in that currency. The canonical rules are **MONEY-REPRESENTATION-001** through **MONEY-REPRESENTATION-003**.

## Non-Goals

This domain does not define exchange-rate providers, market prices, accounting entries, formatting for display, or jurisdiction-specific tax/allocation rules.
