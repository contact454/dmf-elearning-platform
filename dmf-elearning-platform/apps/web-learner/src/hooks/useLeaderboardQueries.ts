'use client'

import { useQuery } from '@tanstack/react-query'
import {
  getLeaderboard,
  getLeaderboardStats,
  getUserRankings,
  type LeaderboardFilters,
  type LeaderboardTimeframe,
} from '@/services/german-api'
import { useUser } from '@/providers/user-provider'
import { queryKeys } from './queryKeys'

export function useLeaderboard(filters: LeaderboardFilters = {}) {
  const { userId } = useUser()

  return useQuery({
    queryKey: queryKeys.leaderboard.list(userId, filters),
    queryFn: () => getLeaderboard(userId, filters),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useUserRankings() {
  const { userId } = useUser()

  return useQuery({
    queryKey: queryKeys.leaderboard.rankings(userId),
    queryFn: () => getUserRankings(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useLeaderboardStats(timeframe: LeaderboardTimeframe = 'all-time') {
  return useQuery({
    queryKey: queryKeys.leaderboard.stats(timeframe),
    queryFn: () => getLeaderboardStats(timeframe),
    staleTime: 5 * 60 * 1000,
  })
}
