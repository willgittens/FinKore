# Workflow Import

## Status

**FinKore Core 2.0.2 stable.**

## Purpose

This document defines how FinKore observes an existing Workflow instance with a
declared current State and, for versioned instances, a declared
[Bound Workflow Definition Version](versioning.md).

Import is an observation of existing lifecycle state. It is not a transition,
migration, replay, persistence load contract, or authorization check.

## Terminology

**Workflow Import** is the operation that accepts a supplied existing Workflow
instance observation and validates it against a supplied Workflow definition.

**Imported Current State** is the caller-supplied current State for the imported
instance.

**Imported Workflow Instance Revision** is an optional caller-supplied opaque
revision of the Workflow instance observation. It supports transition
preconditions defined by [Workflow Conflicts](conflicts.md), but FinKore does
not define how it is generated.

## Requirements

- **WORKFLOW-IMPORT-001** - Workflow Import MUST use the caller-supplied Imported Current State. It MUST NOT infer the current State from the definition's initial State, declaration order, terminal States, transition history, or implementation defaults.
- **WORKFLOW-IMPORT-002** - Workflow Import MUST validate that the Imported Current State is declared by the supplied Workflow definition or by the supplied Workflow Definition Version for a versioned instance.
- **WORKFLOW-IMPORT-003** - Workflow Import of a versioned instance MUST include exactly one Bound Workflow Definition Version and MUST validate that it exactly matches the supplied Workflow Definition Identity and Workflow Definition Version Identity.
- **WORKFLOW-IMPORT-004** - Workflow Import MUST preserve the supplied Bound Workflow Definition Version and any supplied Imported Workflow Instance Revision as opaque values. It MUST NOT normalize, generate, derive, increment, or reinterpret either value from storage counters, Entity Revision, timestamps, transition counts, or current State.
- **WORKFLOW-IMPORT-005** - A successful Workflow Import MUST return an observation with the supplied current State, Bound Workflow Definition Version when versioned, and Imported Workflow Instance Revision when supplied. It MUST NOT perform a Transition Request, evaluate Transition Guards, create Audit evidence, or claim that a State change occurred.
- **WORKFLOW-IMPORT-006** - A failed Workflow Import MUST NOT return a partially imported instance and MUST NOT change any existing Workflow instance observation.

## Invariants

Imported instances are observed in their supplied current State. A versioned
imported instance is governed by the supplied Bound Workflow Definition Version
after validation succeeds.

## Errors

Malformed instance observations use `FINKORE_WORKFLOW_INVALID_INSTANCE`.
Undeclared current States use `FINKORE_WORKFLOW_INVALID_STATE`. Binding
mismatches use `FINKORE_WORKFLOW_VERSION_MISMATCH`. Error precedence is defined
by [Workflow Errors](errors.md).

## Non-Goals

This document does not define migration between Workflow Definition Versions,
state mapping, event replay, Audit provenance, persistence, storage schemas,
database locking, distributed concurrency, or actor authorization.

