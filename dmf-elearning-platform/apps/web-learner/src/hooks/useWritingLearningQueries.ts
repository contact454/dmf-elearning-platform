'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getFeaturedWriting,
  getUserWritingHistory,
  getUserWritingStats,
  getWritingById,
  getWritingDraft,
  getWritingPrompts,
  getWritingStats,
  getWritingSubmissions,
  saveWritingDraft,
  submitWriting,
  type WritingFilters,
} from '@/services/german-api'
import { useUser } from '@/providers/user-provider'
import { queryKeys } from './queryKeys'

export function useWritingPrompts(filters: WritingFilters = {}) {
  return useQuery({
    queryKey: queryKeys.writing.list(filters),
    queryFn: () => getWritingPrompts(filters),
  })
}

export function useFeaturedWriting(limit?: number) {
  return useQuery({
    queryKey: queryKeys.writing.featured(),
    queryFn: () => getFeaturedWriting(limit),
    staleTime: 30 * 60 * 1000,
  })
}

export function useWritingById(id: string) {
  return useQuery({
    queryKey: queryKeys.writing.detail(id),
    queryFn: () => getWritingById(id),
    enabled: !!id,
  })
}

export function useWritingSubmissions(promptId: string) {
  const { userId } = useUser()

  return useQuery({
    queryKey: queryKeys.writing.submissions(promptId, userId),
    queryFn: () => getWritingSubmissions(promptId, userId),
    enabled: !!promptId && !!userId,
  })
}

export function useWritingDraft(promptId: string) {
  const { userId } = useUser()

  return useQuery({
    queryKey: queryKeys.writing.draft(promptId, userId),
    queryFn: () => getWritingDraft(promptId, userId),
    enabled: !!promptId && !!userId,
  })
}

export function useWritingHistory() {
  const { userId } = useUser()

  return useQuery({
    queryKey: queryKeys.writing.history(userId),
    queryFn: () => getUserWritingHistory(userId),
    enabled: !!userId,
  })
}

export function useWritingStats() {
  const { userId } = useUser()

  return useQuery({
    queryKey: queryKeys.writing.stats(userId),
    queryFn: () => getUserWritingStats(userId),
    enabled: !!userId,
  })
}

export function useWritingContentStats() {
  return useQuery({
    queryKey: ['writing', 'content-stats'],
    queryFn: getWritingStats,
    staleTime: 5 * 60 * 1000,
  })
}

export function useSubmitWriting() {
  const queryClient = useQueryClient()
  const { userId } = useUser()

  return useMutation({
    mutationFn: ({
      promptId,
      data,
    }: {
      promptId: string
      data: { content: string; answers?: Record<string, unknown>; timeSpent: number }
    }) => submitWriting(promptId, userId, data),
    onSuccess: (_, { promptId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.writing.submissions(promptId, userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.writing.history(userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.hub.all })
    },
  })
}

export function useSaveWritingDraft() {
  const queryClient = useQueryClient()
  const { userId } = useUser()

  return useMutation({
    mutationFn: ({ promptId, content }: { promptId: string; content: string }) =>
      saveWritingDraft(promptId, userId, content),
    onSuccess: (_, { promptId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.writing.draft(promptId, userId) })
    },
  })
}
