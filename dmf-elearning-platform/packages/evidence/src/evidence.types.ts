/**
 * EvidenceItem Types (Các Loại Bằng chứng)
 * 
 * Core concept: Mọi tiến độ học tập chỉ được công nhận khi có bằng chứng thật.
 * EvidenceItem là immutable, append-only, IDs-only.
 */

export type EvidenceType =
  | 'attendance'
  | 'speaking'
  | 'writing'
  | 'activity_submission'
  | 'teacher_validation'
  | 'mentor_validation';

export type EvidenceSource = 'system' | 'teacher' | 'mentor';

/**
 * EvidenceItem (Bằng chứng)
 * 
 * Immutable, append-only record of learning evidence.
 * Does NOT contain scores - only proof of existence.
 */
export interface EvidenceItem {
  evidenceId: string;
  type: EvidenceType;
  userId: string;
  lessonId?: string;
  courseId?: string;
  attemptId?: string;
  source: EvidenceSource;
  referenceIds: string[]; // fileId, videoId, submissionId, etc.
  createdAt: string; // ISO 8601
}

/**
 * Evidence Summary (Tóm tắt Bằng chứng)
 * 
 * Read model for evidence counts per user/lesson.
 */
export interface EvidenceSummary {
  userId: string;
  lessonId?: string;
  courseId?: string;
  evidenceCounts: {
    attendance: number;
    speaking: number;
    writing: number;
    activity_submission: number;
    teacher_validation: number;
    mentor_validation: number;
  };
  totalEvidence: number;
  lastEvidenceAt?: string;
}
