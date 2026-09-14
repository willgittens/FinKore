// SPDX-License-Identifier: MPL-2.0
import { describe, expect, it } from 'vitest'
import {
  InvalidWorkflowDefinitionError,
  InvalidWorkflowInstanceError,
  InvalidWorkflowStateError,
  Workflow,
  WorkflowDefinition,
  WorkflowStateConflictError,
} from '../../src/index.js'

const baseDefinition = {
  states: ['DRAFT', 'SUBMITTED', 'APPROVED'],
  initialState: 'DRAFT',
  terminalStates: ['APPROVED'],
  transitions: [
    { source: 'DRAFT', target: 'SUBMITTED' },
    { source: 'SUBMITTED', target: 'APPROVED' },
  ],
}

describe('Workflow definition versioning', () => {
  it('preserves caller-supplied definition and version identities exactly', () => {
    const definition = WorkflowDefinition.from({
      ...baseDefinition,
      definitionIdentity: ' invoice-approval :: AP ',
      definitionVersionIdentity: 'v:01',
    })

    expect(definition.definitionIdentity).toBe(' invoice-approval :: AP ')
    expect(definition.definitionVersionIdentity).toBe('v:01')
    expect(definition.versionSequence).toBeUndefined()
    expect(definition.isVersioned).toBe(true)
    expect(definition.versionBinding()).toEqual({
      definitionIdentity: ' invoice-approval :: AP ',
      definitionVersionIdentity: 'v:01',
    })
  })

  it('leaves unversioned Draft 0.1 definitions valid', () => {
    const definition = WorkflowDefinition.from(baseDefinition)

    expect(definition.definitionIdentity).toBeUndefined()
    expect(definition.definitionVersionIdentity).toBeUndefined()
    expect(definition.versionSequence).toBeUndefined()
    expect(definition.isVersioned).toBe(false)
    expect(definition.versionBinding()).toBeUndefined()
  })

  it('requires versioned definitions to carry both identity fields', () => {
    expect(() =>
      WorkflowDefinition.from({
        ...baseDefinition,
        definitionIdentity: 'invoice-approval',
      }),
    ).toThrow(InvalidWorkflowDefinitionError)

    expect(() =>
      WorkflowDefinition.from({
        ...baseDefinition,
        definitionVersionIdentity: '1',
      }),
    ).toThrow(InvalidWorkflowDefinitionError)
  })

  it('rejects malformed identity fields without normalizing them', () => {
    for (const definitionIdentity of ['', 7, null]) {
      expect(() =>
        WorkflowDefinition.from({
          ...baseDefinition,
          definitionIdentity,
          definitionVersionIdentity: '1',
        }),
      ).toThrow(InvalidWorkflowDefinitionError)
    }

    for (const definitionVersionIdentity of ['', 7, null]) {
      expect(() =>
        WorkflowDefinition.from({
          ...baseDefinition,
          definitionIdentity: 'invoice-approval',
          definitionVersionIdentity,
        }),
      ).toThrow(InvalidWorkflowDefinitionError)
    }
  })

  it('accepts default sequence positions only as positive base-10 integer strings', () => {
    expect(
      WorkflowDefinition.from({
        ...baseDefinition,
        definitionIdentity: 'invoice-approval',
        definitionVersionIdentity: '1',
        versionSequence: 'DEFAULT',
      }).versionSequence,
    ).toBe('DEFAULT')

    expect(
      WorkflowDefinition.from({
        ...baseDefinition,
        definitionIdentity: 'invoice-approval',
        definitionVersionIdentity: '27',
        versionSequence: 'DEFAULT',
      }).versionSequence,
    ).toBe('DEFAULT')

    for (const definitionVersionIdentity of ['0', '01', '-1', '1.0']) {
      expect(() =>
        WorkflowDefinition.from({
          ...baseDefinition,
          definitionIdentity: 'invoice-approval',
          definitionVersionIdentity,
          versionSequence: 'DEFAULT',
        }),
      ).toThrow(InvalidWorkflowDefinitionError)
    }
  })

  it('rejects unsupported or unbound version sequence declarations', () => {
    expect(() =>
      WorkflowDefinition.from({
        ...baseDefinition,
        definitionIdentity: 'invoice-approval',
        definitionVersionIdentity: '1',
        versionSequence: 'semver',
      }),
    ).toThrow(InvalidWorkflowDefinitionError)

    expect(() =>
      WorkflowDefinition.from({
        ...baseDefinition,
        versionSequence: 'DEFAULT',
      }),
    ).toThrow(InvalidWorkflowDefinitionError)
  })

  it('returns a defensive copy of the version binding', () => {
    const definition = WorkflowDefinition.from({
      ...baseDefinition,
      definitionIdentity: 'invoice-approval',
      definitionVersionIdentity: '1',
    })
    const binding = definition.versionBinding()

    expect(binding).toEqual({
      definitionIdentity: 'invoice-approval',
      definitionVersionIdentity: '1',
    })
    expect(binding).not.toBe(definition.versionBinding())
  })
})

