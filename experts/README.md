# FinKore Experts

Expert evidence helps question financial assumptions and compare the current
contract with academic findings, implementation choices and professional practice.
Start from the [unified rule index](traceability.md#by-rule) to find related
evidence across all four collections. These collections are non-normative:

| Collection | Evidence |
| --- | --- |
| [Code Evidence](code-evidence/README.md) | Bounded readings of commit-pinned public code and tests. |
| [Legacy](legacy/README.md) | Approved interviews about financial software engineering. |
| [Research](research/README.md) | Academic discovery, source readings and critical comparisons. |
| [Reviews](reviews/README.md) | Readable specialist reports and explicit, bidirectional comparisons with CoreDoc rules. |

The [global JSON index](traceability.json) is generated from local curation using
one comparison model. Each collection retains its source-specific validation;
shared utilities and commands live in [tools/](tools/README.md). Use
`npm run experts:build` to refresh the indexes and `npm run experts:check` to
check them without writing. An unavailable collection remains explicit.

Evidence does not create a requirement, establish implementation conformance or
imply specialist approval of an entire release. Proposed financial changes follow
the existing [specification-first workflow](../CONTRIBUTING.md).
