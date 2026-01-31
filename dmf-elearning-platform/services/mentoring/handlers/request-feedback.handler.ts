import { SubmissionId } from '@dmf/shared';
import { DomainEvent } from '@dmf/shared';
import { RequestFeedbackInput, RequestFeedbackOutput } from '@dmf/shared';
import { EventBus } from '../../shared/event-bus';

/**
 * RequestFeedbackHandler
 * Handler for requesting feedback on a submission command
 * Bộ xử lý lệnh yêu cầu phản hồi cho bài nộp
 */
export class RequestFeedbackHandler {
    constructor(private readonly eventBus: EventBus) {}

    /**
     * Execute request feedback command
     * Thực thi lệnh yêu cầu phản hồi
     */
    async execute(input: RequestFeedbackInput): Promise<RequestFeedbackOutput> {
        // TODO: Validate input against JSON schema
        // TODO: Kiểm tra dữ liệu đầu vào theo JSON schema
        // TODO: Check if submission exists
        // TODO: Kiểm tra bài nộp có tồn tại không
        // TODO: Create feedback request in database
        // TODO: Tạo yêu cầu phản hồi trong cơ sở dữ liệu
        // TODO: Queue for AI/teacher/mentor processing
        // TODO: Xếp hàng để xử lý bởi AI/giáo viên/mentor

        const requestId = 'generated-request-id'; // Placeholder
        const status: 'queued' | 'processing' = 'queued';
        const timestamp = new Date().toISOString();

        // Emit domain event / Phát domain event
        const event: DomainEvent<'mentoring.feedback.requested', { submissionId: SubmissionId }> = {
            event_name: 'mentoring.feedback.requested',
            timestamp,
            user_id: 'user-id-from-submission', // TODO: Load from submission
            payload: {
                submissionId: input.submissionId,
            },
        };

        await this.eventBus.emit(event);

        return {
            requestId,
            submissionId: input.submissionId,
            status,
        };
    }
}
