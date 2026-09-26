// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from 'vitest'
import {
  FinKoreWorkflowError,
  InvalidWorkflowDefinitionError,
  InvalidWorkflowInstanceError,
  InvalidWorkflowStateError,
  InvalidWorkflowTransitionError,
  WorkflowGuardRejectedError,
  WorkflowStateConflictError,
  WorkflowTerminalStateError,
  WorkflowVersionMismatchError,
  isFinKoreWorkflowError,
  Workflow,
} from '../../src/index.js'

describe('Workflow errors', () => {
  const binding = { definitionIdentity: 'flow', definitionVersionIdentity: '1' }
  const definition = { ...binding, states: ['DRAFT', 'DONE'], initialState: 'DRAFT', terminalStates: ['DONE'], transitions: [{ source: 'DRAFT', target: 'DONE' }] }
  const mismatch = { currentState: 'DRAFT', binding: { ...binding, definitionVersionIdentity: '2' }, revision: 'r1' }

  it('valid instance mismatch control precedes State and conflict checks', () => {
    const input = { ...mismatch, currentState: 'GHOST' }
    expect(() => Workflow.import(definition, input)).toThrowError(expect.objectContaining({ code: 'FINKORE_WORKFLOW_VERSION_MISMATCH' }))
    expect(input).toEqual({ ...mismatch, currentState: 'GHOST' })
  })

  it('complete instance validation precedes version mismatch', () => {
    const faults = [{ revision: null }, { revision: '' }, { revision: [] }, { revision: {} }, { revision: 7 }, { revision: false },
      { currentState: null }, { currentState: [] }, { currentState: 7 }, { currentState: {} }, { currentStates: ['DRAFT'] }]
    for (const fault of faults) for (const versioned of [true, false]) {
      const input = { ...mismatch, ...fault }
      const before = structuredClone(input)
      const candidate: Record<string, unknown> = { ...definition }
      if (!versioned) { delete candidate.definitionIdentity; delete candidate.definitionVersionIdentity }
      for (const create of [Workflow.import, Workflow.from]) {
        expect(() => create(candidate, input)).toThrowError(expect.objectContaining({ code: 'FINKORE_WORKFLOW_INVALID_INSTANCE' }))
        expect(() => create({ ...candidate, initialState: 'GHOST' }, input)).toThrowError(expect.objectContaining({ code: 'FINKORE_WORKFLOW_INVALID_DEFINITION' }))
      }
      expect(input).toEqual(before)
    }
  })

  it('malformed revision precedes undeclared State with a matching binding', () => {
    expect(() => Workflow.import(definition, { currentState: 'GHOST', binding, revision: null }))
      .toThrowError(expect.objectContaining({ code: 'FINKORE_WORKFLOW_INVALID_INSTANCE' }))
    const instance = Workflow.import(definition, { currentState: 'DRAFT', binding, revision: 'r1' })
    const before = instance.toJSON()
    expect(() => instance.transition('DONE', { expectedRevision: null })).toThrowError(expect.objectContaining({ code: 'FINKORE_WORKFLOW_STATE_CONFLICT' }))
    expect(instance.toJSON()).toEqual(before)
  })

  it('explicit null guard equality preserves valid and rejected transitions', () => {
    const guarded = { ...definition, transitions: [{ source: 'DRAFT', target: 'DONE', guard: { fact: 'value', equals: null } }] }
    for (const facts of [{ value: null }, { value: {} }, {}]) {
      const instance = Workflow.create(guarded)
      const before = instance.toJSON()
      if ('value' in facts && facts.value === null) {
        expect(instance.transition('DONE', { facts }).currentState).toBe('DONE')
        expect(instance.versionBinding()).toEqual(binding)
      } else {
        expect(() => instance.transition('DONE', { facts })).toThrowError(expect.objectContaining({ code: 'FINKORE_WORKFLOW_GUARD_REJECTED' }))
        expect(instance.toJSON()).toEqual(before)
      }
    }
  })

  it('exposes every currently specified portable Workflow code', () => {
    expect(new InvalidWorkflowDefinitionError().code).toBe('FINKORE_WORKFLOW_INVALID_DEFINITION')
    expect(new InvalidWorkflowStateError().code).toBe('FINKORE_WORKFLOW_INVALID_STATE')
    expect(new InvalidWorkflowTransitionError().code).toBe('FINKORE_WORKFLOW_INVALID_TRANSITION')
    expect(new WorkflowGuardRejectedError().code).toBe('FINKORE_WORKFLOW_GUARD_REJECTED')
    expect(new WorkflowTerminalStateError().code).toBe('FINKORE_WORKFLOW_TERMINAL_STATE')
    expect(new InvalidWorkflowInstanceError().code).toBe('FINKORE_WORKFLOW_INVALID_INSTANCE')
    expect(new WorkflowVersionMismatchError().code).toBe('FINKORE_WORKFLOW_VERSION_MISMATCH')
    expect(new WorkflowStateConflictError().code).toBe('FINKORE_WORKFLOW_STATE_CONFLICT')
  })

  it('narrows FinKore Workflow errors without relying on messages', () => {
    expect(isFinKoreWorkflowError(new InvalidWorkflowTransitionError())).toBe(true)
    expect(isFinKoreWorkflowError(new FinKoreWorkflowError('FINKORE_WORKFLOW_INVALID_STATE', 'custom'))).toBe(true)
    expect(isFinKoreWorkflowError(new Error('Invalid Workflow transition'))).toBe(false)
  })
})