describe('Workflow instance version binding', () => {
  const versionedDefinition = {
    ...baseDefinition,
    definitionIdentity: 'invoice-approval',
    definitionVersionIdentity: '1',
  }

  it('keeps unversioned instance observations unbound', () => {
    const workflow = Workflow.create(baseDefinition)
    const observation = workflow.toJSON()

    expect(workflow.versionBinding()).toBeUndefined()
    expect(observation).toEqual({ currentState: 'DRAFT' })
    expect(observation).not.toHaveProperty('binding')
    expect(observation).not.toHaveProperty('revision')
  })

  it('creates versioned instances with an observable definition-version binding', () => {
    const workflow = Workflow.create(versionedDefinition)

    expect(workflow.versionBinding()).toEqual({
      definitionIdentity: 'invoice-approval',
      definitionVersionIdentity: '1',
    })
    expect(workflow.toJSON()).toEqual({
      currentState: 'DRAFT',
      binding: {
        definitionIdentity: 'invoice-approval',
        definitionVersionIdentity: '1',
      },
    })
  })

  it('preserves the bound definition version across successful transitions', () => {
    const workflow = Workflow.create(versionedDefinition)

    workflow.transition('SUBMITTED')

    expect(workflow.currentState).toBe('SUBMITTED')
    expect(workflow.versionBinding()).toEqual({
      definitionIdentity: 'invoice-approval',
      definitionVersionIdentity: '1',
    })
    expect(workflow.toJSON()).toEqual({
      currentState: 'SUBMITTED',
      binding: {
        definitionIdentity: 'invoice-approval',
        definitionVersionIdentity: '1',
      },
    })
  })

  it('keeps older version observations governed by their bound definition version', () => {
    const older = Workflow.from(versionedDefinition, {
      currentState: 'SUBMITTED',
      binding: {
        definitionIdentity: 'invoice-approval',
        definitionVersionIdentity: '1',
      },
    })

    older.transition('APPROVED')

    expect(older.toJSON()).toEqual({
      currentState: 'APPROVED',
      binding: {
        definitionIdentity: 'invoice-approval',
        definitionVersionIdentity: '1',
      },
    })
  })

  it('rejects supplied definition-version mismatches before transition behavior is observed', () => {
    const older = Workflow.from(versionedDefinition, {
      currentState: 'SUBMITTED',
      binding: {
        definitionIdentity: 'invoice-approval',
        definitionVersionIdentity: '1',
      },
    })
    const newerDefinition = {
      states: ['DRAFT', 'SUBMITTED', 'PAID'],
      initialState: 'DRAFT',
      terminalStates: ['PAID'],
      transitions: [
        { source: 'DRAFT', target: 'SUBMITTED' },
        { source: 'SUBMITTED', target: 'PAID' },
      ],
      definitionIdentity: 'invoice-approval',
      definitionVersionIdentity: '2',
    }

    expect(() => Workflow.from(newerDefinition, older.toJSON())).toThrow(
      expect.objectContaining({ code: 'FINKORE_WORKFLOW_VERSION_MISMATCH' }),
    )
    expect(older.toJSON()).toEqual({
      currentState: 'SUBMITTED',
      binding: {
        definitionIdentity: 'invoice-approval',
        definitionVersionIdentity: '1',
      },
    })
  })

  it('rejects supplied definition identity mismatches before transition behavior is observed', () => {
    const observed = {
      currentState: 'SUBMITTED',
      binding: {
        definitionIdentity: 'invoice-approval',
        definitionVersionIdentity: '1',
      },
    }
    const definition = {
      ...baseDefinition,
      definitionIdentity: 'purchase-order-approval',
      definitionVersionIdentity: '1',
    }

    expect(() => Workflow.from(definition, observed)).toThrow(
      expect.objectContaining({ code: 'FINKORE_WORKFLOW_VERSION_MISMATCH' }),
    )
    expect(observed).toEqual({
      currentState: 'SUBMITTED',
      binding: {
        definitionIdentity: 'invoice-approval',
        definitionVersionIdentity: '1',
      },
    })
  })

  it('rejects versioned observations with missing or malformed bindings', () => {
    expect(() => Workflow.from(versionedDefinition, { currentState: 'SUBMITTED' })).toThrow(
      InvalidWorkflowInstanceError,
    )

    for (const binding of [
      null,
      {},
      { definitionIdentity: '', definitionVersionIdentity: '1' },
      { definitionIdentity: 'invoice-approval', definitionVersionIdentity: '' },
      { definitionIdentity: 'invoice-approval', definitionVersionIdentity: 1 },
    ]) {
      expect(() => Workflow.from(versionedDefinition, { currentState: 'SUBMITTED', binding })).toThrow(
        InvalidWorkflowInstanceError,
      )
    }
  })

  it('rejects a bound observation supplied with an unversioned definition', () => {
    expect(() =>
      Workflow.from(baseDefinition, {
        currentState: 'SUBMITTED',
        binding: {
          definitionIdentity: 'invoice-approval',
          definitionVersionIdentity: '1',
        },
      }),
    ).toThrow(expect.objectContaining({ code: 'FINKORE_WORKFLOW_VERSION_MISMATCH' }))

    expect(() => Workflow.from(baseDefinition, { currentState: 'SUBMITTED', binding: undefined })).toThrow(
      InvalidWorkflowInstanceError,
    )
  })

  it('returns a defensive copy of the instance binding', () => {
    const workflow = Workflow.create(versionedDefinition)
    const binding = workflow.versionBinding()

    expect(binding).toEqual({
      definitionIdentity: 'invoice-approval',
      definitionVersionIdentity: '1',
    })
    expect(binding).not.toBe(workflow.versionBinding())
  })
})

