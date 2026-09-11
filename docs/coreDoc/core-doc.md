# FinKore CoreDoc

**CoreDoc version:** v0.5
**Document date:** 2026-09-12
**Status:** Initial normative draft

## Purpose

The FinKore CoreDoc is a financial principles and rules standard. It states
foundation-level obligations for financial meaning and control that FinKore domain
specifications must refine. It is intended for accounting, audit, control,
compliance, and financial-systems review.

## Scope

The CoreDoc governs financial meaning, evidence, control behaviour, and history.
It does not prescribe software design, storage, interfaces, programming
languages, or conformance mechanics.

FinKore v0.5 does not define posting, double-entry ledgers, accounting dates or
closed periods, tax, exchange-rate sourcing, reconciliation, settlement,
accruals, depreciation, revenue recognition, statutory retention periods, or
segregation-of-duties policy. This CoreDoc establishes none of them.

## Normative language

**SHALL**, **SHALL NOT**, **MUST**, and **MUST NOT** are mandatory. **SHOULD**
is a recommendation that may be departed from with documented justification.
**MAY** expresses permission.

# Core Principles and Financial Rules

## CORE-001 — Monetary Integrity

**Introduced:** v0.5
**Last updated:** v0.5
**Last updated on:** 2026-09-12

Monetary information must retain the amount, currency, precision, and allocation
meaning needed to prevent a value from being silently changed or misapplied.

### CORE-001.1 — Amount and currency are inseparable

**Introduced:** v0.5
**Last updated:** v0.5
**Last updated on:** 2026-09-10

**Rule**

A monetary value SHALL contain an exact base-10 amount and a currency. An amount
SHALL NOT be interpreted as monetary value without its currency.

**Why this matters**

The same number has different financial meaning in different currencies.
Treating currency as display-only can misstate a balance or transaction.

**Interpretation**

Currency identifies the monetary unit; it does not supply an exchange rate.
Negative and zero amounts retain ordinary numeric meaning unless a consuming
domain declares a business restriction.

**Boundaries**

This rule does not determine permitted currencies, private-currency treatment,
or exchange-rate policy.

**Relevant FinKore domains**

[Money representation](../../spec/money/representation.md) — MONEY-REPRESENTATION-001 to -004; [Currency](../../spec/money/currency.md) — MONEY-CURRENCY-005.

### CORE-001.2 — Exact calculation and explicit rounding

**Introduced:** v0.5
**Last updated:** v0.5
**Last updated on:** 2026-09-10

**Rule**

Where a monetary calculation has an exactly representable result, it SHALL
preserve that result. Precision reduction SHALL use a declared rounding rule and
SHALL NOT select a rounding method or target scale implicitly.

**Why this matters**

Undeclared rounding changes financial value without an accountable policy
decision. Exact calculation identifies where rounding was intentionally applied.

**Interpretation**

A rounding rule identifies both target scale and mode. A currency's customary
minor-unit scale is not, by itself, a rounding instruction.

**Boundaries**

This rule does not select a business's rounding, tax, or statutory convention.

**Relevant FinKore domains**

[Money arithmetic](../../spec/money/arithmetic.md) — MONEY-ARITHMETIC-007 and -008; [Money rounding](../../spec/money/rounding.md) — MONEY-ROUNDING-001 and -004 to -007; [Rates](../../spec/money/rates.md) — MONEY-RATE-005 and -006.

### CORE-001.3 — Incompatible currencies are not combined or compared

**Introduced:** v0.5
**Last updated:** v0.5
**Last updated on:** 2026-09-10

**Rule**

Monetary amounts SHALL be added, subtracted, ordered, or treated as numerically
equal only when their currencies are compatible. Conversion SHALL be explicit;
incompatibility SHALL NOT be silently resolved.

**Why this matters**

Combining EUR and USD without a stated conversion basis produces a number with
no reliable financial interpretation.

**Interpretation**

