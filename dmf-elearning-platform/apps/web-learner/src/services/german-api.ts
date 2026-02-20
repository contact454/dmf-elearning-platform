/**
 * German Learning API Client
 * Connects to Learning Service (Port 3003) for vocabulary data
 */

const BASE_URL = process.env.NEXT_PUBLIC_LEARNING_API_URL || 'http://localhost:3003/api';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface VocabularyItem {
  word: string;
  pos: string;
  meaning_vi: string;
  source: string;
  addedAt: string;
}

export interface TopicData {
  topic: string;
  level: string;
  vocabulary: VocabularyItem[];
  count: number;
}

export interface LevelSummary {
  level: string;
  topicCount: number;
  topics: string[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

interface LevelsData {
  levels: string[];
  count: number;
}

interface TopicsData {
  level: string;
  topics: string[];
  count: number;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

export class GermanApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'GermanApiError';
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new GermanApiError(
      errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      errorData
    );
  }

  const json: ApiResponse<T> = await response.json();

  if (!json.success) {
    throw new GermanApiError(json.error || 'API request failed');
  }

  return json.data;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      return {
        Authorization: `Bearer ${session.access_token}`,
      };
    }
  } catch (error) {
    console.warn('Unable to read Supabase session for API auth:', error);
  }

  return {};
}

async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retries: number = 3
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const authHeaders = await getAuthHeaders();
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
          ...options.headers,
        },
      });

      return await handleResponse<T>(response);
    } catch (error) {
      lastError = error as Error;

      // Don't retry on client errors (4xx)
      if (error instanceof GermanApiError && error.statusCode && error.statusCode < 500) {
        throw error;
      }

      // Wait before retry (exponential backoff)
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt)));
      }
    }
  }

  throw new GermanApiError(
    `Failed after ${retries} attempts: ${lastError?.message}`,
    undefined,
    lastError
  );
}

// ============================================================================
// API CLIENT FUNCTIONS
// ============================================================================

/**
 * Get list of available CEFR levels (A1, A2, B1, B2, C1, C2)
 * @returns Array of level codes
 */
export async function getLevels(): Promise<string[]> {
  const data = await fetchWithRetry<LevelsData>(`${BASE_URL}/resources/levels`);
  return data.levels;
}

/**
 * Get list of topics for a specific level
 * @param level - CEFR level (A1, A2, B1, B2, C1, C2)
 * @returns Array of topic names
 */
export async function getTopics(level: string): Promise<string[]> {
  if (!level.match(/^[ABC][12]$/)) {
    throw new GermanApiError('Invalid level format. Must be A1, A2, B1, B2, C1, or C2', 400);
  }

  const data = await fetchWithRetry<TopicsData>(`${BASE_URL}/resources/${level}/topics`);
  return data.topics;
}

/**
 * Get vocabulary data for a specific level and topic
 * @param level - CEFR level
 * @param topic - Topic name
 * @returns Topic data with vocabulary list
 */
export async function getVocabulary(level: string, topic: string): Promise<TopicData> {
  if (!level.match(/^[ABC][12]$/)) {
    throw new GermanApiError('Invalid level format. Must be A1, A2, B1, B2, C1, or C2', 400);
  }

  return await fetchWithRetry<TopicData>(`${BASE_URL}/resources/${level}/${topic}`);
}

/**
 * Get summary statistics for a level
 * @param level - CEFR level
 * @returns Level summary with topic count
 */
export async function getLevelSummary(level: string): Promise<LevelSummary> {
  if (!level.match(/^[ABC][12]$/)) {
    throw new GermanApiError('Invalid level format. Must be A1, A2, B1, B2, C1, or C2', 400);
  }

  return await fetchWithRetry<LevelSummary>(`${BASE_URL}/resources/${level}/summary`);
}

/**
 * Clear server-side cache (admin only)
 * @param key - Optional cache key, omit to clear all cache
 */
export async function clearCache(key?: string): Promise<void> {
  await fetchWithRetry<{ success: boolean; message: string }>(
    `${BASE_URL}/resources/cache/clear`,
    {
      method: 'POST',
      body: JSON.stringify({ key }),
    }
  );
}

/**
 * Check if Learning Service is available
 * @returns true if service is online
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/health`, {
      method: 'GET',
      cache: 'no-cache',
    });
    return response.ok;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format topic name for display (convert underscores to spaces)
 * @param topic - Raw topic name from API
 * @returns Formatted topic name
 */
export function formatTopicName(topic: string): string {
  return topic.replace(/_/g, ' ');
}

/**
 * Get display name for CEFR level
 * @param level - CEFR level code
 * @returns Formatted level name
 */
export function getLevelDisplayName(level: string): string {
  const names: Record<string, string> = {
    A1: 'Beginner (A1)',
    A2: 'Elementary (A2)',
    B1: 'Intermediate (B1)',
    B2: 'Upper Intermediate (B2)',
    C1: 'Advanced (C1)',
    C2: 'Proficient (C2)',
  };
  return names[level] || level;
}

/**
 * Get color theme for level (for UI styling)
 * @param level - CEFR level code
 * @returns Tailwind color class
 */
export function getLevelColor(level: string): string {
  const colors: Record<string, string> = {
    A1: 'emerald',
    A2: 'green',
    B1: 'blue',
    B2: 'indigo',
    C1: 'purple',
    C2: 'pink',
  };
  return colors[level] || 'gray';
}

// ============================================================================
// DATABASE-BACKED VOCABULARY API (NEW)
// ============================================================================

