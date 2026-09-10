# FinKore CoreDoc

**CoreDoc version:** v0.5  
**Document date:** 2026-09-10  
**Status:** Initial normative draft

The FinKore CoreDoc contains the foundational principles governing FinKore specifications. It identifies the financial-system obligations that must remain true for FinKore behavior to remain trustworthy, portable, auditable, and accountable across implementations and future specifications.

The CoreDoc is technology-independent. It defines foundational financial meaning, not software design.

## Purpose

The CoreDoc defines the principles behind FinKore domain specifications. Future FinKore specifications SHOULD remain compatible with these principles.

A specification that intentionally diverges from a CoreDoc principle SHOULD explicitly identify the affected principle and justify the divergence. Such justification is important because CoreDoc principles may affect multiple downstream domain specifications, conformance requirements, implementations, and external review assumptions.

## Scope

The CoreDoc governs financial meaning and system behavior at the principle level.

It does not define APIs, programming languages, implementation architecture, storage mechanisms, framework choices, concrete data structures, user interfaces, authorization systems, transport protocols, or individual conformance vectors.

The CoreDoc does not attempt to define a complete financial system. It records foundational principles that are supported by FinKore specifications and conformance evidence up to v0.5.

## Normative Language

The terms **MUST**, **MUST NOT**, **SHALL**, and **SHALL NOT** express mandatory requirements and prohibitions. **SHOULD** expresses a recommendation that may be departed from with documented justification. **MAY** expresses permitted behavior.

Lowercase uses of these words have their ordinary meaning.

# Core Principles

### CORE-001 — Explicit Financial Meaning

**Introduced:** v0.5  
**Last updated:** v0.5  
**Last updated on:** 2026-09-10

**Principle**

Financial meaning SHALL be explicit. A system following FinKore principles MUST NOT infer material financial meaning from presentation labels, storage order, identifier format, implementation mechanisms, missing facts, or undeclared defaults.

**Rationale**

Financial systems become unreliable when important meaning is guessed. Currency compatibility, lifecycle state, approval applicability, event type, terminal status, and ordering can materially affect financial outcomes and must therefore be grounded in declared domain facts.

**Implications**

Specifications should identify the facts, policies, declarations, and domain terms that determine an outcome. A system must not treat a display name as identity, a method name as a financial event type, a missing approval fact as non-applicability, a customary currency scale as calculation precision, or an arbitrary retrieval order as causality.

**Scope and limitations**

This principle does not prohibit convenient user interfaces, local display formats, or implementation-specific metadata. It requires that such conveniences do not become the source of material financial meaning unless a specification explicitly assigns that role.

### CORE-002 — Monetary Semantic Integrity

**Introduced:** v0.5  
**Last updated:** v0.5  
**Last updated on:** 2026-09-10

**Principle**

Money SHALL preserve its exact monetary meaning. A monetary amount MUST remain associated with its currency, MUST use exact decimal semantics where monetary value is represented, and MUST NOT be rounded, converted, relabeled, or compared across currencies without an explicit governing rule.

**Rationale**

Incorrect monetary arithmetic, implicit rounding, unsafe numeric representation, or silent currency treatment can create material financial misstatements. Monetary values are meaningful only when their amount and currency are preserved together.

**Implications**

Specifications should distinguish calculation scale from currency metadata, require explicit rounding when precision is reduced, reject incompatible-currency operations unless explicit conversion applies, and preserve exact monetary totals in allocations and rate application.

**Scope and limitations**

This principle does not define exchange-rate sourcing, tax rules, interest conventions, market prices, or currency availability policy. Those subjects require separate specifications before they can govern FinKore behavior.

### CORE-003 — Deterministic Financial Evaluation

**Introduced:** v0.5  
**Last updated:** v0.5  
**Last updated on:** 2026-09-10

**Principle**

For the same declared inputs, domain state, and relevant context, a FinKore financial evaluation SHALL produce the same observable outcome.

**Rationale**

Financial results must be reproducible for reconciliation, investigation, audit, dispute resolution, and cross-implementation comparison. Hidden dependence on locale, wall-clock time, uncontrolled randomness, storage order, or external services prevents reliable reconstruction.

**Implications**

Specifications should require explicit timestamps, facts, policies, ordering relationships, rounding rules, and condition inputs where those matters affect an outcome. If an evaluation depends on external facts, that dependence should be identified so the evaluation can be reviewed against the facts used.

**Scope and limitations**

This principle does not require every real-world process to be free from external facts. It requires the domain result to be determined by the facts and context the specification treats as relevant.

### CORE-004 — Stable Identity and Continuity

