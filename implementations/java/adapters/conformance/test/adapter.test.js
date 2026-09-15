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

test('discovers Java Money operations without claiming non-Money labels', () => {
  const adapter = createJavaConformanceAdapter({ javaPath, classpath })
  assert.equal(adapter.supports('money.deserialize'), true)
  assert.equal(adapter.supports('finkore.money.add'), true)
  assert.equal(adapter.supports('finkore.workflow.transition'), false)
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

test('turns malformed bridge output into infrastructure failure', () => {
  const adapter = createJavaConformanceAdapter({ javaPath, classpath, bridgeMain: 'org.finkore.conformance.MalformedBridge', timeoutMs: 500 })
  assert.throws(() => adapter.supports('money.deserialize'), /malformed JSON/)
})

test('turns bridge timeout into infrastructure failure', () => {
  const adapter = createJavaConformanceAdapter({ javaPath, classpath, bridgeMain: 'org.finkore.conformance.SlowBridge', timeoutMs: 50 })
  assert.throws(() => adapter.supports('money.deserialize'), /timed out|ETIMEDOUT/)
})
