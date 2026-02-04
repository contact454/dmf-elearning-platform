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
