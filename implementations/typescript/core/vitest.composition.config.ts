// SPDX-License-Identifier: MPL-2.0
// Scoped composition verification; reports coverage without changing the full-suite gates.
// This configuration defines no financial behavior.
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['test/approvals/composition*.test.ts'],
    coverage: { provider: 'v8', include: ['src/approvals/approval-composition.ts'] },
  },
})
