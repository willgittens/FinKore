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
19 cases; 49 executions; 19 matched cases; 0 documented differences.
14 normative source checks; 0 infrastructure errors; 0 unsupported.
All executions completed within the 5000 ms adapter timeout.
```

The 19 matching cases showed:

- exact cross-language agreement for the former `D06-PORT-241-001` large
  significant-digit addition, negative subtraction, product-growth,
  high-scale rounding, and large percentage Rate controls;
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

## Resolved Difference: D06-PORT-241-001

Milestone A originally registered five differences under `D06-PORT-241-001`.
TASK-242 resolved the finding as a Python implementation defect, not as an
undefined financial rule. Existing Money requirements already required exact
representable arithmetic, exact Rate percentage scaling, and explicit
scale/mode rounding without ambient precision loss.

The Python implementation now uses coefficient-and-scale arithmetic for the
affected operations. The five former difference cases remain in this corpus as
matching controls and are covered by Python unit regression tests. The accepted
portable numeric floor and structural boundary dispositions are recorded in
[`spec/draft-0.6-portability-capability-contract.md`](../../spec/draft-0.6-portability-capability-contract.md).

## Performance, Errors, and Normalization

- All 49 executions completed within the configured 5-second adapter timeout.
- No operation was reported unsupported in its declared research scope.
- No infrastructure error occurred.
- Every non-crashing adapter response passed normalized-result validation.
- No adapter normalization hid a Money mismatch: the Money amount strings were
  preserved in normalized actual results.
- All 14 executions sourced from normative vectors matched their expected
conformance observations.

## Decision Boundary

Milestone B accepts the portable numeric and allocation floor and structural
boundary dispositions, but this corpus remains non-normative until later tasks
promote any case into manifest-listed conformance vectors. The accepted floor
does not assume arbitrary precision is free, treat silent rounding as capability
reporting, or convert runtime resource failures into portable domain errors.
