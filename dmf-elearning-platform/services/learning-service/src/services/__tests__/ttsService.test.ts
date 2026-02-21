/**
 * TTS Service Unit Tests
 * Tests for URL-based Text-to-Speech service
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as ttsService from '../ttsService';

describe('TTS Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getGoogleTTSUrl', () => {
    it('should generate URL with default German language', () => {
      const url = ttsService.getGoogleTTSUrl({ text: 'Hallo' });
      expect(url).toContain('tl=de');
      expect(url).toContain('q=Hallo');
      expect(url).toContain('translate.google.com');
    });

    it('should support custom language', () => {
      const url = ttsService.getGoogleTTSUrl({ text: 'Hello', language: 'en' });
      expect(url).toContain('tl=en');
    });

    it('should support slow speed', () => {
      const urlSlow = ttsService.getGoogleTTSUrl({ text: 'Test', slow: true });
      expect(urlSlow).toContain('ttsspeed=0.3');

      const urlNormal = ttsService.getGoogleTTSUrl({ text: 'Test', slow: false });
      expect(urlNormal).toContain('ttsspeed=1.0');
    });

    it('should encode special German characters', () => {
      const url = ttsService.getGoogleTTSUrl({ text: 'Äpfel Übung Straße' });
      expect(url).not.toContain(' '); // Spaces encoded
      expect(url).toContain('q='); // Contains query
    });
  });

  describe('getWordPronunciationUrl', () => {
    it('should generate URL for German word', () => {
      const url = ttsService.getWordPronunciationUrl('Hund');
      expect(url).toContain('q=Hund');
      expect(url).toContain('tl=de');
    });

    it('should generate slow URL', () => {
      const url = ttsService.getWordPronunciationUrl('Hund', true);
      expect(url).toContain('ttsspeed=0.3');
    });
  });

  describe('getPronunciationPack', () => {
    it('should return word pronunciation (normal + slow)', () => {
      const pack = ttsService.getPronunciationPack('Hallo');
      expect(pack.word.normal).toContain('q=Hallo');
      expect(pack.word.slow).toContain('ttsspeed=0.3');
      expect(pack.sentence).toBeNull();
    });

    it('should include sentence pronunciation if provided', () => {
      const pack = ttsService.getPronunciationPack('Hallo', 'Hallo, wie geht es?');
      expect(pack.word.normal).toBeDefined();
      expect(pack.sentence).not.toBeNull();
      expect(pack.sentence!.normal).toContain('Hallo');
    });
  });

  describe('LISTENING_SPEED_PRESETS', () => {
    it('should have presets for all CEFR levels', () => {
      expect(ttsService.LISTENING_SPEED_PRESETS.A1).toBe(0.75);
      expect(ttsService.LISTENING_SPEED_PRESETS.A2).toBe(0.85);
      expect(ttsService.LISTENING_SPEED_PRESETS.B1).toBe(1.0);
      expect(ttsService.LISTENING_SPEED_PRESETS.B2).toBe(1.15);
    });

    it('should increase speed with higher levels', () => {
      const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      for (let i = 1; i < levels.length; i++) {
        expect(ttsService.LISTENING_SPEED_PRESETS[levels[i]]).toBeGreaterThanOrEqual(
          ttsService.LISTENING_SPEED_PRESETS[levels[i - 1]]
        );
      }
    });
  });

  describe('SPEED_OPTIONS', () => {
    it('should have 5 speed options', () => {
      expect(ttsService.SPEED_OPTIONS).toHaveLength(5);
    });

    it('should have labels and values', () => {
      for (const option of ttsService.SPEED_OPTIONS) {
        expect(option.label).toBeDefined();
        expect(option.value).toBeGreaterThan(0);
      }
    });
  });

  describe('getTtsRuntimeStatus', () => {
    it('should return status object', () => {
      const status = ttsService.getTtsRuntimeStatus();
      expect(status.provider).toBeDefined();
      expect(status.status).toBe('active');
      expect(status.enabled).toBe(true);
      expect(status.ready).toBe(true);
    });
  });

  describe('generateAudio', () => {
    it('should generate audio URL for a word', async () => {
      const result = await ttsService.generateAudio('word1', 'Hallo', 'de-DE');
      expect(result.audioUrl).toContain('q=Hallo');
      expect(result.audioUrl).toContain('tl=de');
      expect(result.source).toBe('google_tts');
      expect(result.provider).toBe('google_translate');
    });

    it('should handle different locales', async () => {
      const resultDe = await ttsService.generateAudio('w1', 'Hello', 'en-US');
      expect(resultDe.audioUrl).toContain('tl=en');
    });
  });

  describe('batchGenerateAudio', () => {
    it('should process batch of words', async () => {
      const result = await ttsService.batchGenerateAudio(['w1', 'w2', 'w3']);
      expect(result.success).toBe(3);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle empty array', async () => {
      const result = await ttsService.batchGenerateAudio([]);
      expect(result.success).toBe(0);
      expect(result.failed).toBe(0);
    });
  });

  describe('clearAudioCache', () => {
    it('should not throw', async () => {
      await expect(ttsService.clearAudioCache('word1')).resolves.not.toThrow();
    });
  });
});
