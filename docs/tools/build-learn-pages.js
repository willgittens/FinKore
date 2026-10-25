// SPDX-License-Identifier: MPL-2.0
/**
 * Generates Learn readers for the Markdown documents linked by the home/CoreDoc.
 * This developer tool reads canonical sources without changing them. Build mode
 * writes derived HTML; check mode writes nothing. It does not define or execute
 * financial behavior.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { posix, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

export const LEARN_PAGES = [
  { source: 'docs/where-to-start.md', output: 'learn/where-to-start.html', label: 'Where to start', description: 'Understand FinKore, choose your starting point, and work through your first domain slice.' },
  { source: 'README.md', output: 'learn/about.html', label: 'About the project', description: 'What FinKore defines, who it serves, and where to start reading or building.' },
  { source: 'LICENSING.md', output: 'learn/licensing.html', label: 'Licensing', description: 'The project licensing policy, covered materials, and consumer-owned implementations.' },
  { source: 'CONTRIBUTING.md', output: 'learn/contributing.html', label: 'Contribute', description: 'How to propose, review, and verify contributions to the FinKore contract.' },
  { source: 'docs/implementation-guide.md', output: 'learn/implementation-guide.html', label: 'Implementation guide', description: 'Guidance for implementing the portable contract in your own language and stack.' },
  { source: 'docs/releases/README.md', output: 'learn/releases.html', label: 'Release notes', description: 'Published release history. Earlier entries describe historical repository capabilities.' },
]
const destinations = new Map(LEARN_PAGES.map(page => [page.source, page.output]))
destinations.set('docs/coreDoc/core-doc.md', 'learn/coredoc.html')
export const GITHUB_PROJECT_URL = 'https://github.com/willgittens/FinKore'

export function renderLearnNavigation({ home = false, current } = {}) {
  return `<nav aria-label="Primary navigation">
        <ul class="nav-list">
          <li><a href="where-to-start.html"${current === 'start' ? ' aria-current="page"' : ''}>Where to start</a></li>
          <li><a href="${home ? '#core-explorer' : 'coredoc.html'}"${current === 'coredoc' ? ' aria-current="page"' : ''}>CoreDoc</a></li>
          <li><a class="nav-start" href="${GITHUB_PROJECT_URL}" target="_blank" rel="noopener noreferrer">Github Project <span aria-hidden="true">↗</span></a></li>
        </ul>
      </nav>`
}

const escapeHtml = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;')

// Only the converted documents are redirected. Specs, conformance and other
// repository references retain their original destinations and fragments.
export function learnLink(source, href) {
  if (/^https:\/\/[^\\\s"'<>]+$/.test(href)) return href
  if (/^[a-z][a-z0-9+.-]*:|^\/|[\\\s]/i.test(href)) throw new Error(`Unsupported Learn link: ${href}`)
  if (href.startsWith('#')) return href
  const [path, fragment] = href.split('#')
  const target = posix.normalize(posix.join(posix.dirname(source), path))
  if (target === '..' || target.startsWith('../')) throw new Error(`Escaping Learn link: ${href}`)
  return posix.relative('learn', destinations.get(target) ?? target) + (fragment === undefined ? '' : `#${fragment}`)
}
const linkAttributes = (source, href) => `href="${escapeHtml(learnLink(source, href))}"${href.startsWith('https://') ? ' target="_blank" rel="noopener noreferrer"' : ''}`

function inline(text, source) {
  const tokens = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g
  let output = '', last = 0
  for (const match of text.matchAll(tokens)) {
    output += escapeHtml(text.slice(last, match.index))
    const token = match[0]
    if (token.startsWith('`')) output += `<code>${escapeHtml(token.slice(1, -1))}</code>`
    else if (token.startsWith('**')) output += `<strong>${inline(token.slice(2, -2), source)}</strong>`
    else {
      const [, label, href] = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      output += `<a ${linkAttributes(source, href)}>${inline(label, source)}</a>`
    }
    last = match.index + token.length
  }
  return output + escapeHtml(text.slice(last))
}

export function renderLearnMarkdown(markdown, source) {
  const lines = markdown.trim().split('\n')
  const used = new Map(), headings = []
  function headingId(text) {
    const slug = text.toLowerCase().replace(/[`*_~]/g, '').replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s+/g, '-')
    const number = used.get(slug) ?? 0
    used.set(slug, number + 1)
    return slug + (number ? `-${number}` : '')
  }
  const blocks = []
  let title, titleId
  for (let i = 0; i < lines.length;) {
    const line = lines[i]
    if (!line.trim()) { i++; continue }
    if (line.startsWith('<!--')) {
      while (i < lines.length && !lines[i].includes('-->')) i++
      if (i === lines.length) throw new Error(`Unclosed Learn comment: ${source}`)
      i++; continue
    }
    if (line.startsWith('```')) {
      const language = line.slice(3)
      if (!/^[a-z]*$/.test(language)) throw new Error(`Unsupported Learn code fence: ${line}`)
      const code = []
      for (i++; i < lines.length && lines[i] !== '```'; i++) code.push(lines[i])
      if (i === lines.length) throw new Error(`Unclosed Learn code fence: ${source}`)
      blocks.push(`<pre><code${language ? ` class="language-${language}"` : ''}>${escapeHtml(code.join('\n'))}</code></pre>`)
      i++; continue
    }
    const heading = line.match(/^(#{1,6}) (.+)$/)
    if (heading) {
      const level = heading[1].length, id = headingId(heading[2])
      if (level === 1) {
        if (title) throw new Error(`Multiple Learn document titles: ${source}`)
        title = heading[2]
        titleId = id
      } else headings.push({ level, id, title: heading[2] })
      blocks.push(`<h${level} id="${escapeHtml(id)}">${inline(heading[2], source)}</h${level}>`)
      i++; continue
    }
    if (line.startsWith('|')) {
      const rows = []
      while (i < lines.length && lines[i].startsWith('|')) rows.push(lines[i++].split('|').slice(1, -1).map(cell => cell.trim()))
      if (rows.length < 3 || !rows[1].every(cell => /^:?-+:?$/.test(cell)) || rows.some(row => row.length !== rows[0].length)) throw new Error(`Unsupported Learn table: ${source}`)
      blocks.push(`<div class="core-table"><table><thead><tr>${rows[0].map(cell => `<th scope="col">${inline(cell, source)}</th>`).join('')}</tr></thead><tbody>${rows.slice(2).map(row => `<tr>${row.map(cell => `<td>${inline(cell, source)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`)
      continue
    }
    const list = line.match(/^(\d+\.|-) (.+)$/)
    if (list) {
      const ordered = list[1] !== '-', items = []
      const pattern = ordered ? /^\d+\. (.+)$/ : /^- (.+)$/
      while (i < lines.length && pattern.test(lines[i])) {
        let item = lines[i++].replace(pattern, '$1')
        while (i < lines.length && /^ {2,}\S/.test(lines[i])) item += ' ' + lines[i++].trim()
        items.push(`<li>${inline(item, source)}</li>`)
      }
      const tag = ordered ? 'ol' : 'ul'
      blocks.push(`<${tag}${ordered && list[1] !== '1.' ? ` start="${parseInt(list[1], 10)}"` : ''}>${items.join('')}</${tag}>`)
      continue
    }
    // README's existing local logos and two links are the only raw HTML forms.
    // Reconstruct attributes rather than forwarding arbitrary markup or scripts.
    if (/^<p(?: align="center")?>$/.test(line)) {
      const raw = []
      for (i++; i < lines.length && lines[i] !== '</p>'; i++) raw.push(lines[i].trim())
      if (i === lines.length) throw new Error(`Unclosed Learn image paragraph: ${source}`)
      const content = raw.join(' ')
      const image = /<img src="([^"]+)" alt="([^"]+)" width="(\d+)" \/>/
      const match = content.match(image)
      const wrapper = content.replace(image, '').trim()
      if (!match || !/^(?:|<a href="https:\/\/savoiabarker\.com\/" target="_blank" rel="noopener noreferrer">\s*<\/a>)$/.test(wrapper)) throw new Error(`Unsupported Learn image markup: ${source}`)
      const img = `<img class="learn-document-image" src="${escapeHtml(learnLink(source, match[1]))}" alt="${escapeHtml(match[2])}" width="${match[3]}" loading="lazy" decoding="async" />`
      blocks.push(`<p>${wrapper ? `<a ${linkAttributes(source, 'https://savoiabarker.com/')}>${img}</a>` : img}</p>`)
      i++; continue
    }
    const paragraph = []
    do { paragraph.push(lines[i++]) } while (i < lines.length && lines[i].trim() && !/^(?:#{1,6} |\d+\. |- |\||```|<!--)/.test(lines[i]))
    let text = paragraph.join(' ')
    // Preserve README's canonical website link using the same safe link renderer.
    text = text.replace(/<a href="(https:\/\/finkore\.dev)" target="_blank" rel="noopener noreferrer">https:\/\/finkore\.dev<\/a>/g, '[$1]($1)')
    if (/^(?:>|\* | {4}|<)/.test(text)) throw new Error(`Unsupported Learn block in ${source}: ${text.slice(0, 80)}`)
    blocks.push(`<p>${inline(text, source)}</p>`)
  }
  if (!title) throw new Error(`Missing Learn document title: ${source}`)
  return { title, titleId, headings, html: blocks.join('\n') }
}

export function renderLearnPage(page, markdown) {
  const doc = renderLearnMarkdown(markdown, page.source)
  const navigation = doc.headings.filter(h => h.level === 2).map(h => `<a class="core-nav-intro" href="#${escapeHtml(h.id)}">${escapeHtml(h.title)}</a>`).join('\n')
  return `<!doctype html>
<!-- SPDX-License-Identifier: MPL-2.0 -->
<!-- Generated from ${page.source} by npm run learn:build. Do not edit this file directly. -->
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#ffffff" />
  <title>${escapeHtml(page.label)} — FinKore</title>
  <meta name="description" content="${escapeHtml(page.description)}" />
  <link rel="stylesheet" href="css/styles.css" />
  <link rel="stylesheet" href="css/coredoc.css" />
  <link rel="stylesheet" href="css/documents.css" />
</head>
<body id="top" class="core-reader learn-document">
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="container header-layout">
      <a class="brand" href="index.html" aria-label="FinKore home"><img class="brand-logo" src="img/Finkore-Logo.png" alt="FinKore" width="1013" height="226" decoding="async" /></a>
      ${renderLearnNavigation({ current: page.output === 'learn/where-to-start.html' ? 'start' : undefined })}
    </div>
  </header>
  <main id="main">
    <header class="container core-reader-heading">
      <p class="eyebrow">${escapeHtml(page.label)}</p>
      <h1 id="${escapeHtml(doc.titleId)}">${escapeHtml(doc.title)}</h1>
      <p class="core-reader-lead">${escapeHtml(page.description)}</p>
      <div class="actions"><a class="text-link" href="../${page.source}">View Markdown source <span aria-hidden="true">↗</span></a></div>
      <nav class="learn-document-links" aria-label="Learn documents">${LEARN_PAGES.map(p => `<a href="${posix.basename(p.output)}"${p === page ? ' aria-current="page"' : ''}>${escapeHtml(p.label)}</a>`).join('')}<a href="coredoc.html">CoreDoc</a></nav>
    </header>
    <div class="container core-reader-layout">
      <aside class="core-sidebar"><nav aria-label="Table of contents"><p class="eyebrow">On this page</p>${navigation}</nav></aside>
      <div class="core-reader-content">
        <details class="learn-document-index"><summary>On this page</summary><nav aria-label="Mobile table of contents">${navigation}</nav></details>
        <article class="core-prose learn-document-prose" aria-label="${escapeHtml(doc.title)}">
${doc.html.replace(/<h1\b[^>]*>[\s\S]*?<\/h1>\n?/, '')}
        </article>
        <a class="text-link core-back-top" href="#top">Back to the top ↑</a>
      </div>
    </div>
  </main>
  <footer class="site-footer"><div class="container footer-layout">
    <a class="brand" href="index.html">FinKore<span class="accent" aria-hidden="true">.</span></a><p>Financial behavior, made explicit.</p>
    <nav aria-label="Project resources"><a href="about.html">About the project</a><a href="contributing.html">Contribute</a><a href="../LICENSE">MPL-2.0</a></nav>
  </div></footer>
</body>
</html>
`
}

export function buildLearnPages(root = process.cwd(), { check = false } = {}) {
  const outputs = LEARN_PAGES.map(page => [page.output, renderLearnPage(page, readFileSync(resolve(root, page.source), 'utf8'))])
  const home = readFileSync(resolve(root, 'learn/index.html'), 'utf8')
  const nextHome = home.replace(/<nav aria-label="Primary navigation">[\s\S]*?<\/nav>/, renderLearnNavigation({ home: true })).replace(/href="([^"]+)"/g, (match, href) => {
    if (/^[a-z][a-z0-9+.-]*:|^#|^\//i.test(href)) return match
    const target = posix.normalize(posix.join('learn', href.split('#')[0]))
    return destinations.has(target) ? `href="${escapeHtml(learnLink('learn/index.html', href))}"` : match
  })
  outputs.push(['learn/index.html', nextHome])
  if (check) {
    const stale = outputs.filter(([path, html]) => !existsSync(resolve(root, path)) || readFileSync(resolve(root, path), 'utf8') !== html).map(([path]) => path)
    if (stale.length) throw new Error(`Learn pages are out of date: ${stale.join(', ')}. Run npm run learn:build and review the generated changes.`)
  } else for (const [path, html] of outputs) writeFileSync(resolve(root, path), html)
  return { pages: LEARN_PAGES.length }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    if (process.argv.slice(2).some(arg => arg !== '--check')) throw new Error('Usage: node docs/tools/build-learn-pages.js [--check]')
    const result = buildLearnPages(process.cwd(), { check: process.argv.includes('--check') })
    console.log(`Learn pages ${process.argv.includes('--check') ? 'check passed' : 'generated'}: ${result.pages} documents. Financial behavior was not executed.`)
  } catch (error) { console.error(error.message); process.exitCode = 1 }
}
