// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from 'vitest'
import {
  InvalidWorkflowDefinitionError,
  InvalidWorkflowTransitionError,
  Workflow,
  WorkflowGuardRejectedError,
} from '../../src/index.js'

const guardedDefinition = {
  states: ['SUBMITTED', 'APPROVED', 'REJECTED', 'ESCALATED', 'VOIDED'],
  initialState: 'SUBMITTED',
  terminalStates: ['APPROVED', 'REJECTED'],
  transitions: [
    {
      source: 'SUBMITTED',
      target: 'APPROVED',
      guards: [
        { fact: 'approvalsSatisfied', equals: true },
        { fact: 'withinLimit', equals: true },
      ],
    },
    {
      source: 'SUBMITTED',
      target: 'REJECTED',
      guards: [{ fact: 'rejectionReasonPresent', equals: true }],
    },
    {
      source: 'SUBMITTED',
      target: 'ESCALATED',
    },
  ],
}

describe('Workflow guards', () => {
  it('allows a guarded transition only when every applicable guard passes', () => {
    const workflow = Workflow.create(guardedDefinition)
    const facts = { approvalsSatisfied: true, withinLimit: true, rejectionReasonPresent: false }

    workflow.transition('APPROVED', { facts })

    expect(workflow.currentState).toBe('APPROVED')
    expect(facts).toEqual({ approvalsSatisfied: true, withinLimit: true, rejectionReasonPresent: false })
  })

  it('rejects a guarded transition when any applicable guard fails', () => {
    for (const facts of [
      { approvalsSatisfied: false, withinLimit: true },
      { approvalsSatisfied: true, withinLimit: false },
      { approvalsSatisfied: true },
    ]) {
      const workflow = Workflow.create(guardedDefinition)

      expect(() => workflow.transition('APPROVED', { facts })).toThrow(WorkflowGuardRejectedError)
      expect(workflow.currentState).toBe('SUBMITTED')
    }
  })

  it('does not treat supplied facts as guards for unguarded transitions', () => {
    const workflow = Workflow.create({
      states: ['DRAFT', 'SUBMITTED'],
      initialState: 'DRAFT',
      terminalStates: ['SUBMITTED'],
      transitions: [{ source: 'DRAFT', target: 'SUBMITTED' }],
    })

    workflow.transition('SUBMITTED', { facts: { undefined: 'not-a-guard', approvalsSatisfied: false } })

    expect(workflow.currentState).toBe('SUBMITTED')
  })

  it('does not let a passing guard validate an undeclared transition', () => {
    const workflow = Workflow.create(guardedDefinition)

    expect(() => workflow.transition('VOIDED', { facts: { approvalsSatisfied: true, withinLimit: true } })).toThrow(
      InvalidWorkflowTransitionError,
    )
    expect(workflow.currentState).toBe('SUBMITTED')
  })

  it('evaluates only guards attached to the matched directed transition', () => {
    const workflow = Workflow.create(guardedDefinition)

    workflow.transition('ESCALATED', { facts: { approvalsSatisfied: false, withinLimit: false } })

    expect(workflow.currentState).toBe('ESCALATED')
  })

  it('preserves transition direction semantics when guards pass', () => {
    const workflow = Workflow.from(guardedDefinition, { currentState: 'ESCALATED' })

    expect(() => workflow.transition('SUBMITTED', { facts: { approvalsSatisfied: true, withinLimit: true } })).toThrow(
      InvalidWorkflowTransitionError,
    )
    expect(workflow.currentState).toBe('ESCALATED')
  })

  it('does not change the logical result when guard declaration order changes', () => {
    const ordered = Workflow.create(guardedDefinition)
    const reversed = Workflow.create({
      ...guardedDefinition,
      transitions: [
        {
          source: 'SUBMITTED',
          target: 'APPROVED',
          guards: [
            { fact: 'withinLimit', equals: true },
            { fact: 'approvalsSatisfied', equals: true },
          ],
        },
      ],
    })
    const facts = { approvalsSatisfied: true, withinLimit: false }

    expect(() => ordered.transition('APPROVED', { facts })).toThrow(WorkflowGuardRejectedError)
    expect(() => reversed.transition('APPROVED', { facts })).toThrow(WorkflowGuardRejectedError)
    expect(ordered.currentState).toBe('SUBMITTED')
    expect(reversed.currentState).toBe('SUBMITTED')
  })

  it('is deterministic for the same declared facts', () => {
    const first = Workflow.create(guardedDefinition)
    const second = Workflow.create(guardedDefinition)
    const facts = { approvalsSatisfied: true, withinLimit: true }

    expect(first.transition('APPROVED', { facts }).currentState).toBe('APPROVED')
    expect(second.transition('APPROVED', { facts }).currentState).toBe('APPROVED')
  })

  it('compares guard facts recursively with JSON type and presence distinctions', () => {
    const definitionFor = (equals: unknown) => ({
      states: ['SUBMITTED', 'APPROVED'],
      initialState: 'SUBMITTED',
      terminalStates: ['APPROVED'],
      transitions: [{ source: 'SUBMITTED', target: 'APPROVED', guard: { fact: 'value', equals } }],
    })

    for (const [equals, value] of [
      [true, 1],
      [1, true],
      [{ nested: [true] }, { nested: [1] }],
      [['KYC', 'LIMIT'], ['LIMIT', 'KYC']],
    ] as const) {
      const workflow = Workflow.create(definitionFor(equals))
      const facts = { value }
      expect(() => workflow.transition('APPROVED', { facts })).toThrow(WorkflowGuardRejectedError)
      expect(workflow.currentState).toBe('SUBMITTED')
      expect(facts).toEqual({ value })
    }

    const missing = Workflow.create(definitionFor(null))
    expect(() => missing.transition('APPROVED', { facts: {} })).toThrow(WorkflowGuardRejectedError)
    expect(missing.currentState).toBe('SUBMITTED')

    for (const [equals, value] of [
      [null, null],
      [{ status: 'CLEAR', detail: { score: 7 } }, { detail: { score: 7 }, status: 'CLEAR' }],
      [['KYC', { status: 'CLEAR' }], ['KYC', { status: 'CLEAR' }]],
    ] as const) {
      const workflow = Workflow.create(definitionFor(equals))
      workflow.transition('APPROVED', { facts: { value } })
      expect(workflow.currentState).toBe('APPROVED')
    }
  })

  it('distinguishes every recursive JSON container boundary used by guards', () => {
    const definitionFor = (equals: unknown) => ({
      states: ['SUBMITTED', 'APPROVED'],
      initialState: 'SUBMITTED',
      terminalStates: ['APPROVED'],
      transitions: [{ source: 'SUBMITTED', target: 'APPROVED', guard: { fact: 'value', equals } }],
    })
    const rejectedPairs = [
      [null, false],
      [false, null],
      [[], {}],
      [{}, []],
      [[], [0]],
      [[0], []],
      [[1, 2], [1, 3]],
      [[1, 2], [1]],
      [{ left: 1 }, { right: 1 }],
      [{ left: 1 }, { left: 1, right: 2 }],
      [{ values: [1, { approved: true }] }, { values: [1, { approved: false }] }],
    ] as const

    for (const [equals, value] of rejectedPairs) {
      const workflow = Workflow.create(definitionFor(equals))
      expect(() => workflow.transition('APPROVED', { facts: { value } })).toThrow(WorkflowGuardRejectedError)
      expect(workflow.currentState).toBe('SUBMITTED')
    }

    for (const value of [[], {}, [1, 2], { left: 1, nested: { approved: true } }] as const) {
      const workflow = Workflow.create(definitionFor(value))
      workflow.transition('APPROVED', { facts: { value: structuredClone(value) } })
      expect(workflow.currentState).toBe('APPROVED')
    }
  })

  it('treats authorization evidence as supplied facts without assuming an authorization model', () => {
    const workflow = Workflow.create({
      states: ['PENDING', 'READY'],
      initialState: 'PENDING',
      terminalStates: ['READY'],
      transitions: [
        {
          source: 'PENDING',
          target: 'READY',
          guard: { fact: 'applicationAuthorizationDecision', equals: 'ALLOW' },
        },
      ],
    })

    workflow.transition('READY', { facts: { applicationAuthorizationDecision: 'ALLOW' } })

    expect(workflow.currentState).toBe('READY')
  })

  it('rejects malformed multiple-guard declarations', () => {
    expect(() =>
      Workflow.create({
        states: ['SUBMITTED', 'APPROVED'],
        initialState: 'SUBMITTED',
        terminalStates: ['APPROVED'],
        transitions: [{ source: 'SUBMITTED', target: 'APPROVED', guards: { fact: 'ready', equals: true } }],
      }),
    ).toThrow(InvalidWorkflowDefinitionError)

    expect(() =>
      Workflow.create({
        states: ['SUBMITTED', 'APPROVED'],
        initialState: 'SUBMITTED',
        terminalStates: ['APPROVED'],
        transitions: [
          {
            source: 'SUBMITTED',
            target: 'APPROVED',
            guard: { fact: 'ready', equals: true },
            guards: [{ fact: 'withinLimit', equals: true }],
          },
        ],
      }),
    ).toThrow(InvalidWorkflowDefinitionError)
  })
})
