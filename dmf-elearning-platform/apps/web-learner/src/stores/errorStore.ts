/**
 * Error State Store (Zustand)
 * Manages grammar errors and ignored errors
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { GrammarError } from '@/hooks/useWriting';

export interface ErrorState {
  // Errors
  errors: GrammarError[];
  ignoredErrorIds: Set<string>;
  
  // Loading state
  isCheckingGrammar: boolean;
  lastChecked: Date | null;
  
  // Actions
  setErrors: (errors: GrammarError[]) => void;
  ignoreError: (errorId: string) => void;
  clearIgnored: () => void;
  setCheckingGrammar: (checking: boolean) => void;
  clearAllErrors: () => void;
}

const initialState = {
  errors: [],
  ignoredErrorIds: new Set<string>(),
  isCheckingGrammar: false,
  lastChecked: null,
};

export const useErrorStore = create<ErrorState>()(
  devtools(
    (set) => ({
      ...initialState,

      setErrors: (errors) =>
        set({
          errors,
          lastChecked: new Date(),
        }),

      ignoreError: (errorId) =>
        set((state) => ({
          ignoredErrorIds: new Set([...state.ignoredErrorIds, errorId]),
        })),

      clearIgnored: () =>
        set({
          ignoredErrorIds: new Set(),
        }),

      setCheckingGrammar: (checking) =>
        set({
          isCheckingGrammar: checking,
        }),

      clearAllErrors: () =>
        set({
          errors: [],
          ignoredErrorIds: new Set(),
        }),
    }),
    { name: 'ErrorStore' }
  )
);

// ============================================
// SELECTORS
// ============================================

export const selectErrors = (state: ErrorState) => state.errors;
export const selectIgnoredErrorIds = (state: ErrorState) => state.ignoredErrorIds;
export const selectIsCheckingGrammar = (state: ErrorState) => state.isCheckingGrammar;

/**
 * Get visible errors (not ignored)
 */
export const selectVisibleErrors = (state: ErrorState) =>
  state.errors.filter((error) => error.id && !state.ignoredErrorIds.has(error.id));

/**
 * Get error count by type
 */
export const selectErrorCountByType = (state: ErrorState) => {
  const visibleErrors = selectVisibleErrors(state);
  return {
    grammar: visibleErrors.filter((e) => e.type === 'grammar').length,
    spelling: visibleErrors.filter((e) => e.type === 'spelling').length,
    style: visibleErrors.filter((e) => e.type === 'style').length,
    total: visibleErrors.length,
  };
};
