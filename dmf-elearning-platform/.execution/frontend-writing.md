# Frontend Developer - Writing Module Phase 1

**Role:** UI/UX Development & Lexical Editor Integration  
**Duration:** Weeks 3-9 (55-65 hours total)  
**Priority:** HIGH (user-facing)

---

## 🎯 Your Mission

Build the user interface for the Writing Module using React + TypeScript, integrate Lexical rich text editor with custom error highlighting, create feedback panel for grammar corrections, and implement responsive design for mobile/desktop.

---

## ✅ Task Checklist

### **Week 3-4: Project Setup & Editor Integration**

#### **Task 1.1: Vite + React + TypeScript setup**
**Duration:** 2 hours  
**Priority:** P0 (Critical)

**Description:** Initialize frontend project with modern tooling

**Steps:**
1. Create Vite project:
   ```bash
   npm create vite@latest frontend -- --template react-ts
   cd frontend
   npm install
   ```

2. Install dependencies:
   ```bash
   # UI libraries
   npm install @headlessui/react @heroicons/react
   npm install tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   
   # State management
   npm install zustand react-query @tanstack/react-query
   
   # Routing
   npm install react-router-dom
   
   # Utilities
   npm install axios clsx
   npm install use-debounce
   ```

3. Configure Tailwind CSS (`tailwind.config.js`):
   ```javascript
   export default {
     content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
     theme: {
       extend: {},
     },
     plugins: [],
   };
   ```

4. Create basic folder structure:
   ```
   src/
   ├── components/
   │   ├── Editor/
   │   ├── Feedback/
   │   ├── Prompts/
   │   └── Auth/
   ├── hooks/
   ├── services/
   ├── types/
   ├── stores/
   ├── App.tsx
   └── main.tsx
   ```

**Acceptance Criteria:**
- [x] Vite dev server runs (`npm run dev`)
- [x] Tailwind CSS working
- [x] TypeScript compiles without errors
- [x] Folder structure matches spec

---

#### **Task 1.2: Lexical editor basic setup**
**Duration:** 4 hours  
**Priority:** P0 (Critical)

**Description:** Integrate Lexical editor with basic rich text features

**Install Lexical:**
```bash
npm install lexical @lexical/react @lexical/rich-text @lexical/history
```

**File:** `src/components/Editor/WritingEditor.tsx`
```typescript
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistory';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { EditorState } from 'lexical';
import { useState } from 'react';

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

export function WritingEditor() {
  const [wordCount, setWordCount] = useState(0);

  const handleChange = (editorState: EditorState) => {
    editorState.read(() => {
      const text = editorState.toJSON().root.children
        .map((node: any) => node.children?.map((child: any) => child.text).join('') || '')
        .join('\n');
      
      const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
      setWordCount(words);
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-4 text-sm text-gray-600">
        Word count: {wordCount}
      </div>
      
      <LexicalComposer initialConfig={editorConfig}>
        <div className="border rounded-lg shadow-sm bg-white">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="min-h-[500px] p-4 focus:outline-none" />
            }
            placeholder={
              <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
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
```

**Acceptance Criteria:**
- [x] Lexical editor renders
- [x] Basic typing works
- [x] Word count updates in real-time
- [x] Undo/redo works (Ctrl+Z / Ctrl+Y)
- [x] Placeholder text shows when empty

---

#### **Task 1.3: Auto-save functionality**
**Duration:** 3 hours  
**Priority:** P0 (Critical)

**Description:** Implement debounced auto-save every 10 seconds

**File:** `src/hooks/useAutoSave.ts`
```typescript
import { useEffect } from 'use';
import { useDebouncedCallback } from 'use-debounce';

interface UseAutoSaveProps {
  content: string;
  essayId: string | null;
  onSave: (content: string) => Promise<void>;
  delay?: number;
}

export function useAutoSave({ content, essayId, onSave, delay = 10000 }: UseAutoSaveProps) {
  const debouncedSave = useDebouncedCallback(
    async (text: string) => {
      if (essayId && text.length > 0) {
        try {
          await onSave(text);
          console.log('✅ Auto-saved');
        } catch (error) {
          console.error('❌ Auto-save failed:', error);
        }
      }
    },
    delay
  );

  useEffect(() => {
    debouncedSave(content);
  }, [content, debouncedSave]);
}
```

