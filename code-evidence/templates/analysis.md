# Code Evidence analysis record template

This is a reusable format, not an analysis or a completed finding. When reading
begins, create `analyses/<repository-id>/<edition-id>.md` and record actual
observations using the sections below. Repeat function and finding sections as
needed. Do not retain instructions as if they were evidence, or invent a finding
to fill the format. Follow the [investigation workflow](../README.md#investigation-workflow).
Resolve links relative to the new record when copying this template.

## Reading context

| Field | What to record |
| --- | --- |
| Repository and edition | Existing `CE-REPO-*` and `CE-EDITION-*` IDs, repository name and selected version |
| Source commit | Full SHA and the corresponding repository tree link |
| Question and date | Financial question, reading date and person/agent responsible for the reading |
| Reading extent | Files, symbols, line ranges, tests and documentation actually inspected; inaccessible or uninspected sources |
| Reused work | Earlier record/finding references, why reuse applies, and what was read anew |
| Execution | Not performed, or a separate record of command, environment, inputs and actual observations |
| FinKore comparison | Not assessed, or the reviewed FinKore commit/version and exact artifacts consulted |

## Function inventory

List every function relevant to a recorded financial finding. Use exact original
names; a purpose written by the analyst belongs in the explanation. Identify
functions by repository edition, file, qualified symbol and signature so overloads
and repeated names remain distinct. Use a local section link to connect each row
to its detailed function record.

| Exact name | Qualified symbol and signature | Module or containing type | File and pinned line links | Role in the rule | Function record |
| --- | --- | --- | --- | --- | --- |

For anonymous functions, record that the source has no name and identify the
enclosing symbol and exact lines. For configuration, constraints or declarative
rules, record the actual construct and any inspected consuming function. Mark a
signature or consumer as unverified if it was not available in the inspected text.

## Function technical record

Repeat this section for each relevant function or source construct. Title the
copied section with its exact qualified symbol, or its source location if unnamed.

| Field | What to record |
| --- | --- |
| Identity | Exact name, qualified symbol, signature, source language and containing module/type |
| Definition and evidence | Commit-pinned file link, declaration lines and decisive body/branch ranges |
| Technical purpose | What the implementation does and its role in the financial rule |
| Inputs and preconditions | Parameters and context, units, currency, scale, accepted values, defaults and relevant constraints |
| Outputs and errors | Returned values and their meaning; upstream error names and the precise branches that produce them |
| State and effects | State read or changed, mutation order and behavior on each relevant failure path |
| Dependencies and policy | Relevant callees, configuration, host numeric behavior, external facts and their inspected source editions; uninspected behavior remains unknown |

Explain the algorithm as numbered steps in execution order, citing the decisive
code ranges. Cover guards before calculation, arithmetic or state transitions,
rounding/precision decisions, boundary branches and final effects. Explain why
these operations matter financially. Limit the explanation to what was inspected;
do not infer atomicity, determinism or a dependency's behavior from a function name.
Distinguish a source-based call-path explanation from observed runtime execution.

## Financial finding

Repeat this section for each distinct financial claim. Assign an unused stable
`CE-FINDING-*` ID after checking existing records. Keep the portable financial
claim separate from the implementation mechanism described above.

| Field | What to record |
| --- | --- |
| ID and question | Stable finding ID and the financial question it addresses |
| Observed rule | Behavior supported by inspected code, with its preconditions and financial consequence |
| Implementing functions | Local links to the technical function records and pinned links to the decisive branches |
| Mechanism | How the linked functions jointly implement the rule, including which one validates, calculates, changes state or raises an error |
| Interpretation and limits | Analyst reasoning, uncertainty, alternative policies, likely defects, shared ancestry, dependency limits and jurisdiction/configuration restrictions |
| Counterexamples | Inspected negative/boundary cases; distinguish source tests from analyst-proposed scenarios |
| Proposed relationship | Support, alternative policy, potential contradiction, new-rule candidate or open question; pending review and validation |
| Contract comparison | Exact reviewed requirements and an explanation under equivalent preconditions, or an explicit statement that no comparison has been made |
| Follow-up | Unread code/tests/dependencies, unresolved financial questions and evidence needed to review the claim |

Do not require an existing FinKore rule to record a useful finding. After reviewing
the relevant contract, if the behavior is undefined, record:
**This behavior is not currently defined by FinKore Core.** Preserve the financial
question without expanding the accepted specification scope. Upstream errors retain
their names; a proposed FinKore relationship does not make them portable errors.

## Test evidence

| Test name and qualified symbol | Pinned file and lines | Assertion actually read | Finding and function supported | Reading or execution status | Limits |
| --- | --- | --- | --- | --- | --- |

Record that no relevant tests were inspected when applicable. A test name alone
is not evidence of its assertions, and a source assertion is not a passed test.
Record execution only when actually performed, with its separate execution record.

## Reading history and review

Append dated updates describing sources newly read, reused observations, changed
interpretations and reasons for the change. Preserve earlier limits and rejected
interpretations. Record actual review status and open questions; source reading,
technical review, financial correctness, normative acceptance and editorial
publication remain separate decisions.
