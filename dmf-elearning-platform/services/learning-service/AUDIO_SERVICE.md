# Audio Generation Service (Task 3.3)

## Overview

Text-to-Speech (TTS) service for generating audio pronunciations of German vocabulary words. Supports Google Cloud TTS with automatic fallback to browser Web Speech API.

## Features

- ✅ Google Cloud TTS integration (high quality)
- ✅ Automatic Web Speech API fallback (no API key required)
- ✅ Audio URL caching in database
- ✅ Batch audio generation
- ✅ RESTful API endpoints
- ✅ Error handling and logging
- ✅ 77%+ test coverage

## Architecture

```
┌─────────────────┐
│  Frontend       │
│  (Web Learner)  │
└────────┬────────┘
         │ GET /api/audio/:wordId
         ▼
┌─────────────────┐
│  Audio API      │
│  Routes         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│  TTS Service    │────▶│  Google Cloud    │
│                 │     │  TTS API         │
└────────┬────────┘     └──────────────────┘
         │
         ▼
┌─────────────────┐
│  Database       │
│  (Cache)        │
└─────────────────┘
```

## API Endpoints

### 1. Get Audio URL

```http
GET /api/audio/:wordId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "wordId": "clw123abc",
    "word": "Hallo",
    "audioUrl": "data:audio/mp3;base64,...",
    "cached": true,
    "fallbackRequired": false
  }
}
```

**Status Codes:**
- `200` - Success (with or without audio)
- `404` - Word not found
- `400` - Invalid word ID format
- `500` - Internal server error

### 2. Batch Audio Generation

```http
POST /api/audio/batch
```

**Request Body:**
```json
{
  "wordIds": ["clw1", "clw2", "clw3"],
  "force": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 3,
    "successful": 3,
    "failed": 0,
    "errors": []
  }
}
```

**Limits:**
- Max 100 words per batch
- Rate limiting: 100ms delay between requests

### 3. Clear Audio Cache

```http
DELETE /api/audio/:wordId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "wordId": "clw123abc",
    "message": "Audio cache cleared successfully"
  }
}
```

## Setup

### 1. Install Dependencies

```bash
npm install zod
npm install --save-optional @google-cloud/text-to-speech
```

### 2. Environment Variables

```bash
# Optional - if not set, will use Web Speech API fallback
GOOGLE_TTS_API_KEY=your-api-key-here
```

### 3. Database Schema

The `audioUrl` field already exists in `VocabularyItem` model:

```prisma
model VocabularyItem {
  id       String  @id @default(cuid())
  word     String  @unique
  audioUrl String? // TTS audio URL (cached)
  // ... other fields
}
```

## Usage Examples

### Frontend Integration

```typescript
import { useQuery } from '@tanstack/react-query';

function WordAudioPlayer({ wordId, word }) {
  const { data, isLoading } = useQuery({
    queryKey: ['audio', wordId],
    queryFn: async () => {
      const res = await fetch(`/api/audio/${wordId}`);
      return res.json();
    }
  });

  const playAudio = () => {
    if (data?.data?.audioUrl) {
      // Use backend audio
      const audio = new Audio(data.data.audioUrl);
      audio.play();
    } else {
      // Fallback to Web Speech API
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'de-DE';
      speechSynthesis.speak(utterance);
    }
  };

  return <button onClick={playAudio}>🔊 Play</button>;
}
```

### Backend Batch Generation

```typescript
import * as ttsService from './services/ttsService';

// Generate audio for new vocabulary imports
const wordIds = ['word1', 'word2', 'word3'];
const results = await ttsService.batchGenerateAudio(wordIds);

console.log(`Generated: ${results.success}, Failed: ${results.failed}`);
```

## Cost Analysis

### Google Cloud TTS Pricing

- **$4 per 1 million characters**
- Average German word: ~20 characters
- 1,000 words: 20,000 chars = **$0.08**
- 10,000 words: 200,000 chars = **$0.80**

**Recommendation:** Pre-generate audio during vocabulary import to avoid runtime costs.

### Web Speech API (Fallback)

- **Free** - browser-based
- **Lower quality** than Google TTS
- **No network cost**
- **Offline capable**

## Testing

### Run Tests

```bash
# All tests
npm test

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Coverage Results

```
✅ ttsService.ts:    77.45% lines, 76% branches
✅ audioRoutes.ts:   92.48% lines, 87.5% branches
```

### Test Cases

**TTS Service (15 tests):**
- ✅ Cached audio URL retrieval
- ✅ TTS client not configured (fallback)
- ✅ Audio generation and caching
- ✅ Error handling
- ✅ Language code support
- ✅ Batch processing
- ✅ Rate limiting
- ✅ Cache clearing
- ✅ Edge cases (empty text, special chars, long text)

**Audio Routes (17 tests):**
- ✅ GET endpoint validation
- ✅ POST batch generation
- ✅ DELETE cache clearing
- ✅ Error responses (400, 404, 500)
- ✅ Request body validation
- ✅ Response format consistency

## Implementation Details

### Cache Strategy

1. **Check database first** - return if exists
2. **Generate if missing** - call Google TTS
3. **Store in database** - cache for future requests
4. **Return null on error** - frontend uses fallback

### Error Handling

All errors are caught and logged, returning `null` to trigger Web Speech API fallback:

```typescript
try {
  // Attempt Google TTS
  const audioUrl = await generateAudioUrl(wordId, text);
  return audioUrl;
} catch (error) {
  console.error('[ttsService]', error);
  return null; // Fallback to browser
}
```

### Rate Limiting

Batch generation includes 100ms delay between requests to respect API limits:

```typescript
for (const wordId of wordIds) {
  await generateAudioUrl(wordId, word);
  await new Promise(resolve => setTimeout(resolve, 100));
}
```

## Files Created

```
services/learning-service/src/
├── services/
│   ├── ttsService.ts (161 lines)
│   └── __tests__/
│       └── ttsService.test.ts (348 lines)
├── routes/
│   ├── audioRoutes.ts (172 lines)
│   └── __tests__/
│       └── audioRoutes.test.ts (316 lines)
└── routes/index.ts (updated)

Configuration:
├── package.json (updated - added dependencies)
├── vitest.config.ts (new)
└── vitest.setup.ts (new)
```

## Next Steps

1. **Frontend Integration** (Frontend Dev)
   - Create `useAudio` hook
   - Add audio player component
   - Implement flashcard audio button

2. **Production Deployment**
   - Set up Google Cloud TTS API key
   - Configure S3/Cloud Storage for audio files
   - Add CDN for faster audio delivery

3. **Performance Optimization**
   - Pre-generate audio during vocabulary imports
   - Implement audio streaming for long texts
   - Add Redis cache layer

## Troubleshooting

### "TTS client not available"

**Cause:** Google TTS package not installed or API key missing

**Solution:**
```bash
npm install @google-cloud/text-to-speech
export GOOGLE_TTS_API_KEY=your-key
```

**Fallback:** Web Speech API will be used automatically

### "Audio not playing"

**Cause:** Browser autoplay policy or unsupported format

**Solution:**
- Require user interaction (button click)
- Use Web Speech API as fallback
- Check browser console for errors

### "Batch generation slow"

**Cause:** Rate limiting delays

**Solution:**
- Pre-generate audio during vocabulary import
- Use batch endpoint for bulk operations
- Consider async background jobs

## License

MIT

---

**Status:** ✅ Complete (Task 3.3)  
**Test Coverage:** 77-92% ✅  
**Dependencies:** None (parallel task) ✅  
**Ready for Integration:** YES ✅
