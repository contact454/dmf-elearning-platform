import { useQuery } from '@tanstack/react-query'

interface ReviewWord {
  id: string
  easeFactor: number
  intervalDays: number
  repetitions: number
  nextReview: string
  status: 'NEW' | 'LEARNING' | 'REVIEW' | 'MASTERED'
  word: {
    id: string
    word: string
    translation: string
    level: 'A1' | 'A2' | 'B1' | 'B2'
    wordType: string
    exampleSentence?: string
    exampleTranslation?: string
    audioUrl?: string
  }
}

export function useReviewQueue() {
  return useQuery({
    queryKey: ['reviewQueue'],
    queryFn: async (): Promise<ReviewWord[]> => {
      const response = await fetch('/api/review/queue', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch review queue')
      }
      
      const json = await response.json()
      // Handle both formats: direct array or wrapped in data.words
      return Array.isArray(json) ? json : json.data?.words || []
    },
    staleTime: 30 * 1000, // 30 seconds
    retry: 2
  })
}