export interface DbVocabularyItem {
  id: string;
  word: string;
  meaning_vi: string;
  level: string;
  topic: string | null;
  example_de: string | null;
  example_vi: string | null;
  pos: string | null;
  artikel: string | null;  // der, die, das
  plural: string | null;   // plural form
  gender: string | null;   // m, f, n
  createdAt: string;
  updatedAt: string;
}

export interface VocabularyStats {
  total: number;
  byLevel: { level: string; count: number }[];
  byPos: { pos: string; count: number }[];
  byTopic: { topic: string; count: number }[];
}

export interface VocabularyListResponse {
  items: DbVocabularyItem[];
  total: number;
}

export interface VocabularyFilters {
  level?: string;
  topic?: string;
  pos?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Get vocabulary list with filters (database-backed)
 */
export async function getDbVocabulary(filters: VocabularyFilters = {}): Promise<{ items: DbVocabularyItem[]; total: number }> {
  const params = new URLSearchParams();
  if (filters.level) params.append('level', filters.level);
  if (filters.topic) params.append('topic', filters.topic);
  if (filters.pos) params.append('pos', filters.pos);
  if (filters.search) params.append('search', filters.search);
  if (filters.limit) params.append('limit', String(filters.limit));
  if (filters.offset) params.append('offset', String(filters.offset));

  const response = await fetchWithRetry<{ items: DbVocabularyItem[]; total: number }>(
    `${BASE_URL}/vocabulary?${params.toString()}`
  );
  return { items: response.items || response, total: response.total || 0 };
}

/**
 * Get random vocabulary for flashcard practice (database-backed)
 */
export async function getRandomVocabulary(count: number = 10, level?: string): Promise<DbVocabularyItem[]> {
  const params = new URLSearchParams({ count: String(count) });
  if (level) params.append('level', level);

  return await fetchWithRetry<DbVocabularyItem[]>(`${BASE_URL}/vocabulary/random?${params.toString()}`);
}

/**
 * Get vocabulary statistics (database-backed)
 */
export async function getVocabularyStats(): Promise<VocabularyStats> {
  return await fetchWithRetry<VocabularyStats>(`${BASE_URL}/vocabulary/stats`);
}

/**
 * Get available levels from database
 */
export async function getDbLevels(): Promise<string[]> {
  return await fetchWithRetry<string[]>(`${BASE_URL}/vocabulary/levels`);
}

/**
 * Get vocabulary by word (database-backed)
 */
export async function getVocabularyByWord(word: string): Promise<DbVocabularyItem> {
  return await fetchWithRetry<DbVocabularyItem>(`${BASE_URL}/vocabulary/word/${encodeURIComponent(word)}`);
}

// ============================================================================
// SRS (SPACED REPETITION SYSTEM) API
// ============================================================================

export interface UserVocabularyProgress {
  id: string;
  userId: string;
  vocabId: string;
  status: 'new' | 'learning' | 'review' | 'mastered';
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewAt: string | null;
  lastReviewedAt: string | null;
  totalReviews: number;
  correctReviews: number;
  lapseCount: number;
}

export interface VocabularyWithProgress extends DbVocabularyItem {
  progress: UserVocabularyProgress | null;
}

export interface UserProgressStats {
  totalCards: number;
  newCards: number;
  learningCards: number;
  reviewCards: number;
  masteredCards: number;
  dueToday: number;
  averageEaseFactor: number;
  averageRetention: number;
  streak: number;
  lastReviewDate: string | null;
}

export type SRSRating = 0 | 1 | 2 | 3; // 0=Again, 1=Hard, 2=Good, 3=Easy

/**
 * Get vocabulary cards due for review
 * @param userId - User ID
 * @param limit - Maximum number of cards to fetch (default: 20)
 * @param level - Optional CEFR level filter
 */
export async function getDueCards(
  userId: string,
  limit: number = 20,
  level?: string
): Promise<VocabularyWithProgress[]> {
  const params = new URLSearchParams({ userId, limit: String(limit) });
  if (level) params.append('level', level);

  return await fetchWithRetry<VocabularyWithProgress[]>(
    `${BASE_URL}/vocabulary/srs/due?${params.toString()}`
  );
}

/**
 * Submit a review and update SRS parameters
 * @param userId - User ID
 * @param vocabId - Vocabulary item ID
 * @param rating - Rating (0=Again, 1=Hard, 2=Good, 3=Easy)
 */
export async function submitReview(
  userId: string,
  vocabId: string,
  rating: SRSRating
): Promise<UserVocabularyProgress> {
  return await fetchWithRetry<UserVocabularyProgress>(
    `${BASE_URL}/vocabulary/srs/review`,
    {
      method: 'POST',
      body: JSON.stringify({ userId, vocabId, rating }),
    }
  );
}

/**
 * Get user's learning progress statistics
 * @param userId - User ID
 */
export async function getUserProgress(userId: string): Promise<UserProgressStats> {
  return await fetchWithRetry<UserProgressStats>(
    `${BASE_URL}/vocabulary/srs/progress/${encodeURIComponent(userId)}`
  );
}

/**
 * Get vocabulary with user progress
 * @param userId - User ID
 * @param filters - Vocabulary filters
 */
export async function getVocabularyWithProgress(
  userId: string,
  filters: VocabularyFilters = {}
): Promise<{ items: VocabularyWithProgress[]; total: number }> {
  const params = new URLSearchParams({ userId });
  if (filters.level) params.append('level', filters.level);
  if (filters.topic) params.append('topic', filters.topic);
  if (filters.pos) params.append('pos', filters.pos);
  if (filters.search) params.append('search', filters.search);
  if (filters.limit) params.append('limit', String(filters.limit));
  if (filters.offset) params.append('offset', String(filters.offset));

  return await fetchWithRetry<{ items: VocabularyWithProgress[]; total: number }>(
    `${BASE_URL}/vocabulary/with-progress?${params.toString()}`
  );
}

/**
 * Get rating display info
 */
export function getRatingInfo(rating: SRSRating): { label: string; color: string; description: string } {
  const ratings = {
    0: { label: 'Again', color: 'red', description: 'Complete blackout' },
    1: { label: 'Hard', color: 'orange', description: 'Incorrect but remembered' },
    2: { label: 'Good', color: 'blue', description: 'Correct with hesitation' },
    3: { label: 'Easy', color: 'green', description: 'Perfect recall' },
  };
  return ratings[rating];
}

/**
 * Get status display info
 */
export function getStatusInfo(status: string): { label: string; color: string } {
  const statuses: Record<string, { label: string; color: string }> = {
    new: { label: 'New', color: 'gray' },
    learning: { label: 'Learning', color: 'blue' },
    review: { label: 'Review', color: 'yellow' },
    mastered: { label: 'Mastered', color: 'green' },
  };
  return statuses[status] || { label: status, color: 'gray' };
}

// ============================================================================
// SMART LIBRARY - READING API
// ============================================================================

export interface ReadingContent {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  level: string;
  topic: string | null;
  wordCount: number;
  uniqueWords: number;
  difficultyScore: number;
  vocabularyList: string[];
  source: string | null;
  author: string | null;
  imageUrl: string | null;
  audioUrl: string | null;
  estimatedTime: number;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReadingProgress {
  id: string;
  userId: string;
  contentId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progressPercent: number;
  lastPosition: number;
  wordsRead: number;
  newWordsFound: number;
  wordsLookedUp: string[];
  totalReadTime: number;
  startedAt: string | null;
  completedAt: string | null;
  rating: number | null;
}

export interface ContentAnalysis {
  totalWords: number;
  uniqueWords: number;
  vocabularyList: string[];
  knownWords: string[];
  unknownWords: string[];
  knownPercentage: number;
  unknownPercentage: number;
  difficultyScore: number;
  suitability: 'too_easy' | 'optimal' | 'too_hard';
  estimatedReadingTime: number;
  levelDistribution: Record<string, number>;
}

export interface ReadingWithAnalysis extends ReadingContent {
  userProgress?: ReadingProgress | null;
  analysis?: ContentAnalysis | null;
}

export interface ReadingStats {
  totalContent: number;
  byLevel: { level: string; count: number }[];
  byTopic: { topic: string; count: number }[];
  totalWordsRead: number;
  completedCount: number;
}

export interface UserReadingStats {
  totalRead: number;
  completed: number;
  inProgress: number;
  totalWords: number;
  totalTime: number;
  wordsLearned: number;
}

export interface ReadingVocabularySaveResult {
  vocabularyId: string;
  word: string;
  passageId: string;
  addedToSRS: boolean;
  nextReviewAt: string;
  status: 'NEW' | 'LEARNING' | 'REVIEW' | 'MASTERED';
  message: string;
}

export interface ReadingFilters {
  level?: string;
  topic?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Get reading content list with filters
 */
export async function getReadingContent(
  filters: ReadingFilters = {}
): Promise<{ items: ReadingContent[]; total: number }> {
  const params = new URLSearchParams();
  if (filters.level) params.append('level', filters.level);
  if (filters.topic) params.append('topic', filters.topic);
  if (filters.search) params.append('search', filters.search);
  if (filters.limit) params.append('limit', String(filters.limit));
  if (filters.offset) params.append('offset', String(filters.offset));

  return await fetchWithRetry<{ items: ReadingContent[]; total: number }>(
    `${BASE_URL}/reading?${params.toString()}`
  );
}

/**
 * Get recommended reading content for user (i+1 filtered)
 */
export async function getRecommendedReading(
  userId: string,
  limit: number = 10
): Promise<ReadingContent[]> {
  const params = new URLSearchParams({ userId, limit: String(limit) });
  return await fetchWithRetry<ReadingContent[]>(
    `${BASE_URL}/reading/recommended?${params.toString()}`
  );
}

/**
 * Get featured reading content
 */
export async function getFeaturedReading(limit: number = 5): Promise<ReadingContent[]> {
  return await fetchWithRetry<ReadingContent[]>(
    `${BASE_URL}/reading/featured?limit=${limit}`
  );
}

/**
 * Get reading content by ID with optional user analysis
 */
export async function getReadingById(
  id: string,
  userId?: string
): Promise<ReadingWithAnalysis> {
  const params = userId ? `?userId=${userId}` : '';
  return await fetchWithRetry<ReadingWithAnalysis>(
    `${BASE_URL}/reading/${id}${params}`
  );
}

/**
 * Get reading statistics
 */
export async function getReadingStats(): Promise<ReadingStats> {
  return await fetchWithRetry<ReadingStats>(`${BASE_URL}/reading/stats`);
}

/**
 * Get available reading levels
 */
export async function getReadingLevels(): Promise<string[]> {
  return await fetchWithRetry<string[]>(`${BASE_URL}/reading/levels`);
}

/**
 * Get available reading topics
 */
export async function getReadingTopics(level?: string): Promise<string[]> {
  const params = level ? `?level=${level}` : '';
  return await fetchWithRetry<string[]>(`${BASE_URL}/reading/topics${params}`);
}

/**
 * Start reading content
 */
export async function startReading(
  userId: string,
  contentId: string
): Promise<ReadingProgress> {
  return await fetchWithRetry<ReadingProgress>(
    `${BASE_URL}/reading/${contentId}/start`,
    {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }
  );
}

/**
 * Update reading progress
 */
export async function updateReadingProgress(
  userId: string,
  contentId: string,
  data: {
    progressPercent?: number;
    lastPosition?: number;
    wordsRead?: number;
    totalReadTime?: number;
    wordsLookedUp?: string[];
  }
): Promise<ReadingProgress> {
  return await fetchWithRetry<ReadingProgress>(
    `${BASE_URL}/reading/${contentId}/progress`,
    {
      method: 'PUT',
      body: JSON.stringify({ userId, ...data }),
    }
  );
}

/**
 * Mark reading as completed
 */
export async function completeReading(
  userId: string,
  contentId: string,
  rating?: number
): Promise<ReadingProgress> {
  return await fetchWithRetry<ReadingProgress>(
    `${BASE_URL}/reading/${contentId}/complete`,
    {
      method: 'POST',
      body: JSON.stringify({ userId, rating }),
    }
  );
}

/**
 * Save clicked vocabulary from reading passage into SRS queue
 */
export async function saveReadingVocabulary(
  userId: string,
  data: {
    passageId: string;
    word: string;
    translation: string;
    context?: string;
    sentence?: string;
  }
): Promise<ReadingVocabularySaveResult> {
  return await fetchWithRetry<ReadingVocabularySaveResult>(
    `${BASE_URL}/reading/vocabulary/save`,
    {
      method: 'POST',
      body: JSON.stringify({ userId, ...data }),
    }
  );
}

/**
 * Get user's reading history
 */
export async function getUserReadingHistory(
  userId: string,
  status?: 'not_started' | 'in_progress' | 'completed'
): Promise<Array<ReadingProgress & { content: ReadingContent }>> {
  const params = status ? `?status=${status}` : '';
  return await fetchWithRetry<Array<ReadingProgress & { content: ReadingContent }>>(
    `${BASE_URL}/reading/user/${userId}/history${params}`
  );
}

/**
 * Get user's reading statistics
 */
export async function getUserReadingStats(userId: string): Promise<UserReadingStats> {
  return await fetchWithRetry<UserReadingStats>(
    `${BASE_URL}/reading/user/${userId}/stats`
  );
}

/**
 * Generate new reading content using AI
 */
export async function generateReadingContent(options: {
  level: string;
  topic: string;
  targetWordCount?: number;
  style?: 'story' | 'article' | 'dialogue' | 'description';
}): Promise<{ id: string }> {
  return await fetchWithRetry<{ id: string }>(
    `${BASE_URL}/reading/generate`,
    {
      method: 'POST',
      body: JSON.stringify(options),
    }
  );
}

// ============================================================================
// LISTENING LAB - LISTENING API
// ============================================================================

export interface ListeningContent {
  id: string;
  title: string;
  description: string | null;
  level: string;
  topic: string | null;
  audioUrl: string | null;
  duration: number;
  transcript: string;
  transcriptVi: string | null;
  segments: TranscriptSegment[] | null;
  source: string | null;
  speaker: string | null;
  wordCount: number;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
  textVi?: string;
}

export interface DictationExercise {
  id: string;
  contentId: string;
  exerciseType: 'full' | 'segment' | 'fill_blank';
  segmentIndex: number | null;
  audioStart: number;
  audioEnd: number | null;
  correctText: string;
  hints: string[];
  difficulty: number;
  createdAt: string;
}

export interface DictationAttempt {
  id: string;
  exerciseId: string;
  userId: string;
  userText: string;
  accuracy: number;
  wordsCorrect: number;
  wordsTotal: number;
  mistakes: DictationMistake[] | null;
  listenCount: number;
  timeSpent: number;
  createdAt: string;
}

export interface DictationMistake {
  expected: string;
  actual: string;
  position: number;
  type: 'missing' | 'extra' | 'wrong';
}

export interface ListeningProgress {
  id: string;
  userId: string;
  contentId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  totalListenTime: number;
  lastPosition: number;
  playCount: number;
  exercisesCompleted: number;
  exercisesTotal: number;
  averageAccuracy: number;
  startedAt: string | null;
  completedAt: string | null;
}

export interface ListeningWithProgress extends ListeningContent {
  userProgress?: ListeningProgress | null;
  exerciseCount?: number;
}

export interface ListeningStats {
  totalContent: number;
  byLevel: { level: string; count: number }[];
  totalDuration: number;
}

export interface UserListeningStats {
  totalListened: number;
  completed: number;
  inProgress: number;
  totalTime: number;
  averageAccuracy: number;
}

export interface ListeningFilters {
  level?: string;
  topic?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Get listening content list with filters
 */
export async function getListeningContent(
  filters: ListeningFilters = {}
): Promise<{ items: ListeningContent[]; total: number }> {
  const params = new URLSearchParams();
  if (filters.level) params.append('level', filters.level);
  if (filters.topic) params.append('topic', filters.topic);
  if (filters.search) params.append('search', filters.search);
  if (filters.limit) params.append('limit', String(filters.limit));
  if (filters.offset) params.append('offset', String(filters.offset));

  return await fetchWithRetry<{ items: ListeningContent[]; total: number }>(
    `${BASE_URL}/listening?${params.toString()}`
  );
}

/**
 * Get featured listening content
 */
export async function getFeaturedListening(limit: number = 5): Promise<ListeningContent[]> {
  return await fetchWithRetry<ListeningContent[]>(
    `${BASE_URL}/listening/featured?limit=${limit}`
  );
}

/**
 * Get listening content by ID with optional user progress
 */
export async function getListeningById(
  id: string,
  userId?: string
): Promise<ListeningWithProgress> {
  const params = userId ? `?userId=${userId}` : '';
  return await fetchWithRetry<ListeningWithProgress>(
    `${BASE_URL}/listening/${id}${params}`
  );
}

/**
 * Get listening statistics
 */
export async function getListeningStats(): Promise<ListeningStats> {
  return await fetchWithRetry<ListeningStats>(`${BASE_URL}/listening/stats`);
}

/**
 * Get available listening levels
 */
export async function getListeningLevels(): Promise<string[]> {
  return await fetchWithRetry<string[]>(`${BASE_URL}/listening/levels`);
}

/**
 * Get exercises for a listening content
 */
export async function getListeningExercises(contentId: string): Promise<DictationExercise[]> {
  return await fetchWithRetry<DictationExercise[]>(
    `${BASE_URL}/listening/${contentId}/exercises`
  );
}

/**
 * Get single exercise by ID
 */
export async function getExerciseById(exerciseId: string): Promise<DictationExercise> {
  return await fetchWithRetry<DictationExercise>(
    `${BASE_URL}/listening/exercise/${exerciseId}`
  );
}

/**
 * Submit dictation attempt
 */
export async function submitDictationAttempt(
  exerciseId: string,
  userId: string,
  data: {
    userText: string;
    accuracy: number;
    wordsCorrect: number;
    wordsTotal: number;
    mistakes: DictationMistake[];
    listenCount: number;
    timeSpent: number;
  }
): Promise<DictationAttempt> {
  return await fetchWithRetry<DictationAttempt>(
    `${BASE_URL}/listening/exercise/${exerciseId}/attempt`,
    {
      method: 'POST',
      body: JSON.stringify({ userId, ...data }),
    }
  );
}

/**
 * Start listening content
 */
export async function startListening(
  userId: string,
  contentId: string
): Promise<ListeningProgress> {
  return await fetchWithRetry<ListeningProgress>(
    `${BASE_URL}/listening/${contentId}/start`,
    {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }
  );
}

/**
 * Update listening progress
 */
export async function updateListeningProgress(
  userId: string,
  contentId: string,
  data: {
    totalListenTime?: number;
    lastPosition?: number;
    playCount?: number;
  }
): Promise<ListeningProgress> {
  return await fetchWithRetry<ListeningProgress>(
    `${BASE_URL}/listening/${contentId}/progress`,
    {
      method: 'PUT',
      body: JSON.stringify({ userId, ...data }),
    }
  );
}

/**
 * Get user's listening history
 */
export async function getUserListeningHistory(
  userId: string,
  status?: 'not_started' | 'in_progress' | 'completed'
): Promise<Array<ListeningProgress & { content: ListeningContent }>> {
  const params = status ? `?status=${status}` : '';
  return await fetchWithRetry<Array<ListeningProgress & { content: ListeningContent }>>(
    `${BASE_URL}/listening/user/${userId}/history${params}`
  );
}

/**
 * Get user's listening statistics
 */
export async function getUserListeningStats(userId: string): Promise<UserListeningStats> {
  return await fetchWithRetry<UserListeningStats>(
    `${BASE_URL}/listening/user/${userId}/stats`
  );
}

/**
 * Generate exercises from content segments
 */
export async function generateListeningExercises(
  contentId: string
): Promise<DictationExercise[]> {
  return await fetchWithRetry<DictationExercise[]>(
    `${BASE_URL}/listening/${contentId}/exercises/generate`,
    { method: 'POST' }
  );
}

// ============================================================================
// SPEAKING STUDIO - SPEAKING API
// ============================================================================

export interface SpeakingPrompt {
  id: string;
  title: string;
  description: string | null;
  level: string;
  topic: string | null;
  category: string;
  promptText: string;
  promptTextVi: string | null;
  sampleResponse: string | null;
  sampleAudioUrl: string | null;
  targetWords: string[];
  phonetics: string[];
  difficulty: number;
  estimatedTime: number;
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SpeakingAttempt {
  id: string;
  promptId: string;
  userId: string;
  audioUrl: string | null;
  audioDuration: number;
  transcript: string | null;
  pronunciationScore: number;
  fluencyScore: number;
  accuracyScore: number;
  overallScore: number;
  wordScores: WordScore[] | null;
  feedback: string | null;
  corrections: SpeakingCorrection[] | null;
  recordingTime: number;
  attemptNumber: number;
  createdAt: string;
}

export interface WordScore {
  word: string;
  userWord: string;
  score: number;
  isCorrect: boolean;
}

export interface SpeakingCorrection {
  word: string;
  correction: string;
  explanation: string;
}

export interface SpeakingProgress {
  id: string;
  userId: string;
  promptId: string;
  status: 'not_started' | 'attempted' | 'mastered';
  attemptCount: number;
  bestScore: number;
  lastScore: number;
  avgPronunciation: number;
  avgFluency: number;
  avgAccuracy: number;
  firstAttemptAt: string | null;
  lastAttemptAt: string | null;
}

export interface SpeakingWithProgress extends SpeakingPrompt {
  userProgress?: SpeakingProgress | null;
  attemptCount?: number;
}

export interface SpeakingStats {
  totalPrompts: number;
  byLevel: { level: string; count: number }[];
  byCategory: { category: string; count: number }[];
}

export interface UserSpeakingStats {
  totalAttempts: number;
  promptsAttempted: number;
  promptsMastered: number;
  averageScore: number;
  totalPracticeTime: number;
}

export interface SpeakingFilters {
  level?: string;
  category?: string;
  topic?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Get speaking prompts with filters
 */
export async function getSpeakingPrompts(
  filters: SpeakingFilters = {}
): Promise<{ items: SpeakingPrompt[]; total: number }> {
  const params = new URLSearchParams();
  if (filters.level) params.append('level', filters.level);
  if (filters.category) params.append('category', filters.category);
  if (filters.topic) params.append('topic', filters.topic);
  if (filters.search) params.append('search', filters.search);
  if (filters.limit) params.append('limit', String(filters.limit));
  if (filters.offset) params.append('offset', String(filters.offset));

  return await fetchWithRetry<{ items: SpeakingPrompt[]; total: number }>(
    `${BASE_URL}/speaking?${params.toString()}`
  );
}

/**
 * Get featured speaking prompts
 */
export async function getFeaturedSpeaking(limit: number = 5): Promise<SpeakingPrompt[]> {
  return await fetchWithRetry<SpeakingPrompt[]>(
    `${BASE_URL}/speaking/featured?limit=${limit}`
  );
}

/**
 * Get speaking prompt by ID with optional user progress
 */
export async function getSpeakingById(
  id: string,
  userId?: string
): Promise<SpeakingWithProgress> {
  const params = userId ? `?userId=${userId}` : '';
  return await fetchWithRetry<SpeakingWithProgress>(
    `${BASE_URL}/speaking/${id}${params}`
  );
}

/**
 * Get speaking statistics
 */
export async function getSpeakingStats(): Promise<SpeakingStats> {
  return await fetchWithRetry<SpeakingStats>(`${BASE_URL}/speaking/stats`);
}

/**
 * Get available speaking levels
 */
export async function getSpeakingLevels(): Promise<string[]> {
  return await fetchWithRetry<string[]>(`${BASE_URL}/speaking/levels`);
}

/**
 * Get available speaking categories
 */
export async function getSpeakingCategories(): Promise<string[]> {
  return await fetchWithRetry<string[]>(`${BASE_URL}/speaking/categories`);
}

/**
 * Submit speaking attempt
 */
export async function submitSpeakingAttempt(
  promptId: string,
  userId: string,
  data: {
    transcript: string;
    audioUrl?: string;
    audioDuration?: number;
    recordingTime?: number;
  }
): Promise<SpeakingAttempt> {
  return await fetchWithRetry<SpeakingAttempt>(
    `${BASE_URL}/speaking/${promptId}/attempt`,
    {
      method: 'POST',
      body: JSON.stringify({ userId, ...data }),
    }
  );
}

/**
 * Get user's attempts for a prompt
 */
export async function getSpeakingAttempts(
  promptId: string,
  userId: string
): Promise<SpeakingAttempt[]> {
  return await fetchWithRetry<SpeakingAttempt[]>(
    `${BASE_URL}/speaking/${promptId}/attempts?userId=${userId}`
  );
}

/**
 * Get user's speaking history
 */
export async function getUserSpeakingHistory(
  userId: string,
  status?: 'not_started' | 'attempted' | 'mastered'
): Promise<Array<SpeakingProgress & { prompt: SpeakingPrompt }>> {
  const params = status ? `?status=${status}` : '';
  return await fetchWithRetry<Array<SpeakingProgress & { prompt: SpeakingPrompt }>>(
    `${BASE_URL}/speaking/user/${userId}/history${params}`
  );
}

/**
 * Get user's speaking statistics
 */
export async function getUserSpeakingStats(userId: string): Promise<UserSpeakingStats> {
  return await fetchWithRetry<UserSpeakingStats>(
    `${BASE_URL}/speaking/user/${userId}/stats`
  );
}

// ============================================================================
// WRITING WORKSHOP - WRITING API
// ============================================================================

export interface WritingPrompt {
  id: string;
  title: string;
  description: string | null;
  level: string;
  topic: string | null;
  category: string;
  promptText: string;
  promptTextVi: string | null;
  instructions: string | null;
  instructionsVi: string | null;
  templateText: string | null;
  correctAnswers: Record<string, unknown> | null;
  hints: string[];
  keywords: string[];
  wordLimit: number | null;
  minWords: number;
  sampleResponse: string | null;
  sampleResponseVi: string | null;
  grammarPoints: string[];
  vocabularyFocus: string[];
  difficulty: number;
  estimatedTime: number;
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WritingSubmission {
  id: string;
  promptId: string;
  userId: string;
  content: string;
  wordCount: number;
  answers: Record<string, unknown> | null;
  overallScore: number;
  grammarScore: number;
  vocabularyScore: number;
  coherenceScore: number;
  taskScore: number;
  feedback: string | null;
  feedbackVi: string | null;
  corrections: WritingCorrection[] | null;
  suggestions: WritingSuggestion[] | null;
  grammarErrors: GrammarError[] | null;
  keywordsUsed: string[];
  keywordsMissing: string[];
  requirementsMet: Record<string, unknown> | null;
  timeSpent: number;
  submissionNum: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface WritingCorrection {
  original: string;
  corrected: string;
  explanation: string;
  explanationVi: string;
  type: 'grammar' | 'spelling' | 'vocabulary' | 'style';
}

export interface WritingSuggestion {
  suggestion: string;
  suggestionVi: string;
  category: 'vocabulary' | 'structure' | 'expression' | 'clarity';
}

export interface GrammarError {
  text: string;
  error: string;
  rule: string;
  correction: string;
  position: number;
}

export interface WritingProgress {
  id: string;
  userId: string;
  promptId: string;
  status: string;
  submissionCount: number;
  bestScore: number;
  lastScore: number;
  avgGrammarScore: number;
  avgVocabularyScore: number;
  avgCoherenceScore: number;
  avgTaskScore: number;
  totalWordsWritten: number;
  totalTimeSpent: number;
  draftContent: string | null;
  draftUpdatedAt: string | null;
  firstSubmissionAt: string | null;
  lastSubmissionAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WritingWithProgress extends WritingPrompt {
  userProgress?: WritingProgress | null;
  submissionCount?: number;
}

export interface WritingFilters {
  level?: string;
  category?: string;
  topic?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface WritingStats {
  totalPrompts: number;
  byLevel: { level: string; count: number }[];
  byCategory: { category: string; count: number }[];
}

export interface UserWritingStats {
  totalSubmissions: number;
  promptsAttempted: number;
  promptsMastered: number;
  averageScore: number;
  totalWordsWritten: number;
  totalTimeSpent: number;
}

// ----------------------------------------------------------------------------
// Writing Content Functions
// ----------------------------------------------------------------------------

/**
 * Get writing prompts with filters
 */
export async function getWritingPrompts(
  filters: WritingFilters = {}
): Promise<{ items: WritingPrompt[]; total: number }> {
  const params = new URLSearchParams();
  if (filters.level) params.append('level', filters.level);
  if (filters.category) params.append('category', filters.category);
  if (filters.topic) params.append('topic', filters.topic);
  if (filters.search) params.append('search', filters.search);
  if (filters.limit) params.append('limit', String(filters.limit));
  if (filters.offset) params.append('offset', String(filters.offset));

  try {
    const url = `${BASE_URL}/writing?${params.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new GermanApiError(`HTTP ${response.status}: ${response.statusText}`, response.status);
    }

    const json = await response.json();
    if (!json.success) {
      throw new GermanApiError(json.error || 'API request failed');
    }

    return {
      items: json.data || [],
      total: json.pagination?.total || 0,
    };
  } catch (error) {
    if (error instanceof GermanApiError) throw error;
    console.error('getWritingPrompts fetch error:', error);
    throw new GermanApiError(
      error instanceof Error ? error.message : 'Failed to fetch writing prompts',
      undefined,
      error
    );
  }
}

/**
 * Get featured writing prompts
 */
export async function getFeaturedWriting(limit: number = 5): Promise<WritingPrompt[]> {
  return await fetchWithRetry<WritingPrompt[]>(
    `${BASE_URL}/writing/featured?limit=${limit}`
  );
}

/**
 * Get writing statistics
 */
export async function getWritingStats(): Promise<WritingStats> {
  return await fetchWithRetry<WritingStats>(`${BASE_URL}/writing/stats`);
}

/**
 * Get available writing levels
 */
export async function getWritingLevels(): Promise<string[]> {
  return await fetchWithRetry<string[]>(`${BASE_URL}/writing/levels`);
}

/**
 * Get available writing categories
 */
export async function getWritingCategories(): Promise<string[]> {
  return await fetchWithRetry<string[]>(`${BASE_URL}/writing/categories`);
}

/**
 * Get single writing prompt by ID
 */
export async function getWritingById(id: string, userId?: string): Promise<WritingWithProgress> {
  const params = userId ? `?userId=${userId}` : '';
  return await fetchWithRetry<WritingWithProgress>(
    `${BASE_URL}/writing/${id}${params}`
  );
}

// ----------------------------------------------------------------------------
// Writing Submission Functions
// ----------------------------------------------------------------------------

/**
 * Submit writing for evaluation
 */
export async function submitWriting(
  promptId: string,
  userId: string,
  data: {
    content: string;
    answers?: Record<string, unknown>;
    timeSpent?: number;
  }
): Promise<WritingSubmission> {
  return await fetchWithRetry<WritingSubmission>(
    `${BASE_URL}/writing/${promptId}/submit`,
    {
      method: 'POST',
      body: JSON.stringify({ userId, ...data }),
    }
  );
}

/**
 * Get user's submissions for a prompt
 */
export async function getWritingSubmissions(
  promptId: string,
  userId: string
): Promise<WritingSubmission[]> {
  return await fetchWithRetry<WritingSubmission[]>(
    `${BASE_URL}/writing/${promptId}/submissions?userId=${userId}`
  );
}

// ----------------------------------------------------------------------------
// Draft Functions
// ----------------------------------------------------------------------------

/**
 * Save writing draft
 */
export async function saveWritingDraft(
  promptId: string,
  userId: string,
  content: string
): Promise<WritingProgress> {
  return await fetchWithRetry<WritingProgress>(
    `${BASE_URL}/writing/${promptId}/draft`,
    {
      method: 'POST',
      body: JSON.stringify({ userId, content }),
    }
  );
}

/**
 * Get writing draft
 */
export async function getWritingDraft(
  promptId: string,
  userId: string
): Promise<{ content: string | null }> {
  return await fetchWithRetry<{ content: string | null }>(
    `${BASE_URL}/writing/${promptId}/draft?userId=${userId}`
  );
}

// ----------------------------------------------------------------------------
// User Progress Functions
// ----------------------------------------------------------------------------

/**
 * Get user's writing history
 */
export async function getUserWritingHistory(
  userId: string,
  status?: 'not_started' | 'in_progress' | 'completed' | 'mastered'
): Promise<Array<WritingProgress & { prompt: WritingPrompt }>> {
  const params = status ? `?status=${status}` : '';
  return await fetchWithRetry<Array<WritingProgress & { prompt: WritingPrompt }>>(
    `${BASE_URL}/writing/user/${userId}/history${params}`
  );
}

/**
 * Get user's writing statistics
 */
export async function getUserWritingStats(userId: string): Promise<UserWritingStats> {
  return await fetchWithRetry<UserWritingStats>(
    `${BASE_URL}/writing/user/${userId}/stats`
  );
}

/**
 * Seed sample writing prompts (development only)
 */
export async function seedWritingPrompts(): Promise<{ count: number }> {
  return await fetchWithRetry<{ count: number }>(
    `${BASE_URL}/writing/seed`,
    { method: 'POST' }
  );
}

// ============================================================================
// LEARNING HUB API
// ============================================================================

// ----------------------------------------------------------------------------
// Hub Types
// ----------------------------------------------------------------------------

export interface SkillProgress {
  skill: string;
  level: string;
  progress: number;
  itemsLearned: number;
  itemsTotal: number;
  lastPracticed: string | null;
  streak: number;
}

export interface DailyGoal {
  type: 'vocabulary' | 'reading' | 'listening' | 'speaking' | 'writing';
  target: number;
  completed: number;
  unit: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export interface RecommendedActivity {
  type: string;
  title: string;
  reason: string;
  link: string;
}

export interface HubData {
  userId: string;
  overallLevel: string;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  skillProgress: SkillProgress[];
  dailyGoals: DailyGoal[];
  recentAchievements: Achievement[];
  recommendedActivity: RecommendedActivity;
}

// ----------------------------------------------------------------------------
// Hub Functions
// ----------------------------------------------------------------------------

/**
 * Get comprehensive hub data for a user
 */
export async function getHubData(userId: string): Promise<HubData> {
  return await fetchWithRetry<HubData>(`${BASE_URL}/hub/${userId}`);
}

/**
 * Get skill progress for a user
 */
export async function getSkillProgress(userId: string): Promise<SkillProgress[]> {
  return await fetchWithRetry<SkillProgress[]>(`${BASE_URL}/hub/${userId}/skills`);
}

/**
 * Get daily goals with progress
 */
export async function getDailyGoals(userId: string): Promise<DailyGoal[]> {
  return await fetchWithRetry<DailyGoal[]>(`${BASE_URL}/hub/${userId}/daily-goals`);
}

/**
 * Get recommended next activity
 */
export async function getRecommendation(userId: string): Promise<RecommendedActivity> {
  return await fetchWithRetry<RecommendedActivity>(`${BASE_URL}/hub/${userId}/recommendation`);
}

// ============================================================================
// LEADERBOARD
// ============================================================================

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  totalPoints: number;
  level: string;
  streak: number;
  badges: number;
  weeklyPoints?: number;
  monthlyPoints?: number;
  isCurrentUser?: boolean;
}

export interface LeaderboardStats {
  totalUsers: number;
  averagePoints: number;
  topLevel: string;
  highestStreak: number;
}

export type LeaderboardTimeframe = 'weekly' | 'monthly' | 'all-time';
export type LeaderboardScope = 'global' | 'level' | 'module';

export interface LeaderboardFilters {
  timeframe?: LeaderboardTimeframe;
  scope?: LeaderboardScope;
  level?: string;
  module?: 'vocabulary' | 'reading' | 'listening' | 'speaking' | 'writing' | 'grammar';
  limit?: number;
  offset?: number;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  currentUser?: LeaderboardEntry;
  stats: LeaderboardStats;
  total: number;
  timeframe: LeaderboardTimeframe;
  scope: LeaderboardScope;
}

// ----------------------------------------------------------------------------
// Leaderboard Functions
// ----------------------------------------------------------------------------

/**
 * Get leaderboard data with filters
 */
export async function getLeaderboard(
  userId: string,
  filters: LeaderboardFilters = {}
): Promise<LeaderboardResponse> {
  const params = new URLSearchParams();
  
  if (filters.timeframe) params.append('timeframe', filters.timeframe);
  if (filters.scope) params.append('scope', filters.scope);
  if (filters.level) params.append('level', filters.level);
  if (filters.module) params.append('module', filters.module);
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.offset) params.append('offset', filters.offset.toString());
  
  const url = `${BASE_URL}/leaderboard/${userId}?${params.toString()}`;
  return await fetchWithRetry<LeaderboardResponse>(url);
}

/**
 * Get user's rank in different categories
 */
export async function getUserRankings(userId: string): Promise<{
  global: number;
  weekly: number;
  monthly: number;
  byLevel: Record<string, number>;
  byModule: Record<string, number>;
}> {
  return await fetchWithRetry(`${BASE_URL}/leaderboard/${userId}/rankings`);
}

/**
 * Get leaderboard stats
 */
export async function getLeaderboardStats(
  timeframe: LeaderboardTimeframe = 'all-time'
): Promise<LeaderboardStats> {
  return await fetchWithRetry<LeaderboardStats>(
    `${BASE_URL}/leaderboard/stats?timeframe=${timeframe}`
  );
}
