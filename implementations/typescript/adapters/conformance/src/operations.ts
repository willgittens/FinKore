import { AuditLog, Money, Workflow } from '@finkore/typescript'
import type { AdapterRequest, NormalizedResult } from '@finkore/conformance-runner'
import type { AuditRedactionRequest } from '@finkore/typescript'
import { normalizeThrown } from './normalization.js'

/**
 * Conformance operation handler for one supported operation ID.
 *
 * Handlers translate conformance input fixtures into TypeScript API calls and
 * return normalized observations for the runner.
 */
type OperationHandler = (request: AdapterRequest) => NormalizedResult

function inputValue(input: unknown): unknown {
  if (typeof input !== 'object' || input === null || !('value' in input)) {
    return undefined
  }
  return (input as { readonly value: unknown }).value
}

function inputOperands(input: unknown): { readonly left: unknown; readonly right: unknown } {
  if (typeof input !== 'object' || input === null || !('left' in input) || !('right' in input)) {
    return { left: undefined, right: undefined }
  }
  return input as { readonly left: unknown; readonly right: unknown }
}

function inputRounding(input: unknown): { readonly value: unknown; readonly scale: unknown; readonly mode: unknown } {
  if (typeof input !== 'object' || input === null || !('value' in input)) {
    return { value: undefined, scale: undefined, mode: undefined }
  }
  const candidate = input as { readonly value: unknown; readonly scale?: unknown; readonly mode?: unknown }
  return { value: candidate.value, scale: candidate.scale, mode: candidate.mode }
}

function inputUnaryArithmetic(input: unknown): { readonly value: unknown; readonly scalar?: unknown } {
  if (typeof input !== 'object' || input === null || !('value' in input)) {
    return { value: undefined }
  }
  const candidate = input as { readonly value: unknown; readonly scalar?: unknown }
  return { value: candidate.value, scalar: candidate.scalar }
}

function inputWorkflowCreate(input: unknown): { readonly definition: unknown } {
  if (typeof input !== 'object' || input === null || !('definition' in input)) {
    return { definition: undefined }
  }
  return input as { readonly definition: unknown }
}

function inputWorkflowTransition(input: unknown): {
  readonly definition: unknown
  readonly instance: unknown
  readonly target: unknown
  readonly facts?: Readonly<Record<string, unknown>>
} {
  if (typeof input !== 'object' || input === null || !('definition' in input) || !('instance' in input)) {
    return { definition: undefined, instance: undefined, target: undefined }
  }
  const candidate = input as {
    readonly definition: unknown
    readonly instance: unknown
    readonly target?: unknown
    readonly facts?: Readonly<Record<string, unknown>>
  }
  const result: {
    readonly definition: unknown
    readonly instance: unknown
    readonly target: unknown
    readonly facts?: Readonly<Record<string, unknown>>
  } = {
    definition: candidate.definition,
    instance: candidate.instance,
    target: candidate.target,
  }
  return candidate.facts === undefined ? result : { ...result, facts: candidate.facts }
}

function inputAuditHistory(input: unknown): { readonly history: unknown } {
  if (typeof input !== 'object' || input === null || !('history' in input)) {
    return { history: undefined }
  }
  return input as { readonly history: unknown }
}

function inputAuditAppend(input: unknown): { readonly history: unknown; readonly event: unknown } {
  if (typeof input !== 'object' || input === null || !('history' in input) || !('event' in input)) {
    return { history: undefined, event: undefined }
  }
  return input as { readonly history: unknown; readonly event: unknown }
}

function inputAuditRedact(input: unknown): { readonly history: unknown; readonly policy: unknown; readonly redactionEvent: unknown } {
  if (typeof input !== 'object' || input === null || !('history' in input)) {
    return { history: undefined, policy: undefined, redactionEvent: undefined }
  }
  const candidate = input as { readonly history: unknown; readonly policy?: unknown; readonly redactionEvent?: unknown }
  return { history: candidate.history, policy: candidate.policy, redactionEvent: candidate.redactionEvent }
}

