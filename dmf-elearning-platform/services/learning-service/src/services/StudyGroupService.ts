/**
 * Study Groups Service — Sprint 5 Fix 4.6
 * Social learning: groups, invites, shared challenges, group leaderboard
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── TYPES ───

export interface StudyGroup {
    id: string;
    name: string;
    description: string;
    inviteCode: string;
    ownerId: string;
    maxMembers: number;
    level: string; // Target CEFR level
    createdAt: Date;
}

export interface GroupMember {
    userId: string;
    userName: string;
    role: 'owner' | 'member';
    joinedAt: Date;
    weeklyXP: number;
}

export interface GroupChallenge {
    id: string;
    groupId: string;
    title: string;
    description: string;
    targetType: 'vocab_reviews' | 'reading_minutes' | 'streak_days' | 'total_xp';
    targetValue: number;
    currentValue: number;
    deadline: Date;
    completed: boolean;
}

// In-memory store (production: use DB tables)
const groups = new Map<string, StudyGroup>();
const members = new Map<string, GroupMember[]>();     // groupId → members
const userGroups = new Map<string, string[]>();        // userId → groupIds
const challenges = new Map<string, GroupChallenge[]>(); // groupId → challenges

function generateInviteCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateId(): string {
    return `grp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

// ─── GROUP CRUD ───

/**
 * Create a new study group
 */
export function createGroup(ownerId: string, name: string, description: string, level = 'A1'): StudyGroup {
    const group: StudyGroup = {
        id: generateId(),
        name,
        description,
        inviteCode: generateInviteCode(),
        ownerId,
        maxMembers: 10,
        level,
        createdAt: new Date(),
    };

    groups.set(group.id, group);
    members.set(group.id, [{ userId: ownerId, userName: 'Owner', role: 'owner', joinedAt: new Date(), weeklyXP: 0 }]);

    const existing = userGroups.get(ownerId) || [];
    existing.push(group.id);
    userGroups.set(ownerId, existing);

    return group;
}

/**
 * Join group by invite code
 */
export function joinGroup(userId: string, inviteCode: string): { success: boolean; group?: StudyGroup; error?: string } {
    const group = Array.from(groups.values()).find(g => g.inviteCode === inviteCode);
    if (!group) return { success: false, error: 'Invite code not found' };

    const groupMembers = members.get(group.id) || [];
    if (groupMembers.length >= group.maxMembers) return { success: false, error: 'Group is full' };
    if (groupMembers.find(m => m.userId === userId)) return { success: false, error: 'Already a member' };

    groupMembers.push({ userId, userName: 'Member', role: 'member', joinedAt: new Date(), weeklyXP: 0 });
    members.set(group.id, groupMembers);

    const existing = userGroups.get(userId) || [];
    existing.push(group.id);
    userGroups.set(userId, existing);

    return { success: true, group };
}

/**
 * Leave a group
 */
export function leaveGroup(userId: string, groupId: string): boolean {
    const groupMembers = members.get(groupId);
    if (!groupMembers) return false;

    const idx = groupMembers.findIndex(m => m.userId === userId);
    if (idx === -1) return false;

    groupMembers.splice(idx, 1);
    members.set(groupId, groupMembers);

    const uGroups = userGroups.get(userId) || [];
    userGroups.set(userId, uGroups.filter(id => id !== groupId));

    return true;
}

/**
 * Get user's groups
 */
export function getUserGroups(userId: string): StudyGroup[] {
    const groupIds = userGroups.get(userId) || [];
    return groupIds.map(id => groups.get(id)!).filter(Boolean);
}

/**
 * Get group details with members
 */
export function getGroupDetails(groupId: string) {
    const group = groups.get(groupId);
    if (!group) return null;

    return {
        ...group,
        members: members.get(groupId) || [],
        challenges: challenges.get(groupId) || [],
        memberCount: (members.get(groupId) || []).length,
    };
}

// ─── GROUP CHALLENGES ───

/**
 * Create a group challenge
 */
export function createChallenge(
    groupId: string,
    title: string,
    description: string,
    targetType: GroupChallenge['targetType'],
    targetValue: number,
    deadlineDays = 7
): GroupChallenge {
    const challenge: GroupChallenge = {
        id: `ch_${Date.now()}`,
        groupId,
        title,
        description,
        targetType,
        targetValue,
        currentValue: 0,
        deadline: new Date(Date.now() + deadlineDays * 24 * 60 * 60 * 1000),
        completed: false,
    };

    const existing = challenges.get(groupId) || [];
    existing.push(challenge);
    challenges.set(groupId, existing);

    return challenge;
}

/**
 * Update challenge progress
 */
export function updateChallengeProgress(groupId: string, challengeId: string, increment: number): GroupChallenge | null {
    const groupChallenges = challenges.get(groupId);
    if (!groupChallenges) return null;

    const challenge = groupChallenges.find(c => c.id === challengeId);
    if (!challenge || challenge.completed) return null;

    challenge.currentValue += increment;
    if (challenge.currentValue >= challenge.targetValue) {
        challenge.completed = true;
    }

    return challenge;
}

// ─── GROUP LEADERBOARD ───

/**
 * Get group leaderboard (members ranked by weekly XP)
 */
export function getGroupLeaderboard(groupId: string): GroupMember[] {
    const groupMembers = members.get(groupId) || [];
    return [...groupMembers].sort((a, b) => b.weeklyXP - a.weeklyXP);
}

/**
 * Update member XP in group
 */
export function updateMemberXP(userId: string, xpEarned: number): void {
    const groupIds = userGroups.get(userId) || [];
    for (const gId of groupIds) {
        const groupMembers = members.get(gId);
        if (groupMembers) {
            const member = groupMembers.find(m => m.userId === userId);
            if (member) member.weeklyXP += xpEarned;
        }
    }
}
