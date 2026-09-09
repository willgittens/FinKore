# MPL-2.0 Migration Report

Migration date: 2026-09-09

## Summary

FinKore's current project-owned repository baseline was migrated from MIT to Mozilla Public License 2.0 (`MPL-2.0`). The migration added the official MPL-2.0 license text, human-readable licensing policy, contribution licensing guidance, third-party notice policy, trademark guidance, license history, an ADR, package metadata updates, source SPDX identifiers, and automated validation.

## Files Inspected

High-level areas inspected:

- root project metadata and README;
- package manifests and npm lockfiles;
- `runner/` source, tests, metadata, README, and package files;
- `implementations/typescript/core/` source, tests, README, and package files;
- `implementations/typescript/adapters/conformance/` source, tests, README, and package files;
- `spec/`, `conformance/`, and `agentic/` documentation and vectors;
- Git history and author summary;
- ignored/generated/dependency areas including `node_modules/`, `dist/`, `coverage/`, `reports/`, `.npm-cache/`, and `.tools/`;
- repository metadata locations including `.github/`, which was not present.

## Files Changed

Legal and policy:

- `LICENSE`
- `LICENSING.md`
- `NOTICE.md`
- `THIRD_PARTY_LICENSES.md`
- `TRADEMARKS.md`

Governance:

- `CONTRIBUTING.md`
- `docs/governance/contributor-licensing.md`
- `docs/governance/license-history.md`
- `docs/governance/MPL-2.0-migration-report.md`
- `docs/decisions/ADR-0001-mpl-2-license.md`

Source code:

- Project-owned tracked TypeScript files under `runner/`, `implementations/typescript/core/`, and `implementations/typescript/adapters/conformance/` received `SPDX-License-Identifier: MPL-2.0` headers.

Package metadata:

- `package.json`
- `package-lock.json`
- `runner/package.json`
- `runner/package-lock.json`
- `runner/package.json.orig`
- `implementations/typescript/core/package.json`
- `implementations/typescript/adapters/conformance/package.json`

Documentation and automation:

- `README.md`
- `.gitignore`
- `scripts/check-license.js`

## Licensing Exceptions

No project-owned alternate-licensed files were identified.

Dependency directories, generated build output, coverage reports, mutation reports, npm cache content, and toolchain binaries are not treated as project-owned source for this migration.

JSON conformance vectors and package metadata do not carry inline SPDX comments because comments would be invalid JSON. Markdown specification and documentation files are covered by the root licensing policy unless a file states otherwise.

## Third-Party Code Discovered

No project-owned vendored third-party source files or assets were identified.

npm dependencies under `node_modules/` and dependency license metadata in lockfiles remain third-party material. Those dependency license declarations were not replaced.

## Relicensing Ownership Observations

Git history reviewed during this migration shows commits authored by Will Gittens using `will@betridee.com`. This observation is repository evidence only and is not a definitive legal ownership conclusion.

No obvious external copyrighted source notices were identified in project-owned tracked files.

## Automated Validation

`npm run license:check` runs `scripts/check-license.js`.

The check validates:

- root `LICENSE` starts with the MPL-2.0 title;
- root and workspace package manifests declare `MPL-2.0`;
- tracked project-owned TypeScript files outside generated output carry the SPDX header;
- obsolete MIT references are limited to documented historical or dependency metadata exceptions.

## Remaining Human Decisions

- Whether FinKore should adopt a CLA, Developer Certificate of Origin, or another contributor-rights mechanism.
- Whether specifications, conformance material, and documentation should eventually use a dedicated documentation/specification license.
- Formal trademark policy.
- Copyright-holder identity and attribution policy.
- Enterprise/commercial licensing architecture.
- Legal review before major commercial adoption or external relicensing decisions.

## Requires Legal/License Review

No release-blocking third-party license issue was identified from repository evidence. This report is not a legal opinion.

## Verification Performed

- Repository-wide licensing searches before and after migration.
- Git history and author summary review.
- Official MPL-2.0 text sourced from Mozilla's plain-text MPL 2.0 page.
- Package metadata refresh with npm package-lock generation.
- License validation with `npm run license:check`.
- Normal project build, strict TypeScript checks, and unit tests.

Mutation testing was not part of the licensing behavior change and was not required to validate financial semantics for this migration.
