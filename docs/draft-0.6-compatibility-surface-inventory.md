# Draft 0.6 Compatibility Surface Inventory

## Status

Accepted for TASK-240 on 2026-09-16.

This is a non-normative inventory of the surfaces that can change FinKore
compatibility or the meaning of a conformance claim. It assigns authority and a
Draft 0.6 disposition; it does not itself define financial behavior or decide
the portable capability floor. Milestone B later accepted the portable floor in
`spec/draft-0.6-portability-capability-contract.md`; this inventory remains the
TASK-240 point-in-time ownership record.

## Authority and Evolution Inventory

| Surface | Current authority and identity | Compatibility risk | Evolution owner | Draft 0.6 disposition |
| --- | --- | --- | --- | --- |
| Foundation financial rules | `docs/coreDoc/core-doc.md`, stable `CORE-*` IDs | Silent replacement can sever durable rationale and review history | CoreDoc governance | Preserve identifiers and attributed evolution; compatibility policy in TASK-245 |
| Precise domain behavior | `/spec`, 381 indexed requirement IDs plus the accepted Draft 0.6 portability capability contract | Changed MUST/MUST NOT meaning changes conforming outcomes | Domain specification | Milestone B capability and structural boundary decisions accepted; Milestone D metadata and proof records now reference this authority |
| Normative Money serialization | `spec/money/serialization.md` | Parser or output changes can break portable interchange | Money specification | Exercise large/deep decimals; classify any accepted change before implementation |
| Portable timestamp representation | `SPEC-TIMESTAMP-001..002` and domain refinements | Offset, instant, or host-time defaults can diverge | Specification conventions and affected domain | Existing equivalent-offset behavior retained; TASK-243 accepted instant-comparison disposition |
| Nullability and presence | `SPEC-NULLABILITY-001` plus domain rules | Missing, null, and redacted values can collapse | Specification conventions and affected domain | Existing distinctions retained; TASK-243 accepted no global null default |
| Opaque identifiers | `SPEC-IDENTIFIER-001..003` plus domain rules | Unicode normalization, case folding, or inference can change identity | Specification conventions and affected domain | TASK-243 accepted exact preservation and no normalization/case folding |
| Portable error catalog | `/spec` domain error documents and `spec/conventions.md`; 31 codes | Reuse or condition changes alter client behavior | Specification | Drift automation in TASK-250; no capability error invented in Milestone A |
| Error precedence | Domain error requirements and manifest vectors | Languages may reject the same request with different codes | Domain specification and conformance | Existing Workflow control matched; expand only from accepted requirements |
| Conformance manifest syntax | `conformance/manifest.json`, `finkoreConformance: 0.1` | Old runners may misdiscover scope | Conformance conventions | Version taxonomy in TASK-244; no automatic bump for Draft 0.6 |
| Vector-file syntax | 16 files, `finkoreVectorFile: 0.1` | Old runners may misparse inputs or observations | Conformance conventions | Version taxonomy in TASK-244 |
| Vector schema | `conformance/vector.schema.json` | Schema and loader disagreement can admit incompatible fixtures | Conformance | Compatibility tests in TASK-251 |
| Vector identity and membership | 254 globally unique vector IDs discovered only from the manifest | Renames, orphan files, or filtering can misstate evidence | Conformance | Profile closure and drift checks implemented in TASK-250 |
| Requirement traceability | `conformance/traceability.md`; 381 requirements | Orphan requirements/vectors can create false coverage claims | Specification and conformance | Automated bidirectional checks in TASK-250 |
| Normalized runner result | Runner types, validator, comparator, and report | Shape or comparison changes can change pass/fail meaning | Runner/conformance contract | Version and compatibility rules in TASK-244/TASK-251 |
| Runner package | `@finkore/conformance-runner` `0.1.0` | Package version alone does not identify Core behavior | Runner | Keep independent; profile evidence in TASK-251 |
| Canonical operations | `agentic/operations.md`; 20 `finkore.*` IDs | Rename or semantic drift breaks discovery and governance | Agentic Contract backed by `/spec` | Registry drift check in TASK-250; no Milestone A promotion |
| Conformance-local operations | 15 manifest operation labels | Fixture labels can be mistaken for public capabilities | Conformance conventions | Preserve explicit classification; never advertise as canonical capability |
| Agentic capability statements | `agentic/capabilities.md` | Advertisement can be mistaken for proof | Agentic Contract | Versioned declaration contract in TASK-247 |
| Agentic descriptor version | No separate machine-readable descriptor version exists | Future metadata may be conflated with Core or package versions | Agentic Contract | Relationship policy in TASK-244; machine-readable operation manifest deferred to Draft 0.8 |
| TypeScript core API | `@finkore/typescript` `0.1.0` | Idiomatic API change can affect consumers without changing Core | TypeScript package | Package compatibility remains separate from conformance |
| Python core API | `finkore-python` `0.1.0` | Runtime decimal context can alter exact behavior | Python package, governed by `/spec` | `D06-PORT-241-001` resolved by exact coefficient-and-scale Money arithmetic |
| Java core API | `org.finkore:finkore-java-core` `0.1.0` | Money-only scope can be overstated as full Core | Java package, governed by `/spec` | Retain Money-only scope and explicit non-Money unsupported results |
| TypeScript adapter | `@finkore/typescript-conformance-adapter` `0.1.0` | Normalization can hide implementation divergence | Adapter/runner boundary | Adapter revision required in claims; no financial logic permitted |
| Python adapter | Source revision; subprocess bridge | Crashes may be confused with domain errors | Adapter/runner boundary | Former high-scale crash resolved; infrastructure/domain separation remains governed by runner and adapter contracts |
| Java adapter | Source revision; subprocess bridge | Money-only support may be broadened accidentally | Adapter/runner boundary | Non-Money support stays false; exact adapter revision required in claims |
| TypeScript full claim | Draft 0.6 Milestone D profile claim: 254/254 | Moving manifest or implementation can invalidate historical evidence | Release/conformance evidence | Recorded as `finkore.core.draft0_6.full`; Draft 0.5 historical claim remains exact at 244/244 |
| Python full claim | Draft 0.6 Milestone D profile claim: 254/254 | Values outside the manifest can be mistaken as proven | Release/conformance evidence | Recorded as `finkore.core.draft0_6.full`; resolved boundary controls do not retroactively expand the closed Draft 0.5 claim |
| Java Money claim | Draft 0.6 Milestone D profile claim: 93/93; non-Money domains unsupported | Domain claim can be presented as full claim | Release/conformance evidence | Recorded as `finkore.core.draft0_6.domain.money`; Java full profile remains unsupported |
| Coverage and mutation evidence | Release commands and reports | Quality evidence can be conflated with portable conformance | Implementation quality policy | Claims distinguish conformance from official/reference quality evidence |
| Toolchain inputs | Node/npm, CPython 3.12/3.13, JDK 21, Maven 3.9.x | Host/runtime differences can prevent reproduction | Repository tooling | Record exact observed versions and supported floors in claim/release evidence |
| Release notes | `docs/releases/*.md` | Planned work can be reported as shipped | Release governance | Draft 0.6 note remains in progress until TASK-255 |
| Git revision and tag | Opening revision recorded; no immutable Draft 0.6 tag | Mutable branches cannot identify reviewed artifacts | Release governance | Provenance policy TASK-248; creation requires closure approval |
| Checksums | Draft 0.6 checksum metadata format exists with release-closure status pending | Generated artifacts may not be reproducible | Release governance | Schema and validator exist; final artifact checksums remain TASK-254 closure work |
| Research corpus | `docs/research/draft-0.6-boundary-corpus.json`, research format `0.1` | Exploratory values could become accidental specification | Draft 0.6 governance | Remains outside conformance manifest; differences require findings |

