/**
 * System domain commands (Lệnh miền Hệ thống)
 *
 * From STEP 4.2 (command-contracts.md)
 * Frozen: Do not modify without architecture approval.
 */
import { z } from 'zod';
export const systemUserRegisterSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().max(100).optional(),
    lastName: z.string().max(100).optional(),
    targetLanguage: z.string().brand().optional(),
    correlationId: z.string().optional(),
});
export const systemUserLoginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
    correlationId: z.string().optional(),
});
export const systemProfileModifySchema = z.object({
    userId: z.string().brand(),
    firstName: z.string().max(100).optional(),
    lastName: z.string().max(100).optional(),
    targetLanguage: z.string().brand().optional(),
    correlationId: z.string().optional(),
});
export const systemSrsScheduleSchema = z.object({
    userId: z.string().brand(),
    correlationId: z.string().optional(),
});
//# sourceMappingURL=system.js.map