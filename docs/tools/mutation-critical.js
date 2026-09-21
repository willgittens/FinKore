// SPDX-License-Identifier: MPL-2.0
/**
 * Runs targeted mutation probes for critical Python and Java financial rules.
 *
 * This developer tool mutates temporary copies only, reports whether the
 * conformance suite kills each probe, and never changes repository sources.
 * It does not define financial behavior. Infrastructure failures are not kills.
 */
import { cpSync, existsSync, mkdtempSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { delimiter, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { assessMutationResult } from './mutation-result.js'

const repositoryRoot = process.cwd()
const requestedTarget = process.argv[2] ?? 'all'
const validTargets = new Set(['all', 'python', 'java'])

if (!validTargets.has(requestedTarget)) {
  console.error('Usage: node docs/tools/mutation-critical.js [all|python|java]')
  process.exit(2)
}

const pythonMutants = [
  {
    id: 'python-approval-native-fact-equality',
    expectedVector: 'approval.validity.boolean-number-fact-change-001',
    suite: 'approvals',
    path: 'core/src/finkore/approvals.py',
    from: 'if left is _MISSING or right is _MISSING or not _json_fact_equal(left, right):',
    to: 'if left is _MISSING or right is _MISSING or left != right:',
  },
  {
    id: 'python-approval-shallow-object-fact-equality',
    expectedVector: 'approval.validity.nested-number-boolean-fact-change-001',
    suite: 'approvals',
    path: 'core/src/finkore/approvals.py',
    from: 'return all(_json_fact_equal(left[key], right[key]) for key in left)',
    to: 'return left == right',
  },
  {
    id: 'python-approval-shallow-array-fact-equality',
    expectedVector: 'approval.validity.array-number-boolean-fact-change-001',
    suite: 'approvals',
    path: 'core/src/finkore/approvals.py',
    from: 'return all(_json_fact_equal(a, b) for a, b in zip(left, right))',
    to: 'return left == right',
  },
  {
    id: 'python-approval-unchanged-boolean-facts-rejected',
    expectedVector: 'approval.validity.structured-facts-unchanged-001',
    suite: 'approvals',
    path: 'core/src/finkore/approvals.py',
    from: 'return left is right',
    to: 'return False',
  },
  {
    id: 'python-money-subtraction-context-rounding',
    expectedVector: 'money.subtract.high-precision-right-operand-001',
    suite: 'money',
    path: 'core/src/finkore/money.py',
    from: 'return Money(_add_decimal(self.amount, other.amount.copy_negate()), self.currency)',
    to: 'return Money(_add_decimal(self.amount, -other.amount), self.currency)',
  },
  {
    id: 'python-money-negation-context-rounding',
    expectedVector: 'money.negate.high-precision-001',
    suite: 'money',
    path: 'core/src/finkore/money.py',
    from: 'return Money(self.amount.copy_negate(), self.currency, self.presentation_scale)',
    to: 'return Money(-self.amount, self.currency, self.presentation_scale)',
  },
  {
    id: 'python-money-allocation-context-rounding',
    expectedVector: 'money.allocate.equal.high-precision-single-part-001',
    suite: 'money',
    path: 'core/src/finkore/money.py',
    from: 'Money(_decimal_from_units(sign * units_for_part, target_scale), self.currency, target_scale)',
    to: 'Money(Decimal(sign * units_for_part).scaleb(-target_scale), self.currency, target_scale)',
  },
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
    id: 'python-money-allocation-upper-bound-bypass',
    suite: 'money',
    path: 'core/src/finkore/money.py',
    from: 'if integer < minimum or integer > maximum:\n        raise FinKoreError(INVALID_ALLOCATION)',
    to: 'if integer < minimum:\n        raise FinKoreError(INVALID_ALLOCATION)',
  },
  {
    id: 'python-money-allocation-maximum-rejected',
    suite: 'money',
    path: 'core/src/finkore/money.py',
    from: 'if integer < minimum or integer > maximum:\n        raise FinKoreError(INVALID_ALLOCATION)',
    to: 'if integer < minimum or integer >= maximum:\n        raise FinKoreError(INVALID_ALLOCATION)',
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
    id: 'python-timestamp-nanoseconds-truncated',
    suite: 'shared',
    path: 'core/src/finkore/_timestamp.py',
    from: 'return local_second - offset_seconds, nanosecond',
    to: 'return local_second - offset_seconds, nanosecond // 1_000_000',
  },
  {
    id: 'python-timestamp-unknown-offset-accepted',
    suite: 'shared',
    path: 'core/src/finkore/_timestamp.py',
    from: 'if offset_hour > 23 or offset_minute > 59 or (sign == "-" and offset_hour == 0 and offset_minute == 0):',
    to: 'if offset_hour > 23 or offset_minute > 59:',
  },
  {
    id: 'python-approval-ineligible-actor-bypass',
    suite: 'approvals',
    path: 'core/src/finkore/approvals.py',
    from: 'if actor_id not in requirement.get("eligibleActors", [actor_id]):\n        raise FinKoreError(INELIGIBLE_ACTOR)',
    to: 'if False and actor_id not in requirement.get("eligibleActors", [actor_id]):\n        raise FinKoreError(INELIGIBLE_ACTOR)',
  },
  {
    id: 'python-audit-actor-identity-bypass',
    suite: 'audit',
    path: 'core/src/finkore/audit.py',
    from: 'if not isinstance(actor, dict) or not _opaque(actor.get("id")):\n        raise FinKoreError(ACTOR_INVALID)',
    to: 'if not isinstance(actor, dict):\n        raise FinKoreError(ACTOR_INVALID)',
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
  {
    id: 'python-entity-duplicate-revision-bypass',
    suite: 'entities',
    path: 'core/src/finkore/entities.py',
    from: 'if len({revision["revision"] for revision in revisions}) != len(revisions):\n        raise FinKoreError(INVALID_IDENTITY)',
    to: 'if False and len({revision["revision"] for revision in revisions}) != len(revisions):\n        raise FinKoreError(INVALID_IDENTITY)',
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
    id: 'java-money-allocation-upper-bound-bypass',
    suite: 'money',
    path: 'core/src/main/java/org/finkore/Money.java',
    from: 'if (integer.compareTo(BigInteger.valueOf(minimum)) < 0\n        || integer.compareTo(BigInteger.valueOf(maximum)) > 0) {\n      throw new FinKoreException(INVALID_ALLOCATION);\n    }',
    to: 'if (integer.compareTo(BigInteger.valueOf(minimum)) < 0) {\n      throw new FinKoreException(INVALID_ALLOCATION);\n    }',
  },
  {
    id: 'java-money-allocation-maximum-rejected',
    suite: 'money',
    path: 'core/src/main/java/org/finkore/Money.java',
    from: 'if (integer.compareTo(BigInteger.valueOf(minimum)) < 0\n        || integer.compareTo(BigInteger.valueOf(maximum)) > 0) {\n      throw new FinKoreException(INVALID_ALLOCATION);\n    }',
    to: 'if (integer.compareTo(BigInteger.valueOf(minimum)) < 0\n        || integer.compareTo(BigInteger.valueOf(maximum)) >= 0) {\n      throw new FinKoreException(INVALID_ALLOCATION);\n    }',
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
  {
    id: 'java-audit-duplicate-event-bypass',
    suite: 'audit',
    path: 'core/src/main/java/org/finkore/Audit.java',
    from: 'if (eventIds.contains(event.eventId())) {\n        throw new FinKoreException(DUPLICATE_EVENT);\n      }',
    to: 'if (false && eventIds.contains(event.eventId())) {\n        throw new FinKoreException(DUPLICATE_EVENT);\n      }',
  },
  {
    id: 'java-audit-replace-append-only-bypass',
    suite: 'audit',
    path: 'core/src/main/java/org/finkore/Audit.java',
    from: 'public void replace() {\n      throw new FinKoreException(APPEND_ONLY_VIOLATION);\n    }',
    to: 'public void replace() {\n    }',
  },
  {
    id: 'java-audit-relationship-target-bypass',
    suite: 'audit',
    path: 'core/src/main/java/org/finkore/Audit.java',
    from: 'if (target == null || !relationship.target().entity().equals(target.entity())) {\n        throw new FinKoreException(INVALID_EVENT);\n      }',
    to: 'if (false && (target == null || !relationship.target().entity().equals(target.entity()))) {\n        throw new FinKoreException(INVALID_EVENT);\n      }',
  },
  {
    id: 'java-approval-expiration-bypass',
    suite: 'approvals',
    path: 'core/src/main/java/org/finkore/Approvals.java',
    from: 'return instant(evaluatedAt, INVALID_CONTEXT).compareTo(instant(decision.get("expiresAt"), INVALID_CONTEXT)) >= 0;',
    to: 'return false;',
  },
  {
    id: 'java-timestamp-nanoseconds-truncated',
    suite: 'shared',
    path: 'core/src/main/java/org/finkore/PortableTimestamp.java',
    from: 'return new InstantValue(localSecond - offsetSeconds, nanosecond);',
    to: 'return new InstantValue(localSecond - offsetSeconds, nanosecond / 1_000_000);',
  },
  {
    id: 'java-timestamp-unknown-offset-accepted',
    suite: 'shared',
    path: 'core/src/main/java/org/finkore/PortableTimestamp.java',
    from: '|| ("-".equals(sign) && offsetHour == 0 && offsetMinute == 0)) {',
    to: '|| (false && "-".equals(sign) && offsetHour == 0 && offsetMinute == 0)) {',
  },
  {
    id: 'java-approval-ineligible-actor-bypass',
    suite: 'approvals',
    path: 'core/src/main/java/org/finkore/Approvals.java',
    from: 'if (requirement.containsKey("eligibleActors") && !stringList(requirement.get("eligibleActors"), INVALID_DECISION).contains(actorId)) {\n      throw new FinKoreException(INELIGIBLE_ACTOR);\n    }',
    to: 'if (false && requirement.containsKey("eligibleActors") && !stringList(requirement.get("eligibleActors"), INVALID_DECISION).contains(actorId)) {\n      throw new FinKoreException(INELIGIBLE_ACTOR);\n    }',
  },
  {
    id: 'java-approval-opposing-quorum-bypass',
    suite: 'approvals',
    path: 'core/src/main/java/org/finkore/Approvals.java',
    from: 'if (approved && rejected) {\n      throw new FinKoreException(INVALID_CHAIN);\n    }',
    to: 'if (false && approved && rejected) {\n      throw new FinKoreException(INVALID_CHAIN);\n    }',
  },
  {
    id: 'java-audit-actor-identity-bypass',
    suite: 'audit',
    path: 'core/src/main/java/org/finkore/Audit.java',
    from: 'String id = requiredString(map.get("id"), ACTOR_INVALID);',
    to: 'String id = optionalString(map.get("id"), ACTOR_INVALID);',
  },
  {
    id: 'java-entity-immutability-bypass',
    suite: 'entities',
    path: 'core/src/main/java/org/finkore/Entities.java',
    from: 'if (!mutable.contains(path)) {\n        throw new FinKoreException(IMMUTABLE);\n      }',
    to: 'if (false && !mutable.contains(path)) {\n        throw new FinKoreException(IMMUTABLE);\n      }',
  },
  {
    id: 'java-entity-positive-money-validation-bypass',
    suite: 'entities',
    path: 'core/src/main/java/org/finkore/Entities.java',
    from: 'invalid = new BigDecimal(amount).compareTo(BigDecimal.ZERO) <= 0;',
    to: 'invalid = false;',
  },
  {
    id: 'java-entity-duplicate-revision-bypass',
    suite: 'entities',
    path: 'core/src/main/java/org/finkore/Entities.java',
    from: 'if (!seen.add(revision.get("revision"))) {',
    to: 'if (false && !seen.add(revision.get("revision"))) {',
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

function conformanceKilled(env, mutant) {
  const result = run('node', [
    'runner/dist/cli/cli.js',
    '--manifest',
    'conformance/manifest.json',
    '--adapter',
    env.FINKORE_MUTANT_ADAPTER,
    '--suite',
    mutant.suite,
    '--json',
  ], { env: { ...process.env, ...env } })
  return { ...assessMutationResult(result, mutant.expectedVector), output: result.stdout, error: result.stderr }
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
    }, mutant)
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
      return { id: mutant.id, killed: false, reason: 'Mutant compilation failed', output: compile.result.stdout, error: compile.result.stderr }
    }
    const result = conformanceKilled({
      FINKORE_MUTANT_ADAPTER: 'implementations/java/adapters/conformance/adapter.js',
      FINKORE_JAVA_PATH: resolve(repositoryRoot, '.tools/bin/java'),
      FINKORE_JAVA_CLASSPATH: compile.output,
    }, mutant)
    return { ...result, id: mutant.id }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}

function report(results) {
  let failures = 0
  for (const result of results) {
    if (result.killed) {
      console.log(`KILLED ${result.id}: ${result.reason}`)
    } else {
      failures += 1
      console.error(`NOT KILLED ${result.id}: ${result.reason}`)
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
