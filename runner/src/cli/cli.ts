#!/usr/bin/env node
// SPDX-License-Identifier: MPL-2.0
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { FinKoreConformanceAdapter } from '../adapter/types.js'
import { createConformanceRunner } from '../runner.js'
import { exitCodeForReport, formatConsoleReport, formatJsonReport } from '../reporter.js'

interface CliOptions {
  manifestPath: string
  adapterPath: string
  suites: string[]
  tags: string[]
  vectorIds: string[]
  json: boolean
}

function usage(): string {
  return `Usage: finkore-conformance --adapter <module> [options]

Options:
  --manifest <path>  Manifest path (default: conformance/manifest.json)
  --adapter <path>   ESM module exporting adapter or default adapter
  --suite <id>       Include suite (repeatable)
  --tag <tag>        Include tag (repeatable; tags are ORed)
  --vector <id>      Include vector id (repeatable)
  --json             Emit machine-readable JSON
  --help             Show this help`
}

function takeValue(args: readonly string[], index: number, option: string): string {
  const value = args[index + 1]
  if (value === undefined || value.startsWith('--')) throw new Error(`${option} requires a value`)
  return value
}

export function parseArgs(args: readonly string[]): CliOptions {
  const options: CliOptions = {
    manifestPath: 'conformance/manifest.json',
    adapterPath: '',
    suites: [],
    tags: [],
    vectorIds: [],
    json: false,
  }
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]
    if (argument === '--help') throw new Error(usage())
    if (argument === '--json') options.json = true
    else if (argument === '--manifest') options.manifestPath = takeValue(args, index++, argument)
    else if (argument === '--adapter') options.adapterPath = takeValue(args, index++, argument)
    else if (argument === '--suite') options.suites.push(takeValue(args, index++, argument))
    else if (argument === '--tag') options.tags.push(takeValue(args, index++, argument))
    else if (argument === '--vector') options.vectorIds.push(takeValue(args, index++, argument))
    else throw new Error(`Unknown option: ${argument}`)
  }
  if (options.adapterPath.length === 0) throw new Error('--adapter is required')
  return options
}

function isAdapter(value: unknown): value is FinKoreConformanceAdapter {
  return typeof value === 'object' && value !== null
    && typeof (value as { supports?: unknown }).supports === 'function'
    && typeof (value as { execute?: unknown }).execute === 'function'
}

async function main(): Promise<void> {
  try {
    if (process.argv.slice(2).includes('--help')) {
      process.stdout.write(`${usage()}\n`)
      return
    }
    const options = parseArgs(process.argv.slice(2))
    const module = await import(pathToFileURL(resolve(options.adapterPath)).href) as { default?: unknown; adapter?: unknown }
    const adapter = module.adapter ?? module.default
    if (!isAdapter(adapter)) throw new Error('Adapter module must export adapter or a default adapter')
    const report = await createConformanceRunner({ manifestPath: options.manifestPath, adapter }).run({
      suites: options.suites,
      tags: options.tags,
      vectorIds: options.vectorIds,
    })
    process.stdout.write(options.json ? formatJsonReport(report) : `${formatConsoleReport(report)}\n`)
    process.exitCode = exitCodeForReport(report)
  } catch (error) {
    process.stderr.write(`FinKore conformance infrastructure error: ${error instanceof Error ? error.message : String(error)}\n`)
    process.exitCode = 2
  }
}

await main()
