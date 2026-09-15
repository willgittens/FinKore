// SPDX-License-Identifier: MPL-2.0
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import { createPythonConformanceAdapter } from '../adapter.js'

const pythonPath = '.tools/bin/python3.12'
const bridgePath = 'implementations/python/adapters/conformance/bridge.py'

test('discovers supported Python operations without claiming unsupported labels', () => {
  const adapter = createPythonConformanceAdapter({ pythonPath, bridgePath })
  assert.equal(adapter.supports('money.deserialize'), true)
  assert.equal(adapter.supports('finkore.money.add'), true)
  assert.equal(adapter.supports('finkore.ledger.post'), false)
})

test('executes a Money operation through the Python subprocess bridge', () => {
  const adapter = createPythonConformanceAdapter({ pythonPath, bridgePath })
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
  const directory = mkdtempSync(join(tmpdir(), 'finkore-python-bridge-'))
  const malformedBridge = join(directory, 'malformed.py')
  writeFileSync(malformedBridge, 'print("not json")\n')
  const adapter = createPythonConformanceAdapter({ pythonPath, bridgePath: malformedBridge })
  assert.throws(() => adapter.supports('money.deserialize'), /malformed JSON/)
})

test('turns bridge timeout into infrastructure failure', () => {
  const directory = mkdtempSync(join(tmpdir(), 'finkore-python-bridge-'))
  const slowBridge = join(directory, 'slow.py')
  writeFileSync(slowBridge, 'import time\ntime.sleep(2)\n')
  const adapter = createPythonConformanceAdapter({ pythonPath, bridgePath: slowBridge, timeoutMs: 50 })
  assert.throws(() => adapter.supports('money.deserialize'), /timed out|ETIMEDOUT/)
})
