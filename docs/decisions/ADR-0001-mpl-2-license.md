# ADR-0001: Adopt Mozilla Public License 2.0 for FinKore

## Status

Accepted

## Context

FinKore is an open-source, specification-first project intended for broad adoption across financial software. The project needs a license that supports commercial and proprietary adoption while preserving an open improvement path for FinKore-covered files.

This decision record is project policy context, not legal advice.

## Decision

FinKore adopts the Mozilla Public License 2.0 (`MPL-2.0`) for project-owned repository content, unless a file states otherwise.

The root `LICENSE` file contains the authoritative MPL-2.0 license text. Human-readable policy lives in `LICENSING.md`.

## Alternatives Considered

### MIT

Pros: extremely permissive, minimal friction, broad adoption.

Reason rejected: MIT gives the project very little leverage to keep modifications to FinKore itself open.

### Apache-2.0

Pros: permissive, enterprise-friendly, explicit patent provisions.

Reason not selected: modifications may generally remain proprietary.

### LGPL

LGPL provides a weaker copyleft model oriented around library linking. FinKore preferred MPL-2.0's file-level simplicity for the repository's specification, runner, adapter, and implementation architecture.

### GPL/AGPL

GPL and AGPL provide stronger copyleft and potentially stronger commons protection. AGPL addresses network interaction in ways MPL-2.0 does not.

Reason not selected: adoption is FinKore's highest strategic priority, and stronger copyleft may create greater enterprise and legal adoption friction.

### MPL-2.0

MPL-2.0 was selected because it combines file-level copyleft for covered files with practical compatibility for commercial and proprietary larger works.

## Consequences

- Package and repository metadata should identify FinKore-owned code as `MPL-2.0`.
- Project-owned TypeScript source should carry SPDX identifiers.
- Third-party notices must be preserved.
- Explanatory documentation must not add restrictions beyond MPL-2.0.
- Future commercial offerings can coexist with the open-source core without revoking rights already granted under MPL-2.0.

## Risks

- Significant future external contributions could complicate future relicensing without a contributor-rights policy.
- Specification and documentation licensing may deserve a dedicated future decision.
- A formal trademark policy is still needed before major ecosystem adoption.
- This ADR is not a legal ownership review.

## Follow-Up Decisions

- Decide whether to adopt a CLA, Developer Certificate of Origin, or another contribution attestation model.
- Decide whether specifications, conformance material, and documentation should remain under MPL-2.0 or move to a dedicated documentation/specification license.
- Establish a formal trademark policy.
- Clarify copyright-holder identity and attribution policy.
- Define any future Enterprise or commercial licensing architecture.
