/**
 * Assessment domain commands (Lệnh miền Đánh giá)
 *
 * From STEP 4.2 (command-contracts.md)
 * Frozen: Do not modify without architecture approval.
 */
import { z } from 'zod';
import type { UserId, AssessmentId, QuizId } from '@dmf/shared';
/**
 * Command: assessment.quiz.start
 * Handled by: assessment-service
 */
export interface AssessmentQuizStartCommand {
    userId: UserId;
    quizId: QuizId;
    correlationId?: string;
}
export declare const assessmentQuizStartSchema: z.ZodObject<{
    userId: z.ZodBranded<z.ZodString, "UserId">;
    quizId: z.ZodBranded<z.ZodString, "QuizId">;
    correlationId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    userId: string & z.BRAND<"UserId">;
    quizId: string & z.BRAND<"QuizId">;
    correlationId?: string | undefined;
}, {
    userId: string;
    quizId: string;
    correlationId?: string | undefined;
}>;
/**
 * Command: assessment.quiz.submit
 * Handled by: assessment-service
 */
export interface AssessmentQuizSubmitCommand {
    assessmentId: AssessmentId;
    answers: Record<string, unknown>;
    correlationId?: string;
}
export declare const assessmentQuizSubmitSchema: z.ZodObject<{
    assessmentId: z.ZodBranded<z.ZodString, "AssessmentId">;
    answers: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    correlationId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    assessmentId: string & z.BRAND<"AssessmentId">;
    answers: Record<string, unknown>;
    correlationId?: string | undefined;
}, {
    assessmentId: string;
    answers: Record<string, unknown>;
    correlationId?: string | undefined;
}>;
/**
 * Command: assessment.placement.take
 * Handled by: assessment-service
 */
export interface AssessmentPlacementTakeCommand {
    userId: UserId;
    correlationId?: string;
}
export declare const assessmentPlacementTakeSchema: z.ZodObject<{
    userId: z.ZodBranded<z.ZodString, "UserId">;
    correlationId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    userId: string & z.BRAND<"UserId">;
    correlationId?: string | undefined;
}, {
    userId: string;
    correlationId?: string | undefined;
}>;
//# sourceMappingURL=assessment.d.ts.map