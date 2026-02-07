# Speaking Module - Migration & Integration Guide

**For:** Integration Specialist & Backend Team  
**Date:** 2026-02-07  
**Status:** Ready for Integration

---

## 📚 Table of Contents

1. [Quick Start](#quick-start)
2. [Component API Reference](#component-api-reference)
3. [Integration Examples](#integration-examples)
4. [Data Flow](#data-flow)
5. [API Endpoints Required](#api-endpoints-required)
6. [Testing Checklist](#testing-checklist)

---

## Quick Start

### 1. Import Components

```typescript
// Import all components
import {
  AudioRecorder,
  PromptDisplay,
  FeedbackPanel,
  PronunciationCard,
  PromptSelector,
  SubmissionHistory,
  ProgressDashboard,
  MobileLayout,
} from '@/components/speaking';

// Import types
import type {
  SpeakingPrompt,
  SpeakingSubmission,
  SpeakingFeedback,
  SpeakingStats,
} from '@/types/speaking';

// Import hook
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
```

### 2. Basic Page Structure

```typescript
'use client';

import { useState } from 'react';
import { MobileLayout, PromptDisplay, AudioRecorder } from '@/components/speaking';

export default function SpeakingPracticePage() {
  const [selectedPrompt, setSelectedPrompt] = useState<SpeakingPrompt | null>(null);

  return (
    <MobileLayout
      feedbackPanel={<div>Feedback will appear here</div>}
    >
      <div className="p-6">
        {selectedPrompt ? (
          <>
            <PromptDisplay prompt={selectedPrompt} />
            <AudioRecorder 
              maxDurationSeconds={selectedPrompt.speakingTimeSeconds}
              onRecordingComplete={(blob, duration) => {
                console.log('Recording complete:', blob, duration);
                // Upload to API
              }}
            />
          </>
        ) : (
          <p>Select a prompt to start</p>
        )}
      </div>
    </MobileLayout>
  );
}
```

---

## Component API Reference

### 1. AudioRecorder

**Purpose:** Record user's speech with waveform visualization.

**Props:**
```typescript
interface AudioRecorderProps {
  maxDurationSeconds?: number;  // Auto-stop timer (default: 180)
  onRecordingComplete?: (audioBlob: Blob, durationSeconds: number) => void;
  disabled?: boolean;
  className?: string;
}
```

**Usage:**
```typescript
<AudioRecorder
  maxDurationSeconds={120}  // 2 minutes
  onRecordingComplete={(blob, duration) => {
    // Upload blob to your API
    uploadAudio(blob, duration);
  }}
  disabled={!selectedPrompt}
/>
```

**Features:**
- Start/Stop/Pause/Resume
- Waveform visualization
- Volume meter
- Timer (MM:SS)
- Audio preview

---

### 2. PromptDisplay

**Purpose:** Display speaking prompt with timer and criteria.

**Props:**
```typescript
interface PromptDisplayProps {
  prompt: SpeakingPrompt;
  onPreparationComplete?: () => void;
  showPreparationTimer?: boolean;  // default: true
  className?: string;
}
```

**Usage:**
```typescript
<PromptDisplay
  prompt={currentPrompt}
  onPreparationComplete={() => {
    console.log('Preparation done! User can start recording.');
  }}
  showPreparationTimer={true}
/>
```

**Data Required:**
```typescript
const prompt: SpeakingPrompt = {
  id: '123',
  question: 'Describe your favorite holiday destination.',
  cefrLevel: 'B1',
  topic: 'Travel',
  preparationTimeSeconds: 60,
  speakingTimeSeconds: 120,
  evaluationCriteria: [
    'Clear pronunciation',
    'Proper use of vocabulary',
    'Grammatical accuracy',
  ],
  tips: ['Speak naturally', 'Use descriptive words'],
  createdAt: '2026-02-07T00:00:00Z',
};
```

---

### 3. FeedbackPanel

**Purpose:** Display AI analysis results.

**Props:**
```typescript
interface FeedbackPanelProps {
  feedback: SpeakingFeedback;
  onPlayPronunciation?: (audioUrl: string) => void;
  className?: string;
}
```

**Usage:**
```typescript
<FeedbackPanel
  feedback={submission.feedback!}
  onPlayPronunciation={(url) => {
    const audio = new Audio(url);
    audio.play();
  }}
/>
```

**Data Structure:**
```typescript
const feedback: SpeakingFeedback = {
  scores: {
    overall: 85,
    pronunciation: 80,
    fluency: 88,
    vocabulary: 85,
    grammar: 87,
  },
  strengths: [
    'Excellent fluency and natural pace',
    'Good use of descriptive vocabulary',
  ],
  weaknesses: [
    'Pronunciation of "th" sounds needs improvement',
  ],
  suggestions: [
    'Practice "th" sounds with tongue exercises',
    'Record yourself daily for self-assessment',
  ],
  pronunciationDetails: [
    {
      word: 'thought',
      expectedIPA: 'θɔːt',
      actualIPA: 'tɔːt',
      accuracyScore: 65,
      feedback: 'The "th" sound should be dental fricative, not "t"',
      position: { start: 12.5, end: 13.2 },
      audioSnippetUrl: 'https://api.example.com/audio/snippet-123.mp3',
    },
  ],
  transcription: 'I thought about my favorite place...',
  durationSeconds: 118,
};
```

---

### 4. PronunciationCard

**Purpose:** Single word pronunciation feedback (used inside FeedbackPanel).

**Props:**
```typescript
interface PronunciationCardProps {
  feedback: PronunciationFeedback;
  onPlayAudio?: () => void;
  className?: string;
}
```

**Usage:**
```typescript
{pronunciationDetails.map((detail) => (
  <PronunciationCard
    key={detail.word}
    feedback={detail}
    onPlayAudio={() => playAudio(detail.audioSnippetUrl)}
  />
))}
```

---

### 5. PromptSelector

**Purpose:** Browse and select prompts.

**Props:**
```typescript
interface PromptSelectorProps {
  prompts: SpeakingPrompt[];
  onSelectPrompt: (prompt: SpeakingPrompt) => void;
  selectedPromptId?: string;
  className?: string;
}
```

**Usage:**
```typescript
<PromptSelector
  prompts={promptsData}  // From API
  onSelectPrompt={(prompt) => {
    setSelectedPrompt(prompt);
    router.push(`/speaking/practice?promptId=${prompt.id}`);
  }}
  selectedPromptId={currentPromptId}
/>
```

**Features:**
- Search by question/topic
- Filter by CEFR level
- Filter by topic
- Random prompt button

---

### 6. SubmissionHistory

**Purpose:** View past submissions.

**Props:**
```typescript
interface SubmissionHistoryProps {
  submissions: SpeakingSubmission[];
  onPlayRecording?: (audioUrl: string) => void;
  onViewFeedback?: (submission: SpeakingSubmission) => void;
  onDelete?: (submissionId: string) => void;
  className?: string;
}
```

**Usage:**
```typescript
<SubmissionHistory
  submissions={userSubmissions}  // From API
  onPlayRecording={(url) => {
    const audio = new Audio(url);
    audio.play();
  }}
  onViewFeedback={(submission) => {
    setFeedbackToShow(submission.feedback);
    setShowFeedbackModal(true);
  }}
  onDelete={async (id) => {
    await deleteSubmission(id);
    refetchSubmissions();
  }}
/>
```

**Filters:**
- CEFR level (all/A1-C2)
- Date (all/last 7 days/last 30 days)

---

### 7. ProgressDashboard

**Purpose:** Analytics and stats.

**Props:**
```typescript
interface ProgressDashboardProps {
  stats: SpeakingStats;
  className?: string;
}
```

**Usage:**
```typescript
<ProgressDashboard stats={userStats} />
```

**Data Structure:**
```typescript
const stats: SpeakingStats = {
  totalSubmissions: 45,
  averageOverallScore: 78,
  averagePronunciation: 75,
  averageFluency: 82,
  averageVocabulary: 77,
  averageGrammar: 79,
  mostCommonIssues: [
    'Pronunciation of "th" sounds',
    'Irregular verb tenses',
    'Filler words ("um", "uh")',
  ],
  cefrDistribution: {
    A1: 5,
    A2: 12,
    B1: 18,
    B2: 8,
    C1: 2,
    C2: 0,
  },
  scoreHistory: [
    { date: '2026-02-01', overall: 72 },
    { date: '2026-02-03', overall: 75 },
    { date: '2026-02-05', overall: 78 },
    // ... (last 10 submissions)
  ],
};
```

---

### 8. MobileLayout

**Purpose:** Responsive wrapper for desktop/mobile.

**Props:**
```typescript
interface MobileLayoutProps {
  children: ReactNode;
  feedbackPanel?: ReactNode;
  showFeedbackPanel?: boolean;
  className?: string;
}
```

**Usage:**
```typescript
<MobileLayout
  feedbackPanel={
    submission?.feedback ? (
      <FeedbackPanel feedback={submission.feedback} />
    ) : (
      <div>No feedback yet</div>
    )
  }
  showFeedbackPanel={!!submission?.feedback}
>
  <div className="p-6">
    {/* Main content */}
  </div>
</MobileLayout>
```

---

## Integration Examples

### Complete Practice Page

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MobileLayout,
  PromptDisplay,
  AudioRecorder,
  FeedbackPanel,
} from '@/components/speaking';
import type { SpeakingPrompt, SpeakingSubmission } from '@/types/speaking';

export default function SpeakingPracticePage({ promptId }: { promptId: string }) {
  const router = useRouter();
  const [submission, setSubmission] = useState<SpeakingSubmission | null>(null);
  
  // TODO: Replace with React Query hooks
  const { data: prompt } = usePrompt(promptId);
  const { mutateAsync: uploadSubmission } = useUploadSubmission();

  const handleRecordingComplete = async (blob: Blob, duration: number) => {
    try {
      // Create FormData
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');
      formData.append('promptId', promptId);
      formData.append('durationSeconds', duration.toString());

      // Upload and create submission
      const newSubmission = await uploadSubmission(formData);
      setSubmission(newSubmission);

      // Poll for feedback (analysis takes 10-30s)
      pollForFeedback(newSubmission.id);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <MobileLayout
      feedbackPanel={
        submission?.feedback ? (
          <FeedbackPanel feedback={submission.feedback} />
        ) : submission?.status === 'analyzing' ? (
          <div className="p-6 text-center">
            <p>Analyzing your speech...</p>
            <p className="text-sm text-gray-500">This may take 10-30 seconds</p>
          </div>
        ) : null
      }
      showFeedbackPanel={!!submission}
    >
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {prompt && (
          <>
            <PromptDisplay
              prompt={prompt}
              onPreparationComplete={() => {
                console.log('Preparation complete');
              }}
            />

            <AudioRecorder
              maxDurationSeconds={prompt.speakingTimeSeconds}
              onRecordingComplete={handleRecordingComplete}
              disabled={submission?.status === 'analyzing'}
            />
          </>
        )}
      </div>
    </MobileLayout>
  );
}
```

### Prompts List Page

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PromptSelector } from '@/components/speaking';

export default function PromptsPage() {
  const router = useRouter();
  
  // TODO: Replace with React Query
  const { data: prompts = [] } = usePrompts();

  return (
    <div className="max-w-7xl mx-auto p-6">
      <PromptSelector
        prompts={prompts}
        onSelectPrompt={(prompt) => {
          router.push(`/speaking/practice?promptId=${prompt.id}`);
        }}
      />
    </div>
  );
}
```

### History Page

```typescript
'use client';

import { SubmissionHistory } from '@/components/speaking';
import { useSubmissions, useDeleteSubmission } from '@/hooks/speaking';

export default function HistoryPage() {
  const { data: submissions = [] } = useSubmissions();
  const { mutateAsync: deleteSubmission } = useDeleteSubmission();

  return (
    <div className="max-w-7xl mx-auto p-6">
      <SubmissionHistory
        submissions={submissions}
        onPlayRecording={(url) => {
          const audio = new Audio(url);
          audio.play();
        }}
        onViewFeedback={(submission) => {
          // Navigate to detail page or open modal
          console.log('View feedback:', submission);
        }}
        onDelete={async (id) => {
          await deleteSubmission(id);
        }}
      />
    </div>
  );
}
```

### Dashboard Page

```typescript
'use client';

import { ProgressDashboard } from '@/components/speaking';
import { useSpeakingStats } from '@/hooks/speaking';

export default function DashboardPage() {
  const { data: stats } = useSpeakingStats();

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <ProgressDashboard stats={stats} />
    </div>
  );
}
```

---

## Data Flow

### 1. User Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Browse Prompts (PromptSelector)                          │
│    → User selects a prompt                                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Practice Session (PromptDisplay + AudioRecorder)         │
│    → Preparation timer counts down                          │
│    → User records audio                                     │
│    → onRecordingComplete fires                              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Upload to API                                            │
│    POST /api/speaking/submissions                           │
│    Body: { audio: Blob, promptId, duration }                │
│    Response: { id, status: 'analyzing', ... }               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Poll for Feedback (10-30 seconds)                        │
│    GET /api/speaking/submissions/:id                        │
│    Status: 'analyzing' → 'completed'                        │
│    Response includes feedback object                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Display Results (FeedbackPanel)                          │
│    → Scores, strengths, weaknesses, suggestions             │
│    → Pronunciation details (IPA, audio snippets)            │
└─────────────────────────────────────────────────────────────┘
```

### 2. State Management

**Recommended:** React Query for server state

```typescript
// hooks/speaking.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function usePrompts() {
  return useQuery({
    queryKey: ['speaking', 'prompts'],
    queryFn: () => fetch('/api/speaking/prompts').then(r => r.json()),
  });
}

export function useSubmissions() {
  return useQuery({
    queryKey: ['speaking', 'submissions'],
    queryFn: () => fetch('/api/speaking/submissions').then(r => r.json()),
  });
}

export function useUploadSubmission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (formData: FormData) =>
      fetch('/api/speaking/submissions', {
        method: 'POST',
        body: formData,
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries(['speaking', 'submissions']);
    },
  });
}

export function useSpeakingStats() {
  return useQuery({
    queryKey: ['speaking', 'stats'],
    queryFn: () => fetch('/api/speaking/stats').then(r => r.json()),
  });
}
```

---

## API Endpoints Required

### 1. GET /api/speaking/prompts

**Query Params:**
- `cefrLevel` (optional): A1|A2|B1|B2|C1|C2
- `topic` (optional): string

**Response:**
```json
[
  {
    "id": "prompt-123",
    "question": "Describe your favorite hobby.",
    "cefrLevel": "B1",
    "topic": "Hobbies",
    "preparationTimeSeconds": 60,
    "speakingTimeSeconds": 120,
    "evaluationCriteria": ["Pronunciation", "Fluency", "Vocabulary"],
    "tips": ["Speak clearly", "Use examples"],
    "createdAt": "2026-02-07T00:00:00Z"
  }
]
```

---

### 2. POST /api/speaking/submissions

**Body (FormData):**
- `audio`: File (Blob)
- `promptId`: string
- `durationSeconds`: number

**Response:**
```json
{
  "id": "sub-456",
  "userId": "user-789",
  "promptId": "prompt-123",
  "audioUrl": "https://cdn.example.com/audio/sub-456.webm",
  "durationSeconds": 118,
  "status": "analyzing",
  "createdAt": "2026-02-07T07:00:00Z",
  "updatedAt": "2026-02-07T07:00:00Z"
}
```

---

### 3. GET /api/speaking/submissions/:id

**Response (after analysis):**
```json
{
  "id": "sub-456",
  "userId": "user-789",
  "promptId": "prompt-123",
  "audioUrl": "https://cdn.example.com/audio/sub-456.webm",
  "durationSeconds": 118,
  "status": "completed",
  "feedback": {
    "scores": {
      "overall": 85,
      "pronunciation": 80,
      "fluency": 88,
      "vocabulary": 85,
      "grammar": 87
    },
    "strengths": ["Excellent fluency"],
    "weaknesses": ["Pronunciation of 'th' sounds"],
    "suggestions": ["Practice dental fricatives"],
    "pronunciationDetails": [
      {
        "word": "thought",
        "expectedIPA": "θɔːt",
        "actualIPA": "tɔːt",
        "accuracyScore": 65,
        "feedback": "Use dental fricative for 'th'",
        "position": { "start": 12.5, "end": 13.2 },
        "audioSnippetUrl": "https://cdn.example.com/snippets/sub-456-word-1.mp3"
      }
    ],
    "transcription": "I thought about my favorite hobby...",
    "durationSeconds": 118
  },
  "createdAt": "2026-02-07T07:00:00Z",
  "updatedAt": "2026-02-07T07:00:30Z"
}
```

---

### 4. GET /api/speaking/submissions

**Query Params:**
- `userId` (optional)
- `cefrLevel` (optional)
- `limit` (optional, default: 50)

**Response:** Array of submissions (same structure as #3)

---

### 5. DELETE /api/speaking/submissions/:id

**Response:**
```json
{ "success": true }
```

---

### 6. GET /api/speaking/stats

**Response:**
```json
{
  "totalSubmissions": 45,
  "averageOverallScore": 78,
  "averagePronunciation": 75,
  "averageFluency": 82,
  "averageVocabulary": 77,
  "averageGrammar": 79,
  "mostCommonIssues": ["Pronunciation of 'th'", "Irregular verbs"],
  "cefrDistribution": {
    "A1": 5,
    "A2": 12,
    "B1": 18,
    "B2": 8,
    "C1": 2,
    "C2": 0
  },
  "scoreHistory": [
    { "date": "2026-02-01", "overall": 72 },
    { "date": "2026-02-03", "overall": 75 }
  ]
}
```

---

## Testing Checklist

### Unit Tests (Component Behavior)
- [ ] AudioRecorder starts/stops recording
- [ ] PromptDisplay countdown works
- [ ] FeedbackPanel renders all sections
- [ ] PronunciationCard displays IPA correctly
- [ ] PromptSelector filters work
- [ ] SubmissionHistory filters work
- [ ] ProgressDashboard calculates stats correctly
- [ ] MobileLayout switches at 1024px breakpoint

### Integration Tests (Data Flow)
- [ ] Recording complete → blob passed to parent
- [ ] Prompt selection → state updates
- [ ] Submission delete → refetch data
- [ ] Feedback load → FeedbackPanel displays

### E2E Tests (User Journey)
- [ ] Select prompt → record → submit → view feedback
- [ ] Browse prompts → search → filter → select
- [ ] View history → play recording → delete
- [ ] View dashboard → see stats → trends

### Browser Compatibility
- [ ] Chrome (MediaRecorder support)
- [ ] Firefox (MediaRecorder support)
- [ ] Safari (MediaRecorder may need polyfill)
- [ ] Mobile browsers (iOS Safari, Chrome Android)

### Accessibility
- [ ] Keyboard navigation works
- [ ] ARIA labels present
- [ ] Focus indicators visible
- [ ] Screen reader compatible

### Dark Mode
- [ ] All components render correctly in dark mode
- [ ] Colors have sufficient contrast

### Responsive
- [ ] Mobile (320px-768px)
- [ ] Tablet (768px-1024px)
- [ ] Desktop (≥1024px)

---

## Known Limitations

1. **Safari MediaRecorder:** Safari's MediaRecorder API may produce different audio formats. Consider using a polyfill or server-side transcoding.

2. **Audio Blob Size:** Recordings can be 1-5 MB. Ensure your API supports multipart/form-data uploads up to 10 MB.

3. **Analysis Time:** Speech analysis takes 10-30 seconds. Implement polling or WebSocket for real-time updates.

4. **Waveform Performance:** Canvas rendering may lag on low-end devices. Consider throttling updates.

5. **IPA Font:** Ensure your font supports IPA characters (e.g., Google Fonts: Noto Sans, Roboto).

---

## Questions?

Contact frontend developer or check source code comments.

**End of Migration Guide**
