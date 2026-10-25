// SPDX-License-Identifier: MPL-2.0
/**
 * Generates the Learn CoreDoc reader and its home index from canonical Markdown.
 * This developer tool reads source documents without changing them. Build mode
 * writes derived HTML; check mode writes nothing. It does not define or execute
 * financial behavior, modify normative metadata, or assess conformance.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, posix } from 'node:path'
import { pathToFileURL } from 'node:url'
import { learnLink, renderLearnNavigation } from './build-learn-pages.js'

const SOURCE = 'docs/coreDoc/core-doc.md'
const READER = 'learn/coredoc.html'
const HOME = 'learn/index.html'
const START = '<!-- BEGIN GENERATED COREDOC INDEX -->'
const END = '<!-- END GENERATED COREDOC INDEX -->'
const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;')
const anchor = id => id.toLowerCase().replaceAll('.', '-')
const slug = text => text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')

function link(href) {
  if (href.startsWith('#')) return href
  if (/^[a-z][a-z0-9+.-]*:|^\/|[\\\s]/i.test(href)) throw new Error(`Unsupported CoreDoc link: ${href}`)
  const target = posix.normalize(posix.join('docs/coreDoc', href))
  if (target.startsWith('../')) throw new Error(`Escaping CoreDoc link: ${href}`)
  return learnLink(SOURCE, href)
}

function inline(text) {
  const tokens = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g
  let output = '', last = 0
  for (const match of text.matchAll(tokens)) {
    output += escape(text.slice(last, match.index))
    const token = match[0]
    if (token.startsWith('`')) output += `<code>${escape(token.slice(1, -1))}</code>`
    else if (token.startsWith('**')) output += `<strong>${escape(token.slice(2, -2))}</strong>`
    else {
      const [, label, href] = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      output += `<a href="${escape(link(href))}">${inline(label)}</a>`
    }
    last = match.index + token.length
  }
  return output + escape(text.slice(last))
}

// A deliberately bounded renderer for CoreDoc's prose, headings, table and code.
// Unsupported block syntax fails the build instead of silently losing meaning.
export function renderMarkdown(markdown) {
  return markdown.trim().split(/\n\s*\n/).filter(Boolean).map(block => {
    if (/^    /.test(block)) return `<pre><code>${escape(block.replace(/^ {4}/gm, ''))}</code></pre>`
    const heading = block.match(/^(#{1,2}) (.+)$/)
    if (heading) return `<h${heading[1].length + 1} id="${slug(heading[2])}">${inline(heading[2])}</h${heading[1].length + 1}>`
    if (block.startsWith('|')) {
      const rows = block.split('\n').map(row => row.split('|').slice(1, -1).map(cell => cell.trim()))
      if (rows.length < 3 || rows[0].length !== 2 || !rows[1].every(cell => /^-+$/.test(cell)) || rows.some(row => row.length !== 2)) throw new Error('Unsupported CoreDoc table')
      return `<div class="core-table"><table><thead><tr>${rows[0].map(cell => `<th scope="col">${inline(cell)}</th>`).join('')}</tr></thead><tbody>${rows.slice(2).map(row => `<tr>${row.map(cell => `<td>${inline(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`
    }
    if (/^(?:#{1,6} |[-*>] |\d+\. |```|<)/m.test(block)) throw new Error(`Unsupported CoreDoc block: ${block.slice(0, 80)}`)
    const governance = /^\*\*(?:Introduced|Last updated|Last updated on):\*\* /.test(block)
    return `<p${governance ? ' class="core-governance"' : ''}>${inline(block.replace(/\n/g, ' '))}</p>`
  }).join('\n')
}

function metadata(body) {
  const match = body.trim().match(/^((?:\*\*(?:Introduced|Last updated|Last updated on):\*\* [^\n]+\n\s*){3})([\s\S]+)$/)
  if (!match || ['Introduced', 'Last updated', 'Last updated on'].some(label => !match[1].includes('**' + label + ':**'))) throw new Error('Missing CoreDoc governance metadata')
  return { governance: match[1].trim(), content: match[2].trim() }
}

export function parseCoreDoc(source) {
  const version = source.match(/^\*\*CoreDoc version:\*\* (.+)$/m)?.[1]
  const status = source.match(/^\*\*Status:\*\* (.+)$/m)?.[1]
  const date = source.match(/^\*\*Document date:\*\* (.+)$/m)?.[1]
  if (!version || !status || !date) throw new Error('Missing CoreDoc version, status or document date')
  const principlePattern = /^<a id="([a-z-]+)"><\/a>\n\n## (CORE-\d{3}) — (.+)$/gm
  const headings = [...source.matchAll(principlePattern)]
  const appendixStart = source.indexOf('\n## Relationship with specifications\n')
  if (!headings.length || appendixStart < headings.at(-1).index) throw new Error('Unsupported CoreDoc structure')
  const questions = new Map([...source.matchAll(/^\| \[[^\]]+\]\(#([a-z-]+)\) \| (.+) \|$/gm)].map(m => [m[1], m[2]]))
  const principles = headings.map((heading, i) => {
    const body = source.slice(heading.index + heading[0].length, headings[i + 1]?.index ?? appendixStart).trim()
    const rules = [...body.matchAll(/^### (CORE-\d{3}\.\d+) — (.+)$/gm)]
    if (!rules.length || !questions.has(heading[1])) throw new Error(`Missing CoreDoc rules or reading question for ${heading[2]}`)
    return { id: heading[2], anchor: heading[1], title: heading[3], question: questions.get(heading[1]), ...metadata(body.slice(0, rules[0].index)), rules: rules.map((rule, j) => {
      if (!rule[1].startsWith(heading[2] + '.')) throw new Error('Rule belongs to another principle')
      const entry = { id: rule[1], title: rule[2], ...metadata(body.slice(rule.index + rule[0].length, rules[j + 1]?.index)) }
      const labels = [...entry.content.matchAll(/^\*\*(Rule|Why this matters|Interpretation|Boundaries|Relevant FinKore domains)\*\*$/gm)]
      if (labels[0]?.index !== 0 || labels.map(m => m[1]).join('|') !== 'Rule|Why this matters|Interpretation|Boundaries|Relevant FinKore domains') throw new Error(`Unsupported rule sections: ${entry.id}`)
      entry.sections = labels.map((label, k) => ({ title: label[1], body: entry.content.slice(label.index + label[0].length, labels[k + 1]?.index).trim() }))
      return entry
    }) }
  })
  const ids = principles.flatMap(p => [p.id, ...p.rules.map(r => r.id)])
  if (new Set(ids).size !== ids.length) throw new Error('Duplicate CoreDoc identifier')
  const intro = source.slice(0, headings[0].index).replace(/^# FinKore CoreDoc\n/, '').replace(/^\*\*(?:CoreDoc version|Document date|Status):\*\* .+\n/gm, '').replace(/^# Core Principles and Financial Rules\n/m, '').trim()
  return { version, status, date, principles, rules: principles.flatMap(p => p.rules), intro, appendix: source.slice(appendixStart).trim() }
}

function navigation(doc) {
  return `<a class="core-nav-intro" href="#about">About this document</a>\n${doc.principles.map(p => `<div class="core-nav-group"><a class="core-nav-principle" href="#${p.anchor}"><span>${p.id}</span>${escape(p.title)}</a><ol>${p.rules.map(r => `<li><a href="#${anchor(r.id)}"><span>${r.id}</span>${escape(r.title)}</a></li>`).join('')}</ol></div>`).join('\n')}\n<a class="core-nav-intro" href="#relationship-with-specifications">Scope and evolution</a>`
}
function history(entry) {
  return `<details class="core-history"><summary>Rule history</summary>${renderMarkdown(entry.governance.replace(/\n(?=\*\*)/g, '\n\n'))}</details>`
}
function ruleNavigation(doc, rule) {
  const i = doc.rules.indexOf(rule), prev = doc.rules[i - 1], next = doc.rules[i + 1]
  return `<nav class="core-rule-navigation" aria-label="Reading navigation for ${rule.id}">${prev ? `<a href="#${anchor(prev.id)}"><span>← Previous rule · ${prev.id}</span>${escape(prev.title)}</a>` : '<a href="#top"><span>← CoreDoc</span>Back to the overview</a>'}${next ? `<a href="#${anchor(next.id)}"><span>Next rule · ${next.id} →</span>${escape(next.title)}</a>` : '<a href="index.html#core-explorer"><span>Continue exploring →</span>Return to the home index</a>'}</nav>`
}

export function renderReader(doc) {
  const nav = navigation(doc)
  return `<!doctype html>
<!-- SPDX-License-Identifier: MPL-2.0 -->
<!-- Generated from docs/coreDoc/core-doc.md by npm run learn:build. Do not edit this file directly. -->
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#ffffff" />
  <title>CoreDoc — FinKore financial principles and rules</title>
  <meta name="description" content="Read the ${doc.principles.length} principles and ${doc.rules.length} foundational rules of ${escape(doc.version)}. Explore obligations, reasoning, interpretation, and boundaries." />
  <link rel="stylesheet" href="css/styles.css" />
  <link rel="stylesheet" href="css/coredoc.css" />
  <script src="js/coredoc.js" defer></script>
</head>
<body id="top" class="core-reader">
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="container header-layout">
      <a class="brand" href="index.html" aria-label="FinKore home">
        <img class="brand-logo" src="img/Finkore-Logo.png" alt="FinKore" width="1013" height="226" decoding="async" />
      </a>
      ${renderLearnNavigation({ current: 'coredoc' })}
    </div>
  </header>
  <main id="main">
    <header class="container core-reader-heading">
      <p class="eyebrow">The principles behind the rules</p>
      <h1>FinKore CoreDoc<span class="accent">.</span></h1>
      <p class="core-reader-lead">${doc.principles.length} principles. ${doc.rules.length} foundational rules. Start with a question and follow the reasoning.</p>
      <p class="core-version">${escape(doc.status)} <span aria-hidden="true">·</span> Document date: ${escape(doc.date)}</p>
      <div class="actions"><a class="button" href="#${anchor(doc.rules[0].id)}">Start with the first rule <span aria-hidden="true">↓</span></a><a class="text-link" href="../docs/coreDoc/core-doc.md">View Markdown source <span aria-hidden="true">↗</span></a></div>
    </header>
    <div class="container core-reader-layout">
      <aside class="core-sidebar"><nav aria-label="CoreDoc table of contents"><p class="eyebrow">On this page</p>${nav}</nav></aside>
      <div class="core-reader-content">
        <details class="core-mobile-index" id="core-mobile-index"><summary>Browse ${doc.principles.length} principles and ${doc.rules.length} rules</summary><nav aria-label="CoreDoc mobile table of contents">${nav}</nav></details>
        <details class="core-context" id="about"><summary>About this document: scope and normative language</summary><div class="core-prose">${renderMarkdown(doc.intro)}</div></details>
${doc.principles.map(p => `        <section class="core-principle" id="${p.anchor}" aria-labelledby="${anchor(p.id)}">
          <header class="core-principle-heading"><p class="eyebrow">${p.id} <span aria-hidden="true">·</span> ${p.rules.length} rules</p><h2 id="${anchor(p.id)}">${escape(p.title)}</h2>${renderMarkdown(p.content)}${history(p)}</header>
${p.rules.map(r => `          <article class="core-rule" tabindex="-1" id="${anchor(r.id)}" aria-labelledby="${anchor(r.id)}-title">
            <header><p class="eyebrow">${r.id}</p><h3 id="${anchor(r.id)}-title">${escape(r.title)}</h3><a class="core-permalink" href="#${anchor(r.id)}" aria-label="Direct link to ${r.id}">Link to this rule <span aria-hidden="true">#</span></a></header>
${r.sections.map((s, i) => `            <section class="core-rule-section${i === 0 ? ' core-rule-statement' : ''}"><h4>${escape(s.title)}</h4>${renderMarkdown(s.body)}</section>`).join('\n')}
            ${history(r)}
            ${ruleNavigation(doc, r)}
          </article>`).join('\n')}
        </section>`).join('\n')}
        <section class="core-appendix core-prose" aria-label="CoreDoc scope and evolution">${renderMarkdown(doc.appendix)}</section>
        <a class="text-link core-back-top" href="#top">Back to the CoreDoc overview ↑</a>
      </div>
    </div>
  </main>
  <footer class="site-footer">
    <div class="container footer-layout">
      <a class="brand" href="#top">FinKore<span class="accent" aria-hidden="true">.</span></a>
      <p>Financial behavior, made explicit.</p>
      <nav aria-label="Project resources"><a href="about.html">About the project</a><a href="contributing.html">Contribute</a><a href="../LICENSE">MPL-2.0</a></nav>
    </div>
  </footer>
</body>
</html>
`
}

export function renderHomeIndex(doc) {
  return `${START}
      <section class="section core-explorer" id="core-explorer" aria-labelledby="core-explorer-title">
        <div class="container core-explorer-layout">
          <div class="section-heading">
            <p class="eyebrow">Explore the CoreDoc</p>
            <h2 id="core-explorer-title">Know the principle.<br />Explore the rule.</h2>
            <p>Start with the question in front of you. Open a principle, choose a rule, and read its reasoning here on the site.</p>
            <p class="core-index-count">${doc.principles.length} principles <span aria-hidden="true">·</span> ${doc.rules.length} foundational rules</p>
            <p class="core-index-note">These are the CoreDoc foundations. The domain specifications refine them into precise requirements.</p>
            <a class="text-link" href="coredoc.html">Read the complete CoreDoc <span aria-hidden="true">↗</span></a>
          </div>
          <div class="core-index-list">
${doc.principles.map(p => `            <details class="core-index-item">
              <summary><span class="core-index-number">${p.id}</span><span class="core-index-title">${escape(p.title)}<span class="core-index-question">${escape(p.question)}</span></span><span class="core-index-toggle" aria-hidden="true">+</span></summary>
              <div class="core-index-body"><a class="core-principle-link" href="coredoc.html#${p.anchor}">Read the principle <span aria-hidden="true">↗</span></a><ol>${p.rules.map(r => `<li><a href="coredoc.html#${anchor(r.id)}"><span>${r.id}</span>${escape(r.title)}<span aria-hidden="true">→</span></a></li>`).join('')}</ol></div>
            </details>`).join('\n')}
          </div>
        </div>
      </section>
      ${END}`
}

export function buildLearnCoreDoc(root = process.cwd(), { check = false } = {}) {
  const doc = parseCoreDoc(readFileSync(resolve(root, SOURCE), 'utf8'))
  const home = readFileSync(resolve(root, HOME), 'utf8')
  if (home.split(START).length !== 2 || home.split(END).length !== 2 || home.indexOf(END) < home.indexOf(START)) throw new Error('learn/index.html: missing or duplicate generated CoreDoc index markers')
  const nextHome = home.slice(0, home.indexOf(START)) + renderHomeIndex(doc) + home.slice(home.indexOf(END) + END.length)
  const reader = renderReader(doc)
  if (check) {
    if (!existsSync(resolve(root, READER)) || readFileSync(resolve(root, READER), 'utf8') !== reader || home !== nextHome) throw new Error('Learn CoreDoc is out of date. Run npm run learn:build and review the generated changes.')
  } else {
    writeFileSync(resolve(root, READER), reader)
    writeFileSync(resolve(root, HOME), nextHome)
  }
  return { principles: doc.principles.length, rules: doc.rules.length }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    if (process.argv.slice(2).some(arg => arg !== '--check')) throw new Error('Usage: node docs/tools/build-learn-coredoc.js [--check]')
    const result = buildLearnCoreDoc(process.cwd(), { check: process.argv.includes('--check') })
    console.log(`Learn CoreDoc ${process.argv.includes('--check') ? 'check passed' : 'generated'}: ${result.principles} principles, ${result.rules} rules. Financial behavior was not executed.`)
  } catch (error) { console.error(error.message); process.exitCode = 1 }
}