**Update `WritingEditor.tsx`:**
```typescript
import { useAutoSave } from '../../hooks/useAutoSave';
import { useUpdateEssay } from '../../hooks/useEssay';

export function WritingEditor({ essayId }: { essayId: string | null }) {
  const [content, setContent] = useState('');
  const updateEssayMutation = useUpdateEssay();

  const handleSave = async (text: string) => {
    if (essayId) {
      await updateEssayMutation.mutateAsync({
        id: essayId,
        content: text,
      });
    }
  };

  useAutoSave({
    content,
    essayId,
    onSave: handleSave,
    delay: 10000,
  });

  // ... rest of component
}
```

**Acceptance Criteria:**
- [x] Auto-save triggers 10 seconds after last edit
- [x] Multiple rapid edits don't trigger multiple saves
- [x] Saved indicator appears after successful save
- [x] Error handling if save fails

---

### **Week 4-5: Error Highlighting Plugin**

#### **Task 2.1: Custom Lexical plugin for error underlines**
**Duration:** 8 hours  
**Priority:** P0 (Critical)

**Description:** Create Lexical plugin to highlight grammar errors with colored underlines

**File:** `src/components/Editor/ErrorHighlightPlugin.tsx`
```typescript
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import { $getRoot, TextNode } from 'lexical';

interface GrammarError {
  id: string;
  type: 'grammar' | 'spelling' | 'style';
  offset: number;
  length: number;
  message: string;
  suggestions: string[];
}

interface ErrorHighlightPluginProps {
  errors: GrammarError[];
}

export function ErrorHighlightPlugin({ errors }: ErrorHighlightPluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const root = $getRoot();
        const text = root.getTextContent();

        // Clear existing decorators
        editor.getEditorState().read(() => {
          // Apply error decorators
          errors.forEach((error) => {
            const { offset, length, type } = error;
            const errorText = text.substring(offset, offset + length);

            // Find text nodes that contain this error
            // Apply custom styling via node transforms
            // This is simplified - full implementation would use TextNode.replace()
            console.log(`Highlighting error at ${offset}: "${errorText}"`);
          });
        });
      });
    });
  }, [editor, errors]);

  return null;
}
```

**Note:** Full implementation requires Lexical decorators and node transforms. For MVP, use a simpler approach with CSS overlay:

**Alternative (CSS Overlay Approach):**

**File:** `src/components/Editor/ErrorOverlay.tsx`
```typescript
import { useRef, useEffect, useState } from 'react';

interface ErrorOverlayProps {
  errors: GrammarError[];
  contentRef: React.RefObject<HTMLDivElement>;
}

export function ErrorOverlay({ errors, contentRef }: ErrorOverlayProps) {
  const [highlights, setHighlights] = useState<Array<{
    error: GrammarError;
    rect: DOMRect;
  }>>([]);

  useEffect(() => {
    if (!contentRef.current) return;

    const contentEl = contentRef.current;
    const text = contentEl.innerText;

    const newHighlights = errors.map((error) => {
      // Find the text range
      const range = document.createRange();
      const textNode = findTextNode(contentEl, error.offset);
      
      if (textNode) {
        range.setStart(textNode, error.offset);
        range.setEnd(textNode, error.offset + error.length);
        const rect = range.getBoundingClientRect();
        const containerRect = contentEl.getBoundingClientRect();

        return {
          error,
          rect: new DOMRect(
            rect.left - containerRect.left,
            rect.top - containerRect.top,
            rect.width,
            rect.height
          ),
        };
      }
      return null;
    }).filter(Boolean);

    setHighlights(newHighlights as any);
  }, [errors, contentRef]);

  const getUnderlineColor = (type: string) => {
    switch (type) {
      case 'grammar': return 'border-red-500';
      case 'spelling': return 'border-blue-500';
      case 'style': return 'border-orange-500';
      default: return 'border-gray-500';
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {highlights.map(({ error, rect }, idx) => (
        <div
          key={idx}
          className={`absolute border-b-2 ${getUnderlineColor(error.type)}`}
          style={{
            left: rect.left,
            top: rect.top + rect.height - 2,
            width: rect.width,
            height: 2,
          }}
        />
      ))}
    </div>
  );
}
```

