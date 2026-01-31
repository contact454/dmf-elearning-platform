/**
 * User Entity (Thực thể User)
 * Owned write state - onboarding-service only
 */

export type UserId = string & { __brand: 'UserId' };

export interface User {
  id: UserId;
  email: string;
  passwordHash: string; // Never exposed in events/logs
  firstName: string;
  lastName: string;
  role: 'learner' | 'teacher' | 'mentor' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}
