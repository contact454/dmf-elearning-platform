'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  // Vocabulary
  getLevels,
  getTopics,
  getVocabulary,
  getDbVocabulary,
  getRandomVocabulary,
  getVocabularyStats,
  VocabularyFilters,
  // SRS
  getUserProgress,
  getVocabularyWithProgress,
  SRSRating,
  // Reading
  getReadingContent,
  getRecommendedReading,
  getFeaturedReading,
  getReadingById,
  startReading,
  updateReadingProgress,
  completeReading,
  getUserReadingHistory,
  getUserReadingStats,
  getReadingStats,
  ReadingFilters,
  // Listening
  getListeningContent,
  getFeaturedListening,
  getListeningById,
  getListeningExercises,
  submitDictationAttempt,
  startListening,
  updateListeningProgress,
  getUserListeningHistory,
  getUserListeningStats,
  getListeningStats,
  ListeningFilters,
  DictationMistake,
  // Speaking
  getSpeakingPrompts,
  getFeaturedSpeaking,
  getSpeakingById,
  submitSpeakingAttempt,
  getSpeakingAttempts,
  getUserSpeakingHistory,
  getUserSpeakingStats,
  getSpeakingStats,
  SpeakingFilters,
  // Writing
  getWritingPrompts,
  getFeaturedWriting,
  getWritingById,
  submitWriting,
  getWritingSubmissions,
  saveWritingDraft,
  getWritingDraft,
  getUserWritingHistory,
  getUserWritingStats,
  getWritingStats,
  WritingFilters,
  // Hub
  getHubData,
  getSkillProgress,
  getDailyGoals,
  getRecommendation,
  // Leaderboard
  getLeaderboard,
  getUserRankings,
  getLeaderboardStats,
  LeaderboardFilters,
  LeaderboardTimeframe,
} from '@/services/german-api';
import { useUser } from '@/providers/user-provider';

// ═══════════════════════════════════════════════════════════════
// Query Keys Factory
// ═══════════════════════════════════════════════════════════════

