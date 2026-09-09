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

## Requires Legal/License Review

No release-blocking third-party license issue was identified from repository evidence in this audit. This is not a full legal compliance opinion.
