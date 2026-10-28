# Contributing to FinKore

You can help FinKore by making a financial rule easier to understand or review.
Useful contributions include:

- Clarifying documentation, fixing a link, or improving a reading path.
- Reviewing a requirement for ambiguity or inconsistency with CoreDoc.
- Reporting an undefined result with explicit inputs and its financial impact.
- Adding portable acceptance cases for existing requirements, including failure,
  boundary, and mutation-sensitive cases.
- Improving the domain-neutral tools that validate repository artifacts.

FinKore is specification-first. Consumer financial implementations and execution
tools belong in consumer repositories.

## Make your first contribution

1. Choose one concrete problem. A confusing paragraph or broken link can be a
   small first change; explain what the reader needs to understand.
2. Read the relevant sources using the repository map below. For financial
   behavior, read CoreDoc, the owning specification, related manifest-listed
   vectors and traceability, then applicable Agentic metadata.
3. Use Issues on the [GitHub project](https://github.com/willgittens/FinKore) for
   ordinary defects and concrete proposals, and Discussions for questions or
   early ideas. Discuss behavior changes before selecting new semantics. A small
   editorial fix can go directly to a Pull Request. Potentially exploitable
   findings follow the [Security Policy](SECURITY.md) privately.
4. Fork the repository, clone your fork, and create a focused branch, for example
   with `git switch -c docs/clarify-reading-path`.
5. Make the change in its canonical source. For a Markdown source that feeds
   Learn, regenerate the HTML and include both source and output in the same PR.
6. Run the checks below and review the diff, including generated content. For
   Learn changes, review desktop and mobile reading, keyboard navigation,
   section links, tables, code, and horizontal overflow.
7. Push your branch to your fork and open a Pull Request into `main`. Explain
   the problem, resulting behavior or wording, affected requirements when
   applicable, and validation performed. Link any related Issue and respond to
   review comments.

### Find the source

| Directory | Responsibility |
| --- | --- |
| `docs/coreDoc/` | Foundation-level financial obligations and their governance metadata. |
| `spec/` | Precise normative behavior, stable requirement IDs, invariants, and portable errors. |
| `conformance/` | Manifest, schemas, portable acceptance cases, consumer guidance, and traceability. |
| `agentic/` | Canonical operation semantics and safety metadata for machine clients. |
| `docs/tools/` | Domain-neutral maintenance tools, their tests, and verification guidance. |
| `learn/` | The public introduction, generated document readers, and local presentation assets. |

Edit canonical Markdown before regenerating its Learn reader. The
[source-to-reader table](docs/tools/README.md#markdown-sources-and-learn-readers)
lists the mappings. `learn/index.html` has its own editorial content and a marked
CoreDoc index generated from `docs/coreDoc/core-doc.md`; update that block through
its source or renderer. Other generated readers are updated through their
Markdown sources or renderers, not by editing the output HTML.

### Set up and verify

The maintenance tools require **Node `>=24.11.0 <25`**. Check your runtime first:

```bash
node --version
npm --version
```

If the runtime is missing or outside that range, follow the
[supported Node setup](docs/tools/README.md#supported-node-setup), including the
repository-local `.tools` option, before running npm commands.

For a source that feeds Learn, run this workflow from the repository root:

```bash
npm ci --no-audit
npm run learn:build
git diff --check
git diff
npm run verify
```

Review the generated diff before submitting it with the source. For changes
that do not affect Learn sources, CSS, or renderers, omit `npm run learn:build`.
Each full build refreshes the CSS cache version across all Learn pages; include
those generated URL changes when submitting a CSS-only update too.
See [editing Learn pages](docs/tools/README.md#editing-learn-pages) for details.

The same `npm run verify` command runs locally and in GitHub Actions. It checks
published artifacts and maintenance tools; it does not execute financial
operations against a consumer implementation. Run `npm run dependencies:audit`
as a separate network-backed dependency review when the release or maintenance
task requires one.

### Editorial fixes and behavior proposals

An editorial correction improves wording or navigation while preserving every
observable result, stable identifier, and CoreDoc evolution field. Follow
SPEC-COMPATIBILITY-011 and synchronize any affected Learn readers.

A behavior proposal begins with the domain problem and CoreDoc alignment. State
the inputs, current requirement, expected observation, and financial or control
impact. If the result is undefined, report the gap rather than choosing semantics
from a fixture or a language default. Follow the coordinated review below before
changing portable expectations.

## Open contributions and maintainer authority

Anyone may fork FinKore, open Issues, participate in Discussions, propose
modifications, review and challenge specifications, and submit Pull Requests.
Lead maintainer `@willgittens` retains final integration authority.

[CODEOWNERS](.github/CODEOWNERS) assigns repository-wide review ownership to
`@willgittens`. It documents responsibility and requests reviews; it does not
grant or restrict merge permissions. Potentially exploitable technical or
financial specification defects must follow the [Security Policy](SECURITY.md)
for private reporting rather than public Issues or Discussions.

## Compatibility and coordinated review

An accepted normative correction must update its owning specification,
conformance vectors or traceability, applicable Agentic metadata, public
documentation, and any affected repository-maintenance tests in the same
change. When observable behavior changes, document the compatibility and
consumer migration impact. Consumer-owned implementation changes and execution
evidence belong in consumer repositories and are not a same-commit prerequisite
for this repository.

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

## Licensing of Contributions

FinKore community source code is licensed under the Mozilla Public License 2.0 (`MPL-2.0`). By submitting a contribution to an MPL-2.0-covered portion of FinKore, you agree that the contribution is submitted under the licensing terms applicable to that portion of the repository, unless explicitly agreed otherwise in writing.

Do not remove or alter required license notices, third-party notices, or SPDX identifiers. If your contribution includes or derives from third-party material, disclose that provenance clearly in the pull request or issue.

This project does not currently require a Contributor License Agreement or copyright assignment. Future contributor-rights governance remains an open decision; see [Contributor Licensing](./docs/governance/contributor-licensing.md).

Nothing in this document is legal advice.

## Maintainer responsibilities

The remaining sections cover repository administration and stable publication.
They are maintained by the lead maintainer; contributors can submit a PR using
the workflow above without configuring upstream access or preparing a release.

### Manual GitHub configuration

The maintainer must configure these settings in GitHub; repository files do not
activate Rulesets or change access permissions:

1. Under Settings → Collaborators and any applicable organization access
   settings, verify that only `@willgittens` has administrative or merge
   authority. Review direct access, inherited roles, installed Apps, deploy
   keys, and automation that can write to `main`. Community participation does
   not require upstream write access.
2. Under Settings → Rules → Rulesets, create or activate a branch Ruleset
   targeting `main`. Require a Pull Request and the exact status check
   **Verify repository** from GitHub Actions after its first successful run.
   Block force pushes and branch deletion. Keep the approval count at zero
   and code-owner approval disabled so the sole maintainer can merge their own
   Pull Requests. Give this verification Ruleset no bypass actors.
3. If additional upstream writers are introduced, use a separate `main`
   Ruleset with **Restrict updates**, allowing only the lead maintainer's role
   to bypass it **for Pull Requests only**. Verify that the bypass role contains
   only `@willgittens`. Keep this restriction separate from the verification
   Ruleset so it does not bypass CI. Reassess access if that role gains members.
4. Under Settings → Actions → General, permit the workflow and its two official
   actions, retain a read-only workflow token, and keep write tokens and secrets
   unavailable to fork PR workflows. Review fork-workflow approval settings.
5. Under Settings → Advanced Security, confirm Private Vulnerability Reporting
   is enabled and the repository's Security → Advisories page offers **Report a
   vulnerability**. If unavailable, follow the fallback in the Security Policy
   before considering private reporting operational.
6. Once these files are on `main`, check that GitHub recognizes
   `.github/CODEOWNERS` without errors and shows `@willgittens` as owner for a
   specification file and the workflow. Review requests use the base branch's
   CODEOWNERS; authors do not receive requests to review their own PRs.

### Working plans and published guidance

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
The publication checker has one explicitly selected Core target version;
review and update that target with its tests for each release rather than
accepting whichever version strings happen to agree across a tree.

### Stable release procedure

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
tag on that commit (for example, `core-2.0.2`). Confirm the tag targets the
verified commit and that the working tree is clean. Distribute only
tracked release content, excluding local checkout state. Remote tag publication
is a separate maintainer action; a local tag does not imply a remote release.
Core publication does not publish implementation packages or a runner.
