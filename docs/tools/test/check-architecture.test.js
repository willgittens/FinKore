// SPDX-License-Identifier: MPL-2.0
/** Tests repository-boundary validation without defining or executing financial behavior. */
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { validateRepositoryArchitecture } from '../check-architecture.js'

const toolHeader = `// SPDX-License-Identifier: MPL-2.0
/**
 * Fixture developer tool.
 * This developer tool reads files without changing them and does not define financial behavior.
 */
`

function fixture(packageJson = {}) {
  const root = mkdtempSync(join(tmpdir(), 'finkore-architecture-'))
  mkdirSync(join(root, 'docs/tools'), { recursive: true })
  writeFileSync(join(root, 'docs/tools/check.js'), toolHeader)
  writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'fixture', scripts: {}, ...packageJson }))
  return root
}

test('accepts specification-only structure and documented local tools', () => {
  assert.deepEqual(validateRepositoryArchitecture(fixture()), { toolCount: 1 })
})

test('rejects removed roots, workspace/package references, and hosted workflows', () => {
  const root = fixture({
    workspaces: ['runner'],
    scripts: { old: 'node runner/cli.js' },
    dependencies: { '@finkore/conformance-runner': '1.0.0' },
  })
  mkdirSync(join(root, 'runner'))
  mkdirSync(join(root, '.github/workflows'), { recursive: true })
  writeFileSync(join(root, '.github/workflows/check.yml'), 'name: forbidden')
  assert.throws(() => validateRepositoryArchitecture(root), (error) => {
    assert.match(error.message, /removed repository root/)
    assert.match(error.message, /workspaces/)
    assert.match(error.message, /package script/)
    assert.match(error.message, /removed maintained package/)
    assert.match(error.message, /GitHub Actions/)
    return true
  })
})

test('rejects executable tools without purpose, effects, and boundary headers', () => {
  const root = fixture()
  writeFileSync(join(root, 'docs/tools/check.js'), '// SPDX-License-Identifier: MPL-2.0\nconsole.log("unchecked")\n')
  assert.throws(() => validateRepositoryArchitecture(root), /required executable-tool header/)
})
