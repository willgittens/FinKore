// SPDX-License-Identifier: MPL-2.0
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { delimiter, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const repositoryRoot = process.cwd()
const jsonMode = process.argv.includes('--json')

function run(command, args, options = {}) {
  const child = spawnSync(command, args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    ...options,
  })
  if (child.error !== undefined) throw child.error
  if (child.status !== 0) {
    process.stderr.write(child.stdout)
    process.stderr.write(child.stderr)
    process.exit(child.status ?? 1)
  }
  return child.stdout
}

function parseJson(label, text) {
  try {
    return JSON.parse(text)
  } catch (error) {
    throw new Error(`${label} did not emit valid JSON: ${error.message}\n${text}`)
  }
}

function sorted(value) {
  if (Array.isArray(value)) return value.map(sorted)
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, sorted(item)]),
    )
  }
  return value
}

function canonical(value) {
  return JSON.stringify(sorted(value))
}

function assertScenarioIds(language, payload, expectedIds) {
  const ids = payload.results.map((result) => result.scenarioId)
  const actual = canonical(ids)
  const expected = canonical(expectedIds)
  if (actual !== expected) {
    throw new Error(`${language} emitted unexpected scenario ids\nexpected ${expected}\nactual   ${actual}`)
  }
}

function typeScriptResults() {
  const outDir = mkdtempSync(resolve(tmpdir(), 'finkore-draft07-ts-'))
  run(resolve(repositoryRoot, 'node_modules/.bin/tsc'), [
    '-p',
    'implementations/typescript/examples/composition/draft-0.7/tsconfig.json',
    '--noEmit',
    'false',
    '--outDir',
    outDir,
    '--declaration',
    'false',
    '--sourceMap',
    'false',
  ])
  return parseJson(
    'TypeScript Draft 0.7 composition runner',
    run(process.execPath, [resolve(outDir, 'examples/composition/draft-0.7/emit-results.js')]),
  )
}

function pythonResults() {
  return parseJson(
    'Python Draft 0.7 composition runner',
    run(resolve(repositoryRoot, '.tools/bin/python3.12'), ['implementations/python/examples/composition/draft-0.7/profiles.py'], {
      env: { ...process.env, PYTHONPATH: resolve(repositoryRoot, 'implementations/python/core/src') },
    }),
  )
}

function javaResults() {
  run(process.execPath, ['scripts/compile-java.js'])
  const classpath = [
    resolve(repositoryRoot, 'implementations/java/target/classes'),
    resolve(repositoryRoot, 'implementations/java/target/test-classes'),
  ].join(delimiter)
  const java = resolve(repositoryRoot, '.tools/bin/java')
  return parseJson(
    'Java Draft 0.7 composition runner',
    run(java, ['-cp', classpath, 'org.finkore.examples.composition.draft_0_7.CompositionProfilesCli']),
  )
}

const fixture = parseJson(
  'Draft 0.7 composition fixture',
  readFileSync(resolve(repositoryRoot, 'examples/composition/draft-0.7/scenarios.json'), 'utf8'),
)
const expectedIds = fixture.scenarios.map((scenario) => scenario.id)

const results = {
  typescript: typeScriptResults(),
  python: pythonResults(),
  java: javaResults(),
}

for (const [language, payload] of Object.entries(results)) {
  assertScenarioIds(language, payload, expectedIds)
}

const canonicalTypeScript = canonical(results.typescript.results)
for (const language of ['python', 'java']) {
  const actual = canonical(results[language].results)
  if (actual !== canonicalTypeScript) {
    throw new Error(`Draft 0.7 composition results differ between TypeScript and ${language}`)
  }
}

if (jsonMode) {
  process.stdout.write(JSON.stringify({ scenarioCount: expectedIds.length, languages: Object.keys(results), results: Object.fromEntries(Object.entries(results).map(([language, payload]) => [language, payload.results])) }))
  process.stdout.write('\n')
} else {
  process.stdout.write(`Draft 0.7 composition comparison passed: ${expectedIds.length} scenarios matched across TypeScript, Python, and Java.\n`)
}
