/**
 * Debounced Grammar Check Hook
 * Automatically checks grammar 1 second after typing stops
 */

import { useEffect, useCallback, useRef } from 'react';
import { useGrammarCheck } from './useWriting';
import { useErrorStore } from '@/stores/errorStore';

export interface UseDebouncedGrammarCheckOptions {
  delay?: number;
  minLength?: number;
  language?: string;
  enabled?: boolean;
}

/**
 * Hook to perform debounced grammar checking
 * 
 * @param content - The text content to check
 * @param options - Configuration options
 * @returns Object with checking state
 */
export function useDebouncedGrammarCheck(
  content: string,
  options: UseDebouncedGrammarCheckOptions = {}
) {
  const {
    delay = 1000,
    minLength = 10,
    language = 'de-DE',
    enabled = true,
  } = options;

  const grammarCheckMutation = useGrammarCheck();
  const { setErrors, setCheckingGrammar } = useErrorStore();
  
  // Use ref to track timeout
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckedContentRef = useRef<string>('');

  const checkGrammar = useCallback(
    async (text: string) => {
      // Skip if not enabled
      if (!enabled) {
        return;
      }

      // Skip if text is too short
      if (text.trim().length < minLength) {
        setErrors([]);
        setCheckingGrammar(false);
        return;
      }

      // Skip if content hasn't changed
      if (text === lastCheckedContentRef.current) {
        return;
      }

      try {
        setCheckingGrammar(true);
        lastCheckedContentRef.current = text;

        const result = await grammarCheckMutation.mutateAsync({
          text,
          language,
        });

        setErrors(result.errors);
      } catch (error) {
        console.error('Grammar check failed:', error);
        setErrors([]);
      } finally {
        setCheckingGrammar(false);
      }
    },
    [enabled, minLength, language, grammarCheckMutation, setErrors, setCheckingGrammar]
  );

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      checkGrammar(content);
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, delay, checkGrammar]);

  return {
    isChecking: grammarCheckMutation.isPending || useErrorStore((state) => state.isCheckingGrammar),
    error: grammarCheckMutation.error,
  };
}
