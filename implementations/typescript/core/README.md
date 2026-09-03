# FinFlow TypeScript

TypeScript reference implementation for the current FinFlow Money milestone.

This package implements Money construction, validation, portable Money errors, canonical serialization, exact compatible-currency addition, exact compatible-currency subtraction, and exact compatible-currency numeric comparison.

It intentionally does not implement Money rounding, multiplication, division, FX conversion, persistence, framework integrations, or agent adapters.

The specification remains canonical. This package stores validated decimal amounts as strings and performs arithmetic and comparison with scaled integer arithmetic so observable behavior preserves exact base-10 semantics without using JavaScript `number`.

## Current Money API

- `Money.from(input)` validates amount and currency and returns a Money value.
- `Money.deserialize(value)` parses portable Money JSON.
- `money.toJSON()` returns canonical portable Money serialization.
- `money.add(other)` returns an exact same-currency sum and throws `FINFLOW_MONEY_CURRENCY_MISMATCH` for incompatible currencies.
- `money.subtract(other)` returns an exact same-currency difference and throws `FINFLOW_MONEY_CURRENCY_MISMATCH` for incompatible currencies.
- `money.compare(other)` returns `LESS`, `EQUAL`, or `GREATER` for exact same-currency numeric comparison and throws `FINFLOW_MONEY_CURRENCY_MISMATCH` for incompatible currencies.

## API Documentation

Public TypeScript APIs are documented with JSDoc. Where an API implements normative FinFlow behavior, its JSDoc references the relevant stable requirement IDs from `/spec`.

The JSDoc is implementation guidance for TypeScript users; `/spec` remains the normative source of FinFlow behavior. Future generated API documentation may be produced from these comments.
