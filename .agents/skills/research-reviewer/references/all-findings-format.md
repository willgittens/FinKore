# Consolidated research review notebook

Maintain only `experts/research/allFindings.md`. Do not create a separate closure or
provenance report. This file is research evidence for later editorial and
specification decisions, not a FinKore normative artifact.

## Document-level context and inventory

Record creation/update timestamps with timezone, scope, original research themes,
current Core version and repository revision when available, files actually
consulted, access limitations, and overall `partial` or `complete` review status.
`complete` means every in-scope input finding has a completed evidence assessment
and a verified FinKore relationship (including explicit outside/deferred scope).
An unresolved source or baseline check leaves overall review `partial`, even when
all attempts are logged. Full-paper reading and maintainer acceptance are separate.

List every input pair with links relative to `experts/research/`, manifest session ID,
topic, finding count, and input change marker (for example a content hash). Do not
equate the number of publication IDs with the number of independent studies.

Maintain an origin inventory with these columns:

| Field | Meaning |
| --- | --- |
| Origin | Manifest session ID + original FND ID; local numbers are insufficient |
| Notebook | Relative file link and verified heading anchor when available |
| Publications | Stable manifest publication IDs; PUB aliases remain session-local |
| Consolidation | `REV-*` consideration IDs; one origin may contain several claims |
| Progress | `pending`, `reviewed`, or `limited`, with a reason for limitations |

Every original finding must be accounted for, including unsupported claims and
duplicates. A merged origin points to its consideration; it is not counted as an
additional independent result. Show totals of input origins, origins reviewed,
limited and pending, plus consolidated considerations, distinct verified studies,
and editorial readiness counts. Explain the counting unit for each total.

## Evidence catalog: stable `EVD-0001` identifiers

Store an evidence passage once, link it to all considerations it supports, and
never reuse an evidence ID for another passage. A record contains:

- **Study:** exact title, all verified author names, publication year, DOI or
  another stable ID, venue/type, and the version actually read. Unknown values
  are `null`; preserve title/author/date/DOI discrepancies with the manifesto.
- **Provenance:** session ID(s), stable publication ID(s), source notebook/PUB
  references, or an explicitly labeled supplementary primary source. Record
  whether sources are independent studies or alternative copies/editions.
- **Verified source:** direct publisher/repository URL, access date, and actual
  reading extent (`full_text_reviewed`, `partial_text`, `abstract_only`,
  `metadata_only`, or `inaccessible`). Include corrections/retraction status
  only to the extent checked; lack of a known notice is not a quality guarantee.
- **Exact original quotation:** a short blockquote checked against source text
  or the actual PDF page. Keep the original language and wording. If unverifiable,
  write `null` with a reason instead of a plausible reconstruction. A translated
  quotation is not an original quotation.
- **Locator:** physical PDF page (one-based), printed label, section, paragraph
  or table, and a page/anchor link when available. Unknown page labels are `null`.
  HTML without pagination uses section/paragraph and `null` for page numbers.
  A `#page=` URL is navigation, not independent proof of the page attribution.
- **Attribution/context:** whether the author states the claim, reports an
  observation, proposes a design, proves a conditional result, or cites another
  author. Explain the surrounding argument, limitations, and relevant population,
  jurisdiction, workload or assumptions without exceeding source word budgets.
- **Quote verification:** `verified` or `unverifiable`, with how it was checked.
  Track the total quoted words per underlying work, including other evidence
  records and repeated output; do not reset limits for another URL or finding.

An abstract may justify only a narrowly attributed statement about what its
authors report or propose. It cannot validate details of an unread experiment,
proof, deployment, compliance claim, or entire article. A bibliographic record
cannot substantiate a technical rule. Check unreliable OCR visually or retain
an unverifiable status. Use contextual paraphrase, not a longer copyrighted
excerpt, when the permitted quotation is too short to carry the argument alone.

