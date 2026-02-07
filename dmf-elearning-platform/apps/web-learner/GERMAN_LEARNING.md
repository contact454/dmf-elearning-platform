# German Learning - Frontend Integration

## ✅ COMPLETED

### Files Created

1. **API Client** - `src/services/german-api.ts`
   - Complete TypeScript API client with error handling
   - Retry logic with exponential backoff
   - Helper functions for formatting and display

2. **Learning Page** - `src/app/learn/german/page.tsx`
   - Duolingo-style UI with level selector
   - Topics grid with hover effects
   - Responsive design with Tailwind CSS

3. **Environment Config** - `.env.local`
   - Learning Service API URL configuration

## 🚀 Quick Start

### Prerequisites

1. **Learning Service must be running:**
   ```bash
   cd services/learning-service
   npm run dev
   # Should be running on http://localhost:3003
   ```

2. **Data Factory should be active:**
   ```bash
   pm2 list
   # german-factory should be "online"
   ```

### Access the Page

Navigate to: **http://localhost:3002/learn/german**

## 📡 API Client Usage

### Basic Example

```typescript
import { getLevels, getTopics, getVocabulary } from '@/services/german-api';

// Get all levels
const levels = await getLevels();
// Returns: ["A1", "A2", "B1", "B2"]

// Get topics for A1
const topics = await getTopics('A1');
// Returns: ["Conjunctions", "Food", "Family_name", ...]

// Get vocabulary
const data = await getVocabulary('A1', 'Food');
// Returns: { topic: "Food", level: "A1", vocabulary: [...], count: 10 }
```

### Error Handling

```typescript
import { GermanApiError } from '@/services/german-api';

try {
  const topics = await getTopics('A1');
} catch (error) {
  if (error instanceof GermanApiError) {
    console.error(`API Error: ${error.message}`);
    console.error(`Status: ${error.statusCode}`);
  }
}
```

### Helper Functions

```typescript
import {
  formatTopicName,
  getLevelDisplayName,
  getLevelColor,
} from '@/services/german-api';

// Format topic name
formatTopicName('Vietnamese_topic_name');
// Returns: "Vietnamese topic name"

// Get display name
getLevelDisplayName('A1');
// Returns: "Beginner (A1)"

// Get color theme
getLevelColor('A1');
// Returns: "emerald"
```

## 🎨 UI Components

### Level Selector
- Grid layout with 6 levels (A1-C2)
- Color-coded by level
- Active state with border highlight
- Lock icon for unavailable levels

### Topics Grid
- Responsive 3-column grid
- Card-based design with hover effects
- Progress indicator (placeholder)
- Click to navigate to topic detail

### Features
- Loading states with spinner
- Error handling with retry button
- Empty state when no data available
- Gradient backgrounds
- Smooth transitions and animations

## 🔧 API Functions

### Core Functions

| Function | Description | Returns |
|----------|-------------|---------|
| `getLevels()` | Get all available CEFR levels | `string[]` |
| `getTopics(level)` | Get topics for a level | `string[]` |
| `getVocabulary(level, topic)` | Get vocabulary data | `TopicData` |
| `getLevelSummary(level)` | Get level statistics | `LevelSummary` |
| `checkHealth()` | Check service status | `boolean` |

### Utility Functions

| Function | Description |
|----------|-------------|
| `formatTopicName(topic)` | Convert underscores to spaces |
| `getLevelDisplayName(level)` | Get formatted level name |
| `getLevelColor(level)` | Get Tailwind color class |

## 📊 Type Definitions

```typescript
interface VocabularyItem {
  word: string;
  pos: string;           // Part of speech
  meaning_vi: string;    // Vietnamese meaning
  source: string;        // "kaikki.org"
  addedAt: string;       // ISO timestamp
}

interface TopicData {
  topic: string;
  level: string;
  vocabulary: VocabularyItem[];
  count: number;
}

interface LevelSummary {
  level: string;
  topicCount: number;
  topics: string[];
}
```

## 🧪 Testing

Run API client tests:
```bash
cd apps/web-learner
npx tsx test-german-api.ts
```

## 🌐 Environment Variables

Required in `.env.local`:
```bash
NEXT_PUBLIC_LEARNING_API_URL=http://localhost:3003/api
```

## 🚧 Next Steps

### TODO
1. **Topic Detail Page** - `/learn/german/[level]/[topic]`
   - Display vocabulary cards
   - Add flashcard functionality
   - Implement quiz integration

2. **Progress Tracking**
   - Mark completed topics
   - Save user progress
   - Unlock levels based on completion

3. **Search & Filter**
   - Search vocabulary across topics
   - Filter by level
   - Sort by completion status

4. **Vocabulary Practice**
   - Spaced repetition system
   - Interactive exercises
   - Audio pronunciation

## 📝 Notes

- CORS is enabled on Learning Service (port 3003)
- Data is cached for 5 minutes on backend
- Frontend uses client-side rendering ('use client')
- Responsive design works on mobile/tablet/desktop

---

**Status:** ✅ Ready for Testing
**Last Updated:** 2026-01-31
