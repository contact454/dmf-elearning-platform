import { UserId, LessonId, AttemptId, AttemptStatus } from '@dmf/shared';
import { DomainEvent } from '@dmf/shared';
import { CreateAttemptInput } from '@dmf/shared';
import { EventBus } from '../../shared/event-bus';

/**
 * StartLessonAttemptOutput
 * Output from start lesson attempt command
 * Đầu ra từ lệnh bắt đầu phiên học bài
 */
export interface StartLessonAttemptOutput {
    attemptId: AttemptId;
    lessonId: LessonId;
    status: AttemptStatus;
    startedAt: string; // ISO 8601
}

/**
 * StartLessonAttemptHandler
 * Handler for starting a lesson attempt command
 * Bộ xử lý lệnh bắt đầu phiên học bài
 */
export class StartLessonAttemptHandler {
    constructor(private readonly eventBus: EventBus) {}

    /**
     * Execute start lesson attempt command
     * Thực thi lệnh bắt đầu phiên học bài
     */
    async execute(input: CreateAttemptInput): Promise<StartLessonAttemptOutput> {
        // TODO: Validate input against JSON schema
        // TODO: Kiểm tra dữ liệu đầu vào theo JSON schema
        // TODO: Check if lesson is unlocked for user
        // TODO: Kiểm tra bài học đã được mở khóa cho người dùng chưa
        // TODO: Create attempt in database
        // TODO: Tạo phiên học trong cơ sở dữ liệu

        const attemptId: AttemptId = 'generated-attempt-id'; // Placeholder
        const startedAt = new Date().toISOString();
        const status: AttemptStatus = AttemptStatus.IN_PROGRESS;

        // Emit domain event / Phát domain event
        const event: DomainEvent<'learning.lesson.started', { lessonId: LessonId; attemptId: AttemptId }> = {
            event_name: 'learning.lesson.started',
            timestamp: startedAt,
            user_id: input.userId,
            session_id: attemptId, // Use attemptId as session correlation ID
            payload: {
                lessonId: input.lessonId,
                attemptId,
            },
        };

        await this.eventBus.emit(event);

        return {
            attemptId,
            lessonId: input.lessonId,
            status,
            startedAt,
        };
    }
}
