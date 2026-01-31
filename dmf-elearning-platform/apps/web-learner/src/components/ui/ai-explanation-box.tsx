'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AIExplanationBoxProps {
  explanation: string;
  isLoading?: boolean;
  className?: string;
}

export function AIExplanationBox({ explanation, isLoading = false, className }: AIExplanationBoxProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Typing effect
  useEffect(() => {
    if (isLoading) {
      setDisplayedText('');
      setCurrentIndex(0);
      return;
    }

    if (currentIndex < explanation.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + explanation[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 20); // 20ms per character for smooth typing effect

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, explanation, isLoading]);

  // Reset when explanation changes
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [explanation]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'relative mt-4 p-4 rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50',
        'shadow-lg backdrop-blur-sm',
        className
      )}
    >
      {/* Header with icon */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-lg">
          ✨
        </div>
        <h4 className="font-semibold text-purple-900">Gia sư AI Qwen</h4>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center gap-2 text-gray-600">
          <motion.div
            className="flex gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="w-2 h-2 bg-purple-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
            />
            <motion.div
              className="w-2 h-2 bg-violet-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
            />
            <motion.div
              className="w-2 h-2 bg-indigo-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
            />
          </motion.div>
          <span className="text-sm">Đang suy nghĩ...</span>
        </div>
      )}

      {/* Explanation text with typing effect */}
      {!isLoading && (
        <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
          {displayedText}
          {currentIndex < explanation.length && (
            <motion.span
              className="inline-block w-0.5 h-5 bg-purple-500 ml-0.5"
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            />
          )}
        </div>
      )}

      {/* Decorative gradient border */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 opacity-20 blur-xl -z-10" />
    </motion.div>
  );
}
