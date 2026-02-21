'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getDbVocabulary,
  getLevels,
  getRandomVocabulary,
  getTopics,
  getUserProgress,
  getVocabulary,
  getVocabularyStats,
  getVocabularyWithProgress,
  type SRSRating,
  type VocabularyFilters,
} from '@/services/german-api'
import { useUser } from '@/providers/user-provider'
import { mapSrsRatingToQuality, queryKeys, type ReviewQueueResponse } from './queryKeys'

export function useLevels() {
  return useQuery({
    queryKey: queryKeys.vocabulary.levels(),
    queryFn: getLevels,
    staleTime: 60 * 60 * 1000,
  })
}

export function useTopics(level: string) {
  return useQuery({
    queryKey: queryKeys.vocabulary.topics(level),
    queryFn: () => getTopics(level),
    enabled: !!level,
    staleTime: 30 * 60 * 1000,
  })
}

export function useVocabulary(level: string, topic: string) {
  return useQuery({
    queryKey: ['vocabulary', 'topic', level, topic],
    queryFn: () => getVocabulary(level, topic),
    enabled: !!level && !!topic,
  })
}

export function useDbVocabulary(filters: VocabularyFilters = {}) {
  return useQuery({
    queryKey: queryKeys.vocabulary.list(filters),
    queryFn: () => getDbVocabulary(filters),
  })
}

export function useRandomVocabulary(count: number = 10, level?: string) {
  return useQuery({
    queryKey: queryKeys.vocabulary.random(count, level),
    queryFn: () => getRandomVocabulary(count, level),
    staleTime: 0,
  })
}

export function useVocabularyStats() {
  return useQuery({
    queryKey: queryKeys.vocabulary.stats(),
    queryFn: getVocabularyStats,
    staleTime: 5 * 60 * 1000,
  })
}

export function useDueCards(limit: number = 20, level?: string) {
  const { userId } = useUser()

  return useQuery({
    queryKey: queryKeys.srs.due(userId, level),
    queryFn: async () => {
      const response = await fetch('/api/review/queue')
      if (!response.ok) {
        throw new Error('Failed to fetch review queue')
      }

      const json = (await response.json()) as ReviewQueueResponse
      const words = json.data?.words ?? []

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
        }))
    },
    enabled: !!userId,
  })
}

export function useUserProgress() {
  const { userId } = useUser()

  return useQuery({
    queryKey: queryKeys.srs.progress(userId),
    queryFn: () => getUserProgress(userId),
    enabled: !!userId,
  })
}

export function useVocabularyWithProgress(filters: VocabularyFilters = {}) {
  const { userId } = useUser()

  return useQuery({
    queryKey: queryKeys.srs.withProgress(userId, filters),
    queryFn: () => getVocabularyWithProgress(userId, filters),
    enabled: !!userId,
  })
}

export function useSubmitReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ vocabId, rating }: { vocabId: string; rating: SRSRating }) => {
      const quality = mapSrsRatingToQuality(rating)
      const response = await fetch('/api/review/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wordId: vocabId, quality }),
      })

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}))
        throw new Error(errorPayload?.error || 'Failed to submit review')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.srs.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.hub.all })
    },
  })
}
