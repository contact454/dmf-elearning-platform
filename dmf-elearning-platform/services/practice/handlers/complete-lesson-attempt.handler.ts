import { AttemptId, AttemptStatus } from '@dmf/shared';
import { DomainEvent } from '@dmf/shared';
import { CompleteLessonAttemptInput, CompleteLessonAttemptOutput } from '@dmf/shared';
import { EventBus } from '../../shared/event-bus';

/**
 * CompleteLessonAttemptHandler
 * Handler for completing or abandoning a lesson attempt command
 * Bộ xử lý lệnh hoàn thành hoặc bỏ dở phiên học
 */
export class CompleteLessonAttemptHandler {
    constructor(private readonly eventBus: EventBus) {}

    /**
     * Execute complete lesson attempt command
     * Thực thi lệnh hoàn thành phiên học
     */
    async execute(input: CompleteLessonAttemptInput): Promise<CompleteLessonAttemptOutput> {
        // TODO: Validate input against JSON schema
        // TODO: Kiểm tra dữ liệu đầu vào theo JSON schema
        // TODO: Load attempt from database
        // TODO: Tải phiên học từ cơ sở dữ liệu
        // TODO: Update attempt status in database
        // TODO: Cập nhật trạng thái phiên học trong cơ sở dữ liệu

        const completedAt = new Date().toISOString();
        const status: AttemptStatus = input.status === 'completed' ? AttemptStatus.COMPLETED : AttemptStatus.ABANDONED;

        // Emit domain event based on status / Phát domain event dựa trên trạng thái
        if (input.status === 'completed') {
            const event: DomainEvent<'learning.lesson.completed', { lessonId: string; attemptId: AttemptId; status: AttemptStatus; score?: number }> = {
                event_name: 'learning.lesson.completed',
                timestamp: completedAt,
                user_id: 'user-id-from-attempt', // TODO: Load from attempt
                session_id: input.attemptId,
                payload: {
                    lessonId: 'lesson-id-from-attempt', // TODO: Load from attempt
                    attemptId: input.attemptId,
                    status: AttemptStatus.COMPLETED,
                    score: input.score,
                },
            };
            await this.eventBus.emit(event);
        } else {
            const event: DomainEvent<'learning.lesson.abandoned', { lessonId: string; attemptId: AttemptId }> = {
                event_name: 'learning.lesson.abandoned',
                timestamp: completedAt,
                user_id: 'user-id-from-attempt', // TODO: Load from attempt
                session_id: input.attemptId,
                payload: {
                    lessonId: 'lesson-id-from-attempt', // TODO: Load from attempt
                    attemptId: input.attemptId,
                },
            };
            await this.eventBus.emit(event);
        }

        return {
            attemptId: input.attemptId,
            status,
            score: input.score,
            completedAt,
        };
    }
}
