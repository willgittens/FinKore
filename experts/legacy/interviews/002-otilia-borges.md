# FinKore Legacy Archive — Interview #002

**Interviewee:** Otilia Borges  
**LinkedIn Profile:** https://www.linkedin.com/in/otilia-borges-33a19a1b/  
**Series:** FinKore Legacy Interviews  
**Status:** Approved for publication — confirmed by the project maintainer on 17.11.2026

> The purpose of this interview is to preserve the experiences and lessons of engineers who built and maintained financial and legacy systems. The interviewee's responses are reproduced in their original wording.

## The interview

### 1. First, tell us a little about yourself! How did your career as a developer start, and how did you end up working with banking or financial systems?

I started my journey in technology when I was just 14 years old, studying Data Processing at Fundação Bradesco, a technical high school in Brazil.

At that time, students who completed the Data Processing program at Fundação Bradesco would start working at Banco Bradesco's Data Processing Department, usually at the age of 16 or 17.

So, imagine that! At just 16 or 17 years old, we were already working with COBOL and Assembler in a major Brazilian bank.

That's how my career in technology began, and why I've been involved with banking and financial systems since the very beginning of my professional journey.

### 2. Looking back, is there a system, project, or technical challenge you're particularly proud of? I'd love to hear the story behind it.

One of the biggest challenges of my career was during the Collor Plan in Brazil, back in 1990.

The Brazilian government suddenly announced an economic plan that froze people's bank accounts, allowing customers to access only up to 50,000 cruzados novos, the Brazilian currency at that time.

Imagine the challenge for us developers!

In just one weekend, we had to modify several COBOL programs to implement these new rules across the banking systems.

We had very little time to make all these changes, and everything had to be ready when the banks reopened on Monday.

It was an incredibly challenging experience, and one I'll never forget. It showed me how critical banking systems are and how quickly developers sometimes need to respond to major economic decisions.

### 3. Do you remember any strange rules, unusual code, or unexpected situations that taught you something important? Especially things that might look unnecessary today but had a very good reason to exist.

Oh, yes! I remember a very interesting situation involving COBOL and printed reports.

Back then, we didn't have PDFs or digital reports. Everything was printed on paper, and we used a lot of paper!

In COBOL, we had to manually control the page layout. We needed to count how many lines were printed on each page, update a line counter, and reset it whenever a new page started. The program was also responsible for printing the page headers and footers.

I remember a situation where a colleague modified a COBOL program but forgot to reset the line counter when starting a new page.

The result? More than 1,000 sheets of paper were printed continuously, without proper page breaks, headers, or footers!

And here's the worst part: that report had to be sent to the Brazilian Central Bank the very next day!

At that time, everything was physically printed and delivered. There was no digital submission.

I can't mention which financial institution this happened at, but it's a story I'll never forget!

It taught me that even a small detail in a COBOL program, like resetting a counter, could have a huge operational impact.

### 4. Have you ever been involved in replacing or modernizing an old financial system? What were the biggest challenges, and what lessons did you take away?

Actually, this is exactly what I've been working on in recent years!

I specialize in legacy system modernization, particularly COBOL applications running on mainframes.

Today, I use modern programming languages, technologies, and AI tools to help modernize these systems.

But in my experience, the biggest challenge isn't the technology itself. It's preserving the business rules.

In legacy systems, especially those written in COBOL decades ago, many business rules are embedded directly in the source code. Often, there's little or no documentation explaining why certain decisions were made.

And here's another challenge: many of the developers who originally built these systems have already retired or passed away. So, in many cases, there's no one left to explain the original business logic.

That's why extracting and understanding these rules accurately is so critical. We need to ensure accuracy, traceability, and validation throughout the modernization process.

When we migrate a system to a modern technology, we must make sure we don't accidentally change its business behavior or compromise the integrity of its rules.

I always say that modernizing a legacy system isn't just about translating COBOL into Java, for example. It's about preserving decades of business knowledge while moving to a new technological environment.

I'm also a certified Generative AI Leader, and today I work extensively with AI tools to support legacy modernization.

I recently spent time in Silicon Valley, exploring the latest innovations in Artificial Intelligence and technology, and looking at how these advances can help transform and modernize legacy systems.

I also give talks and presentations on these topics, sharing my experience in mainframe modernization, COBOL, and Generative AI.

For me, it's fascinating to combine nearly four decades of mainframe experience with the latest advances in Generative AI.

The technology can change, but the business knowledge must survive.

### 5. After all these years, what's the one thing you think the next generation of financial software developers should never forget?

If there's one piece of advice I would give to the next generation of financial software developers, it's this: Learn how to learn, and never stop learning!

Throughout my career, I've worked with many financial institutions, including Brazilian, Latin American, and American banks.

One thing I've learned is that every bank operates differently. Each institution has its own business rules, processes, and technologies. And every country has its own regulatory requirements that financial systems must comply with.

So, being a good developer isn't just about knowing how to code. It's about understanding the business, the regulations, and constantly adapting to change.

Today, with Artificial Intelligence transforming software development, this is even more important.

AI can generate code, automate tasks, and even help modernize complex legacy systems. But if developers don't understand what the AI is producing, how can they validate the results?

You cannot validate something you don't understand!

And here's something I often mention in my talks: the future will bring professions that don't even exist today, technologies we haven't imagined yet, and problems we don't even know we'll have to solve.

That's why learning how to learn is such an essential skill. We need to stay curious, continuously develop new skills, and be prepared to face challenges that haven't even appeared yet.

After almost four decades working in technology, I can tell you that the ability to continuously learn and adapt is what keeps professionals relevant in the market.

Technology will continue to evolve. AI will continue to transform our jobs. But those who know how to learn will always be better prepared for what's coming next.

**My message to the next generation is simple: Don't just learn a programming language. Learn how to learn. And never stop studying!**

---

## Editorial note — Privacy and confidentiality

This interview preserves the interviewee's original wording, personal views, and writing style. The financial institution in the printed-report account is not named by the interviewee and is not identified by the archive.

Further changes can be made at the interviewee's request.

For FinKore's non-normative analysis, see [this interview's comparison inventory](../traceability.md#legacy-002-otilia-borges). The comparisons link to [CORE-005.3 — Evaluation follows declared facts and context](../../../docs/coreDoc/core-doc.md#core-0053-evaluation-follows-declared-facts-and-context) and [CORE-002.2 — Validation is complete, fact-based, and non-mutating](../../../docs/coreDoc/core-doc.md#core-0022-validation-is-complete-fact-based-and-non-mutating). These are analyst interpretations, separate from the interviewee's responses, and do not establish new financial requirements.
