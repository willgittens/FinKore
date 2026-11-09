# Idempotency and Concurrency — Draft for FinKore 2.1

**Status:** Active discussion draft, non-normative and not accepted for release.
**Date:** 2026-11-05.
**Current baseline:** FinKore Core 2.0.2 stable.
**Discussion:** [Portable financial guarantees, discussion #29](https://github.com/willgittens/FinKore/discussions/29).
**Active implementation planning:** [Core 2.1 task list](core-2.1-task-list.md).

This draft proposes the rules to specify for a possible 2.1 release. It does
not change the published contract, assign requirement IDs or portable error
codes, or commit the project to that release scope. Here, implementing the
proposal in FinKore means publishing specifications, conformance artifacts,
and Agentic metadata. Consumers implement and execute the financial behavior.

The task list carries the current delivery scope: the three original scenarios
plus committed effect with lost response and retry/restart. Detailed policies
below, especially instruction equivalence, replay of domain rejections, and
retention/key reuse, remain candidates until resolved in specification work.
Their illustrative expected observations are not pre-approved requirements.

## 1. Where should idempotency belong?

> Should idempotency be part of FinKore Core, a separate domain, or remain a
> consumer responsibility?

**Recommendation: a separately documented, opt-in behavioral profile within
FinKore Core, shared across applicable domains.** Its guarantees become
mandatory for an implementation claiming that profile. Supporting an existing
Core operation alone does not imply support for request idempotency.

This separates ownership of the rules from ownership of their realization:

| Choice | Assessment |
| --- | --- |
| Mandatory behavior on every existing Core operation | Would change existing observable contracts and impose request identity on operations that do not need it. Do not adopt this approach for 2.1. |
| A cross-domain profile within Core | Recommended. Defines one reusable meaning for request identity, replay, conflict, and incomplete execution while preserving explicit adoption. |
| A separate financial domain or independently versioned extension | Possible later if the scope grows. Initially, idempotency qualifies operations in existing domains rather than introducing a new financial subject. |
| Entirely a consumer responsibility | Consumers still own mechanisms, deployment, and execution evidence. Leaving the guarantees entirely unspecified would preserve the inconsistencies raised in discussion #29. |

The profile needs an explicit applicability and conformance-claim model before
adoption. It is not an HTTP middleware contract, executable service, generic
operation dispatcher, or requirement to install a FinKore library.

## 2. Existing obligations and gaps

The following current artifacts constrain this proposal:

| Source | Existing meaning to preserve |
| --- | --- |
| [CoreDoc](coreDoc/core-doc.md), CORE-002.2 and CORE-002.3 | Validate before exposing a change; rejected actions preserve relevant financial state and committed history. The current boundaries do not establish network-failure or retry semantics. |
| [CoreDoc](coreDoc/core-doc.md), CORE-003.1 and CORE-003.2 | Preserve committed evidence and its identity. |
| [CoreDoc](coreDoc/core-doc.md), CORE-004.3 and CORE-005.3 | Approval depends on its subject facts; evaluation follows declared inputs, state, and context. |
| [Workflow conflicts](../spec/workflow/conflicts.md), WORKFLOW-CONFLICT-003 through WORKFLOW-CONFLICT-008 | Expected-state and expected-revision checks reject stale observations, but do not define atomic storage checks or choose concurrent winners. |
| [Workflow Guards](../spec/workflow/guards.md), WORKFLOW-GUARD-004, and CORE-005.3 | External dependence is identified in the guard definition; a portable dependency declaration and general fact-capture/retention model are not published. Consumer review does not close the PARTIAL authoring boundary. |
| [Entity revisions](../spec/entities/revisions.md), ENTITY-REVISION-002 and ENTITY-REVISION-006 | Business revisions, stable Entity identity, and conflict tokens retain distinct meanings. |
| [Audit append-only rules](../spec/audit/append-only.md), AUDIT-APPEND-003 | A fresh submission of an already committed Audit Event identity fails with `FINKORE_AUDIT_DUPLICATE_EVENT`. |
| [Agentic effects](../agentic/effects.md) | State-changing request idempotency is explicitly unspecified. Determinism and non-mutation do not establish request deduplication. |
| [Conformance conventions](../conformance/conventions.md), [schema](../conformance/vector.schema.json), and [traceability](../conformance/traceability.md) | Existing isolated input/result vectors and artifact validation do not prove concurrent execution safety. |

For scoped request identity, replay, pending execution, uncertain completion,
and atomic arbitration between simultaneous duplicate requests:

> This behavior is not currently defined by FinKore Core.

Plausible choices include immediate replay, waiting, a pending observation,
or rejection while execution is incomplete. Treating these choices as already
equivalent could hide duplicate effects or incorrectly report an unknown
outcome as failure. The next sections propose explicit choices.

## 3. Proposed scope

Start with declared consumer-owned execution boundaries that apply the
semantics of `finkore.entity.create`, `finkore.entity.mutate`,
`finkore.entity.transition`, or `finkore.workflow.transition` to a named
financial subject or explicitly declared creation scope. A profile claim
identifies exactly which operations and composing boundaries it covers.

Passing a supplied Entity observation to an existing operation does not, by
itself, establish a shared current-state authority or a durable execution
boundary. The profile adds those obligations only where explicitly claimed.

The guarantee covers the declared operation's committed domain effects,
including any Audit evidence required by its composing rules. It does not
standardize charges, transfers, ledger entries, settlement, or effects in
external payment providers. The payment example motivates the proposal;
payments remain outside the current financial domain model.

Pure Money calculations need no request-deduplication requirement in this
initial scope. Approval operations and direct Audit append can be evaluated
for later profile adoption without changing their current contracts here.

## 4. Proposed rules

These are proposed obligations for the profile, not current normative clauses.
Section numbers are discussion references, not stable requirement identifiers.

### 4.1 Explicit adoption and request identity

An opted-in request supplies a valid, opaque idempotency key and a declared
opaque scope. Missing, null, empty, and malformed values are distinguished
and rejected at the profile boundary; none silently disables protection.

Logical request identity is the tuple of scope, canonical operation identifier,
and key. The scope is established by the trusted consumer boundary and may
represent an organization or another declared isolation boundary. A key alone
neither establishes tenancy nor grants access.

Keys are compared exactly without trimming, case conversion, or interpretation
of their contents. The same key in another declared scope or canonical
operation identifies an independent request. Different keys do not automatically
identify the same business instruction, even when their payloads match.

The profile version and instruction-comparison rules are retained with the
binding. Upgrading a deployment does not silently reset that binding or create
a new namespace in which an old request can execute again.

### 4.2 Bind the complete instruction

The first admitted request binds its identity to an immutable instruction.
That instruction includes the target, requested change, applicable definition
identity/version, supplied preconditions, actor attribution where relevant,
and explicit facts and context used to determine the domain outcome.

The composing declaration lists the complete input projection. It cannot
exclude a value that changes financial effects, approval meaning, or required
evidence. Transport tracing and current access checks are separate from this
instruction. An observed current-state snapshot is distinct from the caller's
expected-state or conflict-token precondition; profile adoption must document
that mapping rather than guess it from an existing fixture shape.

The maintenance [guard dependency disposition](core-2.1-task-list.md#guard-dependency-disposition-before-21)
retains consumer-authored declarations and defers a portable schema. For this
proposal, the operation mapping still needs to distinguish caller-supplied
facts/context, authoritative current-state observations, and externally
obtained provenance. Relevant capture time, source observation, and policy or
definition binding cannot silently disappear from the mapping merely because
a local fixture consumes a Boolean. Which values form the instruction and
which support its execution evidence remains a profile decision; no mandatory
provenance envelope or retention regime is introduced here. A live-dependency
mapping stays unresolved until capture, comparison, and recovery semantics
are defined; this does not block unrelated mappings or accept the full RFC.

Proposed initial comparison is structural equality of the declared portable
instruction: object member order is irrelevant; array order and scalar values
are significant; omission and explicit null remain distinct. Decimal strings
retain their spelling, so `"10.0"` and `"10.00"` conflict in this profile even
where Money considers their numeric values equal. No rounding, floating-point
conversion, or implicit normalization is permitted. Future semantic
canonicalization would require an explicit compatibility decision.

A hash is an implementation technique, not the definition of equivalence.
The consumer remains responsible for preserving the declared comparison rules.

### 4.3 Same identity, different instruction

A request matching an existing identity but carrying a different instruction
is rejected as an idempotency conflict, whether the original is pending,
completed, rejected, or unresolved. It does not replace the instruction,
overwrite its result, or change any financial state or committed evidence.

This is distinct from an expected-state or revision conflict. New portable
error names are left for an accepted specification; the discussion's
`IDEMPOTENCY_CONFLICT` wording is not an existing FinKore portable error code.

### 4.4 Same identity, completed instruction

A matching duplicate returns the recorded original domain outcome without
executing the instruction again. Stable subject identities, returned values,
and required evidence references remain those of the original execution.

Replay does not restore an old Entity snapshot over current state, advance a
revision, refresh approval, or create another committed financial event. A
historical result remains distinguishable from a current-state observation.

The outcome is returned as an independently owned observation: modifying a
replay result cannot change the retained result or subsequent replays.
HTTP status, headers, and byte-for-byte response caching are consumer choices.

### 4.5 Same identity, execution in progress

A matching request received before completion does not start a competing
execution. The baseline exposes an explicit pending outcome. A consumer may
wait and return replay if completion becomes known, but immediate replay is
not mandatory while no result exists.

Pending is neither financial success nor a completed domain rejection. A later
matching attempt returns the recorded outcome once available. Wait duration,
polling, retry backoff, and transport status are outside the profile.

### 4.6 Concurrent duplicates and the commit boundary

For one scoped request identity, concurrent matching submissions produce at
most one committed instance of the declared domain effect. If execution
succeeds, all completed observations refer to that same committed outcome.
Execution order does not determine a portable caller-specific winner.

The visible completion record, domain changes, and any required committed
Audit evidence remain mutually consistent. Success cannot be published with
missing required evidence or a completion record for effects that did not
commit. No particular transaction, lock, uniqueness constraint, or storage
technology is prescribed.

This is an at-most-once committed-effect guarantee. It does not require one
function invocation, guarantee eventual success during outages, or promise
exactly-once delivery across arbitrary external systems.

### 4.7 Terminal rejection versus technical interruption

A completed domain rejection is retained and replayed with its original
portable error. The rejection leaves financial state and committed financial
history unchanged according to its owning domain. A later attempt with
different facts is a new instruction and requires a new key.

Malformed profile input is rejected before admission and does not reserve a
valid identity. Once a valid instruction is admitted, its completed domain
rejection is retained. This distinction requires an explicit validation order
in the eventual profile specification.

A technical interruption is not automatically a completed domain rejection.
If the consumer proves that no effect committed and no earlier execution can
still commit, it may continue the original bound instruction. It does not
silently replace its facts or preconditions with current ones.

### 4.8 Unknown outcomes and recovery

Timeout, lost response, disconnected storage, or process death can leave
completion unknown. The request remains unresolved until evidence establishes
the original result or establishes safe continuation with no prior committed
effect and no surviving authority to commit it.

Elapsed time or an expired lock alone is insufficient evidence. A duplicate
cannot report success, report a completed rejection, or start another
potentially duplicating effect merely because the first caller timed out.

Recovery preserves the binding and any committed result across restart or
failover within the declared deployment boundary. An older execution that
resumes after recovery cannot commit a second effect or overwrite the outcome.
The profile states that property without selecting a fencing or coordination
algorithm. Unresolved is an observable condition, not a new error code assigned
by this draft.

### 4.9 Retention and key reuse

The consumer declares the result-replay retention interval and deployment
boundary. Portable cases use explicit evaluation instants and expiry facts;
they do not sleep or depend on wall-clock time. The interval includes its start
and excludes its expiry instant.

Proposed safety baseline: expiry of the full replay result does not make the
old identity executable again. The boundary retains enough binding evidence to
refuse reuse, or retires and rejects the affected scope. It can indicate that
the old result is unavailable, without claiming a new financial success.
Permanent retention of the full payload or response is not required.

This deliberately costs more than a cache TTL that permits re-execution.
Deleting all evidence while continuing to accept the same scope cannot support
this guarantee. A deployment that loses its binding authority fails closed;
it does not interpret missing records after data loss as new instructions.

Finite-window deduplication with automatic key reuse is an alternative policy
for later review, not an interchangeable implementation of this baseline.
Retention expiry also does not resolve an unknown operation outcome.

### 4.10 Domain rules and disclosure remain authoritative

Admission does not bypass Workflow guards, definition binding, Entity
validation, mutability, or Approval conditions. A first execution follows the
owning domain's error precedence and failure atomicity.

For an admitted identity, instruction comparison and replay classification
precede fresh domain evaluation. A replay is retrieval of a historical outcome,
not a new attempt to validate the transition from today's state. New requests
continue to evaluate current applicable conditions.

Consumers check current authority to disclose a recorded result. Knowing the
key is not authorization; denying disclosure does not change the recorded
financial outcome. Replay never makes an old Approval effective for a new
instruction. FinKore does not define the authentication or authorization model.

A fresh duplicate Audit Event submission still follows AUDIT-APPEND-003.
Replaying a covered operation does not submit its Audit Event again. Technical
attempt logs can exist separately; they are not duplicate committed financial
events or a new Core requirement to audit every attempt.

## 5. Concurrency between different requests

Idempotency answers whether the same identified instruction can cause another
effect. It does not decide whether two different instructions may both change
the same financial subject.

For example, two different keys can both request a change from the same
observed Workflow state. Deduplicating each key does not establish that their
combined outcome respects a shared current state.

**Proposed 2.1 boundary:** include arbitration between duplicates of the same
request identity. Preserve existing Workflow and Entity precondition rules.
Defer a general profile for atomic compare-and-apply between different request
identities until its scope is separately accepted.

That later profile would need to define the authority for current state, the
indivisible relationship between checking a precondition and committing a
change, conflict-token progression, and behavior when several requests share
one expected token. Existing supplied-observation checks do not provide those
guarantees. Business revision identity cannot silently become a lock token.

Distributed coordination, multi-entity atomicity, deadlock policy, global Audit
ordering, and automatic retry of stale instructions remain deferred. A claim
for this draft's idempotency profile is not a general concurrency-safety claim.

## 6. Proposed acceptance scenarios

Each scenario starts with explicit isolated state and contains its own logical
history. These are case descriptions, not an executable format or new vector
operation labels.

| Scenario | Expected observation | Plausible defect detected |
| --- | --- | --- |
| Same scope, operation, key, and instruction after success | Original outcome; unchanged current state and effect count on replay | Execute again on every retry |
| Same identity, changed financial instruction | Conflict; original binding, outcome, state, and evidence preserved | Key-only lookup ignores payload |
| Same key, another declared scope or operation | Independent identity, subject to ordinary domain checks | Global key collision or unintended shared response |
| Same identity, object members reordered | Matching instruction | Raw JSON text used as identity |
| Same identity, reordered significant array or omitted value changed to null | Conflict | Lossy canonicalization |
| Same identity, decimal spelling changed | Conflict under the proposed structural comparison | Numeric coercion or silent normalization |
| Two matching submissions held before completion | One logical execution authority; duplicate pending, or replay after controlled completion | Read-then-create race |
| Concurrent duplicate with changed instruction | Conflict; no competing effect or overwritten binding | Pending record accepts changed payload |
| Effect committed, response lost, then restart and retry | Original result recovered; one committed effect group | Missing durable completion association |
| Completion unknown after timeout | Unresolved; no speculative second effect | Timeout treated as proof of failure |
| Old execution resumes after safe recovery | No second commit and no result overwrite | Stale execution retains commit authority |
| Completed domain rejection repeated | Same portable error; financial state and history unchanged | Re-evaluate rejected instruction against new facts |
| Entity changes after original success, then original request is retried | Original historical result; current Entity remains at its later state | Replay overwrites current state or rechecks old preconditions |
| Returned replay value is modified, then requested again | Original retained result remains intact | Mutable result aliases retained record |
| Just before expiry, exactly at expiry, and after expiry | Replay before expiry; unavailable result or refused reuse at/after expiry; no new execution | Cache expiry re-enables financial effect |
| Replay after deployment upgrade or lost binding authority | Binding preserved, or execution refused if authority is lost | Upgrade or cache loss silently resets identity |
| Successful operation requiring Audit evidence is replayed | Same evidence references; no additional committed event | Retry appends another financial event |
| Access to a recorded result is denied | No disclosure or new financial effect; original outcome preserved | Key used as an authorization credential |

Sequential histories can be expressed as logical scenario data once a
specification defines the observation boundary. Controlled interleavings and
consumer-owned restart/failure tests provide additional evidence; finite
portable vectors cannot prove all production schedules or deployment failures.
An uncontrolled concurrency test that happened to pass is insufficient alone.

Repository checks validate syntax, identifiers, references, and traceability.
Consumers own scenario execution, synchronization, failure injection, result
comparison, and reporting. No repository financial implementation, Conformance
Runner, adapter API, transport envelope, or distributed test service is proposed.

## 7. Fit with the repository

The following are proposed destinations after acceptance. Paths shown in code
are planning suggestions and do not exist as a result of this draft.

| Layer | Proposed work |
| --- | --- |
| CoreDoc | Review whether scoped duplicate-effect protection needs an explicit foundation rule. Current CORE-002.3 excludes retry/network handling; it is not already a mandate for this profile. Preserve existing governance metadata and record any accepted normative evolution deliberately. |
| Specification | A cross-domain profile under `spec/idempotency/`, with applicability, request identity, instruction comparison, outcomes, retention, recovery, and failure semantics. Link owning-domain refinements explicitly. |
| Conformance | A manifest-discovered suite under `conformance/idempotency/`, derived from accepted requirements. Review the schema and format version before adding scenario/history data; do not present the current isolated-vector format as concurrent execution support. |
| Traceability | Assign each accepted requirement evidence and an honest coverage classification. Identify consumer-owned concurrency and recovery evidence that portable cases cannot establish. |
| Agentic Contract | Describe applicability, scope, retained-result meaning, pending/unresolved conditions, and retry limitations only after `/spec` defines them. Preserve existing canonical operation identities and effect dimensions. |
| Consumer guidance | Explain profile claims, deployment limits, retention, migration, and execution evidence in the existing implementation and conformance guides. |
| Maintenance tools | Validate any accepted new artifact structure and metadata; add meaningful negative tool tests without calculating domain outcomes or executing financial operations. |

The [manifest](../conformance/manifest.json) remains the sole vector discovery
entry point. An isolated case cannot depend on another vector having executed.
Core versions and artifact-format versions remain separate.

## 8. Compatibility and decisions needed before specification

Apply the [compatibility policy](../spec/conventions.md#compatibility-policy).
An optional profile is only additive if existing operations retain their
required inputs, outcomes, errors, failure atomicity, and omission semantics
when it is not selected. Calling it optional does not waive this review.

Do not add idempotency errors to old operations implicitly, rename their
identifiers, or introduce aliases to disguise incompatible behavior. Any
incompatible change requires the policy's explicit major-version and
operation-contract treatment rather than being bundled into a minor release.

Before writing normative clauses, decide:

1. Accept the cross-domain Core profile and its explicit claim/applicability
   mechanism, or choose an independently versioned extension.
2. Confirm the initial covered execution boundaries and define their authority
   for current state, instruction inputs, and the committed effect group.
3. Accept structural instruction comparison, retained terminal rejections,
   pending/unresolved distinctions, and refusal to reuse expired identities.
4. Define the exact portable input/result shapes, input limits, admission and
   validation order, error categories, and profile-versus-domain precedence.
5. Agree which sequential observations are portable and which concurrency,
   restart, and recovery obligations require additional consumer evidence.

After acceptance, follow CoreDoc review, specification and stable requirement
IDs, conformance and traceability, then Agentic metadata and synchronized
guidance. Search active inventories and Git history before assigning stable
IDs. This draft reserves none and changes no current coverage totals.

Run `npm ci --no-audit` and `npm run verify` for the accepted repository
changes. Dependency advisory review and the stable-publication gate remain
separate as described in [Developer Tools](tools/README.md). Remove this active
draft before stable publication; retain accepted rules and procedures in their
owning documents and only a concise release summary in the existing release
notes.

## 9. Research references

These projects illustrate design choices and limits; none is a normative
source for FinKore or an endorsed implementation dependency.

| Reference | Question it helps investigate |
| --- | --- |
| [java-payment-core](https://github.com/lmoraesdev/java-payment-core) and [discussion #29](https://github.com/willgittens/FinKore/discussions/29) | Original replay, conflicting-payload, and simultaneous-request scenarios. |
| [AWS Lambda Powertools](https://github.com/aws-powertools/powertools-lambda-python), [idempotency documentation](https://docs.aws.amazon.com/powertools/python/latest/utilities/idempotency/) | How do completion, in-progress execution, payload validation, and timeout handling differ? |
| [node-idempotency](https://github.com/mahendraHegde/node-idempotency) | How are fingerprints, incomplete requests, and recorded responses distinguished? |
| [IdempotentAPI](https://github.com/ikyriak/IdempotentAPI) | What does response replay establish, and what requires coordination across instances? |
| [River](https://github.com/riverqueue/river), [unique jobs](https://riverqueue.com/docs/unique-jobs) | Why does unique insertion still permit repeated execution? |
| [MassTransit](https://github.com/MassTransit/MassTransit), [outbox documentation](https://masstransit.massient.com/concepts/outbox) | Which effects participate in inbox/outbox consistency, and which remain external? |
| [Marten](https://github.com/JasperFx/marten), [optimistic concurrency](https://martendb.io/documents/concurrency.html) | How do separate requests detect obsolete versions of one subject? |
| [Redisson](https://github.com/redisson/redisson), [locks and fencing](https://redisson.pro/docs/data-and-services/locks-and-synchronizers/) | How can the protected resource reject a stale execution after lock authority changes? |
