/**
 * Unit test: computeReadiness export (Kiểm tra đơn vị: xuất computeReadiness)
 * 
 * Ensures computeReadiness is importable from the package.
 */

import { describe, it, expect } from 'vitest';
import { computeReadiness } from './readiness-model.js';

describe('computeReadiness export', () => {
  it('should export computeReadiness as a function', () => {
    expect(typeof computeReadiness).toBe('function');
  });
});