In the current Money specification, compatibility requires the same ISO 4217
currency identifier. A mismatch is a rejected domain outcome, not zero or equal.

**Boundaries**

FinKore v0.5 does not specify rate source, rate date, or foreign-exchange
accounting.

**Relevant FinKore domains**

[Currency](../../spec/money/currency.md) — MONEY-CURRENCY-003 and -004; [Money arithmetic](../../spec/money/arithmetic.md) — MONEY-ARITHMETIC-001 and -002; [Comparison](../../spec/money/comparison.md) — MONEY-COMPARISON-001 to -004.

### CORE-001.4 — Allocation conserves the source value

**Introduced:** v0.5
**Last updated:** v0.5
**Last updated on:** 2026-09-10

**Rule**

An allocation SHALL preserve the source currency and return results whose exact
sum equals the source amount. It SHALL NOT drop, duplicate, create, or destroy
allocation units.

**Why this matters**

An unexplained residual between a cost or payment and its assignments prevents
reconciliation.

**Interpretation**

The allocation scale and method are declared inputs. The declared result order
governs distribution of an indivisible remainder.

**Boundaries**

This rule does not determine which costs may be allocated or the commercial basis
for an allocation ratio.

**Relevant FinKore domains**

[Money allocation](../../spec/money/allocation.md) — MONEY-ALLOCATION-001 to -013.

## CORE-002 — Controlled Financial State

**Introduced:** v0.5
**Last updated:** v0.5
**Last updated on:** 2026-09-10

A financial subject's current status and permitted changes must be determined by
declared domain rules. A rejected action must not leave a partial outcome.

### CORE-002.1 — Lifecycle changes require a declared valid transition

**Introduced:** v0.5
**Last updated:** v0.5
**Last updated on:** 2026-09-10

**Rule**

Where a financial subject has a lifecycle, it SHALL have one declared current
state. Its state SHALL change only through a declared transition from that state
after all applicable conditions have passed.

**Why this matters**

Lifecycle status can determine whether a financial action is permitted or final.
An undeclared shortcut, including an assumed reverse transition, weakens control.

**Interpretation**

Each lifecycle declares its initial state, directed transitions, and terminal
states. Labels such as “posted” or “final” do not independently establish effect.

**Boundaries**

This rule does not prescribe universal states or which events require a lifecycle.

**Relevant FinKore domains**

[Workflow states](../../spec/workflow/states.md) — WORKFLOW-STATES-002, -004, and -007; [Transitions](../../spec/workflow/transitions.md) — WORKFLOW-TRANSITION-001 to -005; [Terminal states](../../spec/workflow/terminal-states.md) — WORKFLOW-TERMINAL-001 to -004; [Entity lifecycle](../../spec/entities/lifecycle.md) — ENTITY-LIFECYCLE-001 to -006.

### CORE-002.2 — Validation is complete, fact-based, and non-mutating

**Introduced:** v0.5
**Last updated:** v0.5
**Last updated on:** 2026-09-10

**Rule**

A proposed financial change SHALL be evaluated against the complete proposed
result and declared relevant facts before it becomes observable. Validation or
transition-condition evaluation SHALL NOT itself alter domain data.

**Why this matters**

Controls spanning several facts fail if each fact is assessed alone. State changed
while checking a condition obscures the difference between attempt and success.

**Interpretation**

All applicable conditions must pass. For the same declared facts, a condition has
the same result unless it identifies an external fact on which it depends.

**Boundaries**

This rule does not define a general authorization model or product-specific
business validations.

**Relevant FinKore domains**

[Workflow guards](../../spec/workflow/guards.md) — WORKFLOW-GUARD-001 to -006; [Entity validation](../../spec/entities/validation.md) — ENTITY-VALIDATION-001 to -003 and -006.

### CORE-002.3 — Rejected actions have no partial financial effect

**Introduced:** v0.5
**Last updated:** v0.5
**Last updated on:** 2026-09-10

**Rule**

A rejected financial action SHALL leave relevant observable financial state,
financial data, and committed history unchanged, unless a governing rule
expressly defines another failure effect.

