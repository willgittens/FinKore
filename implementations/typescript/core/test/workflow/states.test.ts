import { describe, expect, it } from 'vitest'
import { InvalidWorkflowDefinitionError, InvalidWorkflowStateError, Workflow } from '../../src/index.js'

const payableDefinition = {
  states: ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'],
  initialState: 'DRAFT',
  terminalStates: ['APPROVED', 'REJECTED'],
  transitions: [
    { source: 'DRAFT', target: 'SUBMITTED' },
    { source: 'SUBMITTED', target: 'APPROVED' },
    { source: 'SUBMITTED', target: 'REJECTED' },
  ],
}

describe('Workflow states', () => {
  it('creates a new instance in the one declared initial state', () => {
    const workflow = Workflow.create(payableDefinition)

    expect(workflow.currentState).toBe('DRAFT')
    expect(workflow.toJSON()).toEqual({ currentState: 'DRAFT' })
  })

  it('rejects duplicate state identifiers', () => {
    expect(() =>
      Workflow.create({
        states: ['DRAFT', 'DRAFT', 'SUBMITTED'],
        initialState: 'DRAFT',
        terminalStates: ['SUBMITTED'],
        transitions: [{ source: 'DRAFT', target: 'SUBMITTED' }],
      }),
    ).toThrow(InvalidWorkflowDefinitionError)

    expect(() =>
      Workflow.create({
        states: ['DRAFT', 'SUBMITTED', 'APPROVED'],
        initialState: 'DRAFT',
        terminalStates: ['APPROVED', 'APPROVED'],
        transitions: [{ source: 'DRAFT', target: 'SUBMITTED' }],
      }),
    ).toThrow(InvalidWorkflowDefinitionError)
  })

  it('rejects non-object workflow definitions', () => {
    expect(() => Workflow.create(null)).toThrow(InvalidWorkflowDefinitionError)
    expect(() => Workflow.create('DRAFT')).toThrow(InvalidWorkflowDefinitionError)
  })

  it('rejects malformed state lists and empty state identifiers', () => {
    expect(() =>
      Workflow.create({
        states: 'DRAFT',
        initialState: 'DRAFT',
        terminalStates: ['SUBMITTED'],
        transitions: [],
      }),
    ).toThrow(InvalidWorkflowDefinitionError)

    expect(() =>
      Workflow.create({
        states: ['DRAFT', ''],
        initialState: 'DRAFT',
        terminalStates: [''],
        transitions: [],
      }),
    ).toThrow(InvalidWorkflowDefinitionError)
  })

  it('rejects missing, multiple, or undeclared initial states', () => {
    expect(() =>
      Workflow.create({
        states: ['DRAFT', 'SUBMITTED'],
        terminalStates: ['SUBMITTED'],
        transitions: [{ source: 'DRAFT', target: 'SUBMITTED' }],
      }),
    ).toThrow(InvalidWorkflowDefinitionError)

    expect(() =>
      Workflow.create({
        states: ['DRAFT', 'SUBMITTED'],
        initialState: 'DRAFT',
        initialStates: ['DRAFT', 'SUBMITTED'],
        terminalStates: ['SUBMITTED'],
        transitions: [{ source: 'DRAFT', target: 'SUBMITTED' }],
      }),
    ).toThrow(InvalidWorkflowDefinitionError)

    expect(() =>
      Workflow.create({
        states: ['DRAFT', 'SUBMITTED'],
        initialState: 'APPROVED',
        terminalStates: ['SUBMITTED'],
        transitions: [{ source: 'DRAFT', target: 'SUBMITTED' }],
      }),
    ).toThrow(InvalidWorkflowDefinitionError)
  })

  it('imports only one declared current state without normalizing identity', () => {
    expect(Workflow.from(payableDefinition, { currentState: 'SUBMITTED' }).currentState).toBe('SUBMITTED')

    expect(() => Workflow.from(payableDefinition, { currentState: 'submitted' })).toThrow(InvalidWorkflowStateError)
    expect(() => Workflow.from(payableDefinition, {})).toThrow(InvalidWorkflowStateError)
    expect(() => Workflow.from(payableDefinition, null)).toThrow(InvalidWorkflowStateError)
    expect(() => Workflow.from(payableDefinition, 7)).toThrow(InvalidWorkflowStateError)
    expect(() => Workflow.from(payableDefinition, { currentState: '' })).toThrow(InvalidWorkflowStateError)
  })
})