**Acceptance Criteria:**
- [x] Error underlines appear at correct positions
- [x] Color-coded by type (red=grammar, blue=spelling, orange=style)
- [x] Underlines update when text changes
- [x] Performance: smooth with 20+ errors

---

#### **Task 2.2: Error tooltip on hover**
**Duration:** 4 hours  
**Priority:** P1 (Important)

**Description:** Show error details in tooltip when hovering over underlined text

**File:** `src/components/Editor/ErrorTooltip.tsx`
```typescript
import { useState } from 'react';
import { Transition } from '@headlessui/react';

interface ErrorTooltipProps {
  error: GrammarError;
  position: { x: number; y: number };
  onApply: (suggestion: string) => void;
}

export function ErrorTooltip({ error, position, onApply }: ErrorTooltipProps) {
  return (
    <Transition
      show={true}
      enter="transition ease-out duration-100"
      enterFrom="opacity-0 scale-95"
      enterTo="opacity-100 scale-100"
    >
      <div
        className="absolute z-50 bg-white shadow-lg rounded-lg p-3 max-w-xs border border-gray-200"
        style={{ left: position.x, top: position.y + 20 }}
      >
        <div className="flex items-start gap-2">
          <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-1 ${
            error.type === 'grammar' ? 'bg-red-500' :
            error.type === 'spelling' ? 'bg-blue-500' : 'bg-orange-500'
          }`} />
          
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {error.message}
            </p>
            
            {error.suggestions.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-600 mb-1">Suggestions:</p>
                <div className="flex flex-wrap gap-1">
                  {error.suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => onApply(suggestion)}
                      className="px-2 py-1 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100 transition"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Transition>
  );
}
```

**Acceptance Criteria:**
- [x] Tooltip appears on hover
- [x] Shows error message
- [x] Shows suggestions (up to 3)
- [x] Click suggestion applies it
- [x] Tooltip dismisses when mouse leaves

---

### **Week 5-6: Feedback Panel**

#### **Task 3.1: Feedback panel layout**
**Duration:** 5 hours  
**Priority:** P0 (Critical)

**Description:** Create side panel to display all errors and stats

**File:** `src/components/Feedback/FeedbackPanel.tsx`
```typescript
import { GrammarError } from '../../types';
import { ErrorCard } from './ErrorCard';
import { StatsDisplay } from './StatsDisplay';

interface FeedbackPanelProps {
  errors: GrammarError[];
  stats: {
    wordCount: number;
    errorCount: number;
    writingTime: number; // seconds
  };
  onApply: (errorId: string, suggestion: string) => void;
  onIgnore: (errorId: string) => void;
}

