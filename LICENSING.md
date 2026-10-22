# FinKore Licensing

This document explains the FinKore licensing baseline for maintainers, contributors, adopters, and reviewers.

This document is an explanatory project policy and is not a substitute for the Mozilla Public License 2.0 itself. In case of conflict, the [LICENSE](./LICENSE) file controls.

Nothing in this repository's documentation constitutes legal advice. Consult the license and qualified legal counsel for specific cases.

## FinKore Community Licensing

FinKore's project-owned repository materials are licensed under the Mozilla Public License 2.0 (`MPL-2.0`), unless a file states otherwise.

MPL-2.0 is a file-level copyleft license. In plain technical terms, FinKore may be used commercially and may be incorporated into proprietary products, subject to the terms of MPL-2.0. Proprietary code surrounding FinKore does not automatically become MPL-licensed merely because it interoperates with FinKore or is distributed with FinKore. Under MPL-2.0, modifications to MPL-covered files that are distributed outside the organization remain subject to MPL requirements. Purely internal organizational use generally does not create the same source-disclosure obligations as external distribution.

The `LICENSE` file is authoritative.

## Repository Scope

Unless a file states otherwise, project-owned source code, specifications, conformance vectors, agentic contract material, tests, scripts, and documentation in this repository are covered by MPL-2.0.

FinKore publishes a language-independent financial specification, conformance artifacts, the Agentic Contract, and repository-maintenance tooling. It does not maintain a financial implementation, a Conformance Runner, a runner adapter API, or installable language packages. Consumers own their implementations, integrations, and execution of conformance cases. See the [implementation guide](./docs/implementation-guide.md).

JavaScript maintenance source files owned by FinKore carry:

```js
// SPDX-License-Identifier: MPL-2.0
```

Files that cannot practically carry comments, such as JSON conformance vectors and package metadata, are covered by the nearest applicable repository licensing declaration. Generated build output and dependency directories are not edited by hand and should not be treated as the preferred source form.

FinKore contains specifications and documentation as well as software. Those materials currently share the repository-level MPL-2.0 baseline unless a file says otherwise. A dedicated documentation or specification license, and any additional patent policy for implementations, require separate governance decisions. This document adopts neither and does not expand the patent grants in MPL-2.0 Section 2.

## Why FinKore Uses MPL-2.0

FinKore wants to:

1. maximize adoption across banks, fintechs, SaaS products, ERPs, and other financial systems;
2. permit commercial and proprietary applications to build upon FinKore;
3. preserve MPL terms for covered repository files and their modifications when distribution obligations apply;
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

## Obligations for Banks and Other Adopters

Commercial use does not require royalties, sponsorship, a support purchase, or contributions to the upstream project. MPL-2.0 does not require an adopter to submit a pull request.

The main distinctions are:

| Use of covered materials | General MPL-2.0 consequence |
| --- | --- |
| Internal use or modification within an organization | Generally does not require disclosure of source or changes outside the organization. |
| External distribution in Source Code Form, including modified specifications, vectors, or maintenance scripts | Keep the covered material under MPL-2.0, inform recipients of the license and how to obtain it, preserve applicable notices, and do not restrict recipients' MPL rights. |
| External distribution in Executable Form containing covered material | Also make the corresponding covered Source Code Form available to recipients and explain how to obtain it by reasonable means in a timely manner, at no more than the cost of distribution. |
| Distribution alongside separate proprietary files containing no covered material | Those separate files may remain proprietary, subject to compliance for the covered portions. |
| Operating a service on the adopter's servers | Network access alone does not trigger a requirement to disclose the server source. Covered material delivered to users, including browser code or downloads, must be assessed separately as distribution. |

When source availability is required, the obligation is to the recipients of the distribution. MPL-2.0 does not require a public GitHub repository or submission to FinKore's maintainers. Recipients retain their MPL rights, including redistribution rights.

Copying covered material into a new file can make that file a Modification under MPL-2.0 Section 1.10. Separate filenames alone do not exempt copied material. Consult Sections 1 and 3 of [LICENSE](./LICENSE) and the [official Mozilla FAQ](https://www.mozilla.org/en-US/MPL/2.0/FAQ/) for definitions and distribution guidance. Transfers to contractors or other entities require assessment against the license's definition of "You" and the actual arrangement.

## Consumer-Owned Implementations

Writing original code to implement the behavior described by FinKore does not, by itself, automatically place that code under MPL-2.0. Distinguish implementing specified behavior from copying or adapting protected expression in repository files. Copied or adapted material may remain covered even when incorporated into a consumer-owned implementation. Specific cases depend on the material and applicable law.

FinKore's behavioral requirements and acceptance cases describe conformance to the selected financial contract. They do not add source-disclosure or payment conditions to the license. License compliance and financial conformance are separate questions.

MPL-2.0 provides the covered material without warranty and limits liability, subject to applicable law. Adoption and repository verification do not establish regulatory suitability, production readiness, or certification of a bank's implementation. The license does not grant general trademark rights; see [TRADEMARKS.md](./TRADEMARKS.md).

## Practical Examples

Example A: a bank reads the Money specification and writes its own original implementation without copying protected repository content. Following the specified behavior alone does not automatically require the implementation to use MPL-2.0.

Example B: a bank uses FinKore conformance vectors internally to check its proprietary implementation. That internal use does not require it to publish its implementation or its private changes to the vectors.

Example C: a vendor modifies covered specification or vector files and distributes them with a commercial product. The covered files remain under MPL-2.0 with the required notices. Separate proprietary files containing no covered material can remain under the vendor's chosen terms.

Example D: a vendor modifies a covered repository-maintenance script and distributes an executable form of it. It must make the corresponding covered source, including its changes, available to recipients under MPL-2.0 and tell them how to obtain it. This does not require a contribution to FinKore's upstream repository.

## FinKore Enterprise and Commercial Offerings

The maintainers may separately offer commercial services or products in the future, such as contract-maintenance support, implementation guidance, consulting, training, or enterprise tooling where legally appropriate. These possibilities do not describe currently maintained financial packages, execution services, or certification offerings.

The existence of commercial offerings does not revoke or reduce rights granted under MPL-2.0 for material already distributed under MPL-2.0.

Specific commercial offerings, if created, may be governed by separate agreements. FinKore does not currently document an active dual-license model. The licensing and governance structure is being designed so future commercial offerings can coexist with the open-source core.

## Third-Party Material

Third-party code, dependencies, and assets remain under their original licenses. FinKore's MPL-2.0 declaration does not override third-party licenses or notices. See [THIRD_PARTY_LICENSES.md](./THIRD_PARTY_LICENSES.md).

Vendored source code must retain upstream notices. Maintainers should review license compatibility before introducing vendored source code, generated third-party material, or substantial copied examples.

## Copyright Notices

A project name is not necessarily a legal person. Contributors normally retain copyright in their contributions unless another agreement says otherwise. See [Contributor Licensing](./docs/governance/contributor-licensing.md) for the current contribution terms and open governance decisions.

FinKore uses SPDX license identifiers where practical and preserves existing legally meaningful notices.

## License History

FinKore was previously distributed under the MIT License. The migration history is documented in [docs/governance/license-history.md](./docs/governance/license-history.md).
