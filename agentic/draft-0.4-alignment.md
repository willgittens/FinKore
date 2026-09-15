# Draft 0.4 Agentic Alignment Record

## Status

Accepted for FinKore Core Draft 0.4 on 2026-09-15.

This record closes TASK-199. It verifies that the Agentic Contract remains a
language-neutral view of the stabilized Draft 0.4 specification baseline. It
does not add executable agent integrations, transport bindings, financial
behavior, operation identifiers, portable errors, or conformance vectors.

## Reviewed Artifacts

- `agentic/README.md`
- `agentic/conventions.md`
- `agentic/capabilities.md`
- `agentic/discovery.md`
- `agentic/effects.md`
- `agentic/errors.md`
- `agentic/safety.md`
- `agentic/examples.md`
- `agentic/operations.md`
- `spec/draft-0.4-stabilization.md`
- `spec/draft-0.4-portability-contract.md`
- `conformance/draft-0.4-audit.md`
- `conformance/conventions.md`
- `conformance/manifest.json`
- `conformance/traceability.md`

## Finding Summary

| Finding ID | Area | Classification | Resolution |
| --- | --- | --- | --- |
| `D04-AGENTIC-199-001` | Operation registry | ACCEPTED | The registry contains 20 canonical `finkore.*` operations, all present in manifest-listed vectors and conformance metadata. |
| `D04-AGENTIC-199-002` | Conformance-local boundaries | ACCEPTED | Fifteen manifest-listed labels remain conformance-local and are not promoted to Agentic operations. |
| `D04-AGENTIC-199-003` | Effects and safety | ACCEPTED | Effects, mutation, audit, approval, determinism, irreversibility, and idempotency statements remain bounded to specification evidence and do not create an AI-specific bypass. |
| `D04-AGENTIC-199-004` | Version terminology | ACCEPTED | Agentic operation IDs do not encode Draft 0.4, conformance format, or package versions; the wording follows the Draft 0.4 authority/version taxonomy. |
| `D04-AGENTIC-199-005` | Errors and diagnostics | ACCEPTED | Agentic error guidance uses portable codes and keeps exception classes, messages, transports, retry systems, and stack traces non-portable. |

No external review is claimed.

## Operation Alignment

The Agentic registry has 20 canonical operation identifiers:

| Domain | Canonical operations | Alignment result |
| --- | --- | --- |
| Money | `finkore.money.add`, `finkore.money.subtract`, `finkore.money.negate`, `finkore.money.multiply`, `finkore.money.divide`, `finkore.money.compare`, `finkore.money.round`, `finkore.money.applyrate`, `finkore.money.allocate` | Aligned with Money specification requirements, conformance vectors, non-mutating value semantics, exact decimal behavior, portable error summaries, and explicit rounding/allocation boundaries. |
| Workflow | `finkore.workflow.transition` | Aligned with Workflow transition, guard, terminal-state, version-binding, import-observation, and expected-state/revision conflict requirements. `workflow.create` and `workflow.import` remain conformance-local. |
| Audit | `finkore.audit.append`, `finkore.audit.replace`, `finkore.audit.remove` | Aligned with logical history, append-only, event, actor, change, redaction, relationship, and portable Audit error requirements. |
| Entities | `finkore.entity.create`, `finkore.entity.mutate`, `finkore.entity.transition`, `finkore.entity.evolution.correct`, `finkore.entity.evolution.reverse`, `finkore.entity.evolution.void`, `finkore.entity.evolution.supersede` | Aligned with Entity identity, lifecycle, mutability, validation, evolution, revision, import-boundary, Audit evidence, and portable Entity error requirements. `entity.import` remains conformance-local. |

No canonical Approval operation is promoted in Draft 0.4. Approval lifecycle,
chain, condition, and composition labels remain conformance-local pending a
stable public agent-facing input model, diagnostics policy, and security review.

## Descriptor Review

| Dimension | Result |
| --- | --- |
| Operation IDs | Stable `finkore.<domain>.<operation>` identifiers remain language-independent and are not tied to TypeScript methods, Java classes, Python modules, routes, tools, or package names. |
| Requirements | Operation descriptors cite stable requirement IDs and do not replace `/spec` as the source of normative behavior. |
| Inputs and outputs | Descriptors describe language-neutral input/output semantics. They reuse normative Money serialization where it exists and avoid turning normalized conformance envelopes into production APIs. |
| Effects | State-changing, financial-state, audit, approval, determinism, irreversibility, and idempotency statements remain bounded to `agentic/effects.md` and the operation registry. |
| Preconditions and postconditions | Version binding, expected-state/revision checks, terminal-state rejection, failure atomicity, append-only preservation, and Entity/Audit evidence requirements remain aligned with `/spec`. |
| Errors | Portable error guidance remains code-centered. Operation error lists are non-exhaustive unless a domain error priority rule says otherwise. |
| Safety | `agentic/safety.md` preserves the rule that agents have no bypass around approvals, immutability, audit history, portable errors, or failure atomicity. |
| Discovery and capabilities | Discovery remains documentation-first. Capability advertisement does not prove conformance, and conformance-local labels are not advertised as Agentic capabilities. |

## Conformance-Local Labels

The following 15 manifest-listed operation labels remain conformance-local:

```text
approval.chain.evaluate
approval.composition.evaluate
approval.condition.evaluate
approval.decision.evaluate
approval.decision.record
approval.decision.supersede
approval.decision.withdraw
approval.requirement.evaluate
approval.requirement.supersede
audit.redact
entity.import
money.deserialize
money.serialize
workflow.create
workflow.import
```

Their presence in vectors makes their observable behavior testable. It does not
make them public Agentic capabilities or production API requirements.

## Gate

TASK-199 is accepted.

- No AI-specific bypass exists.
- No new financial behavior was added.
- No conformance-local operation label was prematurely promoted.
- Descriptor version terminology follows the Draft 0.4 authority/version model.
- Agentic metadata remains a faithful, language-neutral view of accepted
  specification behavior.
