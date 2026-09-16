# Draft 0.6 Metadata

This directory contains the machine-readable Draft 0.6 metadata introduced by
Milestone D. These files encode compatibility, profile, capability, claim, and
release-evidence policy accepted in
`docs/draft-0.6-compatibility-claims-provenance-policy.md`.

The metadata references authoritative requirement IDs, vector suites, canonical
operation IDs, profile IDs, and artifact versions. It does not define financial
behavior and does not create the Draft 0.8 machine-readable Agentic operation
manifest.

Run from the repository root:

```bash
npm run metadata:check:draft0.6
npm run checksums:check:draft0.6
```

Profile-aware runner evidence can be produced with:

```bash
node runner/dist/cli/cli.js \
  --manifest conformance/manifest.json \
  --profiles conformance/draft-0.6/profiles.json \
  --profile finkore.core.draft0_6.domain.money \
  --adapter implementations/typescript/adapters/conformance/dist/adapter.js \
  --json
```

Current claim evidence commands:

```bash
npm run conformance:typescript:profile:full
npm run conformance:python:profile:full
npm run conformance:java:profile:money
```

Checksum metadata is generated deterministically with:

```bash
npm run checksums:generate:draft0.6
```

The checksum manifest excludes `checksums.json` itself to avoid a circular
digest. Its current status is resolved by the approved immutable
`core-draft-0.6` tag identity; the tag object records the exact source commit
and checksum manifest digest.
