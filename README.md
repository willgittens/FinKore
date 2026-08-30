# FinFlow

> **CRUD is easy. Financial CRUD isn't.**

FinFlow is an open-source TypeScript toolkit for building safer and more predictable financial workflows.

It provides reusable primitives for the parts that usually become messy in financial applications: money handling, state transitions, approval chains, validation, audit trails, and immutable business events.

Instead of rebuilding these rules in every invoice, expense, payment, procurement, or accounting module, FinFlow gives you a consistent foundation.

---

## Why FinFlow?

A basic CRUD application is simple.

Create a record.

Read it.

Update it.

Delete it.

Financial software rarely stays that simple.

Soon, the requirements start looking like this:

* An approved expense cannot be edited.
* An invoice above €10,000 requires Finance approval.
* A posted invoice cannot be deleted.
* Every important field change must be auditable.
* Monetary values must use predictable decimal arithmetic.
* Status transitions must follow strict business rules.
* Sensitive data should not appear in audit logs.
* Corrections should create new events instead of rewriting history.

At that point, CRUD becomes business infrastructure.

FinFlow exists to make that infrastructure reusable.

---

## Goals

FinFlow aims to provide small, composable building blocks for financial software.

The project focuses on:

* predictable financial domain logic;
* framework-independent APIs;
* auditability by default;
* explicit business rules;
* strong TypeScript support;
* portability between front-end and back-end environments;
* incremental adoption in both new and legacy applications.

FinFlow does **not** aim to become an ERP, accounting platform, or full application framework.

Use the pieces you need.

---

## Core Concepts

### Money

Avoid floating-point surprises and make currency explicit.

```ts
import { money } from '@finflow/core'

const subtotal = money('1299.90', 'EUR')
const tax = money('246.98', 'EUR')

const total = subtotal.add(tax)

console.log(total.toString())
// 1546.88 EUR
```

Operations involving incompatible currencies should fail explicitly.

```ts
money('10', 'EUR').add(
  money('10', 'USD')
)

// CurrencyMismatchError
```

---

### Financial Entities

Define domain entities with explicit financial behavior.

```ts
import {
  financialEntity,
  money,
  string
} from '@finflow/core'

const Invoice = financialEntity({
  name: 'invoice',

  fields: {
    vendor: string(),
    amount: money(),
  },

  audit: true,
})
```

```ts
const invoice = Invoice.create({
  vendor: 'ACME GmbH',
  amount: ['1200.00', 'EUR'],
})
```

---

### Workflows

Financial records usually have controlled lifecycle transitions.

```ts
const Expense = financialEntity({
  name: 'expense',

  workflow: {
    draft: ['submitted'],
    submitted: ['approved', 'rejected'],
    approved: ['paid'],
    rejected: [],
    paid: [],
  },
})
```

Valid:

```ts
expense.transition('submitted')
expense.transition('approved')
expense.transition('paid')
```

Invalid:

```ts
expense.transition('paid')

// InvalidTransitionError:
// draft -> paid is not allowed
```

Business rules remain explicit instead of being distributed across UI components and service methods.

---

### Approval Chains

Declare approval requirements as business rules.

```ts
import { approvalChain } from '@finflow/core'

const invoiceApproval = approvalChain()
  .when(({ amount }) => amount.greaterThan('1000'))
  .require('manager')
  .when(({ amount }) => amount.greaterThan('10000'))
  .require('finance')
  .when(({ amount }) => amount.greaterThan('50000'))
  .require('controller')
```

An application can then evaluate the required approvals without embedding a growing collection of conditional statements throughout the codebase.

---

### Audit Trail

FinFlow treats auditability as domain behavior, not application logging.

```ts
invoice.update({
  amount: ['1350.00', 'EUR']
}, {
  actor: 'user-42',
  reason: 'Vendor correction'
})
```

FinFlow can generate an append-only audit event:

```json
{
  "entity": "invoice",
  "entityId": "INV-001",
  "action": "updated",
  "actor": "user-42",
  "timestamp": "2026-08-31T10:41:00Z",
  "reason": "Vendor correction",
  "changes": {
    "amount": {
      "from": "1200.00 EUR",
      "to": "1350.00 EUR"
    }
  }
}
```

Business events such as lifecycle changes can also be recorded.

```ts
invoice.submit({
  actor: 'user-42'
})

invoice.approve({
  actor: 'finance-12'
})
```

Result:

```text
10:32 CREATED
10:41 AMOUNT_CHANGED
10:45 SUBMITTED
11:03 APPROVED
```

Audit records are intended to be append-only.

History should explain what happened, not rewrite what happened.

---

### Sensitive Fields

Audit data should not become a security problem.

