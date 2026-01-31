import { UserId, AssessmentId, AttemptId, AssessmentStatus } from '@dmf/shared';
import { DomainEvent } from '@dmf/shared';
import { StartQuizInput, StartQuizOutput } from '@dmf/shared';
import { EventBus } from '../../shared/event-bus';

/**
 * StartQuizHandler
 * Handler for starting a quiz/assessment attempt command
 * Bộ xử lý lệnh bắt đầu bài kiểm tra
 */
export class StartQuizHandler {
    constructor(private readonly eventBus: EventBus) {}

    /**
     * Execute start quiz command
     * Thực thi lệnh bắt đầu bài kiểm tra
     */
    async execute(input: StartQuizInput): Promise<StartQuizOutput> {
        // TODO: Validate input against JSON schema
        // TODO: Kiểm tra dữ liệu đầu vào theo JSON schema
        // TODO: Check if assessment is available for user
        // TODO: Kiểm tra bài kiểm tra có sẵn cho người dùng không
        // TODO: Create assessment attempt in database
        // TODO: Tạo phiên làm bài trong cơ sở dữ liệu

        const attemptId: AttemptId | undefined = 'generated-attempt-id'; // Placeholder, optional
        const status: AssessmentStatus = AssessmentStatus.IN_PROGRESS;
        const timestamp = new Date().toISOString();

        // Emit domain event / Phát domain event
        const event: DomainEvent<'assessment.quiz.started', { assessmentId: AssessmentId; attemptId?: AttemptId }> = {
            event_name: 'assessment.quiz.started',
            timestamp,
            user_id: input.userId,
            session_id: attemptId,
            payload: {
                assessmentId: input.assessmentId,
                attemptId,
            },
        };

        await this.eventBus.emit(event);

        return {
            attemptId,
            assessmentId: input.assessmentId,
            status,
        };
    }
}