describe('Workflow import', () => {
  const versionedDefinition = {
    ...baseDefinition,
    definitionIdentity: 'invoice-approval',
    definitionVersionIdentity: '1',
  }

  it('imports an existing instance in the supplied state instead of the initial state', () => {
    const workflow = Workflow.import(baseDefinition, { currentState: 'SUBMITTED' })

    expect(workflow.currentState).toBe('SUBMITTED')
    expect(workflow.toJSON()).toEqual({ currentState: 'SUBMITTED' })
  })

  it('preserves supplied version binding and opaque instance revision exactly', () => {
    const workflow = Workflow.import(versionedDefinition, {
      currentState: 'SUBMITTED',
      binding: {
        definitionIdentity: 'invoice-approval',
        definitionVersionIdentity: '1',
      },
      revision: 'wf-rev:0007',
    })

    expect(workflow.revision).toBe('wf-rev:0007')
    expect(workflow.toJSON()).toEqual({
      currentState: 'SUBMITTED',
      binding: {
        definitionIdentity: 'invoice-approval',
        definitionVersionIdentity: '1',
      },
      revision: 'wf-rev:0007',
    })
  })

  it('reports malformed import observations as invalid instances', () => {
    expect(() => Workflow.import(baseDefinition, {})).toThrow(InvalidWorkflowInstanceError)
    expect(() => Workflow.import(baseDefinition, null)).toThrow(InvalidWorkflowInstanceError)
    expect(() => Workflow.import(baseDefinition, 7)).toThrow(InvalidWorkflowInstanceError)
  })

  it('rejects malformed instance revisions without deriving a replacement', () => {
    for (const revision of ['', 7, null]) {
      expect(() => Workflow.import(baseDefinition, { currentState: 'SUBMITTED', revision })).toThrow(
        InvalidWorkflowInstanceError,
      )
    }
  })

  it('does not evaluate guards or perform a transition during import', () => {
    const workflow = Workflow.import(
      {
        states: ['DRAFT', 'SUBMITTED', 'APPROVED'],
        initialState: 'DRAFT',
        terminalStates: ['APPROVED'],
        transitions: [
          { source: 'DRAFT', target: 'SUBMITTED' },
          { source: 'SUBMITTED', target: 'APPROVED', guard: { fact: 'approved', equals: true } },
        ],
      },
      { currentState: 'SUBMITTED' },
    )

    expect(workflow.currentState).toBe('SUBMITTED')
  })

  it('serializes unversioned imported revisions without inventing a binding', () => {
    const workflow = Workflow.import(baseDefinition, {
      currentState: 'SUBMITTED',
      revision: 'wf-rev:loose',
    })

    expect(workflow.versionBinding()).toBeUndefined()
    expect(workflow.revision).toBe('wf-rev:loose')
    expect(workflow.toJSON()).toEqual({
      currentState: 'SUBMITTED',
      revision: 'wf-rev:loose',
    })
    expect(workflow.toJSON()).not.toHaveProperty('binding')
  })

  it('serializes versioned imported observations without inventing a revision', () => {
    const workflow = Workflow.import(versionedDefinition, {
      currentState: 'SUBMITTED',
      binding: {
        definitionIdentity: 'invoice-approval',
        definitionVersionIdentity: '1',
      },
    })

    expect(workflow.revision).toBeUndefined()
    expect(workflow.toJSON()).toEqual({
      currentState: 'SUBMITTED',
      binding: {
        definitionIdentity: 'invoice-approval',
        definitionVersionIdentity: '1',
      },
    })
    expect(workflow.toJSON()).not.toHaveProperty('revision')
  })

  it('keeps Workflow.from as the existing-observation import boundary', () => {
    const workflow = Workflow.from(versionedDefinition, {
      currentState: 'SUBMITTED',
      binding: {
        definitionIdentity: 'invoice-approval',
        definitionVersionIdentity: '1',
      },
      revision: 'wf-rev:0007',
    })

    expect(workflow.toJSON()).toEqual({
      currentState: 'SUBMITTED',
      binding: {
        definitionIdentity: 'invoice-approval',
        definitionVersionIdentity: '1',
      },
      revision: 'wf-rev:0007',
    })
  })
})

