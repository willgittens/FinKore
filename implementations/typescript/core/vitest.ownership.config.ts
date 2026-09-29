// SPDX-License-Identifier: MPL-2.0
// Verifies Approval/Workflow retention while Entity M6–M7 regressions remain in the full suite.
// Writes only test/coverage output and defines no financial behavior.
import { defineConfig } from 'vitest/config'
export default defineConfig({ test: {
  include: ['test/approvals/*.test.ts', 'test/workflow/*.test.ts', 'test/integration/native-ownership.test.ts', 'test/integration/evidence-regressions.test.ts'],
  testNamePattern: /^(?!entity(?:097|\.)).*$/,
  coverage: { provider: 'v8', include: ['src/approvals/*.ts', 'src/workflow/*.ts'] },
} })