**Why this matters**

A partly recognised failed change can create an unapproved balance, status,
relationship, or audit trail that cannot be reconciled with the reported outcome.

**Interpretation**

This includes rejected transitions, entity mutations, audit appends and
relationships, and evolution requests where the relevant specification defines
non-mutation on failure.

**Boundaries**

This rule concerns domain-observable effects, not database transactions, retries,
logs, or network-failure handling.

**Relevant FinKore domains**

[Workflow transitions](../../spec/workflow/transitions.md) — WORKFLOW-TRANSITION-006 and -007; [Entity mutability](../../spec/entities/mutability.md) — ENTITY-MUTABILITY-004; [Entity evolution](../../spec/entities/evolution.md) — ENTITY-EVOLUTION-023 to -025; [Audit errors](../../spec/audit/errors.md) — AUDIT-ERROR-001; [Audit relationships](../../spec/audit/relationships.md) — AUDIT-RELATIONSHIP-012.

### CORE-002.4 — Mutability is declared by state and field

**Introduced:** v0.5
**Last updated:** v0.5
**Last updated on:** 2026-09-10

**Rule**

For a subject with state-dependent mutability, the governing domain SHALL declare
which fields may change in each state. A change targeting an immutable field
SHALL be rejected.

**Why this matters**

“Final” status alone is too vague to determine what can still change.
Unrestricted change to protected facts can detach a record from approval and
history evidence.

**Interpretation**

Financial fields and operational metadata may have different rules, but a
permitted exception must be expressly identified and meet audit requirements.

**Boundaries**

This rule does not make every field immutable after approval, posting, or a
terminal state, and does not select a domain's field policy.

**Relevant FinKore domains**

[Entity mutability](../../spec/entities/mutability.md) — ENTITY-MUTABILITY-001 to -007.

## CORE-003 — Financial History and Evolution

**Introduced:** v0.5
**Last updated:** v0.5
**Last updated on:** 2026-09-10

Material financial history must be attributable, reconstructible, and resistant
to destructive rewriting. A later action may alter current effect but not conceal
the earlier financial fact.

### CORE-003.1 — A committed event preserves essential evidence

**Introduced:** v0.5
**Last updated:** v0.5
**Last updated on:** 2026-09-10

**Rule**

A committed financial event SHALL preserve a stable event identity, declared
event type, affected financial subject, and unambiguous occurrence time. It SHALL
identify the responsible actor when known.

**Why this matters**

Without these facts, a reviewer cannot determine what occurred, what it affected,
when it took effect, or who was accountable.

**Interpretation**

Event type is declared domain meaning, not an inference from a technical action
or label. An unknown or absent actor shall not be represented as an invented one.

**Boundaries**

This rule does not require an event for every operational occurrence or a
universal event-type catalogue.

**Relevant FinKore domains**

[Audit events](../../spec/audit/events.md) — AUDIT-EVENT-001 to -008; [Audit actors](../../spec/audit/actors.md) — AUDIT-ACTOR-001 to -004.

### CORE-003.2 — Committed history is not destructively rewritten

**Introduced:** v0.5
**Last updated:** v0.5
**Last updated on:** 2026-09-10

**Rule**

A committed financial-history event and an explicitly recorded ordering
relationship SHALL NOT be replaced, modified, removed, or silently reordered.

**Why this matters**

History cannot support reconstruction, investigation, or accountability if past
events can disappear or change without trace.

**Interpretation**

Resubmitting an existing event identity is rejected rather than creating another
committed instance. Arbitrary storage or retrieval order is not evidence of
financial sequence when order was not explicitly recorded.

**Boundaries**

This rule does not impose event sourcing, global distributed order, or indefinite
record retention.

**Relevant FinKore domains**

[Audit append-only history](../../spec/audit/append-only.md) — AUDIT-APPEND-001 to -004 and -006; [Audit relationships](../../spec/audit/relationships.md) — AUDIT-RELATIONSHIP-009 and -014.

