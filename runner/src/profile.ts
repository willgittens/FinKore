// SPDX-License-Identifier: MPL-2.0
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { RunnerInfrastructureError } from './errors/runner-errors.js'
import type { ConformanceManifest } from './manifest.js'
import type { LoadedVector } from './types/vector.js'

export interface ProfileSelection {
  readonly suites?: readonly string[]
  readonly operationId?: string
}

export interface ConformanceProfile {
  readonly id: string
  readonly kind: 'full' | 'domain' | 'operation' | 'historical'
  readonly coreVersion: string
  readonly selection: ProfileSelection
  readonly capabilityFloor?: string
}

export interface ProfileCatalog {
  readonly finkoreProfiles: '0.1'
  readonly profiles: readonly ConformanceProfile[]
}

export interface ResolvedProfile {
  readonly profile: ConformanceProfile
  readonly vectorIds: readonly string[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function invalid(message: string, source: string): never {
  throw new RunnerInfrastructureError('METADATA', message, source)
}

function stringArray(value: unknown, field: string, source: string): readonly string[] | undefined {
  if (value === undefined) return undefined
  if (!Array.isArray(value) || value.length === 0 || value.some((entry) => typeof entry !== 'string' || entry.length === 0)) {
    invalid(`${field} must be a non-empty string array`, source)
  }
  if (new Set(value).size !== value.length) invalid(`${field} must not contain duplicates`, source)
  return value as string[]
}

export function validateProfileCatalog(value: unknown, source = 'profiles'): ProfileCatalog {
  if (!isRecord(value)) invalid('Profile catalog must be an object', source)
  if (value.finkoreProfiles !== '0.1') invalid('Unsupported or missing finkoreProfiles version', source)
  if (!Array.isArray(value.profiles) || value.profiles.length === 0) invalid('Profile catalog must contain profiles', source)
  const seen = new Set<string>()
  const profiles = value.profiles.map((candidate, index) => {
    const profileSource = `${source}#profiles[${index}]`
    if (!isRecord(candidate)) invalid('Profile must be an object', profileSource)
    const { id, kind, coreVersion, selection, capabilityFloor } = candidate
    if (typeof id !== 'string' || !/^finkore\.core\.[a-z0-9_.]+$/.test(id)) invalid('Profile has invalid id', profileSource)
    if (seen.has(id)) invalid(`Duplicate profile id ${id}`, profileSource)
    seen.add(id)
    if (!['full', 'domain', 'operation', 'historical'].includes(String(kind))) invalid(`Profile ${id} has invalid kind`, profileSource)
    if (typeof coreVersion !== 'string' || coreVersion.length === 0) invalid(`Profile ${id} has invalid coreVersion`, profileSource)
    if (!isRecord(selection)) invalid(`Profile ${id} selection must be an object`, profileSource)
    const suites = stringArray(selection.suites, `Profile ${id} selection.suites`, profileSource)
    const operationId = selection.operationId
    if (operationId !== undefined && (typeof operationId !== 'string' || !operationId.startsWith('finkore.'))) {
      invalid(`Profile ${id} selection.operationId must be a canonical operation id`, profileSource)
    }
    if (suites === undefined && operationId === undefined) invalid(`Profile ${id} selection must select suites or operationId`, profileSource)
    if (suites !== undefined && operationId !== undefined) invalid(`Profile ${id} selection must not mix suites and operationId`, profileSource)
    if (capabilityFloor !== undefined && typeof capabilityFloor !== 'string') invalid(`Profile ${id} capabilityFloor must be a string`, profileSource)
    const selectionValue: ProfileSelection = operationId === undefined ? { suites: suites as readonly string[] } : { operationId }
    return {
      id,
      kind: kind as ConformanceProfile['kind'],
      coreVersion,
      selection: selectionValue,
      ...(capabilityFloor === undefined ? {} : { capabilityFloor }),
    }
  })
  return { finkoreProfiles: '0.1', profiles }
}

export async function loadProfileCatalog(path: string): Promise<ProfileCatalog> {
  const absolute = resolve(path)
  try {
    return validateProfileCatalog(JSON.parse(await readFile(absolute, 'utf8')) as unknown, absolute)
  } catch (error) {
    if (error instanceof RunnerInfrastructureError) throw error
    throw new RunnerInfrastructureError('METADATA', `Cannot read valid profile metadata from ${absolute}`, absolute, error)
  }
}

export function resolveProfile(
  catalog: ProfileCatalog,
  profileId: string,
  manifest: ConformanceManifest,
  vectors: readonly LoadedVector[],
): ResolvedProfile {
  const profile = catalog.profiles.find((entry) => entry.id === profileId)
  if (profile === undefined) throw new RunnerInfrastructureError('METADATA', `Unknown profile id ${profileId}`, profileId)
  const suiteIds = new Set(manifest.suites.map((suite) => suite.id))
  const suites = profile.selection.suites
  const selected = suites === undefined
    ? vectors.filter((vector) => vector.operation === profile.selection.operationId)
    : vectors.filter((vector) => {
      for (const suite of suites) {
        if (!suiteIds.has(suite)) throw new RunnerInfrastructureError('METADATA', `Profile ${profile.id} references unknown suite ${suite}`, profile.id)
      }
      return suites.includes(vector.suiteId)
    })
  if (selected.length === 0) throw new RunnerInfrastructureError('METADATA', `Profile ${profile.id} selects no vectors`, profile.id)
  return { profile, vectorIds: selected.map((vector) => vector.id).sort((left, right) => left.localeCompare(right, 'en')) }
}
