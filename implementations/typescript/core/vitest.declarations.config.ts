// SPDX-License-Identifier: MPL-2.0
// Runs all core tests with focused Entity declaration coverage. Writes test/coverage output; defines no financial behavior.
import { defineConfig } from 'vitest/config'
export default defineConfig({ test: {
  include: ['test/**/*.test.ts'],
  coverage: { provider: 'v8', include: ['src/entities/entity.ts'] },
} })
