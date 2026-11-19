// SPDX-License-Identifier: MPL-2.0
/**
 * Generates Learn readers for project documents, curated research and approved interviews.
 * This developer tool reads canonical sources without changing them. Build mode
 * writes derived HTML; check mode writes nothing. It does not define or execute
 * financial behavior.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { posix, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { readLearnAssetVersion, versionLearnStylesheets } from './build-learn-assets.js'
import { SPECIFICATION_PAGES } from './learn-specifications.js'
import { decorateSpecification, loadLearnEvidence } from './learn-evidence.js'

export const LEARN_PAGES = [
  { source: 'docs/where-to-start.md', output: 'learn/where-to-start.html', label: 'Where to start', description: 'Understand FinKore, choose your starting point, and work through your first domain slice.' },
  { source: 'README.md', output: 'learn/about.html', label: 'About the project', description: 'What FinKore defines, who it serves, and where to start reading or building.' },
  { source: 'LICENSING.md', output: 'learn/licensing.html', label: 'Licensing', description: 'The project licensing policy, covered materials, and consumer-owned implementations.' },
  { source: 'CONTRIBUTING.md', output: 'learn/contributing.html', label: 'Contribute', description: 'How to propose, review, and verify contributions to the FinKore contract.' },
  { source: 'docs/implementation-guide.md', output: 'learn/implementation-guide.html', label: 'Implementation guide', description: 'Guidance for implementing the portable contract in your own language and stack.' },
  { source: 'docs/releases/README.md', output: 'learn/releases.html', label: 'Release notes', description: 'Published release history. Earlier entries describe historical repository capabilities.' },
  { source: 'experts/legacy/README.md', output: 'learn/legacy.html', label: 'Legacy Archive', description: 'Real stories from the people who built and maintained financial software. Explore the interviews, editorial principles, and ways to share your experience.', presentation: 'legacy-archive' },
  { source: 'learn/research.md', output: 'learn/research.html', label: 'Research', description: 'Explore attributed academic findings, source quotations, and their carefully bounded relevance to FinKore financial software behavior.', presentation: 'research-archive', documentNavigation: false },
  { source: 'learn/reviews.md', output: 'learn/reviews.html', label: 'Expert Reviews', description: 'Explore specialist experience, complete consultations and explicit connections to FinKore financial control principles.', presentation: 'review-archive', documentNavigation: false },
  { source: 'experts/reviews/reports/001-vandeir-silva.md', output: 'learn/review-001-vandeir-silva.html', label: 'Vandeir Silva — Banking operations and financial control', description: 'Banking operations specialist Vandeir Silva shares his experience of reconciliation, accounting adjustments and approval evidence, with comparisons to FinKore and the complete consultation.', presentation: 'review-report', documentNavigation: false,
    review: { id: 'ER-0001', name: 'Vandeir Silva', role: 'Banking operations and accounting reconciliation', questions: 22,
      topics: ['Banking operations', 'Reconciliation', 'Accounting adjustments', 'Approval evidence'],
      introduction: 'Fourteen years in banking, developed primarily at Banco Santander. Vandeir connects the daily work of investigating discrepancies and preparing adjustments to the financial controls those processes depend on.',
      quote: 'What identified and linked the cases was the description of the adjustment entry.' } },
  ...SPECIFICATION_PAGES,
  // Register interviews explicitly after editorial approval; never publish drafts by directory discovery.
  // Archive and interview quotes must preserve the interviewee's words and focus on financial systems, rules, or operational risk.
  { source: 'experts/legacy/interviews/001-elaine-richardson.md', output: 'learn/legacy-001-elaine-richardson.html', label: 'Elaine Richardson — Interview #001', description: 'Elaine Richardson shares her experience with mainframes, COBOL, migrations, error handling, and batch processing. A personal account from the FinKore Legacy Archive.', presentation: 'legacy-interview', documentNavigation: false,
    interview: { name: 'Elaine Richardson', number: '001', portrait: 'img/bio-Elaine-Richardson.jpg', quote: 'Bank’s back-end systems are full of exception handling, covering the exceptions consultants say will “never happen”, but that will happen day 1 of go live, usually with your biggest, most important customer.', featureQuote: 'Bank’s back-end systems are full of exception handling, covering the exceptions consultants say will “never happen”, but that will happen day 1 of go live, usually with your biggest, most important customer.', introduction: 'From a chance opening as a trainee programmer to mainframe migrations and live support. Elaine reflects on a career spent working with the systems people depend on.', topics: ['Mainframes', 'COBOL', 'Migrations', 'Error handling', 'Batch processing'], chapters: ['Finding a way into finance', 'A migration to remember', 'The lessons in unusual code', 'Modernization & recovery', 'What we should never forget', 'A withheld account', 'The dependencies between batch runs'] } },
  { source: 'experts/legacy/interviews/002-otilia-borges.md', output: 'learn/legacy-002-otilia-borges.html', label: 'Otilia Borges — Interview #002', description: 'Otilia Borges shares her experience with COBOL, mainframes, the Collor Plan, and preserving business rules during legacy modernization. A personal account from the FinKore Legacy Archive.', presentation: 'legacy-interview', documentNavigation: false,
    interview: { name: 'Otilia Borges', number: '002', portrait: 'img/bio-Otilia-Borges.jpg', quote: "When we migrate a system to a modern technology, we must make sure we don't accidentally change its business behavior or compromise the integrity of its rules.", featureQuote: "When we migrate a system to a modern technology, we must make sure we don't accidentally change its business behavior or compromise the integrity of its rules.", introduction: 'From COBOL and Assembler at Banco Bradesco to the Collor Plan and mainframe modernization. Otilia reflects on preserving business rules, operational lessons, and a lifetime of learning.', topics: ['COBOL', 'Mainframes', 'Collor Plan', 'Business rules', 'Legacy modernization', 'Generative AI'], chapters: ['Starting young at Bradesco', 'A weekend during the Collor Plan', 'A counter and a thousand pages', 'Preserving business knowledge', 'Learning how to learn'] } },
]
// Editorial HTML keeps its own content; the build shares navigation and CSS versions.
export const LEARN_EDITORIAL_PAGES = ['learn/index.html', 'learn/network.html']
const destinations = new Map(LEARN_PAGES.map(page => [page.source, page.output]))
destinations.set('docs/coreDoc/core-doc.md', 'learn/coredoc.html')
export const GITHUB_PROJECT_URL = 'https://github.com/willgittens/FinKore'
export const GITHUB_FILE_BASE_URL = `${GITHUB_PROJECT_URL}/blob/main/`

export function renderLearnNavigation({ home = false, current } = {}) {
  return `<nav aria-label="Primary navigation">
        <ul class="nav-list">
          <li><a href="where-to-start.html"${current === 'start' ? ' aria-current="page"' : ''}>Where to start</a></li>
          <li><a href="${home ? '#core-explorer' : 'coredoc.html'}"${current === 'coredoc' ? ' aria-current="page"' : ''}>CoreDoc</a></li>
          <li><a href="specification.html"${current === 'specification' ? ' aria-current="page"' : ''}>Specifications</a></li>
          <li><a href="network.html"${current === 'network' ? ' aria-current="page"' : ''}>Join the Network</a></li>
          <li><a class="nav-start" href="${GITHUB_PROJECT_URL}" target="_blank" rel="noopener noreferrer">Github Project <span aria-hidden="true">↗</span></a></li>
        </ul>
      </nav>`
}

export function renderExpertsNavigation(current) {
  return `<nav class="experts-navigation" aria-label="Experts navigation">${[['research', 'Research'], ['legacy', 'Legacy'], ['reviews', 'Reviews']].map(([path, label]) => `<a href="${path}.html"${current === path ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</nav>`
}

const escapeHtml = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;')

export function renderLearnOpenGraph({ title, description, path }) {
  const url = new URL(path, 'https://finkore.dev/').href
  return `<meta property="og:type" content="website" />
  <meta property="og:site_name" content="FinKore" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${escapeHtml(url)}" />
  <meta property="og:image" content="https://finkore.dev/img/imageOpenGraph.jpg" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="FinKore — Define once. Build many times." />`
}

// Only registered readers are redirected. Conformance and other repository
// references retain their original destinations and fragments.
// Learn is the published site root. Keep readers and assets inside it local;
// link repository files outside Learn to GitHub, preserving fragments.
export function learnLink(source, href) {
  if (/^https:\/\/[^\\\s"'<>]+$/.test(href)) return href
  if (/^[a-z][a-z0-9+.-]*:|^\/|[\\\s]/i.test(href)) throw new Error(`Unsupported Learn link: ${href}`)
  if (href.startsWith('#')) return href
  const [path, fragment] = href.split('#')
  const target = posix.normalize(posix.join(posix.dirname(source), path))
  if (target === '..' || target.startsWith('../')) throw new Error(`Escaping Learn link: ${href}`)
  const destination = destinations.has(target) ? posix.relative('learn', destinations.get(target)) :
    target.startsWith('learn/') ? posix.relative('learn', target) : GITHUB_FILE_BASE_URL + target
  return destination + (fragment === undefined ? '' : `#${fragment}`)
}
const linkAttributes = (source, href) => {
  const destination = learnLink(source, href)
  return `href="${escapeHtml(destination)}"${destination.startsWith('https://') ? ' target="_blank" rel="noopener noreferrer"' : ''}`
}

function inline(text, source, autolinks = true) {
  const tokens = /(`[^`]+`|\*\*[^*]+\*\*|\*(?:\*\*[^*]+\*\*|[^*\n])+\*|\[[^\]]+\]\([^)]+\)|https:\/\/[^\s<>"']+| {2,}\n)/g
  let output = '', last = 0
  for (const match of text.matchAll(tokens)) {
    output += escapeHtml(text.slice(last, match.index))
    const token = match[0]
    if (token.startsWith('`')) output += `<code>${escapeHtml(token.slice(1, -1))}</code>`
    else if (token.startsWith('**')) output += `<strong>${inline(token.slice(2, -2), source, autolinks)}</strong>`
    else if (token.startsWith('*')) output += `<em>${inline(token.slice(1, -1), source, autolinks)}</em>`
    else if (token.startsWith('https://')) {
      const href = token.replace(/[.,;:!?]+$/, '')
      output += autolinks ? `<a ${linkAttributes(source, href)}>${escapeHtml(href)}</a>${escapeHtml(token.slice(href.length))}` : escapeHtml(token)
    }
    else if (token.endsWith('\n')) output += '<br />\n'
    else {
      const [, label, href] = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      output += `<a ${linkAttributes(source, href)}>${inline(label, source, false)}</a>`
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
    if (/^ {0,3}(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      blocks.push('<hr />')
      i++; continue
    }
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
    const namedAnchor = line.match(/^<a id="([a-z][a-z0-9-]*)"><\/a>$/)
    if (namedAnchor) {
      if (used.has(namedAnchor[1])) throw new Error(`Duplicate Learn anchor: ${namedAnchor[1]}`)
      used.set(namedAnchor[1], 1)
      blocks.push(`<span id="${namedAnchor[1]}"></span>`)
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
    if (/^>(?: |$)/.test(line)) {
      const paragraphs = [], paragraph = []
      while (i < lines.length && /^>(?: |$)/.test(lines[i])) {
        const text = lines[i++].replace(/^> ?/, '')
        if (/^(?:>|#{1,6} |\d+\. |[-*] |\||```| {4})/.test(text)) throw new Error(`Unsupported Learn blockquote in ${source}: ${text}`)
        if (text.trim()) paragraph.push(text)
        else if (paragraph.length) paragraphs.push(paragraph.splice(0).join(' '))
      }
      if (paragraph.length) paragraphs.push(paragraph.join(' '))
      blocks.push(`<blockquote>${paragraphs.map(text => `<p>${inline(text, source)}</p>`).join('')}</blockquote>`)
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
      let content = raw.join(' ')
      const themePair = content.match(/^<img src="([^"]+)#gh-light-mode-only" alt="([^"]+)" width="(\d+)" \/> <img src="([^"]+)#gh-dark-mode-only" alt="\2" width="\3" \/>$/)
      if (themePair) {
        // Learn's document surface is light; GitHub's theme markers do not apply.
        learnLink(source, themePair[4])
        content = `<img src="${themePair[1]}" alt="${themePair[2]}" width="${themePair[3]}" />`
      }
      const image = /<img src="([^"]+)" alt="([^"]+)" width="(\d+)" \/>/
      const match = content.match(image)
      const wrapper = content.replace(image, '').trim()
      if (!match || !/^(?:|<a href="https:\/\/savoiabarker\.com\/" target="_blank" rel="noopener noreferrer">\s*<\/a>)$/.test(wrapper)) throw new Error(`Unsupported Learn image markup: ${source}`)
      const img = `<img class="learn-document-image" src="${escapeHtml(learnLink(source, match[1]))}" alt="${escapeHtml(match[2])}" width="${match[3]}" loading="lazy" decoding="async" />`
      blocks.push(`<p>${wrapper ? `<a ${linkAttributes(source, 'https://savoiabarker.com/')}>${img}</a>` : img}</p>`)
      i++; continue
    }
    const paragraph = []
    do { paragraph.push(lines[i++]) } while (i < lines.length && lines[i].trim() && !/^(?:#{1,6} |\d+\. |- |---|\*\*\*|___|\||```|<!--|>)/.test(lines[i]))
    let text = paragraph.map((line, index) => line + (index < paragraph.length - 1 ? (/ {2,}$/.test(line) ? '\n' : ' ') : '')).join('')
    // Preserve README's canonical website link using the same safe link renderer.
    text = text.replace(/<a href="(https:\/\/finkore\.dev)" target="_blank" rel="noopener noreferrer">https:\/\/finkore\.dev<\/a>/g, '[$1]($1)')
    if (/^(?:>|\* | {4}|<)/.test(text)) throw new Error(`Unsupported Learn block in ${source}: ${text.slice(0, 80)}`)
    blocks.push(`<p>${inline(text, source)}</p>`)
  }
  if (!title) throw new Error(`Missing Learn document title: ${source}`)
  return { title, titleId, headings, html: blocks.join('\n') }
}

// Legacy uses an editorial presentation while retaining canonical text and anchors.
function legacySections(doc) {
  const [introduction, ...parts] = doc.html.replace(/<h1\b[^>]*>[\s\S]*?<\/h1>\n?/, '').split(/(?=<h2\b)/)
  return { introduction, sections: parts.map(part => {
    const match = part.match(/^<h2 id="([^"]+)">([\s\S]*?)<\/h2>\n?([\s\S]*)$/)
    if (!match) throw new Error('Unsupported Legacy section structure')
    return { id: match[1], title: match[2], body: match[3] }
  }) }
}

function legacyTags(topics) {
  return `<ul class="legacy-tags" aria-label="Topics">${topics.map(topic => `<li>${escapeHtml(topic)}</li>`).join('')}</ul>`
}

function legacyWelcome() {
  return `<section class="legacy-welcome" aria-labelledby="legacy-welcome-title"><div class="container legacy-welcome-layout">
    <div><p class="eyebrow">New to FinKore?</p><h2 id="legacy-welcome-title">Experience starts the conversation.</h2></div>
    <div><p>FinKore is an open-source specification for predictable, auditable, portable financial software behavior. The archive preserves professional history and brings real experience into the conversation.</p><p>Interviews are personal accounts. Any proposed financial rule follows the project's specification and review process.</p><a class="text-link" href="where-to-start.html">Get to know FinKore <span aria-hidden="true">→</span></a></div>
  </div></section>`
}

function renderLegacyArchive(doc) {
  const { introduction, sections } = legacySections(doc)
  const find = id => {
    const section = sections.find(section => section.id === id)
    if (!section) throw new Error(`Missing Legacy Archive section: ${id}`)
    return section
  }
  const catalogue = find('interviews')
  let indexedInterviews = 0
  const cards = catalogue.body.replace(/<div class="core-table"><table>[\s\S]*?<tbody>([\s\S]*?)<\/tbody><\/table><\/div>/, (_, rows) => {
    return `<div class="legacy-interviews">${[...rows.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(row => {
      const cells = [...row[1].matchAll(/<td>([\s\S]*?)<\/td>/g)].map(cell => cell[1])
      const destination = cells[0]?.match(/href="([^"]+)"/)?.[1]
      const page = LEARN_PAGES.find(page => page.presentation === 'legacy-interview' && posix.basename(page.output) === destination)
      if (!page || cells.length !== 3 || cells[1] !== escapeHtml(page.interview.name)) throw new Error('Legacy index must reference registered interviews and their approved names')
      indexedInterviews++
      const interview = page.interview
      if (cells[2].toLowerCase() !== escapeHtml(interview.topics.join(', ').toLowerCase())) throw new Error('Legacy index topics differ from the registered editorial topics')
      return `<article class="legacy-feature" aria-labelledby="interview-${escapeHtml(interview.number)}">
        <div class="legacy-feature-art" aria-hidden="true"><span>FinKore<br />Legacy Archive</span><span class="legacy-feature-number">${escapeHtml(interview.number)}</span><span>Stories worth keeping.</span></div>
        <div class="legacy-feature-copy"><p class="eyebrow">The conversation / No. ${escapeHtml(interview.number)}</p><h3 id="interview-${escapeHtml(interview.number)}"><a href="${escapeHtml(destination)}">${cells[1]}</a></h3><p class="legacy-feature-intro">${escapeHtml(interview.introduction)}</p>${legacyTags(interview.topics)}
        <blockquote><p>“${escapeHtml(interview.featureQuote)}”</p><cite>${cells[1]}</cite></blockquote>
        <a class="button" href="${escapeHtml(destination)}">Read the interview <span aria-hidden="true">→</span></a></div>
      </article>`
    }).join('')}</div>`
  })
  if (!indexedInterviews) throw new Error('Legacy Archive requires an approved interview index')
  // Keep the repository-storage explanation with the source link, away from the reading entry point.
  const storageNote = cards.match(/^<p>Interviews are kept as individual Markdown files in [\s\S]*?<\/p>\n/)?.[0] ?? ''
  const otherSections = sections.filter(section => !['interviews', 'why-this-archive-exists'].includes(section.id)).map(section => {
    const content = `<h2 id="${section.id}">${section.title}</h2>${section.id === 'editorial-principles' ? `<details class="legacy-principles"><summary>How we protect people's voices and their trust <span aria-hidden="true">+</span></summary><div>${section.body}</div></details>` : `<div class="legacy-prose">${section.body}</div>`}`
    return `<section class="legacy-section legacy-${section.id}"><div class="container">${content}</div></section>`
  }).join('\n')
  return `<header class="legacy-archive-hero"><div class="container">
    <nav class="legacy-breadcrumb" aria-label="Breadcrumb"><a href="network.html#legacy">FinKore Experts</a><span aria-hidden="true">/</span><span>Legacy Archive</span></nav>
    ${renderExpertsNavigation('legacy')}
    <p class="eyebrow">An oral history of financial software</p>
    <div class="legacy-hero-layout"><h1 id="${escapeHtml(doc.titleId)}">The people behind<br /><span>financial software.</span></h1><div><p class="legacy-deck">Real stories from the people who built and maintained financial software.</p><p>Careers, unexpected incidents, difficult decisions, and lessons that deserve to outlive the systems themselves.</p><div class="actions"><a class="button" href="#interviews">Meet the people <span aria-hidden="true">↓</span></a><a class="text-link" href="#share-your-story">Share your story <span aria-hidden="true">↗</span></a></div></div></div>
  </div></header>
  <section class="legacy-section legacy-catalogue"><div class="container"><div class="legacy-section-heading"><div><p class="eyebrow">The collection</p><h2 id="interviews">Conversations worth keeping.</h2></div><p>In their own words.<br />For the next generation.</p></div>${cards.slice(storageNote.length)}</div></section>
  <section class="legacy-section legacy-purpose"><div class="container legacy-purpose-layout"><div><p class="eyebrow">More than a record of the past</p><h2 id="why-this-archive-exists">${find('why-this-archive-exists').title}</h2><div class="legacy-prose">${introduction}</div></div><div class="legacy-prose">${find('why-this-archive-exists').body}</div></div></section>
  ${otherSections}
  <div class="container legacy-source"><details><summary>About the archive source</summary>${storageNote}</details></div>
  ${legacyWelcome()}`
}

function renderResearchArchive(doc) {
  const { introduction, sections } = legacySections(doc)
  const pending = sections.find(section => section.id === 'further-investigation')
  const method = sections.find(section => section.id === 'reading-the-evidence')
  const groups = sections.filter(section => !['further-investigation', 'reading-the-evidence'].includes(section.id))
  if (!pending || !method || !groups.length) throw new Error('Research requires findings, follow-up and evidence guidance')
  const seen = new Set()
  const cards = groups.map(group => {
    const entries = group.body.split(/(?=<h3\b)/).filter(entry => entry.trim())
    const content = entries.map(entry => {
      const heading = entry.match(/^<h3 id="[^"]+">(REV-\d{4}) — ([\s\S]*?)<\/h3>/)
      if (!heading || seen.has(heading[1])) throw new Error('Research findings require unique review IDs')
      const id = heading[1].toLowerCase()
      seen.add(heading[1])
      let body = entry.slice(heading[0].length)
      const authors = [...body.matchAll(/<li><strong>Authors:<\/strong> ([\s\S]*?)<\/li>/g)].map(match => match[1])
      const quotes = [...body.matchAll(/<blockquote>[\s\S]*?<\/blockquote>/g)].map(match => match[0])
      const studies = [...body.matchAll(/<li><strong>Study:<\/strong> ([\s\S]*?)<\/li>/g)].map(match => match[1])
      const locations = [...body.matchAll(/<li><strong>Location:<\/strong> ([\s\S]*?)<\/li>/g)]
      const benefit = body.match(/<p><strong>FinKore benefit\.<\/strong> ([\s\S]*?)<\/p>/)?.[0]
      if (!authors.length || quotes.length !== authors.length || studies.length !== authors.length || locations.length !== authors.length || !benefit || !body.includes('<strong>Conditions and limits.</strong>')) throw new Error(`Incomplete Research attribution or limits: ${heading[1]}`)
      body = body.replace(benefit, '')
      for (const quote of quotes) body = body.replace(quote, '')
      return `<article class="research-finding" id="${id}" aria-labelledby="${id}-title">
        <header><p class="eyebrow">Research note / ${heading[1].slice(4)}</p><h3 id="${id}-title">${heading[2]}</h3><p class="research-status">Preliminary finding · pending validation</p></header>
        ${quotes.map((quote, index) => `<figure class="research-quotation">${quote}<figcaption>${authors[index]}<span>${studies[index]}</span></figcaption></figure>`).join('')}
        <div class="research-benefit">${benefit}</div>
        <details class="research-evidence"><summary>Study, source &amp; scope <span aria-hidden="true">+</span></summary><div class="research-evidence-body">${body}</div></details>
      </article>`
    }).join('\n')
    return `<section class="research-topic" aria-labelledby="${group.id}"><div class="research-topic-heading"><h2 id="${group.id}">${group.title}</h2><span>${entries.length} ${entries.length === 1 ? 'finding' : 'findings'}</span></div><div class="research-findings-grid">${content}</div></section>`
  }).join('\n')
  const waiting = [...pending.body.matchAll(/<td>Needs more evidence<\/td>/g)].length
  const excluded = [...pending.body.matchAll(/<td>Not recommended for reuse<\/td>/g)].length
  return `<header class="legacy-archive-hero research-hero"><div class="container">
    <nav class="legacy-breadcrumb" aria-label="Breadcrumb"><a href="network.html#contributors">FinKore Experts</a><span aria-hidden="true">/</span><span>Research</span></nav>
    ${renderExpertsNavigation('research')}
    <p class="eyebrow">FinKore Experts / Research</p>
    <div class="legacy-hero-layout"><h1 id="${escapeHtml(doc.titleId)}">Research behind<br /><span>the rules.</span></h1><div><p class="legacy-deck">Read the findings.<br />Follow the evidence.</p><p>Explore what published work can contribute to predictable, auditable financial software. Source passages, their context, and their relevance to FinKore, together in one place.</p><div class="actions"><a class="button" href="#findings">Explore the findings <span aria-hidden="true">↓</span></a><a class="text-link" href="#reading-the-evidence">How to read the evidence</a></div></div></div>
    <dl class="research-overview"><div><dt>Findings to explore</dt><dd>${seen.size}</dd></div><div><dt>Need more evidence</dt><dd>${waiting}</dd></div><div><dt>Not recommended for reuse</dt><dd>${excluded}</dd></div></dl>
  </div></header>
  <div class="container research-catalogue" id="findings"><div class="legacy-section-heading"><div><p class="eyebrow">The collection</p><h2>Questions worth investigating.</h2></div><p>Academic evidence.<br />Careful interpretation.</p></div>
    <nav class="research-topics" aria-label="Research topics">${groups.map(group => `<a href="#${group.id}">${group.title}</a>`).join('')}<a href="#further-investigation">Further investigation</a></nav>
    <p class="research-intro">Every note is preliminary. A quotation supports a discussion; it does not make the interpretation an accepted FinKore rule.</p>${cards}
  </div>
  <section class="legacy-section research-pending"><div class="container"><p class="eyebrow">The open questions</p><h2 id="further-investigation">${pending.title}</h2><details><summary>${waiting} considerations need more evidence; ${excluded} is not recommended for reuse <span aria-hidden="true">+</span></summary><div class="research-evidence-body">${pending.body}</div></details></div></section>
  <section class="legacy-section legacy-purpose"><div class="container legacy-purpose-layout"><div><p class="eyebrow">From a paper to a discussion</p><h2 id="reading-the-evidence">${method.title}</h2><div class="legacy-prose">${introduction}</div></div><div class="legacy-prose">${method.body}</div></div></section>
  <section class="legacy-welcome"><div class="container legacy-welcome-layout"><div><p class="eyebrow">New to FinKore?</p><h2>Financial behavior,<br />made explicit.</h2></div><div><p>FinKore is an open-source specification for predictable, auditable, portable financial domain behavior. Research helps us ask better questions about that behavior.</p><p>Explore the foundation, read a practitioner's story, or bring your own expertise to a discussion.</p><div class="actions"><a class="text-link" href="where-to-start.html">Get to know FinKore <span aria-hidden="true">→</span></a><a class="text-link" href="reviews.html">Explore Reviews <span aria-hidden="true">→</span></a></div></div></div></section>`
}

function renderLegacyInterview(page, markdown, doc) {
  const interview = page.interview
  if (!markdown.includes(`**Interviewee:** ${interview.name}`) || !markdown.includes(interview.quote) || !interview.featureQuote || !markdown.includes(interview.featureQuote)) throw new Error(`Legacy editorial name or quotation differs from its source: ${page.source}`)
  const { introduction, sections } = legacySections(doc)
  const questions = doc.headings.filter(heading => heading.level === 3)
  if (questions.length !== interview.chapters.length) throw new Error(`Update Legacy chapter labels after changing questions: ${page.source}`)
  const chapterLinks = questions.map((heading, index) => `<a href="#${escapeHtml(heading.id)}"><span>${String(index + 1).padStart(2, '0')}</span>${escapeHtml(interview.chapters[index])}</a>`).join('') + '<a href="#editorial-note-privacy-and-confidentiality"><span>—</span>Editorial note</a>'
  const readingMinutes = Math.ceil(markdown.split(/\s+/).length / 200)
  const profile = markdown.match(/^\*\*LinkedIn Profile:\*\* (https:\/\/\S+)/m)?.[1]
  const portrait = interview.portrait ? `<img class="legacy-portrait" src="${escapeHtml(interview.portrait)}" alt="Portrait of ${escapeHtml(interview.name)}" width="600" height="600" decoding="async" />` : ''
  const body = sections.map(section => `<section class="legacy-conversation"><h2 id="${section.id}">${section.title}</h2>${section.body.replace(/(<h3\b[\s\S]*?)(?=<h3\b|<hr \/>|$)/g, '<section class="legacy-question">$1</section>')}</section>`).join('\n')
  return `<header class="legacy-interview-hero"><div class="container">
    <nav class="legacy-breadcrumb" aria-label="Breadcrumb"><a href="legacy.html#interviews">Back to the Legacy Archive</a><span aria-hidden="true">/</span><span>Interview ${escapeHtml(interview.number)}</span></nav>
    <div class="legacy-interview-heading"><div class="legacy-interview-profile">${portrait}<div class="legacy-interview-info"><p class="eyebrow">FinKore Legacy Archive / No. ${escapeHtml(interview.number)}</p><h1 id="${escapeHtml(doc.titleId)}">${escapeHtml(interview.name)}</h1><p class="legacy-deck">${escapeHtml(interview.introduction)}</p>${legacyTags(interview.topics)}<p class="legacy-byline">A conversation from the FinKore Legacy Archive <span aria-hidden="true">·</span> About ${readingMinutes} min read${profile ? ` <span aria-hidden="true">·</span> <a ${linkAttributes(page.source, profile)}>LinkedIn profile ↗</a>` : ''}</p><a class="text-link" href="#the-interview">Start reading <span aria-hidden="true">↓</span></a></div></div>
    <figure class="legacy-pullquote"><span aria-hidden="true">“</span><blockquote><p>${escapeHtml(interview.quote)}</p></blockquote><figcaption>${escapeHtml(interview.name)}<span>From the interview</span></figcaption></figure></div>
  </div></header>
  <div class="container legacy-reading-layout"><aside class="legacy-chapters"><p class="eyebrow">In this conversation</p><nav aria-label="Interview navigation">${chapterLinks}</nav><a class="legacy-all-interviews" href="legacy.html#interviews">← All interviews</a></aside>
  <div class="legacy-reading-main"><details class="legacy-mobile-index"><summary>In this conversation</summary><nav aria-label="Mobile interview navigation">${chapterLinks}</nav></details>
    <details class="legacy-record"><summary>About this interview &amp; its publication</summary><div>${introduction}</div></details>
    <article class="legacy-story" aria-label="${escapeHtml(doc.title)}">${body}</article>
    <div class="legacy-reading-end"><p class="eyebrow">The conversation continues</p><h2>Every career holds a story worth sharing.</h2><div class="actions"><a class="button" href="legacy.html#share-your-story">Share your experience <span aria-hidden="true">→</span></a><a class="text-link" href="legacy.html#interviews">Back to the archive</a></div></div>
  </div></div>${legacyWelcome()}`
}

function renderReviewArchive(doc) {
  const { introduction, sections } = legacySections(doc)
  const find = id => {
    const section = sections.find(section => section.id === id)
    if (!section) throw new Error(`Missing Reviews section: ${id}`)
    return section
  }
  const rows = find('reports').body.match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1]
  const cards = [...(rows ?? '').matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(row => {
    const cells = [...row[1].matchAll(/<td>([\s\S]*?)<\/td>/g)].map(cell => cell[1])
    const destination = cells[0]?.match(/href="([^"]+)"/)?.[1]
    const page = LEARN_PAGES.find(page => page.presentation === 'review-report' && posix.basename(page.output) === destination)
    if (!page || cells.length !== 3 || cells[1] !== escapeHtml(page.review.name) || cells[2] !== escapeHtml(page.review.topics.join(', '))) throw new Error('Reviews index must reference registered reports, specialist names and topics')
    const review = page.review
    const initials = review.name.split(' ').map(part => part[0]).join('')
    return `<article class="legacy-feature review-feature" aria-labelledby="report-${review.id.toLowerCase()}">
      <div class="legacy-feature-art review-feature-art" aria-hidden="true"><span>FinKore<br />Expert Reviews</span><span class="legacy-feature-number">${escapeHtml(initials)}</span><span>${escapeHtml(review.id)}<br />Banking operations</span></div>
      <div class="legacy-feature-copy"><p class="eyebrow">Specialist report / ${escapeHtml(review.id)}</p><h3 id="report-${review.id.toLowerCase()}"><a href="${escapeHtml(destination)}">${cells[1]}</a></h3><p class="review-report-title">${cells[0].replace(/<\/?a\b[^>]*>/g, '')}</p><p class="legacy-feature-intro">${escapeHtml(review.introduction)}</p>${legacyTags(review.topics)}
      <blockquote><p>“${escapeHtml(review.quote)}”</p><cite>${cells[1]} · From the translated interview</cite></blockquote><a class="button" href="${escapeHtml(destination)}">Read the report</a><p class="review-card-note">Full professional profile · ${review.questions} questions and answers</p></div>
    </article>`
  }).join('')
  if (!cards) throw new Error('Reviews requires an explicitly registered report index')
  const areas = find('expert-review-areas')
  const areaAliases = ['accounting', 'audit', 'approvals', 'legal', 'payments', 'tax', 'identity', 'risk']
  const areaParts = areas.body.split(/(?=<h3\b)/).filter(part => part.trim())
  if (areaParts.length !== areaAliases.length) throw new Error('Reviews requires the eight consultation areas')
  const areaCards = areaParts.map((part, index) => `<article class="review-area" id="review-${areaAliases[index]}-title">${part}</article>`).join('')
  const section = (id, extraClass = '', alias = '') => {
    const item = find(id)
    return `<section class="legacy-section ${extraClass}"><div class="container"><h2 id="${item.id}">${alias ? `<span id="${alias}"></span>` : ''}${item.title}</h2><div class="legacy-prose">${item.body}</div></div></section>`
  }
  return `<header class="legacy-archive-hero"><div class="container">
    <nav class="legacy-breadcrumb" aria-label="Breadcrumb"><a href="network.html#expert-review">FinKore Experts</a><span aria-hidden="true">/</span><span>Reviews</span></nav>${renderExpertsNavigation('reviews')}
    <p class="eyebrow">Specialist experience / Financial controls</p><div class="legacy-hero-layout"><h1 id="${escapeHtml(doc.titleId)}">Experience that<br /><span>explains the rules.</span></h1><div><p class="legacy-deck">Professional experience, connected to the financial principles it helps explain.</p><p>Meet the specialists, follow the comparisons and read the complete conversations.</p><div class="actions"><a class="button" href="#reports">Explore the reports</a><a class="text-link" href="#expert-review-areas-title">Contribute your expertise</a></div></div></div>
  </div></header>
  <section class="legacy-section legacy-catalogue"><div class="container"><div class="legacy-section-heading"><div><p class="eyebrow">The collection</p><h2 id="reports">From practice to principle.</h2></div><p>Professional context.<br />Explicit connections. Complete interviews.</p></div>${cards}</div></section>
  <section id="expert-review" class="legacy-section legacy-purpose"><div class="container legacy-purpose-layout"><div><p class="eyebrow">FinKore Expert Review Program</p><h2 id="why-expert-consultation-matters"><span id="expert-review-title"></span>${find('why-expert-consultation-matters').title}</h2><div class="legacy-prose">${introduction}</div></div><div class="legacy-prose">${find('why-expert-consultation-matters').body}</div></div></section>
  <section class="legacy-section"><div class="container"><p class="eyebrow">Bring your perspective</p><h2 id="${areas.id}"><span id="expert-review-areas-title"></span>${areas.title}</h2><div class="review-areas-grid">${areaCards}</div></div></section>
  ${section('how-the-expert-review-program-works', 'review-process', 'expert-review-process-title')}
  ${section('contribute-your-experience', 'legacy-share-your-story')}
  ${section('reading-the-comparisons', 'review-method')}`
}

function renderReviewReport(page, markdown, doc) {
  const review = page.review
  const interview = markdown.split('<a id="interview"></a>')[1]
  const questions = [...(interview ?? '').matchAll(/<a id="(er-\d{4}-q\d{2})"><\/a>\s*### ([^\n]+)/g)]
  if (!markdown.startsWith(`# ${review.id} — `) || markdown.match(/^\*\*Specialist:\*\* ([^·\n]+)/m)?.[1].trim() !== review.name || !interview?.includes(review.quote)) throw new Error(`Review editorial name or quotation differs from its source: ${page.source}`)
  if (questions.length !== review.questions || questions.some((question, index) => question[1] !== `${review.id.toLowerCase()}-q${String(index + 1).padStart(2, '0')}`)) throw new Error('Review must retain its complete, sequential interview')
  const navigation = doc.headings.filter(heading => heading.level === 2).map(heading => `<a href="#${heading.id === 'interview-1' ? 'interview' : escapeHtml(heading.id)}">${escapeHtml(heading.title)}</a>`).join('')
  const questionLinks = questions.map(question => `<a href="#${question[1]}">${escapeHtml(question[2])}</a>`).join('')
  const contents = `${navigation}<details class="review-question-index"><summary>All ${review.questions} questions</summary>${questionLinks}</details>`
  const title = doc.title.replace(`${review.id} — `, '')
  const start = doc.headings.find(heading => heading.level === 2)?.id
  const body = doc.html.replace(/<h1\b[^>]*>[\s\S]*?<\/h1>\n?/, '')
  return `<header class="legacy-interview-hero"><div class="container">
    <nav class="legacy-breadcrumb" aria-label="Breadcrumb"><a href="reviews.html#reports">Back to Reviews</a><span aria-hidden="true">/</span><span>${escapeHtml(review.id)}</span></nav>${renderExpertsNavigation('reviews')}
    <div class="review-report-heading"><p class="eyebrow">FinKore Expert Reviews / ${escapeHtml(review.id)}</p><h1 id="${escapeHtml(doc.titleId)}">${escapeHtml(title)}</h1><p class="review-specialist">${escapeHtml(review.name)}<span>${escapeHtml(review.role)}</span></p><p class="legacy-deck">${escapeHtml(review.introduction)}</p>${legacyTags(review.topics)}<div class="actions"><a class="button" href="#${escapeHtml(start)}">Read the report</a><a class="text-link" href="#interview">Read the complete interview</a></div></div>
  </div></header>
  <div class="container legacy-reading-layout"><aside class="legacy-chapters"><p class="eyebrow">In this report</p><nav aria-label="Report navigation">${contents}</nav><a class="legacy-all-interviews" href="reviews.html#reports">All specialist reports</a></aside>
  <div class="legacy-reading-main"><details class="legacy-mobile-index"><summary>In this report</summary><nav aria-label="Mobile report navigation">${contents}</nav></details><article class="legacy-story review-story" aria-label="${escapeHtml(doc.title)}">${body}</article><div class="legacy-reading-end"><p class="eyebrow">Continue exploring</p><h2>Follow the principle behind the experience.</h2><div class="actions"><a class="button" href="coredoc.html">Explore CoreDoc</a><a class="text-link" href="reviews.html#reports">Back to Reviews</a></div></div></div></div>`
}

function renderLegacyPage(page, markdown, doc, assetVersion) {
  const research = page.presentation === 'research-archive'
  const reviews = page.presentation.startsWith('review-')
  const content = research ? renderResearchArchive(doc) : page.presentation === 'review-archive' ? renderReviewArchive(doc) : page.presentation === 'review-report' ? renderReviewReport(page, markdown, doc) : page.presentation === 'legacy-archive' ? renderLegacyArchive(doc) : renderLegacyInterview(page, markdown, doc)
  return versionLearnStylesheets(`<!doctype html>
<!-- SPDX-License-Identifier: MPL-2.0 -->
<!-- Generated from ${page.source} by npm run learn:build. Do not edit this file directly. -->
<html lang="en"><head>
  <meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#f9f7f2" /><title>${escapeHtml(page.label)} — FinKore</title>
  <meta name="description" content="${escapeHtml(page.description)}" />
  ${renderLearnOpenGraph({ title: `${page.label} — FinKore`, description: page.description, path: posix.basename(page.output) })}
  <link rel="icon" type="image/png" href="img/Finkore_Favicon.png" />
  <link rel="stylesheet" href="css/styles.css" /><link rel="stylesheet" href="css/legacy.css" />${research ? '\n  <link rel="stylesheet" href="css/research.css" />' : ''}${reviews ? '\n  <link rel="stylesheet" href="css/reviews.css" />' : ''}
</head><body id="top" class="legacy-page ${research ? 'research-page ' : ''}${page.presentation}">
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header"><div class="container header-layout"><a class="brand" href="index.html" aria-label="FinKore home"><img class="brand-logo" src="img/Finkore-Logo.png" alt="FinKore" width="1013" height="226" decoding="async" /></a>${renderLearnNavigation()}</div></header>
  <main id="main">${content}</main>
  <div class="container legacy-colophon"><a href="${GITHUB_FILE_BASE_URL}${page.source}" target="_blank" rel="noopener noreferrer">View Markdown source ↗</a><a href="#top">Back to the top ↑</a></div>
  <footer class="site-footer"><div class="container footer-layout"><a class="brand" href="index.html"><img class="brand-logo" src="img/Finkore_White.png" alt="FinKore" width="1021" height="293" loading="lazy" decoding="async" /></a><p>Financial behavior, made explicit.</p><nav aria-label="Project resources"><a href="about.html">About the project</a><a href="contributing.html">Contribute</a><a href="${GITHUB_FILE_BASE_URL}LICENSE" target="_blank" rel="noopener noreferrer">MPL-2.0</a></nav></div></footer>
</body></html>`, assetVersion)
}

export function renderLearnPage(page, markdown, assetVersion, { evidence } = {}) {
  const doc = renderLearnMarkdown(markdown, page.source)
  if (page.presentation?.startsWith('legacy-') || page.presentation?.startsWith('review-') || page.presentation === 'research-archive') return renderLegacyPage(page, markdown, doc, assetVersion)
  const navigation = doc.headings.filter(h => h.level >= 2 && h.level <= (page.tocDepth ?? 2)).map(h => `<a class="core-nav-intro${h.level === 3 ? ' learn-nav-question' : ''}" href="#${escapeHtml(h.id)}">${escapeHtml(h.title)}</a>`).join('\n')
  return versionLearnStylesheets(`<!doctype html>
<!-- SPDX-License-Identifier: MPL-2.0 -->
<!-- Generated from ${page.source} by npm run learn:build. Do not edit this file directly. -->
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#ffffff" />
  <title>${escapeHtml(page.label)} — FinKore</title>
  <meta name="description" content="${escapeHtml(page.description)}" />
  ${renderLearnOpenGraph({ title: `${page.label} — FinKore`, description: page.description, path: posix.basename(page.output) })}
  <link rel="icon" type="image/png" href="img/Finkore_Favicon.png" />
  <link rel="stylesheet" href="css/styles.css" />
  <link rel="stylesheet" href="css/coredoc.css" />
  <link rel="stylesheet" href="css/documents.css" />
</head>
<body id="top" class="core-reader learn-document">
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="container header-layout">
      <a class="brand" href="index.html" aria-label="FinKore home"><img class="brand-logo" src="img/Finkore-Logo.png" alt="FinKore" width="1013" height="226" decoding="async" /></a>
      ${renderLearnNavigation({ current: page.presentation === 'specification' ? 'specification' : page.output === 'learn/where-to-start.html' ? 'start' : undefined })}
    </div>
  </header>
  <main id="main">
    <header class="container core-reader-heading">
      <p class="eyebrow">${escapeHtml(page.label)}</p>
      <h1 id="${escapeHtml(doc.titleId)}">${escapeHtml(doc.title)}</h1>
      <p class="core-reader-lead">${escapeHtml(page.description)}</p>
      <div class="actions"><a class="text-link" href="${GITHUB_FILE_BASE_URL}${page.source}" target="_blank" rel="noopener noreferrer">View Markdown source <span aria-hidden="true">↗</span></a></div>${page.parent ? `\n      <p class="learn-parent"><a class="text-link" href="${escapeHtml(page.parent.href)}">← ${escapeHtml(page.parent.label)}</a></p>` : ''}
      <nav class="learn-document-links" aria-label="Learn documents">${LEARN_PAGES.filter(p => p.documentNavigation !== false).map(p => `<a href="${posix.basename(p.output)}"${p === page ? ' aria-current="page"' : ''}>${escapeHtml(p.label)}</a>`).join('')}<a href="coredoc.html">CoreDoc</a></nav>${page.presentation === 'specification' ? `\n      <nav class="learn-document-links spec-domain-links" aria-label="Specification domains">${SPECIFICATION_PAGES.filter(p => /\/README\.md$/.test(p.source)).map(p => `<a href="${posix.basename(p.output)}"${p === page ? ' aria-current="page"' : ''}>${escapeHtml(p.label)}</a>`).join('')}</nav>` : ''}
    </header>
    <div class="container core-reader-layout">
      <aside class="core-sidebar"><nav aria-label="Table of contents"><p class="eyebrow">On this page</p>${navigation}</nav></aside>
      <div class="core-reader-content">
        <details class="learn-document-index"><summary>On this page</summary><nav aria-label="Mobile table of contents">${navigation}</nav></details>
        <article class="core-prose learn-document-prose" aria-label="${escapeHtml(doc.title)}">
${(page.presentation === 'specification' ? decorateSpecification(doc.html, markdown, page.source, evidence) : doc.html).replace(/<h1\b[^>]*>[\s\S]*?<\/h1>\n?/, '')}
        </article>
        <a class="text-link core-back-top" href="#top">Back to the top ↑</a>
      </div>
    </div>
  </main>
  <footer class="site-footer"><div class="container footer-layout">
    <a class="brand" href="index.html"><img class="brand-logo" src="img/Finkore_White.png" alt="FinKore" width="1021" height="293" loading="lazy" decoding="async" /></a><p>Financial behavior, made explicit.</p>
    <nav aria-label="Project resources"><a href="about.html">About the project</a><a href="contributing.html">Contribute</a><a href="${GITHUB_FILE_BASE_URL}LICENSE" target="_blank" rel="noopener noreferrer">MPL-2.0</a></nav>
  </div></footer>
</body>
</html>
`, assetVersion)
}

export function buildLearnPages(root = process.cwd(), { check = false } = {}) {
  const assetVersion = readLearnAssetVersion(root)
  const evidence = loadLearnEvidence(root)
  const outputs = LEARN_PAGES.map(page => [page.output, renderLearnPage(page, readFileSync(resolve(root, page.source), 'utf8'), assetVersion, { evidence })])
  for (const path of LEARN_EDITORIAL_PAGES) {
    const html = readFileSync(resolve(root, path), 'utf8')
    const next = html.replace(/<nav aria-label="Primary navigation">[\s\S]*?<\/nav>/, renderLearnNavigation({ home: path === 'learn/index.html', current: path === 'learn/network.html' ? 'network' : undefined })).replace(/<nav class="experts-navigation" aria-label="Experts navigation">[\s\S]*?<\/nav>/, renderExpertsNavigation(path === 'learn/reviews.html' ? 'reviews' : undefined)).replace(/href="([^"]+)"/g, (match, href) => {
      if (/^[a-z][a-z0-9+.-]*:|^#|^\//i.test(href)) return match
      return learnLink(path, href) !== href ? linkAttributes(path, href) : match
    })
    outputs.push([path, versionLearnStylesheets(next, assetVersion)])
  }
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
