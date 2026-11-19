---
name: research-reviewer
description: Critically review existing FinKore research findings against original sources and the current repository contract, consolidating attributable evidence and considerations for future Learn pages in experts/research/allFindings.md.
---

# FinKore Research Reviewer

Review the Research Analyst's findings, not every publication in the discovery
corpus. Reopen the supporting sources, test the interpretation against their
context and the current FinKore contract, and maintain one consolidated research
notebook at **`experts/research/allFindings.md`**. This is an evidence-review stage;
its conclusions do not accept financial requirements or publish Learn content.

## Establish the review queue

- Locate FinKore from the working directory or the repository path supplied by
  the user. Read its `AGENTS.md`. Never hard-code session paths or topics.
- Accept explicit manifest/session paths when supplied. Otherwise discover all
  `experts/research/manifests/*/manifest.json` files with a sibling `findings.md`.
  Review all paired notebooks by default; multiple sessions do not require a
  selection question. List unmatched manifests as missing input. If no pair
  exists, ask for the input location instead of starting academic discovery.
- Read each manifest and notebook, plus `queries.json` when needed to interpret
  scope. Inventory **every finding**, including discussions, failure scenarios,
  open questions, and candidates. Current notebooks use both `## FND-*` and
  `### FND-*` headings and both `Estado` and `Status`; do not assume one format.
- Resolve each local `PUB-*` through its notebook to the stable publication ID
  in that session's manifest. Source titles may be in a separate `Título` field.
  Finding IDs and PUB numbers are local: identify an origin by
  **manifest session ID + finding ID + notebook path**. Identical `FND-0001`
  labels from different sessions must never overwrite one another.
- Read existing `allFindings.md` before writing. Preserve its stable `REV-*` and
  `EVD-*` IDs and prior substantive conclusions. Resume pending work, and recheck
  entries affected by changed inputs or a changed FinKore baseline. Do not silently
  remove missing origins or regard a previous review as permanently current.
- Unless the user bounds the invocation, cover all queued findings. Initialize
  the complete input inventory before research and checkpoint after each finding.
  Count findings separately from manifest publications and independent studies.

## Verify the evidence

1. Treat the original findings as hypotheses and navigation aids, not evidence
   that their claims, quotations, metadata, or FinKore mappings are correct.
   Review counterarguments and sources that could narrow or contradict them.
2. Open the publisher, author repository, standards body, or institutional full
   text with web tools. Use targeted title/DOI searches for legitimate copies
   when necessary. Confirm title, **authors' full names**, DOI, date, edition,
   publication type, corrections/retraction notices when available, and the
   version actually read. Record conflicts with discovery metadata; do not
   silently repair a manifest or combine editions.
3. Read the passage and surrounding argument, and the method, definitions,
   assumptions, results, or limitations needed for the particular claim. Inspect
   a PDF page image when layout, OCR, a table, or a formula affects interpretation.
   Report the actual extent read. Access to a PDF is not full-text review.
4. For every usable consideration retain at least one **short, contiguous,
   exact quotation in its original language**, verified directly in that version.
   Preserve wording, case, punctuation, and attribution. Do not turn a paraphrase,
   translation, reconstructed OCR, or search snippet into a quotation. Keep any
   Portuguese translation outside the quote and label it as a translation.
5. Record a direct link and a verifiable locator: physical PDF page (one-based),
   printed page label when verified, and section/paragraph/table. For unpaginated
   HTML, record page numbers as `null` and use a heading, paragraph, or anchor.
   Never substitute a browser line number for a study's page number.
6. Keep the quote short enough for applicable quotation limits (normally no more
   than 25 quoted words from one non-lyrical web source across the entire output).
   Count quotations and source-derived summaries across entries and URLs of the
   same work; follow the web tool's source budgets in the saved file and chat.
   Store shared evidence once in the evidence catalog and refer to its `EVD-*` ID.
   Explain the surrounding reasoning through bounded, attributed paraphrase.
