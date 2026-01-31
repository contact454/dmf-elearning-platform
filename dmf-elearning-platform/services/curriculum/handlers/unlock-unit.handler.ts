import { UserId, UnitId, CourseId } from '@dmf/shared';
import { DomainEvent } from '@dmf/shared';
import { EventBus } from '../../shared/event-bus';

/**
 * UnlockUnitInput
 * Input for unit unlock command (internal, event-triggered)
 * Đầu vào cho lệnh mở khóa đơn vị (nội bộ, được kích hoạt bởi event)
 */
export interface UnlockUnitInput {
    userId: UserId;
    unitId: UnitId;
    courseId: CourseId;
    reason: 'mastery' | 'assessment' | 'manual' | 'srs';
}

/**
 * UnlockUnitOutput
 * Output from unit unlock command
 * Đầu ra từ lệnh mở khóa đơn vị
 */
export interface UnlockUnitOutput {
    unitId: UnitId;
    unlockedAt: string; // ISO 8601
}

/**
 * UnlockUnitHandler
 * Handler for unit unlock command (internal)
 * Bộ xử lý lệnh mở khóa đơn vị (nội bộ)
 */
export class UnlockUnitHandler {
    constructor(private readonly eventBus: EventBus) {}

    /**
     * Execute unit unlock command
     * Thực thi lệnh mở khóa đơn vị
     */
    async execute(input: UnlockUnitInput): Promise<UnlockUnitOutput> {
        // TODO: Validate input against JSON schema
        // TODO: Kiểm tra dữ liệu đầu vào theo JSON schema
        // TODO: Check if unit is already unlocked
        // TODO: Kiểm tra đơn vị đã được mở khóa chưa
        // TODO: Update progress state in database
        // TODO: Cập nhật trạng thái tiến độ trong cơ sở dữ liệu

        const unlockedAt = new Date().toISOString();
        const timestamp = unlockedAt;

        // Emit domain event / Phát domain event
        const event: DomainEvent<'curriculum.unit.unlocked', { unitId: UnitId; courseId: CourseId; reason: string }> = {
            event_name: 'curriculum.unit.unlocked',
            timestamp,
            user_id: input.userId,
            payload: {
                unitId: input.unitId,
                courseId: input.courseId,
                reason: input.reason,
            },
        };

        await this.eventBus.emit(event);

        return {
            unitId: input.unitId,
            unlockedAt,
        };
    }
}
