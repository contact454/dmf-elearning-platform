import { UserId, LessonId, SkillType } from '@dmf/shared';

/**
 * MasteryState Interface
 * Aligned with contracts/schemas/mastery.schema.json
 */
export interface SkillScore {
    skill: SkillType;
    scoreVal: number; // 0.0 to 1.0
    lastUpdatedAt: string; // ISO 8601
}

export interface SkillBreakdownItem {
    skill: SkillType;
    scoreVal: number;
}

export interface LessonMastery {
    lessonId: LessonId;
    overallScore: number; // 0.0 to 1.0
    skillBreakdown: SkillBreakdownItem[];
    evidenceCount: number; // Internal tracking for rules, not strict schema requirement but useful
    lastUpdatedAt: string;
}

export interface MasteryState {
    userId: UserId;
    skillScores: SkillScore[];
    lessonMastery: LessonMastery[];
    unitMastery: any[]; // Placeholder for MVP
    lastCalculatedAt: string;
    version: number;
}

/**
 * InMemoryMasteryStore
 * Simple in-memory storage for MasteryState.
 * Not persistent across restarts.
 */
export class InMemoryMasteryStore {
    private store = new Map<UserId, MasteryState>();

    async get(userId: UserId): Promise<MasteryState | null> {
        return this.store.get(userId) || null;
    }

    async save(userId: UserId, state: MasteryState): Promise<void> {
        // Simple optimistic locking check could go here
        this.store.set(userId, state);
    }

    // Helper to initialize state if not exists
    async getOrInit(userId: UserId): Promise<MasteryState> {
        const existing = await this.get(userId);
        if (existing) return existing;

        return {
            userId,
            skillScores: [],
            lessonMastery: [],
            unitMastery: [],
            lastCalculatedAt: new Date().toISOString(),
            version: 1
        };
    }
}
