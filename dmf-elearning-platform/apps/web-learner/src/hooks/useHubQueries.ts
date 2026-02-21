'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getDailyGoals,
  getHubData,
  getRecommendation,
  getSkillProgress,
  updateDailyGoals as updateDailyGoalsRequest,
} from '@/services/german-api'
import { useUser } from '@/providers/user-provider'
import { queryKeys } from './queryKeys'

export function useHubData() {
  const { userId } = useUser()

  return useQuery({
    queryKey: queryKeys.hub.data(userId),
    queryFn: () => getHubData(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useSkillProgress() {
  const { userId } = useUser()

  return useQuery({
    queryKey: queryKeys.hub.skills(userId),
    queryFn: () => getSkillProgress(userId),
    enabled: !!userId,
  })
}

export function useDailyGoals() {
  const { userId } = useUser()

  return useQuery({
    queryKey: queryKeys.hub.dailyGoals(userId),
    queryFn: () => getDailyGoals(userId),
    enabled: !!userId,
    staleTime: 60 * 1000,
  })
}

export function useUpdateDailyGoals() {
  const queryClient = useQueryClient()
  const { userId } = useUser()

  return useMutation({
    mutationFn: (updates: { vocabulary?: number; reading?: number; listening?: number }) =>
      updateDailyGoalsRequest(userId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hub.all })
    },
  })
}

export function useRecommendation() {
  const { userId } = useUser()

  return useQuery({
    queryKey: queryKeys.hub.recommendation(userId),
    queryFn: () => getRecommendation(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}
