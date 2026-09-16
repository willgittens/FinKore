# Draft 0.6 Compatibility, Claims, and Provenance Policy

## Status

Accepted for Milestone C of FinKore Core Draft 0.6 on 2026-09-16.

This record closes TASK-244 through TASK-248. It defines compatibility
relationships, change classification, conformance profiles, conformance-claim
rules, implementation capability declarations, and release provenance policy for
Draft 0.6. It does not add financial behavior, create machine-readable schemas,
change conformance format `0.1`, create a release tag, publish packages, or
close Draft 0.6.

Machine-readable compatibility, profile, claim, capability, and checksum records
are Milestone D work. Until then, this document is the accepted human-readable
contract that those records must encode.

## Version Compatibility Taxonomy

FinKore versions are independent compatibility dimensions. A value in one
dimension MUST NOT be used to infer another dimension.

| Dimension | Current Draft 0.6 form | Owner | Bump or change trigger | Unknown-version handling |
| --- | --- | --- | --- | --- |
| FinKore Core version | `draft-0.6` release label after closure; current work remains in progress | CoreDoc and `/spec` governance | Normative baseline, scope, or accepted compatibility policy changes | Consumers MUST treat unknown Core targets as unsupported for claims unless explicitly mapped by compatibility metadata. |
| Conformance manifest format | `0.1` | Conformance conventions and runner | Manifest syntax or defined member semantics change incompatibly for older runners | Runners MUST reject unsupported manifest versions. |
| Conformance vector-file format | `0.1` | Conformance conventions and runner | Vector-file syntax or defined member semantics change incompatibly for older runners | Runners MUST reject unsupported vector-file versions. |
| Agentic contract/descriptor version | Documentation-first in Draft 0.6; no machine-readable descriptor version yet | Agentic Contract | Descriptor semantics, required discoverability fields, or machine-readable descriptor schema changes | Unknown future descriptor versions MUST NOT be assumed compatible. |
| Implementation package version | Language package's own version, currently `0.1.0` for TypeScript, Python, and Java | Package maintainers | Public API, packaging, or implementation release changes according to that package's policy | A package version alone proves neither Core target nor conformance. |
| Adapter version or revision | Package version where packaged, otherwise exact source revision | Adapter owner | Adapter behavior, operation support, fixture translation, or normalized observation handling changes | Claims MUST identify exact adapter identity; unknown adapters cannot support official claims. |
| Conformance profile ID | Stable profile ID defined below | Conformance governance | Included scope, capability floor, required vectors, or claim rules change | Unknown profile IDs MUST be rejected by profile-aware tooling. |
| Evidence revision | Immutable source revision or digest for the executed evidence set | Release/conformance governance | Any input artifact or command relevant to the evidence changes | Moving branch names are insufficient. |
| Release artifact identity | Commit, approved tag, generated artifact digests, and checksum manifest | Release governance | Closure, correction, revocation, or artifact regeneration | Unverified identities MUST NOT be presented as release evidence. |

The current compatibility matrix is:

| Artifact | Draft 0.6 accepted relationship |
| --- | --- |
| Core `draft-0.6` to manifest/vector format `0.1` | Compatible. Draft 0.6 does not require a format bump unless Milestone D introduces a syntax or member-semantics change. |
| Runner `@finkore/conformance-runner` `0.1.0` to manifest/vector format `0.1` | Supported for current unprofiled execution. Profile-aware claim emission remains pending TASK-251. |
| TypeScript and Python package `0.1.0` to Draft 0.6 work | Package versions remain independent; no package version implies Draft 0.6 conformance. |
| Java package `0.1.0` to Draft 0.6 work | Money scope can support the Money profile; Java non-Money remains unsupported until implemented and proven. |
| Agentic documentation to Draft 0.6 | Canonical operation IDs remain stable. No Draft 0.8 machine-readable operation manifest is created in Draft 0.6. |

## Change Classes and Deprecation Policy

Every material change to a governed artifact MUST be classified before release.

