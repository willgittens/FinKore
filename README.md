# FinFlow

> **CRUD is easy. Financial CRUD isn't.**

FinFlow is an open specification for building predictable, auditable, and portable financial domain logic.

It defines common financial primitives, behaviors, schemas, error codes, and conformance rules that can be implemented consistently across different programming languages and runtime environments.

FinFlow is not tied to TypeScript, Java, Node.js, React, Spring, or any specific framework.

The specification is the source of truth.

Language implementations follow it.

---

## What is FinFlow?

Most business applications start with CRUD.

Create a record.

Read it.

Update it.

Delete it.

Financial applications rarely stay that simple.

Soon, requirements start looking like this:

* Monetary values must use predictable decimal arithmetic.
* An approved expense cannot be edited.
* An invoice above a certain amount requires additional approval.
* Posted financial records cannot simply be deleted.
* Every relevant modification must be auditable.
* Status transitions must follow strict lifecycle rules.
* Sensitive information must be redacted from audit records.
* Corrections should preserve history instead of rewriting it.
* Different services must interpret financial events consistently.

These are not framework problems.

They are domain problems.

FinFlow exists to define these behaviors once.

---

# FinFlow is a Specification

The core of FinFlow is not a package.

It is a specification.

```text
                    FinFlow
                       │
          ┌────────────┴────────────┐
          │                         │
     Specification             Conformance
          │                         │
   Rules / Schemas             Test vectors
          │                         │
     ┌────┼─────┐                   │
     │    │     │                   │
     ▼    ▼     ▼                   │
   TS/JS Java  Future ◄─────────────┘
```

The specification defines:

* domain concepts;
* required behaviors;
* serialization formats;
* validation rules;
* error codes;
* lifecycle semantics;
* audit semantics;
* conformance expectations.

Each implementation can expose an API that feels natural in its language.

The behavior, however, must remain consistent.

---

# Example

The FinFlow specification may define a rule such as:

```text
Money.add

1. Both monetary values MUST use the same currency.
2. Arithmetic MUST use decimal-safe semantics.
3. The operation MUST NOT mutate either operand.
4. A currency mismatch MUST produce
   FINFLOW_MONEY_CURRENCY_MISMATCH.
```

A TypeScript implementation might expose:

```ts
const total = money('10.20', 'EUR')
  .add(money('5.30', 'EUR'))
```

A Java implementation might expose:

```java
Money total = Money.of("10.20", "EUR")
    .add(Money.of("5.30", "EUR"));
```

The syntax is different.

The behavior is the same.

That is FinFlow.

---

# Why a Specification?

Financial applications are frequently distributed across multiple technologies.

A single product may contain:

```text
React frontend
      ↓
Node.js API
      ↓
Java services
      ↓
Kafka
      ↓
Python reconciliation jobs
```

Without a shared domain definition, each service may implement concepts such as money, approvals, lifecycle transitions, or audit history differently.

FinFlow provides a shared contract.

```text
              FinFlow Spec
                   │
       ┌───────────┼───────────┐
       ▼           ▼           ▼
    Node.js       Java       Python
       │           │           │
       └───────────┼───────────┘
                   ▼
          Same domain behavior
```

---

# Core Principles

## The specification is the source of truth

No language implementation defines FinFlow by itself.

The specification does.

An implementation is conformant only when its behavior matches the published specification and conformance suite.

---

## Behavior over syntax

FinFlow does not require identical APIs across languages.

This would be:

```text
bad
```

```java
money.add(...)
```

forced everywhere simply because another implementation uses it.

Instead, implementations should feel natural to their ecosystems while preserving the same domain semantics.

---

## Explicit over magical

Financial rules should be visible and understandable.

A workflow such as:

```text
draft
  ↓
submitted
  ├── approved
  └── rejected
```

should be represented explicitly rather than hidden behind framework behavior.

---

## Auditability by design

Financial operations should be able to answer:

```text
What happened?
Who did it?
When?
Why?
What changed?
```

Auditability is treated as domain behavior, not application logging.

---

## Portable domain logic

A company's financial rules should not disappear because it migrated:

```text
Vue → React
Node → Java
Monolith → Services
```

Frameworks change.

Financial behavior should survive.

---

# Initial Specification Areas

The first FinFlow specifications focus on a small collection of reusable financial primitives.

---

# Money

Money is more than a floating-point number.

FinFlow defines behavior for:

* amount representation;
* currency;
* arithmetic;
* comparison;
* rounding;
* serialization;
* currency mismatch handling.

Example representation:

```json
{
  "amount": "1299.90",
  "currency": "EUR"
}
```

Amounts are represented as decimal values, never binary floating-point approximations.

