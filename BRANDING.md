# FinKore Brand & Communication Core

This document defines how FinKore should communicate.

Use it as the source of truth when writing website pages, landing pages,
documentation introductions, product explanations, examples, calls to action,
and other public-facing content.

This is primarily a communication guide, not a visual design guide.

---

## 1. What FinKore Is

FinKore is an open-source, language-independent specification and reference for
financial software behavior.

It transforms recurring financial problems into:

- explicit financial specifications and stable, verifiable requirements
- portable acceptance cases and requirement traceability
- an Agentic Contract describing canonical operations for machine clients
- maintenance tools that validate the published artifacts

Teams reuse the rules and acceptance evidence in their own products. Consumers
choose their language and architecture, implement the behavior, and own
invocation, observation, comparison, and reporting. The repository publishes the
contract; it does not maintain a financial implementation, installable financial
library, Conformance Runner, or executable service.

FinKore exists underneath product-specific business logic.

It does not attempt to replace what makes a financial product unique.

Instead, it addresses the recurring financial foundations that engineering
teams repeatedly implement themselves:

- money
- approvals
- workflows
- audit
- financial entities
- validation within the Financial Entities domain

Keep examples within the published Core scope. A recurring problem is not, by
itself, a supported FinKore domain.

FinKore should not be presented primarily as:

- a SaaS
- a financial platform
- a fintech product
- another developer tool
- a collection of utilities
- a generic framework
- a magical abstraction

The preferred mental model is:

> A foundation for financial software.

And, increasingly:

> A reference for how recurring financial behavior should work.

---

## 2. The Core Problem

Financial software teams repeatedly rebuild the same foundations.

The common cycle is:

Build → discover edge cases → fix → document → rebuild elsewhere.

The dangerous part is that apparently simple financial rules often carry
complex consequences.

FinKore exists to reduce this reinvention.

The recurring cost is rediscovering the rules and their edge cases independently
for every implementation. Consumer-owned implementation remains part of adoption;
the shared contract reduces the need to invent the financial semantics again.

FinKore should move the user from:

> "How should we implement this?"

toward:

> "What does the rule say?"

and then:

> "Which acceptance cases describe it, and how will we evaluate our implementation?"

---

## 3. Positioning

### Category

A foundation for financial software.

### Essence

Financial behavior, made explicit.

### Core idea

Define once.
Build many times.

### Core belief

Your product may be unique.
Your financial rules don't have to be.

### Core message

Know the rule before you write the code.

### Supporting message

Build on it instead of building it again.

### Purpose

Make recurring financial software behavior explicit, testable and reusable.

### Enemy

Reinventing financial rules from scratch.

---

## 4. The Two Pillars

FinKore communication should reinforce two complementary ideas.

### The Standard

The Standard defines what should happen.

It is about:

- rules
- specifications
- definitions
- documentation
- portable acceptance cases
- knowledge
- correctness

The desired behavior is:

LOOK IT UP.

FinKore should become a place engineers consult before implementing recurring
financial behavior from scratch.

### The Foundation

The Foundation makes that knowledge reusable across consumer implementations.

It is about:

- shared requirements and portable errors
- deterministic inputs and expected observations
- traceability from rules to acceptance evidence
- canonical operation metadata for machine clients
- consumer-owned implementation and evaluation

The desired behavior is:

BUILD ON IT.

The Standard defines the financial obligations.
The Foundation supplies a shared contract and acceptance artifacts.
Consumers implement and execute the behavior in their own environments.

Together:

> Know the rule. Build on it.

---

## 5. Communication Transformation

FinKore turns financial behavior from:

Hidden → Explicit
Implicit → Defined
Fragmented → Traceable
Repeated → Reusable

This transformation should appear repeatedly across website communication.

The value is not "more features."

The value is:

- correctness
- clarity
- reuse
- inspectability
- confidence based on evidence

---

## 6. Tone of Voice

FinKore sounds like:

> An experienced engineer in a design review.

The voice is:

### Precise

Say exactly what needs to be said.

Avoid vague claims.

### Pragmatic

Talk about real engineering problems.

Prefer concrete consequences over abstract promises.

### Rigorous

Do not claim what cannot be demonstrated.

Specifications, acceptance cases, documentation and observed implementation
results are stronger than adjectives. Distinguish published expectations from
results obtained by executing cases against a named consumer implementation.

### Calm

Authority without hype.

FinKore does not need to sound excited about itself to sound important.

---

## 7. Personality

FinKore should feel:

- precise, without being academic
- serious, without being corporate
- opinionated, without being dogmatic
- technical, without being inaccessible
- rational
- competent
- curious
- slightly skeptical
- intellectually rigorous

