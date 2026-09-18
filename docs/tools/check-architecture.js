// SPDX-License-Identifier: MPL-2.0
/**
 * Detects prohibited dependencies between implementations and infrastructure.
 *
 * This developer tool enforces repository architecture only; it does not define
 * or execute financial-domain behavior.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const errors = []

function files(directory) {
  const result = []
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      result.push(...files(path))
    } else if (entry.isFile()) {
      result.push(path)
    }
  }
  return result
}

function checkPythonCore() {
  for (const path of files('implementations/python/core/src').filter((file) => file.endsWith('.py'))) {
    const content = readFileSync(path, 'utf8')
    const forbidden = [
      /\bimport\s+runner\b/,
      /\bfrom\s+runner\b/,
      /\bimport\s+conformance\b/,
      /\bfrom\s+conformance\b/,
      /\bimport\s+agentic\b/,
      /\bfrom\s+agentic\b/,
      /\btypescript\b/,
      /\bimplementations\.java\b/,
      /\bmcp\b/i,
    ]
    if (forbidden.some((pattern) => pattern.test(content))) {
      errors.push(`${path} contains a prohibited implementation-boundary reference`)
    }
  }
}

function checkJavaCore() {
  for (const path of files('implementations/java/core/src/main/java').filter((file) => file.endsWith('.java'))) {
    const content = readFileSync(path, 'utf8')
    const forbidden = [
      /\bimport\s+org\.finkore\.conformance\./,
      /\bimport\s+runner\./,
      /\bimport\s+conformance\./,
      /\bimport\s+agentic\./,
      /\btypescript\b/i,
      /\bpython\b/i,
      /\bmcp\b/i,
    ]
    if (forbidden.some((pattern) => pattern.test(content))) {
      errors.push(`${path} contains a prohibited implementation-boundary reference`)
    }
  }
}

function checkTypeScriptCore() {
  for (const path of files('implementations/typescript/core/src').filter((file) => file.endsWith('.ts'))) {
    const content = readFileSync(path, 'utf8')
    const forbidden = [
      /from ['"].*runner/,
      /from ['"].*conformance/,
      /from ['"].*agentic/,
      /\bimplementations\/python\b/,
      /\bimplementations\/java\b/,
      /\bmcp\b/i,
    ]
    if (forbidden.some((pattern) => pattern.test(content))) {
      errors.push(`${path} contains a prohibited implementation-boundary reference`)
    }
  }
}

checkPythonCore()
checkJavaCore()
checkTypeScriptCore()

if (errors.length > 0) {
  console.error('Implementation boundary validation failed:')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log('Implementation boundary validation passed.')
