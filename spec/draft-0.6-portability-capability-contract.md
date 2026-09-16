# Draft 0.6 Portability Capability Contract

## Status

Accepted for Milestone B of FinKore Core Draft 0.6 on 2026-09-16.

This record closes TASK-242 and TASK-243. It defines the portable capability
floor and structural boundary dispositions needed for later Draft 0.6 profiles,
claims, capability declarations, and automated checks. It does not add a new
financial domain, create a new portable error code, change conformance format
`0.1`, or publish a Draft 0.6 conformance claim.

The accepted floor is a minimum for a profile claim. It is not an assertion that
all conforming implementations have unlimited arithmetic, unlimited memory, or
the same implementation maxima above the floor.

## Authority and Evidence

This contract refines existing exact Money and structural requirements. The
source requirements remain in the domain specifications, especially
`SPEC-DECIMAL-001`, `MONEY-REPRESENTATION-002`,
`MONEY-REPRESENTATION-006`, `MONEY-ARITHMETIC-007`,
`MONEY-ARITHMETIC-008`, `MONEY-RATE-002`, `MONEY-RATE-005`,
`MONEY-ROUNDING-001` through `MONEY-ROUNDING-004`, and
`MONEY-ALLOCATION-001` through `MONEY-ALLOCATION-013`.

The immediate evidence is the Draft 0.6 boundary corpus and the remediation of
`D06-PORT-241-001`. Later TASK-249 through TASK-253 work must encode and prove
this contract mechanically before Draft 0.6 can close.

## Numeric Capability Floor

An implementation claiming the Draft 0.6 Money profile MUST produce the
specified FinKore result for Money inputs inside all applicable limits below.

| Concern | Portable floor | Decision |
| --- | --- | --- |
| Decimal input significant digits | Amount, scalar, and Rate decimal strings with up to 64 decimal digits, excluding sign and decimal point. | Exact base-10 parsing and representation are required. JSON numbers remain non-portable for decimal values. |
| Decimal input scale | Plain decimal strings with fractional scale from 0 through 60. | Positive scale is supported inside the floor. Exponent notation and negative-scale portable syntax remain invalid Money serialization. |
| Exact result growth | Addition, subtraction, negation, multiplication, exact division, and Rate application results with up to 128 significant digits and fractional scale up to 60. | Exact representable results MUST be preserved and MUST NOT be rounded implicitly. |
| Rounding target scale | Explicit target scales from 0 through 50 for every portable rounding mode. | Rounding at scale 50 is inside the floor. Invalid scale or mode remains `FINKORE_MONEY_INVALID_ROUNDING`. |
| Division | Non-zero exact decimal divisors inside the decimal floor; terminating quotients inside the result-growth floor. | Terminating quotients are exact. Non-terminating quotients without an applicable rounding policy fail with `FINKORE_MONEY_ROUNDING_REQUIRED`. |
| Rate application | Decimal and percentage Rates inside the decimal floor, with exact percentage division by 100 before multiplication. | Percentage scaling MUST NOT use ambient binary or decimal context precision that can reduce significant digits. |
| Allocation target scale | Explicit target scales from 0 through 50. | Source amounts must be whole allocation units at the target scale or fail with `FINKORE_MONEY_ROUNDING_REQUIRED`. |
| Allocation ratio value | Positive integer ratios from 1 through 9,007,199,254,740,991. | The upper bound matches the exact JSON integer range already safe for the current JavaScript runner and adapters. |
| Allocation part count | Equal-part allocation up to 100 parts; ratio allocation up to 100 ratio entries. | Result order and remainder assignment remain declared-order semantics. |
| Allocation units | Absolute source allocation units up to 10^30 at the requested target scale. | Allocation MUST use exact integer unit arithmetic and preserve the exact source total. |

Inside this floor, `unsupported`, timeout, process crash, silent rounding,
precision-context reduction, overflow wrapping, or approximate arithmetic is not
a conforming result for a successful profile claim.

## Outside-Floor and Capability Handling

The floor separates four cases:

- **Inside the floor:** every implementation claiming the affected profile must
  produce the specified result or specified portable domain error.
- **Above the floor and inside an implementation's declared capability:** the
  implementation remains bound by the domain specification and must not silently
  round, coerce, or reinterpret exact Money behavior.
