# Implementation Notes - Listening Module Phase 1

**Project:** DMF E-Learning Platform  
**Module:** Listening Comprehension  
**Phase:** 1 (Foundation + Core Exercises)  
**Date:** 2026-02-06  
**Audience:** Development Team

---

## 📋 Overview

This document provides practical implementation guidance, code examples, common pitfalls, and best practices for building the Listening Module Phase 1. Read this before starting development!

---

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
# Navigate to project root
cd /Users/huynhngocphuc/Dev-Workspace/Active-Projects/05-DMF-Elearning/dmf-elearning-platform

# Install new dependencies
npm install howler @aws-sdk/client-s3 @aws-sdk/s3-request-presigner fuse.js
npm install --save-dev @types/howler

# Verify installation
npm list howler @aws-sdk/client-s3 fuse.js
```

---

### 2. Configure Environment Variables

Create/update `.env.local`:

```bash
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=dmf-listening-audio
R2_PUBLIC_URL=https://pub-XXXXX.r2.dev

# Existing variables (Supabase, etc.)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
```

**How to get R2 credentials:**
1. Login to Cloudflare dashboard
2. R2 → Overview → Create API Token
3. Permissions: Read & Write for `dmf-listening-audio` bucket
4. Copy credentials to `.env.local`

---

### 3. Create R2 Bucket

**Via Cloudflare Dashboard:**
1. R2 → Create bucket
2. Name: `dmf-listening-audio`
3. Location: Auto (closest to users)
4. Public access: **Enabled** (read-only)

**CORS Configuration:**
```json
[
  {
    "AllowedOrigins": [
      "https://dmf-elearning.com",
      "http://localhost:3000"
    ],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

**Test bucket access:**
```bash
# Upload test file
aws s3 cp test.mp3 s3://dmf-listening-audio/ --endpoint-url https://<account-id>.r2.cloudflarestorage.com

# Verify public access
curl -I https://pub-XXXXX.r2.dev/test.mp3
# Should return 200 OK
```

---

### 4. Setup Database

**Run Prisma migration:**
```bash
# Create migration
npx prisma migrate dev --name add_listening_tables

# Apply to production
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

**Verify tables created:**
```sql
-- Connect to database
psql $DATABASE_URL

-- Check tables exist
\dt listening_*

-- Expected output:
-- listening_exercises
-- user_listening_progress
-- listening_attempts
```

---

### 5. Seed Database

**Prepare seed data** (see `data/listening-seed.json`):

```bash
# Run seed script
node scripts/seed-listening.mjs

# Expected output:
# Seeding 70 listening exercises...
# ✅ Seed complete!

# Verify data
psql $DATABASE_URL -c "SELECT difficulty, exercise_type, COUNT(*) FROM listening_exercises GROUP BY difficulty, exercise_type;"
```

---

## 💡 Code Examples

### Example 1: Cloudflare R2 Client Setup

**File:** `lib/r2-client.ts`

```typescript
import { S3Client } from '@aws-sdk/client-s3';

if (!process.env.R2_ACCOUNT_ID) {
  throw new Error('R2_ACCOUNT_ID environment variable is not set');
}

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});
```

**File:** `lib/r2-utils.ts`

```typescript
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client } from './r2-client';

export async function getAudioUrl(filename: string): Promise<string> {
  // Option 1: Public URL (recommended if bucket is public)
  return `${process.env.R2_PUBLIC_URL}/${filename}`;
  
  // Option 2: Presigned URL (if bucket is private)
  // const command = new GetObjectCommand({
  //   Bucket: process.env.R2_BUCKET_NAME,
  //   Key: filename,
  // });
  // return await getSignedUrl(r2Client, command, { expiresIn: 3600 });
}
```

---

### Example 2: Answer Checking (Dictation with Fuzzy Matching)

**File:** `lib/listening-utils.ts`

```typescript
import Fuse from 'fuse.js';

