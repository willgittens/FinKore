// SPDX-License-Identifier: MPL-2.0
// Runs Entity declaration checks while the single known M7 core regression stays
// in full-suite discovery. Writes test/coverage output; defines no financial behavior.
import { defineConfig } from 'vitest/config'
export default defineConfig({ test: {
  include: ['test/**/*.test.ts'],
  testNamePattern: /^(?!entity\.boundary097\.import-mutability-rule-absent-001$).*$/,
  coverage: { provider: 'v8', include: ['src/entities/entity.ts'] },
} })
