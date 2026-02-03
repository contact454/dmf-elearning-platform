'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Repeat,
} from 'lucide-react';
import { useAudioPlayer, formatTime, SPEED_OPTIONS, PlaybackSpeed } from '@/hooks/useAudioPlayer';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

interface AudioPlayerProps {
  src?: string;
  title?: string;
  subtitle?: string;
  showWaveform?: boolean;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  className?: string;
  compact?: boolean;
  autoPlay?: boolean;
}

interface Segment {
  start: number;
  end: number;
  text?: string;
}

// ═══════════════════════════════════════════════════════════════
// AudioPlayer Component
// ═══════════════════════════════════════════════════════════════

export function AudioPlayer({
  src,
  title,
  subtitle,
  showWaveform = true,
  onTimeUpdate,
  onEnded,
  className = '',
  compact = false,
  autoPlay = false,
}: AudioPlayerProps) {
  const [state, controls] = useAudioPlayer(src, {
    autoPlay,
    onTimeUpdate,
    onEnded,
  });

  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const previousVolume = useRef(1);
  const progressRef = useRef<HTMLDivElement>(null);

  // Handle mute toggle
  const toggleMute = useCallback(() => {
    if (isMuted) {
      controls.setVolume(previousVolume.current);
      setIsMuted(false);
    } else {
      previousVolume.current = state.volume;
      controls.setVolume(0);
      setIsMuted(true);
    }
  }, [isMuted, state.volume, controls]);

  // Handle loop toggle
  const toggleLoop = useCallback(() => {
    setIsLooping(!isLooping);
  }, [isLooping]);

  // Handle progress bar click
  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current || state.duration === 0) return;
      const rect = progressRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = x / rect.width;
      controls.seek(percent * state.duration);
    },
    [state.duration, controls]
  );

  // Handle ended with loop
  useEffect(() => {
    if (isLooping && !state.isPlaying && state.currentTime >= state.duration - 0.1) {
      controls.replay();
    }
  }, [isLooping, state.isPlaying, state.currentTime, state.duration, controls]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          controls.toggle();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          controls.seekRelative(-5);
          break;
        case 'ArrowRight':
          e.preventDefault();
          controls.seekRelative(5);
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'l':
          e.preventDefault();
          toggleLoop();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [controls, toggleMute, toggleLoop]);

  const progress = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;

  if (compact) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <button
          onClick={controls.toggle}
          disabled={state.isLoading || !src}
          className={`flex items-center justify-center w-10 h-10 rounded-full transition ${
            state.isPlaying
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-indigo-500 hover:bg-indigo-600 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {state.isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4 ml-0.5" />
          )}
        </button>

        {/* Progress bar */}
        <div className="flex-1 flex items-center gap-2">
          <span className="text-xs text-gray-500 w-10 text-right font-mono">
            {formatTime(state.currentTime)}
          </span>
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="flex-1 h-2 bg-gray-200 rounded-full cursor-pointer overflow-hidden"
          >
            <motion.div
              className="h-full bg-indigo-500 rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <span className="text-xs text-gray-500 w-10 font-mono">
            {formatTime(state.duration)}
          </span>
        </div>

        {/* Speed control */}
        <select
          value={state.speed}
          onChange={(e) => controls.setSpeed(Number(e.target.value) as PlaybackSpeed)}
          className="text-xs bg-gray-100 border-none rounded px-2 py-1 cursor-pointer"
        >
          {SPEED_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Title */}
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-indigo-500" />
              {title}
            </h3>
          )}
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
      )}

      {/* Waveform / Progress */}
      {showWaveform && (
        <div className="mb-4">
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="relative h-12 bg-gray-100 rounded-lg cursor-pointer overflow-hidden"
          >
            {/* Waveform bars (decorative) */}
            <div className="absolute inset-0 flex items-center justify-around px-2">
              {Array.from({ length: 50 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-gray-300 rounded-full transition-colors"
                  style={{
                    height: `${Math.random() * 60 + 20}%`,
                    backgroundColor:
                      (i / 50) * 100 < progress ? '#6366f1' : '#d1d5db',
                  }}
                />
              ))}
            </div>

            {/* Progress overlay */}
            <motion.div
              className="absolute inset-y-0 left-0 bg-indigo-500/10"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>

          {/* Time display */}
          <div className="flex justify-between mt-2 text-sm text-gray-500 font-mono">
            <span>{formatTime(state.currentTime)}</span>
            <span>{formatTime(state.duration)}</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Skip back */}
          <button
            onClick={() => controls.seekRelative(-10)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            title="Back 10s"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={controls.toggle}
            disabled={state.isLoading || !src}
            className={`flex items-center justify-center w-14 h-14 rounded-full transition ${
              state.isPlaying
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-indigo-500 hover:bg-indigo-600 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {state.isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : state.isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-1" />
            )}
          </button>

          {/* Skip forward */}
          <button
            onClick={() => controls.seekRelative(10)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            title="Forward 10s"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          {/* Replay */}
          <button
            onClick={controls.replay}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            title="Replay"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* Speed control */}
          <div className="flex gap-1">
            {SPEED_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => controls.setSpeed(option.value)}
                className={`px-2 py-1 rounded text-sm font-medium transition ${
                  state.speed === option.value
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Loop toggle */}
          <button
            onClick={toggleLoop}
            className={`p-2 rounded-lg transition ${
              isLooping
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            title="Loop"
          >
            <Repeat className="w-5 h-5" />
          </button>

          {/* Volume */}
          <button
            onClick={toggleMute}
            className={`p-2 rounded-lg transition ${
              isMuted
                ? 'text-red-500 hover:bg-red-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Error message */}
      {state.error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {state.error}
        </div>
      )}

      {/* Keyboard shortcuts hint */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-400">
        <span><kbd className="px-1.5 py-0.5 bg-gray-100 rounded">Space</kbd> Play/Pause</span>
        <span><kbd className="px-1.5 py-0.5 bg-gray-100 rounded">←</kbd><kbd className="px-1.5 py-0.5 bg-gray-100 rounded ml-0.5">→</kbd> Skip ±5s</span>
        <span><kbd className="px-1.5 py-0.5 bg-gray-100 rounded">M</kbd> Mute</span>
        <span><kbd className="px-1.5 py-0.5 bg-gray-100 rounded">L</kbd> Loop</span>
      </div>
    </div>
  );
}

export default AudioPlayer;