export const queryKeys = {
  // Vocabulary
  vocabulary: {
    all: ['vocabulary'] as const,
    levels: () => [...queryKeys.vocabulary.all, 'levels'] as const,
    topics: (level: string) => [...queryKeys.vocabulary.all, 'topics', level] as const,
    list: (filters: VocabularyFilters) => [...queryKeys.vocabulary.all, 'list', filters] as const,
    random: (count: number, level?: string) => [...queryKeys.vocabulary.all, 'random', count, level] as const,
    stats: () => [...queryKeys.vocabulary.all, 'stats'] as const,
    byWord: (word: string) => [...queryKeys.vocabulary.all, 'word', word] as const,
  },
  // SRS
  srs: {
    all: ['srs'] as const,
    due: (userId: string, level?: string) => [...queryKeys.srs.all, 'due', userId, level] as const,
    progress: (userId: string) => [...queryKeys.srs.all, 'progress', userId] as const,
    withProgress: (userId: string, filters: VocabularyFilters) =>
      [...queryKeys.srs.all, 'withProgress', userId, filters] as const,
  },
  // Reading
  reading: {
    all: ['reading'] as const,
    list: (filters: ReadingFilters) => [...queryKeys.reading.all, 'list', filters] as const,
    recommended: (userId: string) => [...queryKeys.reading.all, 'recommended', userId] as const,
    featured: () => [...queryKeys.reading.all, 'featured'] as const,
    detail: (id: string, userId?: string) => [...queryKeys.reading.all, 'detail', id, userId] as const,
    history: (userId: string, status?: string) => [...queryKeys.reading.all, 'history', userId, status] as const,
    stats: (userId: string) => [...queryKeys.reading.all, 'stats', userId] as const,
  },
  // Listening
  listening: {
    all: ['listening'] as const,
    list: (filters: ListeningFilters) => [...queryKeys.listening.all, 'list', filters] as const,
    featured: () => [...queryKeys.listening.all, 'featured'] as const,
    detail: (id: string) => [...queryKeys.listening.all, 'detail', id] as const,
    exercises: (contentId: string) => [...queryKeys.listening.all, 'exercises', contentId] as const,
    history: (userId: string) => [...queryKeys.listening.all, 'history', userId] as const,
    stats: (userId: string) => [...queryKeys.listening.all, 'stats', userId] as const,
  },
  // Speaking
  speaking: {
    all: ['speaking'] as const,
    list: (filters: SpeakingFilters) => [...queryKeys.speaking.all, 'list', filters] as const,
    featured: () => [...queryKeys.speaking.all, 'featured'] as const,
    detail: (id: string) => [...queryKeys.speaking.all, 'detail', id] as const,
    attempts: (promptId: string, userId: string) => [...queryKeys.speaking.all, 'attempts', promptId, userId] as const,
    history: (userId: string) => [...queryKeys.speaking.all, 'history', userId] as const,
    stats: (userId: string) => [...queryKeys.speaking.all, 'stats', userId] as const,
  },
  // Writing
  writing: {
    all: ['writing'] as const,
    list: (filters: WritingFilters) => [...queryKeys.writing.all, 'list', filters] as const,
    featured: () => [...queryKeys.writing.all, 'featured'] as const,
    detail: (id: string) => [...queryKeys.writing.all, 'detail', id] as const,
    submissions: (promptId: string, userId: string) => [...queryKeys.writing.all, 'submissions', promptId, userId] as const,
    draft: (promptId: string, userId: string) => [...queryKeys.writing.all, 'draft', promptId, userId] as const,
    history: (userId: string) => [...queryKeys.writing.all, 'history', userId] as const,
    stats: (userId: string) => [...queryKeys.writing.all, 'stats', userId] as const,
  },
  // Hub
  hub: {
    all: ['hub'] as const,
    data: (userId: string) => [...queryKeys.hub.all, 'data', userId] as const,
    skills: (userId: string) => [...queryKeys.hub.all, 'skills', userId] as const,
    dailyGoals: (userId: string) => [...queryKeys.hub.all, 'dailyGoals', userId] as const,
    recommendation: (userId: string) => [...queryKeys.hub.all, 'recommendation', userId] as const,
  },
  // Leaderboard
  leaderboard: {
    all: ['leaderboard'] as const,
    list: (userId: string, filters: LeaderboardFilters) => 
      [...queryKeys.leaderboard.all, 'list', userId, filters] as const,
    rankings: (userId: string) => 
      [...queryKeys.leaderboard.all, 'rankings', userId] as const,
    stats: (timeframe: LeaderboardTimeframe) => 
      [...queryKeys.leaderboard.all, 'stats', timeframe] as const,
  },
};

