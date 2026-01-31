import {
    UserId,
    LessonId,
    ActivityId,
    AttemptId,
    SubmissionId
} from '../ids';

/**
 * CreateAttemptInput
 * Input DTO for starting a lesson attempt
 * DTO đầu vào để bắt đầu phiên học bài
 */
export interface CreateAttemptInput {
    userId: UserId; // User ID / ID người dùng
    lessonId: LessonId; // Lesson ID / ID bài học
}

/**
 * SubmitActivityInput
 * Base input DTO for submitting an activity answer
 * DTO cơ sở để nộp câu trả lời cho hoạt động
 */
export interface SubmitActivityInput {
    attemptId: AttemptId; // Attempt ID / ID phiên học
    activityId: ActivityId; // Activity ID / ID hoạt động
    answer: unknown; // Answer payload / Dữ liệu câu trả lời
}

/**
 * SubmitSpeakingInput
 * Input DTO for submitting a speaking activity
 * DTO đầu vào để nộp bài nói
 */
export interface SubmitSpeakingInput extends SubmitActivityInput {
    audioUrl: string; // Audio file URL / URL file âm thanh
    durationMs: number; // Audio duration in milliseconds / Thời lượng âm thanh (mili giây)
}

/**
 * SubmitWritingInput
 * Input DTO for submitting a writing activity
 * DTO đầu vào để nộp bài viết
 */
export interface SubmitWritingInput extends SubmitActivityInput {
    text: string; // Written answer text / Văn bản câu trả lời
}

/**
 * RecordFeedbackInput
 * Input DTO for publishing feedback (AI/teacher/mentor)
 * DTO đầu vào để xuất bản phản hồi (AI/giáo viên/mentor)
 */
export interface RecordFeedbackInput {
    submissionId: SubmissionId; // Submission ID / ID bài nộp
    authorId: string; // Author ID (teacher/mentor) / ID tác giả (giáo viên/mentor)
    text: string; // Feedback text (Markdown) / Văn bản phản hồi (Markdown)
    corrections?: string[]; // List of corrections / Danh sách sửa lỗi
}

/**
 * UpdateProgressEvent
 * Event payload for progress updates (legacy, consider using domain events)
 * Payload sự kiện cập nhật tiến độ (cũ, nên dùng domain events)
 */
export interface UpdateProgressEvent {
    userId: UserId; // User ID / ID người dùng
    lessonId: LessonId; // Lesson ID / ID bài học
    score: number; // Lesson score / Điểm bài học
    status: 'passed' | 'failed'; // Pass/fail status / Trạng thái đạt/không đạt
    timestamp: string; // Event timestamp / Thời điểm sự kiện
}

// Export new command DTOs
export * from './enroll';
export * from './complete';
export * from './quiz';
export * from './feedback';
export * from './skill';
