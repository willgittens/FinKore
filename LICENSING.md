# FinKore Licensing

This document explains the FinKore licensing baseline for maintainers, contributors, adopters, and reviewers.

This document is an explanatory project policy and is not a substitute for the Mozilla Public License 2.0 itself. In case of conflict, the [LICENSE](./LICENSE) file controls.

Nothing in this repository's documentation constitutes legal advice. Consult the license and qualified legal counsel for specific cases.

## FinKore Community Licensing

The FinKore community source code is licensed under the Mozilla Public License 2.0 (`MPL-2.0`).

MPL-2.0 is a file-level copyleft license. In plain technical terms, FinKore may be used commercially and may be incorporated into proprietary products, subject to the terms of MPL-2.0. Proprietary code surrounding FinKore does not automatically become MPL-licensed merely because it interoperates with FinKore or is distributed with FinKore. Under MPL-2.0, modifications to MPL-covered files that are distributed outside the organization remain subject to MPL requirements. Purely internal organizational use generally does not create the same source-disclosure obligations as external distribution.

The `LICENSE` file is authoritative.

## Repository Scope

Unless a file states otherwise, project-owned source code, specifications, conformance vectors, agentic contract material, tests, scripts, and documentation in this repository are covered by MPL-2.0.

TypeScript source files owned by FinKore should carry:

```ts
// SPDX-License-Identifier: MPL-2.0
```

Files that cannot practically carry comments, such as JSON conformance vectors and package metadata, are covered by the nearest applicable repository licensing declaration. Generated build output and dependency directories are not edited by hand and should not be treated as the preferred source form.

FinKore contains specifications and documentation as well as software. This migration keeps those materials under the same repository-level MPL-2.0 baseline unless a file says otherwise. A future governance decision should evaluate whether specifications, CoreDoc, conformance requirements, and documentation should use a dedicated documentation or specification license such as an appropriate Creative Commons license.

## Why FinKore Uses MPL-2.0

FinKore wants to:

1. maximize adoption across banks, fintechs, SaaS products, ERPs, and other financial systems;
2. permit commercial and proprietary applications to build upon FinKore;
3. keep improvements to the FinKore-covered implementation itself within an open ecosystem when MPL obligations apply;
4. maintain low enough licensing friction for enterprise adoption;
5. establish a neutral open foundation capable of becoming an industry standard.

These are project goals and do not modify the terms of MPL-2.0.

## What MPL-2.0 Does Not Mean

MPL-2.0 does not mean:

- every application using FinKore must become open source;
- a proprietary ERP using FinKore must automatically publish its entire source code;
- commercial use is prohibited;
- selling software containing FinKore is prohibited;
- offering services involving FinKore is prohibited;
- FinKore has created an additional non-compete restriction;
- cloud vendors are prohibited from using FinKore merely because they are cloud vendors.

## Practical Examples

Example A: a proprietary financial application imports an unmodified FinKore package. The application can generally remain proprietary, subject to compliance with applicable MPL-2.0 obligations for the FinKore-covered components.

Example B: a company modifies an MPL-covered FinKore source file and distributes software containing that modification. Under MPL-2.0, obligations apply to that covered modification. Consult the license and legal counsel for specific distribution models.

Example C: a company creates completely separate proprietary files that integrate with FinKore. MPL-2.0's file-level copyleft generally applies to covered FinKore files rather than automatically relicensing separate proprietary files.

Example D: a company modifies FinKore only for internal organizational use. Internal or private use is generally different from external distribution under MPL-2.0, but specific cases should be checked against the license.

## FinKore Enterprise and Commercial Offerings

The maintainers may separately offer commercial services or products in the future, such as professional support, SLA-backed support, long-term support releases, security maintenance and backports, certified builds, enterprise tooling, migration assistance, consulting, training, or commercial extensions where legally appropriate.

The existence of commercial offerings does not revoke or reduce rights granted under MPL-2.0 for code already distributed under MPL-2.0.

Specific commercial offerings, if created, may be governed by separate agreements. FinKore does not currently document an active dual-license model. The licensing and governance structure is being designed so future commercial offerings can coexist with the open-source core.

## Third-Party Material

Third-party code, dependencies, and assets remain under their original licenses. FinKore's MPL-2.0 declaration does not override third-party licenses or notices. See [THIRD_PARTY_LICENSES.md](./THIRD_PARTY_LICENSES.md).

Vendored source code must retain upstream notices. Maintainers should review license compatibility before introducing vendored source code, generated third-party material, or substantial copied examples.

## Copyright Notices

This migration does not invent a corporate copyright holder. A project name is not necessarily a legal person. Contributors normally retain copyright in their contributions unless another agreement says otherwise.

FinKore uses SPDX license identifiers where practical and preserves existing legally meaningful notices.

## License History

FinKore was previously distributed under the MIT License. The migration history is documented in [docs/governance/license-history.md](./docs/governance/license-history.md).