| Class | Meaning | Version and review effect |
| --- | --- | --- |
| `EDITORIAL` | Wording, formatting, or navigation change with no observable or compatibility effect. | No identifier or format bump. Release notes may summarize; must not hide semantic change. |
| `ADDITIVE_COMPATIBLE` | Adds new optional behavior, metadata, vector coverage, or documentation without invalidating older compliant consumers. | Requires discovery rules. May add identifiers; MUST NOT reuse old identifiers. |
| `BEHAVIORAL_COMPATIBLE` | Clarifies or constrains documented meaning without changing any conforming observable outcome. | Requires evidence that outcomes remain compatible. Stable identifiers may remain if meaning is truly unchanged. |
| `DEPRECATING` | Keeps current behavior or identifier valid while announcing a replacement, migration, or retirement path. | Requires replacement or retirement rationale, support window, migration guidance, and release-note entry. Deprecation is not deletion. |
| `BREAKING` | A consumer, implementation, claim, vector, profile, artifact, or identifier valid under the previous contract may no longer be valid or faithfully interpreted. | Requires explicit release decision, compatibility impact, migration or supersession record, and normally a new version/profile/format identity. |

Stable requirement IDs, vector IDs, portable error codes, canonical operation
IDs, profile IDs, and release tags MUST NOT be silently reused for different
semantics. If a rule or artifact is superseded, the old identifier remains
historically traceable and the new meaning receives a new identifier or an
explicit supersession record.

Changed portable error conditions, normative serialization, operation semantics,
profile membership, or runner comparison meaning are semantic changes. They
cannot be classified as editorial.

Deprecation records MUST include:

- deprecated identifier or behavior;
- replacement or explicit no-replacement rationale;
- first release carrying the deprecation;
- minimum support window or removal gate;
- migration guidance and compatibility risk;
- affected conformance vectors, profiles, adapters, and documentation; and
- historical traceability location.

Pre-1.0 status permits incompatible change with proper classification. It does
not permit silent breakage, identifier reuse, stale claims, or undocumented
claim expansion.

## Conformance Profiles

Profiles are closed, reproducible scopes. A successful profile claim requires
every required vector in that profile to pass with zero failures, zero
unsupported results, and zero infrastructure errors.

Draft 0.6 reserves these stable profile ID forms:

| Profile kind | ID form | Included scope |
| --- | --- | --- |
| Full Core profile | `finkore.core.draft0_6.full` | Every manifest-listed vector and every accepted Draft 0.6 profile requirement for the current Core scope. |
| Domain profile | `finkore.core.draft0_6.domain.<domain>` | Every manifest-listed vector in the named domain suite plus cross-cutting dependencies required by the domain profile. Current domains are `money`, `workflow`, `audit`, `approvals`, and `entities`. |
| Canonical operation profile | `finkore.core.draft0_6.operation.<operation-id>` | Every manifest-listed vector for the canonical operation plus input validation, portable-error, serialization, and cross-cutting requirement dependencies needed to make the operation claim faithful. |
| Historical release profile | `finkore.core.<release>.full` or `finkore.core.<release>.domain.<domain>` | Closed scope exactly as defined by the referenced historical release record. |

Profile IDs are stable compatibility identifiers. If profile membership or claim
rules change incompatibly, a new profile ID or release-qualified profile record
is required.

Current Draft 0.6 profile dispositions:

| Profile | Intended claimability after Milestone D/E proof |
| --- | --- |
| `finkore.core.draft0_6.full` | TypeScript and Python may claim only after full profile metadata, runner evidence, capability declarations, and final checks pass. |
| `finkore.core.draft0_6.domain.money` | TypeScript, Python, and Java may claim only after Money profile metadata, accepted floor proof, and final checks pass. |
| Non-Money domain profiles | TypeScript and Python may claim after proof; Java MUST report unsupported unless implemented and proven. |
| Operation profiles | Claimable only for canonical `finkore.*` operations. Conformance-local labels are not capability profiles unless separately promoted. |

Filters, command-line suite selection, local skips, or partial manifests cannot
turn a partial run into a successful broader profile claim. A profile-aware
runner may execute a subset only when the selected profile metadata defines that
closed subset.

## Evidence-Based Claims

A conformance claim is a recorded evidence statement, not a capability
advertisement. A successful Draft 0.6 claim MUST identify at least:

- claim schema version once schemas exist;
- profile ID and included scope;
- FinKore Core version;
- conformance manifest format and vector-file format;
- manifest identity, vector-file identities, and evidence revision or digest;
- implementation name, language, package version, source revision, and artifact
  identity where applicable;
