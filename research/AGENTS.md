# Research memory

Research catalogs are non-normative. Preserve the repository's specification-first
boundaries and the responsible skill's evidence/quotation requirements.

For imported research, the unified catalog and verified snapshots are authoritative.
Original manifest/session directories are optional staging inputs, never prerequisites
for reading, reviewing, or verifying unified research. Resolve an already imported
session through `allSessions.json`, `allSeen.json`, `allFindings.json` and their
`source.snapshot` references. `source.path` is a historical label, not a live file
dependency. Do not ask the user to restore original directories or recreate them
to satisfy a skill's earlier manifest-oriented discovery instructions.

Before selecting publications for a new research batch:

1. Run `python3 research/tools/consolidate_research.py` from the repository root
   (or the equivalent absolute script path). Read `research/README.md` for formats.
2. Consult `research/allSeen.json` using stable publication identifiers, or use
   the tool's `--lookup` option. Compare the previous session intent, source
   edition, reading notes, findings and review limitations with the new task.
3. Reuse documented initial triage for compatible intent/version. Keep the new
   session occurrence and its query context in the catalog. Do not spend a fresh reading slot
   repeating the same initial analysis unless the user requests it or a concrete
   unresolved question warrants revisiting it. Record reuse in the session notebook
   with the original session/publication/finding references and the actual extent
   read now; never imply that reusing notes is a new source reading.
4. An inaccessible source is an attempted source, not a read paper. Metadata,
   abstracts, partial reading, downloaded files and full reading remain distinct.
   Preserve follow-up work; a new topic or version can justify re-analysis.
   Recheck FinKore mappings when the contract changes, even if source reading is reused.
5. Check `identity_conflicts` before suppressing duplicates. Equal titles or
   different editions do not establish identical studies. Never copy findings
   between versions without checking their applicability.

After updating session findings, run the consolidator again. After updating the
consolidated review, run it with `--unify-links`; this converts session link targets
to verified snapshot paths, preserving the prior report, conclusions and exact
quotations. It does not edit manifest inputs. New observations for imported research
can be supplied in a new staging session with stable publication IDs; retain the
previous origin references. Do not edit immutable snapshots or hand-edit JSON views.
The active workflow reads publications on the web; local PDF
downloading is retired. Preserve already imported historical download records
in the catalog without treating them as source reading.

Preserve `catalog/state.json`, immutable snapshots and identifiers. Do not hand-edit
generated JSON, delete historical observations, reinterpret `pending_validation`
as acceptance, or treat `skip_initial_triage_for_same_intent` as permission to skip
all deeper research. Unknown parser formats require a warning and manual review,
not a fabricated completion status. If publication/review inputs are updated
outside the known format, preserve them and update/test the parser before relying
on automatic skip decisions.

This directory's tooling is optional research maintenance, not a financial
implementation or a repository conformance runner. Do not make normative checks
or published contract documents depend on these catalogs.
