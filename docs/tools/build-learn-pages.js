// SPDX-License-Identifier: MPL-2.0
/**
 * Generates Learn readers for project documents and approved Legacy interviews.
 * This developer tool reads canonical sources without changing them. Build mode
 * writes derived HTML; check mode writes nothing. It does not define or execute
 * financial behavior.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { posix, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { readLearnAssetVersion, versionLearnStylesheets } from './build-learn-assets.js'

export const LEARN_PAGES = [
  { source: 'docs/where-to-start.md', output: 'learn/where-to-start.html', label: 'Where to start', description: 'Understand FinKore, choose your starting point, and work through your first domain slice.' },
  { source: 'README.md', output: 'learn/about.html', label: 'About the project', description: 'What FinKore defines, who it serves, and where to start reading or building.' },
  { source: 'LICENSING.md', output: 'learn/licensing.html', label: 'Licensing', description: 'The project licensing policy, covered materials, and consumer-owned implementations.' },
  { source: 'CONTRIBUTING.md', output: 'learn/contributing.html', label: 'Contribute', description: 'How to propose, review, and verify contributions to the FinKore contract.' },
  { source: 'docs/implementation-guide.md', output: 'learn/implementation-guide.html', label: 'Implementation guide', description: 'Guidance for implementing the portable contract in your own language and stack.' },
  { source: 'docs/releases/README.md', output: 'learn/releases.html', label: 'Release notes', description: 'Published release history. Earlier entries describe historical repository capabilities.' },
  { source: 'legacy/README.md', output: 'learn/legacy.html', label: 'Legacy Archive', description: 'Real stories from the people who built and maintained financial software. Explore the interviews, editorial principles, and ways to share your experience.', presentation: 'legacy-archive' },
  // Register interviews explicitly after editorial approval; never publish drafts by directory discovery.
  // Archive and interview quotes must preserve the interviewee's words and focus on financial systems, rules, or operational risk.
  { source: 'legacy/interviews/001-elaine-richardson.md', output: 'learn/legacy-001-elaine-richardson.html', label: 'Elaine Richardson — Interview #001', description: 'Elaine Richardson shares her experience with mainframes, COBOL, migrations, error handling, and batch processing. A personal account from the FinKore Legacy Archive.', presentation: 'legacy-interview', documentNavigation: false,
    interview: { name: 'Elaine Richardson', number: '001', quote: 'Bank’s back-end systems are full of exception handling, covering the exceptions consultants say will “never happen”, but that will happen day 1 of go live, usually with your biggest, most important customer.', featureQuote: 'Bank’s back-end systems are full of exception handling, covering the exceptions consultants say will “never happen”, but that will happen day 1 of go live, usually with your biggest, most important customer.', introduction: 'From a chance opening as a trainee programmer to mainframe migrations and live support. Elaine reflects on a career spent working with the systems people depend on.', topics: ['Mainframes', 'COBOL', 'Migrations', 'Error handling', 'Batch processing'], chapters: ['Finding a way into finance', 'A migration to remember', 'The lessons in unusual code', 'Modernization & recovery', 'What we should never forget', 'A withheld account', 'The dependencies between batch runs'] } },
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
          <li><a href="network.html"${current === 'network' ? ' aria-current="page"' : ''}>Join the Network</a></li>
          <li><a class="nav-start" href="${GITHUB_PROJECT_URL}" target="_blank" rel="noopener noreferrer">Github Project <span aria-hidden="true">↗</span></a></li>
        </ul>
      </nav>`
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

// Only the converted documents are redirected. Specs, conformance and other
// repository references retain their original destinations and fragments.
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
    <nav class="legacy-breadcrumb" aria-label="Breadcrumb"><a href="network.html#legacy">FinKore Network</a><span aria-hidden="true">/</span><span>Legacy Archive</span></nav>
    <p class="eyebrow">An oral history of financial software</p>
    <div class="legacy-hero-layout"><h1 id="${escapeHtml(doc.titleId)}">The people behind<br /><span>financial software.</span></h1><div><p class="legacy-deck">Real stories from the people who built and maintained financial software.</p><p>Careers, unexpected incidents, difficult decisions, and lessons that deserve to outlive the systems themselves.</p><div class="actions"><a class="button" href="#interviews">Meet the people <span aria-hidden="true">↓</span></a><a class="text-link" href="#share-your-story">Share your story <span aria-hidden="true">↗</span></a></div></div></div>
  </div></header>
  <section class="legacy-section legacy-catalogue"><div class="container"><div class="legacy-section-heading"><div><p class="eyebrow">The collection</p><h2 id="interviews">Conversations worth keeping.</h2></div><p>In their own words.<br />For the next generation.</p></div>${cards.slice(storageNote.length)}</div></section>
  <section class="legacy-section legacy-purpose"><div class="container legacy-purpose-layout"><div><p class="eyebrow">More than a record of the past</p><h2 id="why-this-archive-exists">${find('why-this-archive-exists').title}</h2><div class="legacy-prose">${introduction}</div></div><div class="legacy-prose">${find('why-this-archive-exists').body}</div></div></section>
  ${otherSections}
  <div class="container legacy-source"><details><summary>About the archive source</summary>${storageNote}</details></div>
  ${legacyWelcome()}`
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
  const body = sections.map(section => `<section class="legacy-conversation"><h2 id="${section.id}">${section.title}</h2>${section.body.replace(/(<h3\b[\s\S]*?)(?=<h3\b|<hr \/>|$)/g, '<section class="legacy-question">$1</section>')}</section>`).join('\n')
  return `<header class="legacy-interview-hero"><div class="container">
    <nav class="legacy-breadcrumb" aria-label="Breadcrumb"><a href="legacy.html#interviews">Back to the Legacy Archive</a><span aria-hidden="true">/</span><span>Interview ${escapeHtml(interview.number)}</span></nav>
    <div class="legacy-interview-heading"><div><p class="eyebrow">FinKore Legacy Archive / No. ${escapeHtml(interview.number)}</p><h1 id="${escapeHtml(doc.titleId)}">${escapeHtml(interview.name)}</h1><p class="legacy-deck">${escapeHtml(interview.introduction)}</p>${legacyTags(interview.topics)}<p class="legacy-byline">A conversation from the FinKore Legacy Archive <span aria-hidden="true">·</span> About ${readingMinutes} min read${profile ? ` <span aria-hidden="true">·</span> <a ${linkAttributes(page.source, profile)}>LinkedIn profile ↗</a>` : ''}</p><a class="text-link" href="#the-interview">Start reading <span aria-hidden="true">↓</span></a></div>
    <figure class="legacy-pullquote"><span aria-hidden="true">“</span><blockquote><p>${escapeHtml(interview.quote)}</p></blockquote><figcaption>${escapeHtml(interview.name)}<span>From the interview</span></figcaption></figure></div>
  </div></header>
  <div class="container legacy-reading-layout"><aside class="legacy-chapters"><p class="eyebrow">In this conversation</p><nav aria-label="Interview navigation">${chapterLinks}</nav><a class="legacy-all-interviews" href="legacy.html#interviews">← All interviews</a></aside>
  <div class="legacy-reading-main"><details class="legacy-mobile-index"><summary>In this conversation</summary><nav aria-label="Mobile interview navigation">${chapterLinks}</nav></details>
    <details class="legacy-record"><summary>About this interview &amp; its publication</summary><div>${introduction}</div></details>
    <article class="legacy-story" aria-label="${escapeHtml(doc.title)}">${body}</article>
    <div class="legacy-reading-end"><p class="eyebrow">The conversation continues</p><h2>Every career holds a story worth sharing.</h2><div class="actions"><a class="button" href="legacy.html#share-your-story">Share your experience <span aria-hidden="true">→</span></a><a class="text-link" href="legacy.html#interviews">Back to the archive</a></div></div>
  </div></div>${legacyWelcome()}`
}

function renderLegacyPage(page, markdown, doc, assetVersion) {
  return versionLearnStylesheets(`<!doctype html>
<!-- SPDX-License-Identifier: MPL-2.0 -->
<!-- Generated from ${page.source} by npm run learn:build. Do not edit this file directly. -->
<html lang="en"><head>
  <meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#f9f7f2" /><title>${escapeHtml(page.label)} — FinKore</title>
  <meta name="description" content="${escapeHtml(page.description)}" />
  ${renderLearnOpenGraph({ title: `${page.label} — FinKore`, description: page.description, path: posix.basename(page.output) })}
  <link rel="icon" type="image/png" href="img/Finkore_Favicon.png" />
  <link rel="stylesheet" href="css/styles.css" /><link rel="stylesheet" href="css/legacy.css" />
</head><body id="top" class="legacy-page ${page.presentation}">
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header"><div class="container header-layout"><a class="brand" href="index.html" aria-label="FinKore home"><img class="brand-logo" src="img/Finkore-Logo.png" alt="FinKore" width="1013" height="226" decoding="async" /></a>${renderLearnNavigation()}</div></header>
  <main id="main">${page.presentation === 'legacy-archive' ? renderLegacyArchive(doc) : renderLegacyInterview(page, markdown, doc)}</main>
  <div class="container legacy-colophon"><a href="${GITHUB_FILE_BASE_URL}${page.source}" target="_blank" rel="noopener noreferrer">View Markdown source ↗</a><a href="#top">Back to the top ↑</a></div>
  <footer class="site-footer"><div class="container footer-layout"><a class="brand" href="index.html"><img class="brand-logo" src="img/Finkore_White.png" alt="FinKore" width="1021" height="293" loading="lazy" decoding="async" /></a><p>Financial behavior, made explicit.</p><nav aria-label="Project resources"><a href="about.html">About the project</a><a href="contributing.html">Contribute</a><a href="${GITHUB_FILE_BASE_URL}LICENSE" target="_blank" rel="noopener noreferrer">MPL-2.0</a></nav></div></footer>
</body></html>`, assetVersion)
}

export function renderLearnPage(page, markdown, assetVersion) {
  const doc = renderLearnMarkdown(markdown, page.source)
  if (page.presentation?.startsWith('legacy-')) return renderLegacyPage(page, markdown, doc, assetVersion)
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
      ${renderLearnNavigation({ current: page.output === 'learn/where-to-start.html' ? 'start' : undefined })}
    </div>
  </header>
  <main id="main">
    <header class="container core-reader-heading">
      <p class="eyebrow">${escapeHtml(page.label)}</p>
      <h1 id="${escapeHtml(doc.titleId)}">${escapeHtml(doc.title)}</h1>
      <p class="core-reader-lead">${escapeHtml(page.description)}</p>
      <div class="actions"><a class="text-link" href="${GITHUB_FILE_BASE_URL}${page.source}" target="_blank" rel="noopener noreferrer">View Markdown source <span aria-hidden="true">↗</span></a></div>${page.parent ? `\n      <p class="learn-parent"><a class="text-link" href="${escapeHtml(page.parent.href)}">← ${escapeHtml(page.parent.label)}</a></p>` : ''}
      <nav class="learn-document-links" aria-label="Learn documents">${LEARN_PAGES.filter(p => p.documentNavigation !== false).map(p => `<a href="${posix.basename(p.output)}"${p === page ? ' aria-current="page"' : ''}>${escapeHtml(p.label)}</a>`).join('')}<a href="coredoc.html">CoreDoc</a></nav>
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
    <a class="brand" href="index.html"><img class="brand-logo" src="img/Finkore_White.png" alt="FinKore" width="1021" height="293" loading="lazy" decoding="async" /></a><p>Financial behavior, made explicit.</p>
    <nav aria-label="Project resources"><a href="about.html">About the project</a><a href="contributing.html">Contribute</a><a href="${GITHUB_FILE_BASE_URL}LICENSE" target="_blank" rel="noopener noreferrer">MPL-2.0</a></nav>
  </div></footer>
</body>
</html>
`, assetVersion)
}

export function buildLearnPages(root = process.cwd(), { check = false } = {}) {
  const assetVersion = readLearnAssetVersion(root)
  const outputs = LEARN_PAGES.map(page => [page.output, renderLearnPage(page, readFileSync(resolve(root, page.source), 'utf8'), assetVersion)])
  for (const path of LEARN_EDITORIAL_PAGES) {
    const html = readFileSync(resolve(root, path), 'utf8')
    const next = html.replace(/<nav aria-label="Primary navigation">[\s\S]*?<\/nav>/, renderLearnNavigation({ home: path === 'learn/index.html', current: path === 'learn/network.html' ? 'network' : undefined })).replace(/href="([^"]+)"/g, (match, href) => {
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
