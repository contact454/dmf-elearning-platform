// Writing Module Types

export interface GrammarError {
  id: string;
  type: 'grammar' | 'spelling' | 'style';
  offset: number;
  length: number;
  message: string;
  suggestions: string[];
  ruleId?: string;
}

export interface WritingPrompt {
  id: string;
  title: string;
  description: string;
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2';
  category: string;
  targetWordCount: number;
  tips?: string[];
  createdAt: string;
}

export interface Essay {
  id: string;
  userId: string;
  promptId?: string;
  content: string;
  wordCount: number;
  errorCount: number;
  writingTimeSeconds: number;
  status: 'draft' | 'submitted' | 'reviewed';
  createdAt: string;
  updatedAt: string;
  prompt?: WritingPrompt;
}

export interface WritingStats {
  wordCount: number;
  errorCount: number;
  writingTime: number; // seconds
}