export function checkDictationAnswer(
  expectedText: string,
  userText: string
): { correct: boolean; accuracyScore: number; feedback: string } {
  // Normalize inputs
  const normalized = (text: string) =>
    text.toLowerCase().trim().replace(/[^\w\s]/g, '');
  
  const expected = normalized(expectedText);
  const user = normalized(userText);
  
  // Exact match
  if (expected === user) {
    return {
      correct: true,
      accuracyScore: 100,
      feedback: 'Perfect! You got it exactly right! 🎉',
    };
  }
  
  // Fuzzy matching (30% threshold)
  const fuse = new Fuse([expected], {
    threshold: 0.3,
    ignoreLocation: true,
    includeScore: true,
  });
  
  const result = fuse.search(user);
  
  if (result.length > 0 && result[0].score! < 0.3) {
    const accuracy = Math.round((1 - result[0].score!) * 100);
    return {
      correct: true,
      accuracyScore: accuracy,
      feedback: `Close! You got ${accuracy}% of it right. Keep practicing! 👍`,
    };
  }
  
  // Incorrect
  return {
    correct: false,
    accuracyScore: 0,
    feedback: `Not quite. The correct answer is: "${expectedText}"`,
  };
}
```

**Usage in API:**
```typescript
// pages/api/listening/submit.ts
const exercise = await prisma.listeningExercise.findUnique({
  where: { id: exercise_id },
});

let result;
if (exercise.exercise_type === 'dictation') {
  result = checkDictationAnswer(exercise.transcript, user_answer.text);
}
```

---

### Example 3: SRS Progress Update

**File:** `lib/srs/listening-srs.ts`

```typescript
import { prisma } from '@/lib/prisma';

export async function updateListeningProgress(
  userId: string,
  exerciseId: string,
  result: {
    correct: boolean;
    accuracyScore: number;
    timeSpentSeconds: number;
  }
) {
  // Fetch or create progress record
  const progress = await prisma.userListeningProgress.upsert({
    where: {
      user_id_exercise_id: { user_id: userId, exercise_id: exerciseId },
    },
    create: {
      user_id: userId,
      exercise_id: exerciseId,
      total_attempts: 1,
      correct_attempts: result.correct ? 1 : 0,
      last_attempt_at: new Date(),
      difficulty_rating: 5,
      ease_factor: 2.5,
      interval_days: 0,
    },
    update: {
      total_attempts: { increment: 1 },
      correct_attempts: result.correct ? { increment: 1 } : undefined,
      last_attempt_at: new Date(),
    },
  });
  
  // Calculate quality rating
  const exercise = await prisma.listeningExercise.findUnique({
    where: { id: exerciseId },
  });
  
  const quality = calculateQualityRating(
    result.correct,
    result.accuracyScore,
    result.timeSpentSeconds,
    exercise!.duration_seconds,
    progress.total_attempts
  );
  
  // Calculate next review
  const { nextReviewAt, interval, easeFactor } = calculateNextReview(
    progress,
    quality
  );
  
  // Update progress with SRS data
  await prisma.userListeningProgress.update({
    where: { id: progress.id },
    data: {
      next_review_at: nextReviewAt,
      interval_days: interval,
      ease_factor: easeFactor,
    },
  });
  
  return { quality, nextReviewAt };
}
```

---

### Example 4: React Query Hook for Exercises

**File:** `hooks/useListeningExercises.ts`

```typescript
import { useQuery } from '@tanstack/react-query';

interface FetchExercisesParams {
  difficulty?: number;
  limit?: number;
  type?: string;
}

