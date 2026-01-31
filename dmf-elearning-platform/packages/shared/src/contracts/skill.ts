import { UserId } from '../ids';
import { SkillType } from '../enums';

/**
 * UpdateSkillScoreInput
 * Input DTO for updating a user's skill score
 * DTO đầu vào để cập nhật điểm kỹ năng của người dùng
 */
export interface UpdateSkillScoreInput {
    userId: UserId; // User ID / ID người dùng
    skill: SkillType; // Skill type / Loại kỹ năng
    scoreVal: number; // Mastery score 0.0-1.0 (required) / Điểm thành thạo 0.0-1.0 (bắt buộc)
}

/**
 * UpdateSkillScoreOutput
 * Output DTO for skill score update
 * DTO đầu ra khi cập nhật điểm kỹ năng
 */
export interface UpdateSkillScoreOutput {
    userId: UserId; // User ID / ID người dùng
    skill: SkillType; // Skill type / Loại kỹ năng
    scoreVal: number; // Mastery score 0.0-1.0 / Điểm thành thạo 0.0-1.0
    updatedAt: string; // Update timestamp (ISO 8601) / Thời điểm cập nhật
}
