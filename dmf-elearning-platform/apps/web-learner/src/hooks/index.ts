// Browser API hooks
export { useSpeaking } from './useSpeaking';
export { useAudioPlayer, useTTS } from './useAudioPlayer';
export { useSpeechRecognition, useAudioRecording, calculateSimilarity } from './useSpeechRecognition';

// React Query hooks for API calls
export {
  // Query keys
  queryKeys,
  // Vocabulary
  useLevels,
  useTopics,
  useVocabulary,
  useDbVocabulary,
  useRandomVocabulary,
  useVocabularyStats,
  // SRS
  useDueCards,
  useUserProgress,
  useVocabularyWithProgress,
  useSubmitReview,
  // Reading
  useReadingContent,
  useRecommendedReading,
  useFeaturedReading,
  useReadingById,
  useReadingHistory,
  useReadingStats,
  useStartReading,
  useUpdateReadingProgress,
  useCompleteReading,
  // Listening
  useListeningContent,
  useFeaturedListening,
  useListeningById,
  useListeningExercises,
  useListeningHistory,
  useListeningStats,
  useStartListening,
  useUpdateListeningProgress,
  useSubmitDictation,
  // Speaking
  useSpeakingPrompts,
  useFeaturedSpeaking,
  useSpeakingById,
  useSpeakingAttempts,
  useSpeakingHistory,
  useSpeakingStats,
  useSubmitSpeaking,
  // Writing
  useWritingPrompts,
  useFeaturedWriting,
  useWritingById,
  useWritingSubmissions,
  useWritingDraft,
  useWritingHistory,
  useWritingStats,
  useSubmitWriting,
  useSaveWritingDraft,
  // Hub
  useHubData,
  useSkillProgress,
  useDailyGoals,
  useRecommendation,
} from './useApiQueries';

// Challenge hooks
export {
  useDailyChallenge,
  useChallengeHistory,
  useStreakInfo,
  useLeaderboard,
  useSubmitChallenge,
  useStartChallenge,
} from './useChallengeQueries';

// Challenge types
export type {
  DailyChallenge,
  ChallengeQuestion,
  ChallengeHistory,
  StreakInfo,
  LeaderboardEntry,
  ChallengeSubmission,
  ChallengeResult,
} from './useChallengeQueries';

// Writing Module hooks (Phase 1)
export {
  usePrompts,
  usePrompt,
  useEssays,
  useEssay,
  useCreateEssay,
  useUpdateEssay,
  useDeleteEssay,
  useGrammarCheck,
  useWritingAnalytics,
} from './useWriting';

export { useDebouncedGrammarCheck } from './useDebouncedGrammarCheck';
export { useAutoSave } from './useAutoSave';

// Writing Module types
export type {
  Prompt,
  Essay,
  GrammarError,
  GrammarCheckResponse,
  WritingStats,
} from './useWriting';
