'use client';

import { useEffect, useRef } from 'react';
import { Mic, Square, Play, Pause, RotateCcw } from 'lucide-react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';

interface AudioRecorderProps {
  maxDurationSeconds?: number;
  onRecordingComplete?: (audioBlob: Blob, durationSeconds: number) => void;
  disabled?: boolean;
  className?: string;
}

export function AudioRecorder({
  maxDurationSeconds = 180, // 3 minutes default
  onRecordingComplete,
  disabled = false,
  className = '',
}: AudioRecorderProps) {
  const {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    audioUrl,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    reset,
    getVisualizationData,
  } = useAudioRecorder(maxDurationSeconds);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Waveform visualization
  useEffect(() => {
    if (!isRecording || isPaused || !canvasRef.current) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const data = getVisualizationData();
      if (!data) return;

      const { timeDomainData } = data;
      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.fillStyle = 'rgb(17, 24, 39)'; // dark bg
      ctx.fillRect(0, 0, width, height);

      // Draw waveform
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgb(59, 130, 246)'; // blue-500
      ctx.beginPath();

      const sliceWidth = width / timeDomainData.length;
      let x = 0;

      for (let i = 0; i < timeDomainData.length; i++) {
        const v = timeDomainData[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRecording, isPaused, getVisualizationData]);

  // Volume meter
  const volumeLevel = isRecording && !isPaused ? getVisualizationData()?.volume || 0 : 0;

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStop = () => {
    stopRecording();
  };

  useEffect(() => {
    if (audioBlob && !isRecording && onRecordingComplete) {
      onRecordingComplete(audioBlob, duration);
    }
  }, [audioBlob, isRecording, duration, onRecordingComplete]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Waveform Canvas */}
      <div className="relative bg-gray-900 dark:bg-gray-950 rounded-lg overflow-hidden h-32">
        <canvas
          ref={canvasRef}
          width={800}
          height={128}
          className="w-full h-full"
        />
        {!isRecording && !audioUrl && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <Mic className="w-12 h-12 opacity-50" />
          </div>
        )}
      </div>

      {/* Timer and Volume */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Duration */}
          <div className="text-2xl font-mono font-bold text-gray-900 dark:text-gray-100">
            {formatTime(duration)}
          </div>
          {maxDurationSeconds && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              / {formatTime(maxDurationSeconds)}
            </div>
          )}
        </div>

        {/* Volume Meter */}
        {isRecording && !isPaused && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Volume:</span>
            <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-100"
                style={{ width: `${volumeLevel}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        {!isRecording && !audioUrl && (
          <button
            onClick={startRecording}
            disabled={disabled}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-full font-medium transition-colors shadow-lg"
          >
            <Mic className="w-5 h-5" />
            Start Recording
          </button>
        )}

        {isRecording && (
          <>
            {!isPaused ? (
              <button
                onClick={pauseRecording}
                className="p-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full shadow-lg transition-colors"
                title="Pause"
              >
                <Pause className="w-6 h-6" />
              </button>
            ) : (
              <button
                onClick={resumeRecording}
                className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors"
                title="Resume"
              >
                <Play className="w-6 h-6" />
              </button>
            )}

            <button
              onClick={handleStop}
              className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-colors"
              title="Stop"
            >
              <Square className="w-6 h-6" />
            </button>
          </>
        )}

        {audioUrl && !isRecording && (
          <>
            <audio
              src={audioUrl}
              controls
              className="flex-1 max-w-md"
            />
            <button
              onClick={reset}
              className="p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-full shadow-lg transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Recording indicator */}
      {isRecording && !isPaused && (
        <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <span className="text-sm font-medium">Recording...</span>
        </div>
      )}

      {isPaused && (
        <div className="flex items-center justify-center text-yellow-600 dark:text-yellow-400 text-sm font-medium">
          Paused
        </div>
      )}
    </div>
  );
}
