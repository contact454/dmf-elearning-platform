'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

// Web Speech API types (not in TypeScript lib by default)
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: any) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: any) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export interface SpeechRecognitionState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  confidence: number;
}

export interface SpeechRecognitionControls {
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export interface UseSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

// ═══════════════════════════════════════════════════════════════
// Speech Recognition Hook
// ═══════════════════════════════════════════════════════════════

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): [SpeechRecognitionState, SpeechRecognitionControls] {
  const {
    lang = 'de-DE',
    continuous = true,
    interimResults = true,
    onResult,
    onEnd,
    onError,
  } = options;

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [state, setState] = useState<SpeechRecognitionState>({
    isListening: false,
    isSupported: false,
    transcript: '',
    interimTranscript: '',
    error: null,
    confidence: 0,
  });

  // Check browser support
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setState((prev) => ({ ...prev, isSupported: true }));
      recognitionRef.current = new SpeechRecognition();
    } else {
      setState((prev) => ({
        ...prev,
        isSupported: false,
        error: 'Speech recognition is not supported in this browser',
      }));
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Configure recognition
  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;

    recognition.onstart = () => {
      setState((prev) => ({ ...prev, isListening: true, error: null }));
    };

    recognition.onend = () => {
      setState((prev) => ({ ...prev, isListening: false }));
      onEnd?.();
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorMessage = getErrorMessage(event.error);
      setState((prev) => ({ ...prev, error: errorMessage, isListening: false }));
      onError?.(errorMessage);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';
      let totalConfidence = 0;
      let confidenceCount = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += transcript;
          totalConfidence += result[0].confidence;
          confidenceCount++;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setState((prev) => ({
          ...prev,
          transcript: prev.transcript + finalTranscript,
          interimTranscript: '',
          confidence: confidenceCount > 0 ? totalConfidence / confidenceCount : prev.confidence,
        }));
        onResult?.(finalTranscript, true);
      } else {
        setState((prev) => ({ ...prev, interimTranscript }));
        onResult?.(interimTranscript, false);
      }
    };
  }, [lang, continuous, interimResults, onResult, onEnd, onError]);

  const start = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition || state.isListening) return;

    setState((prev) => ({ ...prev, error: null }));

    try {
      recognition.start();
    } catch (error) {
      // Recognition might already be started
      console.warn('Recognition start error:', error);
    }
  }, [state.isListening]);

  const stop = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition || !state.isListening) return;

    recognition.stop();
  }, [state.isListening]);

  const reset = useCallback(() => {
    const recognition = recognitionRef.current;
    if (recognition && state.isListening) {
      recognition.abort();
    }

    setState((prev) => ({
      ...prev,
      transcript: '',
      interimTranscript: '',
      error: null,
      confidence: 0,
      isListening: false,
    }));
  }, [state.isListening]);

  return [state, { start, stop, reset }];
}

// ═══════════════════════════════════════════════════════════════
// Audio Recording Hook (for saving audio)
// ═══════════════════════════════════════════════════════════════

export interface AudioRecordingState {
  isRecording: boolean;
  isSupported: boolean;
  audioBlob: Blob | null;
  audioUrl: string | null;
  duration: number;
  error: string | null;
}

export interface AudioRecordingControls {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  reset: () => void;
}

export interface UseAudioRecordingOptions {
  onRecordingComplete?: (blob: Blob, url: string) => void;
  onError?: (error: string) => void;
}

export function useAudioRecording(
  options: UseAudioRecordingOptions = {}
): [AudioRecordingState, AudioRecordingControls] {
  const { onRecordingComplete, onError } = options;

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);

  const [state, setState] = useState<AudioRecordingState>({
    isRecording: false,
    isSupported: false,
    audioBlob: null,
    audioUrl: null,
    duration: 0,
    error: null,
  });

  // Check browser support
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isSupported =
      navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function';

    setState((prev) => ({ ...prev, isSupported }));

    return () => {
      // Clean up audio URL
      if (state.audioUrl) {
        URL.revokeObjectURL(state.audioUrl);
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    if (state.isRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Clean up previous recording
      if (state.audioUrl) {
        URL.revokeObjectURL(state.audioUrl);
      }

      chunksRef.current = [];
      startTimeRef.current = Date.now();

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const duration = (Date.now() - startTimeRef.current) / 1000;
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);

        setState((prev) => ({
          ...prev,
          isRecording: false,
          audioBlob: blob,
          audioUrl: url,
          duration,
        }));

        onRecordingComplete?.(blob, url);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // Collect data every 100ms

      setState((prev) => ({
        ...prev,
        isRecording: true,
        error: null,
        audioBlob: null,
        audioUrl: null,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to access microphone';
      setState((prev) => ({ ...prev, error: errorMessage }));
      onError?.(errorMessage);
    }
  }, [state.isRecording, state.audioUrl, onRecordingComplete, onError]);

  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current || !state.isRecording) return;

    mediaRecorderRef.current.stop();
  }, [state.isRecording]);

  const reset = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
    }

    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
    }

    setState((prev) => ({
      ...prev,
      isRecording: false,
      audioBlob: null,
      audioUrl: null,
      duration: 0,
      error: null,
    }));
  }, [state.isRecording, state.audioUrl]);

  return [state, { startRecording, stopRecording, reset }];
}

// ═══════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════

function getErrorMessage(error: string): string {
  const errorMessages: Record<string, string> = {
    'no-speech': 'No speech detected. Please try speaking again.',
    'audio-capture': 'Microphone not available. Please check your settings.',
    'not-allowed': 'Microphone permission denied. Please allow access.',
    aborted: 'Speech recognition was aborted.',
    network: 'Network error. Please check your connection.',
    'service-not-allowed': 'Speech recognition service not allowed.',
    'bad-grammar': 'Grammar error in speech recognition.',
    'language-not-supported': 'German language recognition may not be fully supported.',
  };

  return errorMessages[error] || `Speech recognition error: ${error}`;
}

/**
 * Calculate similarity between two strings (Levenshtein-based)
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 100;
  if (s1.length === 0 || s2.length === 0) return 0;

  const matrix: number[][] = [];

  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= s2.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  const distance = matrix[s1.length][s2.length];
  const maxLength = Math.max(s1.length, s2.length);
  return Math.round(((maxLength - distance) / maxLength) * 100);
}

/**
 * Compare words and return detailed scoring
 */
export function compareWords(
  userText: string,
  expectedText: string
): {
  score: number;
  wordScores: { word: string; userWord: string; score: number; isCorrect: boolean }[];
} {
  const userWords = userText.toLowerCase().split(/\s+/).filter(Boolean);
  const expectedWords = expectedText.toLowerCase().split(/\s+/).filter(Boolean);

  const wordScores: { word: string; userWord: string; score: number; isCorrect: boolean }[] = [];
  let totalScore = 0;

  for (let i = 0; i < expectedWords.length; i++) {
    const expected = expectedWords[i];
    const user = userWords[i] || '';
    const score = calculateSimilarity(user, expected);
    const isCorrect = score >= 80;

    wordScores.push({
      word: expected,
      userWord: user,
      score,
      isCorrect,
    });

    totalScore += score;
  }

  // Penalize extra words
  if (userWords.length > expectedWords.length) {
    const extraCount = userWords.length - expectedWords.length;
    totalScore -= extraCount * 10;
  }

  const avgScore = expectedWords.length > 0 ? totalScore / expectedWords.length : 0;

  return {
    score: Math.max(0, Math.min(100, avgScore)),
    wordScores,
  };
}

export default useSpeechRecognition;
