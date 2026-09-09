// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from 'vitest'
import { createAdapterRegistry } from '../src/adapter/registry.js'

describe('adapter registry helper', () => {
  it('dispatches registered canonical operations', async () => {
    const adapter = createAdapterRegistry({
      'finkore.money.add': ({ input }) => ({ status: 'success', value: input }),
    })
    expect(adapter.supports('finkore.money.add')).toBe(true)
    expect(adapter.supports('finkore.money.round')).toBe(false)
    await expect(Promise.resolve(adapter.execute({ operationId: 'finkore.money.add', input: 3 }))).resolves.toEqual({ status: 'success', value: 3 })
    expect(() => adapter.execute({ operationId: 'finkore.money.round', input: 3 })).toThrow('No adapter handler')
  })
})
