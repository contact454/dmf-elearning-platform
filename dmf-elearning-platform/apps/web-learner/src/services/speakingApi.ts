/**
 * Speaking Module - API Client
 * Axios instance configured for Speaking Service endpoints
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  clearBrowserAuthState,
  getBrowserAuthToken,
  redirectToLoginIfBrowser,
} from '@/lib/api/auth-client';
import type {
  SpeakingPrompt,
  PromptsResponse,
  PromptsQueryParams,
  SpeakingSubmission,
  SubmissionsResponse,
  SubmissionsQueryParams,
  CreateSubmissionRequest,
  TranscriptionResponse,
  AnalyzeSpeechRequest,
  ProgressStats,
  WeaknessesResponse,
  ApiError,
} from '@/types/speaking';

const SPEAKING_API_URL = process.env.NEXT_PUBLIC_SPEAKING_API_URL || 'http://localhost:3002';

// ============================================
// SPEAKING API CLIENT INSTANCE
// ============================================

export const speakingApi = axios.create({
  baseURL: SPEAKING_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60s for speech analysis
});

// ============================================
// REQUEST INTERCEPTOR (JWT Authentication)
// ============================================

speakingApi.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined' && config.headers) {
      const token = await getBrowserAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR (Error Handling)
// ============================================

speakingApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      clearBrowserAuthState();
      redirectToLoginIfBrowser();
    }

    // Handle 429 Rate Limit
    if (error.response?.status === 429) {
      console.error('Rate limit exceeded. Please try again later.');
    }

    // Network errors
    if (!error.response) {
      console.error('Network error:', error.message);
    }

    return Promise.reject(error);
  }
);

// ============================================
// PROMPTS API
// ============================================

export const promptsApi = {
  /**
   * List all prompts with pagination and filters
   */
  list: async (params?: PromptsQueryParams): Promise<PromptsResponse> => {
    const response = await speakingApi.get<PromptsResponse>('/api/prompts', { params });
    return response.data;
  },

  /**
   * Get single prompt by ID
   */
  getById: async (id: string): Promise<SpeakingPrompt> => {
    const response = await speakingApi.get<SpeakingPrompt>(`/api/prompts/${id}`);
    return response.data;
  },

  /**
   * Get random prompt by CEFR level
   */
  getRandom: async (cefr: string): Promise<SpeakingPrompt> => {
    const response = await speakingApi.get<SpeakingPrompt>('/api/prompts/random', {
      params: { cefr },
    });
    return response.data;
  },
};

// ============================================
// SUBMISSIONS API
// ============================================

export const submissionsApi = {
  /**
   * Create new submission
   */
  create: async (data: CreateSubmissionRequest): Promise<SpeakingSubmission> => {
    const response = await speakingApi.post<SpeakingSubmission>('/api/submissions', data);
    return response.data;
  },

  /**
   * List user's submissions
   */
  list: async (params?: SubmissionsQueryParams): Promise<SubmissionsResponse> => {
    const response = await speakingApi.get<SubmissionsResponse>('/api/submissions', { params });
    return response.data;
  },

  /**
   * Get single submission by ID
   */
  getById: async (id: string): Promise<SpeakingSubmission> => {
    const response = await speakingApi.get<SpeakingSubmission>(`/api/submissions/${id}`);
    return response.data;
  },

  /**
   * Delete submission
   */
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await speakingApi.delete<{ message: string }>(`/api/submissions/${id}`);
    return response.data;
  },
};

// ============================================
// SPEECH ANALYSIS API
// ============================================

export const analysisApi = {
  /**
   * Transcribe audio to text (Whisper STT)
   */
  transcribe: async (audioFile: File): Promise<TranscriptionResponse> => {
    const formData = new FormData();
    formData.append('audio', audioFile);

    const response = await speakingApi.post<TranscriptionResponse>(
      '/api/analyze/transcript',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes for large audio files
      }
    );
    return response.data;
  },

  /**
   * Analyze speech and provide AI feedback
   */
  analyzeSpeech: async (submissionId: string): Promise<SpeakingSubmission> => {
    const response = await speakingApi.post<SpeakingSubmission>(
      '/api/analyze/speech',
      { submissionId },
      {
        timeout: 120000, // 2 minutes for AI analysis
      }
    );
    return response.data;
  },
};

// ============================================
// ANALYTICS API
// ============================================

export const analyticsApi = {
  /**
   * Get user's speaking progress stats
   */
  getProgress: async (): Promise<ProgressStats> => {
    const response = await speakingApi.get<ProgressStats>('/api/analytics/progress');
    return response.data;
  },

  /**
   * Get pronunciation weaknesses
   */
  getWeaknesses: async (limit = 20): Promise<WeaknessesResponse> => {
    const response = await speakingApi.get<WeaknessesResponse>('/api/analytics/weaknesses', {
      params: { limit },
    });
    return response.data;
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Upload audio blob to storage and return URL
 * (In production, this would upload to S3/Cloud Storage)
 */
export async function uploadAudioBlob(blob: Blob, filename: string): Promise<string> {
  // For now, create a local URL
  // In production, implement actual file upload to cloud storage
  const localUrl = URL.createObjectURL(blob);
  
  // TODO: Implement actual upload logic
  // const formData = new FormData();
  // formData.append('audio', blob, filename);
  // const response = await speakingApi.post('/api/upload', formData);
  // return response.data.url;
  
  return localUrl;
}

/**
 * Convert blob to File object
 */
export function blobToFile(blob: Blob, filename: string): File {
  return new File([blob], filename, { type: blob.type });
}

/**
 * Format duration from seconds to MM:SS
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculate speaking rate (words per minute)
 */
export function calculateWPM(wordCount: number, durationSeconds: number): number {
  if (durationSeconds === 0) return 0;
  return Math.round((wordCount / durationSeconds) * 60);
}

/**
 * Get score color based on value
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
}

/**
 * Get score label
 */
export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Very Good';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 50) return 'Needs Improvement';
  return 'Poor';
}
