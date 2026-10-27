# FinKore GitHub Issue Template

> Authoring reference for the `issue-authoring` Skill. Replace placeholders before publication; remove instructional comments and inapplicable optional material. Do not claim references or labels were verified unless they were checked.

## Title (GitHub title field)

`[Domain] <Action-oriented, specific outcome>`

Examples: `[Money] Document cumulative rounding effects`; `[Audit] Cover redaction edge cases in conformance`.

---

## Summary

<In 2–4 sentences, explain the problem and intended result in language a new contributor can follow.>

### Context and problem

<Explain existing behavior and why the gap matters. Give one concrete scenario when useful. Distinguish an already-specified behavior from a requested change.>

### Objective and scope

**Objective:** <Observable outcome.>

**In scope:** <Relevant deliverables, existing guidance, affected domain.>

**Out of scope:** <Application-specific business policies, unrelated refactors, or normative changes unless explicitly proposed.>

### Proposed tasks

- [ ] <Inspect verified requirement(s) and relevant files.>
- [ ] <Create or change the requested deliverable.>
- [ ] <Reference representative existing conformance cases where relevant.>
- [ ] <Update affected readers/cross-links and check for unnecessary duplication.>

### Acceptance criteria

- [ ] <Inputs, expected behavior, output, or documentation result are stated precisely.>
- [ ] <Relevant requirements are cited; no unsupported financial policy is introduced.>
- [ ] <Any required verification or conformance checks pass.>
- [ ] <Affected documentation/readers are consistent.>
- [ ] <Required engineering or financial reviewer confirms applicable domain correctness.>

### Specification impact

**Classification:** `<None | Clarification | Normative change | Needs maintainer decision>`

**Rationale:** <Why this classification applies.>

**Affected requirement IDs:** <Verified IDs, None, or Unverified.>

**Maintainer decision:** <Required decision for normative changes/uncertainty, or Not required.>

> **Normative changes only:** State the proposed contract change, compatibility/migration implications, and required specification and conformance updates. A proposed change is not approved behavior until explicit maintainer approval.

### Metadata

- **Priority:** `<P0 | P1 | P2 | P3>` — <Brief impact justification.>
- **Labels:** `<Verified existing labels>`; <any proposed new label explicitly marked Proposed>.
- **Contribution level:** `<Beginner | Assisted first contribution | Intermediate | Advanced>`.
- **Suggested reviewers:** <Domain/financial and engineering expertise, naming individuals only if verified.>
- **Dependencies:** <Verified related Issues/decisions, None, or Unverified.>

### References

- <CoreDoc premise or document, with verified link.>
- <Domain specification and requirement ID, with verified link.>
- <Conformance manifest and representative cases, if relevant.>
- <Related guidance or Issues, if relevant.>

---

## Authoring notes (not part of the published Issue)

- Keep the Issue short enough to scan. Remove sections or checklist items that add no value, but retain specification impact and minimum metadata.
- `None` means no semantic clarification; examples explaining existing financial behavior usually classify as `Clarification`.
- Documentation and example Issues normally start at `P2` unless their impact warrants a higher priority.
- Use `good first issue` only for truly small tasks; `help wanted` only when ready for external work; `needs-triage` only while unresolved decisions remain.
- Split only if there are independently valuable, independently reviewable outcomes. Record dependencies and avoid duplicate acceptance criteria.
- For worked financial examples, make operation order, intermediate exact values, scale, rounding mode, positive/negative sign, and result explicit as applicable. Say examples are non-normative.
- If path, requirement ID, label, or conformance link is not verifiable, mark it `Unverified` rather than inventing it.
