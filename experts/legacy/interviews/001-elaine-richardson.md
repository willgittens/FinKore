# FinKore Legacy Archive — Interview #001

**Interviewee:** Elaine Richardson  
**LinkedIn Profile:** https://www.linkedin.com/in/elainecrichardson/  
**Series:** FinKore Legacy Interviews  
**Status:** Approved by Interviewee on 12.11.2026 17:46 Berlin Time

> The purpose of this interview is to preserve the experiences and lessons of engineers who built and maintained financial and legacy systems. The interviewee’s published responses are reproduced in their original wording. One supplementary account has been withheld for confidentiality.

## The interview

### 1. First, tell us a little about yourself! How did your career as a developer start, and how did you end up working with banking or financial systems?

I started my career as a developer by blind luck. I was working as a pizza restaurant manager (jobs were scarce in 1984 when I graduated) and I applied for every job I could see advertised. I had an interview with ACCESS (now Mastercard) and did an aptitude test for a trainee programmer role. I got the "thanks-but we will keep you on our books" response and had given up on the trainee programmer position when I got a call on a Friday afternoon "someone has dropped out of the course, would you like to join us?" and I started on the Monday morning!

One of the aptitude questions. This was a 30-question test to be completed in 15 minutes.

A plane crashes on the mountain border of two countries that are at war. The plane is owned by a third country.  There are 6 people killed. Where do they bury the survivors?

That’s how I started in Finance – feet first into one of the two largest sets of transaction processing systems in the world. I remember a basic test pack being a minimum of 40,000 accounts. Mention that to an ERP consultancy today and they can’t get their heads around it.

### 2. Looking back, is there a system, project, or technical challenge you're particularly proud of? I'd love to hear the story behind it.

One project I’m very proud of is the transition of Jaguar Land Rover systems (over 2000 of them) from Ford (UK & USA) to a brand new, dedicated data centre in the UK after the transfer of ownership to Tata Technologies.  I was hired as a freelance QA consultant – the developers were the consultancy Satyam (!). All went well for the first 6 months – they did the analysis; we did the QA. Then one Monday morning all emails started to bounce. Satyam had gone bust over the weekend, all analysts/developers fired, and the only info we had was that which we had retained. It was at this point I admitted to knowing what an LPAR was, and suddenly found myself responsible for the analysis, dev and eventually implementation and test of an entire segment of the mainframe software and run-time. Luckily, I was part of a great team, and management encouraged me to bring in others I knew were Mainframe savvy. It was stressful, but if I’m honest, lots of fun.

### 3. Do you remember any strange rules, unusual code, or unexpected situations that taught you something important? Especially things that might look unnecessary today but had a very good reason to exist.

Unusual code… it’s par for the course that code be unusual.

Examples include:

\3.1 An 88 level 88-YES that when investigated had been set to N. Wild.

\3.2 Field overflows – unusual in COBOL, but the number truncates at the TOP end, so you lose the millions, not the pence. That caused one very worrying evening of live support. And a quick prod-code fix that (although it worked), still gives me the occasional nightmare.

\3.3 I once saw (on an operator’s terminal) a system abend that wrote out the nursery rhyme “Mary had a little lamb”, built entirely out of substrings extracted from perfectly valid customer letters. How bored the developer must have been to have decided to do that I cannot imagine. But it did make us all laugh.

What infuriates me is code that is “clever”, that is, code difficult for the sake of being difficult. Good COBOL code should be able to be read by anyone. Give data meaningful names, paragraph names should explain what the para is doing, and flows through logic should be self-explanatory.

A “clever” coder is a problem for everyone else but themselves.  And never, ever, use the ALTER GOTO DEPENDING ON construct.  That should be a sacking offence.

### 4. Have you ever been involved in replacing or modernizing an old financial system? What were the biggest challenges, and what lessons did you take away?

“Replacing or modernising financial systems”. The idea of replacing an entire financial system fills me with terror, so it’s not something I’ve tried. I would (and have been) happy to add to functionality by using mainframe data (along with that sourced elsewhere) to add capability to finance (such as improving the time to Yes for commercial loans, via an AI supported front end) but when I hear people saying they can replace a banks payments system, first I laugh, then I make certain that’s not a bank I use. Bank’s back-end systems are full of exception handling, covering the exceptions consultants say will “never happen”, but that will happen day 1 of go live, usually with your biggest, most important customer.

If I was asked to advise on such (and I couldn’t talk them out of it), I would suggest identifying one discrete segment of the system that could be replaced, working on that alone, and being 100% certain that you have a proven rollback plan before attempting any go live.

### 5. After all these years, what's the one thing you think the next generation of financial software developers should never forget?

What not to forget.

Make your error handling meaningful. if the user can correct it, tell them how. If it can’t, for goodness’ sake give enough information in the error (or log) so the poor on-call developer can trace it. And make sure you have up to date manuals. I once spent the best part of a day trying to get a system to give me an error message, not just fall over in a heap. And when I did get an error number, the manual claimed it was “reserved for future releases”.  This was 35 years ago and haunts me still.

That things can, do and always will go wrong. People will enter text into what ought to be numeric only fields – names and addresses are always FAR more complicated than you think, don’t forget special characters, and that when things go wrong, you must have a proven way to backtrack and recover.

Otherwise, in Finance, you risk people not being able to access their bank accounts, which is a piece of news that will make the front page of every newspaper and news website on the planet, and will make your working life hell until it’s resolved. And even long after, if it can be proved you missed something.

A last thought – your code can be brilliant, you can be running on the best software and the newest environment, but if your assumptions are wrong, or your data is rubbish, so is what you’ve built.

## Follow-up questions

### About the COBOL overflow incident: When that happened, was there any reconciliation or verification process that could detect the financial discrepancy, or was it something someone discovered during production support?

*The interviewee shared additional context about this incident privately. Due to confidentiality concerns, that account has been removed from the public interview. The discussion nevertheless provided valuable feedback for FinKore about financial rules and conformance, particularly the need to define and verify the maximum number of numeric digits that a database field can safely accept.*

### About legacy banking systems: Is there a particular business rule or exception-handling scenario you've encountered that you believe modern developers would probably overlook if they were building a financial system from scratch?

Re Legacy banking systems.. something I do believe modern developers tend to forget is the interdependencies between batch runs. If one batch run fails, there is a tendency to either run it all again (which causes likely duplication of payments), or to fail it and leave it for tomorrow, which causes many downstream jobs to either not run, or run against data which isn't up to date.

I guess this isn't the developers issue, it's more how the batch processes are managed - so it's a combination of batch that's designed assuming a perfectly managed run, and operators not appreciating (or not being given proper understanding of) the complexity of batch processing.

If things can all be run in real time, these problems would disappear, but given the sheer volumes of transactions, running them in real time there wouldn't be enough time available... people underestimate how many transactions a second a decently setup mainframe can process.

---

## Editorial note — Privacy and confidentiality

This interview preserves the interviewee's original wording, personal views, and writing style wherever their responses are published. A supplementary account has been omitted entirely at the interviewee's request to protect confidential or potentially identifying information. The italicized text in its place is an editorial note by FinKore, not a quotation or paraphrase of the withheld account.

The interview will only be published, attributed, and shared after the interviewee has reviewed and approved this final version. Further changes can be made at the interviewee's request.
