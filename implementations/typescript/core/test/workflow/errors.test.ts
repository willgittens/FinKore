import { describe, expect, it } from 'vitest'
import {
  FinKoreWorkflowError,
  InvalidWorkflowDefinitionError,
  InvalidWorkflowStateError,
  InvalidWorkflowTransitionError,
  WorkflowGuardRejectedError,
  WorkflowTerminalStateError,
  isFinKoreWorkflowError,
} from '../../src/index.js'

describe('Workflow errors', () => {
  it('exposes every currently specified portable Workflow code', () => {
    expect(new InvalidWorkflowDefinitionError().code).toBe('FINKORE_WORKFLOW_INVALID_DEFINITION')
    expect(new InvalidWorkflowStateError().code).toBe('FINKORE_WORKFLOW_INVALID_STATE')
    expect(new InvalidWorkflowTransitionError().code).toBe('FINKORE_WORKFLOW_INVALID_TRANSITION')
    expect(new WorkflowGuardRejectedError().code).toBe('FINKORE_WORKFLOW_GUARD_REJECTED')
    expect(new WorkflowTerminalStateError().code).toBe('FINKORE_WORKFLOW_TERMINAL_STATE')
  })

  it('narrows FinKore Workflow errors without relying on messages', () => {
    expect(isFinKoreWorkflowError(new InvalidWorkflowTransitionError())).toBe(true)
    expect(isFinKoreWorkflowError(new FinKoreWorkflowError('FINKORE_WORKFLOW_INVALID_STATE', 'custom'))).toBe(true)
    expect(isFinKoreWorkflowError(new Error('Invalid Workflow transition'))).toBe(false)
  })
})
