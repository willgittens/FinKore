// SPDX-License-Identifier: MPL-2.0
/**
 * Refreshes the CSS cache version shared by the static Learn pages.
 * This developer tool reads HTML without changing canonical Markdown. Build mode
 * writes the home stylesheet URLs; its helpers otherwise write nothing. It does
 * not define or execute financial behavior.
 */
import { randomUUID } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const VERSION = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
const HOME = 'learn/index.html'

function assetVersion(html) {
  const matches = [...html.matchAll(/<link\b[^>]*\brel="stylesheet"[^>]*\bhref="css\/styles\.css\?v=([^"<>]+)"[^>]*>/g)]
  if (matches.length !== 1 || !VERSION.test(matches[0][1])) {
    throw new Error('Learn CSS build version is missing or invalid. Run npm run learn:build.')
  }
  return matches[0][1]
}

export function readLearnAssetVersion(root = process.cwd()) {
  return assetVersion(readFileSync(resolve(root, HOME), 'utf8'))
}

export function versionLearnStylesheets(html, version) {
  if (!VERSION.test(version)) throw new Error('Invalid Learn CSS build version')
  return html.replace(/<link\b[^>]*>/g, tag => {
    if (!/\brel="stylesheet"/.test(tag)) return tag
    return tag.replace(/\bhref="(css\/[a-zA-Z0-9_/-]+\.css)(?:\?[^"<>]*)?"/, (_, path) => `href="${path}?v=${version}"`)
  })
}

export function refreshLearnAssetVersion(root = process.cwd()) {
  const homePath = resolve(root, HOME)
  const home = readFileSync(homePath, 'utf8')
  const version = randomUUID()
  const nextHome = versionLearnStylesheets(home, version)
  assetVersion(nextHome)
  writeFileSync(homePath, nextHome)
  return version
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    if (process.argv.length !== 2) throw new Error('Usage: node docs/tools/build-learn-assets.js')
    console.log(`Learn CSS cache version refreshed: ${refreshLearnAssetVersion()}. Financial behavior was not executed.`)
  } catch (error) { console.error(error.message); process.exitCode = 1 }
}
