// SPDX-License-Identifier: MPL-2.0
/** Tests documentation reference validation without defining or executing financial behavior. */
import assert from 'node:assert/strict'
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import test from 'node:test'
import { runDocumentationCli } from '../check-doc-links.js'

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'finkore-doc-links-'))
  for (const directory of ['.github', 'spec', 'conformance', 'agentic', 'docs', 'learn', 'legacy']) {
    cpSync(resolve(directory), join(root, directory), { recursive: true })
  }
  for (const file of ['AGENTS.md', 'CONTRIBUTING.md', 'LICENSE', 'LICENSING.md', 'NOTICE.md', 'README.md', 'SECURITY.md', 'THIRD_PARTY_LICENSES.md', 'TRADEMARKS.md']) {
    cpSync(resolve(file), join(root, file))
  }
  return root
}

function run(root) {
  const stdout = []
  const stderr = []
  const status = runDocumentationCli(root, { log: (message) => stdout.push(message), error: (message) => stderr.push(message) })
  return { status, stdout: stdout.join('\n'), stderr: stderr.join('\n') }
}

function linkFixture(t) {
  const directory = mkdtempSync(join(tmpdir(), 'finkore-link-boundary-'))
  const root = join(directory, 'repo')
  mkdirSync(join(root, 'spec'), { recursive: true })
  mkdirSync(join(root, 'docs/coreDoc'), { recursive: true })
  writeFileSync(join(root, 'docs/coreDoc/core-doc.md'), '# Foundation\n')
  mkdirSync(join(directory, 'repo-sibling'))
  mkdirSync(join(directory, 'outside'))
  for (const folder of ['repo-sibling', 'outside']) {
    writeFileSync(join(directory, folder, 'note.md'), '# Outside control\n')
  }
  t.after(() => rmSync(directory, { recursive: true, force: true }))
  return { root, directory, source: join(root, 'README.md') }
}

function referenceFixture(t) {
  const fixture = linkFixture(t)
  writeFileSync(join(fixture.root, 'spec/rules.md'), [
    '# Synthetic normative definitions',
    ...[1, 2, 3, 5].map(value => `- **MONEY-ARITHMETIC-${String(value).padStart(3, '0')}** — The artifact MUST retain its label.`),
    '- **WORKFLOW-GUARD-001** — The artifact SHOULD retain its label.',
    '- **WORKFLOW-GUARD-002** — The artifact MAY retain its label.',
  ].join('\n'))
  return fixture
}

test('CLI rejects undefined full IDs in every selected document location', (t) => {
  const { root } = referenceFixture(t)
  for (const path of [
    'README.md', 'CONTRIBUTING.md', 'docs/implementation-guide.md',
    'docs/where-to-start.md', 'spec/topic.md', 'conformance/consumer-guide.md',
    'agentic/operations.md',
  ]) {
    mkdirSync(join(root, path, '..'), { recursive: true })
    writeFileSync(join(root, path), '# Guidance\n\nSee `MONEY-ARITHMETIC-001`.\n')
    assert.equal(run(root).status, 0, path)
    writeFileSync(join(root, path), '# Guidance\n\nSee `MONEY-ARITHMETIC-999`.\n')
    const result = run(root)
    assert.equal(result.status, 1, path)
    assert.match(result.stderr, /Invalid current-document specification requirement references/)
    assert.ok(result.stderr.includes(`${path}:3: MONEY-ARITHMETIC-999`), result.stderr)
    assert.doesNotMatch(result.stderr, /TypeError|SyntaxError/)
    writeFileSync(join(root, path), '# Guidance\n')
  }
})

test('accepts inline references, wrapped lists, slash abbreviations, and supported ranges', (t) => {
  const { root, source } = referenceFixture(t)
  writeFileSync(source, [
    '# Guidance',
    '**MONEY-ARITHMETIC-001**, `-002`, and -003.',
    '',
    'MONEY-ARITHMETIC-001',
    'and -003 through -003.',
    '',
    'MONEY-ARITHMETIC-001/003.',
    '',
    'MONEY-ARITHMETIC-001 to 003.',
    '',
    'MONEY-ARITHMETIC-001 through MONEY-ARITHMETIC-003.',
    '',
    '| References | Other references |',
    '| --- | --- |',
    '| `MONEY-ARITHMETIC-001`–`-003`, -005 | WORKFLOW-GUARD-001 and -002 |',
    '',
    'MONEY-ARITHMETIC-001—-003.',
    '',
    'MONEY-ARITHMETIC-001 - -003.',
    '',
    'MONEY-ARITHMETIC-001 defines this example, whose supplied value is -999.',
    '',
    'CORE-001.2 is outside the specification-ID inventory.',
    'SHA-256 and ISO-421 are not domain/topic requirement identifiers.',
  ].join('\n'))
  const result = run(root)
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /Current-document spec references checked: \d+ across 2 documents/)
})

