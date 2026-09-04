import { describe, expect, it } from 'vitest'
import {
  FinFlowWorkflowError,
  InvalidWorkflowDefinitionError,
  InvalidWorkflowStateError,
  InvalidWorkflowTransitionError,
  WorkflowGuardRejectedError,
  WorkflowTerminalStateError,
  isFinFlowWorkflowError,
} from '../../src/index.js'

describe('Workflow errors', () => {
  it('exposes every currently specified portable Workflow code', () => {
    expect(new InvalidWorkflowDefinitionError().code).toBe('FINFLOW_WORKFLOW_INVALID_DEFINITION')
    expect(new InvalidWorkflowStateError().code).toBe('FINFLOW_WORKFLOW_INVALID_STATE')
    expect(new InvalidWorkflowTransitionError().code).toBe('FINFLOW_WORKFLOW_INVALID_TRANSITION')
    expect(new WorkflowGuardRejectedError().code).toBe('FINFLOW_WORKFLOW_GUARD_REJECTED')
    expect(new WorkflowTerminalStateError().code).toBe('FINFLOW_WORKFLOW_TERMINAL_STATE')
  })

  it('narrows FinFlow Workflow errors without relying on messages', () => {
    expect(isFinFlowWorkflowError(new InvalidWorkflowTransitionError())).toBe(true)
    expect(isFinFlowWorkflowError(new FinFlowWorkflowError('FINFLOW_WORKFLOW_INVALID_STATE', 'custom'))).toBe(true)
    expect(isFinFlowWorkflowError(new Error('Invalid Workflow transition'))).toBe(false)
  })
})