### CORE-003.3 — Corrections and related evolution preserve original facts

**Introduced:** v0.5
**Last updated:** v0.5
**Last updated on:** 2026-09-10

**Rule**

A correction, reversal, void, or supersession SHALL preserve a verifiable
relationship to the affected original subject or event. It SHALL NOT erase or
rewrite original financial facts or history, and these concepts SHALL NOT be
silently treated as interchangeable.

**Why this matters**

These actions can have different financial effects. A reviewer must distinguish a
correction from a reversal or void and reconstruct both original and later facts.

**Interpretation**

Eligibility and detailed consequences are declared by the composing domain or
lifecycle policy, not inferred from state or display labels.

**Boundaries**

This rule does not define accounting entries, effective dates, or business
eligibility for these actions.

**Relevant FinKore domains**

[Entity evolution](../../spec/entities/evolution.md) — ENTITY-EVOLUTION-004, -006, and -008 to -023; [Audit relationships](../../spec/audit/relationships.md) — AUDIT-RELATIONSHIP-001 to -013.

### CORE-003.4 — Redaction preserves evidence of history

**Introduced:** v0.5
**Last updated:** v0.5
**Last updated on:** 2026-09-10

**Rule**

Financial-history content MAY be redacted only under identified policy or
authority. Redaction SHALL remain distinguishable from original absence and
preserve the event identity, type, affected subject, occurrence time, actor
attribution, and recorded relationships needed to evidence the event.

**Why this matters**

Confidentiality can be necessary, but deleting evidence of an event makes its
history unreconstructible. A reviewer must know that a value was withheld.

**Interpretation**

Redaction of committed logical history produces an event evidencing that
redaction. Access-time masking may supplement it but is not source-event mutation.

**Boundaries**

This rule does not establish privacy law, retention law, cryptographic deletion,
or access-control policy.

**Relevant FinKore domains**

[Audit redaction](../../spec/audit/redaction.md) — AUDIT-REDACTION-001 to -007; [Audit append-only history](../../spec/audit/append-only.md) — AUDIT-APPEND-001 and -004; [Audit actors](../../spec/audit/actors.md) — AUDIT-ACTOR-006.

## CORE-004 — Approval Integrity

**Introduced:** v0.5
**Last updated:** v0.5
**Last updated on:** 2026-09-10

An approval is a financial-control decision about a specified subject and facts.
It is distinct from technical access to submit an action.

### CORE-004.1 — Approval requirements state subject, eligibility, and outcome

**Introduced:** v0.5
**Last updated:** v0.5
**Last updated on:** 2026-09-10

**Rule**

An approval requirement SHALL identify the subject requiring approval, eligible
decision-maker or eligibility rule, and the outcome that satisfies or rejects it.
Eligibility SHALL be evaluated independently from technical ability to submit a
request.

**Why this matters**

Technical permission is not evidence that appropriate business approval was
given. Declared eligibility and outcome criteria make the control testable.

**Interpretation**

A requirement may be conditional, but retains stable identity in its approval
context. A decision-maker must meet the requirement at evaluation time.

**Boundaries**

This rule does not establish authentication, role-based access control,
maker-checker separation, delegated approval, or conflict-of-interest policy.

**Relevant FinKore domains**

[Approval requirements](../../spec/approvals/requirements.md) — APPROVAL-REQUIREMENT-001 to -007; [Approval decisions](../../spec/approvals/decisions.md) — APPROVAL-DECISION-004.

### CORE-004.2 — Missing facts do not create an approval exemption

**Introduced:** v0.5
**Last updated:** v0.5
**Last updated on:** 2026-09-10

**Rule**

An approval condition SHALL be evaluated against identified domain facts. If a
required fact is absent, the requirement SHALL fail or remain unresolved; it
SHALL NOT be silently treated as not applicable.

**Why this matters**

Treating missing information as an exemption can bypass a control when its
assessment information is unavailable.

