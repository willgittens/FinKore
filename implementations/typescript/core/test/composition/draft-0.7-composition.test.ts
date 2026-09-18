// SPDX-License-Identifier: MPL-2.0
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { runScenario } from '../../../examples/composition/draft-0.7/profiles.js'

type Scenario = {
  readonly id: string
  readonly expectedObservation: Readonly<Record<string, unknown>>
}

const fixture = JSON.parse(readFileSync(resolve(process.cwd(), '../../../examples/composition/draft-0.7/scenarios.json'), 'utf8')) as {
  readonly scenarios: readonly Scenario[]
}

describe('Draft 0.7 TypeScript composition profiles', () => {
  for (const scenario of fixture.scenarios) {
    it(`matches ${scenario.id}`, () => {
      expect(runScenario(scenario.id)).toMatchObject(scenario.expectedObservation)
    })
  }
})