7. Distinguish the study's own conclusion from a claim it attributes to someone
   else. Name the actual speaker/credited author. If the original cited work is
   needed, verify it separately as supplementary evidence; an unread citation is
   not independent support. Mark unknown author details or missing evidence `null`.
8. Judge what the source supports: descriptive observation, association, tested
   effect, formal result under assumptions, proposed design, or analyst inference.
   A proof of an inadequate model, performance benchmark, author recommendation,
   or correlation does not establish a universal financial obligation.

Respect paywalls and API/access restrictions; stop direct requests to a host
after HTTP 403 in the current run. Record failures without interpreting them as
absence of evidence. No bulk PDF download, Python miner, or local model server is
needed. If a quote or locator cannot be verified, leave it `null`, explain why,
and keep the consideration unavailable for evidence-based Learn reuse.

## Cross-check current FinKore

Read the current artifacts in source-of-truth order:

1. `docs/coreDoc/core-doc.md` for foundational obligations.
2. `spec/README.md`, `spec/conventions.md`, and each owning specification for
   precise behavior, invariants, portable errors, and compatibility.
3. `conformance/manifest.json`, relevant declared vectors/schemas, conventions,
   and requirement traceability for acceptance coverage of that behavior.
4. Relevant `agentic/` metadata for canonical operations, effects and safety.

Read existing `learn/` pages and consumer guidance when assessing an educational
use. They provide context, not authority over CoreDoc or the specification.
Record actual files and stable IDs consulted, and separate specification coverage
from conformance coverage. Unread/unavailable layers stay unverified, not absent.
Current working-tree text takes precedence over history; record the baseline
version and Git revision when available, identifying local changes that affect it.

For each consideration distinguish `already_addressed`, `possible_gap`,
`possible_conflict`, `application_policy`, `deferred_scope`, `outside_scope`, or
`unverified`. Use verified paths and identifiers, not the earlier analyst's
mapping alone. Explain exactly what is covered and what remains uncertain.
For undefined behavior state: **This behavior is not currently defined by
FinKore Core.** A deferred topic or application policy is not automatically a
Core defect; an inconsistent vector does not create financial semantics.

Assess the financial/control problem, a concrete non-normative scenario, benefits
for FinKore, counterexamples, and implementation/portability tradeoffs. Separate
support for explaining an existing rule from evidence motivating a possible
future change. Do not claim a study historically inspired FinKore without a
verified historical link. Research review is not specialist sign-off or normative
acceptance, and does not certify consumer implementations.

## Consolidate and save

Use [references/all-findings-format.md](references/all-findings-format.md) for the
inventory, evidence catalog, review dispositions, and Learn reuse criteria.
Write explanatory prose in the user's language; keep original titles and quotes.

- Merge genuine overlaps across sessions only when claim and conditions match.
  Retain every origin, supporting and opposing source, and material difference.
  A preprint, publisher version and repository copy are not three independent
  studies. Similar titles or repeated findings do not demonstrate independence.
- Assess source support, FinKore relationship, and editorial readiness separately.
  Report negative conclusions and unverifiable findings as carefully as useful
  ones. Do not force a minimum number of usable considerations or quote a weak
  source merely to populate required fields.
- Save progress after each review, including limited and rejected claims. Use a
  safe replacement of the report and check for concurrent edits first. Record
  dated revisions when later evidence changes an earlier conclusion; never erase
  contradictory evidence or original source findings.
- Preserve manifests, source notebooks, discovery/downloader outputs, CoreDoc,
  specifications, conformance, Agentic metadata, and Learn files. This workflow
  writes only the requested consolidated report; it does not create Issues,
  contact researchers, edit financial behavior, or publish pages.

At completion report the research themes, sessions and original findings covered,
reviewed/limited/pending counts, consolidated considerations and evidence-ready
counts, material disagreements or gaps, and the exact `allFindings.md` path.
Distinguish completion of the review queue from full-text reading and normative
approval. If interrupted, leave the pending inventory and limitations explicit.
