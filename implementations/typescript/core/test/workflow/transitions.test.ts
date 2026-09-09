// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from 'vitest'
import {
  InvalidWorkflowDefinitionError,
  InvalidWorkflowStateError,
  InvalidWorkflowTransitionError,
  Workflow,
  WorkflowGuardRejectedError,
  WorkflowTerminalStateError,
} from '../../src/index.js'

const payableDefinition = {
  states: ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'],
  initialState: 'DRAFT',
  terminalStates: ['APPROVED', 'REJECTED'],
  transitions: [
    { source: 'DRAFT', target: 'SUBMITTED' },
    { source: 'SUBMITTED', target: 'APPROVED', guard: { fact: 'approvalsSatisfied', equals: true } },
    { source: 'SUBMITTED', target: 'REJECTED' },
  ],
}

describe('Workflow transitions', () => {
  it('applies one declared directed transition exactly once', () => {
    const workflow = Workflow.create(payableDefinition)

    const returned = workflow.transition('SUBMITTED')

    expect(returned).toBe(workflow)
    expect(workflow.currentState).toBe('SUBMITTED')
    expect(workflow.toJSON()).toEqual({ currentState: 'SUBMITTED' })
  })

  it('rejects undeclared direct transitions and preserves current state', () => {
    const workflow = Workflow.create(payableDefinition)

    expect(() => workflow.transition('APPROVED')).toThrow(InvalidWorkflowTransitionError)
    expect(workflow.currentState).toBe('DRAFT')
  })

  it('does not infer reverse direction from a declared transition', () => {
    const workflow = Workflow.from(payableDefinition, { currentState: 'SUBMITTED' })

    expect(() => workflow.transition('DRAFT')).toThrow(InvalidWorkflowTransitionError)
    expect(workflow.currentState).toBe('SUBMITTED')
  })

  it('uses current state as the required transition source', () => {
    const workflow = Workflow.from(payableDefinition, { currentState: 'DRAFT' })

    expect(() => workflow.transition('REJECTED')).toThrow(InvalidWorkflowTransitionError)
    expect(workflow.currentState).toBe('DRAFT')
  })

  it('allows self-transitions only when explicitly declared', () => {
    const withoutSelfTransition = Workflow.create({
      states: ['OPEN', 'CLOSED'],
      initialState: 'OPEN',
      terminalStates: ['CLOSED'],
      transitions: [{ source: 'OPEN', target: 'CLOSED' }],
    })

    expect(() => withoutSelfTransition.transition('OPEN')).toThrow(InvalidWorkflowTransitionError)
    expect(withoutSelfTransition.currentState).toBe('OPEN')

    const withSelfTransition = Workflow.create({
      states: ['OPEN', 'CLOSED'],
      initialState: 'OPEN',
      terminalStates: ['CLOSED'],
      transitions: [
        { source: 'OPEN', target: 'OPEN' },
        { source: 'OPEN', target: 'CLOSED' },
      ],
    })

    expect(withSelfTransition.transition('OPEN').currentState).toBe('OPEN')
  })

  it('rejects unknown target states before transition matching', () => {
    const workflow = Workflow.create(payableDefinition)

    expect(() => workflow.transition('PAID')).toThrow(InvalidWorkflowStateError)
    expect(() => workflow.transition('')).toThrow(InvalidWorkflowStateError)
    expect(() => workflow.transition(7)).toThrow(InvalidWorkflowStateError)
    expect(workflow.currentState).toBe('DRAFT')
  })

  it('rejects definitions with transitions that reference undeclared states', () => {
    expect(() =>
      Workflow.create({
        states: ['DRAFT', 'SUBMITTED'],
        initialState: 'DRAFT',
        terminalStates: ['SUBMITTED'],
        transitions: [{ source: 'DRAFT', target: 'APPROVED' }],
      }),
    ).toThrow(InvalidWorkflowDefinitionError)

    expect(() =>
      Workflow.create({
        states: ['DRAFT', 'SUBMITTED'],
        initialState: 'DRAFT',
        terminalStates: ['SUBMITTED'],
        transitions: [{ source: 'ARCHIVED', target: 'SUBMITTED' }],
      }),
    ).toThrow(InvalidWorkflowDefinitionError)
  })

  it('rejects malformed transition declarations', () => {
    expect(() =>
      Workflow.create({
        states: ['DRAFT', 'SUBMITTED'],
        initialState: 'DRAFT',
        terminalStates: ['SUBMITTED'],
        transitions: [null],
      }),
    ).toThrow(InvalidWorkflowDefinitionError)

    expect(() =>
      Workflow.create({
        states: ['DRAFT', 'SUBMITTED'],
        initialState: 'DRAFT',
        terminalStates: ['SUBMITTED'],
        transitions: 'DRAFT->SUBMITTED',
      }),
    ).toThrow(InvalidWorkflowDefinitionError)

    expect(() =>
      Workflow.create({
        states: ['DRAFT', 'SUBMITTED'],
        initialState: 'DRAFT',
        terminalStates: ['SUBMITTED'],
        transitions: ['DRAFT->SUBMITTED'],
      }),
    ).toThrow(InvalidWorkflowDefinitionError)
  })

  it('rejects definitions with outgoing transitions from terminal states', () => {
    expect(() =>
      Workflow.create({
        states: ['DRAFT', 'DONE'],
        initialState: 'DRAFT',
        terminalStates: ['ARCHIVED'],
        transitions: [{ source: 'DRAFT', target: 'DONE' }],
      }),
    ).toThrow(InvalidWorkflowDefinitionError)

    expect(() =>
      Workflow.create({
        states: ['DRAFT', 'DONE'],
        initialState: 'DRAFT',
        terminalStates: ['DONE'],
        transitions: [
          { source: 'DRAFT', target: 'DONE' },
          { source: 'DONE', target: 'DRAFT' },
        ],
      }),
    ).toThrow(InvalidWorkflowDefinitionError)
  })

  it('allows guarded transitions only when supplied facts satisfy the guard', () => {
    const workflow = Workflow.from(payableDefinition, { currentState: 'SUBMITTED' })
    const facts = { approvalsSatisfied: true }

    workflow.transition('APPROVED', { facts })

    expect(workflow.currentState).toBe('APPROVED')
    expect(facts).toEqual({ approvalsSatisfied: true })
  })

  it('rejects guard failures without mutating state or facts', () => {
    const workflow = Workflow.from(payableDefinition, { currentState: 'SUBMITTED' })
    const facts = { approvalsSatisfied: false }

    expect(() => workflow.transition('APPROVED', { facts })).toThrow(WorkflowGuardRejectedError)

    expect(workflow.currentState).toBe('SUBMITTED')
    expect(facts).toEqual({ approvalsSatisfied: false })

    const missingFacts = Workflow.from(payableDefinition, { currentState: 'SUBMITTED' })
    expect(() => missingFacts.transition('APPROVED')).toThrow(WorkflowGuardRejectedError)
    expect(missingFacts.currentState).toBe('SUBMITTED')
  })

  it('does not expose an intermediate state while guards are evaluated', () => {
    const workflow = Workflow.from(payableDefinition, { currentState: 'SUBMITTED' })
    const facts = Object.defineProperty({}, 'approvalsSatisfied', {
      enumerable: true,
      get: () => {
        expect(workflow.currentState).toBe('SUBMITTED')
        return true
      },
    })

    workflow.transition('APPROVED', { facts })

    expect(workflow.currentState).toBe('APPROVED')
  })

  it('rejects malformed guard declarations', () => {
    expect(() =>
      Workflow.create({
        states: ['DRAFT', 'SUBMITTED'],
        initialState: 'DRAFT',
        terminalStates: ['SUBMITTED'],
        transitions: [{ source: 'DRAFT', target: 'SUBMITTED', guard: { fact: '', equals: true } }],
      }),
    ).toThrow(InvalidWorkflowDefinitionError)

    expect(() =>
      Workflow.create({
        states: ['DRAFT', 'SUBMITTED'],
        initialState: 'DRAFT',
        terminalStates: ['SUBMITTED'],
        transitions: [{ source: 'DRAFT', target: 'SUBMITTED', guard: { fact: 7, equals: true } }],
      }),
    ).toThrow(InvalidWorkflowDefinitionError)

    expect(() =>
      Workflow.create({
        states: ['DRAFT', 'SUBMITTED'],
        initialState: 'DRAFT',
        terminalStates: ['SUBMITTED'],
        transitions: [{ source: 'DRAFT', target: 'SUBMITTED', guard: { fact: 'ready' } }],
      }),
    ).toThrow(InvalidWorkflowDefinitionError)
  })

  it('rejects terminal-state requests before undeclared transition errors', () => {
    const workflow = Workflow.from(payableDefinition, { currentState: 'APPROVED' })

    expect(() => workflow.transition('DRAFT')).toThrow(WorkflowTerminalStateError)
    expect(workflow.currentState).toBe('APPROVED')
  })
})
