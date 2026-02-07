import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UserStats,
  Achievement,
  UserAchievement,
  DailyChallenge,
  LeaderboardEntry,
  PointsUpdateRequest,
  AchievementUpdateRequest,
  StreakUpdateRequest,
  DailyChallengeUpdateRequest,
  LeaderboardGetParams,
} from '@/types/gamification';

// Points System
export function usePoints(userId: string) {
  return useQuery({
    queryKey: ['points', userId],
    queryFn: async () => {
      const res = await fetch(`/api/gamification/points?userId=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch points');
      const data = await res.json();
      return data.data as UserStats;
    },
    enabled: !!userId,
  });
}

export function useUpdatePoints() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PointsUpdateRequest) => {
      const res = await fetch('/api/gamification/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update points');
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['points', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}

// Achievements
export function useAchievements(userId: string) {
  return useQuery({
    queryKey: ['achievements', userId],
    queryFn: async () => {
      const res = await fetch(`/api/gamification/achievements?userId=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch achievements');
      const data = await res.json();
      return data.data as (Achievement & { progress: number; isUnlocked: boolean; unlockedAt: Date | null })[];
    },
    enabled: !!userId,
  });
}

export function useUpdateAchievement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AchievementUpdateRequest) => {
      const res = await fetch('/api/gamification/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update achievement');
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['achievements', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['points', variables.userId] });
    },
  });
}

export function useSeedAchievements() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/gamification/achievements', {
        method: 'PUT',
      });
      if (!res.ok) throw new Error('Failed to seed achievements');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
    },
  });
}

// Leaderboard
export function useLeaderboard(params: LeaderboardGetParams = {}) {
  const { period = 'allTime', limit = 100, userId } = params;

  return useQuery({
    queryKey: ['leaderboard', period, limit, userId],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        period,
        limit: limit.toString(),
        ...(userId && { userId }),
      });

      const res = await fetch(`/api/gamification/leaderboard?${queryParams}`);
      if (!res.ok) throw new Error('Failed to fetch leaderboard');
      const data = await res.json();
      return data.data as {
        entries: LeaderboardEntry[];
        userEntry: LeaderboardEntry | null;
        period: string;
        startDate: Date;
        endDate: Date;
      };
    },
  });
}

export function useUpdateLeaderboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      userId: string;
      username?: string;
      xp?: number;
      level?: number;
      streak?: number;
      period?: string;
    }) => {
      const res = await fetch('/api/gamification/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update leaderboard');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}

// Streak Tracking
export function useStreak(userId: string) {
  return useQuery({
    queryKey: ['streak', userId],
    queryFn: async () => {
      const res = await fetch(`/api/gamification/streak?userId=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch streak');
      const data = await res.json();
      return data.data as { streak: number; lastActiveAt?: Date; canCheckIn: boolean };
    },
    enabled: !!userId,
  });
}

export function useUpdateStreak() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: StreakUpdateRequest) => {
      const res = await fetch('/api/gamification/streak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update streak');
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['streak', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['points', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['achievements', variables.userId] });
    },
  });
}

// Daily Challenges
export function useDailyChallenges(userId: string) {
  return useQuery({
    queryKey: ['dailyChallenges', userId],
    queryFn: async () => {
      const res = await fetch(`/api/gamification/challenges?userId=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch daily challenges');
      const data = await res.json();
      return data.data as DailyChallenge[];
    },
    enabled: !!userId,
  });
}

export function useUpdateDailyChallenge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DailyChallengeUpdateRequest) => {
      const res = await fetch('/api/gamification/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update daily challenge');
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dailyChallenges', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['points', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['achievements', variables.userId] });
    },
  });
}

export function useCleanupExpiredChallenges() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/gamification/challenges?userId=${userId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to cleanup challenges');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyChallenges'] });
    },
  });
}
