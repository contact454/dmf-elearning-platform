/**
 * Speaking Module - React Query Hooks
 * API integration for prompts, submissions, analysis, and analytics
 */

'use client';

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { promptsApi, submissionsApi, analysisApi, analyticsApi } from '@/services/speakingApi';
import type {
  CEFRLevel,
  SpeakingPrompt,
  PromptsQueryParams,
  SpeakingSubmission,
  SubmissionsQueryParams,
  CreateSubmissionRequest,
  TranscriptionResponse,
  ProgressStats,
  WeaknessesResponse,
} from '@/types/speaking';

// ============================================
// QUERY KEYS
// ============================================

export const speakingKeys = {
  all: ['speaking'] as const,
  prompts: () => [...speakingKeys.all, 'prompts'] as const,
  promptsList: (params?: PromptsQueryParams) => [...speakingKeys.prompts(), 'list', params] as const,
  promptsDetail: (id: string) => [...speakingKeys.prompts(), 'detail', id] as const,
  promptsRandom: (cefr: CEFRLevel) => [...speakingKeys.prompts(), 'random', cefr] as const,
  
  submissions: () => [...speakingKeys.all, 'submissions'] as const,
  submissionsList: (params?: SubmissionsQueryParams) => [...speakingKeys.submissions(), 'list', params] as const,
  submissionsDetail: (id: string) => [...speakingKeys.submissions(), 'detail', id] as const,
  
  analytics: () => [...speakingKeys.all, 'analytics'] as const,
  progress: () => [...speakingKeys.analytics(), 'progress'] as const,
  weaknesses: (limit?: number) => [...speakingKeys.analytics(), 'weaknesses', limit] as const,
};

// ============================================
// PROMPTS HOOKS
// ============================================

/**
 * Fetch all prompts with pagination and filters
 */
