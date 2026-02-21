/**
 * Audio API Route Handler Tests
 * Runs route handlers directly (no network listen required).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import audioRoutes from '../audioRoutes';
import * as ttsService from '../../services/ttsService';

vi.mock('../../services/ttsService');

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    vocabularyItem: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrisma),
}));

function createMockResponse() {
  const response: Partial<Response> & { statusCode: number; body: any } = {
    statusCode: 200,
    body: undefined,
  };

  response.status = vi.fn((code: number) => {
    response.statusCode = code;
    return response as Response;
  }) as Response['status'];

  response.json = vi.fn((payload: unknown) => {
    response.body = payload;
    return response as Response;
  }) as Response['json'];

  return response as Response & { statusCode: number; body: any };
}

function getRouteHandler(
  router: typeof audioRoutes,
  method: 'get' | 'post' | 'delete',
  path: string
): RequestHandler {
  const layer = (router as any).stack.find(
    (entry: any) => entry.route?.path === path && entry.route?.methods?.[method]
  );

  if (!layer) {
    throw new Error(`Route ${method.toUpperCase()} ${path} not found`);
  }

  return layer.route.stack[0].handle as RequestHandler;
}

async function runHandler(
  handler: RequestHandler,
  request: Partial<Request>
) {
  const req = {
    headers: {},
    params: {},
    query: {},
    body: {},
    ...request,
  } as Request;
  const res = createMockResponse();
  const next = vi.fn() as unknown as NextFunction;

  await handler(req, res, next);
  return res;
}

describe('Audio API Routes', () => {
  const getStatusHandler = getRouteHandler(audioRoutes, 'get', '/status');
  const getAudioHandler = getRouteHandler(audioRoutes, 'get', '/:wordId');
  const batchAudioHandler = getRouteHandler(audioRoutes, 'post', '/batch');
  const deleteAudioHandler = getRouteHandler(audioRoutes, 'delete', '/:wordId');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/audio/status', () => {
    it('should return runtime status payload', async () => {
      vi.mocked(ttsService.getTtsRuntimeStatus).mockReturnValueOnce({
        enabled: true,
        provider: 'google',
        ready: true,
      });

      const response = await runHandler(getStatusHandler, {});

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        enabled: true,
        provider: 'google',
        ready: true,
      });
    });
  });

  describe('GET /api/audio/:wordId', () => {
    it('should return audio URL for valid word', async () => {
      const mockWordId = 'clw123abc';
      const mockAudioUrl = 'data:audio/mp3;base64,test-audio';

      mockPrisma.vocabularyItem.findUnique.mockResolvedValueOnce({
        id: mockWordId,
        word: 'Hallo',
        audioUrl: mockAudioUrl,
      });
      vi.mocked(ttsService.generateAudio).mockResolvedValueOnce({
        audioUrl: mockAudioUrl,
        source: 'cache',
        provider: 'google',
        cached: true,
      });

      const response = await runHandler(getAudioHandler, {
        params: { wordId: mockWordId },
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        wordId: mockWordId,
        word: 'Hallo',
        audioUrl: mockAudioUrl,
        source: 'cache',
        provider: 'google',
      });
    });

    it('should return 404 for non-existent word', async () => {
      const mockWordId = 'clw123nonexistent';

      mockPrisma.vocabularyItem.findUnique.mockResolvedValueOnce(null);

      const response = await runHandler(getAudioHandler, {
        params: { wordId: mockWordId },
      });

      expect(response.statusCode).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('WORD_NOT_FOUND');
    });

    it('should return 400 for invalid wordId format', async () => {
      const response = await runHandler(getAudioHandler, {
        params: { wordId: 'invalid-id' },
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle TTS service returning null (fallback)', async () => {
      const mockWordId = 'clw123abc';

      mockPrisma.vocabularyItem.findUnique.mockResolvedValueOnce({
        id: mockWordId,
        word: 'Hallo',
        audioUrl: null,
      });
      vi.mocked(ttsService.generateAudio).mockResolvedValueOnce({
        audioUrl: null,
        source: 'fallback',
        provider: 'google',
        cached: false,
        fallbackReason: 'PROVIDER_NOT_CONFIGURED',
      });

      const response = await runHandler(getAudioHandler, {
        params: { wordId: mockWordId },
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.audioUrl).toBeNull();
      expect(response.body.data.fallbackRequired).toBe(true);
      expect(response.body.data.fallbackReason).toBe('PROVIDER_NOT_CONFIGURED');
    });

    it('should return 500 on internal error', async () => {
      const mockWordId = 'clw123abc';

      mockPrisma.vocabularyItem.findUnique.mockRejectedValueOnce(
        new Error('Database connection failed')
      );

      const response = await runHandler(getAudioHandler, {
        params: { wordId: mockWordId },
      });

      expect(response.statusCode).toBe(500);
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

      const response = await runHandler(batchAudioHandler, {
        body: { wordIds: mockWordIds },
      });

      expect(response.statusCode).toBe(200);
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

      const response = await runHandler(batchAudioHandler, {
        body: { wordIds: mockWordIds },
      });

      expect(response.statusCode).toBe(200);
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

      const response = await runHandler(batchAudioHandler, {
        body: { wordIds: mockWordIds, force: true },
      });

      expect(response.statusCode).toBe(200);
      expect(ttsService.clearAudioCache).toHaveBeenCalledWith('clw1abc123def456');
    });

    it('should return 400 for invalid request body', async () => {
      const response = await runHandler(batchAudioHandler, {
        body: { wordIds: 'not-an-array' },
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for empty wordIds array', async () => {
      const response = await runHandler(batchAudioHandler, {
        body: { wordIds: [] },
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for too many words (>100)', async () => {
      const tooManyWords = Array(101).fill('clw1');

      const response = await runHandler(batchAudioHandler, {
        body: { wordIds: tooManyWords },
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid wordId format in array', async () => {
      const response = await runHandler(batchAudioHandler, {
        body: { wordIds: ['clw1abc123def456', 'invalid-id', 'clw3abc123def456'] },
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('DELETE /api/audio/:wordId', () => {
    it('should clear audio cache successfully', async () => {
      const mockWordId = 'clw123abc';

      vi.mocked(ttsService.clearAudioCache).mockResolvedValueOnce();

      const response = await runHandler(deleteAudioHandler, {
        params: { wordId: mockWordId },
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.wordId).toBe(mockWordId);
      expect(ttsService.clearAudioCache).toHaveBeenCalledWith(mockWordId);
    });

    it('should return 400 for invalid wordId format', async () => {
      const response = await runHandler(deleteAudioHandler, {
        params: { wordId: 'invalid-id' },
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 500 if clearing cache fails', async () => {
      const mockWordId = 'clw123abc';

      vi.mocked(ttsService.clearAudioCache).mockRejectedValueOnce(
        new Error('Database error')
      );

      const response = await runHandler(deleteAudioHandler, {
        params: { wordId: mockWordId },
      });

      expect(response.statusCode).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('Response Format Consistency', () => {
    it('should return consistent success response format', async () => {
      const mockWordId = 'clw123abc';

      mockPrisma.vocabularyItem.findUnique.mockResolvedValueOnce({
        id: mockWordId,
        word: 'Test',
        audioUrl: 'test-url',
      });
      vi.mocked(ttsService.generateAudio).mockResolvedValueOnce({
        audioUrl: 'test-url',
        source: 'provider',
        provider: 'google',
        cached: false,
      });

      const response = await runHandler(getAudioHandler, {
        params: { wordId: mockWordId },
      });

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toBeTypeOf('object');
    });

    it('should return consistent error response format', async () => {
      const response = await runHandler(getAudioHandler, {
        params: { wordId: 'invalid-id' },
      });

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error).toHaveProperty('message');
    });
  });
});
