// SPDX-License-Identifier: MPL-2.0
// Verifies the M4 Approval contracts; M5 native retention tests remain in the full suite.
// This scoped configuration defines no financial behavior.
import { defineConfig } from 'vitest/config'
export default defineConfig({ test: {
  include: ['test/approvals/*.test.ts', 'test/integration/evidence-regressions.test.ts'],
  testNamePattern: /^(?!approval097 unsupported native)(?!entity(?:097|\.)).*$/,
  coverage: { provider: 'v8', include: ['src/approvals/*.ts'] },
} })
