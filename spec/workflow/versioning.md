# Workflow Definition Versioning

## Status

**FinKore Core 2.0 stable.**

## Purpose

This document defines stable Workflow Definition identities, version identities,
and the binding between versioned Workflow instances and the declared definition
version that governs their lifecycle behavior.

Versioning prevents an existing Workflow instance from silently changing behavior
when a newer Workflow definition is introduced. It does not define migration,
locking, persistence, or distributed concurrency.

## Terminology

**Workflow Definition Identity** identifies a logical Workflow definition family.

**Workflow Definition Version Identity** identifies one declared version of a
Workflow definition within a Workflow Definition Identity.

**Bound Workflow Definition Version** is the Workflow Definition Identity and
Workflow Definition Version Identity recorded for a versioned Workflow instance.

**Default Workflow Version Sequence** is FinKore's fallback ordering convention
for composing domains that do not define their own version ordering policy.

## Requirements

- **WORKFLOW-VERSION-001** - A versioned Workflow Definition MUST declare exactly one Workflow Definition Identity and exactly one Workflow Definition Version Identity.
- **WORKFLOW-VERSION-002** - Workflow Definition Identity and Workflow Definition Version Identity values MUST be stable opaque identifiers supplied by the caller or composing domain. A FinKore implementation MUST NOT derive their meaning from database counters, timestamps, storage row identifiers, state names, transition lists, deployment artifact names, Entity identity, or Entity Revision.
- **WORKFLOW-VERSION-003** - Within one Workflow Definition Identity, a Workflow Definition Version Identity MUST identify exactly one immutable declared definition version. The same version identity MUST NOT be reused for different declared state, transition, guard, or terminal-state semantics.
- **WORKFLOW-VERSION-004** - Workflow Definition Version Identity MUST remain distinct from Entity Revision, Entity identity, database row version, optimistic-lock token, storage counter, and storage timestamp unless a composing specification explicitly defines one value as immutably carrying both meanings.
- **WORKFLOW-VERSION-005** - Consumers MUST NOT infer recency, compatibility, migration authority, or transition behavior from the internal format of a Workflow Definition Identity or Workflow Definition Version Identity except where the Default Workflow Version Sequence is explicitly used.
- **WORKFLOW-VERSION-006** - When a composing domain uses the Default Workflow Version Sequence, version positions MUST be represented as positive base-10 integer strings beginning with `1` and increasing by one for each successor version within the same Workflow Definition Identity. This sequence MUST NOT be treated as a database counter, lock token, or migration instruction.
- **WORKFLOW-VERSION-007** - A versioned Workflow instance MUST record exactly one Bound Workflow Definition Version when the instance is created, imported, or otherwise observed as an existing instance.
- **WORKFLOW-VERSION-008** - A Workflow instance's Bound Workflow Definition Version MUST be immutable for that instance's lifecycle unless a future FinKore migration operation explicitly changes it. A Transition Request MUST NOT change the binding.
- **WORKFLOW-VERSION-009** - Transition validation for a versioned Workflow instance MUST use the states, transitions, guards, and terminal-state declarations of the instance's Bound Workflow Definition Version, not a newer or different version under the same Workflow Definition Identity.
- **WORKFLOW-VERSION-010** - If a versioned Workflow operation is supplied a Workflow Definition whose identity or version identity does not exactly match the instance's Bound Workflow Definition Version, the operation MUST fail with `FINKORE_WORKFLOW_VERSION_MISMATCH` and MUST leave the current State and binding unchanged.
- **WORKFLOW-VERSION-011** - An instance bound to an older Workflow Definition Version MUST remain governed by that older version while its current State belongs to that bound version, even when a newer version changes state declarations, transition declarations, guard declarations, or terminal-state declarations.
- **WORKFLOW-VERSION-012** - Version-mismatch diagnostics, when supplied, MUST be safe to disclose and MUST NOT expose unrelated guard facts, Actor data, or domain records. Diagnostics MAY include the expected and supplied Workflow Definition Identity or Workflow Definition Version Identity when disclosure is safe.

## Invariants

A versioned Workflow instance is governed by its Bound Workflow Definition
Version. Publishing or supplying a newer Workflow Definition Version must not
silently rebind existing instances.

The immutability in **WORKFLOW-VERSION-003** includes the retained definition's
nested guard values, states, transitions, and terminal declarations. Changing a
caller's original input or a returned observation must not change the semantics
used by an existing instance under **WORKFLOW-VERSION-009**. This is an
observable ownership guarantee, not a requirement to use a particular copying,
freezing, or storage architecture. Native public-API tests can verify this
boundary without a registry of separately published definitions.

Under **WORKFLOW-VERSION-006**, a default-sequence position is the version
identity selected under that convention. A fixture selector such as `DEFAULT`
is not itself a position. Without that convention, **WORKFLOW-VERSION-005**
continues to require opaque treatment of valid version identities. Validation
of one supplied position does not establish whether a successor was published
consecutively or authorize migration. Fixture encoding is documented in the
[conformance conventions](../../conformance/conventions.md).

## Examples

The binding itself, as well as the definition, is subject to
**WORKFLOW-VERSION-007** through **WORKFLOW-VERSION-011**. Changing a native
constructor's input binding or an exposed binding observation cannot change an
existing instance's governing version. Creation, import, successful transition,
and repeated observation must retain that same binding. Immutable values and
defensive copies are both valid implementations of this guarantee. Import
cannot reconstruct a missing historical binding from a newly supplied
definition; that is an invalid instance under **WORKFLOW-ERROR-005**.

Given Workflow Definition Identity `invoice-approval` with versions `1` and `2`,
an instance created under version `1` continues to validate Transition Requests
against version `1` until a future migration operation explicitly defines
otherwise. Supplying version `2` for that instance is a version mismatch, not an
implicit upgrade.

## Errors

Version mismatch failures use `FINKORE_WORKFLOW_VERSION_MISMATCH` as defined by
[Workflow Errors](errors.md).

## Non-Goals

This document does not define migration between Workflow Definition Versions,
mapping of states across versions, historical replay, optimistic locking,
pessimistic locking, database isolation, storage schemas, deployment rollout
policy, BPMN, or actor authorization.