**Introduced:** v0.5  
**Last updated:** v0.5  
**Last updated on:** 2026-09-10

**Principle**

Financially relevant subjects, entities, events, requirements, and actors SHALL preserve stable identity within their declared scope. A continuing financial subject MUST NOT silently receive a new identity, and a distinct subject MUST NOT silently reuse another subject's identity within the same scope.

**Rationale**

Stable identity is necessary to connect financial state, actions, approvals, audit history, corrections, and accountability over time. Identity instability prevents a reviewer from determining whether later information relates to the same financial subject.

**Implications**

Specifications should distinguish stable identity from display numbers, revisions, versions, names, labels, profile data, storage keys, or presentation metadata. Import or migration should preserve identity or record an explicit mapping sufficient to maintain continuity.

**Scope and limitations**

This principle does not require one universal identifier format or global identity scope. It requires each relevant scope to preserve identity semantics consistently and transparently.

### CORE-005 — Lifecycle State Integrity

**Introduced:** v0.5  
**Last updated:** v0.5  
**Last updated on:** 2026-09-10

**Principle**

Financial lifecycle state SHALL change only through declared, valid domain transitions. A financial subject MUST have exactly one current lifecycle state when a specification defines lifecycle behavior.

**Rationale**

Lifecycle state determines what actions are permitted, what obligations apply, and what financial meaning a subject currently has. Direct, undeclared, ambiguous, or partially applied state changes undermine control and reviewability.

**Implications**

Specifications should declare valid states, initial state, directed transitions, guard conditions, terminal states, and the consequences of each state where those matters affect financial behavior. The reverse of a transition must not be inferred from the forward transition.

**Scope and limitations**

This principle does not define a universal workflow model for every financial domain. It applies when lifecycle behavior is part of the domain meaning being specified.

### CORE-006 — Controlled Mutability

**Introduced:** v0.5  
**Last updated:** v0.5  
**Last updated on:** 2026-09-10

**Principle**

Material financial information SHALL be mutable only under declared domain rules. A system MUST reject ordinary mutation of information that is immutable in the current domain state or policy.

**Rationale**

Financial trust depends on knowing when information can be changed directly and when later action must preserve the relationship to prior information. Uncontrolled mutation can obscure responsibility, alter approved facts, or detach current state from historical evidence.

**Implications**

Specifications should identify which fields or facts may change in each relevant state and which successful mutations require audit evidence. Final, approved, posted, or terminal status should not be treated as global immutability unless the applicable domain rule declares it.

**Scope and limitations**

This principle does not define correction, reversal, void, cancellation, supersession, or adjustment semantics. It also does not require all operational metadata to be immutable whenever financial fields are immutable.

### CORE-007 — Failure Atomicity

**Introduced:** v0.5  
**Last updated:** v0.5  
**Last updated on:** 2026-09-10

**Principle**

A rejected financial operation SHALL NOT create a partially applied financial result. When a domain operation fails, the relevant observable financial state, operands, committed history, and existing decisions MUST remain unchanged except where a specification explicitly defines a different failure effect.

**Rationale**

Partial failure can leave financial systems in states that were never approved, validated, balanced, or auditable. Reviewers must be able to rely on the distinction between successful domain operations and rejected attempts.

**Implications**

Specifications should define failure postconditions for operations that affect money, lifecycle state, audit history, approvals, and entities. Validation should occur before resulting changes become observable when failure would otherwise expose incomplete or invalid financial state.

**Scope and limitations**

This principle concerns domain-observable financial effects. It does not prescribe database transaction mechanisms, logging, retry systems, or transport failure handling.

### CORE-008 — Historical Integrity

**Introduced:** v0.5  
**Last updated:** v0.5  
**Last updated on:** 2026-09-10

**Principle**

Committed material financial history SHALL NOT be destructively rewritten where doing so would prevent reconstruction of prior financial states, actions, decisions, or explicitly recorded ordering relationships.

**Rationale**

Financial systems require historical reconstruction for audit, reconciliation, investigation, dispute resolution, approvals review, and accountability. Replacing or deleting committed history can conceal what happened and why later state exists.

**Implications**

Corrections, redactions, later decisions, and exceptional transformations should preserve detectable evidence of their relationship to prior history. A later approval must not erase a prior rejection, and a redaction must not pretend that the event or protected value position never existed.

**Scope and limitations**

This principle governs logical financial history, not a particular physical storage technology. It does not require every operational or non-material piece of application state to be retained indefinitely.

### CORE-009 — Evidentiary Sufficiency

**Introduced:** v0.5  
**Last updated:** v0.5  
**Last updated on:** 2026-09-10

