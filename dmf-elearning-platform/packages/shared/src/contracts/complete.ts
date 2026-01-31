import { AttemptId } from '../ids';
import { AttemptStatus } from '../enums';

/**
 * CompleteLessonAttemptInput
 * Input DTO for completing or abandoning a lesson attempt
 * DTO đầu vào để hoàn thành hoặc bỏ dở phiên học
 */
export interface CompleteLessonAttemptInput {
    attemptId: AttemptId; // Attempt ID / ID phiên học
    status: 'completed' | 'abandoned'; // Completion status / Trạng thái hoàn thành
    score?: number; // Lesson score 0-100 (if completed) / Điểm bài học 0-100 (nếu hoàn thành)
}

/**
 * CompleteLessonAttemptOutput
 * Output DTO for lesson attempt completion
 * DTO đầu ra khi hoàn thành phiên học
 */
export interface CompleteLessonAttemptOutput {
    attemptId: AttemptId; // Attempt ID / ID phiên học
    status: AttemptStatus; // Attempt status / Trạng thái phiên học
    score?: number; // Lesson score 0-100 / Điểm bài học 0-100
    completedAt: string; // Completion timestamp (ISO 8601) / Thời điểm hoàn thành
}
