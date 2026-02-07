/**
 * Editor State Store (Zustand)
 * Manages editor content, word count, writing time, and auto-save state
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface EditorState {
  // Content
  content: string;
  wordCount: number;
  writingTime: number; // seconds
  
  // Auto-save state
  isAutoSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  
  // Current essay ID
  essayId: string | null;
  
  // Actions
  setContent: (content: string) => void;
  setWordCount: (count: number) => void;
  incrementWritingTime: () => void;
  setAutoSaving: (saving: boolean) => void;
  markSaved: () => void;
  setEssayId: (id: string | null) => void;
  resetEditor: () => void;
}

const initialState = {
  content: '',
  wordCount: 0,
  writingTime: 0,
  isAutoSaving: false,
  lastSaved: null,
  hasUnsavedChanges: false,
  essayId: null,
};

export const useEditorStore = create<EditorState>()(
  devtools(
    (set) => ({
      ...initialState,

      setContent: (content) =>
        set((state) => ({
          content,
          hasUnsavedChanges: content !== state.content,
        })),

      setWordCount: (count) => set({ wordCount: count }),

      incrementWritingTime: () =>
        set((state) => ({ writingTime: state.writingTime + 1 })),

      setAutoSaving: (saving) => set({ isAutoSaving: saving }),

      markSaved: () =>
        set({
          lastSaved: new Date(),
          isAutoSaving: false,
          hasUnsavedChanges: false,
        }),

      setEssayId: (id) => set({ essayId: id }),

      resetEditor: () => set(initialState),
    }),
    { name: 'EditorStore' }
  )
);

// ============================================
// SELECTORS (for better performance)
// ============================================

export const selectContent = (state: EditorState) => state.content;
export const selectWordCount = (state: EditorState) => state.wordCount;
export const selectWritingTime = (state: EditorState) => state.writingTime;
export const selectIsAutoSaving = (state: EditorState) => state.isAutoSaving;
export const selectLastSaved = (state: EditorState) => state.lastSaved;
export const selectHasUnsavedChanges = (state: EditorState) => state.hasUnsavedChanges;
