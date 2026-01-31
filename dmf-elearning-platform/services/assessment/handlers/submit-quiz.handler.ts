import { AssessmentId, AttemptId, CEFRLevel } from '@dmf/shared';
import { DomainEvent } from '@dmf/shared';
import { SubmitQuizInput, SubmitQuizOutput } from '@dmf/shared';
import { EventBus } from '../../shared/event-bus';

/**
 * SubmitQuizHandler
 * Handler for submitting quiz answers command
 * Bộ xử lý lệnh nộp đáp án bài kiểm tra
 */
export class SubmitQuizHandler {
    constructor(private readonly eventBus: EventBus) {}

    /**
     * Execute submit quiz command
     * Thực thi lệnh nộp bài kiểm tra
     */
    async execute(input: SubmitQuizInput): Promise<SubmitQuizOutput> {
        // TODO: Validate input against JSON schema
        // TODO: Kiểm tra dữ liệu đầu vào theo JSON schema
        // TODO: Grade quiz answers (call education/rubric)
        // TODO: Chấm điểm đáp án (gọi education/rubric)
        // TODO: Calculate score 0-100
        // TODO: Tính điểm 0-100
        // TODO: Infer CEFR level if applicable (call education/readiness-model)
        // TODO: Suy luận mức CEFR nếu có thể (gọi education/readiness-model)
        // TODO: Update assessment in database
        // TODO: Cập nhật bài kiểm tra trong cơ sở dữ liệu

        const score = 75; // Placeholder - should be calculated
        const levelHint: CEFRLevel | undefined = CEFRLevel.B1; // Placeholder - should be inferred
        const timestamp = new Date().toISOString();

        // Emit domain event / Phát domain event
        const event: DomainEvent<'assessment.quiz.submitted', { assessmentId: AssessmentId; attemptId?: AttemptId; score: number; levelHint?: CEFRLevel }> = {
            event_name: 'assessment.quiz.submitted',
            timestamp,
            user_id: 'user-id-from-assessment', // TODO: Load from assessment
            session_id: input.attemptId,
            payload: {
                assessmentId: input.assessmentId,
                attemptId: input.attemptId,
                score, // Required for anti "học ảo" measurement
                levelHint,
            },
        };

        await this.eventBus.emit(event);

        return {
            assessmentId: input.assessmentId,
            score,
            levelHint,
        };
    }
}
