# Migration Guide - Old to New Writing Components

## Overview

The old writing page (`app/[locale]/learn/writing/[id]/page.tsx`) needs to be updated to use the new Writing Module components created in Phase 1.

---

## Old vs New Components

### **1. Editor**

**Old:**
```tsx
import { LexicalEditor, GrammarError } from '@/components/writing/LexicalEditor';
```

**New:**
```tsx
import { WritingEditor } from '@/components/writing';
// GrammarError type is in @/types/writing
import type { GrammarError } from '@/types/writing';
```

---

### **2. Feedback Panel**

**Old:**
```tsx
import { FeedbackPanel, MobileFeedbackDrawer } from '@/components/writing/FeedbackPanel';
```

**New:**
```tsx
import { FeedbackPanel, MobileLayout } from '@/components/writing';

// Usage:
<MobileLayout
  feedbackPanel={<FeedbackPanel errors={errors} stats={stats} />}
>
  <WritingEditor ... />
</MobileLayout>
```

---

### **3. Auto-save Hook**

**Old:**
```tsx
import { useAutoSave, useWritingTimer } from '@/hooks/useAutoSave';
```

**New:**
```tsx
import { useAutoSave } from '@/hooks/useAutoSave';
// useWritingTimer doesn't exist - use local state instead:

const [writingTime, setWritingTime] = useState(0);

useEffect(() => {
  const timer = setInterval(() => {
    setWritingTime(prev => prev + 1);
  }, 1000);
  
  return () => clearInterval(timer);
}, []);
```

---

## Example Migration

### **Before:**
```tsx
export default function WritingEditorPage() {
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState<GrammarError[]>([]);
  
  return (
    <div>
      <LexicalEditor
        content={content}
        onChange={setContent}
        errors={errors}
      />
      <FeedbackPanel errors={errors} />
    </div>
  );
}
```

### **After:**
```tsx
import { WritingEditor, FeedbackPanel, MobileLayout } from '@/components/writing';
import type { GrammarError } from '@/types/writing';

export default function WritingEditorPage() {
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [errors, setErrors] = useState<GrammarError[]>([]);
  const [writingTime, setWritingTime] = useState(0);
  
  // Timer
  useEffect(() => {
    const timer = setInterval(() => setWritingTime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <MobileLayout
      feedbackPanel={
        <FeedbackPanel
          errors={errors}
          stats={{ wordCount, errorCount: errors.length, writingTime }}
          onApply={(errorId, suggestion) => {
            // Apply suggestion logic
          }}
          onIgnore={(errorId) => {
            setErrors(prev => prev.filter(e => e.id !== errorId));
          }}
        />
      }
    >
      <WritingEditor
        essayId="uuid-here"
        initialContent={content}
        onContentChange={(newContent, newWordCount) => {
          setContent(newContent);
          setWordCount(newWordCount);
        }}
        errors={errors}
      />
    </MobileLayout>
  );
}
```

---

## Missing Dependencies

The old page imports these from `lucide-react`:
```tsx
import { ArrowLeft, Loader2, PenTool, Clock, Send, Save, ... } from 'lucide-react';
```

**Solution:** Install lucide-react OR replace with `@heroicons/react`:
```bash
pnpm add lucide-react --filter web-learner
# OR
pnpm add @heroicons/react --filter web-learner
```

---

## API Integration

The old page uses:
```tsx
import {
  getWritingById,
  saveWritingDraft,
  submitWriting,
  ...
} from '@/services/german-api';
```

**New approach (Phase 2):**

1. Create React Query hooks:
```tsx
// hooks/useEssay.ts
export function useEssay(id: string) {
  return useQuery({
    queryKey: ['essay', id],
    queryFn: () => getWritingById(id),
  });
}

export function useUpdateEssay() {
  return useMutation({
    mutationFn: ({ id, content }) => saveWritingDraft(id, content),
  });
}
```

2. Use in page:
```tsx
const { data: essay } = useEssay(id);
const updateEssay = useUpdateEssay();

useAutoSave({
  content,
  essayId: id,
  onSave: (text) => updateEssay.mutateAsync({ id, content: text }),
});
```

---

## Quick Fix (Temporary)

To unblock builds, update the old page imports:

```tsx
// OLD:
// import { LexicalEditor, GrammarError } from '@/components/writing/LexicalEditor';
// import { FeedbackPanel, MobileFeedbackDrawer } from '@/components/writing/FeedbackPanel';
// import { useAutoSave, useWritingTimer } from '@/hooks/useAutoSave';

// NEW (temporary):
import { WritingEditor as LexicalEditor } from '@/components/writing/WritingEditor';
import { FeedbackPanel } from '@/components/writing/FeedbackPanel';
import type { GrammarError } from '@/types/writing';
import { useAutoSave } from '@/hooks/useAutoSave';

// Add local timer:
function useWritingTimer() {
  const [time, setTime] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);
  return time;
}

// MobileFeedbackDrawer doesn't exist - use inline conditional:
const MobileFeedbackDrawer = ({ children }: { children: React.ReactNode }) => (
  <div className="lg:hidden fixed bottom-0 left-0 right-0 h-96 bg-white">
    {children}
  </div>
);
```

---

## Complete Migration Checklist

- [ ] Install missing dependencies (`lucide-react` or `@heroicons/react`)
- [ ] Replace `LexicalEditor` with `WritingEditor`
- [ ] Replace `FeedbackPanel` + `MobileFeedbackDrawer` with `MobileLayout`
- [ ] Remove `useWritingTimer` import, use local state
- [ ] Update `GrammarError` import to `@/types/writing`
- [ ] Test auto-save functionality
- [ ] Test mobile responsive layout
- [ ] Verify word count updates
- [ ] Verify error highlighting works

---

**Estimated Time:** 30-60 minutes  
**Priority:** Medium (Phase 2)  
**Blocker:** No (components work standalone)