**Interpretation**

For the same condition and facts, applicability is deterministic. Presentation
state and unspecified authorization policy are not implicit approval inputs.

**Boundaries**

This rule does not determine which approval conditions a business must impose.

**Relevant FinKore domains**

[Approval conditions](../../spec/approvals/conditions.md) — APPROVAL-CONDITION-001 to -006.

### CORE-004.3 — Decisions remain tied to their facts and history

**Introduced:** v0.5
**Last updated:** v0.5
**Last updated on:** 2026-09-10

**Rule**

An approval decision SHALL identify its requirement, deciding actor, outcome,
time, and relevant subject facts or state. It SHALL NOT be assumed valid after
relevant facts change, and a committed decision SHALL NOT be overwritten or
removed from logical approval history.

**Why this matters**

Approval is meaningful only in relation to what was approved. Preserving the
decision and factual basis shows whether later change needs fresh consideration.

**Interpretation**

The application or a higher-level policy determines which changed facts are
relevant or material. Portable decisions are approved and rejected. Current
FinKore Approval validity rules define withdrawal, expiration, and supersession
as lifecycle evidence that affects current effectiveness without rewriting the
committed Decision.

**Boundaries**

This rule does not define materiality, delegation, quorum, or authorization
policy.

**Relevant FinKore domains**

[Approval decisions](../../spec/approvals/decisions.md) — APPROVAL-DECISION-001 to -008; [Approval conditions](../../spec/approvals/conditions.md) — APPROVAL-CONDITION-003; [Approval validity](../../spec/approvals/validity.md) — APPROVAL-VALIDITY-001 to -012.

### CORE-004.4 — Chain status follows declared requirements and decisions

**Introduced:** v0.5
**Last updated:** v0.5
**Last updated on:** 2026-09-10

**Rule**

An approval chain SHALL declare whether its applicable requirements are
sequential or unordered. It SHALL be approved only when every applicable
requirement is approved; it SHALL remain pending while an applicable requirement
is pending unless an effective rejection determines the declared outcome.

**Why this matters**

A chain that appears complete before every required approval is effective permits
a financial action without its intended control.

**Interpretation**

A sequential chain does not activate a later requirement before its predecessor
is satisfied. An unordered chain is not silently treated as sequential.

**Boundaries**

This rule does not define a universal sequence, rejection policy, or quorum.

**Relevant FinKore domains**

[Approval chains](../../spec/approvals/chains.md) — APPROVAL-CHAIN-001 to -009; [Approval requirements](../../spec/approvals/requirements.md) — APPROVAL-REQUIREMENT-005.

## CORE-005 — Identifiable and Determinable Financial Meaning

**Introduced:** v0.5
**Last updated:** v0.5
**Last updated on:** 2026-09-10

Financial meaning must be attributable to stable subjects and declared facts. A
reviewer must distinguish material conditions and reproduce results from stated
context.

### CORE-005.1 — Continuing financial subjects retain stable identity

**Introduced:** v0.5
**Last updated:** v0.5
**Last updated on:** 2026-09-10

**Rule**

A continuing financial subject SHALL have an identifier unique within its
declared scope and stable throughout its lifecycle. Distinct subjects SHALL NOT
share that identifier within the same scope.

**Why this matters**

Stable identity connects state, approvals, corrections, evidence, and
accountability over time. A mutable or reusable display number cannot do so.

**Interpretation**

Identifiers are opaque: their format does not establish mutable financial facts.
Import or migration preserves identity or records an explicit continuity mapping.

**Boundaries**

This rule does not require a global identifier format or universal identity scope.

**Relevant FinKore domains**

[Entity identity](../../spec/entities/identity.md) — ENTITY-IDENTITY-001 to -006; [Audit events](../../spec/audit/events.md) — AUDIT-EVENT-004; [Audit actors](../../spec/audit/actors.md) — AUDIT-ACTOR-001 to -003.

### CORE-005.2 — Materially distinct conditions remain distinguishable

