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
} from '../../src/index.js'

describe('Workflow errors', () => {
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
