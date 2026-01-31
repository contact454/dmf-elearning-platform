/**
 * Assessment Repository (Kho lưu trữ Assessment)
 */

import type { AssessmentId, UserId, QuizId } from '@dmf/shared';
import type { Database } from '@dmf/infra';

export type AssessmentStatus = 'scheduled' | 'in-progress' | 'submitted' | 'graded';

export interface Assessment {
  id: AssessmentId;
  userId: UserId;
  quizId: QuizId;
  status: AssessmentStatus;
  score?: number; // Computed internally, NOT in event payload (Được tính toán nội bộ, KHÔNG có trong payload sự kiện)
  answers?: Record<string, unknown>; // Quiz answers (Đáp án bài kiểm tra)
  startedAt: Date;
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class AssessmentRepository {
  constructor(private db: Database) {}

  async create(data: {
    userId: UserId;
    quizId: QuizId;
    status: AssessmentStatus;
    startedAt: Date;
  }): Promise<Assessment> {
    const assessmentId = `assessment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` as any;
    const assessment: Assessment = {
      id: assessmentId,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.db.query('INSERT INTO assessments VALUES ?', [assessment]);
    return assessment;
  }

  async findById(id: AssessmentId): Promise<Assessment | null> {
    const results = await this.db.query<Assessment>('SELECT * FROM assessments WHERE id = ?', [id]);
    return results[0] || null;
  }

  async findByUserIdAndQuiz(userId: UserId, quizId: QuizId): Promise<Assessment[]> {
    const results = await this.db.query<Assessment>('SELECT * FROM assessments', []);
    return results.filter((a) => a.userId === userId && a.quizId === quizId);
  }

  async findByUserId(userId: UserId): Promise<Assessment[]> {
    const results = await this.db.query<Assessment>('SELECT * FROM assessments', []);
    return results.filter((a) => a.userId === userId);
  }

  async update(
    id: AssessmentId,
    data: Partial<Pick<Assessment, 'status' | 'score' | 'answers' | 'submittedAt'>>
  ): Promise<Assessment> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error('Assessment not found');
    }

    const updated = { ...existing, ...data, updatedAt: new Date() };
    await this.db.query('UPDATE assessments SET ? WHERE id = ?', [updated, id]);
    return updated;
  }
}
