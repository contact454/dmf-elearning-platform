/**
 * Enrollment Repository (Kho lưu trữ Enrollment)
 */

import type { EnrollmentId, UserId, CourseId } from '@dmf/shared';
import type { Database } from '@dmf/infra';

export interface Enrollment {
  id: EnrollmentId;
  userId: UserId;
  courseId: CourseId;
  enrolledAt: Date;
}

export class EnrollmentRepository {
  constructor(private db: Database) {}

  async create(data: Enrollment): Promise<Enrollment> {
    await this.db.query(
      `INSERT INTO enrollments (id, user_id, course_id, enrolled_at)
       VALUES (?, ?, ?, ?)`,
      [data.id, data.userId, data.courseId, data.enrolledAt.toISOString()]
    );
    return data;
  }

  async findByUserAndCourse(userId: UserId, courseId: CourseId): Promise<Enrollment | null> {
    const results = await this.db.query<{
      id: string;
      user_id: string;
      course_id: string;
      enrolled_at: string;
    }>('SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?', [userId, courseId]);

    if (results.length === 0) {
      return null;
    }

    const row = results[0];
    return {
      id: row.id as EnrollmentId,
      userId: row.user_id as UserId,
      courseId: row.course_id as CourseId,
      enrolledAt: new Date(row.enrolled_at),
    };
  }
}
