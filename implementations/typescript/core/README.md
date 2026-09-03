# FinFlow TypeScript

First TypeScript reference implementation milestone for FinFlow Money representation.

This package implements only construction, validation, portable Money errors, and canonical serialization. It intentionally does not implement arithmetic, comparison, rounding, persistence, framework integrations, or agent adapters.

The specification remains canonical. This package stores validated decimal amounts as strings for now because the current milestone needs exact base-10 representation and serialization preservation, not arithmetic.

## API Documentation

Public TypeScript APIs are documented with JSDoc. Where an API implements normative FinFlow behavior, its JSDoc references the relevant stable requirement IDs from `/spec`.

The JSDoc is implementation guidance for TypeScript users; `/spec` remains the normative source of FinFlow behavior. Future generated API documentation may be produced from these comments.
