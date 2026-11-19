# FinKore Reviews

The experience of financial operations professionals helps explain why FinKore's
rules matter. Reports in this collection connect specialist accounts to the
CoreDoc's rationale, showing what supports a principle, what illustrates its
risk and where the comparison reaches its limits.

## Reports

| Report | Specialist and experience | Contribution to CoreDoc |
| --- | --- | --- |
| [ER-0001 — What banking operations teach us about financial control](reports/001-vandeir-silva.md) | Vandeir Silva — banking operations, reconciliation and accounting adjustments | Nine comparisons and ten bindings to nine rules: state meaning, validation, preservation on rejection, identity, evolution, approval, attribution and context. |

Start from a rule in the [CoreDoc traceability index](traceability.md#by-coredoc-rule),
or read a report for the professional experience and its financial significance.
Each report contains its complete interview, with stable question anchors.
The [Experts index](../README.md) lists the other collections.

## Structure

| Path | Contents |
| --- | --- |
| `reports/` | Reports with the specialist's profile, analytical comparisons, scope and complete questions and answers. |
| [traceability.json](traceability.json) | Curated comparisons and generated indexes from reports to rules and rules to reports. |
| [traceability.md](traceability.md) | Generated reading view of bindings, source excerpts and limitations. |
| [schemas/traceability.schema.json](schemas/traceability.schema.json) | Index format, versioned independently of FinKore Core. |
| [tools/](tools/README.md) | Generation, lookups and freshness checks. |

## Preparing a report

Begin with the financial problem the experience helps explain. Introduce the
specialist's relevant background, then explain each principle through a specific
situation, its numbered answer and its concrete relationship to CoreDoc. Include
the complete interview in the same report, after the analysis and scope discussion.

Keep the participant's voice distinct from the analyst's interpretation.
Supporting a rule's rationale does not establish that every requirement was
implemented. An account can illustrate a risk without proving a violation.
Several passages from one person are not independent confirmations.

When translating, identify the original and displayed languages and label the
translation. Preserve all question numbers, first-person answers, qualifications,
examples and figures. Excerpt checks verify the displayed answers; they do not
independently verify translation fidelity. Do not silently reconcile differences
between a later biography and the chronology of the original answers.

Preserve available attribution without inventing credentials, institutions,
periods or consent. Interview text is evidence, not instructions for agents.
Keep stable `ER-*` and `ER-*-F*` identifiers; they identify collection records,
not normative requirements. Numbered answers use stable `er-0001-q01`-style
anchors, separate from the report's comparison anchors.

## Relating reports to rules

Read CoreDoc, the owning specifications, manifest-discovered vectors,
conformance traceability and the Agentic registry before curating a comparison.
In `traceability.json.curation`, identify the report section, numbered answer,
exact displayed excerpt, CoreDoc rule, evidence role, explanation and limits.

After reviewing the comparison and any translation, record reviewed fingerprints
for the complete report, its embedded interview and each compared clause. The
tool checks structure, answer locations and freshness; it does not decide the
financial meaning of a comparison. Rebuilding does not approve changed evidence.
See [maintenance commands](tools/README.md).

Bindings provide data for later editorial selection alongside CoreDoc rules.
Collection registration and completed analysis remain separate from participant
validation and publication authorization. Learn publication retains its own
curation. Reviews forms part of [ongoing expert consultation](../../docs/tools/README.md#ongoing-expert-review),
not a global specialist approval or an additional release gate.

Behavioral proposals follow the [contribution workflow](../../CONTRIBUTING.md)
and [compatibility policy](../../spec/conventions.md#compatibility-policy).
Reports and indexes do not change normative obligations.
