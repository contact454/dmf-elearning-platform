import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  mockReadingSaveVocabulary: vi.fn(),
  mockListeningSubmitAttempt: vi.fn(),
  mockUpdateListeningSrs: vi.fn(),
  mockUpdateStreak: vi.fn(),
}));

vi.mock('../../middlewares/auth', () => ({
  authMiddleware: (req: any, _res: any, next: any) => {
    req.user = { id: 'jwt-user-001', roles: [], scopes: [] };
    next();
  },
  attachAuthenticatedUserId: (req: any, _res: any, next: any) => {
    const userId = req.user?.id ?? 'jwt-user-001';
    if (!req.params || typeof req.params !== 'object') {
      req.params = {};
    }
    req.params.userId = userId;

    if (!req.query || typeof req.query !== 'object') {
      req.query = {};
    }
    req.query.userId = userId;

    if (!req.body || typeof req.body !== 'object') {
      req.body = {};
    }
    req.body.userId = userId;

    next();
  },
  ensureAuthenticatedUserProfile: (_req: any, _res: any, next: any) => next(),
}));

vi.mock('../../services/ReadingPassageService', () => ({
  ReadingPassageService: class {
    saveVocabulary = mocks.mockReadingSaveVocabulary;
  },
}));

vi.mock('../../services/ListeningService', () => ({
  ListeningService: class {
    submitAttempt = mocks.mockListeningSubmitAttempt;
  },
}));

vi.mock('../../lib/listening-srs', () => ({
  updateProgress: mocks.mockUpdateListeningSrs,
}));

vi.mock('../../services/streakService', () => ({
  updateStreak: mocks.mockUpdateStreak,
}));

import readingRoutes from '../reading';
import listeningRoutes from '../listening';
import speakingRoutes from '../speaking';
import writingRoutes from '../writing';

const describeSupertest =
  process.env.CODEX_SANDBOX_NETWORK_DISABLED === '1' ? describe.skip : describe;

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/reading', readingRoutes);
  app.use('/api/listening', listeningRoutes);
  app.use('/api/speaking', speakingRoutes);
  app.use('/api/writing', writingRoutes);
  return app;
}

describeSupertest('Learning loop routes (supertest)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.mockReadingSaveVocabulary.mockResolvedValue({
      vocabularyId: 'word-1',
      word: 'haus',
      passageId: 'passage-1',
      addedToSRS: true,
      status: 'NEW',
      message: 'Word added to your vocabulary review queue',
    });

    mocks.mockListeningSubmitAttempt.mockResolvedValue({
      id: 'attempt-1',
      exerciseId: 'exercise-1',
      userId: 'jwt-user-001',
      accuracy: 82,
    });

    mocks.mockUpdateListeningSrs.mockResolvedValue({
      quality: 4,
      nextReviewAt: new Date('2026-02-21T00:00:00.000Z'),
      interval: 2,
      easeFactor: 2.6,
      xp_earned: 8,
    });

    mocks.mockUpdateStreak.mockResolvedValue({
      success: true,
      data: {
        currentStreak: 3,
        longestStreak: 5,
        milestoneReached: null,
      },
    });
  });

  it('POST /api/reading/vocabulary/save uses authenticated userId and saves to service', async () => {
    const app = createApp();

    const response = await request(app).post('/api/reading/vocabulary/save').send({
      userId: 'spoofed-user',
      passageId: 'passage-1',
      word: 'Haus',
      translation: 'nhà',
      sentence: 'Das Haus ist neu.',
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(mocks.mockReadingSaveVocabulary).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'jwt-user-001',
        passageId: 'passage-1',
        word: 'Haus',
        translation: 'nhà',
      })
    );
  });

  it('POST /api/reading/vocabulary/save returns 400 when required fields are missing', async () => {
    const app = createApp();

    const response = await request(app).post('/api/reading/vocabulary/save').send({
      passageId: 'passage-1',
      word: 'Haus',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(mocks.mockReadingSaveVocabulary).not.toHaveBeenCalled();
  });

  it('GET /api/reading/passages returns 400 when query is invalid', async () => {
    const app = createApp();

    const response = await request(app).get('/api/reading/passages?limit=invalid');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/reading/passages/:id returns 400 for invalid passage id input', async () => {
    const app = createApp();

    const response = await request(app).get('/api/reading/passages/%20');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/reading returns 400 when list query is invalid', async () => {
    const app = createApp();

    const response = await request(app).get('/api/reading?limit=invalid');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/reading/:id returns 400 for invalid content id input', async () => {
    const app = createApp();

    const response = await request(app).get('/api/reading/%20');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/listening/exercise/:exerciseId/attempt uses authenticated userId and updates SRS', async () => {
    const app = createApp();

    const response = await request(app)
      .post('/api/listening/exercise/exercise-1/attempt')
      .send({
        userId: 'spoofed-user',
        userText: 'Ich verstehe',
        accuracy: 82,
        wordsCorrect: 2,
        wordsTotal: 3,
        mistakes: [],
        listenCount: 1,
        timeSpent: 12,
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(mocks.mockListeningSubmitAttempt).toHaveBeenCalledWith(
      'exercise-1',
      'jwt-user-001',
      expect.objectContaining({
        userText: 'Ich verstehe',
        accuracy: 82,
      })
    );
    expect(mocks.mockUpdateListeningSrs).toHaveBeenCalledWith('jwt-user-001', 'exercise-1', {
      correct: true,
      accuracy_score: 82,
      time_spent_seconds: 12,
    });
    expect(mocks.mockUpdateStreak).toHaveBeenCalledWith('jwt-user-001');
  });

  it('POST /api/listening/exercise/:exerciseId/attempt returns 400 when userText is missing', async () => {
    const app = createApp();

    const response = await request(app)
      .post('/api/listening/exercise/exercise-1/attempt')
      .send({
        accuracy: 50,
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(mocks.mockListeningSubmitAttempt).not.toHaveBeenCalled();
  });

  it('GET /api/listening returns 400 when query is invalid', async () => {
    const app = createApp();

    const response = await request(app).get('/api/listening?limit=invalid');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/listening/exercise/:exerciseId returns 400 for invalid exercise id input', async () => {
    const app = createApp();

    const response = await request(app).get('/api/listening/exercise/%20');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/speaking returns 400 when list query is invalid', async () => {
    const app = createApp();

    const response = await request(app).get('/api/speaking?limit=invalid');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/speaking/:id returns 400 for invalid prompt id input', async () => {
    const app = createApp();

    const response = await request(app).get('/api/speaking/%20');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/writing returns 400 when list query is invalid', async () => {
    const app = createApp();

    const response = await request(app).get('/api/writing?limit=invalid');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/writing/:id returns 400 for invalid prompt id input', async () => {
    const app = createApp();

    const response = await request(app).get('/api/writing/%20');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
