// SPDX-License-Identifier: MPL-2.0
import assert from 'node:assert/strict'
import { delimiter } from 'node:path'
import test from 'node:test'

import { createJavaConformanceAdapter } from '../adapter.js'

const javaPath = '.tools/bin/java'
const classpath = [
  'implementations/java/target/classes',
  'implementations/java/target/test-classes',
].join(delimiter)

test('discovers Java Money, Workflow, Audit, Approvals, and Entities operations', () => {
  const adapter = createJavaConformanceAdapter({ javaPath, classpath })
  assert.equal(adapter.supports('money.deserialize'), true)
  assert.equal(adapter.supports('finkore.money.add'), true)
  assert.equal(adapter.supports('finkore.workflow.transition'), true)
  assert.equal(adapter.supports('finkore.audit.append'), true)
  assert.equal(adapter.supports('audit.redact'), true)
  assert.equal(adapter.supports('approval.requirement.evaluate'), true)
  assert.equal(adapter.supports('approval.composition.evaluate'), true)
  assert.equal(adapter.supports('finkore.entity.create'), true)
  assert.equal(adapter.supports('entity.import'), true)
})

test('executes a Money operation through the Java subprocess bridge', () => {
  const adapter = createJavaConformanceAdapter({ javaPath, classpath })
  assert.deepEqual(adapter.execute({
    operationId: 'finkore.money.add',
    input: {
      left: { amount: '0.1', currency: 'EUR' },
      right: { amount: '0.2', currency: 'EUR' },
    },
  }), {
    status: 'success',
    value: { amount: '0.3', currency: 'EUR' },
    observations: {
      left: { amount: '0.1', currency: 'EUR' },
      right: { amount: '0.2', currency: 'EUR' },
    },
  })
})

test('executes an Audit append through the Java subprocess bridge', () => {
  const adapter = createJavaConformanceAdapter({ javaPath, classpath })
  assert.deepEqual(adapter.execute({
    operationId: 'finkore.audit.append',
    input: {
      history: [],
      event: {
        eventId: 'evt-1042',
        eventType: 'ENTITY_SUBMITTED',
        entity: { type: 'expense', id: 'exp-52' },
        occurredAt: '2026-09-01T12:00:00Z',
      },
    },
  }), {
    status: 'success',
    value: {
      history: [
        {
          eventId: 'evt-1042',
          eventType: 'ENTITY_SUBMITTED',
          entity: { type: 'expense', id: 'exp-52' },
          occurredAt: '2026-09-01T12:00:00Z',
        },
      ],
    },
  })
})

test('executes an Approval decision record through the Java subprocess bridge', () => {
  const adapter = createJavaConformanceAdapter({ javaPath, classpath })
  assert.deepEqual(adapter.execute({
    operationId: 'approval.decision.record',
    input: {
      requirement: {
        id: 'finance-review',
        subject: { type: 'invoice', id: 'inv-42' },
        eligibleActors: ['user-7'],
        approvedOutcome: 'APPROVED',
        rejectedOutcome: 'REJECTED',
      },
      history: [],
      decision: {
        requirementId: 'finance-review',
        subjectFacts: { revision: '3' },
        outcome: 'APPROVED',
        actor: { type: 'user', id: 'user-7' },
        decidedAt: '2026-09-01T12:00:00Z',
      },
    },
  }), {
    status: 'success',
    value: {
      history: [{
        requirementId: 'finance-review',
        subjectFacts: { revision: '3' },
        outcome: 'APPROVED',
        actor: { type: 'user', id: 'user-7' },
        decidedAt: '2026-09-01T12:00:00Z',
      }],
    },
  })
})

test('executes an Entity create through the Java subprocess bridge', () => {
  const adapter = createJavaConformanceAdapter({ javaPath, classpath })
  assert.deepEqual(adapter.execute({
    operationId: 'finkore.entity.create',
    input: {
      definition: {
        type: 'invoice',
        identityScope: 'tenant-a',
        workflow: {
          states: ['DRAFT', 'FINAL'],
          initialState: 'DRAFT',
          terminalStates: ['FINAL'],
          transitions: [{ source: 'DRAFT', target: 'FINAL' }],
        },
        mutability: { DRAFT: ['memo'], FINAL: ['deliveryStatus'] },
      },
      id: 'inv-42',
      data: { memo: 'initial' },
    },
  }), {
    status: 'success',
    value: {
      type: 'invoice',
      id: 'inv-42',
      state: 'DRAFT',
      data: { memo: 'initial' },
    },
  })
})

test('turns malformed bridge output into infrastructure failure', () => {
  const adapter = createJavaConformanceAdapter({ javaPath, classpath, bridgeMain: 'org.finkore.conformance.MalformedBridge', timeoutMs: 500 })
  assert.throws(() => adapter.supports('money.deserialize'), /malformed JSON/)
})

test('turns bridge timeout into infrastructure failure', () => {
  const adapter = createJavaConformanceAdapter({ javaPath, classpath, bridgeMain: 'org.finkore.conformance.SlowBridge', timeoutMs: 50 })
  assert.throws(() => adapter.supports('money.deserialize'), /timed out|ETIMEDOUT/)
})
