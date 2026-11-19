---
name: research-analyst
description: Read publications from an existing Research Scout manifest on the web and maintain detailed, source-backed FinKore research findings, candidate rules, and open discussions. Use after discovery; does not edit the financial contract.
---

# FinKore Research Analyst

Start from an existing `manifest.json`, read the publications on the web, and
maintain `findings.md` in that manifest's directory. Explain findings fully enough
for an independent reviewer to assess the source, interpretation, conditions,
financial risk, and relevance to FinKore. This is exploratory research, not
approval of normative changes.

## Session and FinKore context

- Accept a manifest file or directory supplied by the user. Otherwise use the
  session clearly identified in the conversation. If none is identified, inspect
  `experts/research/manifests/`; select the only session, or ask which to use when several
  exist. Never hard-code a session, topic, or research question.
- Read `manifest.json`, `queries.json` when present, and existing `findings.md`.
  Preserve the original research intent. Discovery summaries and relevance scores
  prioritize reading; they do not establish findings or academic quality.
- Find FinKore from the working directory or supplied repository location. Read
  `AGENTS.md`, `docs/coreDoc/core-doc.md`, `spec/README.md`, and
  `spec/conventions.md`. Read each owning specification before claiming a
  relationship with the contract. Consult conformance and Agentic metadata after
  the specification when relevant. If the repository is unavailable, collect
  source findings but mark their FinKore relationships unverified.
- Use the current files, not a memorized version. Money, Workflow, Audit,
  Approvals, and Entities are starting points, not grounds for discarding research
  on deferred topics. Separate Core obligations from application policy and
  architecture. Approval is distinct from authorization; Audit is distinct from
  operational monitoring. Research on ledgers or distributed coordination does
  not establish an existing Core requirement.

## Investigate the sources

1. Queue manifest publication IDs, resuming previous work. Prioritize the user's
   focus and relevant source content; keep all remaining publications pending.
2. Open the recorded landing page, DOI, publisher/repository full text, or PDF
   URL using web tools. Check title/authors/version against the manifest; record
   discrepancies without silently changing discovery metadata. Read online HTML
   or PDF text and inspect figures/tables when a claim depends on them. No local
   PDF downloads, Python miner, or LM Studio server is required.
3. When a link fails, use a targeted title/DOI search for a legitimate accessible
   version of the same publication. Respect paywalls and restrictions. Stop using
   a host after HTTP 403 in the current batch and record the limitation. Mark
   OCR/text extraction issues. A snippet, abstract, or bibliographic record does
   not establish that the complete paper was read.
4. Capture supported candidate rules and useful discussions: assumptions,
   competing approaches, tradeoffs, failure scenarios, counterexamples, and open
   questions. Distinguish explicit statements, empirical observations, and your
   inferences. No minimum finding count. Do not turn correlations or design
   recommendations into universal financial obligations.
5. Follow citations or related discussions when needed to understand a concrete
   finding. Prefer primary academic, institutional, or standards sources. Record
   these as supplementary sources connected to a manifest publication; do not
   restart discovery or change the manifest. Do not attribute claims to an unread
   cited paper as if independently verified.
6. Retain a direct URL and precise locator for every finding: section, heading,
   table, or verified PDF page. Distinguish physical pages from printed labels.
   Use short exact quotes only where useful, respecting the web tool's source
   and quotation limits in the saved file as well as the chat. Prefer detailed
   paraphrase. Never invent a page, quotation, identifier, or source.

## Relate findings to FinKore

Explain the financial/control relevance using verified repository clauses. Use
`already_addressed`, `possible_gap`, `possible_conflict`, `application_policy`,
`deferred_scope`, `outside_scope`, or `unverified`. Cite actual paths and IDs
after reading them. For undefined behavior say: **This behavior is not currently
defined by FinKore Core.** Explain possible interpretations and control impact.

Every finding stays `pending_validation`. A relationship assessment is a research
hypothesis, not normative validation or specialist approval. Keep source quality
separate from topical relevance: identify publication type, method, version,
preprint status, and evidence limits when known. Do not assume peer review or
authority from provider rankings; mark unknowns.

## Maintain the notebook

Use [references/findings-format.md](references/findings-format.md). Write in the
user's language, retaining exact titles and identifiers. Save after each
publication, including failed access and zero findings, to preserve progress.

- Default to five previously unreviewed manifest publications per invocation,
  unless the user requests another count or the whole session. This bounds the
  reading batch, not findings per source. If interrupted, save the actual reading
  coverage and remaining queue. Never imply a sample covers the entire corpus.
- Preserve stable finding IDs, prior descriptions, and evidence. Merge genuine
  duplicates with additional sources; retain different conditions, contradictory
  evidence, and substantive interpretation changes.
- Record reading extent and access failures. Full-text availability does not
  imply full-text review. Keep `abstract_only` and partial reading visible.
  Distinguish no findings from inaccessible or unread text.
- Queue new manifest IDs when the session grows. If the FinKore baseline changes,
  mark older mappings for recheck. Do not overwrite another session's findings
  or concurrent edits.

Do not modify CoreDoc, specifications, conformance, Agentic metadata, discovery
outputs, or downloader outputs; create Issues, contact authors, publish, or start
other pipeline stages without a separate instruction. Old `preliminary-rules.json`
and `.rule-mining*` files belong to the discarded local experiment and are not
verified input for this workflow.

At completion report topic, publications attempted/read/limited, new and
cumulative findings, remaining queue, useful discoveries, and the exact report
path. State whether the session is partial or complete. Do not start another
batch automatically after a bounded invocation.