test('CLI rejects unknown prefixes, wrapped abbreviations, and missing interior range IDs', (t) => {
  const { root, source } = referenceFixture(t)
  for (const [reference, missing] of [
    ['INVENTED-RULE-001', 'INVENTED-RULE-001'],
    ['MONEY-ARITHMETIC-001\nand -999', 'MONEY-ARITHMETIC-999'],
    ['MONEY-ARITHMETIC-001 through -005', 'MONEY-ARITHMETIC-004'],
    ['`MONEY-ARITHMETIC-001`–`-005`', 'MONEY-ARITHMETIC-004'],
    ['MONEY-ARITHMETIC-001 to 005', 'MONEY-ARITHMETIC-004'],
    ['MONEY-ARITHMETIC-001/999', 'MONEY-ARITHMETIC-999'],
  ]) {
    writeFileSync(source, reference + '\n')
    const result = run(root)
    assert.equal(result.status, 1, reference)
    assert.ok(result.stderr.includes(missing), result.stderr)
  }
})

test('CLI rejects descending ranges and ranges spanning different requirement prefixes', (t) => {
  const { root, source } = referenceFixture(t)
  for (const reference of [
    'MONEY-ARITHMETIC-003 through -001',
    'MONEY-ARITHMETIC-003 to 001',
    'MONEY-ARITHMETIC-001 through WORKFLOW-GUARD-002',
  ]) {
    writeFileSync(source, reference + '\n')
    const result = run(root)
    assert.equal(result.status, 1, reference)
    assert.match(result.stderr, /invalid requirement range/)
    assert.doesNotMatch(result.stderr, /TypeError|SyntaxError/)
  }
})

test('reference context stays local and link labels are checked independently of destinations', (t) => {
  const { root, source } = referenceFixture(t)
  writeFileSync(source, [
    'MONEY-ARITHMETIC-001.',
    '',
    'The supplied value is -999.',
    '# A new heading',
    '-999 is a supplied value.',
    '- MONEY-ARITHMETIC-001',
    '- -999 is another value.',
    '| References |',
    '| --- |',
    '| MONEY-ARITHMETIC-001 |',
    '| -999 |',
    '',
    '[valid MONEY-ARITHMETIC-003](https://example.invalid/MONEY-ARITHMETIC-999)',
  ].join('\n'))
  const valid = run(root)
  assert.equal(valid.status, 0, valid.stderr)
  writeFileSync(source, '[MONEY-ARITHMETIC-999](https://example.invalid/)\n')
  const invalid = run(root)
  assert.equal(invalid.status, 1)
  assert.match(invalid.stderr, /README\.md:1: MONEY-ARITHMETIC-999/)
})

test('prose, literal definitions, and non-normative labels cannot create an active requirement', (t) => {
  const { root, source } = referenceFixture(t)
  const declarations = join(root, 'spec/examples.md')
  writeFileSync(source, 'See MONEY-ARITHMETIC-999.\n')
  for (const candidate of [
    'A reference to MONEY-ARITHMETIC-999 MUST NOT create a definition.',
    '```markdown\n- **MONEY-ARITHMETIC-999** — Data MUST retain its label.\n```',
    '<!--\n- **MONEY-ARITHMETIC-999** — Data MUST retain its label.\n-->',
    '- **MONEY-ARITHMETIC-999** — An illustrative label without a normative clause.',
  ]) {
    writeFileSync(declarations, candidate + '\n')
    const result = run(root)
    assert.equal(result.status, 1, candidate)
    assert.match(result.stderr, /README\.md:1: MONEY-ARITHMETIC-999/)
  }
  writeFileSync(source, '# Guidance\n')
  writeFileSync(declarations, 'A former MONEY-ARITHMETIC-999 label is mentioned here.\n')
  const retired = run(root)
  assert.equal(retired.status, 1)
  assert.match(retired.stderr, /spec\/examples\.md:1: MONEY-ARITHMETIC-999/)
})

