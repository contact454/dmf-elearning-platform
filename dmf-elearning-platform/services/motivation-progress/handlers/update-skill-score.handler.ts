import { UserId, SkillType } from '@dmf/shared';
import { UpdateSkillScoreInput, UpdateSkillScoreOutput } from '@dmf/shared';
import { EventBus } from '../../shared/event-bus';

/**
 * UpdateSkillScoreHandler
 * Handler for updating skill score command (internal, event-triggered)
 * Bộ xử lý lệnh cập nhật điểm kỹ năng (nội bộ, được kích hoạt bởi event)
 */
export class UpdateSkillScoreHandler {
    constructor(private readonly eventBus: EventBus) {}

    /**
     * Execute update skill score command
     * Thực thi lệnh cập nhật điểm kỹ năng
     * 
     * Note: This is an internal command, typically triggered by lesson.completed or quiz.submitted events.
     * Ghi chú: Đây là lệnh nội bộ, thường được kích hoạt bởi các event lesson.completed hoặc quiz.submitted.
     * No domain event is emitted (internal state update).
     * Không phát domain event (cập nhật trạng thái nội bộ).
     */
    async execute(input: UpdateSkillScoreInput): Promise<UpdateSkillScoreOutput> {
        // TODO: Validate input against JSON schema
        // TODO: Kiểm tra dữ liệu đầu vào theo JSON schema
        // TODO: Validate scoreVal is between 0.0 and 1.0
        // TODO: Kiểm tra scoreVal nằm trong khoảng 0.0 và 1.0
        // TODO: Update or create SkillScore in database
        // TODO: Cập nhật hoặc tạo SkillScore trong cơ sở dữ liệu

        const updatedAt = new Date().toISOString();

        // No domain event emitted - this is an internal state update
        // Không phát domain event - đây là cập nhật trạng thái nội bộ
        // Other services may react to skill score changes via other events (e.g., curriculum unlocks)
        // Các service khác có thể phản ứng với thay đổi điểm kỹ năng qua các event khác (ví dụ: mở khóa curriculum)

        return {
            userId: input.userId,
            skill: input.skill,
            scoreVal: input.scoreVal,
            updatedAt,
        };
    }
}
