/**
 * System domain commands (Lệnh miền Hệ thống)
 *
 * From STEP 4.2 (command-contracts.md)
 * Frozen: Do not modify without architecture approval.
 */
import { z } from 'zod';
import type { UserId, LanguageCode } from '@dmf/shared';
/**
 * Command: system.user.register
 * Handled by: onboarding-service
 */
export interface SystemUserRegisterCommand {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    targetLanguage?: LanguageCode;
    correlationId?: string;
}
export declare const systemUserRegisterSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    targetLanguage: z.ZodOptional<z.ZodBranded<z.ZodString, "LanguageCode">>;
    correlationId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    correlationId?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    targetLanguage?: (string & z.BRAND<"LanguageCode">) | undefined;
}, {
    email: string;
    password: string;
    correlationId?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    targetLanguage?: string | undefined;
}>;
/**
 * Command: system.user.login
 * Handled by: onboarding-service
 */
export interface SystemUserLoginCommand {
    email: string;
    password: string;
    correlationId?: string;
}
export declare const systemUserLoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    correlationId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    correlationId?: string | undefined;
}, {
    email: string;
    password: string;
    correlationId?: string | undefined;
}>;
/**
 * Command: system.profile.modify
 * Handled by: onboarding-service
 */
export interface SystemProfileModifyCommand {
    userId: UserId;
    firstName?: string;
    lastName?: string;
    targetLanguage?: LanguageCode;
    correlationId?: string;
}
export declare const systemProfileModifySchema: z.ZodObject<{
    userId: z.ZodBranded<z.ZodString, "UserId">;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    targetLanguage: z.ZodOptional<z.ZodBranded<z.ZodString, "LanguageCode">>;
    correlationId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    userId: string & z.BRAND<"UserId">;
    correlationId?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    targetLanguage?: (string & z.BRAND<"LanguageCode">) | undefined;
}, {
    userId: string;
    correlationId?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    targetLanguage?: string | undefined;
}>;
/**
 * Command: system.srs.schedule
 * Handled by: curriculum-service (internal system command)
 * Note: This is an internal automated command, not exposed to clients.
 */
export interface SystemSrsScheduleCommand {
    userId: UserId;
    correlationId?: string;
}
export declare const systemSrsScheduleSchema: z.ZodObject<{
    userId: z.ZodBranded<z.ZodString, "UserId">;
    correlationId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    userId: string & z.BRAND<"UserId">;
    correlationId?: string | undefined;
}, {
    userId: string;
    correlationId?: string | undefined;
}>;
//# sourceMappingURL=system.d.ts.map