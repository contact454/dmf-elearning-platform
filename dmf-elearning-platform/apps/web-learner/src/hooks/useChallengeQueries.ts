import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface DailyChallenge {
  id: string;
  date: string;
  title: string;
  description: string;
  level: string;
  type: 'vocabulary' | 'reading' | 'listening' | 'speaking' | 'writing' | 'grammar' | 'mixed';
  questions: ChallengeQuestion[];
  timeLimit: number; // seconds
  maxPoints: number;
  expiresAt: string;
  status: 'available' | 'in_progress' | 'completed' | 'expired';
  userScore?: number;
  userRank?: number;
  completedAt?: string;
}

export interface ChallengeQuestion {
  id: string;
  type: 'multiple_choice' | 'fill_blank' | 'translation' | 'speaking' | 'listening';
  question: string;
  options?: string[];
  correctAnswer: string;
  points: number;
  explanation?: string;
  audioUrl?: string;
  imageUrl?: string;
}

export interface ChallengeHistory {
  id: string;
  date: string;
  challenge: DailyChallenge;
  score: number;
  maxScore: number;
  percentage: number;
  rank: number;
  totalParticipants: number;
  completedAt: string;
  timeSpent: number;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  totalCompleted: number;
  totalPoints: number;
  streakBroken: boolean;
  nextMilestone: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  score: number;
  timeSpent: number;
  completedAt: string;
  isCurrentUser?: boolean;
}

export interface ChallengeSubmission {
  challengeId: string;
  answers: {
    questionId: string;
    answer: string;
  }[];
  timeSpent: number;
}

export interface ChallengeResult {
  score: number;
  maxScore: number;
  percentage: number;
  correctAnswers: number;
  totalQuestions: number;
  rank: number;
  totalParticipants: number;
  streakUpdated: boolean;
  newStreak: number;
  pointsEarned: number;
  badges?: string[];
}

// ═══════════════════════════════════════════════════════════════
// API Functions
// ═══════════════════════════════════════════════════════════════

const API_BASE = process.env.NEXT_PUBLIC_LEARNING_SERVICE_URL || 'http://localhost:4001';

async function fetchDailyChallenge(): Promise<DailyChallenge> {
  const res = await fetch(`${API_BASE}/api/challenges/daily`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch daily challenge');
  return res.json();
}

async function fetchChallengeHistory(filters: {
  limit?: number;
  offset?: number;
}): Promise<ChallengeHistory[]> {
  const params = new URLSearchParams();
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.offset) params.append('offset', filters.offset.toString());

  const res = await fetch(`${API_BASE}/api/challenges/history?${params}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch challenge history');
  return res.json();
}

async function fetchStreakInfo(): Promise<StreakInfo> {
  const res = await fetch(`${API_BASE}/api/challenges/streak`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch streak info');
  return res.json();
}

async function fetchLeaderboard(filters: {
  limit?: number;
  date?: string;
}): Promise<LeaderboardEntry[]> {
  const params = new URLSearchParams();
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.date) params.append('date', filters.date);

  const res = await fetch(`${API_BASE}/api/challenges/leaderboard?${params}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch leaderboard');
  return res.json();
}

async function submitChallenge(submission: ChallengeSubmission): Promise<ChallengeResult> {
  const res = await fetch(`${API_BASE}/api/challenges/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(submission),
  });
  if (!res.ok) throw new Error('Failed to submit challenge');
  return res.json();
}

async function startChallenge(challengeId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/challenges/${challengeId}/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to start challenge');
}

// ═══════════════════════════════════════════════════════════════
// React Query Hooks
// ═══════════════════════════════════════════════════════════════

export function useDailyChallenge() {
  return useQuery({
    queryKey: ['daily-challenge'],
    queryFn: fetchDailyChallenge,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Auto-refresh every 5 min
  });
}

export function useChallengeHistory(filters: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['challenge-history', filters],
    queryFn: () => fetchChallengeHistory(filters),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useStreakInfo() {
  return useQuery({
    queryKey: ['streak-info'],
    queryFn: fetchStreakInfo,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useLeaderboard(filters: { limit?: number; date?: string }) {
  return useQuery({
    queryKey: ['leaderboard', filters],
    queryFn: () => fetchLeaderboard(filters),
    staleTime: 1000 * 30, // 30 seconds (more frequent updates)
    refetchInterval: 1000 * 60, // Auto-refresh every minute
  });
}

export function useSubmitChallenge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitChallenge,
    onSuccess: () => {
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['daily-challenge'] });
      queryClient.invalidateQueries({ queryKey: ['challenge-history'] });
      queryClient.invalidateQueries({ queryKey: ['streak-info'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}

export function useStartChallenge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: startChallenge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-challenge'] });
    },
  });
}
