/**
 * Vitest setup file
 * Global test configuration and mocks
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

// Mock environment variables for testing
beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
});

afterAll(() => {
  // Cleanup after all tests
});

beforeEach(() => {
  // Reset before each test
});

afterEach(() => {
  // Cleanup after each test
});
