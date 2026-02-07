/**
 * React Query Hooks for Reading Module
 * Provides hooks for passages, exercises, progress, and vocabulary
 */

'use client';

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import {
  getPassages,
  getPassageById,
  submitAnswer,
  getProgress,
  getVocabularyDefinition,
  getVocabularyStatus,
  saveVocabulary,
  PassageFilters,
  SubmitAnswerRequest,
  SaveVocabularyRequest,
  PassageListResponse,
  Passage,
  UserProgress,
  SubmitAnswerResponse,
  ProgressStats,
  VocabularyDefinition,
  VocabularyStatus,
  SaveVocabularyResponse,
  ReadingApiError,
} from '@/services/reading-api';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const readingQueryKeys = {
  all: ['reading'] as const,
  
  passages: {
    all: () => [...readingQueryKeys.all, 'passages'] as const,
    list: (filters: PassageFilters) => [...readingQueryKeys.passages.all(), 'list', filters] as const,
    detail: (id: string) => [...readingQueryKeys.passages.all(), 'detail', id] as const,
  },
  
  progress: {
    all: () => [...readingQueryKeys.all, 'progress'] as const,
    stats: () => [...readingQueryKeys.progress.all(), 'stats'] as const,
  },
  
  vocabulary: {
    all: () => [...readingQueryKeys.all, 'vocabulary'] as const,
    definition: (word: string) => [...readingQueryKeys.vocabulary.all(), 'definition', word.toLowerCase()] as const,
    status: (word: string) => [...readingQueryKeys.vocabulary.all(), 'status', word.toLowerCase()] as const,
  },
};

// ============================================================================
// PASSAGES HOOKS
// ============================================================================

/**
 * Fetch list of reading passages with filtering
 */
export function usePassages(
  filters: PassageFilters = {},
  options?: Omit<UseQueryOptions<PassageListResponse, ReadingApiError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: readingQueryKeys.passages.list(filters),
    queryFn: () => getPassages(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Fetch single passage with exercises and user progress
 */
export function usePassage(
  id: string | null,
  options?: Omit<UseQueryOptions<{ passage: Passage; userProgress: UserProgress }, ReadingApiError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: readingQueryKeys.passages.detail(id || ''),
    queryFn: () => getPassageById(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

// ============================================================================
// EXERCISE SUBMISSION HOOK
// ============================================================================

/**
 * Submit exercise answer with automatic cache invalidation
 */
export function useSubmitAnswer() {
  const queryClient = useQueryClient();

  return useMutation<SubmitAnswerResponse, ReadingApiError, SubmitAnswerRequest>({
    mutationFn: submitAnswer,
    onSuccess: (data, variables) => {
      // Invalidate passage detail to refresh user progress
      queryClient.invalidateQueries({
        queryKey: readingQueryKeys.passages.detail(variables.passageId),
      });

      // Invalidate progress stats
      queryClient.invalidateQueries({
        queryKey: readingQueryKeys.progress.stats(),
      });
    },
    retry: 1, // Retry once on failure
  });
}

// ============================================================================
// PROGRESS HOOKS
// ============================================================================

/**
 * Fetch user's reading progress statistics
 */
export function useProgress(
  options?: Omit<UseQueryOptions<ProgressStats, ReadingApiError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: readingQueryKeys.progress.stats(),
    queryFn: getProgress,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// ============================================================================
// VOCABULARY HOOKS
// ============================================================================

/**
 * Fetch vocabulary definition for a word
 */
export function useVocabularyDefinition(
  word: string | null,
  options?: Omit<UseQueryOptions<VocabularyDefinition, ReadingApiError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: readingQueryKeys.vocabulary.definition(word || ''),
    queryFn: () => getVocabularyDefinition(word!),
    enabled: !!word && word.length > 0,
    staleTime: 30 * 60 * 1000, // 30 minutes (definitions don't change)
    retry: 2,
    ...options,
  });
}

/**
 * Fetch vocabulary status (new/learning/known)
 */
export function useVocabularyStatus(
  word: string | null,
  options?: Omit<UseQueryOptions<VocabularyStatus, ReadingApiError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: readingQueryKeys.vocabulary.status(word || ''),
    queryFn: () => getVocabularyStatus(word!),
    enabled: !!word && word.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Save word to user's vocabulary with automatic cache invalidation
 */
export function useSaveVocabulary() {
  const queryClient = useQueryClient();

  return useMutation<SaveVocabularyResponse, ReadingApiError, SaveVocabularyRequest>({
    mutationFn: saveVocabulary,
    onSuccess: (data, variables) => {
      // Invalidate vocabulary status to show updated state
      queryClient.invalidateQueries({
        queryKey: readingQueryKeys.vocabulary.status(variables.word),
      });
    },
    retry: 1,
  });
}

// ============================================================================
// PREFETCH UTILITIES
// ============================================================================

/**
 * Prefetch passage detail for faster navigation
 */
export function usePrefetchPassage() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: readingQueryKeys.passages.detail(id),
      queryFn: () => getPassageById(id),
      staleTime: 2 * 60 * 1000,
    });
  };
}

/**
 * Prefetch vocabulary definition on hover
 */
export function usePrefetchVocabulary() {
  const queryClient = useQueryClient();

  return (word: string) => {
    queryClient.prefetchQuery({
      queryKey: readingQueryKeys.vocabulary.definition(word),
      queryFn: () => getVocabularyDefinition(word),
      staleTime: 30 * 60 * 1000,
    });
  };
}
