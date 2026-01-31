/**
 * Onboarding Service Read-Only Client (Khách hàng Đọc Dịch vụ Onboarding)
 * Read-only lookups to onboarding-service
 * NO direct DB access - use HTTP API or read replica
 */

import type { UserId } from '@dmf/shared';

export interface User {
  id: UserId;
  email: string; // Only for internal use, not exposed in events
  firstName: string;
  lastName: string;
  role: string;
}

/**
 * Read-only client to onboarding-service
 * For MVP skeleton: in-memory mock
 */
export class OnboardingClient {
  async getUserById(_userId: UserId): Promise<User | null> {
    // TODO: HTTP call to onboarding-service /api/internal/users/:userId
    // For MVP skeleton: return mock
    return null;
  }
}

export const onboardingClient = new OnboardingClient();
