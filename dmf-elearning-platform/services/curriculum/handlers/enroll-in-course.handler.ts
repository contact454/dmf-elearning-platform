import { UserId, CourseId, EnrollmentId, EnrollmentStatus } from '@dmf/shared';
import { DomainEvent } from '@dmf/shared';
import { EnrollInCourseInput, EnrollInCourseOutput } from '@dmf/shared';
import { EventBus } from '../../shared/event-bus';

/**
 * EnrollInCourseHandler
 * Handler for course enrollment command
 * Bộ xử lý lệnh ghi danh khóa học
 */
export class EnrollInCourseHandler {
    constructor(private readonly eventBus: EventBus) {}

    /**
     * Execute course enrollment command
     * Thực thi lệnh ghi danh khóa học
     */
    async execute(input: EnrollInCourseInput): Promise<EnrollInCourseOutput> {
        // TODO: Validate input against JSON schema
        // TODO: Kiểm tra dữ liệu đầu vào theo JSON schema
        // TODO: Check if user already enrolled
        // TODO: Kiểm tra người dùng đã ghi danh chưa
        // TODO: Create enrollment in database
        // TODO: Tạo ghi danh trong cơ sở dữ liệu

        const enrollmentId: EnrollmentId = 'generated-enrollment-id'; // Placeholder
        const status: EnrollmentStatus = EnrollmentStatus.ACTIVE;
        const timestamp = new Date().toISOString();

        // Emit domain event / Phát domain event
        const event: DomainEvent<'curriculum.course.enrolled', { enrollmentId: EnrollmentId; courseId: CourseId }> = {
            event_name: 'curriculum.course.enrolled',
            timestamp,
            user_id: input.userId,
            payload: {
                enrollmentId,
                courseId: input.courseId,
            },
        };

        await this.eventBus.emit(event);

        return {
            enrollmentId,
            courseId: input.courseId,
            status,
            nextAction: 'start_lesson',
        };
    }
}
