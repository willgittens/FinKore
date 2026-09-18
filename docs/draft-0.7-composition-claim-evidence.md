# Draft 0.7 Composition Claim Evidence

## Status

Milestone E claim-boundary record for Draft 0.7 cross-domain composition.

This document records the current compatibility, profile scope, and evidence
boundary for the non-normative expense approval and invoice correction
reference profiles. It does not create a new Core conformance profile,
portable capability floor, package publication claim, production-readiness
claim, or external-review claim.

## Source Identity

Current committed evidence revision at the start of TASK-272:

```text
b06417a761479314373c3d58831bbcb398562db0
```

Draft 0.7 remains open until closure evidence is reproduced from the final
accepted committed revision. Later documentation-only updates must not be used
to rewrite the source identity above.

## Closed Core Claim Boundary

No new normative Core behavior was accepted for Draft 0.7 composition. The
closed Core claim boundary therefore remains the existing Draft 0.6 profile set:

- `finkore.core.draft0_6.full`
- `finkore.core.draft0_6.domain.money`
- `finkore.core.draft0_6.domain.workflow`
- `finkore.core.draft0_6.domain.audit`
- `finkore.core.draft0_6.domain.approvals`
- `finkore.core.draft0_6.domain.entities`

No `conformance/draft-0.7/` profile metadata, capability declaration, claim
record, manifest format, vector-file format, portable error, or canonical
operation ID is added by Draft 0.7.

The existing Draft 0.6 metadata remains applicable:

| Metadata | Value |
| --- | --- |
| Manifest format | `0.1` |
| Vector-file format | `0.1` |
| Manifest-listed suites | 5 |
| Manifest-listed vector files | 16 |
| Manifest-listed vectors | 254 |
| Mutation-sensitive vectors | 227 |
| Capability floor | `spec/draft-0.6-portability-capability-contract.md` |
| Capability declarations | `conformance/draft-0.6/capabilities.json` |
| Claim records | `conformance/draft-0.6/claims/` |

## Current Full-Profile Regression Evidence

The existing Draft 0.6 full profile remains green in all three language
implementations:

| Implementation | Profile | Result |
| --- | --- | --- |
| TypeScript | `finkore.core.draft0_6.full` | 254/254 passed, 0 failed, 0 unsupported, 0 infrastructure errors; 227/227 mutation-sensitive passed |
| Python | `finkore.core.draft0_6.full` | 254/254 passed, 0 failed, 0 unsupported, 0 infrastructure errors; 227/227 mutation-sensitive passed |
| Java | `finkore.core.draft0_6.full` | 254/254 passed, 0 failed, 0 unsupported, 0 infrastructure errors; 227/227 mutation-sensitive passed |

Suite counts are unchanged:

| Suite | Vectors | Passed |
| --- | ---: | ---: |
| Money | 93 | 93 |
| Workflow | 41 | 41 |
| Audit | 29 | 29 |
| Approvals | 66 | 66 |
| Entities | 25 | 25 |

## Reference Profile Evidence

Draft 0.7 adds reference application evidence only.

| Reference profile | Scenario IDs | Implementations | Status |
| --- | ---: | --- | --- |
| Expense approval | `D07-EXP-001` through `D07-EXP-010` | TypeScript, Python, Java | Implemented |
| Invoice correction | `D07-INV-001` through `D07-INV-010` | TypeScript, Python, Java | Implemented |

The shared fixture file is
`examples/composition/draft-0.7/scenarios.json` and currently contains 20
scenarios with `implementationStatus` set to `implemented`.

Reference commands:

| Command | Evidence meaning |
| --- | --- |
| `npm run composition:test:draft0.7` | Validates fixture structure and runs all reference scenarios in TypeScript, Python, and Java. |
| `npm run composition:compare:draft0.7` | Emits actual observations from all three languages and compares the complete sorted JSON result set. |
| `npm run composition:critical:draft0.7` | Checks selected exact-money, failure-boundary, history-preservation, primary-error, and no-synthetic-effect observations over compared results. |
| `npm run composition:mutation:critical:draft0.7` | Seeds critical composition mutants across TypeScript, Python, and Java and requires the proof layer to kill them. |

The reference profile evidence is not listed in `conformance/manifest.json`,
is not dispatched by canonical operation IDs, and is not a Core conformance
profile.

## Scope Exclusions

Draft 0.7 does not claim:

- a ledger, journal-entry, posting, payment, settlement, FX, tax, or accounting
  correction standard;
- persistence, storage durability, rollback, locking, queueing, or distributed
  transaction semantics;
- universal authorization, RBAC, segregation of duties, actor authentication,
  delegation, escalation, or dynamic approver resolution;
- production diagnostic, privacy, retention, cryptographic sealing, or Audit
  total-ordering guarantees;
- package publication or production readiness;
- external community or independent review; or
- a Draft 0.7 Core conformance profile.

## Metadata Review

TASK-272 reviewed whether capability, compatibility, claim, profile, Agentic,
or conformance metadata required a Draft 0.7 update. No metadata update is
applicable because no new normative Core behavior, portable operation,
capability floor, profile, or claim was accepted. Reference profile evidence
is recorded in documentation and example fixtures instead.

## TASK-272 Conclusion

Draft 0.7 claim evidence is finalized for the current open-release milestone:
closed claims remain Draft 0.6 full-profile claims, and Draft 0.7 composition
evidence remains explicitly non-normative reference application evidence. This
does not close Draft 0.7; closure still requires documentation synchronization,
clean-checkout reproduction, provenance/checksum review, and final maintainer
approval of the release identity.