**Introduced:** v0.5
**Last updated:** v0.5
**Last updated on:** 2026-09-10

**Rule**

Where the governing domain gives materially different meaning to absence, an
explicit null, an unknown actor, a redacted value, a pending approval, a rejected
approval, a not-applicable requirement, or zero monetary amount, those conditions
SHALL remain distinguishable.

**Why this matters**

Collapsing these conditions can turn missing evidence into an exemption, hide a
redaction, misattribute an action, or turn an absent value into zero.

**Interpretation**

The rule applies only to distinctions made material by the governing domain. It
does not make every representational difference a financial distinction.

**Boundaries**

This rule does not require all domains to use the same representation or define
every possible form of missing information.

**Relevant FinKore domains**

[Audit changes](../../spec/audit/changes.md) — AUDIT-CHANGE-003; [Audit actors](../../spec/audit/actors.md) — AUDIT-ACTOR-004; [Audit redaction](../../spec/audit/redaction.md) — AUDIT-REDACTION-002; [Approval conditions](../../spec/approvals/conditions.md) — APPROVAL-CONDITION-002 and -006; [Approval requirements](../../spec/approvals/requirements.md) — APPROVAL-REQUIREMENT-005; [Money representation](../../spec/money/representation.md) — MONEY-REPRESENTATION-004.

### CORE-005.3 — Evaluation follows declared facts and context

**Introduced:** v0.5
**Last updated:** v0.5
**Last updated on:** 2026-09-10

**Rule**

For the same declared inputs, financial state, and relevant context, a financial
evaluation SHALL produce the same observable outcome. A dependency on an external
fact SHALL be identified when it affects that outcome.

**Why this matters**

Reconciliation, challenge, and audit require reproducible outcomes from their
stated basis. Hidden dependence prevents that review.

**Interpretation**

This covers rounding, allocation, approval conditions and chains, and workflow
guards. It does not make external facts impermissible; it requires their
relevance to be stated.

**Boundaries**

This rule does not define accounting dates, market-data sourcing, or a general
snapshotting and retention regime for external facts.

**Relevant FinKore domains**

[Money rounding](../../spec/money/rounding.md) — MONEY-ROUNDING-002; [Money allocation](../../spec/money/allocation.md) — MONEY-ALLOCATION-012; [Approval conditions](../../spec/approvals/conditions.md) — APPROVAL-CONDITION-005; [Approval chains](../../spec/approvals/chains.md) — APPROVAL-CHAIN-008; [Workflow guards](../../spec/workflow/guards.md) — WORKFLOW-GUARD-004 and -006; [Audit append-only history](../../spec/audit/append-only.md) — AUDIT-APPEND-006.

## Relationship with specifications

    CoreDoc
      -> Domain specifications
      -> Conformance requirements
      -> Implementations

The CoreDoc supplies foundation-level financial obligations. Domain
specifications define precise scope and behaviour; conformance verifies observable
requirements; implementations realise that behaviour. A lower layer may refine a
CoreDoc rule but shall not silently contradict it.

## Evolution of CoreDoc

Core Principle and Financial Rule identifiers are stable references. A CORE-XXX
or CORE-XXX.N identifier SHALL NOT be reused for an unrelated principle or rule.
A removed, replaced, or superseded rule remains traceable in historical records
rather than being silently reassigned.

Introduced records entry into CoreDoc. Last updated and Last updated on record
the most recent normative change. Editorial-only changes SHALL NOT update those
fields.

## External review

Reviewers may challenge a Financial Rule by its stable identifier. A challenge
may identify an accounting counterexample, control weakness, jurisdictional
limitation, ambiguity, missing exception, or proposed replacement. Agreement with
one rule does not imply approval of the CoreDoc as a whole.

## Relationship to FinKore v0.5

This draft is limited to the current Money, Workflow, Audit, Approvals, and
Financial Entities specifications. It makes no claim that unspecified future
domains or policy choices have already been standardised.
