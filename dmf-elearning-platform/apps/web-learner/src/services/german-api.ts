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

async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retries: number = 3
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
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
