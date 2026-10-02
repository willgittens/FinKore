# Approval Decisions

## Status

**FinKore Core 0.9 release candidate.**

## Purpose

This document defines recorded approval outcomes.

## Terminology

An Approval Decision outcome is `APPROVED` or `REJECTED`. `PENDING` describes an unresolved Approval Requirement and is not an Approval Decision.

## Requirements

- **APPROVAL-DECISION-001** — An Approval Decision MUST identify its Approval Requirement, deciding Actor, outcome, and decision timestamp.
- **APPROVAL-DECISION-002** — An Approval Decision MUST be associated with the relevant subject state or facts against which the decision was made.
- **APPROVAL-DECISION-003** — An Approval Decision MUST NOT be assumed to remain valid when facts relevant to its Approval Requirement have changed. The application or a higher-level domain policy MAY define which mutations are relevant or material.
- **APPROVAL-DECISION-004** — The Actor MUST satisfy the Approval Requirement's eligibility rule at the domain-defined evaluation time.
- **APPROVAL-DECISION-005** — An outcome MUST be either `APPROVED` or `REJECTED`.
- **APPROVAL-DECISION-006** — The decision timestamp MUST identify an unambiguous instant and, when serialized, MUST follow [Timestamp conventions](../conventions.md#portable-values).
- **APPROVAL-DECISION-007** — A committed Approval Decision MUST NOT be overwritten or removed from logical approval history, including when later lifecycle evidence makes it no longer currently effective.
- **APPROVAL-DECISION-008** — When a composing domain requires an [Audit Event](../audit/events.md) for an Approval Decision, that Audit Event MUST preserve the Approval Decision's domain meaning.

- **APPROVAL-DECISION-009** — A concrete single-Decision effectiveness evaluation MUST validate the supplied concrete Requirement, Decision structure, Requirement association, and Actor eligibility before returning effectiveness. Malformed declarations or a mismatched association MUST use `FINKORE_APPROVAL_INVALID_DECISION`; a valid eligibility declaration excluding the Actor MUST use `FINKORE_APPROVAL_INELIGIBLE_ACTOR`. It MUST evaluate caller-declared relevant facts and any expiration under Approval Validity using explicit required context. Expired or fact-stale valid evidence MUST return `INEFFECTIVE`; otherwise it MUST return `EFFECTIVE`. Without supplied lifecycle history this observation MUST NOT claim lifecycle-aware effectiveness. A separately documented facts-only helper MAY remain available, but MUST NOT be used as the complete concrete evaluation.

## Core 0.9.7 fact comparison correction

- **APPROVAL-DECISION-010** — A bounded concrete Approval fixture operation consuming a Decision history or Decision collection MUST receive an explicit array or supported history envelope containing an explicit history array. Omission, null, or a malformed envelope MUST use `FINKORE_APPROVAL_INVALID_DECISION`. An empty array remains valid evidence of no Decisions. Native convenience constructors MAY provide documented empty defaults; fixture translation MUST NOT use them to repair missing evidence.
- **APPROVAL-DECISION-011** — A concrete Approval Actor's optional type, when supplied, MUST be a nonempty string. Null, empty, or non-string type values MUST use `FINKORE_APPROVAL_INVALID_DECISION` at Decision and lifecycle boundaries. Omission MUST remain valid and MUST NOT synthesize a type.
- **APPROVAL-DECISION-012** — Before concrete Requirement evaluation returns an outcome, Actor eligibility MUST be validated for every structurally valid supplied Decision that identifies the evaluated Requirement, including a Decision excluded from current effectiveness by withdrawal, Decision supersession, Requirement supersession, expiration, stale facts or revision, or another decisive Decision. A valid eligibility declaration excluding the Actor MUST use `FINKORE_APPROVAL_INELIGIBLE_ACTOR`. A supplied Decision identifying another Requirement MUST still receive complete structural validation, but MUST NOT be tested against the evaluated Requirement's eligibility rule and MUST NOT affect its outcome. Evaluation MUST NOT invent an absent Requirement registry or eligibility rule for that unrelated Decision.

The accepted D1–D4 decisions in the [0.9.7 plan](../../docs/plans/plan-09.7.md)
resolve differing concrete evaluation and native-value behavior. These are
corrective normative additions under SPEC-FREEZE-001, staged for implementation
and verification in that plan; they are not claims of current conformance.

- **APPROVAL-FACT-001** — When concrete Decision or Requirement evaluation is supplied current subject facts, omission of a relevance selector MUST compare the complete supplied fact value against the Decision's retained fact value. An explicitly supplied nonempty selector list MUST narrow comparison to the selected facts. Null, empty, or malformed selector declarations MUST fail with `FINKORE_APPROVAL_INVALID_DECISION`, even when another validity condition would make the Decision ineffective. Implementations MUST NOT synthesize current facts from historical facts. Concrete single-Decision evaluation MUST reject absent current facts with `FINKORE_APPROVAL_INVALID_DECISION`. Requirement evaluation MAY omit both current facts and selectors to evaluate history without claiming current-fact validation; supplied selectors without current facts MUST use `FINKORE_APPROVAL_INVALID_DECISION`. Explicit null current facts MUST remain a supplied value, not omission.
- **APPROVAL-FACT-002** — An Approval fact selector MUST identify a nonempty sequence of nonempty object-member names. Selection MUST traverse only own object members and MUST NOT traverse arrays, inherited members, or implicit conversions. A selected fact MUST be present in both historical and current facts to match; absence on both sides MUST NOT count as equality. Explicit null at a selected leaf MUST count as present. Missing intermediate members or a non-object intermediate value MUST make the selected fact unavailable. The bounded dot-separated encoding is defined in conformance conventions; no wildcard, fallback to a literal dotted key, escaping, expression, or array-index language is implied.
- **APPROVAL-FACT-003** — Supported Approval facts MUST compare structurally without coercion. Objects MUST have the same own member names and recursively equal values, independent of member order. Arrays MUST have equal lengths and recursively equal values in the same order. Null, Boolean, string, and number categories MUST remain distinct; strings MUST compare exactly without normalization. Supported finite numbers MUST compare by exact accepted numeric value, independently of native decimal scale; positive and negative zero MUST compare equal. Numeric strings and Money-shaped objects MUST NOT acquire numeric or Money semantics. Missing members MUST remain distinct from explicit null. Comparison MUST NOT round exact numbers through binary floating-point conversion.
- **APPROVAL-FACT-004** — An implementation accepting native Approval fact values MUST document their supported value set and exact numeric interpretation. It MUST capture independently owned containers and retain only immutable supported scalar values. Unsupported or mutable numeric objects, including unsupported subclasses of otherwise supported numeric classes, MUST be rejected before retention with `FINKORE_APPROVAL_INVALID_DECISION` at concrete Decision/history/fact boundaries. Unsupported values in composition evidence MUST use `FINKORE_APPROVAL_INVALID_CHAIN` under its existing evidence priority. Invalid input MUST NOT alter previously committed Decisions or lifecycle evidence. Copying supported containers MUST preserve their complete fact meaning, including own member names; a serializer or arbitrary numeric string coercion MUST NOT silently repair unsupported input.

Concrete single-Decision evaluation requires supplied current facts; absent
current facts use `FINKORE_APPROVAL_INVALID_DECISION`. Explicit null is a supplied
fact value. Requirement evaluation retains the optional-current-facts scope of
APPROVAL-VALIDITY-001: with neither current facts nor selectors, it evaluates
declared history, eligibility, and lifecycle/context without asserting that
current facts were checked. Supplying selectors without current facts is an
invalid comparison request using `FINKORE_APPROVAL_INVALID_DECISION`. This
preserves existing history-only Requirement controls without inventing facts.

Fact mismatch produces `INEFFECTIVE` for a valid concrete Decision; it contributes
neither approval nor rejection to Requirement evaluation. The Requirement is
`PENDING` when no other effective Decision determines an outcome. Withdrawal,
supersession, eligibility, and required expiration context still apply, including
APPROVAL-VALIDITY-013's complete context check. These rules do not extend the
composition-only total error priority to concrete Approval operations.

Separately documented native facts-only helpers retain the limited scope allowed
by APPROVAL-DECISION-009. They cannot replace concrete validation or be used by
an adapter to bypass these comparison rules. Native APIs must distinguish
omission from explicitly supplied null at the concrete boundary; the old use of
null/None as an optional selector default needs an explicit migration path in
the implementation milestone.

## Invariants

Each effective Approval Decision must have exactly one outcome and exactly one attributable Actor.

For current satisfaction, a Decision is effective only for the Approval
Requirement it identifies and only while the relevant subject state or facts
still correspond to the state or facts against which the Decision was made. If
current relevant facts no longer correspond, the historical Decision remains in
logical history but MUST NOT satisfy the Requirement for current evaluation.
The observable Requirement state is therefore `PENDING` unless another
effective Decision satisfies or rejects the Requirement.

Core 0.9 release candidate current-effectiveness also considers lifecycle evidence defined by
[Approval Validity](validity.md), including withdrawal, expiration, and
supersession. Those lifecycle events change current effectiveness without
rewriting the committed Decision.

Core 0.9 release candidate does not require a specific binding mechanism such as revision
numbers, database versions, hashes, immutable snapshots, or stable fact
references. A composing domain MAY use any mechanism that preserves the
observable guarantee that the Decision can be associated with the relevant
subject state or facts used when it was made.

## Example

Absence of subject association violates **APPROVAL-DECISION-002** at record
and evaluation boundaries. A caller cannot repair missing historical facts by
copying current facts into a Decision. Explicitly recorded null can be a
legitimate fact value; it is distinct from absent association. The bounded
fixture uses the presence of `subjectFacts` for that distinction, but native
APIs may use another explicit association mechanism. No universal non-null
fact schema or mandatory subject revision follows from this rule.

Malformed Decision evidence and valid evidence that is no longer effective
are different conditions. Relevant-fact changes, withdrawal, expiration, and
supersession preserve the historical Decision while changing effectiveness.
Supplied concrete Decision history must contain Decisions satisfying
**APPROVAL-DECISION-001**, **APPROVAL-DECISION-002**, **APPROVAL-DECISION-005**,
and **APPROVAL-DECISION-006**, whether newly recorded or reused. Structural
validation cannot be skipped because an entry is withdrawn, superseded,
unrelated to the currently evaluated Requirement, or follows an already
decisive entry. An incomplete Decision is invalid evidence, not a valid
historical Decision made ineffective by later facts. Rejecting such input
preserves the entire supplied history; it does not authorize dropping entries
or manufacturing associations. Requirement-specific eligibility and relevance
checks still apply at their own evaluation boundaries.

The following JSON is illustrative and non-normative; it does not prescribe serialized member names.

```json
{
  "requirementId": "finance-review",
  "subjectStateRef": "invoice-42/revision-3",
  "outcome": "APPROVED",
  "actor": { "type": "user", "id": "user-7" },
  "decidedAt": "2026-08-31T10:15:30Z"
}
```

For example, a manager approves an invoice for `9,000 EUR`. If its amount changes to `90,000 EUR` and amount is relevant to that requirement, the previous approval is not automatically valid for the modified facts. This example is non-normative.

## Invalid Examples

- Treating a decision as effective for materially changed subject facts solely because its Approval Requirement identifier still matches.
- A `PENDING` decision.
- Editing a rejection into an approval without preserving the rejection.

## Errors

Invalid decisions must use an applicable [Approval Error](errors.md).

## Core 0.9.6 evaluation scope decision (non-normative)

The Milestone 1 proposal was accepted when Milestone 2 was requested.
APPROVAL-DECISION-009 establishes the concrete boundary for the conformance-local
`approval.decision.evaluate` fixture. Its previous facts-only catalog wording is
superseded by this documented corrective contract path. The supplied Requirement
is required; `evaluatedAt` is required only when expiration applies. Existing
result categories and identifiers are retained. A native facts-only helper
retains its documented scope and signature.

This is an observable corrective contract change under SPEC-FREEZE-001 and
SPEC-COMPATIBILITY-012/014, not an editorial clarification. Milestone 2 adds
permanent tests; Milestone 5 synchronizes implementations, adapters, public API
documentation, and package consumers for this corrective contract. Milestones
8–9 complete combined verification, fresh review, and local release closure for
Core 0.9.6. No canonical Agentic operation is added or repurposed.

## Non-Goals

FinKore Core does not define delegation, escalation, approval-definition migration, or complex dependency graphs. Subject-state association is semantic; this document does not require revision identifiers, version numbers, hashes, snapshots, or immutable references.