describe('Workflow conflict preconditions', () => {
  const definition = {
    states: ['DRAFT', 'SUBMITTED', 'APPROVED'],
    initialState: 'DRAFT',
    terminalStates: ['APPROVED'],
    transitions: [
      { source: 'DRAFT', target: 'SUBMITTED' },
      { source: 'SUBMITTED', target: 'APPROVED' },
    ],
  }

  it('allows transition validation to proceed when expected current state matches', () => {
    const workflow = Workflow.import(definition, { currentState: 'SUBMITTED' })

    workflow.transition('APPROVED', { expectedCurrentState: 'SUBMITTED' })

    expect(workflow.toJSON()).toEqual({ currentState: 'APPROVED' })
  })

  it('rejects stale expected current state before transition validation and preserves the instance', () => {
    const workflow = Workflow.import(definition, { currentState: 'SUBMITTED' })

    expect(() => workflow.transition('APPROVED', { expectedCurrentState: 'DRAFT' })).toThrow(
      WorkflowStateConflictError,
    )
    expect(workflow.toJSON()).toEqual({ currentState: 'SUBMITTED' })
  })

  it('reports undeclared expected current state as invalid state before conflict comparison', () => {
    const workflow = Workflow.import(definition, { currentState: 'SUBMITTED' })

    expect(() => workflow.transition('APPROVED', { expectedCurrentState: 'ARCHIVED' })).toThrow(
      InvalidWorkflowStateError,
    )
    expect(workflow.toJSON()).toEqual({ currentState: 'SUBMITTED' })
  })

  it('reports expected-state conflict before terminal-state checks', () => {
    const workflow = Workflow.import(definition, { currentState: 'APPROVED' })

    expect(() => workflow.transition('DRAFT', { expectedCurrentState: 'SUBMITTED' })).toThrow(
      WorkflowStateConflictError,
    )
    expect(workflow.toJSON()).toEqual({ currentState: 'APPROVED' })
  })

  it('preserves revision when expected revision matches or is omitted', () => {
    const matched = Workflow.import(definition, { currentState: 'SUBMITTED', revision: 'wf-rev:0007' })
    const omitted = Workflow.import(definition, { currentState: 'SUBMITTED', revision: 'wf-rev:0007' })

    matched.transition('APPROVED', { expectedRevision: 'wf-rev:0007' })
    omitted.transition('APPROVED')

    expect(matched.toJSON()).toEqual({ currentState: 'APPROVED', revision: 'wf-rev:0007' })
    expect(omitted.toJSON()).toEqual({ currentState: 'APPROVED', revision: 'wf-rev:0007' })
  })

  it('rejects stale or unavailable expected revision and preserves the instance', () => {
    const withRevision = Workflow.import(definition, { currentState: 'SUBMITTED', revision: 'wf-rev:0007' })
    const withoutRevision = Workflow.import(definition, { currentState: 'SUBMITTED' })

    expect(() => withRevision.transition('APPROVED', { expectedRevision: 'wf-rev:0006' })).toThrow(
      WorkflowStateConflictError,
    )
    expect(() => withoutRevision.transition('APPROVED', { expectedRevision: 'wf-rev:0001' })).toThrow(
      WorkflowStateConflictError,
    )

    expect(withRevision.toJSON()).toEqual({ currentState: 'SUBMITTED', revision: 'wf-rev:0007' })
    expect(withoutRevision.toJSON()).toEqual({ currentState: 'SUBMITTED' })
  })
})
