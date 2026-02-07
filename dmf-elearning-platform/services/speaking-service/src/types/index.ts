import { Request } from 'express';

// Extend Express Request to include authenticated user
export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

// Speech Analysis Results
export interface TranscriptResult {
  text: string;
  confidence?: number;
  duration?: number;
  language?: string;
}

export interface PronunciationAnalysis {
  word: string;
  phoneme?: string;
  expectedPronunciation?: string;
  actualPronunciation?: string;
  accuracyScore: number;
  feedbackText?: string;
  timestampMs?: number;
}

export interface SpeechAnalysisResult {
  transcriptText: string;
  overallScore: number;
  pronunciationScore: number;
  fluencyScore: number;
  vocabularyScore: number;
  grammarScore: number;
  aiFeedback: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    detailedFeedback: string;
  };
  pronunciationFeedback?: PronunciationAnalysis[];
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Evaluation Criteria Structure (from DB schema)
export interface EvaluationCriteria {
  pronunciation: {
    weight: number;
    description: string;
  };
  fluency: {
    weight: number;
    description: string;
  };
  vocabulary: {
    weight: number;
    description: string;
  };
  grammar: {
    weight: number;
    description: string;
  };
}