export function useListeningExercises(params: FetchExercisesParams = {}) {
  return useQuery({
    queryKey: ['listening-exercises', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.difficulty) searchParams.set('difficulty', String(params.difficulty));
      if (params.limit) searchParams.set('limit', String(params.limit));
      if (params.type) searchParams.set('type', params.type);
      
      const response = await fetch(`/api/listening/exercises?${searchParams}`);
      if (!response.ok) throw new Error('Failed to fetch exercises');
      
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

**Usage in component:**
```tsx
function ListeningPage() {
  const { data, isLoading, error } = useListeningExercises({ difficulty: 3, limit: 10 });
  
  if (isLoading) return <ExerciseSkeleton />;
  if (error) return <ErrorMessage />;
  
  return (
    <div>
      {data.exercises.map((ex) => (
        <ExerciseCard key={ex.id} exercise={ex} />
      ))}
    </div>
  );
}
```

---

### Example 5: Audio Player with Howler.js

**File:** `components/listening/AudioPlayer.tsx` (simplified)

```tsx
import { useState, useEffect, useRef } from 'react';
import { Howl } from 'howler';

export function AudioPlayer({ audioUrl }: { audioUrl: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<Howl | null>(null);
  
  useEffect(() => {
    audioRef.current = new Howl({
      src: [audioUrl],
      html5: true,
      onplay: () => setIsPlaying(true),
      onpause: () => setIsPlaying(false),
      onend: () => setIsPlaying(false),
    });
    
    return () => {
      audioRef.current?.unload();
    };
  }, [audioUrl]);
  
  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
  };
  
  return (
    <button onClick={togglePlay}>
      {isPlaying ? 'Pause' : 'Play'}
    </button>
  );
}
```

**Common issue:** Audio doesn't play on iOS Safari
- **Fix:** User must interact first (button click)
- Howler.js handles this automatically if `html5: true`

---

## ⚠️ Common Pitfalls

### 1. CORS Errors with R2

**Symptom:**
```
Access to fetch at 'https://pub-XXX.r2.dev/audio.mp3' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Fix:**
- Add CORS configuration to R2 bucket (see Setup section)
- Verify `AllowedOrigins` includes your domain
- Test with `curl -I -H "Origin: http://localhost:3000" <audio-url>`

---

### 2. Howler.js Not Playing on Mobile

**Symptom:** Audio plays on desktop but not iOS/Android

**Fix:**
```typescript
// WRONG: Auto-play (blocked by browsers)
useEffect(() => {
  audioRef.current?.play(); // ❌ Won't work
}, []);

// RIGHT: Play on user interaction
<button onClick={() => audioRef.current?.play()}>
  Play Audio
</button>
```

**Additional tip:** Use `html5: true` in Howler config for better mobile support

---

### 3. Prisma Unique Constraint Violation

**Symptom:**
```
Error: Unique constraint failed on user_listening_progress.user_id_exercise_id
```

**Fix:** Use `upsert` instead of `create`:
```typescript
// WRONG
await prisma.userListeningProgress.create({ ... }); // ❌ Fails on duplicate

// RIGHT
await prisma.userListeningProgress.upsert({
  where: { user_id_exercise_id: { user_id, exercise_id } },
  create: { ... },
  update: { ... },
});
```

---

### 4. Fuzzy Matching Too Strict/Loose

**Symptom:** Users complain answers marked wrong when "close enough"

**Fix:** Adjust Fuse.js threshold:
```typescript
const fuse = new Fuse([expected], {
  threshold: 0.3, // 0 = exact match, 1 = match anything
  ignoreLocation: true,
});

// Experiment with values:
// 0.2 = strict (small typos allowed)
// 0.3 = moderate (recommended)
// 0.5 = loose (many typos allowed)
```

---

### 5. Slow Database Queries

**Symptom:** `GET /api/listening/exercises` takes > 500ms

**Fix:** Verify indexes exist:
```sql
-- Check indexes
\di listening_*

-- Missing index? Add it:
CREATE INDEX idx_exercises_difficulty ON listening_exercises(difficulty);
```

**Use `EXPLAIN ANALYZE` to debug:**
```sql
EXPLAIN ANALYZE
SELECT * FROM listening_exercises WHERE difficulty = 3 LIMIT 10;

-- Look for "Seq Scan" (bad) vs "Index Scan" (good)
```

---

### 6. Memory Leak with Howler.js

**Symptom:** Browser becomes slow after 10-20 exercises

**Fix:** Always cleanup on unmount:
```typescript
useEffect(() => {
  const audio = new Howl({ src: [audioUrl] });
  
  return () => {
    audio.unload(); // ✅ Critical! Free memory
  };
}, [audioUrl]);
```

---

## 🧪 Testing Strategy

### Unit Testing (Vitest)

**Test SRS algorithm:**
```typescript
// tests/srs/listening-srs.test.ts
import { describe, it, expect } from 'vitest';
import { calculateQualityRating } from '@/lib/srs/listening-srs';

describe('calculateQualityRating', () => {
  it('returns 5 for perfect score on first attempt', () => {
    expect(calculateQualityRating(true, 100, 5, 5, 1)).toBe(5);
  });
  
  it('returns 0 for incorrect answer', () => {
    expect(calculateQualityRating(false, 0, 10, 5, 2)).toBe(0);
  });
  
  it('returns 4 for 90% accuracy on first attempt', () => {
    expect(calculateQualityRating(true, 90, 5, 5, 1)).toBe(4);
  });
  
  // ... 20+ more test cases
});
```

**Run tests:**
```bash
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

---

### Integration Testing (API Routes)

**Test API endpoint:**
```typescript
// tests/api/listening.test.ts
import { describe, it, expect } from 'vitest';

describe('GET /api/listening/exercises', () => {
  it('returns exercises for difficulty 3', async () => {
    const response = await fetch('http://localhost:3000/api/listening/exercises?difficulty=3');
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.exercises).toBeInstanceOf(Array);
    expect(data.exercises.length).toBeGreaterThan(0);
    expect(data.exercises[0]).toHaveProperty('id');
    expect(data.exercises[0]).toHaveProperty('audio_url');
  });
  
  it('returns 400 for invalid difficulty', async () => {
    const response = await fetch('http://localhost:3000/api/listening/exercises?difficulty=99');
    expect(response.status).toBe(400);
  });
});
```

---

### Manual Testing Checklist

**Audio Player:**
- [ ] Play button starts audio
- [ ] Pause button stops audio
- [ ] Replay button restarts from 0:00
- [ ] Speed controls work (0.75x, 1x, 1.25x)
- [ ] Progress bar updates in real-time
- [ ] Keyboard shortcuts work (Space, R, 1-3)
- [ ] Works on Chrome, Firefox, Safari
- [ ] Works on iOS Safari (mobile)
- [ ] Works on Android Chrome (mobile)

**Exercise Types:**
- [ ] Dictation: Text input, submit button, feedback
- [ ] Multiple Choice: 4 options, selection works, submit
- [ ] Audio-Image: Images load, selection works, submit
- [ ] Fill-in-the-Blank: Dropdowns work, all blanks required

**Feedback System:**
- [ ] Correct answer: Green card, checkmark, XP animation
- [ ] Incorrect answer: Red card, shows correct answer
- [ ] Partial credit: Yellow card, shows accuracy %

**Progress Tracking:**
- [ ] Session progress updates (8/15 exercises)
- [ ] Overall progress accurate (dashboard)
- [ ] Streak increments daily
- [ ] Stats endpoint returns correct data

---

## 🚀 Deployment Checklist

### Pre-Deployment

**1. Code Quality:**
- [ ] All TypeScript errors fixed (`npm run type-check`)
- [ ] No console.log statements in production code
- [ ] All TODO comments addressed
- [ ] Code reviewed by at least 1 person

**2. Testing:**
- [ ] Unit tests passing (>80% coverage)
- [ ] API tests passing (100%)
- [ ] Manual testing complete (all 4 exercise types)
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Mobile testing (iOS, Android)

**3. Database:**
- [ ] Migrations run on staging
- [ ] Seed data populated (70 exercises)
- [ ] Indexes created (performance verified)
- [ ] Backup script tested

**4. Infrastructure:**
- [ ] R2 bucket configured (CORS, public access)
- [ ] 70 audio files uploaded
- [ ] Environment variables set (production)
- [ ] SSL certificate valid

---

### Deployment Steps

**1. Database Migration:**
```bash
# Connect to production
psql $PRODUCTION_DATABASE_URL

# Run migration
npx prisma migrate deploy

# Verify tables exist
\dt listening_*
```

**2. Seed Database:**
```bash
# Run seed script (production)
NODE_ENV=production node scripts/seed-listening.mjs

# Verify data
psql $PRODUCTION_DATABASE_URL -c "SELECT COUNT(*) FROM listening_exercises;"
# Expected: 70
```

**3. Deploy Next.js App:**
```bash
# Vercel deployment
vercel deploy --prod

# Wait for deployment to complete
# Verify: https://dmf-elearning.com/listening
```

**4. Smoke Test:**
```bash
# Test API endpoint
curl https://dmf-elearning.com/api/listening/exercises?difficulty=3

# Expected: 200 OK with exercise data

# Test audio URL
curl -I https://pub-XXXXX.r2.dev/a1-greeting-01.mp3

# Expected: 200 OK with audio/mpeg content-type
```

---

### Post-Deployment

**1. Monitor (First 24 hours):**
- [ ] Check error logs (Vercel, Sentry)
- [ ] Monitor API response times (Vercel Analytics)
- [ ] Verify audio files loading (browser DevTools Network tab)
- [ ] Check database connection pool (no leaks)

**2. User Feedback:**
- [ ] Ask 5 beta testers to complete 10 exercises
- [ ] Collect feedback on UX (easy to understand?)
- [ ] Note any bugs/issues reported

**3. Performance Check:**
```bash
# Run Lighthouse audit
npx lighthouse https://dmf-elearning.com/listening --view

# Target scores:
# Performance: > 85
# Accessibility: > 90
# Best Practices: > 90
```

---

## 🐛 Troubleshooting

### Issue: "Audio file not found" (404)

**Possible causes:**
1. Audio file not uploaded to R2
2. Incorrect audio_url in database
3. R2 bucket not public

**Debug steps:**
```bash
# Check if file exists
curl -I https://pub-XXXXX.r2.dev/a1-greeting-01.mp3

# Expected: 200 OK
# If 404: Upload file to R2
# If 403: Check bucket public access settings
```

---

### Issue: "Database connection error"

**Possible causes:**
1. DATABASE_URL incorrect
2. Connection pool exhausted
3. Firewall blocking Vercel IPs

**Debug steps:**
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# Check Prisma logs
# In code: console.log(await prisma.$queryRaw`SELECT 1;`)

# Restart Prisma client
npx prisma generate
```

---

### Issue: "React Query not updating"

**Possible causes:**
1. Stale data (cache not invalidating)
2. Query key mismatch

**Fix:**
```typescript
// After submit, invalidate exercises query
const queryClient = useQueryClient();

await submitAnswer(exerciseId, answer);

queryClient.invalidateQueries(['listening-exercises']);
queryClient.invalidateQueries(['listening-stats']);
```

---

### Issue: "Animations are janky (< 60fps)"

**Debug steps:**
```bash
# Chrome DevTools → Performance tab
# Record 5 seconds of scrolling/animations
# Look for:
# - Long tasks (> 50ms)
# - Layout thrashing
# - Heavy JavaScript execution
```

**Common fixes:**
- Use CSS `transform` instead of `top/left`
- Add `will-change: transform` to animated elements
- Debounce expensive operations
- Use `React.memo` for heavy components

---

## 📚 Additional Resources

### Documentation
- **Howler.js Docs:** https://howlerjs.com/
- **Cloudflare R2 Docs:** https://developers.cloudflare.com/r2/
- **Prisma Docs:** https://www.prisma.io/docs
- **React Query Docs:** https://tanstack.com/query/latest
- **Framer Motion Docs:** https://www.framer.com/motion/

### Tools
- **Postman Collection:** (Create for API testing)
- **Prisma Studio:** `npx prisma studio` (GUI for database)
- **React Query DevTools:** Install for debugging
- **Chrome Lighthouse:** Built into DevTools

### Support
- **PM Questions:** Ask in #dmf-listening-dev Slack channel
- **Tech Lead:** Escalate blockers > 4 hours
- **Bug Reports:** Create GitHub issues with reproduction steps

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-06  
**Maintained by:** Tech Lead  
**Questions?** Create a thread in #dmf-listening-dev
