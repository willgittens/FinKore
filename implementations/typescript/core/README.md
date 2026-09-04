# FinFlow TypeScript

TypeScript reference implementation for the current FinFlow Money milestone.

FinFlow Money Draft 0.1 is fully implemented by this TypeScript reference implementation. This statement applies only to the current Money specification draft; it does not imply that other FinFlow domains are complete.

This package implements Money construction, validation, portable Money errors, canonical serialization, exact compatible-currency addition, exact compatible-currency subtraction, exact negation, exact decimal scalar multiplication, exact decimal scalar division when the quotient terminates, exact compatible-currency numeric comparison, and explicit Money rounding.

It intentionally does not implement FX conversion, persistence, framework integrations, or agent adapters.

The specification remains canonical. This package stores validated decimal amounts as strings and performs arithmetic and comparison with scaled integer arithmetic so observable behavior preserves exact base-10 semantics without using JavaScript `number`.

## Current Money API

- `Money.from(input)` validates amount and currency and returns a Money value.
- `Money.deserialize(value)` parses portable Money JSON.
- `money.toJSON()` returns canonical portable Money serialization.
- `money.add(other)` returns an exact same-currency sum and throws `FINFLOW_MONEY_CURRENCY_MISMATCH` for incompatible currencies.
- `money.subtract(other)` returns an exact same-currency difference and throws `FINFLOW_MONEY_CURRENCY_MISMATCH` for incompatible currencies.
- `money.negate()` returns a new Money value with the amount sign reversed exactly.
- `money.multiply(scalar)` returns a new Money value multiplied by an exact decimal scalar.
- `money.divide(scalar)` returns a new Money value divided by a non-zero exact decimal scalar when the quotient terminates; zero divisors throw `FINFLOW_MONEY_DIVISION_BY_ZERO`, and non-terminating quotients without a rounding policy throw `FINFLOW_MONEY_ROUNDING_REQUIRED`.
- `money.compare(other)` returns `LESS`, `EQUAL`, or `GREATER` for exact same-currency numeric comparison and throws `FINFLOW_MONEY_CURRENCY_MISMATCH` for incompatible currencies.
- `money.round({ scale, mode })` returns a new Money value rounded to the explicit target scale using `HALF_UP`, `HALF_EVEN`, `DOWN`, `UP`, `FLOOR`, or `CEILING`; invalid scale or mode values throw `FINFLOW_MONEY_INVALID_ROUNDING`.

## API Documentation

Public TypeScript APIs are documented with JSDoc. Where an API implements normative FinFlow behavior, its JSDoc references the relevant stable requirement IDs from `/spec`.

The JSDoc is implementation guidance for TypeScript users; `/spec` remains the normative source of FinFlow behavior. Future generated API documentation may be produced from these comments.
