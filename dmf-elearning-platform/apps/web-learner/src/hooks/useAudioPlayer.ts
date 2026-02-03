'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type PlaybackSpeed = 0.5 | 0.75 | 1 | 1.25 | 1.5;

export interface AudioPlayerOptions {
  autoPlay?: boolean;
  loop?: boolean;
  initialSpeed?: PlaybackSpeed;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onError?: (error: Error) => void;
}

export interface AudioPlayerState {
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  speed: PlaybackSpeed;
  volume: number;
  error: string | null;
}

export interface AudioPlayerControls {
  play: () => void;
  pause: () => void;
  toggle: () => void;
  stop: () => void;
  seek: (time: number) => void;
  seekRelative: (delta: number) => void;
  setSpeed: (speed: PlaybackSpeed) => void;
  setVolume: (volume: number) => void;
  replay: () => void;
  playSegment: (start: number, end: number) => void;
}

// ═══════════════════════════════════════════════════════════════
// Hook: useAudioPlayer
// ═══════════════════════════════════════════════════════════════

export function useAudioPlayer(
  src: string | undefined,
  options: AudioPlayerOptions = {}
): [AudioPlayerState, AudioPlayerControls] {
  const {
    autoPlay = false,
    loop = false,
    initialSpeed = 1,
    onEnded,
    onTimeUpdate,
    onError,
  } = options;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const segmentEndRef = useRef<number | null>(null);

  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    isLoading: true,
    currentTime: 0,
    duration: 0,
    speed: initialSpeed,
    volume: 1,
    error: null,
  });

  // Initialize audio element
  useEffect(() => {
    if (!src) return;

    const audio = new Audio(src);
    audio.playbackRate = state.speed;
    audio.volume = state.volume;
    audio.loop = loop;
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      setState(prev => ({
        ...prev,
        duration: audio.duration,
        isLoading: false,
      }));
    };

    const handleTimeUpdate = () => {
      setState(prev => ({ ...prev, currentTime: audio.currentTime }));
      onTimeUpdate?.(audio.currentTime, audio.duration);

      // Check for segment end
      if (segmentEndRef.current !== null && audio.currentTime >= segmentEndRef.current) {
        audio.pause();
        segmentEndRef.current = null;
        setState(prev => ({ ...prev, isPlaying: false }));
      }
    };

    const handleEnded = () => {
      setState(prev => ({ ...prev, isPlaying: false }));
      onEnded?.();
    };

    const handleError = () => {
      const error = new Error('Failed to load audio');
      setState(prev => ({ ...prev, error: error.message, isLoading: false }));
      onError?.(error);
    };

    const handlePlay = () => setState(prev => ({ ...prev, isPlaying: true }));
    const handlePause = () => setState(prev => ({ ...prev, isPlaying: false }));

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    if (autoPlay) {
      audio.play().catch(() => {});
    }

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [src]);

  // Update playback rate when speed changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = state.speed;
    }
  }, [state.speed]);

  // Controls
  const play = useCallback(() => {
    audioRef.current?.play().catch(() => {});
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const toggle = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [state.isPlaying, play, pause]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(time, state.duration));
    }
  }, [state.duration]);

  const seekRelative = useCallback((delta: number) => {
    if (audioRef.current) {
      const newTime = audioRef.current.currentTime + delta;
      audioRef.current.currentTime = Math.max(0, Math.min(newTime, state.duration));
    }
  }, [state.duration]);

  const setSpeed = useCallback((speed: PlaybackSpeed) => {
    setState(prev => ({ ...prev, speed }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
    setState(prev => ({ ...prev, volume: clampedVolume }));
  }, []);

  const replay = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, []);

  const playSegment = useCallback((start: number, end: number) => {
    if (audioRef.current) {
      segmentEndRef.current = end;
      audioRef.current.currentTime = start;
      audioRef.current.play().catch(() => {});
    }
  }, []);

  const controls: AudioPlayerControls = {
    play,
    pause,
    toggle,
    stop,
    seek,
    seekRelative,
    setSpeed,
    setVolume,
    replay,
    playSegment,
  };

  return [state, controls];
}

// ═══════════════════════════════════════════════════════════════
// Hook: useTTS (Text-to-Speech with speed control)
// ═══════════════════════════════════════════════════════════════

export interface TTSOptions {
  lang?: string;
  rate?: PlaybackSpeed;
  pitch?: number;
  voice?: string;
}

export interface TTSControls {
  speak: (text: string) => void;
  stop: () => void;
  setRate: (rate: PlaybackSpeed) => void;
}

export interface TTSState {
  isSpeaking: boolean;
  isSupported: boolean;
  rate: PlaybackSpeed;
  voices: SpeechSynthesisVoice[];
}

export function useTTS(options: TTSOptions = {}): [TTSState, TTSControls] {
  const { lang = 'de-DE', rate: initialRate = 1, pitch = 1 } = options;

  const [state, setState] = useState<TTSState>({
    isSpeaking: false,
    isSupported: false,
    rate: initialRate,
    voices: [],
  });

  // Load voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    setState(prev => ({ ...prev, isSupported: true }));

    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      setState(prev => ({ ...prev, voices }));
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      speechSynthesis.cancel();
    };
  }, []);

  // Find best German voice
  const getBestVoice = useCallback((): SpeechSynthesisVoice | null => {
    const { voices } = state;
    if (voices.length === 0) return null;

    const preferred = ['Google Deutsch', 'Anna', 'Helena', 'Petra', 'Markus'];
    for (const name of preferred) {
      const found = voices.find(v => v.name.includes(name) && v.lang.startsWith('de'));
      if (found) return found;
    }

    return voices.find(v => v.lang.startsWith('de')) || voices[0] || null;
  }, [state.voices]);

  const speak = useCallback((text: string) => {
    if (!state.isSupported || !text) return;

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = state.rate;
    utterance.pitch = pitch;

    const voice = getBestVoice();
    if (voice) utterance.voice = voice;

    utterance.onstart = () => setState(prev => ({ ...prev, isSpeaking: true }));
    utterance.onend = () => setState(prev => ({ ...prev, isSpeaking: false }));
    utterance.onerror = () => setState(prev => ({ ...prev, isSpeaking: false }));

    speechSynthesis.speak(utterance);
  }, [state.isSupported, state.rate, lang, pitch, getBestVoice]);

  const stop = useCallback(() => {
    speechSynthesis.cancel();
    setState(prev => ({ ...prev, isSpeaking: false }));
  }, []);

  const setRate = useCallback((rate: PlaybackSpeed) => {
    setState(prev => ({ ...prev, rate }));
  }, []);

  const controls: TTSControls = { speak, stop, setRate };

  return [state, controls];
}

// ═══════════════════════════════════════════════════════════════
// Utility Functions
// ═══════════════════════════════════════════════════════════════

/**
 * Format seconds to MM:SS
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Speed options for display
 */
export const SPEED_OPTIONS: { value: PlaybackSpeed; label: string }[] = [
  { value: 0.5, label: '0.5x' },
  { value: 0.75, label: '0.75x' },
  { value: 1, label: '1x' },
  { value: 1.25, label: '1.25x' },
  { value: 1.5, label: '1.5x' },
];

export default useAudioPlayer;