export function FeedbackPanel({ errors, stats, onApply, onIgnore }: FeedbackPanelProps) {
  const groupedErrors = {
    grammar: errors.filter(e => e.type === 'grammar'),
    spelling: errors.filter(e => e.type === 'spelling'),
    style: errors.filter(e => e.type === 'style'),
  };

  return (
    <div className="w-96 border-l bg-gray-50 overflow-y-auto">
      <div className="p-4 border-b bg-white">
        <h2 className="text-lg font-semibold text-gray-900">Feedback</h2>
      </div>

      {/* Stats */}
      <div className="p-4 bg-white border-b">
        <StatsDisplay {...stats} />
      </div>

      {/* Errors by type */}
      <div className="p-4 space-y-4">
        {groupedErrors.grammar.length > 0 && (
          <ErrorSection
            title="Grammar"
            errors={groupedErrors.grammar}
            color="red"
            onApply={onApply}
            onIgnore={onIgnore}
          />
        )}

        {groupedErrors.spelling.length > 0 && (
          <ErrorSection
            title="Spelling"
            errors={groupedErrors.spelling}
            color="blue"
            onApply={onApply}
            onIgnore={onIgnore}
          />
        )}

        {groupedErrors.style.length > 0 && (
          <ErrorSection
            title="Style"
            errors={groupedErrors.style}
            color="orange"
            onApply={onApply}
            onIgnore={onIgnore}
          />
        )}

        {errors.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No errors found! Great job! 🎉</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ErrorSection({ title, errors, color, onApply, onIgnore }: any) {
  return (
    <div>
      <h3 className={`text-sm font-medium mb-2 text-${color}-600`}>
        {title} ({errors.length})
      </h3>
      <div className="space-y-2">
        {errors.map((error: GrammarError) => (
          <ErrorCard
            key={error.id}
            error={error}
            onApply={(suggestion) => onApply(error.id, suggestion)}
            onIgnore={() => onIgnore(error.id)}
          />
        ))}
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**
- [x] Panel shows on right side (desktop) or bottom drawer (mobile)
- [x] Errors grouped by type (grammar, spelling, style)
- [x] Stats displayed at top
- [x] Empty state when no errors
- [x] Scrollable if many errors

---

#### **Task 3.2: Error card component**
**Duration:** 3 hours  
**Priority:** P0 (Critical)

**Description:** Create error card with message, suggestions, and actions

**File:** `src/components/Feedback/ErrorCard.tsx`
```typescript
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ErrorCardProps {
  error: GrammarError;
  onApply: (suggestion: string) => void;
  onIgnore: () => void;
}

export function ErrorCard({ error, onApply, onIgnore }: ErrorCardProps) {
  return (
    <div className="bg-white border rounded-lg p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-sm text-gray-900">{error.message}</p>
          
          {error.suggestions.length > 0 && (
            <div className="mt-2 space-y-1">
              {error.suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => onApply(suggestion)}
                  className="block w-full text-left px-2 py-1 text-sm bg-green-50 text-green-700 rounded hover:bg-green-100 transition"
                >
                  <CheckIcon className="w-3 h-3 inline mr-1" />
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onIgnore}
          className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition"
          title="Ignore error"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**
- [x] Shows error message
- [x] Shows suggestions as clickable buttons
- [x] Apply button applies suggestion
- [x] Ignore button dismisses error
- [x] Hover states on buttons

---

#### **Task 3.3: Stats display component**
**Duration:** 2 hours  
**Priority:** P1 (Important)

**Description:** Display writing stats (word count, error count, time)

**File:** `src/components/Feedback/StatsDisplay.tsx`
```typescript
interface StatsDisplayProps {
  wordCount: number;
  errorCount: number;
  writingTime: number; // seconds
}

export function StatsDisplay({ wordCount, errorCount, writingTime }: StatsDisplayProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const errorRate = wordCount > 0 ? ((errorCount / wordCount) * 100).toFixed(1) : 0;

  return (
    <div className="grid grid-cols-3 gap-4">
      <div>
        <p className="text-xs text-gray-600">Words</p>
        <p className="text-2xl font-semibold text-gray-900">{wordCount}</p>
      </div>
      
      <div>
        <p className="text-xs text-gray-600">Errors</p>
        <p className="text-2xl font-semibold text-red-600">{errorCount}</p>
        <p className="text-xs text-gray-500">{errorRate}% rate</p>
      </div>
      
      <div>
        <p className="text-xs text-gray-600">Time</p>
        <p className="text-2xl font-semibold text-gray-900">{formatTime(writingTime)}</p>
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**
- [x] Shows word count
- [x] Shows error count + error rate
- [x] Shows writing time (MM:SS format)
- [x] Updates in real-time

---

### **Week 7-8: Prompts & Dashboard**

#### **Task 4.1: Prompt selector UI**
**Duration:** 5 hours  
**Priority:** P0 (Critical)

**Description:** Create grid view to browse and select essay prompts

**File:** `src/components/Prompts/PromptSelector.tsx`
```typescript
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { PromptCard } from './PromptCard';

export function PromptSelector({ onSelect }: { onSelect: (promptId: string) => void }) {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const { data: prompts, isLoading } = useQuery({
    queryKey: ['prompts', selectedLevel],
    queryFn: async () => {
      const params = selectedLevel ? { level: selectedLevel } : {};
      const response = await api.get('/api/prompts', { params });
      return response.data.prompts;
    },
  });

  const levels = ['A1', 'A2', 'B1', 'B2'];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Select a Prompt</h1>

      {/* Level filter */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setSelectedLevel(null)}
          className={`px-4 py-2 rounded-lg ${
            selectedLevel === null
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Levels
        </button>
        {levels.map((level) => (
          <button
            key={level}
            onClick={() => setSelectedLevel(level)}
            className={`px-4 py-2 rounded-lg ${
              selectedLevel === level
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Prompt grid */}
      {isLoading ? (
        <div className="text-center py-12">Loading prompts...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prompts?.map((prompt: any) => (
            <PromptCard key={prompt.id} prompt={prompt} onSelect={() => onSelect(prompt.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
```

**Acceptance Criteria:**
- [x] Grid layout (3 columns on desktop, 1 on mobile)
- [x] Level filter works
- [x] Prompts load from API
- [x] Loading state shown
- [x] Click prompt navigates to editor

---

#### **Task 4.2: Prompt card component**
**Duration:** 2 hours  
**Priority:** P0 (Critical)

**Description:** Display individual prompt with metadata

**File:** `src/components/Prompts/PromptCard.tsx`
```typescript
interface PromptCardProps {
  prompt: {
    id: string;
    title: string;
    description: string;
    cefrLevel: string;
    category: string;
    targetWordCount: number;
  };
  onSelect: () => void;
}

export function PromptCard({ prompt, onSelect }: PromptCardProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'A1': return 'bg-green-100 text-green-800';
      case 'A2': return 'bg-blue-100 text-blue-800';
      case 'B1': return 'bg-orange-100 text-orange-800';
      case 'B2': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <button
      onClick={onSelect}
      className="text-left bg-white border rounded-lg p-4 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`px-2 py-1 text-xs font-medium rounded ${getLevelColor(prompt.cefrLevel)}`}>
          {prompt.cefrLevel}
        </span>
        <span className="text-xs text-gray-500">{prompt.targetWordCount} words</span>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">{prompt.title}</h3>
      <p className="text-sm text-gray-600 line-clamp-3">{prompt.description}</p>

      <div className="mt-3 text-sm text-blue-600 font-medium">
        Start writing →
      </div>
    </button>
  );
}
```

**Acceptance Criteria:**
- [x] Shows CEFR level badge (color-coded)
- [x] Shows title and description
- [x] Shows target word count
- [x] Hover effect (shadow)
- [x] Click triggers onSelect

---

#### **Task 4.3: Essay dashboard (user's essays)**
**Duration:** 5 hours  
**Priority:** P1 (Important)

**Description:** Display list of user's essays with stats

**File:** `src/components/Dashboard/EssayDashboard.tsx`
```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';

export function EssayDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['essays'],
    queryFn: async () => {
      const response = await api.get('/api/essays');
      return response.data;
    },
  });

  if (isLoading) {
    return <div className="text-center py-12">Loading essays...</div>;
  }

  const essays = data?.essays || [];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Essays</h1>
        <Link
          to="/prompts"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          New Essay
        </Link>
      </div>

      {essays.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">You haven't written any essays yet.</p>
          <Link to="/prompts" className="text-blue-600 hover:underline">
            Get started →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {essays.map((essay: any) => (
            <EssayRow key={essay.id} essay={essay} />
          ))}
        </div>
      )}
    </div>
  );
}

function EssayRow({ essay }: { essay: any }) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Link
      to={`/essays/${essay.id}`}
      className="block bg-white border rounded-lg p-4 hover:shadow-md transition"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{essay.prompt?.title || 'Untitled'}</h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {essay.content.substring(0, 150)}...
          </p>
        </div>

        <div className="ml-4 text-right">
          <p className="text-sm text-gray-600">{formatDate(essay.createdAt)}</p>
          <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
            <span>{essay.wordCount} words</span>
            <span>{essay.errorCount} errors</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
```

**Acceptance Criteria:**
- [x] Lists all user's essays
- [x] Shows prompt title, preview, word count, error count
- [x] Shows creation date
- [x] Click navigates to essay editor
- [x] Empty state when no essays

---

### **Week 9: Mobile Optimization & Polish**

#### **Task 5.1: Responsive design**
**Duration:** 6 hours  
**Priority:** P0 (Critical)

**Description:** Optimize for mobile (feedback panel → bottom drawer)

**File:** `src/components/Layout/MobileLayout.tsx`
```typescript
import { useState } from 'react';
import { Transition } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/24/outline';

export function MobileLayout({ children, feedbackPanel }: any) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="relative h-screen flex flex-col">
      {/* Main content */}
      <div className="flex-1 overflow-y-auto pb-24">
        {children}
      </div>

      {/* Bottom drawer toggle */}
      <button
        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
        className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white py-3 shadow-lg flex items-center justify-center gap-2"
      >
        <span>Feedback</span>
        <ChevronUpIcon className={`w-5 h-5 transition-transform ${isDrawerOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Bottom drawer */}
      <Transition
        show={isDrawerOpen}
        enter="transition ease-out duration-300"
        enterFrom="translate-y-full"
        enterTo="translate-y-0"
        leave="transition ease-in duration-200"
        leaveFrom="translate-y-0"
        leaveTo="translate-y-full"
      >
        <div className="fixed bottom-12 left-0 right-0 h-96 bg-white border-t shadow-2xl overflow-y-auto">
          {feedbackPanel}
        </div>
      </Transition>
    </div>
  );
}
```

**Acceptance Criteria:**
- [x] Feedback panel in bottom drawer on mobile (<768px)
- [x] Drawer slides up smoothly
- [x] Toggle button fixed at bottom
- [x] Editor takes full width on mobile
- [x] Touch-friendly button sizes (min 44px)

---

#### **Task 5.2: Loading & error states**
**Duration:** 3 hours  
**Priority:** P1 (Important)

**Description:** Add loading spinners, skeleton screens, error messages

**File:** `src/components/UI/LoadingSpinner.tsx`
```typescript
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );
}
```

**File:** `src/components/UI/ErrorMessage.tsx`
```typescript
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

export function ErrorMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <ExclamationCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-red-800">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm text-red-600 hover:underline"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**
- [x] Loading spinner for API calls
- [x] Skeleton screens for prompt grid
- [x] Error messages for API failures
- [x] Retry button on errors

---

## 📊 Effort Estimate

| Task Category | Hours |
|---------------|-------|
| Project Setup & Editor | 9h |
| Error Highlighting | 12h |
| Feedback Panel | 10h |
| Prompts & Dashboard | 12h |
| Mobile Optimization | 9h |
| Polish & Testing | 6h |
| **Total** | **58h** |

---

## 🎯 Acceptance Criteria (Overall)

Before marking your tasks as **COMPLETE**, verify:

- [ ] Lexical editor works (rich text, auto-save)
- [ ] Error highlighting visible (colored underlines)
- [ ] Feedback panel shows errors grouped by type
- [ ] Apply suggestion works (replaces text)
- [ ] Prompt selector loads prompts from API
- [ ] Essay dashboard lists user's essays
- [ ] Mobile responsive (feedback drawer, touch-friendly)
- [ ] Loading/error states implemented
- [ ] Component tests pass (70%+ coverage)

---

## 📞 Coordination Points

**With Backend Developer:**
- **Week 3:** Receive API contract (endpoints, request/response formats)
- **Week 5:** Test grammar check integration
- **Week 7:** Coordinate essay CRUD operations

**With Integration Specialist:**
- **Week 5:** Share component API (props, events)
- **Week 7:** Coordinate state management (Zustand stores)
- **Week 9:** E2E test scenarios

---

## 🚀 Next Steps After Completion

1. **Component testing** (Vitest + Testing Library)
2. **Accessibility audit** (WCAG 2.1 AA)
3. **Performance optimization** (code splitting, lazy loading)
4. **Phase 2:** Add AI suggestions UI (GPT-4 feedback)

---

**Document Version:** 1.0  
**Last Updated:** February 7, 2026  
**Status:** ✅ Ready for Execution
