---
name: issue-authoring
description: Create, review, rewrite, triage, or split FinKore GitHub Issues using specification-first governance, verified repository references, and contributor-friendly acceptance criteria. Use whenever work involves preparing or changing an Issue, Issue backlog, or Issue template.
---

# FinKore Issue Authoring

Author GitHub Issues that are actionable for external contributors and preserve FinKore's specification-first contract:

**CoreDoc → Specifications → Conformance → Implementations**

Read [references/issue-template.md](references/issue-template.md) before drafting an Issue. Apply the template proportionately: keep simple Issues concise, but never omit a required governance decision.

## Workflow

1. **Establish the request.** Determine whether to create, review, rewrite, triage, or split Issues. Identify the intended domain and deliverable. Preserve existing Issue numbers and substantive requirements when rewriting.
2. **Verify context.** Inspect relevant CoreDoc premises, specifications, requirement IDs, guidance, and conformance manifest/cases. Inspect contribution guidelines and existing labels/templates if accessible. Never invent paths, IDs, vectors, labels, or links. If something is inaccessible, mark it **Unverified** and specify what needs checking.
3. **Define the problem.** Describe the financial/engineering scenario, current contract, actual gap, and intended outcome. Keep application business policy separate from FinKore primitives.
4. **Classify specification impact.** Select `None`, `Clarification`, or `Normative change` using the definitions below. If uncertain, mark **Needs maintainer decision** and do not imply a contract is approved.
5. **Bound the contribution.** State in-scope results and out-of-scope changes. Propose practical tasks without unnecessarily prescribing a design. Consider splitting only when outcomes are independently deliverable and reviewable; otherwise keep the Issue coherent.
6. **Write acceptance criteria.** Use observable, testable outcomes, with applicable references and repository verification. Do not demand new conformance vectors if existing vectors already prove the defined behavior.
7. **Assign metadata.** Apply consistent priority, contribution difficulty, reviewer expertise, dependencies, and existing GitHub labels. See rules below.
8. **Review before delivery.** Check arithmetic, negative-value cases, rounding conventions, domain boundaries, exactness, portability, traceability, and contributor readability as applicable. Flag any financial-domain calculation that needs independent review. Return the ready-to-copy Markdown Issue and any open decisions.

## Specification impact

- **None:** Editorial, tooling, organizational, or navigation work that neither changes normative requirements nor clarifies their meaning.
- **Clarification:** Explanation or non-normative examples of existing behavior without changing its observable meaning.
- **Normative change:** Addition, removal, or alteration of a requirement, invariant, error condition, mutation effect, or other observable domain behavior. Identify affected IDs, compatibility concerns, and conformance implications. Require explicit maintainer approval **before** any normative change is treated as accepted.

If classification is uncertain, label it **Needs maintainer decision** in the Issue body and mark triage as pending. A documentation Issue must not quietly introduce new normative behavior. Conformance vectors verify approved specifications; they do not independently define them.

## Priority and contribution level

| Priority | Use when |
| --- | --- |
| `P0` | Critical correctness, security, or specification-integrity failure needing immediate action |
| `P1` | High-impact correctness, conformance, adoption, or maintainability concern |
| `P2` | Valuable, non-blocking improvement (default for routine examples and documentation) |
| `P3` | Optional refinement or low-impact improvement |

Contribution levels: `Beginner` (small, self-contained, minimal prior knowledge), `Assisted first contribution` (bounded with explicit guidance/review), `Intermediate` (domain/repository familiarity), `Advanced` (cross-domain, normative, or difficult compatibility work).

Use `good first issue` **only** when genuinely appropriate. Use `help wanted` when the work is sufficiently defined for outside contribution. Use `needs-triage` only when scope, classification, prerequisites, or a maintainer decision is still unresolved. Do not propose adding a label silently; distinguish existing labels from proposed labels.

## FinKore governance boundaries

- Do not infer a universal accounting, invoice, tax, fee, aggregation, or presentation policy from a primitive Money operation.
- Keep exact arithmetic, explicit rounding policy, calculation scale, and presentation normalization conceptually separate.
- Preserve defined workflow, approval, audit, and financial-entity invariants, including failure semantics and historical facts.
- Maintain language neutrality unless targeting an explicitly named adapter or implementation.
- Worked examples are **non-normative** unless an approved specification says otherwise. Reference the requirement governing each expected result.
- Financial-domain examples should show inputs, operation order, policy, intermediate values, expected outcome, and independent reviewer verification when necessary.
- Do not add financial calculation implementations to repository-maintenance tooling while authoring Issues.

## Output and permissions

For a single Issue, output one complete GitHub-ready Markdown draft following the reference template, plus a short note only for unresolved decisions or unverified facts.

For a batch rewrite, preserve every original Issue and provide (1) a Markdown collection of complete rewritten Issues and (2) a review summary with original/new priorities, specification impact, contribution levels, material edits, suggested splits, duplicates, missing references, proposed labels, and maintainer decisions. Do not silently discard scope.

This skill is for **authoring Issues**, not implementing them. Do not change specifications, code, conformance cases, or repository configuration as a side effect. Do not publish, close, or edit remote GitHub Issues without explicit user authorization.

## Final checklist

- [ ] Problem and contributor starting point are clear.
- [ ] Normative contract is preserved or a proposed change is explicitly flagged.
- [ ] Impact, priority, difficulty, reviewers, and dependencies are justified.
- [ ] Scope is coherent and acceptance criteria are verifiable.
- [ ] Relevant references are verified or clearly marked unverified.
- [ ] External contributors can act without guessing financial policy.