export function usePrompts(params?: PromptsQueryParams) {
  return useQuery({
    queryKey: speakingKeys.promptsList(params),
    queryFn: () => promptsApi.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch single prompt by ID
 */
export function usePrompt(id: string, options?: Partial<UseQueryOptions<SpeakingPrompt>>) {
  return useQuery({
    queryKey: speakingKeys.promptsDetail(id),
    queryFn: () => promptsApi.getById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

/**
 * Get random prompt by CEFR level
 */
export function useRandomPrompt(cefr: CEFRLevel) {
  return useQuery({
    queryKey: speakingKeys.promptsRandom(cefr),
    queryFn: () => promptsApi.getRandom(cefr),
    enabled: !!cefr,
    staleTime: 0, // Always fetch new random prompt
    gcTime: 0, // Don't cache
  });
}

/**
 * Prefetch random prompt (for faster UX)
 */
export function usePrefetchRandomPrompt() {
  const queryClient = useQueryClient();

  return (cefr: CEFRLevel) => {
    queryClient.prefetchQuery({
      queryKey: speakingKeys.promptsRandom(cefr),
      queryFn: () => promptsApi.getRandom(cefr),
      staleTime: 30 * 1000, // 30 seconds
    });
  };
}

// ============================================
// SUBMISSIONS HOOKS
// ============================================

/**
 * Create new submission
 */
export function useCreateSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSubmissionRequest) => submissionsApi.create(data),
    onSuccess: (newSubmission) => {
      // Invalidate submissions list
      queryClient.invalidateQueries({ queryKey: speakingKeys.submissions() });
      
      // Add to cache
      queryClient.setQueryData(
        speakingKeys.submissionsDetail(newSubmission.id),
        newSubmission
      );
      
      // Invalidate analytics (stats will change)
      queryClient.invalidateQueries({ queryKey: speakingKeys.analytics() });
    },
    retry: 2,
  });
}

/**
 * List user's submissions
 */
export function useSubmissions(params?: SubmissionsQueryParams) {
  return useQuery({
    queryKey: speakingKeys.submissionsList(params),
    queryFn: () => submissionsApi.list(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get single submission by ID
 */
export function useSubmission(id: string, options?: Partial<UseQueryOptions<SpeakingSubmission>>) {
  return useQuery({
    queryKey: speakingKeys.submissionsDetail(id),
    queryFn: () => submissionsApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Delete submission
 */
export function useDeleteSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => submissionsApi.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: speakingKeys.submissionsDetail(deletedId) });
      
      // Invalidate list
      queryClient.invalidateQueries({ queryKey: speakingKeys.submissions() });
      
      // Invalidate analytics
      queryClient.invalidateQueries({ queryKey: speakingKeys.analytics() });
    },
  });
}

// ============================================
// SPEECH ANALYSIS HOOKS
// ============================================

/**
 * Transcribe audio to text (Whisper STT)
 */
export function useTranscribe() {
  return useMutation({
    mutationFn: (audioFile: File) => analysisApi.transcribe(audioFile),
    retry: 1, // Retry once on failure
  });
}

/**
 * Analyze speech and provide AI feedback
 */
export function useAnalyzeSpeech() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (submissionId: string) => analysisApi.analyzeSpeech(submissionId),
    onMutate: async (submissionId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: speakingKeys.submissionsDetail(submissionId) 
      });

      // Snapshot previous value
      const previousSubmission = queryClient.getQueryData<SpeakingSubmission>(
        speakingKeys.submissionsDetail(submissionId)
      );

      // Optimistically update to analyzing state
      if (previousSubmission) {
        queryClient.setQueryData<SpeakingSubmission>(
          speakingKeys.submissionsDetail(submissionId),
          {
            ...previousSubmission,
            status: 'analyzing',
          }
        );
      }

      return { previousSubmission };
    },
    onSuccess: (updatedSubmission, submissionId) => {
      // Update cache with analysis results
      queryClient.setQueryData(
        speakingKeys.submissionsDetail(submissionId),
        updatedSubmission
      );
      
      // Invalidate submissions list
      queryClient.invalidateQueries({ queryKey: speakingKeys.submissions() });
      
      // Invalidate analytics (new scores available)
      queryClient.invalidateQueries({ queryKey: speakingKeys.analytics() });
    },
    onError: (err, submissionId, context) => {
      // Rollback on error
      if (context?.previousSubmission) {
        queryClient.setQueryData(
          speakingKeys.submissionsDetail(submissionId),
          context.previousSubmission
        );
      }
    },
    retry: 2, // Retry analysis up to 2 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
  });
}

// ============================================
// ANALYTICS HOOKS
// ============================================

/**
 * Get user's speaking progress stats
 */
export function useProgress() {
  return useQuery({
    queryKey: speakingKeys.progress(),
    queryFn: () => analyticsApi.getProgress(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Get pronunciation weaknesses
 */
export function useWeaknesses(limit = 20) {
  return useQuery({
    queryKey: speakingKeys.weaknesses(limit),
    queryFn: () => analyticsApi.getWeaknesses(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// ============================================
// COMBINED HOOKS (convenience)
// ============================================

/**
 * Get all data for Speaking Practice page
 */
export function useSpeakingPractice(cefr: CEFRLevel) {
  const prompts = usePrompts({ cefr, limit: 10 });
  const submissions = useSubmissions({ limit: 5 });
  const progress = useProgress();

  return {
    prompts,
    submissions,
    progress,
    isLoading: prompts.isLoading || submissions.isLoading || progress.isLoading,
    error: prompts.error || submissions.error || progress.error,
  };
}

/**
 * Get all data for Submission Detail page
 */
export function useSubmissionDetail(id: string) {
  const submission = useSubmission(id);
  const weaknesses = useWeaknesses(10);

  return {
    submission,
    weaknesses,
    isLoading: submission.isLoading || weaknesses.isLoading,
    error: submission.error || weaknesses.error,
  };
}

// ============================================
// PREFETCHING UTILITIES
// ============================================

/**
 * Prefetch submission for faster navigation
 */
export function usePrefetchSubmission() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: speakingKeys.submissionsDetail(id),
      queryFn: () => submissionsApi.getById(id),
      staleTime: 5 * 60 * 1000,
    });
  };
}
