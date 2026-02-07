'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, RotateCcw, Loader2 } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string;
  onComplete?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

export default function AudioPlayer({ 
  audioUrl, 
  onComplete, 
  onError,
  className = '' 
}: AudioPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Create audio element
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    // Set up event listeners
    audio.addEventListener('loadedmetadata', () => {
      setLoaded(true);
      setDuration(audio.duration);
    });

    audio.addEventListener('play', () => setPlaying(true));
    audio.addEventListener('pause', () => setPlaying(false));
    
    audio.addEventListener('ended', () => {
      setPlaying(false);
      setProgress(0);
      onComplete?.();
    });

    audio.addEventListener('error', (e) => {
      const errorMsg = 'Failed to load audio file';
      setError(errorMsg);
      onError?.(new Error(errorMsg));
    });

    // Update progress
    progressIntervalRef.current = setInterval(() => {
      if (audio && !audio.paused) {
        setProgress(audio.currentTime);
      }
    }, 100);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      audio.pause();
      audio.src = '';
    };
  }, [audioUrl, onComplete, onError]);

  // Update volume when changed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Update playback speed when changed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  const togglePlay = () => {
    if (!audioRef.current || !loaded) return;

    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setProgress(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSpeed(parseFloat(e.target.value));
  };

  const handleReplay = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setProgress(0);
    audioRef.current.play();
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <p className="text-red-700 text-sm">⚠️ {error}</p>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 space-y-3 ${className}`}>
      {/* Main Controls */}
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          disabled={!loaded}
          className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {!loaded ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : playing ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-0.5" />
          )}
        </button>

        {/* Progress Bar */}
        <div className="flex-1 space-y-1">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={progress}
            onChange={handleSeek}
            disabled={!loaded}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
            style={{
              background: loaded 
                ? `linear-gradient(to right, #2563eb 0%, #2563eb ${(progress / duration) * 100}%, #e5e7eb ${(progress / duration) * 100}%, #e5e7eb 100%)`
                : '#e5e7eb'
            }}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Replay Button */}
        <button
          onClick={handleReplay}
          disabled={!loaded}
          className="flex-shrink-0 p-2 text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed transition"
          aria-label="Replay"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Secondary Controls */}
      <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
        {/* Volume Control */}
        <div className="flex items-center gap-2 flex-1">
          <Volume2 className="w-4 h-4 text-gray-500" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            disabled={!loaded}
            className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
            aria-label="Volume"
          />
          <span className="text-xs text-gray-500 w-8 text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>

        {/* Speed Control */}
        <div className="flex items-center gap-2">
          <label htmlFor="speed-select" className="text-xs text-gray-500">
            Speed:
          </label>
          <select
            id="speed-select"
            value={speed}
            onChange={handleSpeedChange}
            disabled={!loaded}
            className="text-xs border border-gray-200 rounded px-2 py-1 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1">1x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
          </select>
        </div>
      </div>
    </div>
  );
}
