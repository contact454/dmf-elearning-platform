import { describe, it, expect } from 'vitest';
import { EssayService } from '../essayService';

describe('EssayService', () => {
  describe('countWords', () => {
    const service = new EssayService();

    it('should count words correctly', () => {
      expect(service.countWords('Ich gehe zur Schule')).toBe(4);
      expect(service.countWords('  Extra   spaces  ')).toBe(2);
      expect(service.countWords('')).toBe(0);
      expect(service.countWords('   ')).toBe(0);
      expect(service.countWords('Single')).toBe(1);
      expect(service.countWords('Hallo, wie geht es dir?')).toBe(5);
    });

    it('should handle special characters', () => {
      expect(service.countWords('Test-word hyphenated')).toBe(2);
      expect(service.countWords('Word1 Word2\nWord3')).toBe(3);
    });
  });
});