- adapter name, version or revision, and operation-support scope;
- runner version and execution command;
- toolchain identities, including Node/npm and language runtimes;
- declared numeric/allocation capability limits relevant to the profile;
- pass, fail, unsupported, and infrastructure-error counts;
- coverage, mutation, or accepted equivalent quality evidence when claiming
  official/reference implementation quality;
- timestamp of evidence recording as release evidence, not as a domain input;
  and
- checksum or signature fields required by the release provenance policy.

Claim wording templates:

```text
<Implementation> conforms to <profile-id> for FinKore Core <core-version>
using conformance manifest format <manifest-format> and vector-file format
<vector-format>, with <pass> passed, 0 failed, 0 unsupported, and 0
infrastructure errors, under evidence revision <revision>.
```

```text
<Implementation> exposes <capability set> but has no successful conformance
claim for <profile-id>. Capability advertisement is not conformance evidence.
```

```text
<Implementation> does not claim <profile-id>; unsupported scope:
<unsupported-domains-or-operations>.
```

Historical claims remain true only for their recorded inputs. A later manifest,
profile, implementation, adapter, or toolchain does not update a historical
claim unless a new evidence record is produced.

## Implementation Capability Declarations

A Draft 0.6 capability declaration lets clients discover available operations
and limits. It is not proof.

A capability declaration contract MUST include:

- declaration schema version once schemas exist;
- implementation identity, language, package version, source/artifact identity;
- targeted Core version or versions;
- exposed canonical `finkore.*` operations;
- known unsupported domains and operations;
- supported profile IDs, if any, with an explicit statement that support is not
  a pass claim unless linked to claim evidence;
- numeric and allocation limits, including whether they meet or exceed the
  Draft 0.6 portable floor;
- adapter availability and adapter identity when conformance execution is
  supported;
- optional links or digests for conformance evidence;
- generated-at or recorded-at timestamp as metadata only; and
- maintainer or release authority for the declaration.

Rules:

- A declaration MUST NOT advertise conformance-local operation labels as
  canonical capabilities.
- Missing capability metadata means unknown support, not supported behavior.
- Unknown declaration versions MUST be rejected by validators.
- Declared limits MUST NOT undercut a profile floor that the same declaration
  claims to support.
- Inconsistent declarations fail validation in Milestone D tooling.
- Stale declarations MUST NOT be used as release evidence unless their source
  and digest match the claimed artifact.

## Release Identity, Provenance, and Checksums

Draft 0.6 release evidence must be reproducible from exact inputs.

Required release identity:

- exact source commit;
- clean working tree status or an explicitly recorded qualified dirty state;
- approved immutable tag status;
- conformance manifest and vector identities;
- runner, adapter, implementation, and package identities;
- toolchain versions and installation source;
- execution commands used for claims;
- generated artifact list and whether each artifact is committed or generated;
- checksum manifest; and
- correction, revocation, or supersession records when applicable.

Immutable tag policy:

- Tag creation is closure-gated and requires explicit maintainer approval.
- The tag name for a closed Draft 0.6 release is `core-draft-0.6`.
- The tag SHOULD be annotated and include the Core version, source commit,
  checksum manifest digest, claim summary, and factual review/signing status.
- A tag MUST NOT be created from an unverified or uncommitted state.
- If approval is unavailable, Draft 0.6 remains open or records tag status as
  pending. The closure statement MUST NOT be used.

Checksum policy:

- Use SHA-256 unless a later accepted policy supersedes it.
- The checksum manifest MUST use deterministic path ordering, repository-root
  relative POSIX paths, lowercase hex digests, and explicit artifact kind.
- Generated artifacts must declare the command that reproduces them.
- Checksums identify bytes; they do not imply signing, certification,
  publication, external audit, or regulatory approval.

Corrections and revocations:

- A released artifact with an identified defect MUST receive a correction or
  revocation record instead of rewriting history.
- The record MUST identify affected claims, checksums, profiles, artifacts,
  replacement evidence if any, and compatibility impact.
- Superseded claims remain recoverable for historical traceability.

## Milestone C Acceptance Summary

TASK-244 through TASK-248 are accepted with this policy. Draft 0.6 still cannot
close until Milestone D encodes and validates the metadata and Milestone E
produces reproducible release evidence from the accepted contracts.
