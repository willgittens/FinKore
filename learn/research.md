# FinKore Research

Academic findings, carefully connected to financial software behavior.

These notes bring together attributable source passages and editorial considerations about FinKore. Each finding remains pending validation; an available quotation does not establish a new financial requirement.

This is a curated publication of the existing research review, prepared on 17 November 2026. Original source-reading dates and limitations are retained in the evidence records. The studies were not independently replicated for this page.

## Monetary precision

### REV-0001 — Exact monetary meaning does not require a universal currency-wide calculation scale

- **Study:** *An architectural model for ensuring financial accuracy and consistency of data in distributed operating systems*
- **Authors:** Mikhaylov Bogdan; Omorov Akzholbek; Izripov Iusup
- **Version:** 2026; European Journal of Technical and Natural Sciences, No. 4; DOI 10.29013/EJTNS-26-4-82-90.
- **Source:** [Read the study](https://ppublishing.org/media/uploads/journals/article/EJT-4-26_p82-90.pdf)
- **Location:** Physical PDF p. 5; printed p. 86, paragraph after equation (1).
- **Reading extent:** Selected passages
- **Evidence record:** [EVD-0001](../research/allFindings.md#evd-0001)

> Higher accuracy may be used for internal calculations.

**Source context.** The authors propose a currency quantum and common rounding configuration. This sentence distinguishes internal calculation accuracy from circulation units. The reviewed method is architectural synthesis, not an independent deployment trial.

**Source limitations.** Text extraction checked; page-image rendering was unavailable, so equations were not visually validated or transcribed. The currency-wide policy is the authors’ design, not an existing FinKore requirement.

**FinKore benefit.** Explain why a currency’s usual display precision is not an implicit rounding instruction.

**Editorial interpretation.** Retain the finding only as support for explicitly agreed precision at an operation boundary. It does not justify a new global currency scale, mandatory decimal storage format, or silently rounded exact arithmetic.

**Conditions and limits.** The paper’s common quantum is an application architecture. Applying it everywhere could reduce exact intermediate values prematurely. The reviewer did not validate its equations or worked financial calculations.

**Current contract connections:**

- [CORE-001.2](../docs/coreDoc/core-doc.md#core-0012-exact-calculation-and-explicit-rounding) — Exact arithmetic and explicit rounding policy are the relevant obligations. The paper’s common currency quantum does not impose a universal calculation scale.
- [MONEY-ROUNDING-001](../spec/money/rounding.md) — Exact arithmetic and explicit rounding policy are the relevant obligations. The paper’s common currency quantum does not impose a universal calculation scale.
- [MONEY-ROUNDING-004](../spec/money/rounding.md) — Exact arithmetic and explicit rounding policy are the relevant obligations. The paper’s common currency quantum does not impose a universal calculation scale.
- [MONEY-ROUNDING-007](../spec/money/rounding.md) — Exact arithmetic and explicit rounding policy are the relevant obligations. The paper’s common currency quantum does not impose a universal calculation scale.
- [MONEY-REPRESENTATION-002](../spec/money/representation.md) — Exact decimal meaning is portable while representation remains implementation-neutral and a domain rounding policy is permitted, not universally mandated.
- [MONEY-REPRESENTATION-006](../spec/money/representation.md) — Exact decimal meaning is portable while representation remains implementation-neutral and a domain rounding policy is permitted, not universally mandated.
- [MONEY-ROUNDING-005](../spec/money/rounding.md) — Exact decimal meaning is portable while representation remains implementation-neutral and a domain rounding policy is permitted, not universally mandated.

[Full review: REV-0001](../research/allFindings.md#rev-0001) · [Contract comparison: MAP-0001](../research/traceability.md#map-0001)

## Transaction consistency

### REV-0002 — Idempotent request identity includes content and an explicitly bounded effect

- **Study:** *An architectural model for ensuring financial accuracy and consistency of data in distributed operating systems*
- **Authors:** Mikhaylov Bogdan; Omorov Akzholbek; Izripov Iusup
- **Version:** 2026; European Journal of Technical and Natural Sciences, No. 4; DOI 10.29013/EJTNS-26-4-82-90.
- **Source:** [Read the study](https://ppublishing.org/media/uploads/journals/article/EJT-4-26_p82-90.pdf)
- **Location:** Physical PDF p. 6; printed p. 87, paragraph after equation (3).
- **Reading extent:** Selected passages
- **Evidence record:** [EVD-0002](../research/allFindings.md#evd-0002)

> should lead to a conflict

**Source context.** The quoted clause concerns reusing one request key with different normalized content. The passage also distinguishes at-most-one financial change from guaranteed processing.

**Source limitations.** Same architectural proposal as EVD-0001. The cited stream-processing reference was not independently checked; the clause is presented here as this paper’s recommendation.

**FinKore benefit.** Prevent readers from treating duplicate-event rejection as a promise to replay an earlier command result.

**Editorial interpretation.** The source supports a conditional application design principle, not a universal Core rule or new portable error. At-most-once effect and eventual processing remain separate obligations.

**Conditions and limits.** Reviewer scenario: a lost response leads to retrying with the same key but a changed amount. Treating this as the same financial instruction can suppress a legitimate change or misidentify the result. Atomic key storage is the paper’s design; a key alone does not coordinate every external effect.

**Current contract connections:**

- [CORE-002.3](../docs/coreDoc/core-doc.md#core-0023-rejected-actions-have-no-partial-financial-effect) — These boundaries distinguish non-mutating domain rejection and duplicate-event rejection from a general command-key/retry protocol. The source’s request identity recommendation remains application policy.
- [AUDIT-APPEND-003](../spec/audit/append-only.md) — These boundaries distinguish non-mutating domain rejection and duplicate-event rejection from a general command-key/retry protocol. The source’s request identity recommendation remains application policy.
- [WORKFLOW-CONFLICT-008](../spec/workflow/conflicts.md) — These boundaries distinguish non-mutating domain rejection and duplicate-event rejection from a general command-key/retry protocol. The source’s request identity recommendation remains application policy.

[Full review: REV-0002](../research/allFindings.md#rev-0002) · [Contract comparison: MAP-0002](../research/traceability.md#map-0002)

### REV-0024 — Locally valid states do not imply a global serial order

- **Study:** *Path-Sensitive Atomic Commit: Local Coordination Avoidance for Distributed Transactions*
- **Authors:** Tim Soethout; Tijs van der Storm; Jurgen J. Vinju
- **Version:** arXiv v2; publication DOI 10.22152/programming-journal.org/2021/5/3.
- **Source:** [Read the study](https://arxiv.org/pdf/1908.05940v2)
- **Location:** Physical PDF page 24, printed 3:24, §6.2, paragraph headed “psac is not Serializable”.
- **Reading extent:** Selected passages
- **Evidence record:** [EVD-0024](../research/allFindings.md#evd-0024)

> psac does not guarantee serializability

**Source context.** The authors explicitly distinguish their coordination-avoidance semantics from serializable schedules and explain an account-operation counterexample. The prose was checked; Figure 9 and formulas were not visually validated.

**Source limitations.** Version chronology was not fully reconciled. No algorithm, proof or numeric example was independently executed.

**FinKore benefit.** Explain the boundary between per-operation invariants and a separately declared cross-operation ordering property.

**Editorial interpretation.** Keep the semantic distinction. This review does not choose a database isolation level or certify an implementation of PSAC.

**Conditions and limits.** A global serial order is not required for every application. The source intentionally offers weaker isolation with potential throughput benefits; this is not a hidden defect. Financial implications depend on the composing policy.

**Current contract connections:**

- [CORE-002.2](../docs/coreDoc/core-doc.md#core-0022-validation-is-complete-fact-based-and-non-mutating) — Complete-result validation and supplied conflict preconditions do not establish global serializability. PSAC intentionally has weaker isolation; no universal database isolation level is inferred.
- [ENTITY-VALIDATION-003](../spec/entities/validation.md) — Complete-result validation and supplied conflict preconditions do not establish global serializability. PSAC intentionally has weaker isolation; no universal database isolation level is inferred.
- [WORKFLOW-CONFLICT-008](../spec/workflow/conflicts.md) — Complete-result validation and supplied conflict preconditions do not establish global serializability. PSAC intentionally has weaker isolation; no universal database isolation level is inferred.

[Full review: REV-0024](../research/allFindings.md#rev-0024) · [Contract comparison: MAP-0024](../research/traceability.md#map-0024)

### REV-0031 — Producer idempotence does not settle application-effect uniqueness

- **Study:** *Architecting Event-Driven Banking Systems For Real-Time Financial Transaction Processing*
- **Authors:** Jyothirmai Gurramula
- **Version:** publisher: 1 June 2026; IJAIML 6(4s), 910–919.
- **Source:** [Read the study](https://www.svedbergopen.com/index.php/ijaiml/article/view/529)
- **Location:** HTML Abstract, paragraph beginning “The first pattern”; PDF pages not available.
- **Reading extent:** Abstract only
- **Evidence record:** [EVD-0031](../research/allFindings.md#evd-0031)

> protecting against the redelivery failures that producer-side configuration cannot intercept

**Source context.** The abstract separates Kafka producer hardening from application deduplication and offset handling. Deployment metrics, persistence boundaries and legal claims were not independently verified.

**Source limitations.** Selected passages only; no experiment or proof reproduced. Corrections/retraction status is unverified beyond the source page inspected.

**FinKore benefit.** Explain where a delivery guarantee ends and a financial-effect claim needs further evidence.

**Editorial interpretation.** Retain the scoped distinction only. Do not adopt 4PF, Kafka settings, “exactly once” performance claims or the source’s unverified legal assertions.

**Conditions and limits.** The crash-after-effect-before-acknowledgement scenario is reviewer inference. Broker guarantees have a useful defined scope. Application deduplication still needs defined keys, retention, durable recovery and a consistent effect boundary; the abstract does not establish those details.

**Current contract connections:**

- [AUDIT-APPEND-003](../spec/audit/append-only.md) — Duplicate Audit identity rejection and conflict preconditions have bounded domain meaning. Producer guarantees and application-effect uniqueness need their own scope; no broker protocol, cached result or end-to-end exactly-once guarantee is supplied.
- [WORKFLOW-CONFLICT-008](../spec/workflow/conflicts.md) — Duplicate Audit identity rejection and conflict preconditions have bounded domain meaning. Producer guarantees and application-effect uniqueness need their own scope; no broker protocol, cached result or end-to-end exactly-once guarantee is supplied.

[Full review: REV-0031](../research/allFindings.md#rev-0031) · [Contract comparison: MAP-0031](../research/traceability.md#map-0031)

### REV-0035 — Snapshot coherence and freshness are separate properties

- **Study:** *Transactional consistency and automatic management in an application data cache*
- **Authors:** Dan R. K. Ports; Austin T. Clements; Irene Zhang; Samuel Madden; Barbara Liskov
- **Version:** 2010; OSDI paper.
- **Source:** [Read the study](https://www.usenix.org/events/osdi10/tech/full_papers/Ports.pdf)
- **Location:** Physical PDF page 3, printed 3, §2.2, second paragraph.
- **Reading extent:** Selected passages
- **Evidence record:** [EVD-0035](../research/allFindings.md#evd-0035)

> regardless of the age of the snapshot, each transaction always sees a consistent view

**Source context.** TxCache permits bounded staleness for read-only transactions while providing a coherent snapshot. Read/write transactions bypass the cache and retain the underlying database’s guarantees and anomalies.

**Source limitations.** PDF author list governs this cited version; bibliographic lists elsewhere differ. The cache design, implementation and performance were not independently evaluated.

**FinKore benefit.** Explain how individually recent values can still form an incoherent decision input, and how a coherent old snapshot can be too old for a particular policy.

**Editorial interpretation.** Retain the distinction. No cache architecture, automatic refresh, global clock or fixed TTL becomes Core behavior.

**Conditions and limits.** These financial scenarios are reviewer inferences. A consistent snapshot can be appropriate within an application’s bound. TxCache does not remove the database’s anomalies or establish universal safe staleness for financial authorization.

**Current contract connections:**

- [CORE-005.3](../docs/coreDoc/core-doc.md#core-0053-evaluation-follows-declared-facts-and-context) — Explicit context and supplied-observation checks do not certify a coherent or sufficiently recent remote snapshot. The cache source distinguishes coherence from age; acceptable age and isolation remain composing-application choices.
- [WORKFLOW-GUARD-004](../spec/workflow/guards.md) — Explicit context and supplied-observation checks do not certify a coherent or sufficiently recent remote snapshot. The cache source distinguishes coherence from age; acceptable age and isolation remain composing-application choices.
- [WORKFLOW-CONFLICT-008](../spec/workflow/conflicts.md) — Explicit context and supplied-observation checks do not certify a coherent or sufficiently recent remote snapshot. The cache source distinguishes coherence from age; acceptable age and isolation remain composing-application choices.
- [ENTITY-IMPORT-007](../spec/entities/import.md) — Explicit context and supplied-observation checks do not certify a coherent or sufficiently recent remote snapshot. The cache source distinguishes coherence from age; acceptable age and isolation remain composing-application choices.

[Full review: REV-0035](../research/allFindings.md#rev-0035) · [Contract comparison: MAP-0035](../research/traceability.md#map-0035)

### REV-0039 — Convergence does not by itself promise permanence after a response

- **Study:** *Ensuring Convergence and Invariants Without Coordination*
- **Authors:** Dina Borrego; Nuno Preguiça; Elisa Gonzalez Boix; Carla Ferreira
- **Version:** 2025; ECOOP, DOI 10.4230/LIPIcs.ECOOP.2025.4.
- **Source:** [Read the study](https://drops.dagstuhl.de/storage/00lipics/lipics-vol333-ecoop2025/LIPIcs.ECOOP.2025.4/LIPIcs.ECOOP.2025.4.pdf)
- **Location:** Physical PDF page 22, printed 4:22, §6.1, second paragraph.
- **Reading extent:** Selected passages
- **Evidence record:** [EVD-0039](../research/allFindings.md#evd-0039)

> The model may result in operations being discarded after a response has already been sent to the client.

**Source context.** The No-Op paper explicitly discusses this consequence and distinguishes applications tolerating reversals from those requiring coordination. It is a stated semantic tradeoff, not an undisclosed defect.

**Source limitations.** Selected prose verified; proofs, artifact and experiments not reproduced. The paper’s extra application assumptions and policy variants require separate evaluation.

**FinKore benefit.** Explain why eventual invariant-preserving state does not alone settle what an already-observed response authorizes a consumer to do.

**Editorial interpretation.** Retain the response-semantics question. Converging state does not authorize erasing committed Audit history or rewriting preserved financial facts.

**Conditions and limits.** An external action triggered by a later-discarded result is reviewer inference. A clearly provisional response may be appropriate. The source explicitly acknowledges the limitation; this review does not declare its framework generally unsuitable or its proofs invalid.

**Current contract connections:**

- [CORE-003.3](../docs/coreDoc/core-doc.md#core-0033-corrections-and-related-evolution-preserve-original-facts) — The source explicitly permits discarding some operations after a response. That tradeoff does not authorize erasing committed history or rewriting preserved source facts; portable reversal requires its declared evidence. Distributed confirmation and concrete accounting consequences remain separate.
- [AUDIT-APPEND-001](../spec/audit/append-only.md) — The source explicitly permits discarding some operations after a response. That tradeoff does not authorize erasing committed history or rewriting preserved source facts; portable reversal requires its declared evidence. Distributed confirmation and concrete accounting consequences remain separate.
- [ENTITY-EVOLUTION-011](../spec/entities/evolution.md) — The source explicitly permits discarding some operations after a response. That tradeoff does not authorize erasing committed history or rewriting preserved source facts; portable reversal requires its declared evidence. Distributed confirmation and concrete accounting consequences remain separate.
- [ENTITY-EVOLUTION-012](../spec/entities/evolution.md) — The source explicitly permits discarding some operations after a response. That tradeoff does not authorize erasing committed history or rewriting preserved source facts; portable reversal requires its declared evidence. Distributed confirmation and concrete accounting consequences remain separate.
- [ENTITY-EVOLUTION-015](../spec/entities/evolution.md) — The source explicitly permits discarding some operations after a response. That tradeoff does not authorize erasing committed history or rewriting preserved source facts; portable reversal requires its declared evidence. Distributed confirmation and concrete accounting consequences remain separate.
- [ENTITY-EVOLUTION-029](../spec/entities/evolution.md) — The source explicitly permits discarding some operations after a response. That tradeoff does not authorize erasing committed history or rewriting preserved source facts; portable reversal requires its declared evidence. Distributed confirmation and concrete accounting consequences remain separate.
- [ENTITY-EVOLUTION-033](../spec/entities/evolution.md) — The source explicitly permits discarding some operations after a response. That tradeoff does not authorize erasing committed history or rewriting preserved source facts; portable reversal requires its declared evidence. Distributed confirmation and concrete accounting consequences remain separate.
- [WORKFLOW-CONFLICT-008](../spec/workflow/conflicts.md) — The source explicitly permits discarding some operations after a response. That tradeoff does not authorize erasing committed history or rewriting preserved source facts; portable reversal requires its declared evidence. Distributed confirmation and concrete accounting consequences remain separate.

[Full review: REV-0039](../research/allFindings.md#rev-0039) · [Contract comparison: MAP-0039](../research/traceability.md#map-0039)

## Audit and controls

### REV-0006 — Balanced totals do not establish the validity of an economic event

- **Study:** *An architectural model for ensuring financial accuracy and consistency of data in distributed operating systems*
- **Authors:** Mikhaylov Bogdan; Omorov Akzholbek; Izripov Iusup
- **Version:** 2026; European Journal of Technical and Natural Sciences, No. 4; DOI 10.29013/EJTNS-26-4-82-90.
- **Source:** [Read the study](https://ppublishing.org/media/uploads/journals/article/EJT-4-26_p82-90.pdf)
- **Location:** Physical PDF p. 6; printed p. 87, paragraph after equation (2).
- **Reading extent:** Selected passages
- **Evidence record:** [EVD-0003](../research/allFindings.md#evd-0003)

> an erroneous or duplicate transaction can still appear balanced

**Source context.** The paper expressly limits the sufficiency of per-currency balance. It cites Ellerman (2014); that underlying work was not independently verified.

**Source limitations.** Same work, not independent corroboration. Ledger recognition and posting remain outside Core scope; the quotation alone does not define accounting validity.

**FinKore benefit.** Provide a careful discussion of why a single conservation test cannot establish correct identity, authorization and economic meaning.

**Editorial interpretation.** Use as a bounded warning about sufficiency, with ledger scope explicitly deferred. Do not import the paper’s full ledger model or claim that current Entity validators implement accounting recognition.

**Conditions and limits.** The paper explicitly notes balanced errors but cites Ellerman; the original cited account has not been checked. A reviewer-created duplicate posting can preserve totals, but is not a Core operation or a financial test executed here.

**Current contract connections:**

- [CORE-005.1](../docs/coreDoc/core-doc.md#core-0051-continuing-financial-subjects-retain-stable-identity) — Stable financial-subject identity is useful context when discussing duplicated economic events. These clauses do not define balanced postings or accounting recognition; the ledger claim remains deferred.
- [ENTITY-IDENTITY-001](../spec/entities/identity.md) — Stable financial-subject identity is useful context when discussing duplicated economic events. These clauses do not define balanced postings or accounting recognition; the ledger claim remains deferred.
- [ENTITY-IDENTITY-002](../spec/entities/identity.md) — Stable financial-subject identity is useful context when discussing duplicated economic events. These clauses do not define balanced postings or accounting recognition; the ledger claim remains deferred.

[Full review: REV-0006](../research/allFindings.md#rev-0006) · [Contract comparison: MAP-0006](../research/traceability.md#map-0006)

### REV-0009 — Non-significance is not permission to remove a mandatory control

- **Study:** *Audit trails, financial transparency, and internal control effectiveness in public financial management systems*
- **Authors:** Oladapo Olatinsu; Cordilia Eke
- **Version:** 2025; PDF header IJRM 7(2), 1352–1363; DOI 10.33545/26648792.2025.v7.i1n.556.
- **Source:** [Read the study](https://www.managementpaper.net/archives/2025/vol7issue1/PartN/7-2-178-924.pdf)
- **Location:** Physical PDF p. 4; printed p. 1355, §2.4.
- **Reading extent:** Selected passages
- **Evidence record:** [EVD-0006](../research/allFindings.md#evd-0006)

> Primary data were collected using a structured,

**Source context.** Cross-sectional questionnaire study of 420 officials in Nigeria, Kenya and Ghana. The source’s outcome measures are organizational constructs, not implementation execution results.

**Source limitations.** The file path says vol7issue1 and DOI contains i1n while the PDF header says 7(2); issue identity needs editorial reconciliation. Sampling text does not independently establish causal identification.

- **Study:** *The Effects of Information Systems and the Utilization of Information Technology on the Quality of Financial Reports with Internal Control as Moderation*
- **Authors:** Cafriana Christin Bakker; Parawiyati; Dyah Ani Pangastuti
- **Version:** 2024; Journal of Economics, Finance and Management Studies 7(1), 476–482; DOI 10.47191/jefms/v7-i1-50.
- **Source:** [Read the study](https://ijefm.co.in/v7i1/Doc/50.pdf)
- **Location:** Physical PDF p. 1/printed p. 476, Abstract; physical p. 4/printed p. 479, paragraph explaining internal-control significance.
- **Reading extent:** Selected passages
- **Evidence record:** [EVD-0009](../research/allFindings.md#evd-0009)

> Internal control does not affect the quality of financial reports.

**Source context.** This is the authors’ abstract wording. The body reports a direct-model significance value of 0.056 against 0.05 in a 56-respondent questionnaire study; that does not establish absence of a causal effect.

**Source limitations.** Numeric value was checked in explanatory prose rather than inferred from table layout. The title says moderation while the body also analyzes indirect paths; model interpretation needs care. No statistical reanalysis performed.

**FinKore benefit.** Help Learn explain why organizational studies cannot waive a deterministic financial contract.

**Editorial interpretation.** Keep the reviewer’s inferential caution; do not repeat the causal-sounding quotation as an accepted scientific conclusion. The paper is usable as a clearly criticized example of overinterpretation.

**Conditions and limits.** The source’s literal “does not affect” wording is stronger than its observational evidence warrants. Failure to cross a significance threshold is not an equivalence test. Positive results in EVD-0006 concern different settings and do not directly refute this study.

**Current contract connections:**

- [SPEC-CONFORMANCE-001](../spec/conventions.md) — Applicable obligations are not waived by a questionnaire significance result. The study is a criticized methodological example, not accepted proof that controls have no effect. MUST and SHOULD retain distinct force.
- [SPEC-CONFORMANCE-002](../spec/conventions.md) — Applicable obligations are not waived by a questionnaire significance result. The study is a criticized methodological example, not accepted proof that controls have no effect. MUST and SHOULD retain distinct force.
- [CORE-002.2](../docs/coreDoc/core-doc.md#core-0022-validation-is-complete-fact-based-and-non-mutating) — Applicable obligations are not waived by a questionnaire significance result. The study is a criticized methodological example, not accepted proof that controls have no effect. MUST and SHOULD retain distinct force.

[Full review: REV-0009](../research/allFindings.md#rev-0009) · [Contract comparison: MAP-0009](../research/traceability.md#map-0009)

### REV-0019 — Successful import does not authenticate a complete historical record

- **Study:** *The Role of Data Authentication and Security in the Audit of Financial Statements*
- **Authors:** László Szívós; István Orosz
- **Version:** 2014.
- **Source:** [Read the study](https://acta.uni-obuda.hu/Szivos_Orosz_54.pdf)
- **Location:** Physical PDF page 13, printed 173, paragraph beginning “The most important usage”.
- **Reading extent:** Selected passages
- **Evidence record:** [EVD-0019](../research/allFindings.md#evd-0019)

> after a successful import of data

**Source context.** The authors place a consistency check after ERP migration and discuss relations, mappings and customization. Their conclusion’s much broader “perfect database” claim exceeds what the inspected control coverage establishes.

**Source limitations.** Selected passages only; no experiment or proof reproduced. Corrections/retraction status is unverified beyond the source page inspected.

**FinKore benefit.** Prevent Learn from presenting an import result as a certification of the legacy system’s provenance or completeness.

**Editorial interpretation.** Keep the source’s practical motivation with a narrower reviewer conclusion. Do not infer a historical replay requirement or a global registry.

**Conditions and limits.** A post-migration consistency check can find violated relations but is limited by the predicates and data it covers. Source authentication, omitted history and external reconciliation are separate application responsibilities.

**Current contract connections:**

- [CORE-005.1](../docs/coreDoc/core-doc.md#core-0051-continuing-financial-subjects-retain-stable-identity) — Validation preserves the supplied observation and history; empty supplied history is not historical completeness, and Workflow import creates no transition or Audit evidence. Legacy authentication/reconciliation remains separate.
- [CORE-003.2](../docs/coreDoc/core-doc.md#core-0032-committed-history-is-not-destructively-rewritten) — Validation preserves the supplied observation and history; empty supplied history is not historical completeness, and Workflow import creates no transition or Audit evidence. Legacy authentication/reconciliation remains separate.
- [ENTITY-IMPORT-002](../spec/entities/import.md) — Validation preserves the supplied observation and history; empty supplied history is not historical completeness, and Workflow import creates no transition or Audit evidence. Legacy authentication/reconciliation remains separate.
- [ENTITY-IMPORT-006](../spec/entities/import.md) — Validation preserves the supplied observation and history; empty supplied history is not historical completeness, and Workflow import creates no transition or Audit evidence. Legacy authentication/reconciliation remains separate.
- [ENTITY-IMPORT-012](../spec/entities/import.md) — Validation preserves the supplied observation and history; empty supplied history is not historical completeness, and Workflow import creates no transition or Audit evidence. Legacy authentication/reconciliation remains separate.
- [WORKFLOW-IMPORT-005](../spec/workflow/import.md) — Validation preserves the supplied observation and history; empty supplied history is not historical completeness, and Workflow import creates no transition or Audit evidence. Legacy authentication/reconciliation remains separate.

[Full review: REV-0019](../research/allFindings.md#rev-0019) · [Contract comparison: MAP-0019](../research/traceability.md#map-0019)

### REV-0022 — Counting controls does not establish independent assurance

- **Study:** *Managing Data Quality Risk in Accounting Information Systems*
- **Authors:** Xue Bai; Manuel Nunez; Jayant R. Kalagnanam
- **Version:** online 2011; volume 23(2), June 2012.
- **Source:** [Read the study](https://pubsonline.informs.org/doi/10.1287/isre.1110.0371)
- **Location:** HTML Abstract, paragraph 3; PDF page not available.
- **Reading extent:** Abstract only
- **Evidence record:** [EVD-0022](../research/allFindings.md#evd-0022)

> captures the correlated impact among control procedures

**Source context.** The abstract describes a risk-constrained Markov decision approach with a revenue-process illustration. The full model, optimization assumptions and application were not reviewed.

**Source limitations.** Selected passages only; no experiment or proof reproduced. Corrections/retraction status is unverified beyond the source page inspected.

**FinKore benefit.** Encourage Learn to ask which failure a control detects and whether two controls share the same weak input.

**Editorial interpretation.** Retain a qualitative, attributed discussion only. A quantitative recommendation requires the complete model and assumptions.

**Conditions and limits.** The shared-input example is reviewer inference. Correlation modeling in the abstract motivates the question; it does not quantify FinKore risk or prove a universal optimal control policy. A risk model does not waive an applicable MUST.

**Current contract connections:**

- [CORE-002.2](../docs/coreDoc/core-doc.md#core-0022-validation-is-complete-fact-based-and-non-mutating) — The abstract’s correlated-control model motivates asking whether controls share a weak input. These targets supply validation/conformance context, not a numerical risk model, independence theorem or permission to waive MUST obligations.
- [SPEC-CONFORMANCE-001](../spec/conventions.md) — The abstract’s correlated-control model motivates asking whether controls share a weak input. These targets supply validation/conformance context, not a numerical risk model, independence theorem or permission to waive MUST obligations.

[Full review: REV-0022](../research/allFindings.md#rev-0022) · [Contract comparison: MAP-0022](../research/traceability.md#map-0022)

### REV-0027 — Changing the representation does not establish equivalent control

- **Study:** *IMPACT OF INFORMATION TECHNOLOGY INNOVATIONS ON FINANCIAL TRANSACTION PROCESSING*
- **Authors:** Mysore Ramaswamy; Richard Calvasina; Eugene Calvasina; Gerald Calvasina
- **Version:** 2011; Issues in Information Systems XII(1), 36–43.
- **Source:** [Read the study](https://iacis.org/iis/2011/36-43_AL2011_1571.pdf)
- **Location:** Physical PDF page 5, printed 40, Strategic Role of Information Technology.
- **Reading extent:** Selected passages
- **Evidence record:** [EVD-0027](../research/allFindings.md#evd-0027)

> With the innovation, the need for control over cash payments is still necessary.

**Source context.** The authors contrast traditional voucher documents with electronic checks of authorized vendors, contracted items and scheduled quantities. Their historical example motivates control preservation, not a universal document checklist.

**Source limitations.** Selected passages only; no experiment or proof reproduced. Corrections/retraction status is unverified beyond the source page inspected.

**FinKore benefit.** Give Learn a historical example of preserving the financial predicate when a paper process becomes software.

**Editorial interpretation.** Retain the control-equivalence question. Do not mandate a four-document package or add accounts-payable behavior to Core.

**Conditions and limits.** The transfer to FinKore is reviewer inference. The article’s legal assertions, Just-In-Time process and document package are not verified as current or universal. A syntactically valid message does not itself establish payment eligibility.

**Current contract connections:**

- [CORE-002.2](../docs/coreDoc/core-doc.md#core-0022-validation-is-complete-fact-based-and-non-mutating) — Changing document representation does not itself satisfy the applicable declared financial predicates or eligibility. The historical voucher example motivates control preservation without mandating procurement rules or a document package.
- [ENTITY-VALIDATION-001](../spec/entities/validation.md) — Changing document representation does not itself satisfy the applicable declared financial predicates or eligibility. The historical voucher example motivates control preservation without mandating procurement rules or a document package.
- [ENTITY-VALIDATION-002](../spec/entities/validation.md) — Changing document representation does not itself satisfy the applicable declared financial predicates or eligibility. The historical voucher example motivates control preservation without mandating procurement rules or a document package.
- [ENTITY-VALIDATION-003](../spec/entities/validation.md) — Changing document representation does not itself satisfy the applicable declared financial predicates or eligibility. The historical voucher example motivates control preservation without mandating procurement rules or a document package.
- [APPROVAL-REQUIREMENT-006](../spec/approvals/requirements.md) — Changing document representation does not itself satisfy the applicable declared financial predicates or eligibility. The historical voucher example motivates control preservation without mandating procurement rules or a document package.

[Full review: REV-0027](../research/allFindings.md#rev-0027) · [Contract comparison: MAP-0027](../research/traceability.md#map-0027)

### REV-0036 — Preserving collected traces does not prove capture of required events

- **Study:** *From Application Logs to Audit Evidence in Financial Microservices*
- **Authors:** Surendra Kumar Valavala
- **Version:** 2024 appears in the manifest and publisher DOI; exact publication date: null.
- **Source:** [Read the study](https://www.ijrai.org/index.php/ijrai/article/view/796)
- **Location:** HTML Abstract, paragraph 3; PDF pages not available.
- **Reading extent:** Abstract only
- **Evidence record:** [EVD-0036](../research/allFindings.md#evd-0036)

> Mandatory audit events are retained independently of sampled diagnostic traces

**Source context.** The proposed framework uses business-state reconciliation as a separate completeness check. The abstract explicitly claims no deployment outcome, measured improvement or compliance certification.

**Source limitations.** DOI 10.15662/IJRAI.2024.0704023 verified on page. Selected conceptual statement only; no architecture or control effectiveness audit.

**FinKore benefit.** Prevent overclaiming that a tamper-evident collection proves nothing was omitted; also avoid overlooking Core’s existing evolution-specific audit obligation.

**Editorial interpretation.** Retain the conceptual distinction. A universal capture protocol is undefined; operation-specific required Audit evidence is already normative and cannot be called wholly deferred.

**Conditions and limits.** A separate expected workload can test coverage if it is independent of the collector. This is not a mandate to record every request or collect sensitive content indiscriminately. A diagnostic retry trace is not itself a unique financial effect.

**Current contract connections:**

- [CORE-003.1](../docs/coreDoc/core-doc.md#core-0031-a-committed-event-preserves-essential-evidence) — Domain event identity, complete event fields and preservation of committed records do not demonstrate capture of every required occurrence. The conceptual framework motivates an independent coverage question.
- [AUDIT-EVENT-003](../spec/audit/events.md) — Domain event identity, complete event fields and preservation of committed records do not demonstrate capture of every required occurrence. The conceptual framework motivates an independent coverage question.
- [AUDIT-EVENT-007](../spec/audit/events.md) — Domain event identity, complete event fields and preservation of committed records do not demonstrate capture of every required occurrence. The conceptual framework motivates an independent coverage question.
- [AUDIT-APPEND-001](../spec/audit/append-only.md) — Domain event identity, complete event fields and preservation of committed records do not demonstrate capture of every required occurrence. The conceptual framework motivates an independent coverage question.
- [ENTITY-AUDIT-001](../spec/entities/README.md) — Core already requires Audit production for identified Entity changes and corresponding atomic evidence for portable evolution. The general coverage question cannot be used to call these existing obligations wholly deferred.
- [ENTITY-AUDIT-002](../spec/entities/README.md) — Core already requires Audit production for identified Entity changes and corresponding atomic evidence for portable evolution. The general coverage question cannot be used to call these existing obligations wholly deferred.
- [ENTITY-EVOLUTION-029](../spec/entities/evolution.md) — Core already requires Audit production for identified Entity changes and corresponding atomic evidence for portable evolution. The general coverage question cannot be used to call these existing obligations wholly deferred.
- [ENTITY-EVOLUTION-033](../spec/entities/evolution.md) — Core already requires Audit production for identified Entity changes and corresponding atomic evidence for portable evolution. The general coverage question cannot be used to call these existing obligations wholly deferred.

[Full review: REV-0036](../research/allFindings.md#rev-0036) · [Contract comparison: MAP-0036](../research/traceability.md#map-0036)

## Approvals and authorization

### REV-0004 — Monitoring evidence is not an eligible business approval

- **Study:** *Data analytics and internal controls in U.S. financial systems: A review of fraud detection and financial reporting integrity*
- **Authors:** Francesca Nyarkoa Kobla; Jessica Fosua Agyei
- **Version:** 2026; Magna Scientia Advanced Biology and Pharmacy 18(02), 82–95; DOI 10.30574/msabp.2026.18.2.0060.
- **Source:** [Read the study](https://msabp.magnascientiapub.com/sites/default/files/fulltext_pdf/MSABP-2026-0060.pdf)
- **Location:** Physical PDF p. 7; printed p. 88, §5.2.
- **Reading extent:** Selected passages
- **Evidence record:** [EVD-0005](../research/allFindings.md#evd-0005)

> Preventive controls aim to minimize the risk of misconduct

**Source context.** The review distinguishes prevention, detection and correction. Its examples connect authorization and approval with prevention and exception monitoring with detection; these examples cite earlier literature not independently reviewed.

**Source limitations.** Selected passages only; no experiment or proof reproduced. Corrections/retraction status is unverified beyond the source page inspected.

**FinKore benefit.** Explain why an alert dashboard, access role or quiet monitoring system does not satisfy an applicable approval requirement.

**Editorial interpretation.** The distinction is defensible as a bounded explanatory comparison with the contract. Do not claim the paper defines FinKore approval semantics or mandates a universal human approval workflow.

**Conditions and limits.** A product can combine these controls in one interface, but their evidentiary questions differ. The review is a synthesis, not a causal test of any particular approval implementation.

**Current contract connections:**

- [CORE-004.1](../docs/coreDoc/core-doc.md#core-0041-approval-requirements-state-subject-eligibility-and-outcome) — Pending status and eligible business decision-makers cannot be replaced by monitoring output or technical access. Organizational monitoring and segregation-of-duties policy remain separate.
- [APPROVAL-REQUIREMENT-005](../spec/approvals/requirements.md) — Pending status and eligible business decision-makers cannot be replaced by monitoring output or technical access. Organizational monitoring and segregation-of-duties policy remain separate.
- [APPROVAL-REQUIREMENT-006](../spec/approvals/requirements.md) — Pending status and eligible business decision-makers cannot be replaced by monitoring output or technical access. Organizational monitoring and segregation-of-duties policy remain separate.

[Full review: REV-0004](../research/allFindings.md#rev-0004) · [Contract comparison: MAP-0004](../research/traceability.md#map-0004)

### REV-0012 — Timestamp precedence cannot replace the defined aggregation of effective approvals

- **Study:** *Conflict Resolution Strategies in Financial Data Replication Systems*
- **Authors:** Abhilash Katari
- **Version:** PDF says January 2020, IJSR 9(1); DOI 10.21275/SR24926100330.
- **Source:** [Read the study](https://www.ijsr.net/archive/v9i1/SR24926100330.pdf)
- **Location:** Physical PDF p. 4; printed p. 1977, §5.1.2 Limitations.
- **Reading extent:** Selected passages
- **Evidence record:** [EVD-0012](../research/allFindings.md#evd-0012)

> Earlier changes may be overwritten, leading to potential data loss.

**Source context.** The article describes the discard risk of LWW, while noting settings where selecting recent data is useful. It does not test FinKore approval aggregation.

**Source limitations.** Date carried by the header is reported, not reconciled with DOI registration chronology. Architecture recommendations and case-study claims are not treated as verified deployments.

**FinKore benefit.** Explain a concrete reason why the latest record is not necessarily the effective business decision.

**Editorial interpretation.** No universal ban on LWW is warranted. A consumer must preserve the required complete effective set and historical evidence at the domain boundary, regardless of storage design.

**Conditions and limits.** The example assumes both opposing Decisions are valid and still effective. Legitimate withdrawal/supersession differs from timestamp overwrite. LWW may still suit a cache or application value whose declared semantics permit it.

**Current contract connections:**

- [CORE-004.3](../docs/coreDoc/core-doc.md#core-0043-decisions-remain-tied-to-their-facts-and-history) — When opposing decisions remain valid and effective, defined aggregation and preserved history govern the result. A later timestamp alone is neither withdrawal nor supersession; LWW is not universally prohibited.
- [APPROVAL-REQUIREMENT-008](../spec/approvals/requirements.md) — When opposing decisions remain valid and effective, defined aggregation and preserved history govern the result. A later timestamp alone is neither withdrawal nor supersession; LWW is not universally prohibited.
- [AUDIT-APPEND-001](../spec/audit/append-only.md) — When opposing decisions remain valid and effective, defined aggregation and preserved history govern the result. A later timestamp alone is neither withdrawal nor supersession; LWW is not universally prohibited.

[Full review: REV-0012](../research/allFindings.md#rev-0012) · [Contract comparison: MAP-0012](../research/traceability.md#map-0012)

### REV-0017 — Authorize the action that is actually executed

- **Study:** *From CRUD to Autonomous Agents: Formal Validation and Zero-Trust Security for Semantic Gateways in AI-Native Enterprise Systems*
- **Authors:** Ignacio Peyrano
- **Version:** April 2026 preprint.
- **Source:** [Read the study](https://arxiv.org/pdf/2604.25555)
- **Location:** Physical PDF page 7, printed 7, §4.1, Policy Enforcement Point.
- **Reading extent:** Selected passages
- **Evidence record:** [EVD-0017](../research/allFindings.md#evd-0017)

> the proposed action, the target resource, and the generated parameters are evaluated deterministically

**Source context.** The proposed gateway places a policy check before execution; an adjacent human gate binds intent and parameters. The paper’s stronger claims about perfect traceability and isolation are not accepted here.

**Source limitations.** Selected passages only; no experiment or proof reproduced. Corrections/retraction status is unverified beyond the source page inspected.

**FinKore benefit.** Give Learn a concrete reason to separate an agent’s proposal from an authorized domain action.

**Editorial interpretation.** Retain the bounded security discussion. No MCP, OPA, cryptographic approval protocol or new Agentic operation is mandated.

**Conditions and limits.** Binding a human decision to the executed parameters is the reviewer’s application-level inference. The inspected architecture does not prove freedom from time-of-check/time-of-use faults. Not every FinKore action requires a human signature.

**Current contract connections:**

- [CORE-004.1](../docs/coreDoc/core-doc.md#core-0041-approval-requirements-state-subject-eligibility-and-outcome) — Approval scope and relevant subject facts delimit decision applicability. Binding an external tool execution to its approved parameters is a reviewer inference; no universal human signature or gateway architecture follows.
- [CORE-004.3](../docs/coreDoc/core-doc.md#core-0043-decisions-remain-tied-to-their-facts-and-history) — Approval scope and relevant subject facts delimit decision applicability. Binding an external tool execution to its approved parameters is a reviewer inference; no universal human signature or gateway architecture follows.
- [APPROVAL-DECISION-002](../spec/approvals/decisions.md) — Approval scope and relevant subject facts delimit decision applicability. Binding an external tool execution to its approved parameters is a reviewer inference; no universal human signature or gateway architecture follows.
- [APPROVAL-DECISION-003](../spec/approvals/decisions.md) — Approval scope and relevant subject facts delimit decision applicability. Binding an external tool execution to its approved parameters is a reviewer inference; no universal human signature or gateway architecture follows.
- [APPROVAL-VALIDITY-003](../spec/approvals/validity.md) — Approval scope and relevant subject facts delimit decision applicability. Binding an external tool execution to its approved parameters is a reviewer inference; no universal human signature or gateway architecture follows.

[Full review: REV-0017](../research/allFindings.md#rev-0017) · [Contract comparison: MAP-0017](../research/traceability.md#map-0017)

## Data and validation

### REV-0010 — Fast responses do not establish that the relevant facts are current

- **Study:** *Implementation of internal control and utilization of accounting information systems on the financial quality of PT. Misool Eco Resort (Case study in South Misol Islands, Raja Ampat Regency)*
- **Authors:** Ruth Octaviani P. Wermasubun; Linjte Kalangi; Heince R. N. Wokas
- **Version:** 2025; The Contrarian: Finance, Accounting, and Business Research 4(1), 37–46; DOI 10.58784/cfabr.230.
- **Source:** [Read the study](https://jurnal.ywnr.org/index.php/cfabr/article/download/230/292)
- **Location:** Physical PDF p. 1; printed p. 37, Abstract; corresponding discussion physical p. 6/printed p. 42.
- **Reading extent:** Selected passages
- **Evidence record:** [EVD-0010](../research/allFindings.md#evd-0010)

> However, issues such as data synchronization between branches and headquarters remain.

**Source context.** A qualitative single-company case reports favorable system speed and usability alongside unresolved synchronization. It supplies no universal freshness bound or demonstrated stale-authorization incident.

**Source limitations.** PDF distinguishes acceptance on 28 May from online publication on 29 May; manifest date is 28 May. Author initials are retained as printed, not expanded.

**FinKore benefit.** Show why latency, consistency and freshness need distinct evidence.

**Editorial interpretation.** Retain the risk as conditional application reasoning. No Core freshness SLA, remote lookup or required provenance field follows from the case. **This behavior is not currently defined by FinKore Core.** This refers to a universal freshness limit.

**Conditions and limits.** The source reports synchronization issues, not a measured stale-snapshot control failure. The financial scenario in the original finding is reviewer-created. Historical reports may intentionally use old observations.

**Current contract connections:**

- [CORE-005.3](../docs/coreDoc/core-doc.md#core-0053-evaluation-follows-declared-facts-and-context) — Explicit dependencies and comparisons against supplied observations do not guarantee freshness of remote facts. The reported synchronization issue motivates a conditional application risk, not a Core age limit.
- [WORKFLOW-GUARD-004](../spec/workflow/guards.md) — Explicit dependencies and comparisons against supplied observations do not guarantee freshness of remote facts. The reported synchronization issue motivates a conditional application risk, not a Core age limit.
- [ENTITY-IMPORT-007](../spec/entities/import.md) — Explicit dependencies and comparisons against supplied observations do not guarantee freshness of remote facts. The reported synchronization issue motivates a conditional application risk, not a Core age limit.

[Full review: REV-0010](../research/allFindings.md#rev-0010) · [Contract comparison: MAP-0010](../research/traceability.md#map-0010)

### REV-0014 — A changed prediction is a changed fact basis, not necessarily nondeterministic condition evaluation

- **Study:** *Deep Learning Architectures for Sequential Decision-Making in Financial Systems: From Fraud Detection to Risk Management*
- **Authors:** Bingying Jiang; Jialei Cao; Yutong Tan; Shi Qiu
- **Version:** 2025; Journal of Banking and Financial Dynamics 9(9), 1–11; DOI 10.55220/2576-6821.v9.631.
- **Source:** [Read the study](https://ecsenet.com/index.php/2576-6821/article/download/631/242)
- **Location:** Physical PDF p. 2; printed p. 2, Introduction, paragraph beginning “Despite these advances”.
- **Reading extent:** Selected passages
- **Evidence record:** [EVD-0014](../research/allFindings.md#evd-0014)

> statistical properties change over time due to evolving market conditions

**Source context.** The review identifies non-stationarity as a difficulty in financial modeling. It does not define a FinKore condition evaluation or prove that every prediction requires one retention architecture.

**Source limitations.** Quoted concept is discussed with a citation to prior literature, not independently verified as a new result. Model performance and compliance statements were not audited.

**FinKore benefit.** Explain reproducibility without prohibiting adaptive models or inventing a model-serving contract.

**Editorial interpretation.** The architectural boundary is a reviewer inference consistent with the contract, not a rule proved by the review paper. Hidden changes to evaluation basis should not be called the same inputs.

**Conditions and limits.** Reviewer scenario: a later model recomputes a different risk estimate; this does not reproduce the earlier supplied estimate. Whether that estimate is material and retained depends on the declared policy.

**Current contract connections:**

- [CORE-005.3](../docs/coreDoc/core-doc.md#core-0053-evaluation-follows-declared-facts-and-context) — Deterministic evaluation concerns the declared fact basis. A changed prediction changes that basis; the source does not demonstrate a FinKore violation or prohibit adaptive models.
- [APPROVAL-CONDITION-005](../spec/approvals/conditions.md) — Deterministic evaluation concerns the declared fact basis. A changed prediction changes that basis; the source does not demonstrate a FinKore violation or prohibit adaptive models.
- [WORKFLOW-GUARD-004](../spec/workflow/guards.md) — Deterministic evaluation concerns the declared fact basis. A changed prediction changes that basis; the source does not demonstrate a FinKore violation or prohibit adaptive models.
- [APPROVAL-CONDITION-003](../spec/approvals/conditions.md) — Retention of facts and condition version is a SHOULD recommendation here. It must not be rewritten as a universal model-version retention MUST.

[Full review: REV-0014](../research/allFindings.md#rev-0014) · [Contract comparison: MAP-0014](../research/traceability.md#map-0014)

### REV-0018 — Observed input still needs the applicable business validation

- **Study:** *From Sensors to Standardized Financial Reports: A Proposed Automated Accounting System Integrating IoT, Blockchain, and XBRL*
- **Authors:** Mohamed Nofel; Mahmoud Marzouk; Hany Elbardan; Reda Saleh; Aly Mogahed
- **Version:** 2024.
- **Source:** [Read the study](https://www.mdpi.com/1911-8074/17/10/445)
- **Location:** HTML §4.5, paragraph beginning “Next, edge computing”; PDF page not available.
- **Reading extent:** Selected passages
- **Evidence record:** [EVD-0018](../research/allFindings.md#evd-0018)

> preliminary validation and filtering

**Source context.** A proposed IoT–blockchain–XBRL system applies checks before recording data. The design is informed by expert interviews; recommendations and participant statements are not deployment evidence.

**Source limitations.** DOI 10.3390/jrfm17100445 verified on the publisher page. Selected prose only; figures and technical validation not inspected.

**FinKore benefit.** Explain why successful data transmission or authenticated origin cannot substitute for the declared financial predicate.

**Editorial interpretation.** Keep the validation boundary, without adopting the architecture or treating its interview findings as causal evidence.

**Conditions and limits.** This transfer is reviewer inference, not a rule formulated by the authors for FinKore. A sensor’s inventory observation alone does not establish a sale. Cleaning data must not silently invent business facts.

**Current contract connections:**

- [CORE-002.2](../docs/coreDoc/core-doc.md#core-0022-validation-is-complete-fact-based-and-non-mutating) — Declared structural/business validation applies to the complete supplied result, including import. The proposed sensor pipeline motivates that boundary without certifying fact truth, accounting recognition, IoT, blockchain or XBRL.
- [ENTITY-VALIDATION-001](../spec/entities/validation.md) — Declared structural/business validation applies to the complete supplied result, including import. The proposed sensor pipeline motivates that boundary without certifying fact truth, accounting recognition, IoT, blockchain or XBRL.
- [ENTITY-VALIDATION-002](../spec/entities/validation.md) — Declared structural/business validation applies to the complete supplied result, including import. The proposed sensor pipeline motivates that boundary without certifying fact truth, accounting recognition, IoT, blockchain or XBRL.
- [ENTITY-VALIDATION-003](../spec/entities/validation.md) — Declared structural/business validation applies to the complete supplied result, including import. The proposed sensor pipeline motivates that boundary without certifying fact truth, accounting recognition, IoT, blockchain or XBRL.
- [ENTITY-IMPORT-002](../spec/entities/import.md) — Declared structural/business validation applies to the complete supplied result, including import. The proposed sensor pipeline motivates that boundary without certifying fact truth, accounting recognition, IoT, blockchain or XBRL.

[Full review: REV-0018](../research/allFindings.md#rev-0018) · [Contract comparison: MAP-0018](../research/traceability.md#map-0018)

### REV-0020 — Historical reconstruction and recalculation under a new policy differ

- **Study:** *Demystifying Regulatory-Centric System Design in Financial Operations*
- **Authors:** Sneha Nallapu
- **Version:** 2025.
- **Source:** [Read the study](https://al-kindipublishers.org/index.php/jcsts/article/download/10816/9602)
- **Location:** Physical PDF page 4, printed 331, §3.2, final paragraph.
- **Reading extent:** Selected passages
- **Evidence record:** [EVD-0020](../research/allFindings.md#evd-0020)

> capabilities to execute historical rule sets for comparative analysis

**Source context.** The article recommends retaining transformation versions for reconstruction. This is an architectural recommendation, not a verified legal mandate or a demonstrated implementation.

**Source limitations.** Selected passages only; no experiment or proof reproduced. Corrections/retraction status is unverified beyond the source page inspected.

**FinKore benefit.** Help Learn distinguish what was decided under the then-bound workflow from a comparison under a later policy.

**Editorial interpretation.** Retain the distinction; do not turn hypothetical recalculation into a correction of committed history or permission to migrate.

**Conditions and limits.** The broader calculation discussion is reviewer inference. Current Workflow requirements prevent silent rebinding; they do not define an execution engine for all historical financial calculations. Regulatory claims were not independently checked.

**Current contract connections:**

- [WORKFLOW-VERSION-003](../spec/workflow/versioning.md) — Immutable definition identity and lifecycle binding keep an instance under its governing version. The paper motivates distinguishing reconstruction from a new-policy comparison; it does not establish a general replay engine or migration authority.
- [WORKFLOW-VERSION-008](../spec/workflow/versioning.md) — Immutable definition identity and lifecycle binding keep an instance under its governing version. The paper motivates distinguishing reconstruction from a new-policy comparison; it does not establish a general replay engine or migration authority.
- [WORKFLOW-VERSION-009](../spec/workflow/versioning.md) — Immutable definition identity and lifecycle binding keep an instance under its governing version. The paper motivates distinguishing reconstruction from a new-policy comparison; it does not establish a general replay engine or migration authority.
- [WORKFLOW-VERSION-011](../spec/workflow/versioning.md) — Immutable definition identity and lifecycle binding keep an instance under its governing version. The paper motivates distinguishing reconstruction from a new-policy comparison; it does not establish a general replay engine or migration authority.
- [CORE-005.3](../docs/coreDoc/core-doc.md#core-0053-evaluation-follows-declared-facts-and-context) — Declared context is foundation-level context for reproducibility. Retaining and replaying every financial calculation version is a broader application policy, not an obligation introduced by this link.

[Full review: REV-0020](../research/allFindings.md#rev-0020) · [Contract comparison: MAP-0020](../research/traceability.md#map-0020)

## Verification and reliability

### REV-0025 — Passing a finite suite has a defined evidential scope

- **Study:** *The LDBC Financial Benchmark*
- **Authors:** Shipeng Qi; Heng Lin; Zhihui Guo; Gábor Szárnyas; Bing Tong; Yan Zhou; Bin Yang; Jiansong Zhang; Zheng Wang; Youren Shen; Changyuan Wang; Parviz Peiravi; Henry Gabb; Ben Steer (arXiv author list)
- **Version:** arXiv v2, 30 June 2023; benchmark version 0.1.0.
- **Source:** [Read the study](https://arxiv.org/pdf/2306.15975v2)
- **Location:** Physical PDF page 63, footer “Page 63 of 85”, §8.3.2 (ACID Compliance); earlier contents refer to ACID tests at 50.
- **Reading extent:** Selected passages
- **Evidence record:** [EVD-0025](../research/allFindings.md#evd-0025)

> No finite series of tests can prove that the ACID properties are fully supported.

**Source context.** FinBench states a limit of finite tests and explicitly attributes this passage to TPC-C. TPC-C was not independently read and is not counted as separate evidence.

**Source limitations.** Author names cross-checked at https://arxiv.org/abs/2306.15975 . Actual extracted location is physical 63, not the earlier notebook’s 50–52; TOC and body pagination differ. Selected prose, not whole benchmark audit.

**FinKore benefit.** Support accurate Learn wording about what portable cases demonstrate and what remains untested.

**Editorial interpretation.** Retain this caution without diminishing mutation-sensitive and boundary cases or adding a repository runner.

**Conditions and limits.** The passage concerns ACID benchmark testing; applying the epistemic limit to FinKore is reviewer inference. Strong cases remain useful. The source’s benchmark requirements do not become FinKore requirements.

**Current contract connections:**

- [SPEC-CONFORMANCE-001](../spec/conventions.md) — Applicable obligations and requirement-to-case references differ from proof over all executions. The benchmark passage motivates a methodological limit; a traced finite suite remains useful and is not implementation execution evidence.
- [SPEC-REQUIREMENT-005](../spec/conventions.md) — Applicable obligations and requirement-to-case references differ from proof over all executions. The benchmark passage motivates a methodological limit; a traced finite suite remains useful and is not implementation execution evidence.

[Full review: REV-0025](../research/allFindings.md#rev-0025) · [Contract comparison: MAP-0025](../research/traceability.md#map-0025)

### REV-0030 — A correlated score is not an independent conformity test

- **Study:** *Machine Learning and Data Science for ESG Compliance Measurement in Financial Software Engineering Projects: A Single-Case Socio-Technical Systems Analysis*
- **Authors:** Kenneth David Strang; Narasimha Rao Vajjhala
- **Version:** 14 August 2026; Systems 14(8), 990.
- **Source:** [Read the study](https://www.mdpi.com/2079-8954/14/8/990)
- **Location:** HTML Abstract, paragraph on correlation analysis; physical and printed PDF pages not available.
- **Reading extent:** Abstract only
- **Evidence record:** [EVD-0030](../research/allFindings.md#evd-0030)

> descriptive property of the firm’s evaluation system

**Source context.** The single-case study examines 207 archived project records. The authors bound method-based explanations and distinguish correlated ratings from validated distinct constructs. Weak exploratory classification is not proof of contradictory results or data leakage.

**Source limitations.** Abstract and metadata checked; detailed methods and numeric tables not audited. No FinKore conformance property was measured.

**FinKore benefit.** Help Learn identify a metric’s measured construct before using it as assurance that a financial predicate holds.

**Editorial interpretation.** Retain a narrow methodological caution, not a claim that a high score proves or disproves compliance.

**Conditions and limits.** Applying this study to FinKore is reviewer inference. The study does not discredit all ESG measurement or ML, nor demonstrate an actual FinKore violation. Shared measurement processes can explain correlations; alternative model-design explanations remain possible.

**Current contract connections:**

- [SPEC-CONFORMANCE-001](../spec/conventions.md) — A stakeholder score does not establish satisfaction of applicable mandatory or recommended obligations. The single-case ESG study motivates measurement scrutiny, not a universal claim about ESG/ML or a FinKore compliance experiment.
- [SPEC-CONFORMANCE-002](../spec/conventions.md) — A stakeholder score does not establish satisfaction of applicable mandatory or recommended obligations. The single-case ESG study motivates measurement scrutiny, not a universal claim about ESG/ML or a FinKore compliance experiment.

[Full review: REV-0030](../research/allFindings.md#rev-0030) · [Contract comparison: MAP-0030](../research/traceability.md#map-0030)

### REV-0032 — Preventing an invalid state does not guarantee eventual completion

- **Study:** *Deadlock Verification of the Room Allocation Workflow in an EHR System Using UPPAAL*
- **Authors:** Acep Taryana; Dieky Adzkiya; Muhammad Syifa’ul Mufid; Imam Mukhlash
- **Version:** 13 August 2026; Computers, Materials & Continua 89(1), 91.
- **Source:** [Read the study](https://www.techscience.com/cmc/v89n1/68376/html)
- **Location:** HTML §3.1, Deadlock-Freedom & Progress bullet; PDF pages not available.
- **Reading extent:** Selected passages
- **Evidence record:** [EVD-0032](../research/allFindings.md#evd-0032)

> every valid request eventually reaches a completion state

**Source context.** The hospital workflow study states a separate eventual-completion property alongside safe allocation, timing and deadlock checks. This is an author-reported model result, not verified financial software or an independently reproduced proof.

**Source limitations.** Selected passages only; no experiment or proof reproduced. Corrections/retraction status is unverified beyond the source page inspected.

**FinKore benefit.** Suggest a Learn discussion that asks separately whether a valid request can finish and whether an invalid transition is prevented.

**Editorial interpretation.** Retain this bounded distinction without adding a scheduler, deadline or universal liveness requirement to Core.

**Conditions and limits.** This is methodological transfer from healthcare, not a financial rule demonstrated by that study. Fairness, resource availability and admissible requests matter. An intentionally terminal state is not a deadlock defect; statistical confidence is not an unconditional proof for arbitrary executions.

**Current contract connections:**

- [CORE-002.1](../docs/coreDoc/core-doc.md#core-0021-lifecycle-changes-require-a-declared-valid-transition) — Valid transitions, intentional terminal states and non-mutating rejection do not establish fairness or per-request eventual completion. The hospital study supplies methodological context, not financial execution evidence or a universal deadline.
- [WORKFLOW-TRANSITION-004](../spec/workflow/transitions.md) — Valid transitions, intentional terminal states and non-mutating rejection do not establish fairness or per-request eventual completion. The hospital study supplies methodological context, not financial execution evidence or a universal deadline.
- [WORKFLOW-TRANSITION-006](../spec/workflow/transitions.md) — Valid transitions, intentional terminal states and non-mutating rejection do not establish fairness or per-request eventual completion. The hospital study supplies methodological context, not financial execution evidence or a universal deadline.
- [WORKFLOW-TRANSITION-007](../spec/workflow/transitions.md) — Valid transitions, intentional terminal states and non-mutating rejection do not establish fairness or per-request eventual completion. The hospital study supplies methodological context, not financial execution evidence or a universal deadline.
- [WORKFLOW-TERMINAL-001](../spec/workflow/terminal-states.md) — Valid transitions, intentional terminal states and non-mutating rejection do not establish fairness or per-request eventual completion. The hospital study supplies methodological context, not financial execution evidence or a universal deadline.
- [WORKFLOW-CONFLICT-008](../spec/workflow/conflicts.md) — Valid transitions, intentional terminal states and non-mutating rejection do not establish fairness or per-request eventual completion. The hospital study supplies methodological context, not financial execution evidence or a universal deadline.

[Full review: REV-0032](../research/allFindings.md#rev-0032) · [Contract comparison: MAP-0032](../research/traceability.md#map-0032)

### REV-0033 — A proof can establish a property different from the intended rule

- **Study:** *Formal Verification of Business Constraints in Workflow-Based Applications*
- **Authors:** Florin Stoica; Laura Florentina Stoica
- **Version:** 5 December 2024; Information 15(12), 778.
- **Source:** [Read the study](https://www.mdpi.com/2078-2489/15/12/778)
- **Location:** HTML §5.1, paragraph immediately before §5.2; PDF pages not available.
- **Reading extent:** Selected passages
- **Evidence record:** [EVD-0033](../research/allFindings.md#evd-0033)

> the business constraint is not correctly modeled by the ATL formula proposed by the AI assistant

**Source context.** The authors report a generated property failing to encode an intended ordering condition in their workflow example. This review checks their explanatory prose; it does not validate the formula, model checker or screenshot.

**Source limitations.** Selected passages only; no experiment or proof reproduced. Corrections/retraction status is unverified beyond the source page inspected.

**FinKore benefit.** Help Learn explain why formalization and its evidence need review against the original financial obligation.

**Editorial interpretation.** Retain the author-reported caution. FinKore does not require ATL, APEX or a particular proof system.

**Conditions and limits.** A changed ordering example is reviewer inference; the source reports a particular assistant/model interaction. No general LLM error rate or superiority of a prompting strategy is established here. Formulas and figures were not independently inspected visually.

**Current contract connections:**

- [WORKFLOW-TRANSITION-004](../spec/workflow/transitions.md) — A translated property must still describe the applicable guards and intended observation. Requirement references aid review but do not prove translation equivalence. The source’s reported assistant error does not mandate ATL/APEX or measure a general LLM error rate.
- [WORKFLOW-GUARD-001](../spec/workflow/guards.md) — A translated property must still describe the applicable guards and intended observation. Requirement references aid review but do not prove translation equivalence. The source’s reported assistant error does not mandate ATL/APEX or measure a general LLM error rate.
- [WORKFLOW-GUARD-002](../spec/workflow/guards.md) — A translated property must still describe the applicable guards and intended observation. Requirement references aid review but do not prove translation equivalence. The source’s reported assistant error does not mandate ATL/APEX or measure a general LLM error rate.
- [SPEC-REQUIREMENT-005](../spec/conventions.md) — A translated property must still describe the applicable guards and intended observation. Requirement references aid review but do not prove translation equivalence. The source’s reported assistant error does not mandate ATL/APEX or measure a general LLM error rate.

[Full review: REV-0033](../research/allFindings.md#rev-0033) · [Contract comparison: MAP-0033](../research/traceability.md#map-0033)

## Further investigation

These considerations are visible for follow-up. Their evidence or interpretation is not ready for the findings collection above. A finding marked not recommended is retained to explain why it should not be reused.

| Consideration | Reading status | Follow-up |
| --- | --- | --- |
| [Declared Audit ordering is different from an infrastructure-wide causal or total order](../research/allFindings.md#rev-0003) | Needs more evidence | Retrieve primary full text and a bounded exact supporting passage; check failure model and whether ordering is per related entity or global. |
| [Organizational audit-trail associations cannot establish portable conformance](../research/allFindings.md#rev-0005) | Needs more evidence | Check source/version and current contract again before publication; no normative change is accepted here. |
| [Self-reported cybersecurity compliance is not evidence of a particular approval](../research/allFindings.md#rev-0007) | Needs more evidence | Check source/version and current contract again before publication; no normative change is accepted here. |
| [Protected content and preserved event evidence are compatible goals](../research/allFindings.md#rev-0008) | Needs more evidence | Check source/version and current contract again before publication; no normative change is accepted here. |
| [An editing convenience does not establish permission to rewrite committed history](../research/allFindings.md#rev-0011) | Not recommended for reuse | Check source/version and current contract again before publication; no normative change is accepted here. |
| [Late information can revise a projection without rewriting an occurrence](../research/allFindings.md#rev-0013) | Needs more evidence | Check source/version and current contract again before publication; no normative change is accepted here. |
| [Successful integration does not establish equivalent financial meaning](../research/allFindings.md#rev-0015) | Needs more evidence | Check source/version and current contract again before publication; no normative change is accepted here. |
| [Compensation and failure atomicity concern different boundaries](../research/allFindings.md#rev-0016) | Needs more evidence | Check source/version and current contract again before publication; no normative change is accepted here. |
| [A supplied prediction is not independently established financial truth](../research/allFindings.md#rev-0021) | Needs more evidence | Check source/version and current contract again before publication; no normative change is accepted here. |
| [A missing response does not establish financial failure](../research/allFindings.md#rev-0023) | Needs more evidence | Check source/version and current contract again before publication; no normative change is accepted here. |
| [A default cannot silently replace a required business fact](../research/allFindings.md#rev-0026) | Needs more evidence | Check source/version and current contract again before publication; no normative change is accepted here. |
| [Detecting a violation afterward does not satisfy a preventive guard](../research/allFindings.md#rev-0028) | Needs more evidence | Check source/version and current contract again before publication; no normative change is accepted here. |
| [Preserved evidence can faithfully preserve an invalid financial assertion](../research/allFindings.md#rev-0029) | Needs more evidence | Check source/version and current contract again before publication; no normative change is accepted here. |
| [A stable error category and useful diagnostic location serve different needs](../research/allFindings.md#rev-0037) | Needs more evidence | Check source/version and current contract again before publication; no normative change is accepted here. |
| [Individually checked rules need not establish a composed result](../research/allFindings.md#rev-0038) | Needs more evidence | Check source/version and current contract again before publication; no normative change is accepted here. |

## Reading the evidence

A quoted passage is the author’s statement. The interpretation and potential benefit to FinKore are editorial analysis. A useful discussion may illustrate a risk, identify an application policy, or limit a claim without adding a Core requirement.

Source access varies. A section locator is given when no PDF page is available; partial reading remains partial reading. The full evidence record preserves source versions, reading dates, attribution, and unresolved questions. Multiple passages from the same work are not independent confirmation.

Any change to financial behavior follows the existing CoreDoc, specification, conformance and Agentic process. These research notes do not establish specialist sign-off, certification, or normative acceptance.

[Explore the complete research review](../research/allFindings.md) · [Browse research-to-contract traceability](../research/traceability.md)
