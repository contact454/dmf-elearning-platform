// Speaking Module Types

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface SpeakingPrompt {
  id: string;
  question: string;
  cefrLevel: CEFRLevel;
  topic: string;
  preparationTimeSeconds: number;
  speakingTimeSeconds: number;
  evaluationCriteria: string[];
  tips?: string[];
  createdAt: string;
}

export interface PronunciationFeedback {
  word: string;
  expectedIPA: string;
  actualIPA: string;
  accuracyScore: number; // 0-100
  feedback: string;
  audioSnippetUrl?: string;
  position: {
    start: number; // seconds
    end: number;
  };
}

export interface SpeakingScores {
  overall: number; // 0-100
  pronunciation: number; // 0-100
  fluency: number; // 0-100
  vocabulary: number; // 0-100
  grammar: number; // 0-100
}

export interface SpeakingFeedback {
  scores: SpeakingScores;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  pronunciationDetails: PronunciationFeedback[];
  transcription?: string;
  durationSeconds: number;
}

export interface SpeakingSubmission {
  id: string;
  userId: string;
  promptId: string;
  audioUrl: string;
  durationSeconds: number;
  feedback?: SpeakingFeedback;
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  prompt?: SpeakingPrompt;
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number; // seconds
  audioBlob: Blob | null;
  audioUrl: string | null;
  error: string | null;
}

export interface SpeakingStats {
  totalSubmissions: number;
  averageOverallScore: number;
  averagePronunciation: number;
  averageFluency: number;
  averageVocabulary: number;
  averageGrammar: number;
  mostCommonIssues: string[];
  cefrDistribution: Record<CEFRLevel, number>;
  scoreHistory: {
    date: string;
    overall: number;
  }[];
}

export interface AudioVisualizationData {
  frequencyData: Uint8Array;
  timeDomainData: Uint8Array;
  volume: number; // 0-100
}

// API Query/Response Types
export interface PromptsQueryParams {
  cefr?: CEFRLevel;
  topic?: string;
  limit?: number;
  offset?: number;
  search?: string;
}

export interface PromptsResponse {
  items: SpeakingPrompt[];
  total: number;
  hasMore: boolean;
}

export interface SubmissionsQueryParams {
  promptId?: string;
  status?: 'pending' | 'analyzing' | 'completed' | 'failed';
  limit?: number;
  offset?: number;
}

export interface SubmissionsResponse {
  items: SpeakingSubmission[];
  total: number;
  hasMore: boolean;
}

export interface CreateSubmissionRequest {
  promptId: string;
  audioUrl: string;
  durationSeconds: number;
}

export interface TranscriptionResponse {
  text: string;
  confidence: number;
  language: string;
  durationSeconds: number;
}

export interface AnalyzeSpeechRequest {
  submissionId: string;
}

export interface ProgressStats {
  totalSubmissions: number;
  averageScore: number;
  completedToday: number;
  currentStreak: number;
  levelDistribution: Record<CEFRLevel, number>;
  recentScores: number[];
}

export interface WeaknessesResponse {
  items: {
    word: string;
    count: number;
    averageScore: number;
    category: 'pronunciation' | 'grammar' | 'vocabulary';
  }[];
  total: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}
