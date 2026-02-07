/**
 * Reading Module API Client
 * Connects to Reading Service for passages, exercises, and progress
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Passage {
  id: string;
  title: string;
  content: string;
  cefrLevel: string;
  topic: string;
  wordCount: number;
  estimatedReadingTimeMinutes: number;
  difficultyScore?: number;
  isPremium: boolean;
  createdAt: string;
  exercises?: Exercise[];
}

export interface Exercise {
  id: string;
  passageId: string;
  exerciseType: 'multiple_choice' | 'true_false' | 'fill_blank' | 'sequencing';
  question: string;
  exerciseData: ExerciseData;
  explanation?: string;
  difficultyLevel: number;
  displayOrder: number;
}

export type ExerciseData =
  | MultipleChoiceData
  | TrueFalseData
  | FillBlankData
  | SequencingData;

export interface MultipleChoiceData {
  options: string[];
  correct_index: number;
}

export interface TrueFalseData {
  statement: string;
  is_true: boolean;
}

export interface FillBlankData {
  sentence: string;
  correct_answer: string;
  alternatives?: string[];
  word_bank?: string[];
}

export interface SequencingData {
  sentences: Array<{ id: string; text: string }>;
  correct_order: string[];
}

export interface PassageListResponse {
  passages: Passage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PassageFilters {
  cefr?: string;
  topic?: string;
  page?: number;
  limit?: number;
  sort?: 'difficulty_asc' | 'difficulty_desc' | 'created_desc';
}

export interface UserProgress {
  completedAt: string | null;
  totalExercises: number;
  correctExercises: number;
  accuracyPercentage: number;
  timeSpentSeconds: number;
  reviewCount?: number;
  nextReviewAt?: string | null;
}

export interface SubmitAnswerRequest {
  passageId: string;
  exerciseId: string;
  userAnswer: UserAnswer;
  timeSpentSeconds: number;
}

export type UserAnswer =
  | { selected_index: number }
  | { answer: boolean }
  | { answer: string }
  | { order: string[] };

export interface SubmitAnswerResponse {
  attemptId: string;
  isCorrect: boolean;
  accuracyScore: number;
  correctAnswer: ExerciseData;
  explanation?: string;
  xpEarned: number;
}

export interface ProgressStats {
  passagesCompleted: number;
  accuracyByLevel: Array<{
    level: string;
    averageAccuracy: number;
    attempts: number;
  }>;
  totalTimeSpentMinutes: number;
  recentAttempts: number;
  streak: {
    current: number;
    longest: number;
  };
}

export interface VocabularyDefinition {
  word: string;
  definition: string;
  translationVi?: string;
  pronunciation?: string;
  audioUrl?: string;
  exampleSentence?: string;
  partOfSpeech?: string;
}

export interface SaveVocabularyRequest {
  word: string;
  passageId: string;
  context?: string;
}

export interface SaveVocabularyResponse {
  message: string;
  vocabulary: {
    id: string;
    word: string;
    definition: string;
    translationVi?: string;
    pronunciation?: string;
    exampleSentence?: string;
    status: 'new' | 'learning' | 'known';
    nextReviewAt: string;
  };
}

export interface VocabularyStatus {
  status: 'new' | 'learning' | 'known' | null;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

export class ReadingApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ReadingApiError';
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      // Response body is not JSON, use default error message
    }
    
    throw new ReadingApiError(errorMessage, response.status);
  }

  const data = await response.json();
  return data;
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
      if (error instanceof ReadingApiError && error.statusCode && error.statusCode < 500) {
        throw error;
      }

      // Wait before retry (exponential backoff)
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt)));
      }
    }
  }

  throw new ReadingApiError(
    `Failed after ${retries} attempts: ${lastError?.message}`,
    undefined,
    lastError
  );
}

// ============================================================================
// API CLIENT FUNCTIONS
// ============================================================================

/**
 * Get list of reading passages with filtering and pagination
 */
export async function getPassages(filters: PassageFilters = {}): Promise<PassageListResponse> {
  const params = new URLSearchParams();
  
  if (filters.cefr) params.append('cefr', filters.cefr);
  if (filters.topic) params.append('topic', filters.topic);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.sort) params.append('sort', filters.sort);

  const url = `${BASE_URL}/api/reading/passages${params.toString() ? `?${params.toString()}` : ''}`;
  return fetchWithRetry<PassageListResponse>(url);
}

/**
 * Get single passage with exercises and user progress
 */
export async function getPassageById(id: string): Promise<{
  passage: Passage;
  userProgress: UserProgress;
}> {
  const url = `${BASE_URL}/api/reading/passages/${id}`;
  return fetchWithRetry(url);
}

/**
 * Submit exercise answer and get validation
 */
export async function submitAnswer(
  data: SubmitAnswerRequest
): Promise<SubmitAnswerResponse> {
  const url = `${BASE_URL}/api/reading/submit`;
  return fetchWithRetry(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Get user's reading progress statistics
 */
export async function getProgress(): Promise<ProgressStats> {
  const url = `${BASE_URL}/api/reading/progress`;
  return fetchWithRetry(url);
}

/**
 * Get vocabulary definition for a word
 */
export async function getVocabularyDefinition(word: string): Promise<VocabularyDefinition> {
  const url = `${BASE_URL}/api/vocabulary/definition?word=${encodeURIComponent(word)}`;
  return fetchWithRetry(url);
}

/**
 * Get vocabulary status (new/learning/known)
 */
export async function getVocabularyStatus(word: string): Promise<VocabularyStatus> {
  const url = `${BASE_URL}/api/vocabulary/status?word=${encodeURIComponent(word)}`;
  return fetchWithRetry(url);
}

/**
 * Save word to user's vocabulary
 */
export async function saveVocabulary(
  data: SaveVocabularyRequest
): Promise<SaveVocabularyResponse> {
  const url = `${BASE_URL}/api/vocabulary/save`;
  return fetchWithRetry(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
