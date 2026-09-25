// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from 'vitest'
import { FinancialEntity } from '../../src/index.js'

const binding = { definitionIdentity: 'invoice-flow', definitionVersionIdentity: '1' }
const data = { amount: { amount: '1.239', currency: 'EUR' } }
function definition(versioned = false) {
  return {
    type: 'invoice', identityScope: 'tenant',
    workflow: { ...(versioned ? binding : {}), states: ['DRAFT', 'REVIEW', 'DONE'], initialState: 'DRAFT', terminalStates: ['DONE'],
      transitions: [{ source: 'DRAFT', target: 'REVIEW' }, { source: 'REVIEW', target: 'DONE' }] },
    mutability: { DRAFT: ['amount'], REVIEW: ['amount'], DONE: [] as string[] },
    validation: [{ id: 'POSITIVE', rule: 'positive-money', path: 'amount' }],
  }
}
function attemptMutation(action: () => void): void {
  try { action() } catch (error) { if (!(error instanceof TypeError)) throw error }
}
const portableError = (code: string) => expect.objectContaining({ code })

describe('Entity result reuse and retained declarations', () => {
  // ENTITY-LIFECYCLE-001/003, ENTITY-IMPORT-002 and WORKFLOW-VERSION-007/008.
  for (const versioned of [false, true]) it(`${versioned ? 'versioned' : 'unversioned control'} create → transition → observe/import → transition`, () => {
    const declarations = definition(versioned)
    const first = FinancialEntity.create(declarations, 'invoice-1', data)
    const before = first.toJSON()
    try {
      const second = first.transition('REVIEW')
      const reconstructed = FinancialEntity.from(declarations, second.toJSON())
      const imported = FinancialEntity.import(declarations, { entity: reconstructed.toJSON() })
      const last = FinancialEntity.from(declarations, imported.entity).transition('DONE')
      expect(last.toJSON()).toEqual({ type: 'invoice', id: 'invoice-1', state: 'DONE', data, ...(versioned ? { binding } : {}) })
      const exposed = last.toJSON()
      ;(exposed.data as typeof data).amount.amount = '999'
      expect(last.toJSON().data).toEqual(data)
    } finally {
      expect(first.toJSON()).toEqual(before)
    }
  })

  // ENTITY-DEFINITION-002: native references are not expressible as isolated JSON.
  for (const boundary of ['create', 'from'] as const) for (const location of ['input', 'observation'] as const) {
    it(`${boundary}: rejects an undeclared transition after changing ${location} transitions`, () => {
      const declarations = definition()
      const entity = boundary === 'create' ? FinancialEntity.create(declarations, 'invoice-1', data)
        : FinancialEntity.from(declarations, FinancialEntity.create(declarations, 'invoice-1', data).toJSON())
      const before = entity.toJSON()
      expect(() => entity.transition('DONE')).toThrowError(portableError('FINKORE_WORKFLOW_INVALID_TRANSITION'))
      const retained = location === 'input' ? declarations : entity.definition as unknown as ReturnType<typeof definition>
      attemptMutation(() => retained.workflow.transitions.push({ source: 'DRAFT', target: 'DONE' }))
      try {
        expect(() => entity.transition('DONE')).toThrowError(portableError('FINKORE_WORKFLOW_INVALID_TRANSITION'))
        expect(entity.transition('REVIEW').state).toBe('REVIEW')
      } finally { expect(entity.toJSON()).toEqual(before) }
    })

    it(`${boundary}: preserves accepted transition after changing ${location} state and terminal lists`, () => {
      const declarations = definition()
      const entity = boundary === 'create' ? FinancialEntity.create(declarations, 'invoice-1', data)
        : FinancialEntity.from(declarations, FinancialEntity.create(declarations, 'invoice-1', data).toJSON())
      const retained = location === 'input' ? declarations : entity.definition as unknown as ReturnType<typeof definition>
      attemptMutation(() => retained.workflow.states.splice(0))
      attemptMutation(() => retained.workflow.terminalStates.push('DRAFT'))
      expect(entity.transition('REVIEW').toJSON()).toEqual({ type: 'invoice', id: 'invoice-1', state: 'REVIEW', data })
    })

    it(`${boundary}: preserves permitted mutations after changing ${location} mutability`, () => {
      const declarations = definition()
      const entity = boundary === 'create' ? FinancialEntity.create(declarations, 'invoice-1', data)
        : FinancialEntity.from(declarations, FinancialEntity.create(declarations, 'invoice-1', data).toJSON())
      const before = entity.toJSON()
      const retained = location === 'input' ? declarations : entity.definition as unknown as ReturnType<typeof definition>
      attemptMutation(() => retained.mutability.DRAFT.splice(0))
      expect(entity.mutate({ amount: { amount: '2', currency: 'EUR' } }).toJSON().data).toEqual({ amount: { amount: '2', currency: 'EUR' } })
      expect(entity.toJSON()).toEqual(before)
    })

    it(`${boundary}: preserves rejected data after changing ${location} validators`, () => {
      const declarations = definition()
      const entity = boundary === 'create' ? FinancialEntity.create(declarations, 'invoice-1', data)
        : FinancialEntity.from(declarations, FinancialEntity.create(declarations, 'invoice-1', data).toJSON())
      const before = entity.toJSON()
      const retained = location === 'input' ? declarations : entity.definition as unknown as ReturnType<typeof definition>
      attemptMutation(() => retained.validation.splice(0))
      try {
        expect(() => entity.mutate({ amount: { amount: '-1', currency: 'EUR' } })).toThrowError(portableError('FINKORE_ENTITY_VALIDATION_FAILED'))
      } finally { expect(entity.toJSON()).toEqual(before) }
    })

    it(`${boundary}: preserves nested guards from ${location} mutation`, () => {
      const declarations = definition()
      const guarded = { ...declarations, workflow: { ...declarations.workflow, transitions: [{ source: 'DRAFT', target: 'REVIEW',
        guard: { fact: 'approved', equals: { checks: [{ ok: true }] } } }] } }
      const entity = boundary === 'create' ? FinancialEntity.create(guarded, 'invoice-1', data)
        : FinancialEntity.from(guarded, FinancialEntity.create(guarded, 'invoice-1', data).toJSON())
      const original = structuredClone(entity.definition)
      const retained = location === 'input' ? guarded : entity.definition as unknown as typeof guarded
      attemptMutation(() => { retained.workflow.transitions[0]!.guard.equals.checks[0]!.ok = false })
      expect(entity.definition).toEqual(original)
      expect(() => entity.transition('REVIEW')).toThrowError(portableError('FINKORE_WORKFLOW_GUARD_REJECTED'))
    })
  }

  it('new independently declared Entity control uses its own transitions', () => {
    const initial = definition()
    const first = FinancialEntity.create(initial, 'invoice-1', data)
    const revised = definition()
    revised.workflow.transitions.push({ source: 'DRAFT', target: 'DONE' })
    const second = FinancialEntity.create(revised, 'invoice-2', data)
    expect(second.transition('DONE').state).toBe('DONE')
    expect(() => first.transition('DONE')).toThrowError(portableError('FINKORE_WORKFLOW_INVALID_TRANSITION'))
  })
})