**Principle**

Material financial actions SHALL preserve sufficient evidence to identify what occurred, when it occurred, the financially relevant subject affected, the responsible actor when known, and the domain facts necessary to evaluate the action's meaning.

**Rationale**

A financial action without adequate evidence cannot be reliably reconstructed, attributed, challenged, approved, or reconciled. Evidence links current financial state to prior decisions and events.

**Implications**

Specifications should define the minimum evidence required for domain events, changes, approvals, lifecycle transitions, and material mutations. Evidence should use stable domain representations rather than localized display text or implementation-specific names.

**Scope and limitations**

This principle does not require event sourcing, a universal audit schema, or disclosure of protected content. Evidence requirements may vary by domain and materiality.

### CORE-010 — Approval Accountability

**Introduced:** v0.5  
**Last updated:** v0.5  
**Last updated on:** 2026-09-10

**Principle**

Approval SHALL be based on declared requirements, eligible decision-makers, explicit outcomes, and the relevant subject facts against which the decision was made. Authorization to perform an operation MUST NOT by itself be treated as approval.

**Rationale**

Approval is a business control, not merely technical access. Treating permission to act as approval, or treating an approval as valid after relevant facts have changed, can bypass financial controls.

**Implications**

Specifications should distinguish pending, approved, rejected, unresolved, and not-applicable states where they have different control meaning. Approval outcomes should be derivable from applicable requirements and effective decisions, and decisions should not remain effective for materially changed facts unless a declared policy so provides.

**Scope and limitations**

This principle does not define RBAC, authentication, authorization policy, quorum, delegation, withdrawal, expiration, escalation, or approval-definition migration.

### CORE-011 — Semantic Distinction Preservation

**Introduced:** v0.5  
**Last updated:** v0.5  
**Last updated on:** 2026-09-10

**Principle**

Distinct financial meanings SHALL remain distinguishable. A system MUST NOT collapse materially different states such as absent, null, unknown, redacted, pending, rejected, not applicable, unresolved, or zero when the governing domain distinguishes them.

**Rationale**

Many financial controls depend on distinctions that may appear superficially similar. Missing evidence is not the same as evidence of absence. Unknown attribution is not a known actor. Pending approval is not rejection or approval. A zero monetary amount is not an omitted amount.

**Implications**

Specifications should define when omission, nullability, redaction, unknown attribution, unresolved conditions, and explicit negative outcomes have different meanings. Representations should preserve those distinctions across domain boundaries.

**Scope and limitations**

This principle applies only when the distinction is materially relevant or explicitly defined by the governing domain. It does not require every possible technical representation difference to carry financial meaning.

### CORE-012 — Policy-Authorized Confidentiality Without Evidentiary Destruction

**Introduced:** v0.5  
**Last updated:** v0.5  
**Last updated on:** 2026-09-10

**Principle**

Protected financial or actor information MAY be withheld only under an identified policy or authority, and such withholding SHALL preserve the material evidence required to understand that an event, action, change, or attribution existed.

**Rationale**

Financial systems must balance confidentiality with auditability. Removing protected content without preserving evidence can destroy the ability to reconstruct material history, while exposing protected content can violate confidentiality obligations.

**Implications**

Specifications should distinguish redaction from absence, preserve event identity and other required event meaning after redaction, and record evidence that a redaction occurred when committed logical history is affected. Error details and validation findings should avoid unnecessary disclosure of sensitive values.

**Scope and limitations**

This principle does not define jurisdiction-specific privacy, secrecy, or retention law. It also does not define cryptographic deletion, secure erasure, access-control models, or retention automation.

### CORE-013 — Portable Domain Failure Semantics

**Introduced:** v0.5  
**Last updated:** v0.5  
**Last updated on:** 2026-09-10

**Principle**

Material domain failures SHALL be identified by stable, portable failure categories. Failure meaning MUST NOT depend on localized prose, implementation exception names, stack traces, transport status, or framework-specific diagnostics.

**Rationale**

Financial systems often span multiple services, languages, and organizational boundaries. A portable failure category allows downstream systems, auditors, and operators to understand whether a failure was caused by invalid money, incompatible currency, rejected workflow transition, unsatisfied approval, immutable state, or another domain condition.

**Implications**

Specifications should define stable portable error codes for material domain failures and preserve primary domain-specific codes when failures pass through composing domains. Additional diagnostic context may be supplied only when it does not alter code meaning or expose restricted information.

**Scope and limitations**

This principle does not define transport status codes, exception class names, user-facing messages, localization formats, or a complete error taxonomy for every possible operational failure.

