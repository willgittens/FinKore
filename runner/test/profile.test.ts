// SPDX-License-Identifier: MPL-2.0
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { loadConformance } from '../src/loader.js'
import { loadProfileCatalog, resolveProfile, validateProfileCatalog } from '../src/profile.js'
import { createFixtureConformance, profileCatalog } from './helpers.js'

describe('profile metadata', () => {
  it('validates the Draft 0.6 profile format', () => {
    expect(validateProfileCatalog(profileCatalog).profiles[0]?.id).toBe('finkore.core.draft0_6.domain.money')
  })

  it('rejects unknown profile format versions', () => {
    expect(() => validateProfileCatalog({ ...profileCatalog, finkoreProfiles: '0.2' })).toThrow('Unsupported')
  })

  it('rejects duplicate profile identifiers', () => {
    expect(() => validateProfileCatalog({
      finkoreProfiles: '0.1',
      profiles: [profileCatalog.profiles[0], profileCatalog.profiles[0]],
    })).toThrow('Duplicate profile')
  })

  it('rejects malformed profile selections', () => {
    expect(() => validateProfileCatalog({
      finkoreProfiles: '0.1',
      profiles: ['nope'],
    })).toThrow('Profile must be an object')
    expect(() => validateProfileCatalog({
      finkoreProfiles: '0.1',
      profiles: [{ ...profileCatalog.profiles[0], id: 'money' }],
    })).toThrow('invalid id')
    expect(() => validateProfileCatalog({
      finkoreProfiles: '0.1',
      profiles: [{ ...profileCatalog.profiles[0], kind: 'partial' }],
    })).toThrow('invalid kind')
    expect(() => validateProfileCatalog({
      finkoreProfiles: '0.1',
      profiles: [{ ...profileCatalog.profiles[0], coreVersion: '' }],
    })).toThrow('invalid coreVersion')
    expect(() => validateProfileCatalog({
      finkoreProfiles: '0.1',
      profiles: [{ ...profileCatalog.profiles[0], selection: null }],
    })).toThrow('selection must be an object')
    expect(() => validateProfileCatalog({
      finkoreProfiles: '0.1',
      profiles: [{ ...profileCatalog.profiles[0], selection: { suites: [] } }],
    })).toThrow('non-empty string array')
    expect(() => validateProfileCatalog({
      finkoreProfiles: '0.1',
      profiles: [{ ...profileCatalog.profiles[0], selection: { operationId: 'money.add' } }],
    })).toThrow('canonical operation id')
    expect(() => validateProfileCatalog({
      finkoreProfiles: '0.1',
      profiles: [{ ...profileCatalog.profiles[0], selection: { suites: ['money'], operationId: 'finkore.money.add' } }],
    })).toThrow('must not mix')
    expect(() => validateProfileCatalog({
      finkoreProfiles: '0.1',
      profiles: [{ ...profileCatalog.profiles[0], capabilityFloor: 42 }],
    })).toThrow('capabilityFloor')
  })

  it('loads valid profile metadata and rejects unreadable metadata', async () => {
    const root = await mkdtemp(join(tmpdir(), 'finkore-profile-'))
    const valid = join(root, 'profiles.json')
    const invalid = join(root, 'invalid.json')
    const unsupported = join(root, 'unsupported.json')
    await writeFile(valid, JSON.stringify(profileCatalog))
    await writeFile(invalid, '{')
    await writeFile(unsupported, JSON.stringify({ ...profileCatalog, finkoreProfiles: '0.2' }))

    await expect(loadProfileCatalog(valid)).resolves.toMatchObject({ finkoreProfiles: '0.1' })
    await expect(loadProfileCatalog(invalid)).rejects.toThrow('Cannot read valid profile metadata')
    await expect(loadProfileCatalog(unsupported)).rejects.toThrow('Unsupported')
  })

  it('resolves operation profiles and rejects unknown or empty selections', async () => {
    const fixture = await createFixtureConformance()
    const loaded = await loadConformance(fixture.manifestPath)
    const operationCatalog = validateProfileCatalog({
      finkoreProfiles: '0.1',
      profiles: [
        {
          id: 'finkore.core.draft0_6.operation.finkore.money.add',
          kind: 'operation',
          coreVersion: 'draft-0.6',
          selection: { operationId: 'finkore.money.add' },
        },
        {
          id: 'finkore.core.draft0_6.domain.audit',
          kind: 'domain',
          coreVersion: 'draft-0.6',
          selection: { suites: ['audit'] },
        },
        {
          id: 'finkore.core.draft0_6.operation.finkore.money.round',
          kind: 'operation',
          coreVersion: 'draft-0.6',
          selection: { operationId: 'finkore.money.round' },
        },
      ],
    })

    expect(resolveProfile(operationCatalog, 'finkore.core.draft0_6.operation.finkore.money.add', loaded.manifest, loaded.vectors).vectorIds).toEqual([
      'money.add.basic-001',
    ])
    expect(() => resolveProfile(operationCatalog, 'finkore.core.draft0_6.domain.audit', loaded.manifest, loaded.vectors)).toThrow('unknown suite audit')
    expect(() => resolveProfile(operationCatalog, 'finkore.core.draft0_6.operation.finkore.money.round', loaded.manifest, loaded.vectors)).toThrow('selects no vectors')
  })
})
