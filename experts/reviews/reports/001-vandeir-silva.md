# ER-0001 — What banking operations teach us about financial control

**Specialist:** Vandeir Silva · **Field:** banking operations and accounting adjustments  
**Interview:** [22 questions and answers](#interview) · **Analysis:** 19 November 2026 · **Baseline:** FinKore Core 2.0.4

A receipt can exist even though funds have not reached their destination. An
issue can be closed for one department while remaining unresolved for the
customer. An adjustment can correct a balance and still need to explain its
relationship to the original entry. These situations appear in Vandeir Silva's
account and help explain why FinKore requires explicit financial meaning,
attributable decisions and preservation of original facts.

This report connects that experience to the CoreDoc's rationale. Its contribution
is practical: the accounts illustrate problems these rules seek to make visible
and prevent. The interview does not certify a banking system or constitute the
participant's approval of the entire FinKore contract. The analysis below is
separate from the participant's answers, reproduced in English at the end.

## About Vandeir Silva

Vandeir Silva is a banking professional with 14 years of experience, developed
primarily at Banco Santander. His background covers banking operations,
accounting reconciliation, operational support and process analysis, in work
requiring precision, organization and analytical judgment.

His experience includes administering and monitoring temporary accounts and
teller bridge accounts, identifying and analyzing inconsistencies, handling
accounting matters and resolving outstanding items. In his most recent role,
he monitored **7 temporary accounts and 11 teller bridge accounts**, occasionally
supporting branch cash reserve accounts. He also supported the operational needs
of **approximately 1,100 branches**, with an average of **400 identifications
and case-handling activities per day**.

He brings an analytical, organized and results-oriented approach to working with
large volumes of information, identifying improvements and increasing process
efficiency. His professional development includes training in Microsoft Power BI,
Advanced Excel and Power Query, extending his data analysis and productivity skills.

His areas of interest include banking operations, backoffice, accounting
reconciliation, process analysis, operational support and financial process
administration. This profile was supplied by the maintainer on 19 November 2026;
the experience and workload figures are those supplied in that biography.

This experience underpins the accounts examined here: bringing together teller
journals, statements, remittance systems, account ledgers and case records to
establish what happened, where the funds should go and who must act.

## The principles this experience helps support

| FinKore principle | Contribution from the experience | CoreDoc |
| --- | --- | --- |
| States need declared meaning. | Local accounting completion and the effect on the customer were handled by different departments. | [CORE-002.1](../../../docs/coreDoc/core-doc.md#core-0021-lifecycle-changes-require-a-declared-valid-transition) |
| Validation must precede an observable change. | An accepted payment without a corresponding remittance illustrates the risk of confirming an ineligible operation. | [CORE-002.2](../../../docs/coreDoc/core-doc.md#core-0022-validation-is-complete-fact-based-and-non-mutating) |
| Rejection must preserve financial state within the specified boundary. | Differences between teller activity, customer accounts and remittances required investigation and later recovery. | [CORE-002.3](../../../docs/coreDoc/core-doc.md#core-0023-rejected-actions-have-no-partial-financial-effect) |
| Identity connects an operation to its evidence. | Investigating duplicates required distinguishing attempts and movements of funds. | [CORE-005.1](../../../docs/coreDoc/core-doc.md#core-0051-continuing-financial-subjects-retain-stable-identity) |
| Evolution must distinguish its effect and preserve its link to the original. | Adjustments, cancellations and reversals had different consequences and responsible departments. | [CORE-003.3](../../../docs/coreDoc/core-doc.md#core-0033-corrections-and-related-evolution-preserve-original-facts) |
| Approval needs an identifiable subject and factual basis. | Batches presented accounts, amounts, cost centers and descriptions to the approving manager. | [CORE-004.1 and CORE-004.3](../../../docs/coreDoc/core-doc.md#approval-integrity) |
| Financial history must support attribution and reconstruction. | Requests, authorizations and case records helped explain adjustments. | [CORE-003.1](../../../docs/coreDoc/core-doc.md#core-0031-a-committed-event-preserves-essential-evidence) |
| Evaluation depends on relevant facts, including external facts. | An exceptional discrepancy required evidence beyond the local system. | [CORE-005.3](../../../docs/coreDoc/core-doc.md#core-0053-evaluation-follows-declared-facts-and-context) |

The [index by CoreDoc rule](../traceability.md#by-coredoc-rule) provides the
reverse view. Each comparison below explains the connection and its limits.

<a id="er-0001-f01"></a>
### Completing one step does not complete the whole operation

In [answer 10](#er-0001-q10), Vandeir distinguishes funds leaving the account
under his department's responsibility from the customer's actual resolution,
which belonged to other departments. [Answers 4–6](#er-0001-q04) also describe
a processing receipt without the corresponding remittance.

This supports the rationale for declaring the meaning of each state under
**CORE-002.1**. A state should make clear what has been completed and within
which scope. Consumers define their lifecycle; the Core does not impose a
universal settled-payment state. The account supports this clarity without
establishing settlement criteria or demonstrating every condition of a FinKore
transition.

<a id="er-0001-f02"></a>
### Validation must come before confirmation

The case in [answers 4–6](#er-0001-q04) concerns a payment document accepted and
authenticated without a remittance. According to the participant, investigation
identified a restriction involving the amount and service channel that had not
prevented initial acceptance.

The case illustrates the risk addressed by **CORE-002.2**: relevant facts and the
complete proposed result must be evaluated before a change becomes observable.
Having correct data is not equivalent to checking whether the operation is
eligible in that context. The amount and channel policy belongs to the consuming
product; the interview provides neither the code nor the earlier rule definition
to independently demonstrate the technical cause.

<a id="er-0001-f03"></a>
### Later recovery and preservation on rejection are different controls

In [answers 1–3](#er-0001-q01) and [9](#er-0001-q09), teller movements, customer
accounts and internal accounts could diverge. The team investigated the
difference and sometimes checked the following day whether an adjustment had
been processed.

These accounts illustrate the operational cost of partial effects and help
explain **CORE-002.3**: a rejected action must preserve observable financial
state within the boundary defined by the specification. Later reconciliation
or compensation may resolve an issue, but it does not replace that guarantee.
The interview does not identify a FinKore rejection or establish distributed
atomicity across systems, physical cash and recipients.

<a id="er-0001-f04"></a>
### Identifying the operation is essential to investigating duplicates

To distinguish repeated transactions, the team compared teller journals,
payment-document identification, remittance systems and movements in other
accounts. Running two systems alongside each other could also lead to repeated
submissions. See [answers 11–12](#er-0001-q11).

This supports the rationale for **CORE-005.1**: facts, decisions and adjustments
need to remain associated with identifiable subjects. Similar amounts and
descriptions alone do not distinguish two legitimate operations from an improper
repeat. This is a reason for stable identity; the account does not demonstrate
the bank's identifier model or define an idempotency protocol. Rejecting a
repeated Audit Event identity also does not detect every economic duplicate.

<a id="er-0001-f05"></a>
### Adjustment, cancellation and reversal have different meanings

Vandeir describes corrections to operational or technical problems, accounting
adjustments, and cancellation or reversal requests executed by partner
departments. In answer 16, an entry already processed could require an inverse
movement. See [answer 13](#er-0001-q13) and [answer 16](#er-0001-q16).

This supports the distinction between concepts required by **CORE-003.3**.
A later action needs to make its effect and relationship to the earlier fact
explicit. These terms cannot be treated as synonyms merely because they occur
in the same resolution process. Institutional vocabulary does not automatically
map to the Core's Correction, Reversal, Void or Supersession. Concrete accounting
effects remain the responsibility of the composing domain.

<a id="er-0001-f06"></a>
### The link to the original explains the adjustment

When describing how a resolution could be reconstructed, the participant refers
to the account ledger, cost center and adjustment description:

> What identified and linked the cases was the description of the adjustment entry.

See [answer 14](#er-0001-q14). This illustrates the practical value of the
verifiable relationship required by **CORE-003.3**. Without connecting an
adjustment to the original, a corrected balance loses part of the explanation
needed for audit. The description was a useful clue in the reported process,
but the Core requires explicit references in the relationships it standardizes.
The answer does not establish whether additional identifiers existed. It supports
the need for a link without demonstrating its portable implementation.

<a id="er-0001-f07"></a>
### Approval is a decision about an identifiable set of facts

The participant prepared batches identifying accounts, cost centers, amounts
and descriptions. Management authorized the batch, and another function
processed it. See [answers 15–16](#er-0001-q15).

This supports **CORE-004.1** and the decision-to-facts association in
**CORE-004.3**: approval has a subject, a responsible actor and financial content.
Approving a batch is more than permitting access to a system. The composing
domain needs to declare the approval subject and retain what was decided.

Answer 16 describes entries already processed and their subsequent resolution.
It does not explain changes between approval and execution. The account therefore
supports the importance of the approved content, but does not demonstrate the
Core's revalidation control when relevant facts change.

<a id="er-0001-f09"></a>
### History needs to show who requested and who authorized

The adjustment system recorded entry information, accounts, cost centers,
amounts and the people responsible for requests and authorizations, including:

> who requested it and when, as well as who authorized it and when.

See [answers 15](#er-0001-q15) and [17](#er-0001-q17). This supports the purpose
of **CORE-003.1**: preserving enough evidence to attribute and reconstruct a
financial event. The separation of activities also helps explain why technical
access, decision and execution are distinct facts. The account does not describe
all portable identifiers and timestamps or demonstrate immutable history; its
contribution is the operational importance of attribution and reconstruction.

<a id="er-0001-f11"></a>
### Authorization does not establish the underlying facts

In the exceptional occurrence described in [answer 19](#er-0001-q19), hierarchical
authorization existed, but explaining the discrepancy required account movements,
other departments and a cash transport document.

The case supports the relevance of context under **CORE-005.3**. An evaluation
can be consistent with local data while still depending on an external fact
that needs to be identified. Authorization makes a decision attributable; it
does not, by itself, establish physical quantities or record completeness.
The Core governs evaluations over declared facts, without certifying the
material truth of every external input or defining institutional exception policy.

## Scope and additional considerations

<a id="er-0001-f08"></a>
### Accounting dates and preservation of history

[Answer 9](#er-0001-q09) mentions backdated adjustments. This makes it relevant
to distinguish an accounting effect from the occurrence record, but does not
demonstrate rewritten history or prove the preservation required by CORE-003.2.
The Core does not define accounting dates, closed periods or interest. This point
remains context for investigation, without a corroboration binding in the index.

<a id="er-0001-f10"></a>
### Evidence availability and recovery

[Answer 18](#er-0001-q18) describes routine report access for up to 90 days and
later recovery. This is not equivalent to deletion after that period and does
not establish a mandatory retention period. It remains contextual information,
without claiming support for a specific retention rule.

<a id="er-0001-f12"></a>
### What this interview cannot establish generally

[Answers 20–22](#er-0001-q20) emphasize understanding daily operations, acceptance
testing and observing pilots. The participant also limits his experience in
technology, systems and management. Earlier references to procedures,
restrictions and approval must accompany answer 20's statement about exception
handling; that statement does not imply a general absence of policies.

The account provides neither a sample of institutions, failure statistics nor an
implementation assessment. It also contains no rounding, foreign-exchange or
allocation cases that would support a comparison with Money requirements.

Reconciliation, settlement, cross-system idempotency, concrete reversal postings,
business calendars and retention remain subjects for separate investigation.
**This behavior is not currently defined by FinKore Core.** That limitation
concerns these domain behaviors, rather than the existing identity, control and
evidence obligations. Several passages from one person remain one contribution,
not independent confirmations. The nine comparisons and ten bindings to nine
CoreDoc rules remain analytical interpretations, with independent validation
recorded as `pending_validation` in the [traceability index](../traceability.md).

<a id="interview"></a>
## Interview

The following is an editorial English translation of the complete 22-question
consultation originally supplied in Portuguese. Question numbering and
first-person answers are preserved; paragraph breaks and emphasis aid reading.
The answers record the participant's account and are separate from the analysis
above. Links and excerpts in the traceability index refer to these answers.

<a id="er-0001-q01"></a>
### 1. What was your role? Describe your positions, departments, approximate periods and main responsibilities related to financial operations.

**Answer**

I worked in different areas of the institution. In 2001, I worked in customer
service. Between 2002 and 2006, and subsequently from 2008 to 2011, I carried out
local administrative activities involving administrative procedures and issuing
credentials for new employees. From 2011 to 2014, I worked in operational
backoffice, processing requests from customer-service channels
(SAC/Ombudsman/Procon/Bacen). These ranged from fee reversals, refunds, limit
changes, changes to fee packages and product cancellations (loans, cards, credit
limits and so on) to credit-card transaction reversals and accounting entries
that enabled partner departments to handle other requests, such as settling a
renegotiated agreement.

From 2014 to 2018, I reconciled temporary accounts used by the branch network
and the SAC/Ombudsman/Procon/Bacen teams for provisional credit, known as
*crédito em confiança*.

Provisional credit was used when a customer disputed an operation, alleging
irregularities, discrepancies or an unauthorized agreement, and the normal
resolution period could take between 2 and 20 business days, depending on the
complaint. That was the time the internal department needed to assess the
complaint and decide whether it was justified.

For example, a customer goes to an ATM to withdraw cash. Because of a power
outage or communication failure, the amount is debited from the current account
but is not dispensed. The normal resolution period for this issue is up to three
business days. During that time, the branch receives the notification, checks
the mechanism to see whether the cash is trapped, or reconciles the ATM balance
to determine whether the machine holds the excess amount.

Another example is a customer requesting a partial withdrawal from a private
pension plan. At the time of the request, the customer believes the money will
be available immediately in the current account, but system conditions or product
rules may mean it becomes available only after 20 business days. An advance is
provided to the customer and the outstanding item is monitored so that, when
the withdrawal period ends, the account is debited and the temporary account
is consequently cleared.

During that period, I monitored account reconciliation, contacted the departments
and followed up with the analysts responsible for resolving outstanding items.

<a id="er-0001-q02"></a>
### 2. How did the temporary and bridge accounts you monitored work? Explain in your own words what they were used for and your responsibility for them.

**Answer**

From 2018, I joined the Accounting team, where I was responsible for reconciling
and monitoring outstanding items in the temporary accounts mentioned earlier,
which were used by the customer-service channels. I identified the transactions
and customer details, sent them to the relevant departments and monitored
resolution within the account's SLA.

There were credit and debit teller cash-difference temporary accounts, teller
bridge accounts, the teller account (which mirrored all terminal transactions)
and, ultimately, the branch cash reserve account, or vault.

**Teller temporary accounts.** Every cash difference had to be recorded in these
accounts at the end of the working day. Under the internal procedure, the
employee and branch had five business days to investigate, locate any physical
surplus or shortage or possible cash reserve differences, and resolve them.
My role was to identify the tellers, contact the branch and request resolution
as quickly as possible, either using the funds located or with the employee
covering the difference from their own resources.

**Bridge accounts.** Internal systems used these while processing transactions
at the teller terminal.

For example, a customer visits a branch to pay a DARF, the Federal Revenue
Collection Document used to pay Brazilian federal taxes such as IRPF, IRPJ, PIS,
COFINS and CSLL directly to the Brazilian Federal Revenue Service. A transmission
failure occurs during processing. The branch's teller cash position is affected,
but the internal movement that should transfer the money from the teller account
to the tax account leaves it in the bridge account. My job was to identify the
transaction and terminal, check the response in the teller journal, and determine
whether the amount should be returned to the customer or the tax department
should be contacted to remit it, seeking to prevent a late-payment or non-payment
penalty for the customer.

Another example is a customer paying a boleto issued by another bank. The barcode
is scanned or entered, the system authenticates the payment document or does not,
and it debits the bridge account or leaves the amount as a difference in the
teller's cash position. At the end of the day, that difference should be recorded
as the employee's cash difference. My part was to identify, through the teller
journal, which of all the boletos received had caused the difference. I checked
internal remittance systems to establish whether the funds had reached the
other institution. I then notified the branch that the amount was sitting in
an internal account and that there might be an unidentified cash or reserve
difference, or that the customer's boleto had not actually been paid.

The branch would reply that there was an internal issue, that the funds should
be used to pay the boleto, or that the amount should be returned to the customer
for a new payment procedure. Where payment was needed, I made the amount available
in a temporary account so that the employee could access the funds through the
teller terminal and complete payment of the document.

**Teller temporary account.** This account showed all transactions performed at
the teller's terminal and communicated with the other teller bridge accounts.
Funds remained there for various reasons: system failures, server communication
problems, operational failures, power outages and so on. I identified the source
of outstanding items—the transaction that caused the problem—and tried to locate
the corresponding entry. It might be in a teller bridge account, the teller's
credit or debit difference account, or the final account for the customer's
transaction, such as a card statement, DARF or fine payment. Alternatively, I
would flag a possible difference in the branch reserve, or vault. If it involved
a bridge account or an internal product account, I made the accounting adjustment
or notified the partner department of the amount and requested help resolving it.

<a id="er-0001-q03"></a>
### 3. Which occurrences were most frequent? Choose up to three types of problem and explain how they were noticed and what consequences they could cause.

**Answer**

**Operational failure.** An employee would notice a difference at the terminal
at the end of the day and force the terminal to close. The teller's position
would then show no difference because the amount had been transferred to the
reserve, or vault account. The teller temporary account therefore showed a
balance whose corresponding entry was in the reserve account. I compared the
reports sent by the branch with that branch's reserve accounting report to see
whether the difference was in the vault. In other words, I checked for a
discrepancy in the branch's physical cash balance, which, in cases of a surplus,
could result in misappropriation of funds, or fraud.

**Over-the-counter withdrawal or deposit.** A customer visits the branch to
withdraw an amount above the ATM limit. The employee enters the transaction and
hands cash to the customer or receives it from the customer, but a communication,
system or server failure means the customer's account is not affected. The
teller temporary account was affected, and I had to examine the teller journal
entries, checking customers' accounts one by one to locate the person who had
not been correctly debited or credited.

**Payment of a boleto from another institution.** A customer pays another bank's
boleto at the teller. The barcode is scanned or entered, the system authenticates
the document or does not, and it debits the bridge account or leaves a difference
in the teller's cash position, which should be recorded at the end of the day.
I used the teller journal to identify which boleto caused the difference. I
checked internal remittance systems to see whether the other institution had
received the funds, then informed the branch that the amount was sitting in an
internal account. There might be an unidentified cash or reserve difference,
or the customer's boleto might not actually have been paid.

The branch would say there was an internal issue, that the funds should be used
to pay the boleto, or that the amount should be returned to the customer for a
new payment procedure. Where payment was required, I made the amount available
in a temporary account so the employee could access it at the terminal and pay
the document. The customer could face late charges or an adverse credit listing,
and the institution's reputation could also suffer.

<a id="er-0001-q04"></a>
### 4. Describe a specific resolution case you followed from start to finish. What should have happened, what happened and how was the problem identified?

**Answer**

A business customer visited a branch to pay federal taxes. It was a standalone
payment document for BRL 750,000. The customer's document was authenticated,
confirming processing, but the amount was not remitted.

The amount was not remitted because of a system failure: the system had not
been configured to accept a standalone payment document for such a large amount.

The amount caught my attention as soon as I saw it in the bridge account. I
immediately identified the transaction and terminal, and checked whether the
remittance had occurred and whether the branch might have a large reserve
difference. Once I confirmed that the funds had not been remitted, I contacted
the branch and spoke to management, who said they were unaware of the incident.
I contacted the Remittance and Technology departments. On a call, I presented
the evidence and the problem. The technical analysts opened an internal request
to investigate what had happened. After five days, I received the response that
it was a configuration issue.

<a id="er-0001-q05"></a>
### 5. In that case, what was the sequence leading to a solution? Describe the steps, your participation and interventions by other people or departments.

**Answer**

The amount caught my attention as soon as I saw it in the bridge account. I
immediately identified the transaction and terminal, and checked whether the
remittance had occurred and whether the branch might have a large reserve
difference. After confirming that no remittance had occurred, I contacted the
branch and management told me they were unaware of the incident. I contacted
the Remittance and Technology departments. During a call, I presented the evidence
and the problem. The technical analysts opened an internal investigation request.
After five days, I was told it was a configuration issue and that a document of
that amount could not be paid through the branch, only through Internet Banking.

With the email containing the full case history and the opinions of the technical
and Tax teams, I contacted the branch and branch-network superintendency. I
reported what had happened, stated that the document had not been processed
because of a system issue, and advised that the customer would need to make a
new transaction through Internet Banking for the remittance to take place. The
customer refused because they already held an authenticated receipt.

I acted as an intermediary with the Tax Collection department to have the funds
remitted. They contacted the Federal Revenue Service and, after ten business
days, received a response allowing the remittance but stating that a penalty
would apply because of the delay or failure.

The penalty arrived three months later and amounted to BRL 105,000, paid by the
bank. As a result, the branch network was reminded that this type of document
must not be accepted at the branch and should be paid only through Internet
Banking. The system was also configured to stop accepting that type of operation.

<a id="er-0001-q06"></a>
### 6. What information was needed to understand the case? How did you link the occurrence to the original movement? Was any information missing, inconsistent or difficult to locate?

**Answer**

The transaction amount, outstanding in a bridge account, was enough to attract
attention. As with every outstanding item, we consulted the teller's transaction
journal and identified the type of operation. We checked the tax collection
system to see whether it had received the attempted movement; the status field
showed “ANULADO” (“annulled”). Initially, all the necessary information was correct,
with no inconsistencies or missing information.

<a id="er-0001-q07"></a>
### 7. How did you know which stage an occurrence had reached? Explain how you distinguished, for example, a situation under analysis, awaiting another department or effectively resolved. Use the terms from your routine.

**Answer**

From the accounting side, our concern was the amount sitting in the account.
The funds needed a destination: correcting an internal or bridge account,
a cash-difference account, the final destination account, or returning them
to the customer.

As a rule, every outstanding item should be resolved the same day. However,
some cases required other departments, including the branch, to help understand
the issue and determine how it should be resolved. Once that was defined, the
Accounting department regarded the issue as effectively resolved.

<a id="er-0001-q08"></a>
### 8. What allowed an outstanding item to be closed? What checks or evidence were needed? Were there situations where the balance was correct but something still needed clarification?

**Answer**

What allowed an item to be closed was understanding the destination of the
funds that had been in a bridge, temporary or teller account.

To support that understanding, we used the teller journal—a list of every
transaction performed by tellers at their terminals—along with tax collection,
card and current-account systems, and payment documents issued by the bank and
other institutions. By analyzing all the evidence, I could determine the next
action and therefore close the outstanding item.

<a id="er-0001-q09"></a>
### 9. What happened when an attempt to resolve an issue failed? How did you check whether nothing had changed or part of the operation had occurred?

**Answer**

When an attempt to resolve an issue failed, the accounting balances and account
ledger obtained the next day made it possible to identify balances from earlier
movements. Because every account should have a zero balance at the end of the
day, it was easy to identify whether the adjustment had been processed correctly.

In those cases, we could make the adjustment in an accounting account by D+2.
If it involved a customer's account, the operation was normally backdated so
that interest would not be charged to the customer if the account had a negative
balance.

<a id="er-0001-q10"></a>
### 10. Did you encounter situations where it was impossible to know whether an operation had completed? If so, how did you investigate, and what did you do while the result remained uncertain?

**Answer**

No. For the Accounting team, an operation was considered complete when the
funds left the accounting account and were directed to the corresponding
destination account.

The customer's actual resolution, whether in a current account, credit card,
remittance to another institution or remittance to the Federal Revenue Service,
was the responsibility of other partner departments.

If we were asked about a particular case, everything had been handled by email,
including the handling and analysis evidence, so we had an action history that
showed what was outstanding and the status of the occurrence. We could then
ask the partner department whether the procedures had been followed correctly.

<a id="er-0001-q11"></a>
### 11. How did you decide whether an operation could be attempted again? Who decided, what information was consulted and how did you check the risk of duplication?

**Answer**

Through our analysis and the available evidence—teller journal, current-account
statement, credit-card statement, remittance system and so on—we could already
form a view of where the funds should go. If there was doubt, we emailed the
branch or partner department with the evidence collected, a brief analysis of
what had happened and a direct question: what adjustment should be made? Should
we reprocess the operation or return the funds to the customer?

We relied on the knowledge of the departments or branch to avoid duplicates.

<a id="er-0001-q12"></a>
### 12. Did you witness duplicate or apparently duplicate movements? How did you distinguish an improper repeat from two legitimate operations with similar data?

**Answer**

Yes, I did. At one point, a new teller transaction system was being introduced.
Tellers alternated between two systems—for example, credit-card transactions
in the old system and payment documents in the new one—while acceptance testing
was still underway. Often, the teller would process the customer's document in
both systems: once by entering the details manually in the old system, and once
by scanning the barcode in the new system. This created an outstanding item in
the bridge account.

In those cases, we checked the teller journal, the document's numeric payment
code and the remittance system to establish how many times the amount had been
remitted. If only one of the amounts appeared, I checked another bridge account
in the remittance system, reconciled by a colleague at D+2. If the amount was
there, I arranged the adjustment. It remained outstanding because, when the
funds transfer was attempted, the other institution reported that the document
had already been paid.

Another case involved over-the-counter withdrawals from current accounts. Again,
because of the new system's introduction, some transactions returned an error
and were repeated, creating outstanding items in the teller temporary account.
After checking and collecting evidence, I emailed the branch to ask whether
there was an outstanding reserve issue or whether the funds should be returned
to the customer.

<a id="er-0001-q13"></a>
### 13. In your routine, what was the difference between correcting, adjusting, cancelling and reversing? Explain only the terms you used and give examples. If the meaning varied with the situation, describe that difference.

**Answer**

In my accounting routine, I did not carry out cancellations or reversals.
Those were the responsibilities of partner departments once the analysis had
established what needed to be done.

In that context:

**Correcting.** I used the term correction for an operational or system failure.
It took the form of a recommendation to the branch or Technology department,
which should examine its internal routines in greater depth and make repairs
if necessary.

**Adjusting.** This was more common: the adjustments I made were accounting
entries to regularize bridge and temporary accounts.

**Cancelling.** We normally requested cancellation after identifying why an
item was outstanding, contacting the person responsible for the entry and
establishing that it should not have been made. For example, a customer visits
a branch with only their credit card and requests a one-off payment toward the
card statement. The teller processes the payment. Later that day, the customer
remembers having already paid the card on another date. The branch employee
cancels the payment and the funds return to the customer's account, but the
debit remains in a bridge account and the credit on the card statement. With
the complete evidence history and the branch's account of events, I contacted
the Cards department and requested cancellation of that payment, with the
credit reversed to the bridge account where I had the outstanding item.

**Reversing.** Again involving cards, a customer presents a statement for payment
and the teller processes the movement. Because of a system or communication
failure, however, the system processes two operations. One debit occurs normally
in the teller's cash account and the other in the teller temporary account.
Using the teller journal, which showed a single transaction, and the credit-card
statement system, which showed two payments, I asked the Cards department to
reverse one operation to resolve the outstanding accounting item.

<a id="er-0001-q14"></a>
### 14. After a correction or resolution, what remained visible about the original situation? Could you identify the earlier record, what changed and the link between them?

**Answer**

Through what we called the account ledger, it was possible to identify the
original outstanding item and its resolution, because the movements were
normally made in the same cost center. This also helped when audit raised
questions.

What identified and linked the cases was the description of the adjustment entry.

<a id="er-0001-q15"></a>
### 15. Which actions required authorization or approval? What was your part in the process and what information did the responsible person receive to make a decision?

**Answer**

Analysis, contacting departments and handling cases did not require authorization
or approval. Approval applied only to the accounting adjustments made.

I prepared a single file containing all the accounting adjustments, identifying
the accounts involved, cost centers, amounts and descriptions. At the end of the
day, I entered the information into a system. My manager authorized my batch of
entries, and Controllership processed them automatically.

Occasional manual adjustments were made by me and approved by management.

When adjustments involved a customer's current account, an audit recommendation
meant they were not processed by Accounting Management. An operational partner
department carried out the movements instead. It was decided that batches of
current-account adjustments would be sent at three scheduled times. The batches
were submitted through a system and authorized by management. That department
entered and approved the amounts without the Accounting team's participation.

<a id="er-0001-q16"></a>
### 16. What happened when information changed after approval—for example, the amount, account involved or reason for the adjustment? Describe the procedure you knew, including situations where it was unclear.

**Answer**

After approval, there was no going back. An accounting entry was already in the
system, and an entry in a customer's account already appeared on the statement.

However, when an inconsistency or failure was identified, an accounting reversal
entry was made: an inverse adjustment respecting the accounting accounts and
cost centers involved. If a customer was involved, the operation was reversed,
and the entry details used the same description as the earlier movement.

<a id="er-0001-q17"></a>
### 17. How were decisions and actions recorded? Could you identify who requested, approved and executed them, when they occurred and why?

**Answer**

That was precisely the purpose of using the accounting adjustment system:
to create a history showing the accounting patterns involved, cost centers,
amounts, entry descriptions, who requested it and when, as well as who authorized it and when.

As mentioned earlier, following an audit recommendation, we were instructed
to make information on customer-account adjustments available to the Operations
department so that it could execute the movements and retain full traceability
of them.

<a id="er-0001-q18"></a>
### 18. If someone needed to reconstruct an occurrence months later, what evidence would they use? What was normally available and what tended to be missing? Did you participate in that reconstruction?

**Answer**

As a rule, information and evidence remained available to everyone for up to
90 days. After that period, if necessary, Controllership was asked to restore
the reports through the mainframe so the processes could be revisited.

Some senior employees in the department also had access to restore documents.

<a id="er-0001-q19"></a>
### 19. Describe a second case that was an exception to the usual procedure. What made it different, who decided how to act and how was the solution recorded?

**Answer**

In 2023, there was an incident in a city in Minas Gerais: a landslide affected
the city and mud entered one of the branches. The branch was completely closed
for three days, until an employee managed to enter and remove the money from
the ATMs and reserve. The employee left with the cash in garbage bags, an
unusual procedure.

Later, the employee logged in at another branch, requested an armored cash
transport vehicle and used the systems to zero the terminal and reserve balances
without counting the amount in the black bag. This created an accounting
difference of BRL 120,000.

I identified the person responsible and emailed them, stating that there was a
difference and asking what had been done and why. The reply was that the Regional
Manager had authorized the procedure in agreement with the superintendency.

Through colleagues, I contacted the cash transport company, or ETV, which reported
that it had collected a smaller amount, resulting in the accounting difference.
After several email exchanges, my manager and I contacted the internal
investigation department to establish where the funds had gone.

Ultimately, no fraud was identified, but there was a series of operational
failures involving the branch employee, Regional Manager and Cash Management.
A few days before the landslide, the branch employee had requested a cash
collection that had not been recorded in the system. The Regional Manager and
superintendent had authorized a procedure outside the internal rules. The Cash
Administration team, a partner department, had not reported in its records that
it held an outstanding amount.

The cash transport company sent us the cash transport document, or GTV. After
that, the branch employee recorded the outflow of funds, resolving the outstanding
item.

<a id="er-0001-q20"></a>
### 20. Which practices depended on rules specific to the bank or department? Which of the examples you described might work differently at another institution, and why?

**Answer**

There were no bank- or department-specific rules for the processes and procedures
adopted, because they were treated as exceptions or errors.

In general, even with clear rules on what to do and how to do it, failures occur,
whether human or system-related. System failures could perhaps have been avoided
if implementations or changes had been better structured, acceptance-tested and
applied. That really did happen at the institution where I worked.

I believe the same kinds of operational and system problems occur at other
institutions. In conversations with friends who work at other institutions,
they report the same thing, although I do not know the frequency or volume.

<a id="er-0001-q21"></a>
### 21. Which recurring problem do you consider particularly important for developers of financial systems to understand? Describe the risk and what would help detect or prevent it.

**Answer**

Understand the day-to-day work of the branch or department, interactions with
the customer, how these can affect internal departments and, most importantly,
how they can harm the customer and the institution's reputation.

Ideas look good in theory, on paper, but in practice they are sometimes less
workable or require time to learn. That is why thorough testing and acceptance
testing matter. Start with small-scale pilot projects, monitor every step of
implementation, and only then consider expanding.

<a id="er-0001-q22"></a>
### 22. Which points in your answers need confirmation by another professional? Identify the subjects you know directly and those where you followed only part of the process.

**Answer**

For my own case-handling process and the procedures I followed, I believe none,
because they were part of my daily work. However, someone with similar experience
may have a different perspective or practices that could be valuable.

For technology, systems and management, I believe consultation could be useful,
because those subjects were outside my routine or my participation was limited
and very small.
