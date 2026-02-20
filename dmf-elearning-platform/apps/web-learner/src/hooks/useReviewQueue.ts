import { useQuery } from '@tanstack/react-query'

export interface ReviewQueueItem {
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
    phoneticIpa?: string
  }
}

type ReviewQueueApiItem = {
  id: string
  easeFactor: number
  intervalDays: number
  repetitions: number
  nextReview: string
  status: 'NEW' | 'LEARNING' | 'REVIEW' | 'MASTERED'
  word: {
    id: string
    word: string
    meaning_vi: string
    level: 'A1' | 'A2' | 'B1' | 'B2'
    pos?: string | null
    example_de?: string | null
    example_vi?: string | null
    audioUrl?: string | null
    phoneticIpa?: string | null
  }
}

type ReviewQueueResponse = {
  success: boolean
  data?: {
    words?: ReviewQueueApiItem[]
  }
}

export function useReviewQueue() {
  return useQuery({
    queryKey: ['reviewQueue'],
    queryFn: async (): Promise<ReviewQueueItem[]> => {
      const response = await fetch('/api/review/queue')
      
      if (!response.ok) {
        throw new Error('Failed to fetch review queue')
      }
      
      const json = (await response.json()) as ReviewQueueResponse | ReviewQueueApiItem[]
      const rows = Array.isArray(json) ? json : json.data?.words || []

      return rows.map((item) => ({
        id: item.id,
        easeFactor: item.easeFactor,
        intervalDays: item.intervalDays,
        repetitions: item.repetitions,
        nextReview: item.nextReview,
        status: item.status,
        word: {
          id: item.word.id,
          word: item.word.word,
          translation: item.word.meaning_vi,
          level: item.word.level,
          wordType: item.word.pos || 'unknown',
          exampleSentence: item.word.example_de || undefined,
          exampleTranslation: item.word.example_vi || undefined,
          audioUrl: item.word.audioUrl || undefined,
          phoneticIpa: item.word.phoneticIpa || undefined,
        },
      }))
    },
    staleTime: 30 * 1000, // 30 seconds
    retry: 2
  })
}