FinKore should never sound like marketing trying to impress engineers.

It should sound like experienced engineers explaining something they have
learned matters.

---

## 8. Editorial Principle

The most important editorial rule is:

> Show the logic.
> Don't sell the magic.

Whenever possible, explain:

1. the problem
2. why the problem exists
3. the rule
4. how the rule is made explicit
5. which acceptance cases and traceability describe it
6. how engineers implement and evaluate it in their own environment

Repository verification checks artifact structure, references, and consistency.
It does not execute financial operations or prove that a consumer implementation
conforms. Finite acceptance cases provide bounded evidence, not exhaustive proof.

Prefer evidence over promises.

Prefer:

"Defined by a specification, with portable acceptance cases for consumer evaluation."

over:

"Powerful enterprise-grade financial infrastructure."

Prefer:

"Approval decisions preserve the facts used to make the decision."

over:

"Advanced approval engine."

Prefer:

"Rounding declares both a target scale and a mode."

over:

"Robust money handling."

---

## 9. Core Vocabulary

Prefer vocabulary from this semantic territory:

- behavior
- rule
- standard
- specification
- definition
- primitive
- foundation
- correctness
- acceptance case
- evidence
- explicit
- reusable
- financial behavior
- building block
- conformance
- audit
- trace
- verify

Use words because they explain the system, not because they sound technical.

---

## 10. Language to Avoid

Avoid generic startup and developer-tool language such as:

- revolutionary
- game-changing
- seamless
- effortless
- next-generation
- cutting-edge
- supercharge
- unlock
- powerful
- blazing fast
- magical
- ultimate
- everything you need
- built for the future

Avoid unsupported claims such as:

"FinKore guarantees financial correctness."

Instead explain what is defined, which artifacts are validated, and what
execution evidence a consumer has actually obtained.

Avoid making FinKore sound like a bank, payment provider, ledger platform,
financial SaaS or fintech application.

Avoid excessive jargon.

Technical credibility should come from precision, not complexity.

---

## 11. Writing Pattern

For major website sections, prefer this structure:

### 1. Start with the engineering problem

Something recognizable and concrete.

Example:

"Financial rules rarely stay simple."

### 2. Expose the hidden complexity

Explain what normally becomes implicit, fragmented or repeated.

### 3. Introduce the rule

Show that the behavior can be explicitly defined.

### 4. Show the evidence

Specifications.
Portable acceptance cases.
Documentation.
Requirement traceability.
Consumer execution results, when available and explicitly scoped.

### 5. Introduce FinKore

FinKore should appear as the logical consequence of the problem,
not as a product being advertised.

### 6. End with reuse

The user should understand:

"I don't need to rediscover this."

---

## 12. Audience

The primary audience includes:

- Tech Leads
- Staff Engineers
- Engineering Managers
- senior software engineers
- architects
- teams building financial software

Typical domains include:

- expenses
- invoices
- approvals
- payments
- accounting-related workflows
- financial SaaS
- financial operations

This audience values:

- rigor
- documentation
- evidence
- practitioners
- transparency

They are skeptical of:

- marketing claims
- promises
- influencers
- black boxes

Write accordingly.

---

## 13. Communication Hierarchy

When generating a page, communicate ideas roughly in this order:

1. The financial engineering problem
2. Why rebuilding it independently is risky or wasteful
3. The explicit rule or behavior
4. The Standard
5. The Foundation
6. Evidence: specification, acceptance cases, traceability
7. Reuse
8. Implementation details

Do not lead with features unless the page is specifically about a feature.

---

## 14. What FinKore Is Ultimately Trying to Become

FinKore should not merely become something engineers use.

It should become something engineers consult.

The desired mental model is not:

> "There might be a library for this."

It is:

> "Let's check FinKore before we implement this."

This distinction should guide all communication.

FinKore's long-term authority comes from combining:

KNOWLEDGE + STANDARD + FOUNDATION

not simply from shipping code.

---

## 15. Final Rule for Generated Content

Before finalizing any FinKore copy, ask:

- Is the claim demonstrable?
- Is the financial behavior explicit?
- Are we explaining rather than advertising?
- Does this sound like an experienced engineer?
- Are we showing the logic?
- Are we avoiding hype?
- Does FinKore appear as a foundation/reference rather than another tool?
- Does the reader understand which rules and acceptance artifacts they can reuse?
- Is consumer ownership of implementation and execution clear?
- Are artifact validation and observed implementation results distinguished?

If not, rewrite it.

Show the logic.
Don't sell the magic.
