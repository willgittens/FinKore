// SPDX-License-Identifier: MPL-2.0
/**
 * Executes the Java core test entry points after compilation.
 *
 * This developer tool reads compiled classes under `target`, produces test
 * output only, and contains no financial-domain behavior.
 */
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { delimiter, resolve } from 'node:path'

const repositoryRoot = process.cwd()
const java = existsSync(resolve(repositoryRoot, '.tools/bin/java')) ? resolve(repositoryRoot, '.tools/bin/java') : 'java'
const classpath = [
  resolve(repositoryRoot, 'implementations/java/target/classes'),
  resolve(repositoryRoot, 'implementations/java/target/test-classes'),
].join(delimiter)

for (const testClass of [
  'org.finkore.MoneyTest',
  'org.finkore.WorkflowTest',
  'org.finkore.AuditTest',
  'org.finkore.ApprovalsTest',
  'org.finkore.EntitiesTest',
  'org.finkore.EntityEvolutionTest',
  'org.finkore.ReadinessRegressionTest',
  'org.finkore.BoundaryRegressionTest',
  'org.finkore.ConstructionEvaluationRegressionTest',
]) {
  const child = spawnSync(java, ['-cp', classpath, testClass], {
    encoding: 'utf8',
    cwd: repositoryRoot,
  })
  if (child.error !== undefined) throw child.error
  process.stdout.write(child.stdout)
  process.stderr.write(child.stderr)
  if (child.status !== 0) {
    process.exit(child.status ?? 1)
  }
}
console.log('Java Money, Workflow, Audit, Approvals, and Entities tests passed.')
