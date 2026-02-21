'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getFeaturedListening,
  getListeningById,
  getListeningContent,
  getListeningExercises,
  getListeningStats,
  getUserListeningHistory,
  getUserListeningStats,
  startListening,
  submitDictationAttempt,
  updateListeningProgress,
  type DictationMistake,
  type ListeningFilters,
} from '@/services/german-api'
import { useUser } from '@/providers/user-provider'
import { queryKeys } from './queryKeys'

export function useListeningContent(filters: ListeningFilters = {}) {
  return useQuery({
    queryKey: queryKeys.listening.list(filters),
    queryFn: () => getListeningContent(filters),
  })
}

export function useFeaturedListening(limit?: number) {
  return useQuery({
    queryKey: queryKeys.listening.featured(),
    queryFn: () => getFeaturedListening(limit),
    staleTime: 30 * 60 * 1000,
  })
}

export function useListeningById(id: string) {
  return useQuery({
    queryKey: queryKeys.listening.detail(id),
    queryFn: () => getListeningById(id),
    enabled: !!id,
  })
}

export function useListeningExercises(contentId: string) {
  return useQuery({
    queryKey: queryKeys.listening.exercises(contentId),
    queryFn: () => getListeningExercises(contentId),
    enabled: !!contentId,
  })
}

export function useListeningHistory() {
  const { userId } = useUser()

  return useQuery({
    queryKey: queryKeys.listening.history(userId),
    queryFn: () => getUserListeningHistory(userId),
    enabled: !!userId,
  })
}

export function useListeningStats() {
  const { userId } = useUser()

  return useQuery({
    queryKey: queryKeys.listening.stats(userId),
    queryFn: () => getUserListeningStats(userId),
    enabled: !!userId,
  })
}

export function useListeningContentStats() {
  return useQuery({
    queryKey: ['listening', 'content-stats'],
    queryFn: getListeningStats,
    staleTime: 5 * 60 * 1000,
  })
}

export function useStartListening() {
  const queryClient = useQueryClient()
  const { userId } = useUser()

  return useMutation({
    mutationFn: (contentId: string) => startListening(userId, contentId),
    onSuccess: (_, contentId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listening.detail(contentId) })
    },
  })
}

export function useUpdateListeningProgress() {
  const queryClient = useQueryClient()
  const { userId } = useUser()

  return useMutation({
    mutationFn: ({
      contentId,
      progress,
    }: {
      contentId: string
      progress: { totalListenTime?: number; lastPosition?: number; playCount?: number }
    }) => updateListeningProgress(userId, contentId, progress),
    onSuccess: (_, { contentId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listening.detail(contentId) })
    },
  })
}

export function useSubmitDictation() {
  const queryClient = useQueryClient()
  const { userId } = useUser()

  return useMutation({
    mutationFn: ({
      exerciseId,
      data,
    }: {
      exerciseId: string
      data: {
        userText: string
        accuracy: number
        wordsCorrect: number
        wordsTotal: number
        mistakes: DictationMistake[]
        listenCount: number
        timeSpent: number
      }
    }) => submitDictationAttempt(exerciseId, userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listening.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.hub.all })
    },
  })
}
