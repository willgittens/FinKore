# FinKore Core Draft 0.5 Portability Review

Draft 0.5 review date: 2026-09-16.

## Scope

This review compares observable conformance behavior, not implementation
architecture or source similarity.

- TypeScript: complete manifest regression scope.
- Python: complete manifest implementation scope.
- Java: complete Money implementation scope.
- Java non-Money vectors: unsupported-boundary check only.

## Result

No Draft 0.5 `D05-*` finding is required.

The packaged review command is:

```bash
npm run portability:draft0.5
```

Observed result:

```text
Draft 0.5 portability review passed.
TypeScript: 244/244 vectors passed; mutation-sensitive 217/217.
Python: 244/244 vectors passed; mutation-sensitive 217/217.
Java Money: 83/83 vectors passed; mutation-sensitive 68/68.
Java full-manifest boundary: 83 Money vectors passed and 161 non-Money vectors reported unsupported.
Observed actual-result differences requiring D05 findings: 0.
```

## Difference Inventory

| Area | Review result |
| --- | --- |
| Decimal behavior | TypeScript, Python, and Java Money actual results match for all Money vectors. |
| Absent/null handling | TypeScript and Python actual results match for the complete manifest; Java Money actual results match for Money vectors. |
| Timestamps | TypeScript and Python actual results match for timestamp-bearing Workflow, Audit, Approval, and Entity vectors. |
| Ordering | All declared scopes preserve vector-expected ordering for histories, actionables, allocation parts, and observations. |
| Identity | TypeScript and Python actual results match for Entity identity/revision/import vectors; Java Money has no Entity scope. |
| Error precedence | Actual portable errors match in all declared scopes. |
| Failure non-mutation | Conformance observations match in all declared scopes. |
| Adapter normalization | No actual-result mismatch was hidden by adapters; adapters remain translation infrastructure. |
| Unsupported reporting | Java reports 161 non-Money vectors as unsupported and does not count them as Java passes. |

## Defect-Resistance Evidence

The TypeScript reference implementation and runner retain their Stryker mutation
evidence. Python and Java use a packaged critical-mutant probe as the accepted
Draft 0.5 equivalent for their new implementation tracks.

| Target | Evidence |
| --- | --- |
| TypeScript core | `npm run test:mutation -w @finkore/typescript`: 98.28% total, 98.40% covered, 3129 killed, 16 timeout, 51 survived, 4 no coverage, 0 errors. Money scored 100%. |
| Conformance runner | `npm run test:mutation -w @finkore/conformance-runner`: 99.73% total and covered, 367 killed, 1 survived, 0 no coverage, 0 errors. |
| Python full scope | `npm run python:mutation:critical`: 9/9 critical probes killed across Money, Workflow, Audit, Approvals, and Entities. |
| Java Money scope | `npm run java:mutation:critical`: 5/5 critical probes killed across Java Money currency, arithmetic, rounding, rate, and allocation behavior. |

The Python and Java probe is not a general mutation-score claim. It is the
accepted Draft 0.5 defect-resistance evidence for the new language tracks
because it targets the critical financial defects that would invalidate the
declared conformance claims.

## Finding Disposition

| Finding | Classification | Status | Resolution |
| --- | --- | --- | --- |
| None | N/A | N/A | No cross-language contradiction, portability blocker, conformance defect, implementation defect, or tooling defect was observed in the declared scopes. |
