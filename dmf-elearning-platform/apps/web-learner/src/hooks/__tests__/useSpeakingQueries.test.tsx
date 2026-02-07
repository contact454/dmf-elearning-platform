/**
 * Speaking Module - Integration Tests
 * Tests for React Query hooks and API integration
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  usePrompts,
  usePrompt,
  useRandomPrompt,
  useCreateSubmission,
  useSubmissions,
  useSubmission,
  useDeleteSubmission,
  useTranscribe,
  useAnalyzeSpeech,
  useProgress,
  useWeaknesses,
} from '../useSpeakingQueries';
import { promptsApi, submissionsApi, analysisApi, analyticsApi } from '@/services/speakingApi';
import type { SpeakingPrompt, SpeakingSubmission } from '@/types/speaking';

// ============================================
// MOCK DATA
// ============================================

const mockPrompt: SpeakingPrompt = {
  id: 'prompt-1',
  questionText: 'Beschreiben Sie Ihre Lieblingsstadt',
  topic: 'Travel',
  cefrLevel: 'B1',
  timeLimit: 120,
  tips: ['Sprechen Sie über die Sehenswürdigkeiten', 'Erwähnen Sie die Atmosphäre'],
  sampleAnswer: 'Meine Lieblingsstadt ist Berlin...',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockSubmission: SpeakingSubmission = {
  id: 'sub-1',
  userId: 'user-1',
  promptId: 'prompt-1',
  audioUrl: 'https://example.com/audio.mp3',
  durationSeconds: 95,
  transcriptText: 'Meine Lieblingsstadt ist Berlin...',
  status: 'analyzed',
  overallScore: 85,
  pronunciationScore: 88,
  fluencyScore: 82,
  vocabularyScore: 86,
  grammarScore: 84,
  aiFeedback: {
    strengths: ['Good pronunciation', 'Natural flow'],
    improvements: ['Use more varied vocabulary'],
    suggestedPhrases: ['Ich finde... besonders interessant'],
    detailedFeedback: 'Overall excellent performance...',
  },
  prompt: mockPrompt,
  createdAt: '2024-01-02T00:00:00Z',
  updatedAt: '2024-01-02T12:00:00Z',
};

// ============================================
// TEST SETUP
// ============================================

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

// ============================================
// PROMPTS HOOKS TESTS
// ============================================

describe('usePrompts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch prompts successfully', async () => {
    const mockResponse = {
      data: [mockPrompt],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };

    vi.spyOn(promptsApi, 'list').mockResolvedValue(mockResponse);

    const { result } = renderHook(() => usePrompts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockResponse);
    expect(promptsApi.list).toHaveBeenCalledWith(undefined);
  });

  it('should fetch prompts with filters', async () => {
    const params = { cefr: 'B1' as const, limit: 5 };
    const mockResponse = {
      data: [mockPrompt],
      pagination: { page: 1, limit: 5, total: 1, totalPages: 1 },
    };

    vi.spyOn(promptsApi, 'list').mockResolvedValue(mockResponse);

    const { result } = renderHook(() => usePrompts(params), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(promptsApi.list).toHaveBeenCalledWith(params);
  });

  it('should handle error when fetching prompts', async () => {
    vi.spyOn(promptsApi, 'list').mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => usePrompts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });
});

describe('usePrompt', () => {
  it('should fetch single prompt by ID', async () => {
    vi.spyOn(promptsApi, 'getById').mockResolvedValue(mockPrompt);

    const { result } = renderHook(() => usePrompt('prompt-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockPrompt);
    expect(promptsApi.getById).toHaveBeenCalledWith('prompt-1');
  });

  it('should not fetch when ID is empty', async () => {
    vi.spyOn(promptsApi, 'getById');

    const { result } = renderHook(() => usePrompt(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(promptsApi.getById).not.toHaveBeenCalled();
  });
});

describe('useRandomPrompt', () => {
  it('should fetch random prompt by CEFR level', async () => {
    vi.spyOn(promptsApi, 'getRandom').mockResolvedValue(mockPrompt);

    const { result } = renderHook(() => useRandomPrompt('B1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockPrompt);
    expect(promptsApi.getRandom).toHaveBeenCalledWith('B1');
  });
});

// ============================================
// SUBMISSIONS HOOKS TESTS
// ============================================

describe('useCreateSubmission', () => {
  it('should create submission successfully', async () => {
    vi.spyOn(submissionsApi, 'create').mockResolvedValue(mockSubmission);

    const { result } = renderHook(() => useCreateSubmission(), {
      wrapper: createWrapper(),
    });

    const createData = {
      promptId: 'prompt-1',
      audioUrl: 'https://example.com/audio.mp3',
      durationSeconds: 95,
    };

    result.current.mutate(createData);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockSubmission);
    expect(submissionsApi.create).toHaveBeenCalledWith(createData);
  });

  it('should handle error when creating submission', async () => {
    vi.spyOn(submissionsApi, 'create').mockRejectedValue(new Error('Validation error'));

    const { result } = renderHook(() => useCreateSubmission(), {
      wrapper: createWrapper(),
    });

    const createData = {
      promptId: 'invalid-id',
      audioUrl: 'invalid-url',
      durationSeconds: 0,
    };

    result.current.mutate(createData);

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useSubmissions', () => {
  it('should fetch user submissions', async () => {
    const mockResponse = {
      data: [mockSubmission],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };

    vi.spyOn(submissionsApi, 'list').mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useSubmissions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockResponse);
  });
});

describe('useDeleteSubmission', () => {
  it('should delete submission successfully', async () => {
    vi.spyOn(submissionsApi, 'delete').mockResolvedValue({ message: 'Deleted successfully' });

    const { result } = renderHook(() => useDeleteSubmission(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('sub-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(submissionsApi.delete).toHaveBeenCalledWith('sub-1');
  });
});

// ============================================
// ANALYSIS HOOKS TESTS
// ============================================

describe('useTranscribe', () => {
  it('should transcribe audio file', async () => {
    const mockTranscription = {
      text: 'Meine Lieblingsstadt ist Berlin',
      language: 'de',
      duration: 95,
      confidence: 0.95,
      processingTimeMs: 1500,
    };

    vi.spyOn(analysisApi, 'transcribe').mockResolvedValue(mockTranscription);

    const { result } = renderHook(() => useTranscribe(), {
      wrapper: createWrapper(),
    });

    const mockFile = new File(['audio content'], 'test.mp3', { type: 'audio/mpeg' });

    result.current.mutate(mockFile);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockTranscription);
    expect(analysisApi.transcribe).toHaveBeenCalledWith(mockFile);
  });
});

describe('useAnalyzeSpeech', () => {
  it('should analyze speech successfully', async () => {
    vi.spyOn(analysisApi, 'analyzeSpeech').mockResolvedValue(mockSubmission);

    const { result } = renderHook(() => useAnalyzeSpeech(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('sub-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockSubmission);
    expect(analysisApi.analyzeSpeech).toHaveBeenCalledWith('sub-1');
  });

  it('should handle optimistic updates', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    // Pre-populate cache with pending submission
    const pendingSubmission = { ...mockSubmission, status: 'pending' as const };
    queryClient.setQueryData(['speaking', 'submissions', 'detail', 'sub-1'], pendingSubmission);

    vi.spyOn(analysisApi, 'analyzeSpeech').mockResolvedValue(mockSubmission);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useAnalyzeSpeech(), { wrapper });

    result.current.mutate('sub-1');

    // Should optimistically update to 'analyzing'
    await waitFor(() => {
      const cached = queryClient.getQueryData(['speaking', 'submissions', 'detail', 'sub-1']);
      expect((cached as any)?.status).toBe('analyzing');
    });

    // After success, should have final data
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

// ============================================
// ANALYTICS HOOKS TESTS
// ============================================

describe('useProgress', () => {
  it('should fetch user progress stats', async () => {
    const mockProgress = {
      totalSubmissions: 10,
      averageScore: 85,
      averagePronunciationScore: 88,
      averageFluencyScore: 82,
      averageVocabularyScore: 86,
      averageGrammarScore: 84,
      totalSpeakingTime: 950,
      improvementRate: 15,
      scoreHistory: [],
      levelDistribution: [],
    };

    vi.spyOn(analyticsApi, 'getProgress').mockResolvedValue(mockProgress);

    const { result } = renderHook(() => useProgress(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockProgress);
  });
});

describe('useWeaknesses', () => {
  it('should fetch pronunciation weaknesses', async () => {
    const mockWeaknesses = {
      data: [
        {
          word: 'ich',
          errorCount: 5,
          errorType: 'vowel_error' as const,
          averageSeverity: 7,
          lastOccurrence: '2024-01-02T12:00:00Z',
          suggestion: 'Practice "ich" sound',
        },
      ],
      total: 1,
    };

    vi.spyOn(analyticsApi, 'getWeaknesses').mockResolvedValue(mockWeaknesses);

    const { result } = renderHook(() => useWeaknesses(20), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockWeaknesses);
    expect(analyticsApi.getWeaknesses).toHaveBeenCalledWith(20);
  });
});
