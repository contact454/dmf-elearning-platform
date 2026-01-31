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

export const systemUserRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  targetLanguage: z.string().brand<'LanguageCode'>().optional(),
  correlationId: z.string().optional(),
});

/**
 * Command: system.user.login
 * Handled by: onboarding-service
 */
export interface SystemUserLoginCommand {
  email: string;
  password: string;
  correlationId?: string;
}

export const systemUserLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  correlationId: z.string().optional(),
});

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

export const systemProfileModifySchema = z.object({
  userId: z.string().brand<'UserId'>(),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  targetLanguage: z.string().brand<'LanguageCode'>().optional(),
  correlationId: z.string().optional(),
});

/**
 * Command: system.srs.schedule
 * Handled by: curriculum-service (internal system command)
 * Note: This is an internal automated command, not exposed to clients.
 */
export interface SystemSrsScheduleCommand {
  userId: UserId;
  correlationId?: string;
}

export const systemSrsScheduleSchema = z.object({
  userId: z.string().brand<'UserId'>(),
  correlationId: z.string().optional(),
});
