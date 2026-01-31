/**
 * Curriculum Service Read-Only Client (Khách hàng Đọc Dịch vụ Chương trình)
 * Read-only lookups to curriculum-service
 */

import type { LessonId } from '@dmf/shared';

export interface Lesson {
  id: LessonId;
  title: string;
  unitId: string;
  courseId: string;
}

export class CurriculumClient {
  async getLessonById(_lessonId: LessonId): Promise<Lesson | null> {
    // TODO: HTTP call to curriculum-service
    return null;
  }
}

export const curriculumClient = new CurriculumClient();