test('literal negative cases and fixture data do not suppress active prose or inline references', (t) => {
  const { root, source } = referenceFixture(t)
  const literal = [
    '# Negative fixture examples',
    '```json',
    '{"requirements":["MONEY-ARITHMETIC-999"]}',
    '```',
    '~~~~text',
    'INVENTED-RULE-001',
    '~~~',
    '<!-- This comment opener is literal inside the fence.',
    '~~~~',
    '    MONEY-ARITHMETIC-999',
    '<!-- MONEY-ARITHMETIC-999 --> See MONEY-ARITHMETIC-001.',
    '<!--',
    'INVENTED-RULE-001',
    '--> See MONEY-ARITHMETIC-003.',
  ].join('\n')
  writeFileSync(source, literal + '\n')
  assert.equal(run(root).status, 0)
  writeFileSync(source, literal + '\nSee `MONEY-ARITHMETIC-999`.\n')
  const active = run(root)
  assert.equal(active.status, 1)
  assert.match(active.stderr, /MONEY-ARITHMETIC-999/)
  writeFileSync(source, '# Invalid examples\nINVENTED-RULE-001\n')
  assert.equal(run(root).status, 1, 'a heading alone does not exempt reference text')
})

test('history and proposals stay outside selection; their IDs do not legitimize current references', (t) => {
  const { root, source } = referenceFixture(t)
  for (const path of ['docs/releases/README.md', 'docs/proposals/future.md', 'docs/arbitrary-working-notes.md', 'conformance/example.json']) {
    mkdirSync(join(root, path, '..'), { recursive: true })
    writeFileSync(join(root, path), 'MONEY-ARITHMETIC-999\nINVENTED-RULE-001\n')
  }
  writeFileSync(source, 'See MONEY-ARITHMETIC-001.\n')
  assert.equal(run(root).status, 0)
  writeFileSync(source, 'See MONEY-ARITHMETIC-999.\n')
  assert.equal(run(root).status, 1)
  writeFileSync(source, '# Guidance\n')
  writeFileSync(join(root, 'docs/arbitrary-working-notes.md'), '[missing](missing.md)\n')
  assert.match(run(root).stderr, /Broken Markdown links/, 'existing link checks retain their scope')
})

test('CLI rejects sibling-prefix and ordinary escapes, including encoded paths', (t) => {
  const { root, source } = linkFixture(t)
  writeFileSync(source, '[inside](docs/coreDoc/core-doc.md#foundation)\n')
  assert.equal(run(root).status, 0)
  for (const target of [
    '../repo-sibling/note.md',
    '../outside/note.md',
    '%2e%2e/repo-sibling/note.md',
    '%2e%2e%2frepo-sibling%2fnote.md',
  ]) {
    writeFileSync(source, `[outside](${target})\n`)
    const result = run(root)
    assert.equal(result.status, 1, target)
    assert.match(result.stderr, /Broken Markdown links/)
    assert.match(result.stderr, /outside repository/)
  }
})

test('CLI preserves nested paths, root links, encoded names, fragments, and external URLs', (t) => {
  const { root, source } = linkFixture(t)
  mkdirSync(join(root, 'nested'))
  writeFileSync(join(root, 'nested/topic name.md'), '# Topic\n')
  writeFileSync(source, [
    '# Overview',
    '[nested](nested/topic%20name.md#topic)',
    '[normalized](nested/../nested/topic%20name.md#topic)',
    '[root](.)',
    '[root through parent](docs/..)',
    '[own fragment](#overview)',
    '[external](https://example.invalid/not-fetched)',
    '[mail](mailto:example@example.invalid)',
  ].join('\n'))
  const result = run(root)
  assert.equal(result.status, 0, result.stderr)
  writeFileSync(source, '[missing fragment](nested/topic%20name.md#absent)\n')
  const missing = run(root)
  assert.equal(missing.status, 1)
  assert.match(missing.stderr, /missing fragment/)
})

