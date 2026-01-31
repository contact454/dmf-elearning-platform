/**
 * Global Vitest Configuration
 * 
 * Applied to all packages unless overridden.
 * Ensures "No test files found" does not fail builds.
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    passWithNoTests: true, // Allow packages with no tests to pass
  },
});
