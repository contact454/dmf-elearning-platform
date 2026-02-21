'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  completeReading,
  getFeaturedReading,
  getReadingById,
  getReadingContent,
  getReadingStats,
  getRecommendedReading,
  getUserReadingHistory,
  getUserReadingStats,
  startReading,
  updateReadingProgress,
  type ReadingFilters,
} from '@/services/german-api'
import { useUser } from '@/providers/user-provider'
import { queryKeys } from './queryKeys'

export function useReadingContent(filters: ReadingFilters = {}) {
  return useQuery({
    queryKey: queryKeys.reading.list(filters),
    queryFn: () => getReadingContent(filters),
  })
}

export function useRecommendedReading(limit?: number) {
  const { userId } = useUser()

  return useQuery({
    queryKey: queryKeys.reading.recommended(userId),
    queryFn: () => getRecommendedReading(userId, limit),
    enabled: !!userId,
  })
}

export function useFeaturedReading(limit?: number) {
  return useQuery({
    queryKey: queryKeys.reading.featured(),
    queryFn: () => getFeaturedReading(limit),
    staleTime: 30 * 60 * 1000,
  })
}

export function useReadingById(id: string, includeAnalysis: boolean = false) {
  const { userId } = useUser()

  return useQuery({
    queryKey: queryKeys.reading.detail(id, includeAnalysis ? userId : undefined),
    queryFn: () => getReadingById(id, includeAnalysis ? userId : undefined),
    enabled: !!id,
  })
}

export function useReadingHistory(status?: 'not_started' | 'in_progress' | 'completed') {
  const { userId } = useUser()

  return useQuery({
    queryKey: queryKeys.reading.history(userId, status),
    queryFn: () => getUserReadingHistory(userId, status),
    enabled: !!userId,
  })
}

export function useReadingStats() {
  const { userId } = useUser()

  return useQuery({
    queryKey: queryKeys.reading.stats(userId),
    queryFn: () => getUserReadingStats(userId),
    enabled: !!userId,
  })
}

export function useReadingContentStats() {
  return useQuery({
    queryKey: ['reading', 'content-stats'],
    queryFn: getReadingStats,
    staleTime: 5 * 60 * 1000,
  })
}

export function useStartReading() {
  const queryClient = useQueryClient()
  const { userId } = useUser()

  return useMutation({
    mutationFn: (contentId: string) => startReading(userId, contentId),
    onSuccess: (_, contentId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reading.detail(contentId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.reading.history(userId) })
    },
  })
}

export function useUpdateReadingProgress() {
  const queryClient = useQueryClient()
  const { userId } = useUser()

  return useMutation({
    mutationFn: ({
      contentId,
      progress,
    }: {
      contentId: string
      progress: {
        progressPercent?: number
        lastPosition?: number
        wordsRead?: number
        totalReadTime?: number
        wordsLookedUp?: string[]
      }
    }) => updateReadingProgress(userId, contentId, progress),
    onSuccess: (_, { contentId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reading.detail(contentId) })
    },
  })
}

export function useCompleteReading() {
  const queryClient = useQueryClient()
  const { userId } = useUser()

  return useMutation({
    mutationFn: ({ contentId, rating }: { contentId: string; rating?: number }) =>
      completeReading(userId, contentId, rating),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reading.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.hub.all })
    },
  })
}
