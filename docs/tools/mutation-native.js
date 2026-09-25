// SPDX-License-Identifier: MPL-2.0
/**
 * Mutates temporary source copies and runs existing public-API tests for defects
 * that isolated JSON calls cannot expose. Verifies baselines and paired controls;
 * leaves repository sources untouched and defines no financial behavior.
 */
import { cpSync, existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { delimiter, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { assessNativeResult, nativeBaselinePassed } from './mutation-native-result.js'

const root = process.cwd()
const py = 'test_readiness_regressions.ReadinessRegressionTests.'
const workflowControl = 'Workflow retained definition ownership retains state, terminal and transition arrays after construction'
const integration = 'test/integration/readiness-regressions.test.ts'
const probes = [
  ...['actor', 'change'].map((name) => {
    const fn = name === 'actor' ? 'cloneJsonValue' : 'cloneAuditValue'
    return { id: `typescript-audit-${name}-unsafe-copy`, language: 'typescript',
      path: `src/audit/${name === 'actor' ? 'actor' : 'audit-change'}.ts`,
      from: `    const result = Object.fromEntries(\n      Object.entries(value).map(([key, item]) => [key, ${fn}(item, ancestors)]),\n    )`,
      to: `    const result: Record<string, unknown> = {}\n    for (const [key, item] of Object.entries(value)) {\n      result[key] = ${fn}(item, ancestors)\n    }`,
      tests: ['test/audit/actors.test.ts', 'test/audit/changes.test.ts'],
      target: 'Audit own JSON member preservation ' + (name === 'actor'
        ? 'preserves __proto__ value 0 through construction, append, import, and redaction'
        : 'rejects equal __proto__ value 0 without changing committed history'),
      control: 'Audit own JSON member preservation preserves constructor value 0 through construction, append, import, and redaction' }
  }),
  { id: 'typescript-workflow-input-alias', language: 'typescript', path: 'src/workflow/definition.ts',
    from: 'equals: retainJson(value.equals)', to: 'equals: value.equals', tests: [integration],
    target: 'Workflow retained definition ownership create retains object input guard when approved=false', control: workflowControl },
  { id: 'typescript-workflow-observation-alias', language: 'typescript', path: 'src/workflow/definition.ts',
    from: 'return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, retainJson(item, ancestors)])))',
    to: 'return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, retainJson(item, ancestors)]))', tests: [integration],
    target: 'Workflow retained definition ownership create retains object observation guard when approved=false', control: workflowControl },
  { id: 'python-workflow-input-alias', language: 'python', path: 'workflow.py',
    from: '_copy_json(guard["equals"])', to: 'guard["equals"]',
    target: py + 'test_workflow_nested_definition_ownership', control: py + 'test_workflow_declaration_arrays_are_owned' },
  { id: 'python-workflow-observation-alias', language: 'python', path: 'workflow.py',
    from: 'return deepcopy(self._guards)', to: 'return self._guards',
    target: py + 'test_workflow_nested_definition_ownership', control: py + 'test_workflow_declaration_arrays_are_owned' },
  { id: 'python-approval-sequence-evidence-loss', language: 'python', path: 'approvals.py',
    from: 'result["lifecycle"] = lifecycle', to: 'result["lifecycle"] = []',
    target: py + 'test_lifecycle_record_evaluate_sequences', control: py + 'test_record_without_lifecycle_preserves_effective_decision' },
  { id: 'python-entity-sequence-constant-currentness', language: 'python', path: 'entities.py',
    from: 'current = observed.get(_reference_key(source_reference, scope), True)', to: 'current = True',
    target: py + 'test_evolution_consumes_actual_returned_history', control: py + 'test_combined_audit_failure_preserves_all_supplied_observations' },
  { id: 'java-workflow-input-alias', language: 'java', path: 'Workflow.java',
    from: 'guard.put("equals", retainJson(map.get("equals"), Collections.newSetFromMap(new IdentityHashMap<>())));',
    to: 'guard.put("equals", map.get("equals"));', target: 'workflow.input', control: 'workflow.control' },
  { id: 'java-workflow-observation-map-alias', language: 'java', path: 'Workflow.java',
    from: 'return Collections.unmodifiableMap(result);', to: 'return result;', target: 'workflow.observation', control: 'workflow.control' },
  { id: 'java-workflow-observation-list-alias', language: 'java', path: 'Workflow.java',
    from: 'return Collections.unmodifiableList(result);', to: 'return result;', target: 'workflow.list', control: 'workflow.control' },
  { id: 'java-approval-sequence-evidence-loss', language: 'java', path: 'Approvals.java',
    from: 'return historyEnvelope(append(current.history(), recorded), current.lifecycle());',
    to: 'return historyEnvelope(append(current.history(), recorded), List.of());', target: 'approval.sequence', control: 'approval.control' },
  { id: 'java-entity-sequence-constant-currentness', language: 'java', path: 'Entities.java',
    from: 'boolean current = observed.getOrDefault(evolutionKey(sourceReference, scope), Boolean.TRUE);',
    to: 'boolean current = true;', target: 'entity.sequence', control: 'entity.control' },
]

function run(command, args, options = {}) {
  return spawnSync(command, args, { cwd: root, encoding: 'utf8', timeout: 120_000, maxBuffer: 8 * 1024 * 1024, ...options })
}
function sources(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? sources(path) : [path]
  })
}
function execute(probe, directory) {
  const cases = [probe.target, probe.control]
  if (probe.language === 'python') return run(join(root, '.tools/bin/python3.12'), [
    join(root, 'docs/tools/mutation-native-python.py'), ...cases,
  ], { env: { ...process.env, PYTHONPATH: [directory, join(root, 'implementations/python/core/tests')].join(delimiter) } })
  if (probe.language === 'java') {
    const output = join(directory, 'classes')
    mkdirSync(output, { recursive: true })
    const files = [...sources(directory).filter((path) => path.endsWith('.java')),
      ...sources(join(root, 'implementations/java/core/src/test/java')).filter((path) => path.endsWith('.java') && !path.endsWith('CoverageTest.java')),
      join(root, 'docs/tools/NativeMutationProbe.java')]
    const compiled = run(join(root, '.tools/bin/javac'), ['-Xlint:all', '-Werror', '-d', output, ...files])
    if (compiled.status !== 0) return { ...compiled, status: 2 }
    return run(join(root, '.tools/bin/java'), ['-cp', output, 'org.finkore.NativeMutationProbe', ...cases])
  }
  const reportPath = join(directory, 'vitest.json')
  rmSync(reportPath, { force: true })
  const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const result = run(process.execPath, [join(root, 'node_modules/vitest/vitest.mjs'), 'run', ...probe.tests,
    '--testNamePattern', `^(?:${cases.map(escape).join('|')})$`, '--reporter=json', '--outputFile', reportPath], { cwd: directory })
  if (!existsSync(reportPath)) return result
  let report
  try { report = JSON.parse(readFileSync(reportPath, 'utf8')) } catch { return { ...result, status: 2 } }
  if ((report.numRuntimeErrorTestSuites ?? 0) !== 0 || report.unhandledErrors?.length
      || report.testResults.some((file) => file.status === 'failed' && file.message)) return { ...result, status: 2 }
  const rows = report.testResults.flatMap((file) => file.assertionResults).filter((test) => cases.includes(test.fullName)).map((test) => ({
    caseId: test.fullName,
    status: test.status === 'passed' ? 'PASS' : test.status === 'failed' ? 'FAIL' : 'INFRASTRUCTURE_ERROR',
    failureKind: test.failureMessages?.length > 0 && test.failureMessages.every((message) => /^AssertionError[:\s]/.test(message)) ? 'ASSERTION' : 'UNEXPECTED_EXCEPTION',
  }))
  const failed = rows.filter((row) => row.status === 'FAIL').length
  return { ...result, stdout: JSON.stringify({ results: rows,
    summary: { total: rows.length, passed: rows.length - failed, failed, unsupported: 0, infrastructureErrors: 0 } }) }
}

