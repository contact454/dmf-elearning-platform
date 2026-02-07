/**
 * Store Exports
 * Centralized export for all Zustand stores
 */

// Editor Store
export {
  useEditorStore,
  selectContent,
  selectWordCount,
  selectWritingTime,
  selectIsAutoSaving,
  selectLastSaved,
  selectHasUnsavedChanges,
} from './editorStore';

export type { EditorState } from './editorStore';

// Error Store
export {
  useErrorStore,
  selectErrors,
  selectIgnoredErrorIds,
  selectIsCheckingGrammar,
  selectVisibleErrors,
  selectErrorCountByType,
} from './errorStore';

export type { ErrorState } from './errorStore';
