# Draft 0.6 Boundary Research Evidence

## Status

Milestone A evidence recorded on 2026-09-16 for TASK-241.

This report is non-normative. The executable corpus is
[`draft-0.6-boundary-corpus.json`](draft-0.6-boundary-corpus.json), is not listed
by `conformance/manifest.json`, and does not define a capability floor or a
conformance profile.

## Method

Run:

```bash
npm run research:boundaries:draft0.6
```

The command builds the TypeScript runner, core, and adapter; compiles the Java
core and bridge; loads the TypeScript, Python, and Java adapters; validates every
normalized result; and compares exact observable outputs. Existing manifest
vectors used as structural controls are also compared with their normative
expected results.

Each adapter execution has a 5,000 ms timeout. Timings are diagnostic and are
not stable release evidence. The retained performance observation is only
whether a case completed within that bound.

## Corpus Coverage

The 19 cases produce 49 adapter executions:

- TypeScript, Python, and Java Money:
  - large positive addition and negative subtraction;
  - significant-digit multiplication growth;
  - deep fractional scale;
  - terminating and non-terminating division, including a quotient that may use
    a negative native decimal scale before canonical plain-string expansion;
  - scale-50 rounding;
  - large percentage Rate application;
  - ratios at the JavaScript safe-integer boundary; and
  - 100-part equal allocation.
- TypeScript and Python full-domain structure:
  - decomposed and precomposed Unicode plus emoji in opaque identifiers;
  - timestamp offset equivalence;
  - absent versus explicit null;
  - JSON object-member order invariance;
  - array and Audit relationship declared order;
  - Entity import identity/revision preservation; and
  - portable Workflow error precedence.

Seven reused vector cases create 14 normative source checks. The custom stress
cases have no normative expected result in this corpus.

## Observed Result

```text
Draft 0.6 boundary research: PASS
19 cases; 49 executions; 14 matched cases; 5 documented differences.
14 normative source checks; 1 infrastructure error; 0 unsupported.
All executions completed within the 5000 ms adapter timeout.
```

The 14 matching cases showed:

- exact cross-language agreement for a 60-place fractional addition;
- exact terminating division at scale 40;
- canonical integer expansion for a quotient that Java represents with a
  negative native `BigDecimal` scale after trailing-zero stripping;
- the same rounding-required error for non-terminating division;
- exact allocation agreement for large safe-integer ratios and 100 parts;
- exact Unicode identity preservation in TypeScript and Python, including no
  normalization of canonically equivalent-looking strings;
- timestamp comparison by instant across equivalent offsets;
- preserved absent/null distinction;
- object-member order ignored while array/declared relationship order remains
  significant; and
- matching opaque Entity identity and Workflow error precedence.

## Registered Difference: D06-PORT-241-001

Five cases expose one common Python decimal-context portability blocker:

| Case | TypeScript and Java | Python observation |
| --- | --- | --- |
| `money-large-add-significant-digits` | Exact 62-digit result | Successful result silently reduced to the active 28-digit decimal context |
| `money-large-negative-subtraction` | Exact result | Successful result silently reduced to 28 significant digits |
| `money-large-product-growth` | Exact full product | Successful result silently reduced to 28 significant digits |
| `money-round-at-scale-50` | Exact HALF_EVEN scale-50 result | Unhandled `decimal.InvalidOperation`, surfaced by the adapter as infrastructure error |
| `money-large-percentage-rate` | Exact full Rate result | Successful result silently reduced to 28 significant digits |

The inputs are accepted as valid plain decimal values by all three
implementations. The observed Python behavior comes from arithmetic and
`quantize` using the ambient default `decimal` context. TypeScript and Java
agree with one another on exact outputs for these cases.

This finding is classified as `PORTABILITY BLOCKER`, not yet as a final
capability-floor rule or implementation resolution. Existing manifest values do
not reach the failing boundary, so the closed Draft 0.5 Python 244/244 claim
remains factually unchanged. The finding blocks:

- selection of a Draft 0.6 numeric capability floor that includes these values;
- any broader Python capability claim covering these values; and
- Draft 0.6 closure until TASK-242 accepts a spec-first decision and the
  required later implementation/conformance work is complete.

## Performance, Errors, and Normalization

- All 49 executions completed within the configured 5-second adapter timeout.
- No operation was reported unsupported in its declared research scope.
- One infrastructure error occurred: Python scale-50 rounding allowed
  `decimal.InvalidOperation` to leave the core/bridge boundary.
- Every non-crashing adapter response passed normalized-result validation.
- No adapter normalization hid a Money mismatch: the differing Python amount
  strings were preserved in the normalized actual results.
- All 14 executions sourced from normative vectors matched their expected
  conformance observations.

## Decision Boundary

Milestone A records observations only. TASK-242 must decide the portable numeric
and allocation floor, including significant digits, scale, result growth, and
out-of-capability behavior. That decision must not assume that arbitrary
precision is free, treat silent rounding as capability reporting, or convert a
runtime decimal exception into a portable domain error without a specification
rule.
