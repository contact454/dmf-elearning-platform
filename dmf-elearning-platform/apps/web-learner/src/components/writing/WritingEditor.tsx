'use client';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistory';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { EditorState } from 'lexical';
import { useState, useCallback } from 'react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useUpdateEssay, useGrammarCheck } from '@/hooks/useWriting';
import type { GrammarError } from '@/types/writing';

const editorConfig = {
  namespace: 'WritingEditor',
  theme: {
    paragraph: 'mb-2',
    text: {
      bold: 'font-bold',
      italic: 'italic',
      underline: 'underline',
    },
  },
  onError: (error: Error) => {
    console.error('Lexical error:', error);
  },
};

interface WritingEditorProps {
  essayId: string | null;
  initialContent?: string;
  onContentChange?: (content: string, wordCount: number) => void;
  onGrammarCheckComplete?: (errors: GrammarError[]) => void;
}

export function WritingEditor({ 
  essayId, 
  initialContent = '',
  onContentChange,
  onGrammarCheckComplete
}: WritingEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [wordCount, setWordCount] = useState(0);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // API mutations
  const updateEssay = useUpdateEssay();
  const grammarCheck = useGrammarCheck();

  // Auto-save handler - NOW ACTUALLY SAVES TO API
  const handleSave = useCallback(async (text: string) => {
    if (!essayId) return;
    
    try {
      await updateEssay.mutateAsync({
        id: essayId,
        content: text,
      });
      setLastSavedAt(new Date());
    } catch (error) {
      console.error('❌ Auto-save failed:', error);
    }
  }, [essayId, updateEssay]);

  const { isDebouncing } = useAutoSave({
    content,
    essayId,
    onSave: handleSave,
    delay: 10000,
  });

  // Grammar check handler
  const handleGrammarCheck = useCallback(async () => {
    if (!content.trim()) return;

    try {
      const result = await grammarCheck.mutateAsync({
        text: content,
        language: 'de-DE',
      });

      onGrammarCheckComplete?.(result.errors);
    } catch (error) {
      console.error('❌ Grammar check failed:', error);
    }
  }, [content, grammarCheck, onGrammarCheckComplete]);

  const handleChange = useCallback((editorState: EditorState) => {
    editorState.read(() => {
      const text = editorState.toJSON().root.children
        .map((node: any) => node.children?.map((child: any) => child.text).join('') || '')
        .join('\n');
      
      const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
      setWordCount(words);
      setContent(text);
      
      onContentChange?.(text, words);
    });
  }, [onContentChange]);

  // Format last saved time
  const formatSaveTime = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header with word count and save status */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Word count: <span className="font-semibold">{wordCount}</span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Auto-save status indicator */}
          <div className="text-sm">
            {updateEssay.isPending || isDebouncing ? (
              <span className="text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </span>
            ) : lastSavedAt ? (
              <span className="text-green-600 dark:text-green-400">
                ✓ Saved at {formatSaveTime(lastSavedAt)}
              </span>
            ) : null}
          </div>

          {/* Grammar check button */}
          <button
            onClick={handleGrammarCheck}
            disabled={grammarCheck.isPending || !content.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {grammarCheck.isPending ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Checking...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Check Grammar
              </>
            )}
          </button>
        </div>
      </div>
      
      <LexicalComposer initialConfig={editorConfig}>
        <div className="border rounded-lg shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700 relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="min-h-[500px] p-4 focus:outline-none prose dark:prose-invert max-w-none" />
            }
            placeholder={
              <div className="absolute top-4 left-4 text-gray-400 dark:text-gray-500 pointer-events-none">
                Start writing your essay...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          
          <HistoryPlugin />
          <OnChangePlugin onChange={handleChange} />
        </div>
      </LexicalComposer>
    </div>
  );
}
