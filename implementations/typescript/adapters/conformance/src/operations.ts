import { Money } from '@finflow/typescript'
import type { AdapterRequest, NormalizedResult } from '@finflow/conformance-runner'
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
 * Executes Money negation through the TypeScript core API.
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
 * Executes Money scalar multiplication through the TypeScript core API.
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
 * Executes Money scalar division through the TypeScript core API.
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
 * Operation handlers supported by the first TypeScript conformance adapter.
 *
 * These are conformance-local operation identifiers from the vector catalog,
 * not new Agentic Contract operation IDs. Future `finflow.money.*` support must
 * be added only when the corresponding TypeScript domain behavior exists.
 *
 * @see MONEY-SERIALIZATION-001
 */
export const operationHandlers = {
  'finflow.money.add': executeMoneyAdd,
  'finflow.money.compare': executeMoneyCompare,
  'finflow.money.round': executeMoneyRound,
  'finflow.money.subtract': executeMoneySubtract,
  'money.deserialize': executeMoneySerialization,
  'money.divide': executeMoneyDivide,
  'money.multiply': executeMoneyMultiply,
  'money.negate': executeMoneyNegate,
  'money.serialize': executeMoneySerialization,
} satisfies Readonly<Record<string, OperationHandler>>

/**
 * Operation IDs currently supported by the TypeScript conformance adapter.
 */
export type SupportedOperationId = keyof typeof operationHandlers
