/**
 * SQLite Attempt Repository (Kho lưu trữ Attempt SQLite)
 * 
 * Implements AttemptRepository interface using SQLite.
 */

import type { AttemptId, UserId, LessonId } from '@dmf/shared';
import { AttemptStatus } from '@dmf/shared';
import type { Database } from '@dmf/infra';
import type { Attempt } from './attempt.repository';

export class SQLiteAttemptRepository {
  constructor(private db: Database) {}

  async create(data: {
    userId: UserId;
    lessonId: LessonId;
    status: AttemptStatus;
    startedAt: Date;
  }): Promise<Attempt> {
    const attemptId = `attempt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` as any;
    const attempt: Attempt = {
      id: attemptId,
      ...data,
    };

    await this.db.query(
      `INSERT INTO attempts (id, user_id, lesson_id, status, started_at, completed_at, abandoned_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        attempt.id,
        attempt.userId,
        attempt.lessonId,
        attempt.status,
        attempt.startedAt.toISOString(),
        null,
        null,
      ]
    );

    return attempt;
  }

  async findById(id: AttemptId): Promise<Attempt | null> {
    const results = await this.db.query<{
      id: string;
      user_id: string;
      lesson_id: string;
      status: string;
      started_at: string;
      completed_at: string | null;
      abandoned_at: string | null;
    }>('SELECT * FROM attempts WHERE id = ?', [id]);

    if (results.length === 0) {
      return null;
    }

    const row = results[0];
    return {
      id: row.id as AttemptId,
      userId: row.user_id as UserId,
      lessonId: row.lesson_id as LessonId,
      status: row.status as AttemptStatus,
      startedAt: new Date(row.started_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
      abandonedAt: row.abandoned_at ? new Date(row.abandoned_at) : undefined,
    };
  }

  async findByUserAndLesson(userId: UserId, lessonId: LessonId): Promise<Attempt[]> {
    const results = await this.db.query<{
      id: string;
      user_id: string;
      lesson_id: string;
      status: string;
      started_at: string;
      completed_at: string | null;
      abandoned_at: string | null;
    }>('SELECT * FROM attempts WHERE user_id = ? AND lesson_id = ?', [userId, lessonId]);

    return results.map((row) => ({
      id: row.id as AttemptId,
      userId: row.user_id as UserId,
      lessonId: row.lesson_id as LessonId,
      status: row.status as AttemptStatus,
      startedAt: new Date(row.started_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
      abandonedAt: row.abandoned_at ? new Date(row.abandoned_at) : undefined,
    }));
  }

  async update(
    id: AttemptId,
    data: Partial<Pick<Attempt, 'status' | 'completedAt' | 'abandonedAt'>>
  ): Promise<Attempt> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error('Attempt not found');
    }

    const updated: Attempt = {
      ...existing,
      ...data,
    };

    await this.db.query(
      `UPDATE attempts 
       SET status = ?, completed_at = ?, abandoned_at = ?
       WHERE id = ?`,
      [
        updated.status,
        updated.completedAt?.toISOString() || null,
        updated.abandonedAt?.toISOString() || null,
        id,
      ]
    );

    return updated;
  }
}
