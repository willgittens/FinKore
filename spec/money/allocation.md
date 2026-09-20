# Money Allocation

## Status

**Included in FinKore Core 0.9 release candidate; introduced in Draft 0.2.**

## Purpose

This document defines portable Money allocation by equal parts and by declared
positive integer ratios. Allocation is a neutral splitting primitive: it
preserves the exact source total and currency while making remainder placement
deterministic.

## Terminology

An **Allocation** splits one source Money value into an ordered list of Money
values.

The **target scale** is the non-negative decimal scale requested for every
allocated result. It is a calculation scale rather than the source currency's
customary minor-unit scale.

An **allocation unit** is one decimal unit at the target scale. At target scale
2, one allocation unit is `0.01`; at target scale 0, one allocation unit is
`1`.

The **declared order** is the caller-supplied order of equal allocation
positions or ratio entries. Array order is significant for portable allocation
requests.

## Portable Request Shape

A portable allocation request has three required elements:

- a valid source Money value;
- an allocation method of either equal part count or declared positive integer
  ratios;
- an explicit target scale.

No allocation request member defined by this document is nullable. Omission of
the source Money value, allocation method, target scale, equal part count for
equal allocation, or ratios for ratio allocation is invalid. A successful
allocation result is an ordered list of Money values; result order carries the
declared-order meaning used for remainder placement.

The concrete conformance fixture shape is defined by conformance vectors. This
specification defines the required semantics, not a production API signature.

Allocation integer members use JSON numbers. Their mathematical value, rather
than whether the JSON text contains a decimal point, determines whether they
are integers. For example, `2` and `2.0` represent the same integer value;
`2.5` is fractional. Decimal strings are not allocation integer values.

## Requirements

- **MONEY-ALLOCATION-001** - An allocation request MUST provide a valid source Money value, exactly one supported allocation method, and an explicit target scale. Required allocation request members MUST NOT be omitted or null.
- **MONEY-ALLOCATION-002** - The target scale MUST be a non-negative integer and MUST NOT be inferred from currency metadata, locale, source amount scale, or implementation defaults.
- **MONEY-ALLOCATION-003** - Equal-part allocation MUST declare a positive integer part count and MUST return exactly that many Money values in declared order.
- **MONEY-ALLOCATION-004** - Ratio allocation MUST declare a non-empty ordered list of positive integer ratios and MUST return exactly one Money value for each ratio in declared order.
- **MONEY-ALLOCATION-005** - Zero and negative source Money amounts MUST be valid allocation sources and MUST follow ordinary signed numeric semantics.
- **MONEY-ALLOCATION-006** - Before distributing units, the source amount MUST be exactly representable as an integer number of allocation units at the target scale; otherwise allocation MUST fail with `FINKORE_MONEY_ROUNDING_REQUIRED` and MUST NOT round the source total.
- **MONEY-ALLOCATION-007** - Every allocated Money value MUST preserve the source Money currency.
- **MONEY-ALLOCATION-008** - The exact numeric sum of all allocated Money values MUST equal the exact source Money amount; allocation MUST NOT drop, duplicate, create, or destroy allocation units.
- **MONEY-ALLOCATION-009** - Allocation MUST distribute the absolute number of source allocation units across declared weights using exact integer arithmetic. Equal-part allocation uses weight `1` for each part; ratio allocation uses each declared positive integer ratio as its weight. Each base allocation is the floor of `absolute source units * position weight / total weight`, and the distributable remainder is the absolute source unit count minus the sum of those base allocations.
- **MONEY-ALLOCATION-010** - When the absolute unit count is not evenly divisible by the total declared weight, remainder allocation units MUST be assigned one unit at a time to the earliest declared result positions until no remainder remains.
- **MONEY-ALLOCATION-011** - For a negative source amount, remainder assignment MUST use the same declared order and increase the magnitude of the affected negative allocated results.
- **MONEY-ALLOCATION-012** - Allocation MUST be deterministic for the same source Money, allocation method, declared order, and target scale.
- **MONEY-ALLOCATION-013** - Allocation MUST NOT alter the observable value of the source Money operand, whether allocation succeeds or fails.
- **MONEY-ALLOCATION-014** - Every allocation target scale, equal-part count, and ratio MUST be a finite JSON number whose mathematical value is an integer. A target scale MUST be from `0` through `50` inclusive, an equal-part count MUST be from `1` through `100` inclusive, and each ratio MUST be from `1` through `9007199254740991` inclusive. JSON strings, booleans, nulls, non-integer numbers, non-finite implementation values, and integers outside the applicable range MUST be rejected with `FINKORE_MONEY_INVALID_ALLOCATION`.

## Invariants

Allocation preserves source currency, preserves the exact source total, and
uses declared order as the only remainder-placement tie-breaker. Target scale is
explicit calculation context; it is not currency metadata.

## Examples

The examples are non-normative illustrations of the normative allocation rules.

```text
allocate 10.00 USD equally into 3 parts at scale 2
= [3.34 USD, 3.33 USD, 3.33 USD]

allocate 10.00 USD by ratios [1, 2, 3] at scale 2
= [1.67 USD, 3.33 USD, 5.00 USD]

allocate -10.00 USD equally into 3 parts at scale 2
= [-3.34 USD, -3.33 USD, -3.33 USD]

allocate 0.00 USD by ratios [1, 2] at scale 2
= [0.00 USD, 0.00 USD]

allocate 10.00 USD by ratios [9007199254740991, 1] at scale 2
= [10.00 USD, 0.00 USD]
```

## Invalid Examples

- Allocating `10.001 USD` at target scale 2 by silently rounding the source to
  `10.00 USD` or `10.01 USD`.
- Inferring target scale 2 because the source currency is `USD`.
- Reordering ratio entries before distributing the remainder.
- Accepting zero, negative, fractional, decimal-string, or malformed ratios.
- Accepting ratio `9007199254740992`, target scale `51`, or equal-part count
  `101`.

## Errors

Invalid source Money components fail according to [Money Errors](errors.md).
Missing, malformed, unsupported, or invalid allocation methods, part counts,
ratio lists, ratio values, or target scales fail with
`FINKORE_MONEY_INVALID_ALLOCATION` under **MONEY-ERROR-008**. When the source
cannot be represented as whole allocation units at the target scale, the
operation fails with `FINKORE_MONEY_ROUNDING_REQUIRED` under
**MONEY-ERROR-005**. Failed allocation leaves the source Money operand
unchanged under **MONEY-ERROR-007**.

## Compatibility Correction

Core 0.9.1 retains the published JSON-number request shape and existing member
names. It defines the previously missing inclusive ranges so a JSON number is
not accepted by an arbitrary-precision implementation when the same value
cannot be represented or processed by another supported implementation. Values
inside the ranges keep their existing meaning; values outside them use the
existing `FINKORE_MONEY_INVALID_ALLOCATION` category. This is the demonstrated
portability correction permitted by **SPEC-FREEZE-001** and does not introduce
a new serialization encoding or operation identifier.

Workflow definition versions use positive base-10 integer strings only for the
optional Default Workflow Version Sequence; other versions and revisions are
opaque strings. Approval quorum thresholds are bounded by the finite declared
voter set. Those values therefore do not reuse the allocation ratio domain.

## Non-Goals

This document does not define tax apportionment, invoice-line matching,
accounting postings, currency conversion, stochastic fair rounding, priority
policies beyond declared order, or currency minor-unit metadata.
