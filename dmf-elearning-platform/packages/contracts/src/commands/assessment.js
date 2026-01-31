/**
 * Assessment domain commands (Lệnh miền Đánh giá)
 *
 * From STEP 4.2 (command-contracts.md)
 * Frozen: Do not modify without architecture approval.
 */
import { z } from 'zod';
export const assessmentQuizStartSchema = z.object({
    userId: z.string().brand(),
    quizId: z.string().brand(),
    correlationId: z.string().optional(),
});
export const assessmentQuizSubmitSchema = z.object({
    assessmentId: z.string().brand(),
    answers: z.record(z.unknown()),
    correlationId: z.string().optional(),
});
export const assessmentPlacementTakeSchema = z.object({
    userId: z.string().brand(),
    correlationId: z.string().optional(),
});
//# sourceMappingURL=assessment.js.map