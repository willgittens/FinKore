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

## Compatibility and coordinated review

Use the [specification compatibility policy](spec/conventions.md#compatibility-policy)
to classify changes and preserve published identifiers, portable errors,
operation contracts, and serializations. Retired requirement identifiers remain
unavailable for reuse; consult Git history and the
[release notes](docs/releases/README.md) before assigning an identifier.

For a retirement, review the exact requirement diff, remove obsolete active
references and traceability rows, and recompute inventory totals. Preserve all
continuing obligations and keep original definitions in Git history. Record the
sunset and compatibility impact concisely under Unreleased in the existing
release notes, then include that note in the release entry when released.

Editorial changes follow SPEC-COMPATIBILITY-011. A changed observable result
needs specification-first review and coordinated artifact updates as described
above, even when discovered while adding a regression case.

For the stable Core contract, patch releases contain compatible clarifications,
tooling fixes, documentation corrections, and defects that do not redefine the
contract. Minor releases add backward-compatible behavior or independent
domains. Incompatible changes to existing requirements, errors, operations, or
serializations require a new major Core release. Manifest and vector syntax
versions remain separate from Core versions.

New financial behavior follows specification-first review, portable acceptance
cases, traceability, and Agentic metadata where applicable. Review positive,
negative, boundary, failure-atomicity, and mutation-sensitive cases alongside
local artifact verification. Ledger posting, Payments, Tax, Reconciliation, and
other deferred domains need an explicitly accepted scope before development;
they do not enter stable maintenance work implicitly.

## Working plans and published guidance

Working plans are temporary development material. Preserve their reviewed state
in ordinary Git history before removing completed or superseded plans. Do not
copy them to an archive or release attachment. Only an active execution plan may
remain during development; remove it before stable publication once enduring
procedures are in existing contributor and tool guidance. Published artifacts
and verification must not require plans. Keep concise release summaries in
`docs/releases/README.md`; detailed development history remains in Git.

Stable publication also requires `npm run release:check` after normal local
verification. During preparation, use `npm run release:check -- /path/to/tree`
on a disposable proposed-release copy. After final status updates and removal
of the last working plan, repeat it on the actual final tree before tagging.
Passing development verification does not waive this gate or the separate
release dependency audit. See [publication checks](docs/tools/README.md#stable-publication-gate)
for status conventions, permitted historical metadata, and Learn review.

## Stable release procedure

Finish the normative, conformance, Agentic, and documentation reviews before
tagging. Preserve stable identifiers and CoreDoc evolution metadata, retain
explicit coverage limitations, and resolve any blocking specification gap.
Review the proposed tracked file list for credentials, generated reports, local
toolchains, copied development material, and obsolete implementation or package
instructions. Check the Learn index's rendered layout and keyboard navigation.

After removing temporary plans, run a clean locked dependency install,
`npm run verify`, the separate network-backed `npm run dependencies:audit`, and
`npm run release:check` on the actual final tree. Record the advisory-query date
and dependency scope with the concise release summary in
`docs/releases/README.md`. Failed gates block tagging; artifact checks do not
establish consumer implementation conformance.

Commit the reviewed release tree, then create an annotated `core-<Core version>`
tag on that commit (`core-1.0` for the first stable baseline). Confirm the tag
targets the verified commit and that the working tree is clean. Distribute only
tracked release content, excluding local checkout state. Remote tag publication
is a separate maintainer action; a local tag does not imply a remote release.
Core publication does not publish implementation packages or a runner.

## Licensing of Contributions

FinKore community source code is licensed under the Mozilla Public License 2.0 (`MPL-2.0`). By submitting a contribution to an MPL-2.0-covered portion of FinKore, you agree that the contribution is submitted under the licensing terms applicable to that portion of the repository, unless explicitly agreed otherwise in writing.

Do not remove or alter required license notices, third-party notices, or SPDX identifiers. If your contribution includes or derives from third-party material, disclose that provenance clearly in the pull request or issue.

This project does not currently require a Contributor License Agreement or copyright assignment. Future contributor-rights governance remains an open decision; see [Contributor Licensing](./docs/governance/contributor-licensing.md).

Nothing in this document is legal advice.
