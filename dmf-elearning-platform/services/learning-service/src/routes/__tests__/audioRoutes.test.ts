/**
 * Audio API Routes Integration Tests
 * Tests for /api/audio endpoints
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import express, { Application } from 'express';
import audioRoutes from '../audioRoutes';
import * as ttsService from '../../services/ttsService';

// Mock the TTS service
vi.mock('../../services/ttsService');

// Mock Prisma
vi.mock('@prisma/client', () => {
  const mockPrisma = {
    vocabularyItem: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  };
  return {
    PrismaClient: vi.fn(() => mockPrisma),
  };
});

describe('Audio API Routes', () => {
  let app: Application;

  beforeEach(() => {
    // Create Express app with audio routes
    app = express();
    app.use(express.json());
    app.use('/api/audio', audioRoutes);

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/audio/:wordId', () => {
    it('should return audio URL for valid word', async () => {
      const mockWordId = 'clw123abc';
      const mockAudioUrl = 'data:audio/mp3;base64,test-audio';

      // Mock Prisma response
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      (prisma.vocabularyItem.findUnique as any).mockResolvedValueOnce({
        id: mockWordId,
        word: 'Hallo',
        audioUrl: mockAudioUrl,
      });

      // Mock TTS service
      vi.mocked(ttsService.generateAudioUrl).mockResolvedValueOnce(mockAudioUrl);

      const response = await request(app).get(`/api/audio/${mockWordId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        wordId: mockWordId,
        word: 'Hallo',
        audioUrl: mockAudioUrl,
      });
    });

    it('should return 404 for non-existent word', async () => {
      const mockWordId = 'clw123nonexistent';

      // Mock Prisma response (word not found)
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      (prisma.vocabularyItem.findUnique as any).mockResolvedValueOnce(null);

      const response = await request(app).get(`/api/audio/${mockWordId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('WORD_NOT_FOUND');
    });

    it('should return 400 for invalid wordId format', async () => {
      const invalidWordId = 'invalid-id';

      const response = await request(app).get(`/api/audio/${invalidWordId}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle TTS service returning null (fallback)', async () => {
      const mockWordId = 'clw123abc';

      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      (prisma.vocabularyItem.findUnique as any).mockResolvedValueOnce({
        id: mockWordId,
        word: 'Hallo',
        audioUrl: null,
      });

      // TTS service returns null (API key not configured)
      vi.mocked(ttsService.generateAudioUrl).mockResolvedValueOnce(null);

      const response = await request(app).get(`/api/audio/${mockWordId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.audioUrl).toBeNull();
      expect(response.body.data.fallbackRequired).toBe(true);
    });

    it('should return 500 on internal error', async () => {
      const mockWordId = 'clw123abc';

      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      (prisma.vocabularyItem.findUnique as any).mockRejectedValueOnce(
        new Error('Database connection failed')
      );

      const response = await request(app).get(`/api/audio/${mockWordId}`);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/audio/batch', () => {
    it('should process batch audio generation successfully', async () => {
      const mockWordIds = ['clw1abc123def456', 'clw2abc123def456', 'clw3abc123def456'];

      vi.mocked(ttsService.batchGenerateAudio).mockResolvedValueOnce({
        success: 3,
        failed: 0,
        errors: [],
      });

      const response = await request(app)
        .post('/api/audio/batch')
        .send({ wordIds: mockWordIds });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        total: 3,
        successful: 3,
        failed: 0,
      });
      expect(ttsService.batchGenerateAudio).toHaveBeenCalledWith(mockWordIds);
    });

    it('should handle partial failures in batch', async () => {
      const mockWordIds = ['clw1abc123def456', 'clw2abc123def456', 'clw3abc123def456'];

      vi.mocked(ttsService.batchGenerateAudio).mockResolvedValueOnce({
        success: 2,
        failed: 1,
        errors: ['Failed to generate audio for word clw2'],
      });

      const response = await request(app)
        .post('/api/audio/batch')
        .send({ wordIds: mockWordIds });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.successful).toBe(2);
      expect(response.body.data.failed).toBe(1);
      expect(response.body.data.errors).toHaveLength(1);
    });

    it('should force regeneration when force=true', async () => {
      const mockWordIds = ['clw1abc123def456'];

      vi.mocked(ttsService.clearAudioCache).mockResolvedValueOnce();
      vi.mocked(ttsService.batchGenerateAudio).mockResolvedValueOnce({
        success: 1,
        failed: 0,
        errors: [],
      });

      const response = await request(app)
        .post('/api/audio/batch')
        .send({ wordIds: mockWordIds, force: true });

      expect(response.status).toBe(200);
      expect(ttsService.clearAudioCache).toHaveBeenCalledWith('clw1abc123def456');
    });

    it('should return 400 for invalid request body', async () => {
      const response = await request(app)
        .post('/api/audio/batch')
        .send({ wordIds: 'not-an-array' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for empty wordIds array', async () => {
      const response = await request(app)
        .post('/api/audio/batch')
        .send({ wordIds: [] });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for too many words (>100)', async () => {
      const tooManyWords = Array(101).fill('clw1');

      const response = await request(app)
        .post('/api/audio/batch')
        .send({ wordIds: tooManyWords });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid wordId format in array', async () => {
      const response = await request(app)
        .post('/api/audio/batch')
        .send({ wordIds: ['clw1abc123def456', 'invalid-id', 'clw3abc123def456'] });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('DELETE /api/audio/:wordId', () => {
    it('should clear audio cache successfully', async () => {
      const mockWordId = 'clw123abc';

      vi.mocked(ttsService.clearAudioCache).mockResolvedValueOnce();

      const response = await request(app).delete(`/api/audio/${mockWordId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.wordId).toBe(mockWordId);
      expect(ttsService.clearAudioCache).toHaveBeenCalledWith(mockWordId);
    });

    it('should return 400 for invalid wordId format', async () => {
      const invalidWordId = 'invalid-id';

      const response = await request(app).delete(`/api/audio/${invalidWordId}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 500 if clearing cache fails', async () => {
      const mockWordId = 'clw123abc';

      vi.mocked(ttsService.clearAudioCache).mockRejectedValueOnce(
        new Error('Database error')
      );

      const response = await request(app).delete(`/api/audio/${mockWordId}`);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('Response Format Consistency', () => {
    it('should return consistent success response format', async () => {
      const mockWordId = 'clw123abc';

      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      (prisma.vocabularyItem.findUnique as any).mockResolvedValueOnce({
        id: mockWordId,
        word: 'Test',
        audioUrl: 'test-url',
      });

      vi.mocked(ttsService.generateAudioUrl).mockResolvedValueOnce('test-url');

      const response = await request(app).get(`/api/audio/${mockWordId}`);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toBeTypeOf('object');
    });

    it('should return consistent error response format', async () => {
      const response = await request(app).get('/api/audio/invalid-id');

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error).toHaveProperty('message');
    });
  });
});
