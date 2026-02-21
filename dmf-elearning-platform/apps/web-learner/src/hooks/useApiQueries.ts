'use client'

export { queryKeys } from './queryKeys'

export {
  useLevels,
  useTopics,
  useVocabulary,
  useDbVocabulary,
  useRandomVocabulary,
  useVocabularyStats,
  useDueCards,
  useUserProgress,
  useVocabularyWithProgress,
  useSubmitReview,
} from './useVocabularySrsQueries'

export {
  useReadingContent,
  useRecommendedReading,
  useFeaturedReading,
  useReadingById,
  useReadingHistory,
  useReadingStats,
  useReadingContentStats,
  useStartReading,
  useUpdateReadingProgress,
  useCompleteReading,
} from './useReadingLearningQueries'

export {
  useListeningContent,
  useFeaturedListening,
  useListeningById,
  useListeningExercises,
  useListeningHistory,
  useListeningStats,
  useListeningContentStats,
  useStartListening,
  useUpdateListeningProgress,
  useSubmitDictation,
} from './useListeningLearningQueries'

export {
  useSpeakingPrompts,
  useFeaturedSpeaking,
  useSpeakingById,
  useSpeakingAttempts,
  useSpeakingHistory,
  useSpeakingStats,
  useSpeakingContentStats,
  useSubmitSpeaking,
} from './useSpeakingLearningQueries'

export {
  useWritingPrompts,
  useFeaturedWriting,
  useWritingById,
  useWritingSubmissions,
  useWritingDraft,
  useWritingHistory,
  useWritingStats,
  useWritingContentStats,
  useSubmitWriting,
  useSaveWritingDraft,
} from './useWritingLearningQueries'

export {
  useHubData,
  useSkillProgress,
  useDailyGoals,
  useUpdateDailyGoals,
  useRecommendation,
} from './useHubQueries'

export {
  useLeaderboard,
  useUserRankings,
  useLeaderboardStats,
} from './useLeaderboardQueries'