### CORE-014 — Portable Financial Equivalence

**Introduced:** v0.5  
**Last updated:** v0.5  
**Last updated on:** 2026-09-10

**Principle**

Equivalent financial facts SHALL retain equivalent domain meaning across conforming FinKore implementations, subject to the same declared specification, inputs, context, and state.

**Rationale**

FinKore exists so financial behavior can remain consistent across languages, services, frameworks, and implementation choices. If equivalent facts produce incompatible meanings across implementations, the specification no longer provides trustworthy portability.

**Implications**

Specifications should define observable behavior precisely enough for conformance evaluation. Conformance evidence should verify valid behavior, rejected behavior, boundary behavior, invariants, and plausible financial defects where appropriate.

**Scope and limitations**

This principle does not require identical APIs, internal representations, storage systems, or implementation architecture. It concerns observable financial behavior and meaning.

### CORE-015 — Undefined Financial Semantics Shall Not Be Inferred

**Introduced:** v0.5  
**Last updated:** v0.5  
**Last updated on:** 2026-09-10

**Principle**

Where FinKore has not defined a material financial behavior, a conforming specification or implementation MUST NOT silently invent that behavior and present it as FinKore semantics.

**Rationale**

False precision is dangerous in financial systems. Undeclared semantics for correction, reversal, authorization, concurrency, retention, taxation, exchange conversion, or approval migration may appear plausible while materially changing financial obligations or controls.

**Implications**

Specifications should mark deferred or out-of-scope subjects explicitly. Implementations may support additional application behavior, but they should not claim such behavior is defined by FinKore unless the relevant specification and conformance obligations exist.

**Scope and limitations**

This principle does not prohibit experimentation, implementation extensions, or composing-domain rules. It requires that such behavior be identified as outside current FinKore semantics until standardized.

# Principle Metadata and Audit Trail

Every Core principle contains a stable `CORE-XXX` identifier, a canonical principle name, the version in which it was introduced, the version in which its normative meaning was most recently changed, and the date of that latest normative change.

A `CORE-XXX` identifier MUST remain stable once introduced. A principle MUST NOT receive a new identifier merely because its wording, name, interpretation, or scope changes. A removed, replaced, or superseded principle should preserve its identifier in historical records so prior references remain traceable.

`Introduced` identifies the FinKore/CoreDoc version in which the principle first became part of the CoreDoc. `Last updated` identifies the version in which the normative meaning of the principle most recently changed. `Last updated on` records the calendar date of that normative change in ISO `YYYY-MM-DD` format.

Editorial-only changes SHOULD NOT modify `Last updated` or `Last updated on`. The metadata represents changes in normative meaning, not ordinary document editing.

# Relationship With Specifications

FinKore uses the following hierarchy:

```text
CoreDoc
  -> Domain Specifications
  -> Conformance Requirements
  -> Implementations
```

The CoreDoc defines foundational principles. Domain specifications translate those principles into precise financial behavior. Conformance requirements verify portable observable behavior. Implementations determine how that behavior is technically achieved.

The CoreDoc does not contain detailed conformance tests or implementation rules. A domain specification may refine a CoreDoc principle for a particular financial domain, but it should not silently contradict the foundational meaning of the principle.

# Evolution of CoreDoc

The CoreDoc is expected to evolve. Contributors may propose clarifications, challenges to assumptions, new principles, modifications to existing principles, changes in scope, or removal or replacement of principles that are no longer defensible.

Proposed changes should reference the affected stable `CORE-XXX` identifier where one exists. Changes affecting normative meaning require greater scrutiny than ordinary documentation edits because they may affect multiple downstream specifications, conformance requirements, implementations, and external review assumptions.

This section does not establish a formal governance board or certification process.

# External Review

Future CoreDoc versions may be independently reviewed by accountants, auditors, financial controllers, internal-control specialists, IT auditors, risk professionals, compliance professionals, financial-system architects, and distributed-systems specialists where relevant.

External review exists to challenge assumptions. Review should attempt to identify where a principle may be incorrect, incomplete, ambiguous, overly broad, technically impossible, financially unsound, jurisdiction-dependent, or based on an assumption that does not hold in real financial systems.

Review MUST NOT be described as certification unless an actual certification process has been defined and completed.

# Relationship to FinKore v0.5

This initial CoreDoc describes principles that can be justified from FinKore specifications, conformance materials, agentic contract documents, documentation, and implemented domains up to v0.5.

The initial CoreDoc does not attempt to predict every future FinKore domain. Where repository evidence is not yet strong enough to establish a foundational principle, the subject remains outside the CoreDoc until future specifications support it.