## Stable Semantic Inventory

| Kind | Opening count | Discovery authority | Draft 0.6 rule |
| --- | ---: | --- | --- |
| Core/spec requirement IDs | 381 | Markdown requirement definitions under `/spec` | Never reuse; orphan and duplicate checks added in TASK-250 |
| Vector IDs | 254 | Manifest-listed vector files | Never reuse; profile membership cannot silently filter required vectors |
| Portable errors | 31 | Specification error catalogs | Conditions and precedence are semantic, not just string stability |
| Canonical operations | 20 | `agentic/operations.md` | `/spec` remains authoritative; registry drift checked in TASK-250 |
| Conformance-local labels | 15 | Manifest-listed vectors and conventions catalog | Test vocabulary only until separately promoted |

`npm run baseline:draft0.6` is the executable count and current-version check.
TASK-250 will replace count-only confidence with uniqueness, orphan, and drift
validation.

## Implementation and Claim Boundary

| Implementation | Supported opening scope | Explicit non-capability | Evidence authority |
| --- | --- | --- | --- |
| TypeScript | Complete 254-vector full Draft 0.6 profile | No behavior beyond current Core/spec scope | Draft 0.6 Milestone D claim record plus final closure checks |
| Python | Complete 254-vector full Draft 0.6 profile | No behavior beyond current Core/spec scope | Draft 0.6 Milestone D claim record plus final closure checks |
| Java | 93-vector Money Draft 0.6 profile | Non-Money domains unsupported | Draft 0.6 Milestone D claim record plus final closure checks |

