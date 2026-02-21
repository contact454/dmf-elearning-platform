/**
 * Speaking Module - Zustand Store
 * Manages recording state, playback, current prompt, and analysis results
 */

'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  SpeakingPrompt,
  SpeakingSubmission,
} from '@/types/speaking';

// ============================================
// RECORDING STORE
// ============================================

interface RecordingStore {
  // State
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  mediaRecorder: MediaRecorder | null;

  // Actions
  startRecording: (mediaRecorder: MediaRecorder) => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  stopRecording: (audioBlob: Blob) => void;
  resetRecording: () => void;
  incrementDuration: () => void;
  setAudioUrl: (url: string) => void;
}

export const useRecordingStore = create<RecordingStore>()(
  devtools(
    (set) => ({
      // Initial state
      isRecording: false,
      isPaused: false,
      duration: 0,
      audioBlob: null,
      audioUrl: null,
      mediaRecorder: null,

      // Actions
      startRecording: (mediaRecorder) =>
        set({
          isRecording: true,
          isPaused: false,
          duration: 0,
          mediaRecorder,
          audioBlob: null,
          audioUrl: null,
        }),

      pauseRecording: () =>
        set((state) => ({
          ...state,
          isPaused: true,
        })),

      resumeRecording: () =>
        set((state) => ({
          ...state,
          isPaused: false,
        })),

      stopRecording: (audioBlob) =>
        set({
          isRecording: false,
          isPaused: false,
          audioBlob,
          audioUrl: URL.createObjectURL(audioBlob),
          mediaRecorder: null,
        }),

      resetRecording: () =>
        set({
          isRecording: false,
          isPaused: false,
          duration: 0,
          audioBlob: null,
          audioUrl: null,
          mediaRecorder: null,
        }),

      incrementDuration: () =>
        set((state) => ({
          ...state,
          duration: state.duration + 1,
        })),

      setAudioUrl: (url) =>
        set((state) => ({
          ...state,
          audioUrl: url,
        })),
    }),
    { name: 'RecordingStore' }
  )
);

// ============================================
// PLAYER STORE
// ============================================

interface PlayerStore {
  // State
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;

  // Actions
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  setDuration: (duration: number) => void;
  updateCurrentTime: (time: number) => void;
}

export const usePlayerStore = create<PlayerStore>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 1.0,
        playbackRate: 1.0,

        // Actions
        play: () =>
          set((state) => ({
            ...state,
            isPlaying: true,
          })),

        pause: () =>
          set((state) => ({
            ...state,
            isPlaying: false,
          })),

        stop: () =>
          set((state) => ({
            ...state,
            isPlaying: false,
            currentTime: 0,
          })),

        seek: (time) =>
          set((state) => ({
            ...state,
            currentTime: time,
          })),

        setVolume: (volume) =>
          set((state) => ({
            ...state,
            volume: Math.max(0, Math.min(1, volume)),
          })),

        setPlaybackRate: (rate) =>
          set((state) => ({
            ...state,
            playbackRate: rate,
          })),

        setDuration: (duration) =>
          set((state) => ({
            ...state,
            duration,
          })),

        updateCurrentTime: (time) =>
          set((state) => ({
            ...state,
            currentTime: time,
          })),
      }),
      {
        name: 'player-settings',
        partialize: (state) => ({
          volume: state.volume,
          playbackRate: state.playbackRate,
        }),
      }
    ),
    { name: 'PlayerStore' }
  )
);

// ============================================
// SPEAKING SESSION STORE
// ============================================

interface SpeakingSessionStore {
  // Current prompt
  currentPrompt: SpeakingPrompt | null;
  
  // Current submission
  currentSubmission: SpeakingSubmission | null;
  
  // Analysis state
  isAnalyzing: boolean;
  analysisProgress: number; // 0-100
  
  // Transcript
  transcript: string | null;
  transcriptLoading: boolean;
  
  // UI state
  showFeedback: boolean;
  activeTab: 'record' | 'analyze' | 'feedback';
  
  // Actions
  setCurrentPrompt: (prompt: SpeakingPrompt | null) => void;
  setCurrentSubmission: (submission: SpeakingSubmission | null) => void;
  setAnalyzing: (isAnalyzing: boolean, progress?: number) => void;
  setTranscript: (text: string) => void;
  setTranscriptLoading: (loading: boolean) => void;
  setShowFeedback: (show: boolean) => void;
  setActiveTab: (tab: 'record' | 'analyze' | 'feedback') => void;
  resetSession: () => void;
}

