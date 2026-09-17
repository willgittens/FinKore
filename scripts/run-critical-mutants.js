// SPDX-License-Identifier: MPL-2.0
import { cpSync, existsSync, mkdtempSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { delimiter, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const repositoryRoot = process.cwd()
const requestedTarget = process.argv[2] ?? 'all'
const validTargets = new Set(['all', 'python', 'java'])

if (!validTargets.has(requestedTarget)) {
  console.error('Usage: node scripts/run-critical-mutants.js [all|python|java]')
  process.exit(2)
}

const pythonMutants = [
  {
    id: 'python-money-currency-mismatch-bypass',
    suite: 'money',
    path: 'core/src/finkore/money.py',
    from: 'if self.currency != other.currency:\n            raise FinKoreError(CURRENCY_MISMATCH)',
    to: 'if False and self.currency != other.currency:\n            raise FinKoreError(CURRENCY_MISMATCH)',
  },
  {
    id: 'python-money-addition-subtracts',
    suite: 'money',
    path: 'core/src/finkore/money.py',
    from: 'return Money(_add_decimal(self.amount, other.amount), self.currency)',
    to: 'return Money(_add_decimal(self.amount, -other.amount), self.currency)',
  },
  {
    id: 'python-money-floor-becomes-down',
    suite: 'money',
    path: 'core/src/finkore/money.py',
    from: 'elif mode == "FLOOR":\n            increment = sign < 0',
    to: 'elif mode == "FLOOR":\n            increment = False',
  },
  {
    id: 'python-workflow-guard-bypass',
    suite: 'workflow',
    path: 'core/src/finkore/workflow.py',
    from: 'if not transition.guards_pass(request_facts):\n        raise FinKoreError(GUARD_REJECTED)',
    to: 'if False and not transition.guards_pass(request_facts):\n        raise FinKoreError(GUARD_REJECTED)',
  },
  {
    id: 'python-audit-replace-append-only-bypass',
    suite: 'audit',
    path: 'core/src/finkore/audit.py',
    from: 'if not _opaque(event_id) or not isinstance(replacement, dict):\n        raise FinKoreError(INVALID_EVENT)\n    raise FinKoreError(APPEND_ONLY_VIOLATION)',
    to: 'if not _opaque(event_id) or not isinstance(replacement, dict):\n        raise FinKoreError(INVALID_EVENT)\n    return {"history": [replacement]}',
  },
  {
    id: 'python-approval-expiration-bypass',
    suite: 'approvals',
    path: 'core/src/finkore/approvals.py',
    from: 'return _instant(evaluated_at, INVALID_CONTEXT) >= _instant(decision["expiresAt"], INVALID_CONTEXT)',
    to: 'return False',
  },
  {
    id: 'python-approval-ineligible-actor-bypass',
    suite: 'approvals',
    path: 'core/src/finkore/approvals.py',
    from: 'if actor_id not in requirement.get("eligibleActors", [actor_id]):\n        raise FinKoreError(INELIGIBLE_ACTOR)',
    to: 'if False and actor_id not in requirement.get("eligibleActors", [actor_id]):\n        raise FinKoreError(INELIGIBLE_ACTOR)',
  },
  {
    id: 'python-entity-immutability-bypass',
    suite: 'entities',
    path: 'core/src/finkore/entities.py',
    from: 'if any(path not in mutable for path in changes):\n        raise FinKoreError(IMMUTABLE)',
    to: 'if False and any(path not in mutable for path in changes):\n        raise FinKoreError(IMMUTABLE)',
  },
  {
    id: 'python-entity-positive-money-validation-bypass',
    suite: 'entities',
    path: 'core/src/finkore/entities.py',
    from: 'if money.amount <= Decimal("0"):\n                findings.append({"rule": rule.get("id"), "path": rule.get("path")})',
    to: 'if False and money.amount <= Decimal("0"):\n                findings.append({"rule": rule.get("id"), "path": rule.get("path")})',
  },
]

const javaMutants = [
  {
    id: 'java-money-currency-mismatch-bypass',
    suite: 'money',
    path: 'core/src/main/java/org/finkore/Money.java',
    from: 'if (!currency.equals(other.currency)) {\n      throw new FinKoreException(CURRENCY_MISMATCH);\n    }',
    to: 'if (false && !currency.equals(other.currency)) {\n      throw new FinKoreException(CURRENCY_MISMATCH);\n    }',
  },
  {
    id: 'java-money-addition-subtracts',
    suite: 'money',
    path: 'core/src/main/java/org/finkore/Money.java',
    from: 'return new Money(amount.add(other.amount), currency, null);',
    to: 'return new Money(amount.subtract(other.amount), currency, null);',
  },
  {
    id: 'java-money-floor-becomes-down',
    suite: 'money',
    path: 'core/src/main/java/org/finkore/Money.java',
    from: 'case "FLOOR" -> RoundingMode.FLOOR;',
    to: 'case "FLOOR" -> RoundingMode.DOWN;',
  },
  {
    id: 'java-money-percentage-not-scaled',
    suite: 'money',
    path: 'core/src/main/java/org/finkore/Money.java',
    from: 'scalar = scalar.divide(new BigDecimal("100"));',
    to: 'scalar = scalar.multiply(BigDecimal.ONE);',
  },
  {
    id: 'java-money-allocation-remainder-reversed',
    suite: 'money',
    path: 'core/src/main/java/org/finkore/Money.java',
    from: 'base.set(index, base.get(index).add(BigInteger.ONE));',
    to: 'base.set(base.size() - 1 - index, base.get(base.size() - 1 - index).add(BigInteger.ONE));',
  },
  {
    id: 'java-workflow-guard-bypass',
    suite: 'workflow',
    path: 'core/src/main/java/org/finkore/Workflow.java',
    from: 'if (!transition.guardsPass(factMap)) {\n      throw new FinKoreException(GUARD_REJECTED);\n    }',
    to: 'if (false && !transition.guardsPass(factMap)) {\n      throw new FinKoreException(GUARD_REJECTED);\n    }',
  },
  {
    id: 'java-workflow-terminal-bypass',
    suite: 'workflow',
    path: 'core/src/main/java/org/finkore/Workflow.java',
    from: 'if (definition.terminalStates().contains(instance.currentState())) {\n      throw new FinKoreException(TERMINAL_STATE);\n    }',
    to: 'if (false && definition.terminalStates().contains(instance.currentState())) {\n      throw new FinKoreException(TERMINAL_STATE);\n    }',
  },
]

function files(directory) {
  if (!existsSync(directory)) return []
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

function applyMutation(path, from, to) {
  const original = readFileSync(path, 'utf8')
  const occurrences = original.split(from).length - 1
  if (occurrences !== 1) {
    throw new Error(`${path} expected exactly one mutation target for ${JSON.stringify(from)}, found ${occurrences}`)
  }
  writeFileSync(path, original.replace(from, to))
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    ...options,
  })
  if (result.error !== undefined) throw result.error
  return result
}

function conformanceKilled(env, suite) {
  const result = run('node', [
    'runner/dist/cli/cli.js',
    '--manifest',
    'conformance/manifest.json',
    '--adapter',
    env.FINKORE_MUTANT_ADAPTER,
    '--suite',
    suite,
    '--json',
  ], { env: { ...process.env, ...env } })
  return { killed: result.status !== 0, status: result.status, output: result.stdout, error: result.stderr }
}

function runPythonMutant(mutant) {
  const directory = mkdtempSync(join(tmpdir(), 'finkore-python-mutant-'))
  try {
    const implementationRoot = join(directory, 'python')
    cpSync(resolve(repositoryRoot, 'implementations/python'), implementationRoot, { recursive: true })
    applyMutation(join(implementationRoot, mutant.path), mutant.from, mutant.to)
    const result = conformanceKilled({
      FINKORE_MUTANT_ADAPTER: 'implementations/python/adapters/conformance/adapter.js',
      FINKORE_PYTHON_PATH: resolve(repositoryRoot, '.tools/bin/python3.12'),
      FINKORE_PYTHON_BRIDGE_PATH: join(implementationRoot, 'adapters/conformance/bridge.py'),
    }, mutant.suite)
    return { ...result, id: mutant.id }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}

function compileJava(implementationRoot) {
  const javac = existsSync(resolve(repositoryRoot, '.tools/bin/javac')) ? resolve(repositoryRoot, '.tools/bin/javac') : 'javac'
  const output = join(implementationRoot, 'target/classes')
  mkdirSync(output, { recursive: true })
  const sources = [
    ...files(join(implementationRoot, 'core/src/main/java')),
    ...files(join(implementationRoot, 'adapters/conformance/src/main/java')),
  ].filter((path) => path.endsWith('.java'))
  const result = run(javac, ['-Xlint:all', '-Werror', '-d', output, ...sources])
  return { result, output }
}

function runJavaMutant(mutant) {
  const directory = mkdtempSync(join(tmpdir(), 'finkore-java-mutant-'))
  try {
    const implementationRoot = join(directory, 'java')
    cpSync(resolve(repositoryRoot, 'implementations/java'), implementationRoot, { recursive: true })
    applyMutation(join(implementationRoot, mutant.path), mutant.from, mutant.to)
    const compile = compileJava(implementationRoot)
    if (compile.result.status !== 0) {
      return { id: mutant.id, killed: true, status: compile.result.status, output: compile.result.stdout, error: compile.result.stderr }
    }
    const result = conformanceKilled({
      FINKORE_MUTANT_ADAPTER: 'implementations/java/adapters/conformance/adapter.js',
      FINKORE_JAVA_PATH: resolve(repositoryRoot, '.tools/bin/java'),
      FINKORE_JAVA_CLASSPATH: compile.output,
    }, mutant.suite)
    return { ...result, id: mutant.id }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}

function report(results) {
  let failures = 0
  for (const result of results) {
    if (result.killed) {
      console.log(`KILLED ${result.id}`)
    } else {
      failures += 1
      console.error(`SURVIVED ${result.id}`)
      process.stderr.write(result.output)
      process.stderr.write(result.error)
    }
  }
  console.log(`Critical mutant probes: ${results.length - failures}/${results.length} killed`)
  if (failures > 0) process.exit(1)
}

const results = []
if (requestedTarget === 'all' || requestedTarget === 'python') {
  for (const mutant of pythonMutants) results.push(runPythonMutant(mutant))
}
if (requestedTarget === 'all' || requestedTarget === 'java') {
  for (const mutant of javaMutants) results.push(runJavaMutant(mutant))
}
report(results)