/**
 * Executes the first-milestone Money serialization boundary.
 *
 * The conformance operations `money.deserialize` and `money.serialize` both
 * observe construction followed by canonical portable serialization in this
 * milestone. Financial validation remains in the core TypeScript Money API; the
 * adapter only translates inputs, outputs, and portable errors.
 */
function executeMoneySerialization(request: AdapterRequest): NormalizedResult {
  try {
    return { status: 'success', value: Money.deserialize(inputValue(request.input)).toJSON() }
  } catch (error) {
    return normalizeThrown(error)
  }
}

/**
 * Executes canonical Money addition through the TypeScript core API.
 *
 * The adapter constructs operands, delegates compatibility and exact decimal
 * arithmetic to `Money.add`, and returns normalized observations for the
 * runner's operand non-mutation checks.
 */
function executeMoneyAdd(request: AdapterRequest): NormalizedResult {
  const operands = inputOperands(request.input)
  let left: Money | undefined
  let right: Money | undefined
  try {
    left = Money.deserialize(operands.left)
    right = Money.deserialize(operands.right)
    return {
      status: 'success',
      value: left.add(right).toJSON(),
      observations: { left: left.toJSON(), right: right.toJSON() },
    }
  } catch (error) {
    const result = normalizeThrown(error)
    if (result.status === 'error' && left !== undefined && right !== undefined) {
      return { ...result, observations: { left: left.toJSON(), right: right.toJSON() } }
    }
    return result
  }
}

/**
 * Executes canonical Money subtraction through the TypeScript core API.
 *
 * The adapter constructs operands, delegates compatibility and exact decimal
 * arithmetic to `Money.subtract`, and returns normalized observations for the
 * runner's operand non-mutation checks.
 */
function executeMoneySubtract(request: AdapterRequest): NormalizedResult {
  const operands = inputOperands(request.input)
  let left: Money | undefined
  let right: Money | undefined
  try {
    left = Money.deserialize(operands.left)
    right = Money.deserialize(operands.right)
    return {
      status: 'success',
      value: left.subtract(right).toJSON(),
      observations: { left: left.toJSON(), right: right.toJSON() },
    }
  } catch (error) {
    const result = normalizeThrown(error)
    if (result.status === 'error' && left !== undefined && right !== undefined) {
      return { ...result, observations: { left: left.toJSON(), right: right.toJSON() } }
    }
    return result
  }
}

/**
 * Executes canonical Money negation through the TypeScript core API.
 *
 * The adapter constructs the operand, delegates exact sign reversal to
 * `Money.negate`, and reports the operand observation used by conformance
 * non-mutation checks.
 */
function executeMoneyNegate(request: AdapterRequest): NormalizedResult {
  const input = inputUnaryArithmetic(request.input)
  let value: Money | undefined
  try {
    value = Money.deserialize(input.value)
    return {
      status: 'success',
      value: value.negate().toJSON(),
      observations: { operand: value.toJSON() },
    }
  } catch (error) {
    const result = normalizeThrown(error)
    if (result.status === 'error' && value !== undefined) {
      return { ...result, observations: { operand: value.toJSON() } }
    }
    return result
  }
}

/**
 * Executes canonical Money scalar multiplication through the TypeScript core API.
 *
 * Scalar validation and exact decimal multiplication remain core behavior; the
 * adapter only translates the conformance fixture and normalized result.
 */
function executeMoneyMultiply(request: AdapterRequest): NormalizedResult {
  const input = inputUnaryArithmetic(request.input)
  let value: Money | undefined
  try {
    value = Money.deserialize(input.value)
    return {
      status: 'success',
      value: value.multiply(input.scalar).toJSON(),
      observations: { operand: value.toJSON() },
    }
  } catch (error) {
    const result = normalizeThrown(error)
    if (result.status === 'error' && value !== undefined) {
      return { ...result, observations: { operand: value.toJSON() } }
    }
    return result
  }
}

/**
 * Executes canonical Money scalar division through the TypeScript core API.
 *
 * Division-by-zero and rounding-required behavior remain in `Money.divide`;
 * this adapter only maps the fixture shape into the TypeScript API.
 */
