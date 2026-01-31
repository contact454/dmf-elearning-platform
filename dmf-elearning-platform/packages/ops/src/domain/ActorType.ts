/**
 * Actor Type: Who performed an action
 * 
 * Phase 2 Track D: Admin Safety & Governance (Lightweight)
 * 
 * Defines the types of actors in the system.
 * This is a lightweight classification (not full RBAC).
 */

/**
 * Actor type enum
 */
export enum ActorType {
  /**
   * System actor
   * 
   * Automated system actions (e.g., scheduled jobs, event handlers, background processes)
   * No user associated.
   */
  SYSTEM = 'system',

  /**
   * Admin actor
   * 
   * Administrative users with elevated privileges.
   * Can perform dangerous operations (delete, override, replay).
   */
  ADMIN = 'admin',

  /**
   * Mentor actor
   * 
   * Mentors who can review evidence and provide feedback.
   * Limited privileges (cannot perform dangerous operations).
   */
  MENTOR = 'mentor',

  /**
   * Automation actor
   * 
   * Automated processes triggered by user actions or system events.
   * Similar to SYSTEM but may have user context (e.g., auto-approve based on rules).
   */
  AUTOMATION = 'automation',
}

/**
 * Check if actor type requires user ID
 * 
 * ADMIN and MENTOR require userId.
 * SYSTEM and AUTOMATION do not require userId.
 */
export function requiresUserId(actorType: ActorType): boolean {
  return actorType === ActorType.ADMIN || actorType === ActorType.MENTOR;
}

/**
 * Check if actor type can perform dangerous operations
 * 
 * Only ADMIN can perform dangerous operations (delete, override, replay).
 */
export function canPerformDangerousOperations(actorType: ActorType): boolean {
  return actorType === ActorType.ADMIN;
}