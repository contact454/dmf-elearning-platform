import { UserId, CourseId, EnrollmentId } from '../ids';
import { EnrollmentStatus } from '../enums';

/**
 * EnrollInCourseInput
 * Input DTO for enrolling a user in a course
 * DTO đầu vào để ghi danh người dùng vào khóa học
 */
export interface EnrollInCourseInput {
    userId: UserId; // User ID / ID người dùng
    courseId: CourseId; // Course ID / ID khóa học
}

/**
 * EnrollInCourseOutput
 * Output DTO for course enrollment
 * DTO đầu ra khi ghi danh khóa học
 */
export interface EnrollInCourseOutput {
    enrollmentId: EnrollmentId; // Enrollment ID / ID ghi danh
    courseId: CourseId; // Course ID / ID khóa học
    status: EnrollmentStatus; // Enrollment status / Trạng thái ghi danh
    nextAction?: 'start_lesson' | 'take_placement'; // Suggested next action / Gợi ý hành động tiếp theo
}
