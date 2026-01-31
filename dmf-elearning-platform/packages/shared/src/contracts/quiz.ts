import { UserId, AssessmentId, AttemptId } from '../ids';
import { AssessmentStatus, CEFRLevel } from '../enums';

/**
 * StartQuizInput
 * Input DTO for starting a quiz/assessment attempt
 * DTO đầu vào để bắt đầu bài kiểm tra
 */
export interface StartQuizInput {
    userId: UserId; // User ID / ID người dùng
    assessmentId: AssessmentId; // Assessment ID / ID bài kiểm tra
}

/**
 * StartQuizOutput
 * Output DTO for quiz start
 * DTO đầu ra khi bắt đầu bài kiểm tra
 */
export interface StartQuizOutput {
    attemptId?: AttemptId; // Quiz attempt ID (if applicable) / ID phiên làm bài (nếu có)
    assessmentId: AssessmentId; // Assessment ID / ID bài kiểm tra
    status: AssessmentStatus; // Assessment status / Trạng thái bài kiểm tra
}

/**
 * SubmitQuizInput
 * Input DTO for submitting quiz answers
 * DTO đầu vào để nộp đáp án bài kiểm tra
 */
export interface SubmitQuizInput {
    assessmentId: AssessmentId; // Assessment ID / ID bài kiểm tra
    attemptId?: AttemptId; // Quiz attempt ID (if started via /start) / ID phiên làm bài (nếu đã bắt đầu)
    answers: unknown[]; // Quiz answers / Đáp án bài kiểm tra
}

/**
 * SubmitQuizOutput
 * Output DTO for quiz submission
 * DTO đầu ra khi nộp bài kiểm tra
 */
export interface SubmitQuizOutput {
    assessmentId: AssessmentId; // Assessment ID / ID bài kiểm tra
    score: number; // Quiz score 0-100 (required) / Điểm bài kiểm tra 0-100 (bắt buộc)
    levelHint?: CEFRLevel; // Inferred CEFR level (optional) / Mức CEFR suy luận (tùy chọn)
}
