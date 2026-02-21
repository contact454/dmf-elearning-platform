import type {
  LeaderboardFilters,
  LeaderboardTimeframe,
  ListeningFilters,
  ReadingFilters,
  SRSRating,
  SpeakingFilters,
  VocabularyFilters,
  WritingFilters,
} from '@/services/german-api'

export const queryKeys = {
  vocabulary: {
    all: ['vocabulary'] as const,
    levels: () => [...queryKeys.vocabulary.all, 'levels'] as const,
    topics: (level: string) => [...queryKeys.vocabulary.all, 'topics', level] as const,
    list: (filters: VocabularyFilters) => [...queryKeys.vocabulary.all, 'list', filters] as const,
    random: (count: number, level?: string) => [...queryKeys.vocabulary.all, 'random', count, level] as const,
    stats: () => [...queryKeys.vocabulary.all, 'stats'] as const,
    byWord: (word: string) => [...queryKeys.vocabulary.all, 'word', word] as const,
  },
  srs: {
    all: ['srs'] as const,
    due: (userId: string, level?: string) => [...queryKeys.srs.all, 'due', userId, level] as const,
    progress: (userId: string) => [...queryKeys.srs.all, 'progress', userId] as const,
    withProgress: (userId: string, filters: VocabularyFilters) =>
      [...queryKeys.srs.all, 'withProgress', userId, filters] as const,
  },
  reading: {
    all: ['reading'] as const,
    list: (filters: ReadingFilters) => [...queryKeys.reading.all, 'list', filters] as const,
    recommended: (userId: string) => [...queryKeys.reading.all, 'recommended', userId] as const,
    featured: () => [...queryKeys.reading.all, 'featured'] as const,
    detail: (id: string, userId?: string) => [...queryKeys.reading.all, 'detail', id, userId] as const,
    history: (userId: string, status?: string) => [...queryKeys.reading.all, 'history', userId, status] as const,
    stats: (userId: string) => [...queryKeys.reading.all, 'stats', userId] as const,
  },
  listening: {
    all: ['listening'] as const,
    list: (filters: ListeningFilters) => [...queryKeys.listening.all, 'list', filters] as const,
    featured: () => [...queryKeys.listening.all, 'featured'] as const,
    detail: (id: string) => [...queryKeys.listening.all, 'detail', id] as const,
    exercises: (contentId: string) => [...queryKeys.listening.all, 'exercises', contentId] as const,
    history: (userId: string) => [...queryKeys.listening.all, 'history', userId] as const,
    stats: (userId: string) => [...queryKeys.listening.all, 'stats', userId] as const,
  },
  speaking: {
    all: ['speaking'] as const,
    list: (filters: SpeakingFilters) => [...queryKeys.speaking.all, 'list', filters] as const,
    featured: () => [...queryKeys.speaking.all, 'featured'] as const,
    detail: (id: string) => [...queryKeys.speaking.all, 'detail', id] as const,
    attempts: (promptId: string, userId: string) => [...queryKeys.speaking.all, 'attempts', promptId, userId] as const,
    history: (userId: string) => [...queryKeys.speaking.all, 'history', userId] as const,
    stats: (userId: string) => [...queryKeys.speaking.all, 'stats', userId] as const,
  },
  writing: {
    all: ['writing'] as const,
    list: (filters: WritingFilters) => [...queryKeys.writing.all, 'list', filters] as const,
    featured: () => [...queryKeys.writing.all, 'featured'] as const,
    detail: (id: string) => [...queryKeys.writing.all, 'detail', id] as const,
    submissions: (promptId: string, userId: string) => [...queryKeys.writing.all, 'submissions', promptId, userId] as const,
    draft: (promptId: string, userId: string) => [...queryKeys.writing.all, 'draft', promptId, userId] as const,
    history: (userId: string) => [...queryKeys.writing.all, 'history', userId] as const,
    stats: (userId: string) => [...queryKeys.writing.all, 'stats', userId] as const,
  },
  hub: {
    all: ['hub'] as const,
    data: (userId: string) => [...queryKeys.hub.all, 'data', userId] as const,
    skills: (userId: string) => [...queryKeys.hub.all, 'skills', userId] as const,
    dailyGoals: (userId: string) => [...queryKeys.hub.all, 'dailyGoals', userId] as const,
    recommendation: (userId: string) => [...queryKeys.hub.all, 'recommendation', userId] as const,
  },
  leaderboard: {
    all: ['leaderboard'] as const,
    list: (userId: string, filters: LeaderboardFilters) =>
      [...queryKeys.leaderboard.all, 'list', userId, filters] as const,
    rankings: (userId: string) =>
      [...queryKeys.leaderboard.all, 'rankings', userId] as const,
    stats: (timeframe: LeaderboardTimeframe) =>
      [...queryKeys.leaderboard.all, 'stats', timeframe] as const,
  },
}

export type ReviewQueueApiItem = {
  id: string
  status: 'NEW' | 'LEARNING' | 'REVIEW' | 'MASTERED'
  easeFactor: number
  intervalDays: number
  repetitions: number
  nextReview: string
  word: {
    id: string
    word: string
    meaning_vi: string
    level: string
    topic?: string | null
    example_de?: string | null
    example_vi?: string | null
    pos?: string | null
    artikel?: string | null
    plural?: string | null
    gender?: string | null
    audioUrl?: string | null
    phoneticIpa?: string | null
    familyWords?: string[]
    grammarTags?: string[]
    source?: string | null
    addedAt?: string | null
    createdAt?: string
    updatedAt?: string
  }
}

export type ReviewQueueResponse = {
  success?: boolean
  data?: {
    words?: ReviewQueueApiItem[]
  }
}

export function mapSrsRatingToQuality(rating: SRSRating): 1 | 3 | 4 | 5 {
  const qualityMap: Record<SRSRating, 1 | 3 | 4 | 5> = {
    0: 1,
    1: 3,
    2: 4,
    3: 5,
  }
  return qualityMap[rating]
}
