import { defineConfig } from 'vitest/config'

// One test run covers the shared core and every app.
export default defineConfig({
  test: {
    include: ['packages/*/src/**/*.test.ts', 'apps/*/src/**/*.test.ts'],
  },
})
