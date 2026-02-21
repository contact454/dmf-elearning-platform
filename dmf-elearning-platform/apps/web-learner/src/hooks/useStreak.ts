import { useQuery } from '@tanstack/react-query'

interface StreakData {
  currentStreak: number
  longestStreak: number
  isActiveToday: boolean
  nextMilestone: number | null
  daysUntilMilestone: number | null
}

export function useStreak() {
  return useQuery({
    queryKey: ['streak'],
    queryFn: async (): Promise<StreakData> => {
      const response = await fetch('/api/user/streak')
      
      if (!response.ok) throw new Error('Failed to fetch streak')
      
      const json = await response.json()
      return json.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true
  })
}
