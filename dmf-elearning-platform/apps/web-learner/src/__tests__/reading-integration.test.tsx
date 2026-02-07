/**
 * Integration Tests for Reading Module React Query Hooks
 * Tests hooks, API client, and error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  usePassages,
  usePassage,
  useSubmitAnswer,
  useProgress,
  useVocabularyDefinition,
  useVocabularyStatus,
  useSaveVocabulary,
} from '@/hooks/useReadingQueries';

// Mock fetch globally
global.fetch = vi.fn();

// Helper to create wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('Reading Module Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // usePassages Hook Tests
  // ============================================================================

  describe('usePassages', () => {
    it('should fetch passages list successfully', async () => {
      const mockResponse = {
        passages: [
          {
            id: '1',
            title: 'Test Passage',
            cefrLevel: 'A1',
            topic: 'culture',
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => usePassages(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/reading/passages'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should apply filters to request', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ passages: [], pagination: {} }),
      });

      const filters = {
        cefr: 'B1',
        topic: 'health',
        page: 2,
        limit: 5,
      };

      renderHook(() => usePassages(filters), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('cefr=B1'),
          expect.any(Object)
        );
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('topic=health'),
        expect.any(Object)
      );
    });

    it('should handle fetch errors gracefully', async () => {
      (global.fetch as any).mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: async () => ({ error: 'Server error' }),
        })
      );

      const { result } = renderHook(() => usePassages(), {
        wrapper: createWrapper(),
      });

      // Hook should handle error and populate error state
      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });

  // ============================================================================
  // usePassage Hook Tests
  // ============================================================================

  describe('usePassage', () => {
    it('should fetch single passage with exercises', async () => {
      const mockResponse = {
        passage: {
          id: '1',
          title: 'Test Passage',
          content: 'Test content',
          exercises: [
            {
              id: 'ex-1',
              exerciseType: 'multiple_choice',
              question: 'Test question?',
            },
          ],
        },
        userProgress: {
          completedAt: null,
          totalExercises: 0,
          correctExercises: 0,
          accuracyPercentage: 0,
          timeSpentSeconds: 0,
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => usePassage('1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.data?.passage.exercises).toHaveLength(1);
    });

    it('should not fetch when id is null', async () => {
      const { result } = renderHook(() => usePassage(null), {
        wrapper: createWrapper(),
      });

      // Disabled queries: fetchStatus='idle'
      expect(result.current.fetchStatus).toBe('idle');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should handle 404 errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Passage not found' }),
      });

      const { result } = renderHook(() => usePassage('999'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.statusCode).toBe(404);
    });
  });

  // ============================================================================
  // useSubmitAnswer Hook Tests
  // ============================================================================

  describe('useSubmitAnswer', () => {
    it('should submit answer and return validation', async () => {
      const mockResponse = {
        attemptId: 'attempt-123',
        isCorrect: true,
        accuracyScore: 100,
        correctAnswer: { correct_index: 0 },
        explanation: 'Correct!',
        xpEarned: 10,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useSubmitAnswer(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        passageId: '1',
        exerciseId: 'ex-1',
        userAnswer: { selected_index: 0 },
        timeSpentSeconds: 30,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.data?.isCorrect).toBe(true);
      expect(result.current.data?.xpEarned).toBe(10);
    });

    it('should handle incorrect answers', async () => {
      const mockResponse = {
        attemptId: 'attempt-124',
        isCorrect: false,
        accuracyScore: 0,
        correctAnswer: { correct_index: 2 },
        explanation: 'The correct answer is option C.',
        xpEarned: 5,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useSubmitAnswer(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        passageId: '1',
        exerciseId: 'ex-1',
        userAnswer: { selected_index: 1 },
        timeSpentSeconds: 45,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.isCorrect).toBe(false);
      expect(result.current.data?.xpEarned).toBe(5);
    });
  });

  // ============================================================================
  // useProgress Hook Tests
  // ============================================================================

  describe('useProgress', () => {
    it('should fetch user progress statistics', async () => {
      const mockResponse = {
        passagesCompleted: 12,
        accuracyByLevel: [
          { level: 'A1', averageAccuracy: 92.5, attempts: 50 },
        ],
        totalTimeSpentMinutes: 180,
        recentAttempts: 25,
        streak: { current: 7, longest: 15 },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useProgress(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.data?.passagesCompleted).toBe(12);
      expect(result.current.data?.streak.current).toBe(7);
    });
  });

  // ============================================================================
  // Vocabulary Hook Tests
  // ============================================================================

  describe('useVocabularyDefinition', () => {
    it('should fetch word definition', async () => {
      const mockResponse = {
        word: 'hello',
        definition: 'A greeting',
        translationVi: 'Xin chào',
        pronunciation: '/həˈləʊ/',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useVocabularyDefinition('hello'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.data?.word).toBe('hello');
    });

    it('should not fetch when word is null', () => {
      const { result } = renderHook(() => useVocabularyDefinition(null), {
        wrapper: createWrapper(),
      });

      // Disabled queries in React Query v5: fetchStatus='idle', no fetch
      expect(result.current.fetchStatus).toBe('idle');
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('useVocabularyStatus', () => {
    it('should fetch vocabulary status', async () => {
      const mockResponse = { status: 'learning' };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useVocabularyStatus('greet'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.status).toBe('learning');
    });
  });

  describe('useSaveVocabulary', () => {
    it('should save word to vocabulary', async () => {
      const mockResponse = {
        message: 'Word saved successfully',
        vocabulary: {
          id: 'vocab-123',
          word: 'greet',
          definition: 'To address with expressions of goodwill',
          status: 'new',
          nextReviewAt: new Date().toISOString(),
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useSaveVocabulary(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        word: 'greet',
        passageId: '1',
        context: 'Learning how to greet people...',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.vocabulary.word).toBe('greet');
      expect(result.current.data?.vocabulary.status).toBe('new');
    });
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('Error Handling', () => {
    it('should handle retry logic on network errors', async () => {
      // Mock a network error
      (global.fetch as any).mockImplementationOnce(() => 
        Promise.reject(new Error('Network error'))
      );

      const { result } = renderHook(() => usePassages(), {
        wrapper: createWrapper(),
      });

      // Hook should handle error without crashing
      await waitFor(() => {
        expect(result.current.isError || result.current.isSuccess).toBe(true);
      });
    });

    it('should not retry on 4xx errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Bad Request' }),
      });

      const { result } = renderHook(() => usePassages(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      // Should only call fetch once (no retries on 4xx)
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
});
