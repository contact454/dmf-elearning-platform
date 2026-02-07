'use client';

import { useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { EditorState } from 'lexical';

// Error highlighting types
export interface GrammarError {
  id: string;
  type: 'grammar' | 'spelling' | 'style';
  offset: number;
  length: number;
  message: string;
  suggestions: string[];
}

interface LexicalEditorProps {
  initialContent?: string;
  onChange: (text: string, wordCount: number) => void;
  errors?: GrammarError[];
  disabled?: boolean;
  placeholder?: string;
}

const editorConfig = {
  namespace: 'WritingEditor',
  theme: {
    root: 'min-h-[500px] focus:outline-none',
    paragraph: 'mb-2 text-gray-800 leading-relaxed',
    text: {
      bold: 'font-bold',
      italic: 'italic',
      underline: 'underline',
    },
  },
  onError: (error: Error) => {
    console.error('Lexical error:', error);
  },
  editable: true,
};

export function LexicalEditor({
  initialContent = '',
  onChange,
  errors = [],
  disabled = false,
  placeholder = 'Start writing your essay...',
}: LexicalEditorProps) {
  const handleChange = (editorState: EditorState) => {
    editorState.read(() => {
      // Extract plain text
      const root = editorState.toJSON().root;
      const text = extractText(root);
      
      // Calculate word count
      const words = text.trim().split(/\s+/).filter(w => w.length > 0);
      const wordCount = words.length;
      
      onChange(text, wordCount);
    });
  };

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="relative bg-white rounded-lg border border-gray-200">
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable 
                className="min-h-[500px] max-h-[600px] overflow-y-auto p-6 focus:outline-none" 
                disabled={disabled}
              />
            }
            placeholder={
              <div className="absolute top-6 left-6 text-gray-400 pointer-events-none select-none">
                {placeholder}
              </div>
            }
            ErrorBoundary={() => <div>Error loading editor</div>}
          />
          
          {/* Error overlay */}
          {errors.length > 0 && <ErrorOverlay errors={errors} />}
        </div>
        
        <HistoryPlugin />
        <OnChangePlugin onChange={handleChange} />
        {initialContent && <InitialContentPlugin content={initialContent} />}
      </div>
    </LexicalComposer>
  );
}

// ═══════════════════════════════════════════════════════════════
// Plugins
// ═══════════════════════════════════════════════════════════════

function InitialContentPlugin({ content }: { content: string }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (content) {
      editor.update(() => {
        const root = editor.getRootElement();
        if (root) {
          root.textContent = content;
        }
      });
    }
  }, [editor, content]);

  return null;
}

function ErrorOverlay({ errors }: { errors: GrammarError[] }) {
  // For MVP, we'll use CSS-based highlighting
  // This is a simplified approach - full implementation would use Lexical decorators
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {/* Error highlights will be rendered here */}
      {/* For now, errors will be shown in the feedback panel */}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════

function extractText(node: any): string {
  if (!node) return '';
  
  if (node.type === 'text') {
    return node.text || '';
  }
  
  if (node.children && Array.isArray(node.children)) {
    return node.children
      .map((child: any) => extractText(child))
      .join(node.type === 'paragraph' ? '\n' : '');
  }
  
  return '';
}
