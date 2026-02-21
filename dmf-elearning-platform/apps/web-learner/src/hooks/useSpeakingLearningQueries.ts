'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getFeaturedSpeaking,
  getSpeakingAttempts,
  getSpeakingById,
  getSpeakingPrompts,
  getSpeakingStats,
  getUserSpeakingHistory,
  getUserSpeakingStats,
  submitSpeakingAttempt,
  type SpeakingFilters,
} from '@/services/german-api'
import { useUser } from '@/providers/user-provider'
import { queryKeys } from './queryKeys'

export function useSpeakingPrompts(filters: SpeakingFilters = {}) {
  return useQuery({
    queryKey: queryKeys.speaking.list(filters),
    queryFn: () => getSpeakingPrompts(filters),
  })
}

export function useFeaturedSpeaking(limit?: number) {
  return useQuery({
    queryKey: queryKeys.speaking.featured(),
    queryFn: () => getFeaturedSpeaking(limit),
    staleTime: 30 * 60 * 1000,
  })
}

export function useSpeakingById(id: string) {
  return useQuery({
    queryKey: queryKeys.speaking.detail(id),
    queryFn: () => getSpeakingById(id),
    enabled: !!id,
  })
}

export function useSpeakingAttempts(promptId: string) {
  const { userId } = useUser()

  return useQuery({
    queryKey: queryKeys.speaking.attempts(promptId, userId),
    queryFn: () => getSpeakingAttempts(promptId, userId),
    enabled: !!promptId && !!userId,
  })
}

export function useSpeakingHistory() {
  const { userId } = useUser()

  return useQuery({
    queryKey: queryKeys.speaking.history(userId),
    queryFn: () => getUserSpeakingHistory(userId),
    enabled: !!userId,
  })
}

export function useSpeakingStats() {
  const { userId } = useUser()

  return useQuery({
    queryKey: queryKeys.speaking.stats(userId),
    queryFn: () => getUserSpeakingStats(userId),
    enabled: !!userId,
  })
}

export function useSpeakingContentStats() {
  return useQuery({
    queryKey: ['speaking', 'content-stats'],
    queryFn: getSpeakingStats,
    staleTime: 5 * 60 * 1000,
  })
}

export function useSubmitSpeaking() {
  const queryClient = useQueryClient()
  const { userId } = useUser()

  return useMutation({
    mutationFn: ({
      promptId,
      data,
    }: {
      promptId: string
      data: { transcript: string; audioUrl?: string; audioDuration?: number; recordingTime?: number }
    }) => submitSpeakingAttempt(promptId, userId, data),
    onSuccess: (_, { promptId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.speaking.attempts(promptId, userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.speaking.history(userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.hub.all })
    },
  })
}
