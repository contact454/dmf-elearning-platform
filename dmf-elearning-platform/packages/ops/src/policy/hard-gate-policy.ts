/**
 * Hard Gate Policy (Chính sách Hard Gate)
 * 
 * Policy for enabling/disabling hard gate enforcement at different scopes.
 */

import type { HardGateScope } from '@dmf/shared';

export type { HardGateScope };

export interface HardGatePolicy {
  scope: HardGateScope;
  scopeId?: string; // undefined for global
  enabled: boolean;
  updatedAt: string; // ISO 8601
  updatedBy: string;
  reason?: string;
}
