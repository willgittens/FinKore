// SPDX-License-Identifier: MPL-2.0
import { readFileSync } from 'node:fs'

const path = 'examples/composition/draft-0.7/scenarios.json'
const allowedProfiles = new Set(['expense-approval', 'invoice-correction'])
const allowedAuthority = new Set(['CORE', 'PROFILE', 'OBSERVATION'])
const allowedStatuses = new Set(['success', 'error', 'profile-error'])
const canonicalOperations = new Set([
  'finkore.money.add',
  'finkore.money.subtract',
  'finkore.money.negate',
  'finkore.money.multiply',
  'finkore.money.divide',
  'finkore.money.compare',
  'finkore.money.round',
  'finkore.money.applyrate',
  'finkore.money.allocate',
  'finkore.workflow.transition',
  'finkore.audit.append',
  'finkore.audit.replace',
  'finkore.audit.remove',
  'finkore.entity.evolution.correct',
  'finkore.entity.evolution.reverse',
  'finkore.entity.evolution.void',
  'finkore.entity.evolution.supersede',
])
const profileLocalCodes = new Set(['D07_PROFILE_APPROVAL_NOT_CURRENT', 'D07_PROFILE_POLICY_INVALID'])

function fail(message) {
  throw new Error(`Draft 0.7 composition fixture check failed: ${message}`)
}

function assertObject(value, label) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) fail(`${label} must be an object`)
}

function assertString(value, label) {
  if (typeof value !== 'string' || value.length === 0) fail(`${label} must be a non-empty string`)
}

const fixture = JSON.parse(readFileSync(path, 'utf8'))
assertObject(fixture, 'fixture')

if (fixture.finkoreCompositionScenarios !== '0.1') fail('unsupported finkoreCompositionScenarios')
if (fixture.normative !== false) fail('fixture must be explicitly non-normative')
if (fixture.implementationStatus !== 'pending') fail('Milestone B fixtures must remain pending until scenario runners exist')
if (!Array.isArray(fixture.scenarios) || fixture.scenarios.length === 0) fail('scenarios must be non-empty')
if (fixture.scenarioCount !== fixture.scenarios.length) fail('scenarioCount must match scenarios length')
if (!Array.isArray(fixture.authority) || fixture.authority.some((entry) => typeof entry !== 'string')) {
  fail('authority must list documentation paths')
}

const ids = new Set()
for (const [index, scenario] of fixture.scenarios.entries()) {
  assertObject(scenario, `scenario ${index}`)
  assertString(scenario.id, `scenario ${index}.id`)
  if (!/^D07-(EXP|INV)-\d{3}$/.test(scenario.id)) fail(`${scenario.id} has invalid scenario id format`)
  if (ids.has(scenario.id)) fail(`${scenario.id} is duplicated`)
  ids.add(scenario.id)

  if (!allowedProfiles.has(scenario.profile)) fail(`${scenario.id} has unknown profile ${scenario.profile}`)
  assertString(scenario.title, `${scenario.id}.title`)
  assertString(scenario.actionBoundary, `${scenario.id}.actionBoundary`)

  if (!Array.isArray(scenario.authority) || scenario.authority.length === 0) fail(`${scenario.id} authority must be non-empty`)
  for (const authority of scenario.authority) {
    if (!allowedAuthority.has(authority)) fail(`${scenario.id} has invalid authority ${authority}`)
  }

  if (!Array.isArray(scenario.coreOperations)) fail(`${scenario.id} coreOperations must be an array`)
  for (const operation of scenario.coreOperations) {
    if (!canonicalOperations.has(operation)) fail(`${scenario.id} references non-canonical operation ${operation}`)
  }

  assertObject(scenario.expectedObservation, `${scenario.id}.expectedObservation`)
  const status = scenario.expectedObservation.status
  if (!allowedStatuses.has(status)) fail(`${scenario.id} has invalid expectedObservation.status`)

  const code = scenario.expectedObservation.code
  if (status === 'error') {
    assertString(code, `${scenario.id}.expectedObservation.code`)
    if (!/^FINKORE_[A-Z]+(?:_[A-Z]+)+$/.test(code)) fail(`${scenario.id} error code must be portable`)
  } else if (status === 'profile-error') {
    assertString(code, `${scenario.id}.expectedObservation.code`)
    if (!profileLocalCodes.has(code)) fail(`${scenario.id} profile error code is not declared`)
  } else if (code !== undefined) {
    fail(`${scenario.id} success observation must not include an error code`)
  }

  if (scenario.implementationStatus !== 'pending') fail(`${scenario.id} must remain pending until Milestone C`)
}

process.stdout.write(`Draft 0.7 composition fixture check passed: ${fixture.scenarios.length} scenarios.\n`)
