import { describe, expect, it } from 'vitest'
import {
  InvalidWorkflowDefinitionError,
  InvalidWorkflowTransitionError,
  Workflow,
  WorkflowTerminalStateError,
} from '../../src/index.js'

const terminalDefinition = {
  states: ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PARKED'],
  initialState: 'DRAFT',
  terminalStates: ['APPROVED', 'REJECTED'],
  transitions: [
    { source: 'DRAFT', target: 'SUBMITTED' },
    {
      source: 'SUBMITTED',
      target: 'APPROVED',
      guard: { fact: 'approvalsSatisfied', equals: true },
    },
    { source: 'SUBMITTED', target: 'REJECTED' },
  ],
}

describe('Workflow terminal states', () => {
  it('detects terminal status only from the explicit definition', () => {
    const workflow = Workflow.create(terminalDefinition)

    expect(workflow.definition.isTerminalState('APPROVED')).toBe(true)
    expect(workflow.definition.isTerminalState('REJECTED')).toBe(true)
    expect(workflow.definition.isTerminalState('DRAFT')).toBe(false)
    expect(workflow.definition.isTerminalState('PARKED')).toBe(false)
  })

  it('does not infer terminal status from a state name or missing outgoing transitions', () => {
    const workflow = Workflow.from(
      {
        states: ['DRAFT', 'COMPLETE'],
        initialState: 'DRAFT',
        terminalStates: [],
        transitions: [],
      },
      { currentState: 'COMPLETE' },
    )

    expect(workflow.definition.isTerminalState('COMPLETE')).toBe(false)
    expect(() => workflow.transition('DRAFT')).toThrow(InvalidWorkflowTransitionError)
    expect(workflow.currentState).toBe('COMPLETE')
  })

  it('allows a declared transition into a terminal state', () => {
    const workflow = Workflow.from(terminalDefinition, { currentState: 'SUBMITTED' })

    workflow.transition('APPROVED', { facts: { approvalsSatisfied: true } })

    expect(workflow.currentState).toBe('APPROVED')
    expect(workflow.definition.isTerminalState(workflow.currentState)).toBe(true)
  })

  it('rejects every later transition from a terminal state and preserves state', () => {
    const workflow = Workflow.from(terminalDefinition, { currentState: 'SUBMITTED' })
    workflow.transition('APPROVED', { facts: { approvalsSatisfied: true } })

    expect(() =>
      workflow.transition('DRAFT', {
        facts: { approvalsSatisfied: true },
      }),
    ).toThrow(WorkflowTerminalStateError)
    expect(workflow.currentState).toBe('APPROVED')
    expect(workflow.toJSON()).toEqual({ currentState: 'APPROVED' })
  })

  it('evaluates the current source state rather than a terminal target', () => {
    const workflow = Workflow.from(terminalDefinition, { currentState: 'SUBMITTED' })

    workflow.transition('REJECTED')

    expect(workflow.currentState).toBe('REJECTED')
  })

  it('rejects guarded outgoing transitions in terminal-state definitions', () => {
    expect(() =>
      Workflow.create({
        states: ['DRAFT', 'APPROVED'],
        initialState: 'DRAFT',
        terminalStates: ['APPROVED'],
        transitions: [
          { source: 'DRAFT', target: 'APPROVED' },
          {
            source: 'APPROVED',
            target: 'DRAFT',
            guard: { fact: 'override', equals: true },
          },
        ],
      }),
    ).toThrow(InvalidWorkflowDefinitionError)
  })

  it('reports the exact portable terminal-state code before invalid-transition errors', () => {
    const workflow = Workflow.from(terminalDefinition, { currentState: 'REJECTED' })

    try {
      workflow.transition('DRAFT')
      throw new Error('Expected terminal-state rejection')
    } catch (error) {
      expect(error).toBeInstanceOf(WorkflowTerminalStateError)
      expect((error as WorkflowTerminalStateError).code).toBe('FINFLOW_WORKFLOW_TERMINAL_STATE')
    }
    expect(workflow.currentState).toBe('REJECTED')
  })
})
