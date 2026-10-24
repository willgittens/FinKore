# Third-Party Licenses

Third-party code, dependencies, generated outputs, and assets remain under their original licenses. FinKore's MPL-2.0 repository declaration does not override third-party licenses.

## Policy

- Third-party code must retain upstream copyright, license, and notice text.
- Vendored source code must be reviewed before introduction and must preserve its upstream notices.
- Dependencies must have licenses compatible with their intended use in FinKore.
- Dependency license metadata in lockfiles and package registries should be treated as third-party metadata, not FinKore-owned license declarations.
- Generated dependency reports may be used for release review; this file does not attempt to copy every dependency license.

## Current Repository Findings

No project-owned vendored third-party source files or assets were identified during the MPL-2.0 migration audit.

The repository contains npm dependencies under `node_modules/` and package-lock metadata. Those dependencies are third-party material and retain their own license declarations, including MIT-licensed dependencies where applicable.

## Learn Typography

The Learn home page and CoreDoc reader bundle the unmodified Aspekta variable
font in [learn/fonts/aspekta-variable.woff2](./learn/fonts/aspekta-variable.woff2),
sourced from the [Aspekta repository](https://github.com/ivodolenc/aspekta/tree/cd08efde1a0484c3626818ac59a6933e59f71531/packages/fonts/variable).
Copyright (c) 2025 Ivo Dolenc, with Reserved Font Name "Aspekta". The font is
distributed under the SIL Open Font License 1.1; the original copyright and
license are retained in [learn/fonts/OFL.txt](./learn/fonts/OFL.txt).
Both pages load this font locally without a font CDN.

## Requires Legal/License Review

No release-blocking third-party license issue was identified from repository evidence in this audit. This is not a full legal compliance opinion.