The support boundary is operation- and profile-specific. Package presence,
method availability, or an Agentic capability statement does not prove a
conformance claim. Research beyond manifest values does not retroactively alter
the Draft 0.5 claim.

## Deferred Boundary Register

| Deferred topic | Current authority/status | Draft 0.6 disposition |
| --- | --- | --- |
| Decimal precision, scale, exact-result growth, overflow | Draft 0.6 portable floor accepted and exercised by manifest-listed profile vectors | TASK-242 and TASK-252 complete; no unlimited arithmetic claim |
| Allocation ratio/unit and part-count floor | Draft 0.6 portable floor accepted for safe-integer ratios, 100 parts, target scale through 50, and bounded allocation units | TASK-242 and TASK-252 complete; proof recorded in TASK-253 claims |
| Implementation capability discovery | Capability declarations encoded in `conformance/draft-0.6/capabilities.json` | TASK-247 and TASK-249 complete; declarations are distinct from claim evidence |
| Currency minor-unit metadata and defaults | Deferred; calculation scale is not currency minor units | Out of Draft 0.6 except to prohibit accidental coupling |
| Private/non-fiat currency namespace | Deferred | Out of Draft 0.6 unless an accepted blocker proves necessary |
| Duplicate JSON member handling | No domain semantic; parser-specific | Out of Draft 0.6 unless normative serialization review identifies a blocker |
| Common identifier envelope | Open question in specification conventions | Out of Draft 0.6; exact opaque preservation remains in scope |
| Workflow migration/distributed version coordination | Deferred | Out of Draft 0.6 |
| Distributed Audit total ordering and standardized provenance fields | Deferred | Out of Draft 0.6 |
| Approval delegation, escalation, dynamic lookup, broader graphs | Deferred | Out of Draft 0.6 |
| IAM, RBAC, authorization, transport retry/idempotency | Application/transport concerns not currently Core behavior | Out of Draft 0.6 |
| Concrete correction/reversal ledger effects | Deferred composing/accounting behavior | Out of Draft 0.6 |
| Cross-domain composition and transaction boundaries | Planned Draft 0.7 | Explicitly out of Draft 0.6 |
| Machine-readable canonical Agentic operation manifest | Planned Draft 0.8 | Draft 0.6 may define version relationship only; no manifest implementation |
| Package publication and production support | Planned later release hardening | Out of Draft 0.6 |

## Documentation Freshness Findings

Current navigational documentation contained pre-Draft-0.5 statements that
Python and Java were future or unimplemented. These statements were not in
historical release records; they were live project guidance. They are corrected
under `D06-EDITORIAL-240-001` without changing specification behavior,
conformance scope, package APIs, or claims.

Historical Draft 0.4 and Draft 0.5 plans, release notes, handoffs, and accepted
review records remain unchanged when they accurately describe their own point in
time.

## TASK-240 Result

Every known compatibility surface now has an authority, current identity or
explicit absence, evolution owner, risk, and Draft 0.6 disposition. Milestone B
has accepted the portable capability floor and structural boundary dispositions;
Milestone C accepted compatibility, profile, claim, capability-declaration, and
provenance policy in
[Draft 0.6 Compatibility, Claims, and Provenance Policy](draft-0.6-compatibility-claims-provenance-policy.md).
Milestone D now provides machine-readable metadata, drift validation,
profile-aware runner evidence, promoted Money portability vectors, and current
claim records. Release hardening, final checksums, and immutable-tag status
remain pending. No new portable error, canonical operation, or package version
is created by this inventory.
