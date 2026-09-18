#!/usr/bin/env node
// SPDX-License-Identifier: MPL-2.0
import { spawnSync } from 'node:child_process'

const steps = [
  ['npm', ['run', 'tools:check:draft0.5']],
  ['npm', ['run', 'baseline:draft0.6']],
  ['npm', ['run', 'build']],
  ['npm', ['run', 'typecheck']],
  ['npm', ['test']],
  ['npm', ['run', 'python:compile']],
  ['npm', ['run', 'python:unit']],
  ['npm', ['run', 'python:adapter:test']],
  ['npm', ['run', 'java:test']],
  ['npm', ['run', 'java:adapter:test']],
  ['npm', ['run', 'conformance:typescript:profile:full']],
  ['npm', ['run', 'conformance:python:profile:full']],
  ['npm', ['run', 'conformance:java:profile:full']],
  ['npm', ['run', 'composition:test:draft0.7']],
  ['npm', ['run', 'composition:compare:draft0.7']],
  ['npm', ['run', 'composition:critical:draft0.7']],
  ['npm', ['run', 'composition:mutation:critical:draft0.7']],
  ['npm', ['run', 'test:coverage', '-w', '@finkore/conformance-runner']],
  ['npm', ['run', 'test:coverage', '-w', '@finkore/typescript']],
  ['npm', ['run', 'python:coverage']],
  ['npm', ['run', 'java:coverage']],
  ['npm', ['run', 'mutation:critical']],
  ['npm', ['run', 'portability:draft0.5']],
  ['npm', ['run', 'research:boundaries:draft0.6']],
  ['npm', ['run', 'architecture:check']],
  ['npm', ['run', 'docs:check']],
  ['npm', ['run', 'license:check']],
  ['git', ['diff', '--check']],
  ['git', ['diff', '--quiet']],
  ['git', ['diff', '--cached', '--quiet']],
]

for (const [command, args] of steps) {
  console.log(`\n$ ${[command, ...args].join(' ')}`)
  const result = spawnSync(command, args, { stdio: 'inherit' })
  if (result.error !== undefined) {
    console.error(result.error.message)
    process.exit(1)
  }
  if (result.status !== 0) process.exit(result.status ?? 1)
}

console.log('\nDraft 0.7 closure verification passed.')
