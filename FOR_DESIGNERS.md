# For designers: what I want for FinKore.dev

This is a design brief for the website redesign. It brings together what I want
people to understand, find, and be able to do when visiting FinKore.dev. Use it
as a working guide: learn about the project, understand the priorities, propose
the experience, and check whether it meets the goals below.

I want a website that makes FinKore easy to understand at a glance, shows what
is already available to explore, and invites people to participate.
The mobile experience is a priority from the start of the design process.

This document guides design. [BRANDING.md](./BRANDING.md) defines the brand
and its communication; the technical documents continue to define the project's
financial contract. This brief does not change those responsibilities.

## Start with these references

Read with these questions in mind; you do not need to master the technical documentation:

| Reference | What to look for |
| --- | --- |
| [Branding](./BRANDING.md) | How the brand presents itself, writes, and applies its visual identity. |
| [Project overview](./README.md) and [Where to start](./docs/where-to-start.md) | The problem we solve, who it is for, and what people can use today. |
| [Current home page](./learn/index.html) | Where the explanation, hierarchy, and navigation paths could be clearer. |
| [Network](./learn/network.html) | How people, knowledge, and initiatives contribute to the project's goal. |
| [Legacy Archive](./legacy/README.md) and [its reading page](./learn/legacy.html) | The human value of the archive and how to discover interviews. |
| [Elaine Richardson's interview](./learn/legacy-001-elaine-richardson.html) | What reading a long story on a phone should feel like. |
| [Publishing tools](./docs/tools/README.md#editing-learn-pages) | How content and pages are maintained and generated today. |

## FinKore in plain language

Teams building financial systems encounter similar problems: how to represent
money, choose a rounding rule, preserve the history of a decision, or determine
whether an approval is still valid. Each team needs to understand these rules
and their consequences.

FinKore organizes some of this knowledge into an open reference so teams can
consult explicit rules and examples of expected results before building their
own systems.

One possible introductory explanation is:

> FinKore is an open reference for the rules that recur in financial systems.
> It helps teams understand how these behaviors should work and implement them
> in their own products.

What we deliver today is a specification: documented rules, acceptance cases,
and operation descriptions for software clients, including agents. Each team
implements and evaluates that behavior in its chosen language and architecture.
There is no ready-to-install financial library or financial service operated
by the project.

For designers, these terms can be understood as follows:

| Project term | Plain-language explanation |
| --- | --- |
| CoreDoc | The principles and obligations that underpin the project. |
| Specification | The rules described precisely. |
| Conformance | Cases with inputs and expected results that help evaluate an implementation. |
| Agentic Contract | Operation descriptions that help software clients understand how to interpret them. |
| Network | The initiatives that bring people and knowledge together to strengthen this foundation. |

The initial explanation needs to make sense to someone unfamiliar with these
names. Technical terms can appear as people choose to read further.

## The potential I want to communicate

I want FinKore to become a place people consult before reinventing a financial
rule. A common foundation can help different teams share knowledge and discuss
how systems are expected to behave.

The brand's two pillars help explain this:

- **The Standard:** make the rules known and explicit.
- **The Foundation:** provide a contract and reusable cases on which each team
  builds its implementation.

The website also needs to show the people behind this knowledge. Operational
experience, interviews, and expert contributions help identify questions that
engineering needs to investigate.

This is an ambition built through collective work. The presentation should
distinguish what is published, what is open to participation, and what remains
a proposal. Trust comes from that clarity.

## How the Network initiatives connect

Use the [Network page](./learn/network.html) as the reference for each
initiative's content and stage. It currently presents:

| Initiative | Role in the project | Status the design should communicate |
| --- | --- | --- |
| **Legacy Archive** | Preserve stories and lessons from people who built and maintained financial systems. | Network's current priority, with a published interview and an invitation to share stories. |
| **Club** | Bring people together to exchange knowledge and discuss real problems. | Entry through discussions and expressions of interest; activities are being shaped. |
| **Contests** | Investigate challenges, assumptions, and difficult cases through engineering challenges. | In preparation, with no contest open. |
| **Experts** | Bring financial, accounting, auditing, and other expertise to challenge and improve specifications. | Open to contributions and reviews through the existing process. |
| **Angel** | A proposal for selective support, primarily through grants, for work that explores and evaluates the FinKore foundation. | In development, with no funding or applications available. |

I want these initiatives to be understood as paths contributing to a shared
goal. The hierarchy can give more prominence to what people can already read
or access, while leaving room to explain the project's direction.

A story can raise a question; a discussion can challenge an assumption; a review
can lead to a better rule. That progression requires investigation and the
specification process. Interviews are personal accounts; expert participation
does not amount to certification or normative approval of the entire project.

When preparing a proposal, check the stages against the sources again.
The redesign should not turn intentions into available offerings.

## What needs to improve in the first impression

I still do not find FinKore easy to understand at a glance. I want the first
screen to provide enough context for someone to answer:

1. What is FinKore?
2. What problem does it help solve?
3. Does this relate to my work or interests?
4. What next step can I take here?

The slogan can reinforce the message alongside a concrete explanation.
A short example of a financial problem may help more than a sequence of
technical terms. People should find a simple starting point before needing
to interpret the repository's structure.

As a starting point for the home page hierarchy, propose:

- an opening with a short explanation and a clear primary action;
- a visible path to understand the rules and start exploring the project;
- an editorial feature for Legacy and an interview available to read;
- an introduction to ways of participating through Network;
- access to detailed documentation and GitHub for those who want to go further.

This sets the content direction while leaving freedom to propose the layout.
I want to evaluate clarity and navigation paths before visual polish.
We do not need everything on the first screen; we need the main paths to become
apparent during a short exploration.

## Legacy and interviews need to be easy to discover

The archive is an important part of what we already offer visitors.
[Elaine Richardson's interview](./learn/legacy-001-elaine-richardson.html) is
currently published. I want a direct entry to the archive from the home page
and a clear way to start reading an interview without first needing to
understand the entire Network page.

Treat interviews as editorial content with value of their own. The presentation
should show who the person is, which topics appear, and why the story is worth
reading. Preserve the interviewee's voice and distinguish quotations, summaries,
and editorial notes. The [archive's principles](./legacy/README.md#editorial-principles)
continue to apply.

Think through the whole journey: discovering a story, opening the interview,
reading comfortably, navigating its sections, and returning to the archive or
the project. The layout should work with one interview and grow as more approved
interviews are published, without inventing content to fill the layout.

## Mobile as the starting point

I want the experience designed for a small screen first. Navigating,
understanding the project, and reading an interview on a phone need to work
very well. Desktop also deserves its own composition that makes good use
of the available space.

In the proposal, pay particular attention to:

- **Hierarchy:** make the explanation and next step easy to find, without an
  opening that takes several screens just for decorative elements.
- **Navigation:** simple menus, understandable destinations, and clear access
  to Legacy, documentation, and participation.
- **Reading:** comfortable text size, good spacing, naturally wrapping headings,
  and sufficient contrast.
- **Touch:** links and controls that are easy to activate without relying on hover.
- **Long content:** indexes that help orient readers without taking over the
  screen or hiding interview responses and documents.
- **Accessibility:** visible focus, keyboard navigation, semantic structure,
  and content that remains usable when text is enlarged.
- **Adaptation:** pages without horizontal scrolling across the entire layout;
  wide tables and code need their own treatment.
- **Performance:** appropriately sized images and fonts, with reading and
  navigation available without depending on animations or heavy decorative downloads.

When presenting the proposal, show the journeys on mobile and desktop. Include
the home page, entry to the archive, a long interview, and a technical document.

## Brand and communication are part of the experience

Follow [BRANDING.md](./BRANDING.md) in both the interface and the copy.
Use the official palette, Aspekta typography, and original brand assets,
respecting versions, proportions, legibility, and clear space.

The tone should be precise, accessible, pragmatic, and calm. I want the website
to explain the project's value through examples and concrete content. Avoid
promises of guaranteed financial correctness or presentations that make FinKore
look like a bank, a payments platform, or a SaaS product.

The current website is in English. Any change in language or translation
strategy needs to be addressed explicitly.

## The design needs to work with the existing build

The published website comes from [learn/](./learn/). Much of its content is
written in **Markdown** and automatically converted to HTML by the repository's
tools. This generation happens during the **build**; the resulting pages are
static and arrive in the browser ready to read.

I want to preserve this ease of maintenance. The design should provide reusable
structures that accommodate real content, including long headings, lists,
tables, code, quotations, and interviews of different lengths.

| Part of the site | Where content is maintained | How the design should integrate |
| --- | --- | --- |
| Home and Network | Editorial content in `learn/index.html` and `learn/network.html`. | Preserve generated areas and shared synchronization of navigation and CSS versions. |
| CoreDoc | `docs/coreDoc/core-doc.md`. | Work on the template and styles; preserve source wording, identifiers, metadata, and links. |
| Documentation pages | Markdown registered with the generators. | Use components that continue to work after pages are regenerated. |
| Archive and interviews | `legacy/README.md` and approved interviews in `legacy/interviews/`. | Evolve editorial templates and presentation metadata without duplicating responses. |

Interviews are explicitly registered in `LEARN_PAGES`, in the
[build-learn-pages.js](./docs/tools/build-learn-pages.js) generator, after
publication approval. Adding a file to the directory does not automatically
publish it.

The implementation workflow is described in the
[editing instructions](./docs/tools/README.md#editing-learn-pages):

```bash
npm ci --no-audit
npm run learn:build
npm run verify
```

Use the Node version maintained by the repository, as described in the
[tools guide](./docs/tools/README.md#supported-node-setup).
Each build updates the CSS cache identifier shared across pages. Sources,
templates, and generated HTML need to be delivered in sync. Verification
commands check the existing output without regenerating it.

Do not base the proposal on manual changes to generated HTML that would
disappear in the next build. Preserve existing URLs and anchors or address
their changes explicitly during implementation.

The current profile uses local resources and native interactions, with
JavaScript restricted to the existing behavior of the CoreDoc mobile index.
Forms, additional scripts, and remote resources require changes to the tools
and publication rules. If a proposal depends on these, explain the need and
impact before treating them as an available part of the solution. The limits
are documented in the [tools guide](./docs/tools/README.md).

## How to work and present a proposal

1. Read the references and explain FinKore in your own words, in a way that
   someone outside the project can understand.
2. Propose the content hierarchy and main journeys, starting with mobile.
   Show how Legacy and interviews become visible.
3. Apply the brand and develop compositions for mobile and desktop.
4. Show how components receive content from the current sources and which
   changes would be needed in the templates or build.
5. Evaluate the journeys with people unfamiliar with FinKore and refine the
   points where the explanation or navigation was unclear.

In the presentation, I want to be able to assess:

- whether someone understands the project's purpose after a brief look;
- whether they find an interview and start reading without knowing the internal structure;
- whether they understand how to explore the rules or participate in Network initiatives;
- whether they distinguish available content from initiatives in preparation;
- whether they can navigate and read comfortably on mobile and desktop;
- whether the proposal still works after regenerating the website with real
  content of varying lengths.

The result I am looking for is a clear, inviting experience consistent with
FinKore: people understand the idea, discover its content, and find a path
to learn or contribute.
