'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  RotateCcw,
  Send,
  Volume2,
  AlertCircle,
} from 'lucide-react';
import {
  useSpeechRecognition,
  useAudioRecording,
} from '@/hooks/useSpeechRecognition';
import { useTTS } from '@/hooks/useAudioPlayer';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

interface SpeechRecorderProps {
  promptText: string;
  sampleAudioUrl?: string;
  onSubmit?: (transcript: string, audioBlob?: Blob) => void;
  onTranscriptChange?: (transcript: string) => void;
  disabled?: boolean;
  showPlayback?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// Waveform Visualizer
// ═══════════════════════════════════════════════════════════════

function WaveformVisualizer({ isActive }: { isActive: boolean }) {
  const bars = 20;

  return (
    <div className="flex items-center justify-center gap-1 h-16">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          className={`w-1 rounded-full ${isActive ? 'bg-red-500' : 'bg-gray-300'}`}
          animate={
            isActive
              ? {
                  height: [8, Math.random() * 40 + 20, 8],
                }
              : { height: 8 }
          }
          transition={
            isActive
              ? {
                  duration: 0.5,
                  repeat: Infinity,
                  delay: i * 0.05,
                  ease: 'easeInOut',
                }
              : { duration: 0.2 }
          }
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SpeechRecorder Component
// ═══════════════════════════════════════════════════════════════

export function SpeechRecorder({
  promptText,
  sampleAudioUrl,
  onSubmit,
  onTranscriptChange,
  disabled = false,
  showPlayback = true,
}: SpeechRecorderProps) {
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Speech recognition
  const [speechState, speechControls] = useSpeechRecognition({
    lang: 'de-DE',
    continuous: true,
    interimResults: true,
    onResult: (transcript, isFinal) => {
      if (isFinal) {
        onTranscriptChange?.(speechState.transcript + transcript);
      }
    },
  });

  // Audio recording
  const [recordingState, recordingControls] = useAudioRecording({
    onRecordingComplete: (blob, url) => {
      console.log('Recording complete:', url);
    },
  });

  // TTS for playing sample
  const [ttsState, ttsControls] = useTTS({ lang: 'de-DE' });

  // Notify parent of transcript changes
  useEffect(() => {
    onTranscriptChange?.(speechState.transcript);
  }, [speechState.transcript, onTranscriptChange]);

  const handleStartRecording = useCallback(async () => {
    speechControls.reset();
    speechControls.start();
    await recordingControls.startRecording();
  }, [speechControls, recordingControls]);

  const handleStopRecording = useCallback(() => {
    speechControls.stop();
    recordingControls.stopRecording();
  }, [speechControls, recordingControls]);

  const handleReset = useCallback(() => {
    speechControls.reset();
    recordingControls.reset();
    setIsPlayingBack(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [speechControls, recordingControls]);

  const handleSubmit = useCallback(() => {
    if (!speechState.transcript.trim()) return;
    onSubmit?.(speechState.transcript, recordingState.audioBlob || undefined);
  }, [speechState.transcript, recordingState.audioBlob, onSubmit]);

  const handlePlaySample = useCallback(() => {
    if (sampleAudioUrl) {
      // Play audio file
      if (audioRef.current) {
        audioRef.current.src = sampleAudioUrl;
        audioRef.current.play();
      }
    } else {
      // Use TTS
      ttsControls.speak(promptText);
    }
  }, [sampleAudioUrl, promptText, ttsControls]);

  const handlePlayRecording = useCallback(() => {
    if (!recordingState.audioUrl || !audioRef.current) return;

    if (isPlayingBack) {
      audioRef.current.pause();
      setIsPlayingBack(false);
    } else {
      audioRef.current.src = recordingState.audioUrl;
      audioRef.current.play();
      setIsPlayingBack(true);
    }
  }, [recordingState.audioUrl, isPlayingBack]);

  // Audio element for playback
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.onended = () => setIsPlayingBack(false);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const isRecording = speechState.isListening || recordingState.isRecording;
  const hasRecording = !!recordingState.audioBlob || !!speechState.transcript;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Error Message */}
      <AnimatePresence>
        {(speechState.error || recordingState.error) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Recording Error</p>
              <p className="text-sm text-red-600">
                {speechState.error || recordingState.error}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Browser Support Warning */}
      {!speechState.isSupported && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-sm text-yellow-800">
            Speech recognition is not supported in this browser. Please use Chrome or Edge.
          </p>
        </div>
      )}

      {/* Recording Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Prompt Display */}
        <div className="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <p className="text-sm text-indigo-600 font-medium mb-1">Say this:</p>
          <p className="text-lg text-indigo-900 font-medium">{promptText}</p>

          <button
            onClick={handlePlaySample}
            disabled={ttsState.isSpeaking}
            className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg text-sm font-medium transition disabled:opacity-50"
          >
            <Volume2 className="w-4 h-4" />
            {ttsState.isSpeaking ? 'Playing...' : 'Listen to sample'}
          </button>
        </div>

        {/* Waveform Visualization */}
        <div className="mb-6">
          <WaveformVisualizer isActive={isRecording} />
        </div>

        {/* Recording Controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {!isRecording ? (
            <button
              onClick={handleStartRecording}
              disabled={disabled || !speechState.isSupported}
              className="flex items-center justify-center w-20 h-20 bg-red-500 hover:bg-red-600 text-white rounded-full transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mic className="w-8 h-8" />
            </button>
          ) : (
            <button
              onClick={handleStopRecording}
              className="flex items-center justify-center w-20 h-20 bg-gray-700 hover:bg-gray-800 text-white rounded-full transition shadow-lg animate-pulse"
            >
              <Square className="w-8 h-8" />
            </button>
          )}
        </div>

        {/* Status Text */}
        <p className="text-center text-sm text-gray-500 mb-4">
          {isRecording
            ? 'Recording... Click to stop'
            : hasRecording
            ? 'Recording complete'
            : 'Click the microphone to start'}
        </p>

        {/* Transcript Display */}
        {(speechState.transcript || speechState.interimTranscript) && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500 font-medium mb-1">Your speech:</p>
            <p className="text-gray-900">
              {speechState.transcript}
              {speechState.interimTranscript && (
                <span className="text-gray-400 italic">{speechState.interimTranscript}</span>
              )}
            </p>
            {speechState.confidence > 0 && (
              <p className="text-xs text-gray-400 mt-2">
                Confidence: {Math.round(speechState.confidence * 100)}%
              </p>
            )}
          </div>
        )}

        {/* Playback Controls */}
        {showPlayback && hasRecording && !isRecording && (
          <div className="flex items-center justify-center gap-4 mb-6">
            {recordingState.audioUrl && (
              <button
                onClick={handlePlayRecording}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  isPlayingBack
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isPlayingBack ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Play recording
                  </>
                )}
              </button>
            )}

            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
            >
              <RotateCcw className="w-4 h-4" />
              Try again
            </button>
          </div>
        )}

        {/* Submit Button */}
        {hasRecording && !isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <button
              onClick={handleSubmit}
              disabled={!speechState.transcript.trim()}
              className="flex items-center gap-2 px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-semibold transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
              Submit for Evaluation
            </button>
          </motion.div>
        )}

        {/* Recording Duration */}
        {recordingState.duration > 0 && (
          <p className="text-center text-xs text-gray-400 mt-4">
            Duration: {recordingState.duration.toFixed(1)}s
          </p>
        )}
      </div>

      {/* Keyboard Shortcuts */}
      <div className="mt-4 text-center text-xs text-gray-400">
        <span>
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">Space</kbd> to start/stop
        </span>
      </div>
    </div>
  );
}

export default SpeechRecorder;
