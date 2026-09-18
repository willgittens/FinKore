// SPDX-License-Identifier: MPL-2.0
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { runScenarios } from './profiles.js'

const fixture = JSON.parse(readFileSync(resolve(process.cwd(), 'examples/composition/draft-0.7/scenarios.json'), 'utf8')) as {
  readonly scenarios: readonly { readonly id: string }[]
}

process.stdout.write(JSON.stringify({ language: 'typescript', results: runScenarios(fixture.scenarios.map((scenario) => scenario.id)) }))
process.stdout.write('\n')