export const useSpeakingSessionStore = create<SpeakingSessionStore>()(
  devtools(
    (set) => ({
      // Initial state
      currentPrompt: null,
      currentSubmission: null,
      isAnalyzing: false,
      analysisProgress: 0,
      transcript: null,
      transcriptLoading: false,
      showFeedback: false,
      activeTab: 'record',

      // Actions
      setCurrentPrompt: (prompt) =>
        set((state) => ({
          ...state,
          currentPrompt: prompt,
        })),

      setCurrentSubmission: (submission) =>
        set((state) => ({
          ...state,
          currentSubmission: submission,
        })),

      setAnalyzing: (isAnalyzing, progress = 0) =>
        set((state) => ({
          ...state,
          isAnalyzing,
          analysisProgress: progress,
        })),

      setTranscript: (text) =>
        set((state) => ({
          ...state,
          transcript: text,
          transcriptLoading: false,
        })),

      setTranscriptLoading: (loading) =>
        set((state) => ({
          ...state,
          transcriptLoading: loading,
        })),

      setShowFeedback: (show) =>
        set((state) => ({
          ...state,
          showFeedback: show,
        })),

      setActiveTab: (tab) =>
        set((state) => ({
          ...state,
          activeTab: tab,
        })),

      resetSession: () =>
        set({
          currentPrompt: null,
          currentSubmission: null,
          isAnalyzing: false,
          analysisProgress: 0,
          transcript: null,
          transcriptLoading: false,
          showFeedback: false,
          activeTab: 'record',
        }),
    }),
    { name: 'SpeakingSessionStore' }
  )
);

// ============================================
// SELECTORS (for performance optimization)
// ============================================

// Recording selectors
export const selectIsRecording = (state: RecordingStore) => state.isRecording;
export const selectIsPaused = (state: RecordingStore) => state.isPaused;
export const selectDuration = (state: RecordingStore) => state.duration;
export const selectAudioBlob = (state: RecordingStore) => state.audioBlob;
export const selectAudioUrl = (state: RecordingStore) => state.audioUrl;

// Player selectors
export const selectIsPlaying = (state: PlayerStore) => state.isPlaying;
export const selectCurrentTime = (state: PlayerStore) => state.currentTime;
export const selectPlayerDuration = (state: PlayerStore) => state.duration;
export const selectVolume = (state: PlayerStore) => state.volume;
export const selectPlaybackRate = (state: PlayerStore) => state.playbackRate;

// Session selectors
export const selectCurrentPrompt = (state: SpeakingSessionStore) => state.currentPrompt;
export const selectCurrentSubmission = (state: SpeakingSessionStore) => state.currentSubmission;
export const selectIsAnalyzing = (state: SpeakingSessionStore) => state.isAnalyzing;
export const selectTranscript = (state: SpeakingSessionStore) => state.transcript;
export const selectActiveTab = (state: SpeakingSessionStore) => state.activeTab;

// ============================================
// COMBINED SELECTORS
// ============================================

/**
 * Check if user can submit recording
 */
export const useCanSubmit = () => {
  const audioBlob = useRecordingStore(selectAudioBlob);
  const currentPrompt = useSpeakingSessionStore(selectCurrentPrompt);
  const isAnalyzing = useSpeakingSessionStore(selectIsAnalyzing);
  
  return !!audioBlob && !!currentPrompt && !isAnalyzing;
};

/**
 * Check if analysis is ready
 */
export const useHasAnalysis = () => {
  const submission = useSpeakingSessionStore(selectCurrentSubmission);
  return submission?.status === 'completed' && !!submission.feedback?.scores.overall;
};

/**
 * Get recording status text
 */
export const useRecordingStatus = () => {
  const isRecording = useRecordingStore(selectIsRecording);
  const isPaused = useRecordingStore(selectIsPaused);
  const duration = useRecordingStore(selectDuration);
  
  if (!isRecording) return 'Ready to record';
  if (isPaused) return `Paused (${formatTime(duration)})`;
  return `Recording (${formatTime(duration)})`;
};

// ============================================
// UTILITIES
// ============================================

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