A conformant implementation must ensure that:

```text
0.1 + 0.2
```

does not become a financial data problem.

---

# Financial Entities

FinFlow defines conventions for domain entities representing financial records.

Examples include:

```text
Invoice
Expense
Purchase Order
Payment
Reimbursement
Journal Entry
```

A financial entity can expose behaviors such as:

* lifecycle transitions;
* validation;
* audit events;
* immutability;
* approvals;
* corrections.

FinFlow does not prescribe database models or ORM structures.

It defines domain behavior.

---

# Workflows

Financial records frequently follow controlled lifecycle transitions.

Example:

```text
DRAFT
  ↓
SUBMITTED
  ├── APPROVED
  │      ↓
  │     PAID
  │
  └── REJECTED
```

A workflow specification defines allowed transitions.

For example:

```json
{
  "draft": ["submitted"],
  "submitted": ["approved", "rejected"],
  "approved": ["paid"],
  "rejected": [],
  "paid": []
}
```

Attempting:

```text
draft → paid
```

must result in a predictable error.

Example error code:

```text
FINFLOW_WORKFLOW_INVALID_TRANSITION
```

---

# Approval Chains

FinFlow defines a model for expressing approval requirements.

Example business rule:

```text
amount > 1,000
→ Manager approval

amount > 10,000
→ Finance approval

amount > 50,000
→ Controller approval
```

Implementations may expose this differently.

TypeScript:

```ts
approvalChain()
  .when(amount.gt('1000'))
  .require('manager')
```

Java:

```java
ApprovalChain.builder()
    .when(amountGreaterThan("1000"))
    .require("manager")
    .build();
```

Both must produce equivalent approval requirements.

---

# Audit Trail

FinFlow audit records are intended to describe meaningful domain activity.

Example:

```json
{
  "id": "evt_123",
  "entity": "invoice",
  "entityId": "INV-001",
  "event": "field_changed",
  "actor": {
    "id": "user-42"
  },
  "timestamp": "2026-08-31T14:00:00Z",
  "changes": [
    {
      "field": "amount",
      "from": {
        "amount": "1200.00",
        "currency": "EUR"
      },
      "to": {
        "amount": "1350.00",
        "currency": "EUR"
      }
    }
  ]
}
```

Audit histories should be append-only.

If a correction occurs, history should not be rewritten.

Instead:

```text
CREATE
↓
CHANGE
↓
APPROVE
↓
CORRECT
```

remains visible as a sequence of events.

History describes what happened.

It should not pretend something never happened.

---

# Sensitive Data

Auditability must not create unnecessary data exposure.

FinFlow defines redaction semantics for sensitive fields.

For example:

```text
DE89370400440532013000
```

could be represented in an audit event as:

```text
****3000
```

Implementations should provide mechanisms for controlling:

* tracked fields;
* ignored fields;
* redacted fields;
* custom serialization.

---

# Immutable Financial States

Some financial lifecycle states should prevent direct mutation.

For example:

```text
DRAFT
↓
APPROVED
↓
POSTED
```

Once posted, directly changing:

```text
amount = 1000
```

may no longer be valid.

Instead, the domain may require:

```text
Correction
Reversal
Void
Adjustment
```

FinFlow defines these concepts as lifecycle behavior rather than database restrictions.

---

# Corrections Instead of Deletion

Traditional CRUD assumes:

```text
DELETE
```

Financial systems often cannot.

Instead of deleting a financial record, an application may need to:

```text
void
reverse
correct
supersede
```

FinFlow aims to define reusable semantics for these operations.

---

# Standard Error Codes

Implementations may use language-specific exception types, but FinFlow defines portable error codes.

For example:

```text
FINFLOW_MONEY_CURRENCY_MISMATCH

FINFLOW_WORKFLOW_INVALID_TRANSITION

FINFLOW_ENTITY_IMMUTABLE

FINFLOW_APPROVAL_REQUIRED

FINFLOW_VALIDATION_FAILED
```

TypeScript may throw:

```ts
CurrencyMismatchError
```

Java may throw:

```java
CurrencyMismatchException
```

Both must expose:

```text
FINFLOW_MONEY_CURRENCY_MISMATCH
```

This allows domain behavior to remain predictable across systems.

---

# Shared Data Schemas

FinFlow defines portable data representations for concepts that may cross service boundaries.

For example:

```text
Money
AuditEvent
WorkflowEvent
ApprovalDecision
ValidationError
```

Schemas are intended to support communication between different FinFlow implementations.

Example:

```text
Node.js service
      ↓
   Kafka
      ↓
Java service
```

Both services should interpret the same financial event consistently.

---

