// SPDX-License-Identifier: MPL-2.0
// Checks declared local probe anchors without executing mutations or domain logic.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { runInNewContext } from 'node:vm'

const root = resolve(import.meta.dirname, '../../..')
const source = readFileSync(resolve(root, 'docs/tools/mutation-critical.js'), 'utf8')
const declarations = source.slice(source.indexOf('const pythonMutants = ['), source.indexOf('\nfunction files('))
const targets = runInNewContext(`${declarations};\n({ python: pythonMutants, java: javaMutants })`)

for (const [language, probes] of Object.entries(targets)) {
  for (const probe of probes) test(`critical mutation anchor is unique: ${probe.id}`, () => {
    const implementation = readFileSync(resolve(root, 'implementations', language, probe.path), 'utf8')
    assert.equal(implementation.split(probe.from).length - 1, 1)
    assert.notEqual(probe.from, probe.to)
  })
}

const nativeSource = readFileSync(resolve(root, 'docs/tools/mutation-native.js'), 'utf8')
const nativeDeclarations = nativeSource.slice(nativeSource.indexOf("const py = "), nativeSource.indexOf('\nfunction run('))
const nativeProbes = runInNewContext(`${nativeDeclarations};\nprobes`)
const nativeRoots = {
  typescript: 'implementations/typescript/core',
  python: 'implementations/python/core/src/finkore',
  java: 'implementations/java/core/src/main/java/org/finkore',
}
for (const probe of nativeProbes) test(`native mutation anchor is unique: ${probe.id}`, () => {
  const implementation = readFileSync(resolve(root, nativeRoots[probe.language], probe.path), 'utf8')
  assert.equal(implementation.split(probe.from).length - 1, 1)
  assert.notEqual(probe.from, probe.to)
})
