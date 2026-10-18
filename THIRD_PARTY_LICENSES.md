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

The Learn page bundles the unmodified Manrope variable font in
[learn/fonts/manrope-variable.ttf](./learn/fonts/manrope-variable.ttf), sourced
from the [Google Fonts Manrope directory](https://github.com/google/fonts/tree/main/ofl/manrope).
Copyright 2018 The Manrope Project Authors. The font is distributed under the
SIL Open Font License 1.1; the original copyright and license are retained in
[learn/fonts/OFL.txt](./learn/fonts/OFL.txt). The page loads this font locally.

## Requires Legal/License Review

No release-blocking third-party license issue was identified from repository evidence in this audit. This is not a full legal compliance opinion.