## Considerations: stable `REV-0001` identifiers

Give each consideration a descriptive title and the following fields. Use enough
prose for a later Learn author to understand the reasoning without consulting the
conversation. Distinguish facts, source claims, and reviewer inferences.

1. **Origins and claim reviewed.** Link every original session/FND, state the
   precise proposition being tested, and preserve different conditions if an
   origin contains more than one claim. Include the original candidate kind.
2. **Evidence assessment.** Choose one disposition and explain the reasoning:
   - `supported`: the checked evidence supports this bounded proposition.
   - `supported_with_limits`: only a narrower proposition or conditional
     interpretation is supported; state the replacement wording and exclusions.
   - `not_supported`: the evidence read does not substantiate the proposition;
     absence of support does not prove it false.
   - `contradicted`: verified evidence conflicts with the proposition; identify
     the conflict and whether differing conditions could explain it.
   - `unverifiable`: access, attribution, version, quote, or context is unresolved.
3. **Evidence for reuse.** Reference `EVD-*` entries. Make the study's author,
   exact quotation, URL and page/section easy to reach from the consideration.
   Do not copy shared quotes repeatedly. Include counterevidence as well as
   supporting evidence, and separate independent studies from duplicate versions.
4. **FinKore comparison.** State relationship classification(s), actual clauses
   and stable IDs, and what those clauses cover. Link CoreDoc and the owning
   specification; then describe relevant conformance cases/traceability and
   Agentic metadata if consulted. Record an explicit reason when a layer is not
   applicable; unread or unavailable artifacts remain `unverified`. Do not infer
   financial semantics from fixture data or history.
5. **Brief benefit to FinKore.** Explain concretely whether the finding can help
   explain an existing obligation, demonstrate a failure scenario, clarify a
   boundary, motivate an open discussion, or suggest future evidence gathering.
   State when no defensible benefit is established.
6. **Conditions, risk and counterpoints.** Give a non-normative example and its
   control impact, assumptions, competing interpretations, and evidence limits.
   Say which implications are reviewer inferences rather than the author's words.
7. **Final reviewer consideration.** State the conclusion warranted now and
   remaining uncertainty. Distinguish explanation of existing behavior,
   application policy and a proposed normative change. Normative acceptance
   remains `pending_maintainer_decision` for any proposed change; leave the
   original notebooks' `pending_validation` states untouched.
8. **Learn reuse.** Choose `evidence_ready`, `needs_more_evidence`, or
   `not_recommended`. Give a short suggested angle and bounded wording in the
   reviewer's own words, clearly separate from the exact author quotation.
   Explain limits that a future page must preserve and any specialist review
   still needed. This is preparation for editorial review, not permission to
   publish or a claim that FinKore historically adopted the study's argument.
9. **Next action and revision.** Record concrete unresolved source, scope or
   contract questions, and date a substantive change to an earlier conclusion.
   Unsupported or contradicted claims remain visible with their disposition.

`evidence_ready` requires verified study identity/authors, an exact verified
quotation, a direct URL and a precise locator, supporting context appropriate
to the claim, and a checked current FinKore relationship. A narrower statement
can qualify only if its limitations remain explicit. Missing any of these makes
it `needs_more_evidence`; unsupported/contradicted propositions are
`not_recommended` as positive justifications, even if useful as cautions. None of
these labels certifies academic quality, legal compliance or financial behavior.
Retracted studies must not serve as positive justifications; retain the notice
and assess any historical or cautionary use explicitly. An unverified notice
status does not establish that a publication is free from corrections.

## End-of-file continuation

List remaining origin keys, limited reviews needing further evidence, and
baseline mappings needing recheck. State explicitly when the origin queue is
empty but reading or evidence remains incomplete. New source findings extend
the inventory on the next invocation; unchanged completed reviews retain IDs.
Do not start discovery, publication, specification editing or author contact as
a side effect of completing the report.