```ts
const Vendor = financialEntity({
  name: 'vendor',

  audit: {
    track: [
      'name',
      'bankAccount',
      'paymentTerms'
    ],

    redact: [
      'bankAccount'
    ]
  }
})
```

Instead of storing:

```text
DE89370400440532013000
```

an audit adapter could persist:

```text
****3000 -> ****8121
```

---

### Immutable States

Certain financial states should restrict mutation.

```ts
const Invoice = financialEntity({
  name: 'invoice',

  workflow: {
    draft: ['submitted'],
    submitted: ['approved'],
    approved: ['posted'],
    posted: ['voided']
  },

  immutableWhen: ['posted']
})
```

```ts
invoice.update({
  amount: ['9999', 'EUR']
})

// ImmutableEntityError
```

Instead of deleting or silently modifying historical financial data, applications can model corrections explicitly.

```ts
invoice.void({
  reason: 'Incorrect supplier'
})
```

---

## Headless by Design

FinFlow is not tied to React, Vue, Angular, Node.js, or any particular persistence layer.

The core package contains domain logic only.

```text
@finflow/core
```

Framework integrations can live separately:

```text
@finflow/react
@finflow/vue
@finflow/node
```

Persistence should also be adapter-based.

```ts
createRepository({
  adapter: postgresAdapter(...)
})
```

or:

```ts
createRepository({
  adapter: indexedDbAdapter(...)
})
```

This allows financial domain rules to survive framework migrations and legacy modernization projects.

---

## Example

A simplified expense workflow could look like this:

```ts
import {
  financialEntity,
  money,
  string,
  approvalChain
} from '@finflow/core'

const Expense = financialEntity({
  name: 'expense',

  fields: {
    description: string(),
    amount: money(),
    costCenter: string(),
  },

  workflow: {
    draft: ['submitted'],
    submitted: ['approved', 'rejected'],
    approved: ['paid'],
    rejected: [],
    paid: [],
  },

  approvals: approvalChain()
    .when(({ amount }) => amount.greaterThan('1000'))
    .require('manager')
    .when(({ amount }) => amount.greaterThan('10000'))
    .require('finance'),

  immutableWhen: ['paid'],

  audit: true,
})
```

Now the application can focus on the product instead of repeatedly implementing financial infrastructure.

---

## Initial Scope

The first versions of FinFlow will focus on a small set of primitives:

* Money
* Financial entities
* Workflows
* Approval chains
* Validation
* Audit trails
* Immutable lifecycle states
* Persistence adapters

Future modules may explore concepts such as:

* journal entries;
* debit and credit primitives;
* reconciliation;
* fiscal periods;
* cost centers;
* general ledger accounts;
* invoice matching;
* purchase orders;
* payment workflows;
* financial corrections and reversals.

These features are intentionally outside the initial scope.

FinFlow should grow from real use cases, not from trying to model an entire accounting system on day one.

---

## Design Principles

### Explicit over magical

Financial rules should be readable.

```ts
submitted: ['approved', 'rejected']
```

is preferable to hidden behavior spread across several layers.

### Domain first

FinFlow models business concepts rather than UI components.

### Auditability by default

Important operations should be capable of explaining:

* what changed;
* who changed it;
* when it changed;
* why it changed.

### Framework independence

Financial rules should not disappear because a company migrated from Vue to React.

### Incremental adoption

Using FinFlow should not require rewriting an existing application.

A legacy system should be able to adopt one primitive at a time.

### Small core

FinFlow should remain a toolkit, not become another enterprise framework.

---

## Who Is FinFlow For?

FinFlow may be useful if you are building:

* Accounts Payable systems;
* Expense Management products;
* invoicing platforms;
* procurement software;
* payment workflows;
* accounting tools;
* fintech products;
* financial back-office applications;
* internal finance tooling;
* regulated business applications.

It may also be useful for teams modernizing legacy financial systems where business rules are currently distributed across controllers, components, database procedures, and conditional statements.

---

## Status

FinFlow is currently in early development.

The API is expected to change significantly while the core concepts are explored.

Do not use it for production financial systems yet.

---

## Contributing

FinFlow is being developed in the open.

Ideas, discussions, bug reports, experiments, and pull requests are welcome.

If you have worked on financial systems and have encountered recurring problems around approvals, auditability, lifecycle management, monetary values, or financial data integrity, those use cases are especially valuable.

Open an issue and describe the problem before proposing the abstraction.

Real financial problems should drive the library.

---

## Philosophy

Most financial applications eventually implement the same concepts.

Money.

Statuses.

Approvals.

Validation.

Audit history.

Permissions.

Corrections.

Immutability.

And many teams rebuild them from scratch.

FinFlow is an attempt to turn those recurring problems into reusable, understandable primitives.

**CRUD is easy. Financial CRUD isn't.**

---

## License

MIT