function executeMoneyDivide(request: AdapterRequest): NormalizedResult {
  const input = inputUnaryArithmetic(request.input)
  let value: Money | undefined
  try {
    value = Money.deserialize(input.value)
    return {
      status: 'success',
      value: value.divide(input.scalar).toJSON(),
      observations: { operand: value.toJSON() },
    }
  } catch (error) {
    const result = normalizeThrown(error)
    if (result.status === 'error' && value !== undefined) {
      return { ...result, observations: { operand: value.toJSON() } }
    }
    return result
  }
}

/**
 * Executes canonical Money comparison through the TypeScript core API.
 *
 * The adapter constructs operands, delegates currency compatibility and exact
 * decimal ordering to `Money.compare`, and returns normalized observations for
 * the runner's operand non-mutation checks.
 */
function executeMoneyCompare(request: AdapterRequest): NormalizedResult {
  const operands = inputOperands(request.input)
  let left: Money | undefined
  let right: Money | undefined
  try {
    left = Money.deserialize(operands.left)
    right = Money.deserialize(operands.right)
    return {
      status: 'success',
      value: left.compare(right),
      observations: { left: left.toJSON(), right: right.toJSON() },
    }
  } catch (error) {
    const result = normalizeThrown(error)
    if (result.status === 'error' && left !== undefined && right !== undefined) {
      return { ...result, observations: { left: left.toJSON(), right: right.toJSON() } }
    }
    return result
  }
}

/**
 * Executes canonical Money rounding through the TypeScript core API.
 *
 * The adapter parses the Money value, delegates target-scale and mode
 * validation plus exact decimal rounding to `Money.round`, and reports the
 * operand observation used by conformance non-mutation checks.
 */
function executeMoneyRound(request: AdapterRequest): NormalizedResult {
  const input = inputRounding(request.input)
  let value: Money | undefined
  try {
    value = Money.deserialize(input.value)
    return {
      status: 'success',
      value: value.round({ scale: input.scale, mode: input.mode }).toJSON(),
      observations: { operand: value.toJSON() },
    }
  } catch (error) {
    const result = normalizeThrown(error)
    if (result.status === 'error' && value !== undefined) {
      return { ...result, observations: { operand: value.toJSON() } }
    }
    return result
  }
}

/**
 * Executes the conformance-local Workflow creation boundary.
 *
 * Definition validation and initial-state semantics remain in `Workflow.create`;
 * this adapter only maps the fixture shape into the TypeScript API.
 */
function executeWorkflowCreate(request: AdapterRequest): NormalizedResult {
  const input = inputWorkflowCreate(request.input)
  try {
    return { status: 'success', value: Workflow.create(input.definition).toJSON() }
  } catch (error) {
    return normalizeThrown(error)
  }
}

/**
 * Executes canonical Workflow transitions through the TypeScript core API.
 *
 * The adapter constructs an instance at the conformance fixture's current
 * state, delegates transition validation and mutation to the core Workflow API,
 * and returns current-state and fact observations for rejected transitions.
 */
function executeWorkflowTransition(request: AdapterRequest): NormalizedResult {
  const input = inputWorkflowTransition(request.input)
  let workflow: Workflow | undefined
  try {
    workflow = Workflow.from(input.definition, input.instance)
    const options = input.facts === undefined ? undefined : { facts: input.facts }
    return { status: 'success', value: workflow.transition(input.target, options).toJSON() }
  } catch (error) {
    const result = normalizeThrown(error)
    if (result.status === 'error' && workflow !== undefined) {
      const facts = input.facts
      const observations =
        facts === undefined || Object.keys(facts).length === 0
          ? { currentState: workflow.currentState }
          : { currentState: workflow.currentState, facts }
      return { ...result, observations }
    }
    return result
  }
}

/**
 * Executes canonical Audit append through the TypeScript core API.
 *
 * The adapter reconstructs the supplied logical history, delegates event
 * validation, duplicate identity checks, and append-only behavior to
 * `AuditLog.append`, and returns the normalized committed history.
 */
