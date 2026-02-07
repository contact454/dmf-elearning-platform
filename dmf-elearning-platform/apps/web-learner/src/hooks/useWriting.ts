/**
 * Writing Module - React Query Hooks
 * Handles API integration for essays, prompts, and grammar checking
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface Prompt {
  id: string;
  title: string;
  description: string;
  cefrLevel: string;
  category?: string;
  targetWordCount: number;
  tips?: {
    tips: string[];
  };
  createdAt: string;
}

export interface Essay {
  id: string;
  userId: string;
  promptId?: string;
  content: string;
  wordCount: number;
  errorCount: number;
  writingTimeSeconds: number;
  status: 'draft' | 'submitted' | 'reviewed';
  createdAt: string;
  updatedAt: string;
  prompt?: {
    title: string;
  };
}

export interface GrammarError {
  id?: string;
  type: 'grammar' | 'spelling' | 'style';
  message: string;
  shortMessage?: string;
  offset: number;
  length: number;
  context?: {
    text: string;
    offset: number;
    length: number;
  };
  suggestions: Array<{ value: string }>;
  ruleId?: string;
  category?: string;
}

export interface GrammarCheckResponse {
  errors: GrammarError[];
  language: string;
  processingTimeMs: number;
}

// ============================================
// PROMPTS HOOKS
// ============================================

/**
 * Fetch all prompts with optional filtering
 */
export function usePrompts(level?: string, category?: string) {
  return useQuery({
    queryKey: ['prompts', level, category],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (level) params.level = level;
      if (category) params.category = category;
      
      const response = await api.get<{ prompts: Prompt[] }>('/api/prompts', { params });
      return response.data.prompts;
    },
  });
}

/**
 * Fetch single prompt by ID
 */
export function usePrompt(id: string) {
  return useQuery({
    queryKey: ['prompts', id],
    queryFn: async () => {
      const response = await api.get<{ prompt: Prompt }>(`/api/prompts/${id}`);
      return response.data.prompt;
    },
    enabled: !!id,
  });
}

// ============================================
// ESSAYS HOOKS
// ============================================

/**
 * Fetch all user essays
 */
export function useEssays(limit = 20, offset = 0) {
  return useQuery({
    queryKey: ['essays', limit, offset],
    queryFn: async () => {
      const response = await api.get<{ essays: Essay[]; total: number }>('/api/essays', {
        params: { limit, offset },
      });
      return response.data;
    },
  });
}

/**
 * Fetch single essay by ID
 */
export function useEssay(id: string) {
  return useQuery({
    queryKey: ['essays', id],
    queryFn: async () => {
      const response = await api.get<{ essay: Essay }>(`/api/essays/${id}`);
      return response.data.essay;
    },
    enabled: !!id,
  });
}

/**
 * Create new essay
 */
export function useCreateEssay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { promptId: string | null; content: string }) => {
      const response = await api.post<{ essay: Essay }>('/api/essays', data);
      return response.data.essay;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['essays'] });
    },
  });
}

/**
 * Update existing essay
 */
export function useUpdateEssay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      content, 
      errorCount, 
      writingTimeSeconds, 
      status 
    }: { 
      id: string; 
      content?: string; 
      errorCount?: number; 
      writingTimeSeconds?: number; 
      status?: 'draft' | 'submitted' | 'reviewed';
    }) => {
      const response = await api.put<{ essay: Essay }>(`/api/essays/${id}`, {
        content,
        errorCount,
        writingTimeSeconds,
        status,
      });
      return response.data.essay;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['essays', data.id] });
      queryClient.invalidateQueries({ queryKey: ['essays'] });
    },
  });
}

/**
 * Delete essay
 */
export function useDeleteEssay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/essays/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['essays'] });
    },
  });
}

// ============================================
// GRAMMAR CHECKING HOOKS
// ============================================

/**
 * Check grammar for text
 */
export function useGrammarCheck() {
  return useMutation({
    mutationFn: async ({ 
      text, 
      language = 'de-DE' 
    }: { 
      text: string; 
      language?: string;
    }) => {
      const response = await api.post<GrammarCheckResponse>('/api/grammar/check', {
        text,
        language,
      });
      
      // Add IDs to errors for tracking
      const errorsWithIds = response.data.errors.map((error, idx) => ({
        ...error,
        id: `error-${idx}-${Date.now()}`,
      }));
      
      return {
        ...response.data,
        errors: errorsWithIds,
      };
    },
  });
}

// ============================================
// ANALYTICS HOOKS
// ============================================

export interface WritingStats {
  totalEssays: number;
  totalWords: number;
  averageWords: number;
  errorRate: number;
  errorTrends: Array<{
    date: string;
    errorRate: number;
  }>;
  commonErrors: Array<{
    type: string;
    count: number;
  }>;
}

/**
 * Fetch writing analytics
 */
export function useWritingAnalytics(userId: string, period: 'week' | 'month' | 'all' = 'month') {
  return useQuery({
    queryKey: ['analytics', userId, period],
    queryFn: async () => {
      const response = await api.get<{ stats: WritingStats }>(`/api/analytics/${userId}`, {
        params: { period },
      });
      return response.data.stats;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