type ReviewQueueApiItem = {
  id: string;
  status: 'NEW' | 'LEARNING' | 'REVIEW' | 'MASTERED';
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  nextReview: string;
  word: {
    id: string;
    word: string;
    meaning_vi: string;
    level: string;
    topic?: string | null;
    example_de?: string | null;
    example_vi?: string | null;
    pos?: string | null;
    artikel?: string | null;
    plural?: string | null;
    gender?: string | null;
    audioUrl?: string | null;
    phoneticIpa?: string | null;
    familyWords?: string[];
    grammarTags?: string[];
    source?: string | null;
    addedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
};

type ReviewQueueResponse = {
  success?: boolean;
  data?: {
    words?: ReviewQueueApiItem[];
  };
};

function mapSrsRatingToQuality(rating: SRSRating): 1 | 3 | 4 | 5 {
  const qualityMap: Record<SRSRating, 1 | 3 | 4 | 5> = {
    0: 1,
    1: 3,
    2: 4,
    3: 5,
  };
  return qualityMap[rating];
}

// ═══════════════════════════════════════════════════════════════
// Vocabulary Hooks
// ═══════════════════════════════════════════════════════════════

export function useLevels() {
  return useQuery({
    queryKey: queryKeys.vocabulary.levels(),
    queryFn: getLevels,
    staleTime: 60 * 60 * 1000, // 1 hour - levels rarely change
  });
}

export function useTopics(level: string) {
  return useQuery({
    queryKey: queryKeys.vocabulary.topics(level),
    queryFn: () => getTopics(level),
    enabled: !!level,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useVocabulary(level: string, topic: string) {
  return useQuery({
    queryKey: ['vocabulary', 'topic', level, topic],
    queryFn: () => getVocabulary(level, topic),
    enabled: !!level && !!topic,
  });
}

export function useDbVocabulary(filters: VocabularyFilters = {}) {
  return useQuery({
    queryKey: queryKeys.vocabulary.list(filters),
    queryFn: () => getDbVocabulary(filters),
  });
}

export function useRandomVocabulary(count: number = 10, level?: string) {
  return useQuery({
    queryKey: queryKeys.vocabulary.random(count, level),
    queryFn: () => getRandomVocabulary(count, level),
    staleTime: 0, // Always fetch new random cards
  });
}

export function useVocabularyStats() {
  return useQuery({
    queryKey: queryKeys.vocabulary.stats(),
    queryFn: getVocabularyStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ═══════════════════════════════════════════════════════════════
// SRS Hooks
// ═══════════════════════════════════════════════════════════════

export function useDueCards(limit: number = 20, level?: string) {
  const { userId } = useUser();

  return useQuery({
    queryKey: queryKeys.srs.due(userId, level),
    queryFn: async () => {
      const response = await fetch('/api/review/queue');
      if (!response.ok) {
        throw new Error('Failed to fetch review queue');
      }

      const json = (await response.json()) as ReviewQueueResponse;
      const words = json.data?.words ?? [];

      return words
        .slice(0, limit)
        .filter((item) => !level || item.word.level?.toUpperCase() === level.toUpperCase())
        .map((item) => ({
          id: item.word.id,
          word: item.word.word,
          meaning_vi: item.word.meaning_vi,
          level: item.word.level,
          topic: item.word.topic ?? null,
          example_de: item.word.example_de ?? null,
          example_vi: item.word.example_vi ?? null,
          pos: item.word.pos ?? null,
          artikel: item.word.artikel ?? null,
          plural: item.word.plural ?? null,
          gender: item.word.gender ?? null,
          audioUrl: item.word.audioUrl ?? null,
          phoneticIpa: item.word.phoneticIpa ?? null,
          familyWords: item.word.familyWords ?? [],
          grammarTags: item.word.grammarTags ?? [],
          source: item.word.source ?? null,
          addedAt: item.word.addedAt ?? null,
          createdAt: item.word.createdAt ?? new Date().toISOString(),
          updatedAt: item.word.updatedAt ?? new Date().toISOString(),
          progress: {
            id: item.id,
            userId,
            wordId: item.word.id,
            status: item.status,
            easeFactor: item.easeFactor,
            intervalDays: item.intervalDays,
            repetitions: item.repetitions,
            nextReview: item.nextReview,
          },
        }));
    },
    enabled: !!userId,
  });
}

export function useUserProgress() {
  const { userId } = useUser();

  return useQuery({
    queryKey: queryKeys.srs.progress(userId),
    queryFn: () => getUserProgress(userId),
    enabled: !!userId,
  });
}

export function useVocabularyWithProgress(filters: VocabularyFilters = {}) {
  const { userId } = useUser();

  return useQuery({
    queryKey: queryKeys.srs.withProgress(userId, filters),
    queryFn: () => getVocabularyWithProgress(userId, filters),
    enabled: !!userId,
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ vocabId, rating }: { vocabId: string; rating: SRSRating }) => {
      const quality = mapSrsRatingToQuality(rating);
      const response = await fetch('/api/review/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wordId: vocabId, quality }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload?.error || 'Failed to submit review');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate due cards and progress after review
      queryClient.invalidateQueries({ queryKey: queryKeys.srs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.hub.all });
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// Reading Hooks
// ═══════════════════════════════════════════════════════════════

export function useReadingContent(filters: ReadingFilters = {}) {
  return useQuery({
    queryKey: queryKeys.reading.list(filters),
    queryFn: () => getReadingContent(filters),
  });
}

export function useRecommendedReading(limit?: number) {
  const { userId } = useUser();

  return useQuery({
    queryKey: queryKeys.reading.recommended(userId),
    queryFn: () => getRecommendedReading(userId, limit),
    enabled: !!userId,
  });
}

export function useFeaturedReading(limit?: number) {
  return useQuery({
    queryKey: queryKeys.reading.featured(),
    queryFn: () => getFeaturedReading(limit),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useReadingById(id: string, includeAnalysis: boolean = false) {
  const { userId } = useUser();

  return useQuery({
    queryKey: queryKeys.reading.detail(id, includeAnalysis ? userId : undefined),
    queryFn: () => getReadingById(id, includeAnalysis ? userId : undefined),
    enabled: !!id,
  });
}

export function useReadingHistory(status?: 'not_started' | 'in_progress' | 'completed') {
  const { userId } = useUser();

  return useQuery({
    queryKey: queryKeys.reading.history(userId, status),
    queryFn: () => getUserReadingHistory(userId, status),
    enabled: !!userId,
  });
}

export function useReadingStats() {
  const { userId } = useUser();

  return useQuery({
    queryKey: queryKeys.reading.stats(userId),
    queryFn: () => getUserReadingStats(userId),
    enabled: !!userId,
  });
}

export function useReadingContentStats() {
  return useQuery({
    queryKey: ['reading', 'content-stats'],
    queryFn: getReadingStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useStartReading() {
  const queryClient = useQueryClient();
  const { userId } = useUser();

  return useMutation({
    mutationFn: (contentId: string) => startReading(userId, contentId),
    onSuccess: (_, contentId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reading.detail(contentId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.reading.history(userId) });
    },
  });
}

export function useUpdateReadingProgress() {
  const queryClient = useQueryClient();
  const { userId } = useUser();

  return useMutation({
    mutationFn: ({ contentId, progress }: { contentId: string; progress: { progressPercent?: number; lastPosition?: number; wordsRead?: number; totalReadTime?: number; wordsLookedUp?: string[] } }) =>
      updateReadingProgress(userId, contentId, progress),
    onSuccess: (_, { contentId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reading.detail(contentId) });
    },
  });
}

export function useCompleteReading() {
  const queryClient = useQueryClient();
  const { userId } = useUser();

  return useMutation({
    mutationFn: ({ contentId, rating }: { contentId: string; rating?: number }) =>
      completeReading(userId, contentId, rating),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reading.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.hub.all });
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// Listening Hooks
// ═══════════════════════════════════════════════════════════════

export function useListeningContent(filters: ListeningFilters = {}) {
  return useQuery({
    queryKey: queryKeys.listening.list(filters),
    queryFn: () => getListeningContent(filters),
  });
}

export function useFeaturedListening(limit?: number) {
  return useQuery({
    queryKey: queryKeys.listening.featured(),
    queryFn: () => getFeaturedListening(limit),
    staleTime: 30 * 60 * 1000,
  });
}

export function useListeningById(id: string) {
  return useQuery({
    queryKey: queryKeys.listening.detail(id),
    queryFn: () => getListeningById(id),
    enabled: !!id,
  });
}

export function useListeningExercises(contentId: string) {
  return useQuery({
    queryKey: queryKeys.listening.exercises(contentId),
    queryFn: () => getListeningExercises(contentId),
    enabled: !!contentId,
  });
}

export function useListeningHistory() {
  const { userId } = useUser();

  return useQuery({
    queryKey: queryKeys.listening.history(userId),
    queryFn: () => getUserListeningHistory(userId),
    enabled: !!userId,
  });
}

export function useListeningStats() {
  const { userId } = useUser();

  return useQuery({
    queryKey: queryKeys.listening.stats(userId),
    queryFn: () => getUserListeningStats(userId),
    enabled: !!userId,
  });
}

export function useListeningContentStats() {
  return useQuery({
    queryKey: ['listening', 'content-stats'],
    queryFn: getListeningStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useStartListening() {
  const queryClient = useQueryClient();
  const { userId } = useUser();

  return useMutation({
    mutationFn: (contentId: string) => startListening(userId, contentId),
    onSuccess: (_, contentId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listening.detail(contentId) });
    },
  });
}

export function useUpdateListeningProgress() {
  const queryClient = useQueryClient();
  const { userId } = useUser();

  return useMutation({
    mutationFn: ({ contentId, progress }: { contentId: string; progress: { totalListenTime?: number; lastPosition?: number; playCount?: number } }) =>
      updateListeningProgress(userId, contentId, progress),
    onSuccess: (_, { contentId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listening.detail(contentId) });
    },
  });
}

export function useSubmitDictation() {
  const queryClient = useQueryClient();
  const { userId } = useUser();

  return useMutation({
    mutationFn: ({ exerciseId, data }: { exerciseId: string; data: { userText: string; accuracy: number; wordsCorrect: number; wordsTotal: number; mistakes: DictationMistake[]; listenCount: number; timeSpent: number } }) =>
      submitDictationAttempt(exerciseId, userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listening.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.hub.all });
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// Speaking Hooks
// ═══════════════════════════════════════════════════════════════

export function useSpeakingPrompts(filters: SpeakingFilters = {}) {
  return useQuery({
    queryKey: queryKeys.speaking.list(filters),
    queryFn: () => getSpeakingPrompts(filters),
  });
}

export function useFeaturedSpeaking(limit?: number) {
  return useQuery({
    queryKey: queryKeys.speaking.featured(),
    queryFn: () => getFeaturedSpeaking(limit),
    staleTime: 30 * 60 * 1000,
  });
}

export function useSpeakingById(id: string) {
  return useQuery({
    queryKey: queryKeys.speaking.detail(id),
    queryFn: () => getSpeakingById(id),
    enabled: !!id,
  });
}

export function useSpeakingAttempts(promptId: string) {
  const { userId } = useUser();

  return useQuery({
    queryKey: queryKeys.speaking.attempts(promptId, userId),
    queryFn: () => getSpeakingAttempts(promptId, userId),
    enabled: !!promptId && !!userId,
  });
}

export function useSpeakingHistory() {
  const { userId } = useUser();

  return useQuery({
    queryKey: queryKeys.speaking.history(userId),
    queryFn: () => getUserSpeakingHistory(userId),
    enabled: !!userId,
  });
}

export function useSpeakingStats() {
  const { userId } = useUser();

  return useQuery({
    queryKey: queryKeys.speaking.stats(userId),
    queryFn: () => getUserSpeakingStats(userId),
    enabled: !!userId,
  });
}

export function useSpeakingContentStats() {
  return useQuery({
    queryKey: ['speaking', 'content-stats'],
    queryFn: getSpeakingStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSubmitSpeaking() {
  const queryClient = useQueryClient();
  const { userId } = useUser();

  return useMutation({
    mutationFn: ({ promptId, data }: { promptId: string; data: { transcript: string; audioUrl?: string; audioDuration?: number; recordingTime?: number } }) =>
      submitSpeakingAttempt(promptId, userId, data),
    onSuccess: (_, { promptId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.speaking.attempts(promptId, userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.speaking.history(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.hub.all });
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// Writing Hooks
// ═══════════════════════════════════════════════════════════════

export function useWritingPrompts(filters: WritingFilters = {}) {
  return useQuery({
    queryKey: queryKeys.writing.list(filters),
    queryFn: () => getWritingPrompts(filters),
  });
}

export function useFeaturedWriting(limit?: number) {
  return useQuery({
    queryKey: queryKeys.writing.featured(),
    queryFn: () => getFeaturedWriting(limit),
    staleTime: 30 * 60 * 1000,
  });
}

export function useWritingById(id: string) {
  return useQuery({
    queryKey: queryKeys.writing.detail(id),
    queryFn: () => getWritingById(id),
    enabled: !!id,
  });
}

export function useWritingSubmissions(promptId: string) {
  const { userId } = useUser();

  return useQuery({
    queryKey: queryKeys.writing.submissions(promptId, userId),
    queryFn: () => getWritingSubmissions(promptId, userId),
    enabled: !!promptId && !!userId,
  });
}

export function useWritingDraft(promptId: string) {
  const { userId } = useUser();

  return useQuery({
    queryKey: queryKeys.writing.draft(promptId, userId),
    queryFn: () => getWritingDraft(promptId, userId),
    enabled: !!promptId && !!userId,
  });
}

export function useWritingHistory() {
  const { userId } = useUser();

  return useQuery({
    queryKey: queryKeys.writing.history(userId),
    queryFn: () => getUserWritingHistory(userId),
    enabled: !!userId,
  });
}

export function useWritingStats() {
  const { userId } = useUser();

  return useQuery({
    queryKey: queryKeys.writing.stats(userId),
    queryFn: () => getUserWritingStats(userId),
    enabled: !!userId,
  });
}

export function useWritingContentStats() {
  return useQuery({
    queryKey: ['writing', 'content-stats'],
    queryFn: getWritingStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSubmitWriting() {
  const queryClient = useQueryClient();
  const { userId } = useUser();

  return useMutation({
    mutationFn: ({ promptId, data }: { promptId: string; data: { content: string; answers?: Record<string, unknown>; timeSpent: number } }) =>
      submitWriting(promptId, userId, data),
    onSuccess: (_, { promptId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.writing.submissions(promptId, userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.writing.history(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.hub.all });
    },
  });
}

export function useSaveWritingDraft() {
  const queryClient = useQueryClient();
  const { userId } = useUser();

  return useMutation({
    mutationFn: ({ promptId, content }: { promptId: string; content: string }) =>
      saveWritingDraft(promptId, userId, content),
    onSuccess: (_, { promptId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.writing.draft(promptId, userId) });
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// Hub Hooks
// ═══════════════════════════════════════════════════════════════

export function useHubData() {
  const { userId } = useUser();

  return useQuery({
    queryKey: queryKeys.hub.data(userId),
    queryFn: () => getHubData(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useSkillProgress() {
  const { userId } = useUser();

  return useQuery({
    queryKey: queryKeys.hub.skills(userId),
    queryFn: () => getSkillProgress(userId),
    enabled: !!userId,
  });
}

export function useDailyGoals() {
  const { userId } = useUser();

  return useQuery({
    queryKey: queryKeys.hub.dailyGoals(userId),
    queryFn: () => getDailyGoals(userId),
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute - goals change frequently
  });
}

export function useRecommendation() {
  const { userId } = useUser();

  return useQuery({
    queryKey: queryKeys.hub.recommendation(userId),
    queryFn: () => getRecommendation(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ═══════════════════════════════════════════════════════════════
// Leaderboard Hooks
// ═══════════════════════════════════════════════════════════════

export function useLeaderboard(filters: LeaderboardFilters = {}) {
  const { userId } = useUser();

  return useQuery({
    queryKey: queryKeys.leaderboard.list(userId, filters),
    queryFn: () => getLeaderboard(userId, filters),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useUserRankings() {
  const { userId } = useUser();

  return useQuery({
    queryKey: queryKeys.leaderboard.rankings(userId),
    queryFn: () => getUserRankings(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useLeaderboardStats(timeframe: LeaderboardTimeframe = 'all-time') {
  return useQuery({
    queryKey: queryKeys.leaderboard.stats(timeframe),
    queryFn: () => getLeaderboardStats(timeframe),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
