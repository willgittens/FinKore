# Contributing to FinKore

FinKore is specification-first. Contributions should begin with the portable
financial behavior being proposed, then connect that behavior to specification
requirements, conformance vectors, traceability, and Agentic metadata where
applicable. Consumer implementation work remains outside this repository.

An accepted normative correction must update its owning specification,
conformance vectors or traceability, applicable Agentic metadata, public
documentation, and any affected repository-maintenance tests in the same
change. When observable behavior changes, document the compatibility and
consumer migration impact. Consumer-owned implementation changes and execution
evidence belong in consumer repositories and are not a same-commit prerequisite
for this repository.

For a meaningful contribution, install the locked maintenance dependency and
run the local repository checks:

```bash
npm ci --no-audit
npm run verify
```

Run `npm run dependencies:audit` as a separate network-backed dependency review
when the release or maintenance task requires one. Neither artifact validation
nor dependency review is financial conformance execution.

## Licensing of Contributions

FinKore community source code is licensed under the Mozilla Public License 2.0 (`MPL-2.0`). By submitting a contribution to an MPL-2.0-covered portion of FinKore, you agree that the contribution is submitted under the licensing terms applicable to that portion of the repository, unless explicitly agreed otherwise in writing.

Do not remove or alter required license notices, third-party notices, or SPDX identifiers. If your contribution includes or derives from third-party material, disclose that provenance clearly in the pull request or issue.

This project does not currently require a Contributor License Agreement or copyright assignment. Future contributor-rights governance remains an open decision; see [Contributor Licensing](./docs/governance/contributor-licensing.md).

Nothing in this document is legal advice.
