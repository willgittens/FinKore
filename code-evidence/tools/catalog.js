// SPDX-License-Identifier: MPL-2.0
/**
 * Validates Code Evidence discovery metadata and renders its readable catalog.
 * This developer tool reads local JSON without changing it; --write changes only
 * catalog.md. It makes no network calls, executes no upstream code and does not
 * define financial behavior or certify any implementation.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'

const catalogRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const schema = JSON.parse(readFileSync(join(catalogRoot, 'schemas/repositories.schema.json'), 'utf8'))
const checkSchema = new Ajv2020({ allErrors: true, strict: true }).compile(schema)

export function validateCatalog(catalog) {
  if (!checkSchema(catalog)) {
    throw new Error(`Catalog schema failed: ${JSON.stringify(checkSchema.errors)}`)
  }
  const ids = new Set()
  const githubIds = new Set()
  const names = new Set()
  const fail = (message) => { throw new Error(message) }
  const unique = (set, value, label) => {
    if (set.has(value)) fail(`Duplicate ${label}: ${value}`)
    set.add(value)
  }
  for (const repo of catalog.repositories) {
    unique(ids, repo.id, 'ID')
    unique(githubIds, repo.github_id, 'GitHub repository ID')
    unique(names, repo.full_name.toLowerCase(), 'repository name')
    const url = `https://github.com/${repo.full_name}`
    const api = `https://api.github.com/repos/${repo.full_name}`
    if (repo.url !== url || repo.metadata_source_url !== api) fail(`${repo.id}: repository source mismatch`)
    if (repo.owner.login !== repo.full_name.split('/')[0] || repo.owner.url !== `https://github.com/${repo.owner.login}`) {
      fail(`${repo.id}: owner attribution mismatch`)
    }
    if (repo.observed_on > catalog.updated_on) fail(`${repo.id}: observation is later than catalog date`)
    const commits = new Set()
    for (const edition of repo.editions) {
      unique(ids, edition.id, 'ID')
      unique(commits, edition.commit_sha, `${repo.id} source edition`)
      if (edition.tree_url !== `${url}/tree/${edition.commit_sha}` ||
          edition.readme.url !== `${url}/blob/${edition.commit_sha}/${edition.readme.path}`) {
        fail(`${edition.id}: source must be pinned to the recorded repository and full commit SHA`)
      }
      if (edition.commit_source_url !== `${api}/commits/${encodeURIComponent(edition.version)}`) {
        fail(`${edition.id}: commit resolution source mismatch`)
      }
      const page = new URL(edition.selection_source_url).searchParams.get('per_page')
      const selection = edition.ref_type === 'release_tag'
        ? edition.selection_source_url === `${api}/releases/latest`
        : /^(?:[1-9][0-9]?|100)$/.test(page ?? '') && edition.selection_source_url === `${api}/tags?per_page=${page}`
      if (!selection) fail(`${edition.id}: version selection source mismatch`)
      if (edition.ref_type === 'release_tag' && edition.release_url !== `${url}/releases/tag/${encodeURIComponent(edition.version)}`) {
        fail(`${edition.id}: release attribution mismatch`)
      }
      if (edition.observed_on > catalog.updated_on) fail(`${edition.id}: observation is later than catalog date`)
    }
    if (repo.authors.source_url !== null && !repo.editions.some((edition) => repo.authors.source_url === edition.readme.url)) {
      fail(`${repo.id}: authors need a pinned inspected attribution source`)
    }
  }
  return catalog
}

function cell(text) {
  return String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('|', '&#124;').replaceAll('\n', ' ').replaceAll('[', '&#91;').replaceAll(']', '&#93;')
}

export function renderCatalog(catalog) {
  validateCatalog(catalog)
  const languages = new Set(catalog.repositories.map((repo) => repo.primary_language).filter(Boolean))
  const editionCount = catalog.repositories.reduce((sum, repo) => sum + repo.editions.length, 0)
  const lines = [
    '# Code Evidence — Repository catalog', '',
    '<!-- Generated from repositories.json. Run npm run code-evidence:build; do not edit directly. -->', '',
    `Discovery updated on ${catalog.updated_on}: ${catalog.repositories.length} repositories, ${editionCount} source editions, ${languages.size} primary languages.`, '',
    'These are discovery observations: selected README passages and GitHub metadata were inspected at discovery time. Topics and questions are editorial hypotheses. Later implementation readings, findings, contract comparisons and execution/review status are listed in the [analysis records](README.md#analysis-records); they do not change this discovery history.', '',
    'Versions identify selected source editions. Follow each commit link for the exact source. The owner is the GitHub account holding the repository; original authors are recorded separately when verified. License identifiers are GitHub metadata, not an independent review of license files. `NOASSERTION` means the metadata does not identify a license.', '',
    '| Project / repository | GitHub owner | Primary language | Kind | Selected version | License metadata | Investigation scope |',
    '| --- | --- | --- | --- | --- | --- | --- |',
  ]
  for (const repo of catalog.repositories) {
    for (const edition of repo.editions) {
      lines.push(`| [${cell(repo.name)}](${repo.url}) (${cell(repo.full_name)}) | [${cell(repo.owner.login)}](${repo.owner.url}) | ${cell(repo.primary_language ?? 'Unknown')} | ${cell(repo.kind)} | [${cell(edition.version)}](${edition.tree_url}) | ${cell(repo.upstream_license.reported_spdx_id ?? 'Unknown')} | ${cell(repo.investigation.scope)} |`)
    }
  }
  lines.push('', '## Investigation queue', '')
  for (const repo of catalog.repositories) {
    lines.push(`### ${repo.id} — ${cell(repo.name)}`, '',
      `**Why selected.** ${cell(repo.investigation.selection_reason)}`, '',
      `**Topics.** ${repo.investigation.topics.map(cell).join('; ')}.`, '',
      `**Author attribution.** ${repo.authors.names === null ? 'Individual authors have not been verified; the repository owner is listed above.' : `[${repo.authors.names.map(cell).join('; ')}](${repo.authors.source_url}).`}`, '',
      'Questions for code and test inspection:', '')
    for (const question of repo.investigation.questions) lines.push(`- ${cell(question)}`)
    if (repo.investigation.context_limits !== null) lines.push('', `**Context and limits.** ${cell(repo.investigation.context_limits)}`)
    for (const edition of repo.editions) {
      lines.push('', `**${edition.id}.** Version ${cell(edition.version)}; ${edition.ref_type}; source commit [${edition.commit_sha}](${edition.tree_url}).`, '',
        `[Inspected README](${edition.readme.url}) · [Repository metadata](${repo.metadata_source_url}) · [Version selection](${edition.selection_source_url}) · [Commit resolution](${edition.commit_source_url})`, '',
        `**Selection.** ${cell(edition.selection_note)}`, '',
        `**Dates.** Observed ${edition.observed_on}; source commit ${edition.commit_date}; GitHub release publication ${edition.release_published_at ?? 'not available for this tag'}.`, '')
    }
  }
  lines.push('See [the workflow](README.md) for reading, review, deduplication and contract-comparison rules.', '')
  return lines.join('\n')
}

function main() {
  const args = process.argv.slice(2)
  if (args.length > 1 || (args.length === 1 && !['--check', '--write'].includes(args[0]))) {
    throw new Error('Usage: node code-evidence/tools/catalog.js [--check|--write]')
  }
  const catalog = JSON.parse(readFileSync(join(catalogRoot, 'repositories.json'), 'utf8'))
  const rendered = renderCatalog(catalog)
  const destination = join(catalogRoot, 'catalog.md')
  if (args[0] === '--write') writeFileSync(destination, rendered)
  else if (readFileSync(destination, 'utf8') !== rendered) throw new Error('catalog.md is stale; run npm run code-evidence:build')
  console.log(`Code Evidence catalog ${args[0] === '--write' ? 'built' : 'validated'}: ${catalog.repositories.length} repositories. No implementation behavior was checked.`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { main() } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  }
}
