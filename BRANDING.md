# FinKore Brand, Visual Identity & Communication Core

This document defines how FinKore should communicate and apply its visual identity.

Use it as the source of truth when writing website pages, landing pages,
documentation introductions, product explanations, examples, calls to action,
and other public-facing content, and when designing branded materials.

The visual identity guidance is based on the supplied **Visual Identity Guide**
(`Finkore_MIV.pdf`). Page references below refer to that manual. The manual and
original brand artwork govern visual construction; the communication guidance
here preserves FinKore's specification-first positioning and current scope.
Brand guidance does not define financial behavior or change the published contract.

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

> Define once. Build many times.

This is also the brand slogan. Use Aspekta when applying it in visual materials
(manual, p. 23).

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

These two territories also underpin the monogram: the upper orange element
represents The Standard, and the lower blue element represents The Foundation
(manual, p. 4).

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

## 15. Visual Identity Concept

The visual identity expresses structure, logic, precision, and technical
credibility (manual, pp. 4–5). The logotype uses a timeless sans-serif design
with structured curves and angles. The monogram brings The Standard and
The Foundation together in two distinct geometric elements.

Use **FinKore** in written communication. The lowercase lettering in the logo
is part of the original artwork; preserve it as supplied.

The visual character should support the voice described above: rigorous,
contemporary, clear, and approachable.

---

## 16. Color Palette

The manual defines three primary colors and two supporting secondary colors
(manual, pp. 7–8).

| Color | Palette | HEX | RGB | Pantone for print |
| --- | --- | --- | --- | --- |
| Black | Primary | `#1D1D1D` | `29, 29, 29` | Black 6 C |
| Electric Blue | Primary | `#1925FE` | `25, 37, 254` | 2736 C |
| Bright Orange | Primary | `#FE3919` | `254, 57, 25` | 172 C |
| Gray | Secondary | `#969797` | `150, 151, 151` | Cool Gray 7 C |
| White | Secondary | `#FFFFFF` | `255, 255, 255` | Not specified in the manual |

Black conveys rigor and sophistication. Blue reinforces technological
precision. Orange adds energy and purposeful emphasis. Gray and white support
clarity and balance.

Use the RGB values for digital media, including websites, social media, and
video. Use the specified Pantone versions for printed materials (manual, p. 25).
The manual does not define CMYK values or a Pantone reference for white; do not
present inferred conversions as official brand specifications.

---

## 17. Typography

**Aspekta** is the brand typeface (manual, pp. 13–14).

| Use | Typeface | Weight |
| --- | --- | --- |
| Titles and headlines | Aspekta | 800 |
| Body text and supporting copy | Aspekta | 400 |
| Slogan in visual applications | Aspekta | Follow the supplied composition; no separate weight is specified |

Its geometric precision and clean, structured forms express technical rigor.
Its contemporary, approachable character keeps communication readable and
accessible.

Use the original logo artwork for the wordmark. Setting the brand name in
Aspekta is not a replacement for the logo.

---

## 18. Logo Versions and Integrity

The manual defines two configurations (manual, p. 16):

- **Horizontal logo — primary:** the full brand signature.
- **Monogram — secondary:** the standalone symbol, selected where appropriate
  for the application while preserving recognition and legibility.

For single-color applications, use the supplied positive or negative version:
black on a light background or white on a dark background (manual, pp. 17, 25).
Choose the version that remains clearly legible on the permitted background.

Preserve the original artwork's colors, layout, proportions, lettering, and
orientation. The incorrect-use examples prohibit (manual, p. 18):

- changing the logo's colors outside the supplied versions;
- stretching, compressing, or otherwise distorting it;
- rotating it;
- changing the relative proportions or spacing of its elements;
- replacing or modifying its typography.

The construction grid explains the symbol's diagonal, vertical, and horizontal
lines and precise curves (manual, p. 22). Use the original artwork rather than
reconstructing it from that grid or typing an approximation.

---

## 19. Logo Size and Clear Space

### Minimum recommended height

The manual's maximum recommended reduction is **4 mm in height** (manual,
p. 19). Preserve the aspect ratio when resizing and ensure that the mark remains
legible in its final medium.

The manual does not specify a separate minimum size in screen pixels. Do not
present a pixel conversion as an official digital minimum.

### Protection area

The manual recommends, ideally, **at least 70 px of clear space** between the
logo and surrounding elements (manual, p. 20). Keep this area free of text and
other competing elements.

Treat 70 px as the manual's stated recommendation. It does not define a
proportional clear-space formula or a separate print measurement.

---

## 20. Backgrounds and Supporting Graphics

### Logo backgrounds

The manual directs the horizontal logo and monogram to be used on primary
palette backgrounds or the dedicated brand background. Its illustrated
applications also explicitly include white (manual, p. 21).

Choose the supplied logo version that preserves legibility. The examples show
dark lettering on white, light lettering on black, a white monochrome mark on
blue, and contrasting versions over the brand background. Keep these approved
applications as the reference when choosing a composition.

### Monogram pattern

The supporting pattern derives from the monogram and communicates structure,
technical refinement, and precision (manual, p. 10). It may be used at different
sizes and in different compositions, ideally extending beyond the boundaries
of the piece.

Use the supplied pattern artwork. Cropping the supporting pattern at the edge
of a composition is distinct from altering the logo itself.

### Dedicated brand background

The manual supplies a distinctive background with dark areas, blue and orange
light, and fine linear texture (manual, p. 11). Use that artwork for applications
calling for the brand background. The manual does not define gradient stops,
angles, or a procedural recipe for recreating it.

---

## 21. Slogan and Composition

The brand slogan is:

> Define once. Build many times.

Set it in Aspekta for visual identity applications (manual, p. 23). Uppercase
presentation is shown in the supplied artwork. Preserve the wording and the
logo's proportions when using a supplied logo-and-slogan composition.

**Financial behavior, made explicit.** remains the positioning essence from
Section 3. It also appears in the manual's layout examples; use it as supporting
communication while retaining the defined slogan.

The examples illustrate large presentation layouts, a mobile icon, a laptop
layout, a watch application, and a full-background brand composition (manual,
pp. 27–32). They demonstrate visual applications. Their dates, version numbers,
and device mockups do not establish release status or product capabilities.

---

## 22. Review Before Applying the Identity

Before delivering a branded composition, check:

- Does it use the original horizontal logo or monogram without alteration?
- Does the selected color or monochrome version suit the permitted background?
- Are the palette values and RGB/Pantone format appropriate to the medium?
- Are titles set in Aspekta 800 and supporting text in Aspekta 400?
- Is the logo legible, with the size and clear-space recommendations respected?
- Do the pattern and background follow the supplied artwork and examples?
- If present, does the slogan read "Define once. Build many times." in Aspekta?
- Does the copy describe the current FinKore contract and available artifacts
  accurately?

---

## 23. Final Rule for Generated Content

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
