import Fastify from 'fastify';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { registerGamificationRoutes } from '../gamification.routes.js';
import { createInMemoryUserStatsRepository } from '../../state/in-memory-stats.repository.js';

describe('gamification routes', () => {
  const testUserId = 'user-test-gamification';
  let app: ReturnType<typeof Fastify>;

  beforeEach(async () => {
    app = Fastify();
    const statsRepo = createInMemoryUserStatsRepository();
    registerGamificationRoutes(app, { statsRepo });
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns user stats and derived level values', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/gamification/add-xp',
      payload: {
        userId: testUserId,
        amount: 250,
      },
    });

    const response = await app.inject({
      method: 'GET',
      url: `/api/gamification/stats/${testUserId}`,
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.userId).toBe(testUserId);
    expect(body.currentXP).toBe(250);
    expect(body.currentLevel).toBe(2);
    expect(body.xpForNextLevel).toBeGreaterThan(0);
  });

  it('updates xp and returns leveledUp flag', async () => {
    const first = await app.inject({
      method: 'POST',
      url: '/api/gamification/add-xp',
      payload: {
        userId: testUserId,
        amount: 99,
      },
    });

    expect(first.statusCode).toBe(200);
    expect(first.json().leveledUp).toBe(false);
    expect(first.json().level).toBe(1);

    const second = await app.inject({
      method: 'POST',
      url: '/api/gamification/add-xp',
      payload: {
        userId: testUserId,
        amount: 1,
      },
    });

    expect(second.statusCode).toBe(200);
    expect(second.json().leveledUp).toBe(true);
    expect(second.json().level).toBe(2);
  });

  it('supports streak check-in and prevents duplicate check-in on same day', async () => {
    const checkInFirst = await app.inject({
      method: 'POST',
      url: '/api/gamification/streak/check-in',
      payload: { userId: testUserId },
    });

    expect(checkInFirst.statusCode).toBe(200);
    expect(checkInFirst.json().streak).toBe(1);
    expect(checkInFirst.json().alreadyCheckedIn).toBe(false);

    const streakStatus = await app.inject({
      method: 'GET',
      url: `/api/gamification/streak/${testUserId}`,
    });

    expect(streakStatus.statusCode).toBe(200);
    expect(streakStatus.json().canCheckIn).toBe(false);

    const checkInSecond = await app.inject({
      method: 'POST',
      url: '/api/gamification/streak/check-in',
      payload: { userId: testUserId },
    });

    expect(checkInSecond.statusCode).toBe(200);
    expect(checkInSecond.json().streak).toBe(1);
    expect(checkInSecond.json().alreadyCheckedIn).toBe(true);
  });

  it('returns leaderboard sorted by xp descending', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/gamification/add-xp',
      payload: { userId: 'leaderboard-alpha', amount: 1000 },
    });

    await app.inject({
      method: 'POST',
      url: '/api/gamification/add-xp',
      payload: { userId: 'leaderboard-beta', amount: 400 },
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/gamification/leaderboard?limit=2',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.leaderboard).toHaveLength(2);
    expect(body.leaderboard[0].xp).toBeGreaterThanOrEqual(body.leaderboard[1].xp);
    expect(body.leaderboard[0].rank).toBe(1);
  });
});