for (const probe of probes) {
  const directory = mkdtempSync(join(tmpdir(), 'finkore-native-mutant-'))
  try {
    let path
    if (probe.language === 'typescript') {
      const core = join(root, 'implementations/typescript/core')
      for (const part of ['src', 'test', 'package.json']) cpSync(join(core, part), join(directory, part), { recursive: true })
      symlinkSync(join(root, 'node_modules'), join(directory, 'node_modules'), 'dir')
      path = join(directory, probe.path)
    } else if (probe.language === 'python') {
      cpSync(join(root, 'implementations/python/core/src/finkore'), join(directory, 'finkore'), { recursive: true, filter: (path) => !path.includes('__pycache__') })
      path = join(directory, 'finkore', probe.path)
    } else {
      cpSync(join(root, 'implementations/java/core/src/main/java'), directory, { recursive: true })
      path = join(directory, 'org/finkore', probe.path)
    }
    const baseline = execute(probe, directory)
    if (!nativeBaselinePassed(baseline, [probe.target, probe.control])) throw new Error(`${probe.id}: invalid baseline\n${baseline.stdout}\n${baseline.stderr}`)
    const original = readFileSync(path, 'utf8')
    if (original.split(probe.from).length !== 2) throw new Error(`${probe.id}: expected exactly one mutation target`)
    writeFileSync(path, original.replace(probe.from, probe.to))
    const result = execute(probe, directory)
    const assessment = assessNativeResult(result, probe.target, [probe.control])
    if (!assessment.killed) throw new Error(`${probe.id}: ${assessment.reason}\n${result.stdout}\n${result.stderr}`)
    console.log(`KILLED ${probe.id}: ${assessment.reason}; paired control PASS`)
  } finally { rmSync(directory, { recursive: true, force: true }) }
}
console.log(`Native public-API mutant probes: ${probes.length}/${probes.length} killed`)
