# Entity Import

## Status

**Draft**

## Purpose

This document defines the portable Entity import boundary for observing an
existing Financial Entity, preserving supplied business revision history, and
recording explicit source identity mapping when import or migration uses an
external identity. It does not define a master-data registry, persistence,
deduplication, authorization, or concrete financial document formats.

## Terminology

**Entity Import** is the operation that accepts a supplied existing Entity
observation and returns a validated import observation.

**Source Identity** is an opaque identifier supplied by an external or legacy
system. It does not replace stable FinKore Entity identity.

**Entity Identity Mapping** is explicit evidence that relates a Source Identity
to the stable FinKore Entity identity preserved by import.

**Expected Entity State**, **Expected Entity Revision**, and **Expected Entity
Conflict Version** are optional caller-supplied preconditions checked against
the imported observation.

## Requirements

- **ENTITY-IMPORT-001** - Entity Import MUST preserve the supplied stable FinKore Entity identity. It MUST NOT generate a replacement identity or substitute a Source Identity for stable Entity identity.
- **ENTITY-IMPORT-002** - Entity Import MUST validate the supplied Entity observation using the Entity identity, lifecycle, mutability, validation, and referenced Workflow requirements.
- **ENTITY-IMPORT-003** - When Entity Import supplies Source Identity, it MUST also supply explicit Entity Identity Mapping evidence that identifies the source system, source identity, mapped Entity type, mapped Entity identity, and mapping identity.
- **ENTITY-IMPORT-004** - Entity Identity Mapping evidence MUST be preserved as opaque caller-supplied values. An implementation MUST NOT parse source-system formats, infer tenancy, deduplicate entities, or look up a global registry from mapping content.
- **ENTITY-IMPORT-005** - Entity Identity Mapping MUST map to the same stable Entity type and Entity identity as the imported Entity observation.
- **ENTITY-IMPORT-006** - Entity Import MUST preserve supplied Current Entity Revision, Historical Entity Revisions, and Entity Conflict Version as distinct opaque values.
- **ENTITY-IMPORT-007** - Entity Import with an Expected Entity State, Expected Entity Revision, or Expected Entity Conflict Version that does not match the supplied observation MUST fail with `FINKORE_ENTITY_STATE_CONFLICT`.
- **ENTITY-IMPORT-008** - A failed Entity Import MUST NOT return a partially imported Entity, Revision, Mapping, or Conflict Version observation and MUST NOT change any existing Entity observation.
- **ENTITY-IMPORT-009** - Missing, malformed, conflicting, or incomplete identity, mapping, or revision input MUST fail with `FINKORE_ENTITY_INVALID_IDENTITY` unless a more specific primary domain error applies.
- **ENTITY-IMPORT-010** - Entity Import diagnostics, when supplied, MUST remain safe diagnostic context and MUST NOT expose sensitive source identity values, financial values, or implementation storage identifiers by default.

## Invariants

Import observes existing Entity continuity. It preserves the stable FinKore
Entity identity or records explicit continuity mapping; it does not create a
global identity registry or select an Entity by searching external systems.

## Non-Goals

This document does not define concrete invoice migration, database uniqueness,
merge/deduplication, source-system authentication, Workflow definition
migration, state mapping across Workflow definitions, or external-system data
retention policy.
