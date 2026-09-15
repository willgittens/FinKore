// SPDX-License-Identifier: MPL-2.0
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

const repositoryRoot = process.cwd()
const python = resolve(repositoryRoot, '.tools/python-coverage/bin/python')
const rcfile = resolve(repositoryRoot, 'implementations/python/core/pyproject.toml')
const coverageFile = resolve(repositoryRoot, 'implementations/python/core/.coverage')

function run(command, args, options = {}) {
  const child = spawnSync(command, args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    stdio: 'inherit',
    ...options,
  })
  if (child.error !== undefined) throw child.error
  if (child.status !== 0) {
    process.exit(child.status ?? 1)
  }
}

const coverageEnv = {
  ...process.env,
  COVERAGE_FILE: coverageFile,
}

run(python, ['-m', 'coverage', 'erase', '--rcfile', rcfile], { env: coverageEnv })
run(python, ['-m', 'coverage', 'run', '--parallel-mode', '--rcfile', rcfile, '-m', 'unittest', 'discover', '-s', 'implementations/python/core/tests'], { env: coverageEnv })
run('node', ['runner/dist/cli/cli.js', '--manifest', 'conformance/manifest.json', '--adapter', 'implementations/python/adapters/conformance/adapter.js'], {
  env: {
    ...coverageEnv,
    FINKORE_PYTHON_PATH: python,
    FINKORE_PYTHON_COVERAGE_RCFILE: rcfile,
  },
})
run(python, ['-m', 'coverage', 'combine', '--rcfile', rcfile, 'implementations/python/core'], { env: coverageEnv })
run(python, ['-m', 'coverage', 'report', '--rcfile', rcfile], { env: coverageEnv })