- **Outside an implementation's declared capability:** support must be
  discoverable before reliance once Draft 0.6 capability declarations exist. A
  failed execution outside declared capability is not evidence for or against an
  inside-floor profile claim.
- **Invalid domain input:** existing portable domain errors apply. This contract
  does not reuse `FINKORE_MONEY_INVALID_AMOUNT`,
  `FINKORE_MONEY_INVALID_ROUNDING`, `FINKORE_MONEY_INVALID_ALLOCATION`,
  `UNSUPPORTED`, or infrastructure failure with a new capability-exceeded
  meaning.

Draft 0.6 does not introduce a portable resource-limit or capability-exceeded
error code. If later work needs such an outcome, it must begin with a
specification change and receive conformance, Agentic, implementation, and
documentation updates.

## D06-PORT-241-001 Resolution

`D06-PORT-241-001` is resolved as a Python implementation defect exposed by
the boundary corpus. Existing Money requirements already prohibited the
observed loss of significant digits and infrastructure exception:

- exact representable Money arithmetic must preserve exact decimal results;
- Rate percentage scaling is exact decimal division by 100; and
- explicit rounding must honor the requested target scale and mode.

The Python implementation now uses coefficient-and-scale arithmetic for the
affected operations rather than ambient `decimal` context precision. The five
previously divergent boundary cases now match TypeScript and Java and remain in
the non-normative research corpus as cross-language controls until TASK-252
decides which accepted boundary cases become manifest-listed conformance
vectors.

## Structural and Representation Boundary Dispositions

TASK-243 accepts the following dispositions for Draft 0.6. These are
clarifications of current specified behavior unless a later task promotes a
specific case into a new conformance vector.

| Boundary | Disposition |
| --- | --- |
| Unicode identifiers | Opaque identifiers are preserved exactly. Implementations MUST NOT normalize, case-fold, transliterate, or infer domain facts from Unicode content unless a domain specification explicitly says so. |
| Timestamp offsets | Serialized timestamps use the existing RFC 3339 string requirements. Where a domain compares instants, equivalent offsets compare by instant, not host timezone or local string form. |
| Absent, null, and redacted | Absence, explicit null, and redacted sentinels remain distinct only where the governing domain makes them observable. Null is not valid merely because a host language has a null value. |
| Array and history order | Array order is significant when the domain declares order, including allocation ratios, histories, stages, chains, and relationships. |
| JSON object member order | Object member order has no domain meaning. Duplicate JSON member diagnostics remain parser-specific and outside Draft 0.6 domain behavior. |
| Opaque identity | Identity strings and revision tokens remain opaque unless a domain specification defines a specific comparison or preservation rule. Implementations MUST NOT infer chronology, tenancy, state, or authorization from their internal format. |
| Canonical Money serialization | Portable Money serialization remains locale-independent plain decimal string plus currency. Exponent notation, JSON numbers, grouping separators, and display formatting remain outside portable Money serialization. |
| Portable error precedence | Existing domain precedence rules remain authoritative where specified, such as Workflow transition precedence and Approval composition precedence. No global precedence order is invented for unrelated domains. |

## Security, Resource, and Compatibility Analysis

The floor is deliberately bounded to avoid converting arbitrary-precision
resource exhaustion into a conformance obligation. At the same time, any
implementation claiming the profile must allocate enough precision or exact
integer capacity to avoid silent loss inside the floor.

The change is compatibility-preserving for the closed Draft 0.5 manifest
claims: all existing vectors remain within their previous outcomes. The Python
fix expands correct behavior for exact Money operations already required by the
specification. Future Draft 0.6 claim and capability metadata must identify this
floor explicitly so a capability advertisement cannot be mistaken for proof.

## Required Later Work

TASK-249 through TASK-253 must still:

- encode this floor in machine-readable profile and capability metadata;
- add positive and negative fixtures for invalid or inconsistent metadata;
- decide which boundary controls become manifest-listed conformance vectors;
- run full TypeScript and Python profile evidence and Java Money evidence; and
- prove that no unsupported or infrastructure result is hidden inside a
  successful claim.

This contract does not close Draft 0.6 by itself.
