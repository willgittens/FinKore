// SPDX-License-Identifier: MPL-2.0
/** Tests repository license notices and scholarly metadata without financial execution. */
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

const script = new URL('../check-license.js', import.meta.url).pathname
const samples = JSON.parse(readFileSync(new URL('./fixtures/license-negative.json', import.meta.url), 'utf8'))
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'finkore-license-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  writeFileSync(join(root, 'LICENSE'), readFileSync(new URL('../../../LICENSE', import.meta.url)))
  writeFileSync(join(root, 'package.json'), JSON.stringify({ license: 'MPL-2.0' }))
  writeFileSync(join(root, 'package-lock.json'), JSON.stringify({ packages: { '': { license: 'MPL-2.0' } } }))
  return root
}
const run = root => {
  const result = spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8' })
  if (result.error) throw result.error
  return result
}

test('license checking accepts institution names and historical diagnostics while rejecting incompatible notices', t => {
  const root = fixture(t)
  for (const content of samples.valid) {
    writeFileSync(join(root, 'metadata.json'), JSON.stringify({ affiliation: content }))
    const result = run(root)
    assert.equal(result.status, 0, result.stderr)
  }
  for (const content of samples.invalid) {
    writeFileSync(join(root, 'metadata.json'), content)
    const result = run(root)
    assert.equal(result.status, 1, content)
    assert.match(result.stderr, /unexpected.*license declaration/)
  }
})

test('license checking still rejects incorrect package metadata, source headers and license files', t => {
  const root = fixture(t)
  writeFileSync(join(root, 'package.json'), JSON.stringify({ license: 'BSD-3-Clause' }))
  assert.match(run(root).stderr, /package.json must declare/)
  writeFileSync(join(root, 'package.json'), JSON.stringify({ license: 'MPL-2.0' }))
  writeFileSync(join(root, 'source.js'), 'export const value = 1\n')
  assert.match(run(root).stderr, /missing SPDX/)
  rmSync(join(root, 'source.js'))
  writeFileSync(join(root, 'LICENSE'), 'An incompatible replacement.\n')
  assert.match(run(root).stderr, /LICENSE must contain the official/)
})

test('upstream inventory filename metadata does not hide incompatible notices or license fields', t => {
  const root = fixture(t)
  const folder = join(root, 'experts/code-evidence/inventories/CE-REPO-9001')
  mkdirSync(folder, { recursive: true })
  const path = join(folder, 'CE-EDITION-9001.json')
  const data = { source_files: [], other_files: [[samples.upstreamLicenseFilename, 'regular', 100]] }
  writeFileSync(path, JSON.stringify(data))
  assert.equal(run(root).status, 0)
  for (const extra of [{ classification: samples.invalid[0] }, { license: samples.incompatibleLicenseIdentifier },
    { notice: samples.upstreamLicenseFilename }]) {
    writeFileSync(path, JSON.stringify({ ...data, ...extra }))
    const result = run(root)
    assert.equal(result.status, 1)
    assert.match(result.stderr, /unexpected.*license declaration/)
  }
  writeFileSync(path, samples.invalid[0])
  assert.equal(run(root).status, 1, 'Malformed inventory text is not exempt from notice checks')
  writeFileSync(path, JSON.stringify(data))
  writeFileSync(join(root, 'unrelated-metadata.json'), JSON.stringify(data))
  assert.equal(run(root).status, 1, 'Unrelated JSON does not acquire the inventory filename rule')
})