function executeAuditAppend(request: AdapterRequest): NormalizedResult {
  const input = inputAuditAppend(request.input)
  let log: AuditLog | undefined
  try {
    log = AuditLog.create(input.history as readonly unknown[])
    return { status: 'success', value: log.append(input.event).toJSON() }
  } catch (error) {
    const result = normalizeThrown(error)
    if (result.status === 'error' && log !== undefined) {
      return { ...result, observations: { history: log.events() } }
    }
    return result
  }
}

/**
 * Executes Audit redaction through the TypeScript core API.
 *
 * The adapter reconstructs supplied history and delegates policy validation,
 * protected path selection, marker application, evidence validation, and
 * failure atomicity to AuditLog.redact.
 */
function executeAuditRedact(request: AdapterRequest): NormalizedResult {
  const input = inputAuditRedact(request.input)
  let log: AuditLog | undefined
  try {
    log = AuditLog.create(input.history as readonly unknown[])
    const redactionRequest = { policy: input.policy, redactionEvent: input.redactionEvent } as AuditRedactionRequest
    return { status: 'success', value: log.redact(redactionRequest) }
  } catch (error) {
    const result = normalizeThrown(error)
    if (result.status === 'error' && log !== undefined) {
      return { ...result, observations: { history: log.events() } }
    }
    return result
  }
}

/**
 * Executes canonical Audit replace attempts through the TypeScript core API.
 *
 * Replacement is rejected by core append-only semantics; the adapter only
 * constructs the supplied history and reports the post-failure observation.
 */
function executeAuditReplace(request: AdapterRequest): NormalizedResult {
  const input = inputAuditHistory(request.input)
  let log: AuditLog | undefined
  try {
    log = AuditLog.create(input.history as readonly unknown[])
    log.replace()
    throw new Error('Unreachable Audit replace success')
  } catch (error) {
    const result = normalizeThrown(error)
    if (result.status === 'error' && log !== undefined) {
      return { ...result, observations: { history: log.events() } }
    }
    return result
  }
}

/**
 * Executes canonical Audit remove attempts through the TypeScript core API.
 *
 * Removal is rejected by core append-only semantics; the adapter only
 * constructs the supplied history and reports the post-failure observation.
 */
function executeAuditRemove(request: AdapterRequest): NormalizedResult {
  const input = inputAuditHistory(request.input)
  let log: AuditLog | undefined
  try {
    log = AuditLog.create(input.history as readonly unknown[])
    log.remove()
    throw new Error('Unreachable Audit remove success')
  } catch (error) {
    const result = normalizeThrown(error)
    if (result.status === 'error' && log !== undefined) {
      return { ...result, observations: { history: log.events() } }
    }
    return result
  }
}

/**
 * Operation handlers supported by the first TypeScript conformance adapter.
 *
 * Public Money domain operations use canonical Agentic Contract identifiers.
 * `money.deserialize` and `money.serialize` remain conformance-local
 * representation boundary checks rather than public FinKore operations.
 *
 * @see MONEY-SERIALIZATION-001
 */
export const operationHandlers = {
  'finkore.money.add': executeMoneyAdd,
  'finkore.money.compare': executeMoneyCompare,
  'finkore.money.round': executeMoneyRound,
  'finkore.money.subtract': executeMoneySubtract,
  'money.deserialize': executeMoneySerialization,
  'finkore.money.divide': executeMoneyDivide,
  'finkore.money.multiply': executeMoneyMultiply,
  'finkore.money.negate': executeMoneyNegate,
  'finkore.workflow.transition': executeWorkflowTransition,
  'finkore.audit.append': executeAuditAppend,
  'finkore.audit.replace': executeAuditReplace,
  'finkore.audit.remove': executeAuditRemove,
  'audit.redact': executeAuditRedact,
  'money.serialize': executeMoneySerialization,
  'workflow.create': executeWorkflowCreate,
} satisfies Readonly<Record<string, OperationHandler>>

/**
 * Operation IDs currently supported by the TypeScript conformance adapter.
 */
export type SupportedOperationId = keyof typeof operationHandlers
