import { UserId, AssessmentId, CEFRLevel } from '@dmf/shared';
import { DomainEvent } from '@dmf/shared';
import { EventBus } from '../../shared/event-bus';
import inputSchema from '../../../contracts/commands/onboarding/submitPlacementTest.input.schema.json' assert { type: 'json' };
import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true, strict: false });
const validateInput = ajv.compile(inputSchema);

/**
 * SubmitPlacementTestInput
 * Input for placement test submission command
 * Đầu vào cho lệnh nộp bài kiểm tra định vị
 */
export interface SubmitPlacementTestInput {
    userId: UserId;
    answers: unknown[]; // Placement test answers / Đáp án bài kiểm tra định vị
}

/**
 * SubmitPlacementTestOutput
 * Output from placement test submission
 * Đầu ra từ lệnh nộp bài kiểm tra định vị
 */
export interface SubmitPlacementTestOutput {
    assessmentId: AssessmentId;
    level: CEFRLevel; // Recommended CEFR level / Mức CEFR được đề xuất
    nextAction: 'enroll' | 'retake';
}

/**
 * SubmitPlacementTestHandler
 * Handler for placement test submission command
 * Bộ xử lý lệnh nộp bài kiểm tra định vị
 */
export class SubmitPlacementTestHandler {
    constructor(private readonly eventBus: EventBus) {}

    /**
     * Execute placement test submission command
     * Thực thi lệnh nộp bài kiểm tra định vị
     */
    async execute(input: SubmitPlacementTestInput): Promise<SubmitPlacementTestOutput> {
        const valid = validateInput(input);
        if (!valid) {
            throw new Error('Invalid input: ' + ajv.errorsText(validateInput.errors));
        }
        // TODO: Delegate to assessment-service for grading
        // TODO: Ủy quyền cho assessment-service để chấm điểm
        // TODO: Call education/readiness-model to determine level
        // TODO: Gọi education/readiness-model để xác định mức

        const assessmentId: AssessmentId = 'generated-assessment-id'; // Placeholder
        const level: CEFRLevel = CEFRLevel.B1; // Placeholder - should be calculated
        const timestamp = new Date().toISOString();

        // Emit domain event / Phát domain event
        const event: DomainEvent<'assessment.level_test.completed', { assessmentId: AssessmentId; attemptId?: string; finalGrade?: number }> = {
            event_name: 'assessment.level_test.completed',
            timestamp,
            user_id: input.userId,
            payload: {
                assessmentId,
                // attemptId and finalGrade would come from assessment-service
                // attemptId và finalGrade sẽ đến từ assessment-service
            },
        };

        await this.eventBus.emit(event, { idempotencyKey: attemptId, correlationId: attemptId });

        return {
            assessmentId,
            level,
            nextAction: 'enroll',
        };
    }
}
