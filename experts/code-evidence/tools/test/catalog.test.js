// SPDX-License-Identifier: MPL-2.0
/** Tests discovery metadata safeguards; does not define or execute financial behavior. */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { renderCatalog, validateCatalog } from '../catalog.js'

const seed = JSON.parse(readFileSync(new URL('../../repositories.json', import.meta.url), 'utf8'))
const fixture = () => structuredClone(seed)

test('accepts verified discovery metadata and preserves unknown attribution and licenses', () => {
  const data = fixture()
  data.repositories[0].authors = { names: null, source_url: null }
  data.repositories[0].upstream_license.reported_spdx_id = null
  assert.equal(validateCatalog(data), data)
  assert.equal(validateCatalog(seed), seed)
})

test('rejects duplicate stable identifiers, including editions in different repositories', () => {
  const data = fixture()
  data.repositories[1].editions[0].id = data.repositories[0].editions[0].id
  assert.throws(() => validateCatalog(data), /Duplicate ID/)
  data.repositories[1].editions[0].id = seed.repositories[1].editions[0].id
  data.repositories[1].id = data.repositories[0].id
  assert.throws(() => validateCatalog(data), /Duplicate ID/)
})

test('rejects renamed duplicates that retain the same GitHub numeric identity', () => {
  const data = fixture()
  data.repositories[1].github_id = data.repositories[0].github_id
  assert.throws(() => validateCatalog(data), /Duplicate GitHub repository ID/)
})

test('rejects mutable, shortened and cross-repository source pins', () => {
  const data = fixture()
  data.repositories[0].editions[0].tree_url = `${data.repositories[0].url}/tree/main`
  assert.throws(() => validateCatalog(data), /source must be pinned/)
  data.repositories[0].editions[0] = structuredClone(seed.repositories[0].editions[0])
  data.repositories[0].editions[0].commit_sha = 'abcdef0'
  assert.throws(() => validateCatalog(data), /Catalog schema failed/)
  data.repositories[0].editions[0] = structuredClone(seed.repositories[0].editions[0])
  data.repositories[0].editions[0].readme.url = seed.repositories[1].editions[0].readme.url
  assert.throws(() => validateCatalog(data), /source must be pinned/)
})

test('rejects version or release attribution borrowed from another source', () => {
  const data = fixture()
  data.repositories[0].editions[0].commit_source_url = seed.repositories[1].editions[0].commit_source_url
  assert.throws(() => validateCatalog(data), /commit resolution source mismatch/)
  data.repositories[0].editions[0] = structuredClone(seed.repositories[0].editions[0])
  data.repositories[0].editions[0].release_url = seed.repositories[1].editions[0].release_url
  assert.throws(() => validateCatalog(data), /release attribution mismatch/)
})

test('rejects owner misattribution and authors without inspected attribution', () => {
  const data = fixture()
  data.repositories[0].owner.login = 'unrelated-owner'
  assert.throws(() => validateCatalog(data), /owner attribution mismatch/)
  data.repositories[0].owner = structuredClone(seed.repositories[0].owner)
  data.repositories[0].authors = { names: ['Unverified author'], source_url: null }
  assert.throws(() => validateCatalog(data), /Catalog schema failed/)
  data.repositories[0].authors.source_url = seed.repositories[1].editions[0].readme.url
  assert.throws(() => validateCatalog(data), /authors need a pinned inspected attribution source/)
})

test('keeps tag selection distinct from GitHub release publication', () => {
  const data = fixture()
  const edition = data.repositories.find((repo) => repo.editions[0].ref_type === 'tag').editions[0]
  edition.release_published_at = '2026-01-01T00:00:00Z'
  assert.throws(() => validateCatalog(data), /Catalog schema failed/)
  edition.release_published_at = null
  edition.selection_source_url = seed.repositories[0].editions[0].selection_source_url
  assert.throws(() => validateCatalog(data), /version selection source mismatch/)
})

test('rejects promoting discovery into completed analysis or normative acceptance', () => {
  const data = fixture()
  data.repositories[0].editions[0].analysis_status = 'fully_reviewed'
  assert.throws(() => validateCatalog(data), /Catalog schema failed/)
  data.repositories[0].editions[0].analysis_status = 'not_started'
  data.normative = true
  assert.throws(() => validateCatalog(data), /Catalog schema failed/)
})

test('rejects future observations relative to the recorded catalog date', () => {
  const data = fixture()
  data.repositories[0].observed_on = '2099-01-01'
  assert.throws(() => validateCatalog(data), /observation is later than catalog date/)
})

test('escapes upstream text that could break the generated table or introduce HTML', () => {
  const data = fixture()
  data.repositories[0].name = 'Example | [claim]\n<img src=x>'
  const rendered = renderCatalog(data)
  assert.ok(!rendered.includes('<img src=x>'))
  assert.ok(rendered.includes('Example &#124; &#91;claim&#93; &lt;img src=x&gt;'))
})