it('retains an owned version binding through mutation, import and subsequent transitions', () => {
  const declarations = definition(true)
  const original = FinancialEntity.create(declarations, 'invoice-1', data)
  const before = original.toJSON()
  const changed = original.mutate({ amount: { amount: '2', currency: 'EUR' } })
  const observed = changed.toJSON()
  const imported = FinancialEntity.import(declarations, { entity: observed })
  expect(FinancialEntity.from(declarations, imported.entity).transition('REVIEW').toJSON().binding).toStrictEqual(binding)
  ;(observed.binding as { definitionVersionIdentity: string }).definitionVersionIdentity = '2'
  expect(changed.toJSON().binding).toStrictEqual(binding)
  expect(imported.entity.binding).toStrictEqual(binding)
  expect(original.toJSON()).toStrictEqual(before)
  for (const bad of [undefined, null, {}, { ...binding, definitionVersionIdentity: '2' }]) {
    const candidate = { ...changed.toJSON(), binding: bad }
    const snapshot = structuredClone(candidate)
    const code = bad && 'definitionVersionIdentity' in bad ? 'FINKORE_WORKFLOW_VERSION_MISMATCH' : 'FINKORE_WORKFLOW_INVALID_INSTANCE'
    expect(() => FinancialEntity.from(declarations, candidate)).toThrowError(portableError(code))
    expect(candidate).toStrictEqual(snapshot)
  }
})