test('CLI rejects external file/directory symlinks and reports broken or missing destinations', (t) => {
  const { root, directory, source } = linkFixture(t)
  symlinkSync(join(directory, 'repo-sibling/note.md'), join(root, 'external.txt'), 'file')
  symlinkSync(join(directory, 'repo-sibling'), join(root, 'external-directory'), 'dir')
  symlinkSync('./absent.txt', join(root, 'broken.txt'), 'file')
  for (const target of ['external.txt', 'external-directory/note.md']) {
    writeFileSync(source, `[outside](${target})\n`)
    const result = run(root)
    assert.equal(result.status, 1)
    assert.match(result.stderr, /Broken Markdown links/)
    assert.match(result.stderr, /outside repository after resolving symlinks/)
  }
  for (const target of ['broken.txt', 'missing.txt']) {
    writeFileSync(source, `[missing](${target})\n`)
    const result = run(root)
    assert.equal(result.status, 1)
    assert.match(result.stderr, /Broken Markdown links/)
    assert.match(result.stderr, new RegExp(target.replace('.', '\\.')))
    assert.doesNotMatch(result.stderr, /TypeError|SyntaxError/)
  }
})

test('CLI accepts internal symlinks and documentation through a checkout alias', (t) => {
  const { root, directory, source } = linkFixture(t)
  symlinkSync('./docs/coreDoc/core-doc.md', join(root, 'internal.md'), 'file')
  symlinkSync('./docs', join(root, 'internal-directory'), 'dir')
  writeFileSync(source, [
    '[file](internal.md#foundation)',
    '[directory](internal-directory/coreDoc/core-doc.md#foundation)',
    '[root](.)',
  ].join('\n'))
  assert.equal(run(root).status, 0)
  const alias = join(directory, 'checkout-alias')
  symlinkSync(root, alias, 'dir')
  const result = run(alias)
  assert.equal(result.status, 0, result.stderr)
})

test('CLI rejects external, broken, and non-file Markdown sources before parsing', (t) => {
  const { root, directory, source } = linkFixture(t)
  writeFileSync(source, '# Index\n')
  writeFileSync(join(directory, 'repo-sibling/note.md'), '[outside content](missing-file.md)\n')
  symlinkSync(join(directory, 'repo-sibling/note.md'), join(root, 'external.md'), 'file')
  const result = run(root)
  assert.equal(result.status, 1)
  assert.match(result.stderr, /Markdown source outside repository after resolving symlinks/)
  assert.doesNotMatch(result.stderr, /missing-file\.md|TypeError|SyntaxError/)
  unlinkSync(join(root, 'external.md'))
  symlinkSync('./missing.md', join(root, 'broken.md'), 'file')
  const broken = run(root)
  assert.equal(broken.status, 1)
  assert.match(broken.stderr, /Cannot resolve Markdown source/)
  unlinkSync(join(root, 'broken.md'))
  symlinkSync('.', join(root, 'folder.md'), 'dir')
  const directoryLink = run(root)
  assert.equal(directoryLink.status, 1)
  assert.match(directoryLink.stderr, /Markdown source is not a regular file/)
})

test('accepts valid CoreDoc IDs, ranges, local links, and Markdown fragments', () => {
  const root = fixture()
  writeFileSync(join(root, 'docs/fragment-control.md'), '[valid](../spec/conventions.md#compatibility-policy)\n')
  const result = run(root)
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /Documentation references passed/)
})

test('CLI rejects unknown CoreDoc prefixes and missing IDs under known prefixes', () => {
  const prefixRoot = fixture()
  const prefixPath = join(prefixRoot, 'docs/coreDoc/core-doc.md')
  writeFileSync(prefixPath, `${readFileSync(prefixPath, 'utf8')}\nINVENTED-RULE-001\n`)
  const prefix = run(prefixRoot)
  assert.equal(prefix.status, 1)
  assert.match(prefix.stderr, /Unknown CoreDoc requirement prefixes/)
  assert.match(prefix.stderr, /INVENTED-RULE/)

  const idRoot = fixture()
  const idPath = join(idRoot, 'docs/coreDoc/core-doc.md')
  writeFileSync(idPath, `${readFileSync(idPath, 'utf8')}\nMONEY-ARITHMETIC-999\n`)
  const id = run(idRoot)
  assert.equal(id.status, 1)
  assert.match(id.stderr, /Missing CoreDoc requirement references/)
  assert.match(id.stderr, /MONEY-ARITHMETIC-999/)
})

test('CLI rejects a nonexistent local Markdown fragment', () => {
  const root = fixture()
  writeFileSync(join(root, 'docs/fragment-negative.md'), '[broken](../spec/conventions.md#missing-fragment)\n')
  const result = run(root)
  assert.equal(result.status, 1)
  assert.match(result.stderr, /missing fragment/)
})
