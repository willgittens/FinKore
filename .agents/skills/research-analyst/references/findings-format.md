# Findings report

Maintain one `findings.md` beside `manifest.json`. This is a research notebook,
not a specification, release report, or substitute for later validation. Use
descriptive links and detailed paraphrases; resume without duplicating entries.

## Session and coverage

Record topic, original keywords/question, manifest session ID/path, creation and
update timestamps with timezone, and the current FinKore baseline and documents
actually read. State `partial` or `complete`, distinguishing full review from
completion of attempted access. Count unique manifest publications: total,
attempted, full-text reviewed, partially reviewed, abstract-only, metadata-only,
inaccessible, and pending. Count supplementary sources separately. Record total
findings, all `pending_validation`, and access/interpretation limits. If the
baseline changes, identify earlier mappings requiring review.

## Publication log

For each attempted publication retain its stable manifest ID, exact title,
DOI/version when known, attempted/read URLs, access date, source type/method when
known, reading extent, finding IDs and next action. Reading states are
`full_text_reviewed`, `partial_text`, `abstract_only`, `metadata_only`, and
`inaccessible`. Record a separate finding count, including zero. An accessible
PDF with only selected sections read is `partial_text`.

List all pending IDs or an unambiguous queue rule, such as all manifest IDs absent
from the log in manifest order. Keep retries of partial/inaccessible sources
explicit instead of repeatedly treating them as new work.

## Detailed findings

Give each finding an identifier such as `FND-0001`, never reused or renumbered.
Include:

1. **Title, kind, status.** Kind: `candidate_rule`, `discussion`,
   `failure_scenario`, or `open_question`. Status: `pending_validation`.
2. **Full description.** Explain the financial/control problem and the author's
   position in prose, with definitions needed by an independent reviewer.
3. **Basis.** Explicit statement, empirical observation, or analyst inference;
   explain the inferential step rather than disguising it as a quotation.
4. **Conditions and boundaries.** Jurisdiction, population, workload, assumptions,
   policy, exclusions, and evidence scope when relevant. Unknowns stay unknown.
   State when only an abstract or part of a paper was read.
5. **Evidence.** Manifest publication ID or supplementary-source ID, title, URL,
   locator, paraphrase and optional short verified quotation, plus access date.
   Label PDF physical pages separately from printed pages when both are known.
6. **Risk and observable scenario.** Failure avoided or tradeoff raised. Label
   analyst-created illustrations non-normative; do not invent financial
   calculations, portability requirements, or universal business policies.
7. **FinKore relationship.** Classification from the skill, actual clauses/IDs,
   their existing coverage, and uncertainties. A possible gap/conflict remains
   a review hypothesis, not an accepted requirement.
8. **Discussion and counterpoints.** Alternatives, tensions, contrary evidence,
   conditions that could change the conclusion, and source-quality limits.
   State when the source does not discuss them.
9. **Later validation questions.** Concrete source, scope, accounting/control,
   and specification questions. No candidate becomes approved here.

Preserve all supporting sources when merging a finding. Do not merge different
conditions or explicit/inferred interpretations. Retain dated corrections when
later reading contradicts earlier interpretations instead of deleting history.

End with the next reading queue and unresolved access/interpretation questions.