# Conformance

A FinFlow implementation is expected to run against the FinFlow Conformance Suite.

Test cases are language-independent.

Example:

```json
{
  "suite": "money.add",
  "name": "adds values with the same currency",
  "left": {
    "amount": "10.20",
    "currency": "EUR"
  },
  "right": {
    "amount": "5.30",
    "currency": "EUR"
  },
  "expected": {
    "amount": "15.50",
    "currency": "EUR"
  }
}
```

Another test:

```json
{
  "suite": "money.add",
  "name": "rejects different currencies",
  "left": {
    "amount": "10.00",
    "currency": "EUR"
  },
  "right": {
    "amount": "10.00",
    "currency": "USD"
  },
  "error": "FINFLOW_MONEY_CURRENCY_MISMATCH"
}
```

Every conformant implementation should produce equivalent results.

---

# Repository Structure

The project is expected to evolve toward a structure similar to:

```text
finflow/
│
├── spec/
│   ├── money/
│   ├── workflow/
│   ├── approvals/
│   ├── audit/
│   └── entities/
│
├── schemas/
│   ├── money.schema.json
│   ├── audit-event.schema.json
│   └── approval.schema.json
│
├── conformance/
│   ├── money/
│   ├── workflow/
│   ├── approval/
│   └── audit/
│
├── implementations/
│   ├── typescript/
│   └── java/
│
├── examples/
│
└── README.md
```

---

# Implementations

## TypeScript / JavaScript

The first reference implementation will target TypeScript.

Potential packages:

```text
@finflow/core
@finflow/node
```

The core package should remain runtime-independent whenever possible.

It should be usable from environments such as:

```text
Browser
Node.js
Bun
Deno
Workers
```

Framework integrations may eventually be provided separately:

```text
@finflow/react
@finflow/vue
```

They are integrations.

They are not FinFlow itself.

---

## Java

A Java implementation may provide modules such as:

```text
finflow-core
finflow-spring
```

The API should follow Java conventions while remaining conformant with the FinFlow specification.

---

## Future Implementations

FinFlow is designed so that additional implementations can exist independently.

Potential ecosystems include:

```text
C#
Python
Go
Rust
PHP
```

A new implementation does not need to copy another implementation's internal architecture.

It only needs to implement the specification correctly.

---

# What FinFlow Is Not

FinFlow is not:

* an ERP;
* an accounting application;
* a payment processor;
* a database abstraction;
* an ORM;
* a UI framework;
* a React component library;
* a replacement for an accounting engine.

FinFlow provides financial domain primitives.

Applications decide how to compose them.

---

# What FinFlow May Become

The initial scope is intentionally small.

Future specifications may explore:

```text
Journal Entries
Debit / Credit
General Ledger
Reconciliation
Fiscal Periods
Cost Centers
Purchase Orders
Invoice Matching
Payments
Corrections
Reversals
Tax primitives
```

These should only be added when their semantics can be clearly defined and tested across implementations.

FinFlow should grow from real financial software problems, not from an attempt to model every accounting concept at once.

---

# Development Model

FinFlow follows a specification-first development model.

```text
Problem
   ↓
Specification
   ↓
Examples
   ↓
Conformance Tests
   ↓
Reference Implementation
   ↓
Other Implementations
```

A feature should not begin with:

```text
Let's add a class.
```

It should begin with:

```text
What behavior are we trying to standardize?
```

---

# Contributing

FinFlow is developed in the open.

Contributions may include:

* financial use cases;
* specification proposals;
* edge cases;
* conformance tests;
* schema improvements;
* implementation work;
* documentation;
* examples.

For major features, contributors are encouraged to start with the domain problem rather than implementation details.

A good issue might describe:

```text
Invoices that have been posted cannot be edited directly.

Different systems currently solve corrections differently.

Can FinFlow define a portable correction model?
```

That is more valuable than starting with:

```text
We should add a Correction class.
```

Behavior comes first.

API comes later.

---

# Project Philosophy

Software stacks change.

Frameworks change.

Architectures change.

Financial rules remain.

A company may migrate:

```text
Angular
   ↓
Vue
   ↓
React
```

or:

```text
PHP monolith
   ↓
Node.js
   ↓
Java services
```

The meaning of:

```text
Approved
Posted
Paid
Reversed
```

should not change because the technology did.

FinFlow attempts to separate those concepts from the frameworks used to implement them.

---

# Status

FinFlow is currently experimental.

The specification is under active development and is expected to evolve significantly before reaching version 1.0.

The first reference implementation will be built in TypeScript.

Production use is not recommended yet.

---

# License

MIT

---

**CRUD is easy. Financial CRUD isn't.**
