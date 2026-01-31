import { SubmissionId } from '../ids';

/**
 * RequestFeedbackInput
 * Input DTO for requesting feedback on a submission
 * DTO đầu vào để yêu cầu phản hồi cho bài nộp
 */
export interface RequestFeedbackInput {
    submissionId: SubmissionId; // Submission ID / ID bài nộp
}

/**
 * RequestFeedbackOutput
 * Output DTO for feedback request
 * DTO đầu ra khi yêu cầu phản hồi
 */
export interface RequestFeedbackOutput {
    requestId: string; // Feedback request ID / ID yêu cầu phản hồi
    submissionId: SubmissionId; // Submission ID / ID bài nộp
    status: 'queued' | 'processing'; // Request status / Trạng thái yêu cầu
}
