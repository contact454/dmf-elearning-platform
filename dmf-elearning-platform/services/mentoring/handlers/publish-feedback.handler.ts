import { SubmissionId, FeedbackId, AttemptId, FeedbackAuthor } from '@dmf/shared';
import { DomainEvent } from '@dmf/shared';
import { RecordFeedbackInput } from '@dmf/shared';
import { EventBus } from '../../shared/event-bus';

/**
 * PublishFeedbackOutput
 * Output from publish feedback command
 * Đầu ra từ lệnh xuất bản phản hồi
 */
export interface PublishFeedbackOutput {
    feedbackId: FeedbackId;
    submissionId: SubmissionId;
    publishedAt: string; // ISO 8601
}

/**
 * PublishFeedbackHandler
 * Handler for publishing feedback command
 * Bộ xử lý lệnh xuất bản phản hồi
 */
export class PublishFeedbackHandler {
    constructor(private readonly eventBus: EventBus) {}

    /**
     * Execute publish feedback command
     * Thực thi lệnh xuất bản phản hồi
     * 
     * Note: author and targetAttemptId should be determined from context or input.
     * Ghi chú: author và targetAttemptId nên được xác định từ ngữ cảnh hoặc đầu vào.
     */
    async execute(
        input: RecordFeedbackInput,
        author: FeedbackAuthor, // From context (AI/teacher/mentor) / Từ ngữ cảnh
        targetAttemptId?: AttemptId
    ): Promise<PublishFeedbackOutput> {
        // TODO: Validate input against JSON schema
        // TODO: Kiểm tra dữ liệu đầu vào theo JSON schema
        // TODO: Create feedback in database
        // TODO: Tạo phản hồi trong cơ sở dữ liệu

        const feedbackId: FeedbackId = 'generated-feedback-id'; // Placeholder
        const publishedAt = new Date().toISOString();
        const timestamp = publishedAt;

        // Emit domain event / Phát domain event
        const event: DomainEvent<'mentoring.feedback.published', { feedbackId: FeedbackId; submissionId: SubmissionId; author: FeedbackAuthor; targetAttemptId?: AttemptId }> = {
            event_name: 'mentoring.feedback.published',
            timestamp,
            user_id: input.authorId, // Author ID (teacher/mentor) or system for AI
            payload: {
                feedbackId,
                submissionId: input.submissionId,
                author, // Required for anti "học ảo" measurement
                targetAttemptId,
            },
        };

        await this.eventBus.emit(event);

        return {
            feedbackId,
            submissionId: input.submissionId,
            publishedAt,
        };
    }
}
