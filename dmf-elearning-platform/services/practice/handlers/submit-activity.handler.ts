import { AttemptId, ActivityId, SubmissionId, LessonId } from '@dmf/shared';
import { DomainEvent, SubmissionType } from '@dmf/shared';
import { SubmitSpeakingInput, SubmitWritingInput } from '@dmf/shared';
import { EventBus } from '../../shared/event-bus';

/**
 * SubmitActivityOutput
 * Output from activity submission command
 * Đầu ra từ lệnh nộp bài hoạt động
 */
export interface SubmitActivityOutput {
    submissionId: SubmissionId;
    attemptId: AttemptId;
    activityId: ActivityId;
    isCorrect?: boolean;
}

/**
 * SubmitActivityHandler
 * Handler for submitting an activity answer command
 * Bộ xử lý lệnh nộp câu trả lời cho hoạt động
 */
export class SubmitActivityHandler {
    constructor(private readonly eventBus: EventBus) {}

    /**
     * Execute activity submission command (speaking or writing)
     * Thực thi lệnh nộp bài hoạt động (nói hoặc viết)
     */
    async execute(input: SubmitSpeakingInput | SubmitWritingInput): Promise<SubmitActivityOutput> {
        // TODO: Validate input against JSON schema
        // TODO: Kiểm tra dữ liệu đầu vào theo JSON schema
        // TODO: Determine submission type from input
        // TODO: Xác định loại bài nộp từ đầu vào
        // TODO: Create submission in database
        // TODO: Tạo bài nộp trong cơ sở dữ liệu
        // TODO: Evaluate correctness (call education/rubric if needed)
        // TODO: Đánh giá tính đúng đắn (gọi education/rubric nếu cần)

        const submissionId: SubmissionId = 'generated-submission-id'; // Placeholder
        const timestamp = new Date().toISOString();
        const type: SubmissionType = 'type' in input && input.type === 'speaking' ? SubmissionType.SPEAKING : SubmissionType.WRITING;

        // Load lessonId from attempt (TODO)
        // Tải lessonId từ attempt (TODO)
        const lessonId: LessonId = 'lesson-id-from-attempt'; // Placeholder

        // Emit domain event / Phát domain event
        const event: DomainEvent<'learning.submission.created', { submissionId: SubmissionId; attemptId: AttemptId; activityId: ActivityId; lessonId: LessonId; type: SubmissionType }> = {
            event_name: 'learning.submission.created',
            timestamp,
            user_id: 'user-id-from-attempt', // TODO: Load from attempt
            session_id: input.attemptId,
            payload: {
                submissionId,
                attemptId: input.attemptId,
                activityId: input.activityId,
                lessonId,
                type,
            },
        };

        await this.eventBus.emit(event);

        return {
            submissionId,
            attemptId: input.attemptId,
            activityId: input.activityId,
            // isCorrect would be determined by evaluation
            // isCorrect sẽ được xác định bởi đánh giá
        };
    }
}
