# Backend Developer (Audio) - Listening Module Phase 1

**Role:** Audio Storage & API Endpoints  
**Duration:** Weeks 1-8 (32-40 hours total)  
**Priority:** HIGH (blocks frontend development)

---

## 🎯 Your Mission

Setup audio file storage on Cloudflare R2, upload 70 exercise audio files, and implement API endpoints for fetching exercises, submitting answers, and retrieving user statistics.

---

## ✅ Task Checklist

### **Week 1-2: R2 Setup & Sample Upload**

- [ ] **Task 1.1: Create Cloudflare R2 bucket**
  - **Action:** Login to Cloudflare dashboard → R2 → Create bucket
  - **Bucket name:** `dmf-listening-audio`
  - **Settings:**
    - Public access: Enabled (read-only)
    - CORS: Allow GET requests from `dmf-elearning.com` and `localhost:3000`
  - **Duration:** 1 hour

- [ ] **Task 1.2: Configure bucket permissions**
  - **Policy:** Public read, authenticated write
  - **CORS Configuration:**
    ```json
    [
      {
        "AllowedOrigins": ["https://dmf-elearning.com", "http://localhost:3000"],
        "AllowedMethods": ["GET", "HEAD"],
        "AllowedHeaders": ["*"],
        "MaxAgeSeconds": 3600
      }
    ]
    ```
  - **Duration:** 1 hour

- [ ] **Task 1.3: Setup R2 access credentials**
  - **Create API token:** R2 dashboard → API Tokens → Create Token
  - **Permissions:** Read & Write to `dmf-listening-audio` bucket
  - **Store secrets:** Add to `.env.local`:
    ```
    R2_ACCOUNT_ID=your-account-id
    R2_ACCESS_KEY_ID=your-access-key
    R2_SECRET_ACCESS_KEY=your-secret-key
    R2_BUCKET_NAME=dmf-listening-audio
    R2_PUBLIC_URL=https://pub-XXXXX.r2.dev
    ```
  - **Duration:** 30 minutes

- [ ] **Task 1.4: Install R2 SDK**
  - **Package:** `npm install @aws-sdk/client-s3` (R2 is S3-compatible)
  - **Config file:** Create `lib/r2-client.ts`:
    ```typescript
    import { S3Client } from '@aws-sdk/client-s3';
    
    export const r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
    ```
  - **Duration:** 1 hour

- [ ] **Task 1.5: Upload 20 sample audio files**
  - **Files:** A1-level exercises (for testing)
  - **Format:** MP3, 96kbps, mono, 3-10 seconds
  - **Naming convention:** `a1-greeting-01.mp3`, `a1-greeting-02.mp3`, etc.
  - **Upload tool:** Use R2 dashboard or CLI
  - **Verification:** Test URLs in browser (should play audio)
  - **Duration:** 2 hours

- [ ] **Task 1.6: Test R2 presigned URL generation**
  - **Function:** Create `lib/r2-utils.ts`:
    ```typescript
    import { GetObjectCommand } from '@aws-sdk/client-s3';
    import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
    import { r2Client } from './r2-client';
    
    export async function getAudioUrl(filename: string): Promise<string> {
      const command = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: filename,
      });
      
      // Public URL (no presigning needed if bucket is public)
      return `${process.env.R2_PUBLIC_URL}/${filename}`;
      
      // OR use presigned URL (expires in 1 hour)
      // return await getSignedUrl(r2Client, command, { expiresIn: 3600 });
    }
    ```
  - **Test:** Generate URL and test in browser
  - **Duration:** 1 hour

---

### **Week 3-4: Upload All Audio Files & Implement Core APIs**

- [ ] **Task 2.1: Upload all 70 audio files to R2**
  - **Audio files by difficulty:**
    - A1 (1-2): 10 files (`a1-*.mp3`)
    - A2 (3-4): 10 files (`a2-*.mp3`)
    - B1 (5-6): 10 files (`b1-*.mp3`)
    - B2 (7-8): 10 files (`b2-*.mp3`)
    - C1 (9): 10 files (`c1-*.mp3`)
    - C2 (10): 10 files (`c2-*.mp3`)
    - Mixed: 10 files (`mixed-*.mp3`)
  - **Audio specs:**
    - Format: MP3
    - Bitrate: 96kbps (sufficient for speech)
    - Sample rate: 44.1kHz
    - Channels: Mono
    - Duration: 3-30 seconds
  - **Tool:** Batch upload via AWS CLI or R2 dashboard
  - **Duration:** 4 hours

- [ ] **Task 2.2: Coordinate audio URLs with DB Specialist**
  - **Action:** Provide list of audio URLs to DB Specialist
  - **Format:** CSV or JSON
    ```json
    [
      { "filename": "a1-greeting-01.mp3", "url": "https://pub-XXXXX.r2.dev/a1-greeting-01.mp3" },
      { "filename": "a1-greeting-02.mp3", "url": "https://pub-XXXXX.r2.dev/a1-greeting-02.mp3" }
    ]
    ```
  - **Duration:** 1 hour

- [ ] **Task 2.3: Implement `GET /api/listening/exercises` endpoint**
  - **File:** `pages/api/listening/exercises.ts`
  - **Query params:**
    - `difficulty` (optional, number 1-10) - Filter by difficulty
    - `limit` (optional, number, default 10) - Max results
    - `type` (optional, string) - Filter by exercise_type
  - **Logic:**
    ```typescript
    import { NextApiRequest, NextApiResponse } from 'next';
    import { prisma } from '@/lib/prisma';
    import { z } from 'zod';
    
    const querySchema = z.object({
      difficulty: z.coerce.number().min(1).max(10).optional(),
      limit: z.coerce.number().min(1).max(50).default(10),
      type: z.enum(['dictation', 'multiple_choice', 'audio_image', 'fill_blank']).optional(),
    });
    
    export default async function handler(req: NextApiRequest, res: NextApiResponse) {
      if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
      }
      
      try {
        const { difficulty, limit, type } = querySchema.parse(req.query);
        
        const exercises = await prisma.listeningExercise.findMany({
          where: {
            ...(difficulty && { difficulty }),
            ...(type && { exercise_type: type }),
          },
          take: limit,
          orderBy: { created_at: 'asc' },
        });
        
        return res.status(200).json({ exercises });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ error: error.errors });
        }
        console.error('Error fetching exercises:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }
    ```
  - **Duration:** 3 hours

- [ ] **Task 2.4: Implement `POST /api/listening/submit` endpoint**
  - **File:** `pages/api/listening/submit.ts`
  - **Request body:**
    ```typescript
    {
      exercise_id: string (UUID),
      user_answer: object, // type-specific (e.g., { text: "answer" })
      time_spent_seconds: number
    }
    ```
  - **Logic:**
    ```typescript
    import { NextApiRequest, NextApiResponse } from 'next';
    import { prisma } from '@/lib/prisma';
    import { z } from 'zod';
    import { checkAnswer } from '@/lib/listening-utils';
    
    const submitSchema = z.object({
      exercise_id: z.string().uuid(),
      user_answer: z.record(z.any()), // JSONB
      time_spent_seconds: z.number().min(0).max(600),
    });
    
    export default async function handler(req: NextApiRequest, res: NextApiResponse) {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }
      
      try {
        const userId = req.headers['x-user-id'] as string;
        if (!userId) {
          return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const { exercise_id, user_answer, time_spent_seconds } = submitSchema.parse(req.body);
        
        // Fetch exercise
        const exercise = await prisma.listeningExercise.findUnique({
          where: { id: exercise_id },
        });
        
        if (!exercise) {
          return res.status(404).json({ error: 'Exercise not found' });
        }
        
        // Check answer (type-specific logic)
        const result = checkAnswer(exercise, user_answer);
        
        // Calculate XP
        const xp = result.correct ? (result.accuracy_score >= 100 ? 10 : 7) : 0;
        
        // Save attempt
        await prisma.listeningAttempt.create({
          data: {
            user_id: userId,
            exercise_id,
            user_answer,
            correct: result.correct,
            time_spent_seconds,
            accuracy_score: result.accuracy_score,
            quality_rating: result.quality_rating, // 0-5 for SRS
          },
        });
        
        // Update progress (handled by SRS service in Task 2.5)
        
        return res.status(200).json({
          correct: result.correct,
          accuracy_score: result.accuracy_score,
          feedback: result.feedback,
          xp_earned: xp,
        });
      } catch (error) {
        console.error('Error submitting answer:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }
    ```
  - **Duration:** 4 hours

- [ ] **Task 2.5: Implement answer checking logic**
  - **File:** `lib/listening-utils.ts`
  - **Functions:**
    ```typescript
    import Fuse from 'fuse.js';
    
    export function checkAnswer(exercise: ListeningExercise, userAnswer: any) {
      switch (exercise.exercise_type) {
        case 'dictation':
          return checkDictation(exercise.transcript, userAnswer.text);
        
        case 'multiple_choice':
          return checkMultipleChoice(exercise.exercise_data, userAnswer.selectedIndex);
        
        case 'audio_image':
          return checkAudioImage(exercise.exercise_data, userAnswer.selectedImageId);
        
        case 'fill_blank':
          return checkFillBlank(exercise.exercise_data, userAnswer.answers);
        
        default:
          throw new Error(`Unknown exercise type: ${exercise.exercise_type}`);
      }
    }
    
    function checkDictation(expectedText: string, userText: string) {
      // Fuzzy matching (allow 30% difference)
      const fuse = new Fuse([expectedText], {
        threshold: 0.3,
        ignoreLocation: true,
      });
      
      const result = fuse.search(userText);
      
      if (result.length > 0 && result[0].score! < 0.3) {
        return {
          correct: true,
          accuracy_score: 100,
          feedback: 'Perfect! You got it right!',
          quality_rating: 5,
        };
      }
      
      const accuracy = Math.max(0, 100 - (result[0]?.score! * 100 || 100));
      
      return {
        correct: accuracy >= 70,
        accuracy_score: accuracy,
        feedback: generateFeedback(expectedText, userText),
        quality_rating: accuracy >= 90 ? 4 : accuracy >= 70 ? 3 : 2,
      };
    }
    
    function checkMultipleChoice(exerciseData: any, selectedIndex: number) {
      const correct = selectedIndex === exerciseData.correct_index;
      return {
        correct,
        accuracy_score: correct ? 100 : 0,
        feedback: correct ? 'Correct!' : `Incorrect. The correct answer was: ${exerciseData.options[exerciseData.correct_index]}`,
        quality_rating: correct ? 5 : 0,
      };
    }
    
    // ... other exercise types
    ```
  - **Duration:** 3 hours

- [ ] **Task 2.6: Write API tests**
  - **File:** `tests/api/listening.test.ts`
  - **Test cases:**
    - GET /api/listening/exercises (200, valid response structure)
    - GET /api/listening/exercises?difficulty=3 (filtered results)
    - POST /api/listening/submit (correct answer, 200)
    - POST /api/listening/submit (incorrect answer, 200 with feedback)
    - POST /api/listening/submit (invalid UUID, 400)
    - POST /api/listening/submit (no auth, 401)
  - **Tool:** Use Vitest or Jest
  - **Duration:** 3 hours

---

### **Week 5-6: Additional Endpoints & Optimization**

- [ ] **Task 3.1: Implement `GET /api/listening/stats` endpoint**
  - **File:** `pages/api/listening/stats.ts`
  - **Response:**
    ```typescript
    {
      total_exercises_completed: number,
      total_listening_time_seconds: number,
      average_accuracy: number, // 0-100
      current_streak: number,
      exercises_by_difficulty: { [difficulty: number]: number }
    }
    ```
  - **Logic:**
    ```typescript
    export default async function handler(req: NextApiRequest, res: NextApiResponse) {
      const userId = req.headers['x-user-id'] as string;
      
      const stats = await prisma.listeningAttempt.groupBy({
        by: ['user_id'],
        where: { user_id: userId },
        _count: { id: true },
        _sum: { time_spent_seconds: true },
        _avg: { accuracy_score: true },
      });
      
      // ... aggregate by difficulty, fetch streak, etc.
      
      return res.status(200).json(stats);
    }
    ```
  - **Duration:** 3 hours

- [ ] **Task 3.2: Implement `GET /api/listening/metadata/:exerciseId` endpoint**
  - **File:** `pages/api/listening/metadata/[exerciseId].ts`
  - **Response:**
    ```typescript
    {
      id: string,
      title: string,
      difficulty: number,
      duration_seconds: number,
      exercise_type: string,
      // NO transcript or answer key (prevent cheating)
    }
    ```
  - **Duration:** 1 hour

- [ ] **Task 3.3: Optimize audio streaming**
  - **Action:** Implement HTTP range requests (partial content) for large audio files
  - **Benefit:** Faster seeking, lower bandwidth
  - **Implementation:** R2 supports range requests by default
  - **Testing:** Test with curl: `curl -H "Range: bytes=0-1024" <audio-url>`
  - **Duration:** 2 hours

- [ ] **Task 3.4: Add audio compression**
  - **Tool:** Use FFmpeg to re-encode at 96kbps mono
    ```bash
    ffmpeg -i input.mp3 -b:a 96k -ac 1 output.mp3
    ```
  - **Benefit:** Reduce file size by ~40%, faster loading
  - **Action:** Re-encode all 70 files, re-upload to R2
  - **Duration:** 3 hours

- [ ] **Task 3.5: Write API documentation**
  - **File:** `.execution/API_DOCS_listening.md`
  - **Contents:**
    - Endpoint list (method, path, description)
    - Request/response examples (JSON)
    - Error codes (400, 401, 404, 500)
    - Rate limits (if any)
  - **Format:** Markdown with code blocks
  - **Duration:** 3 hours

---

### **Week 7-8: Testing & Polish**

- [ ] **Task 4.1: Integration testing (API + Database)**
  - **Scenarios:**
    - Fetch 10 exercises → Submit answer → Check progress updated
    - Fetch stats → Verify counts match database
    - Submit invalid data → Verify 400 error
  - **Tool:** Use Postman or write test scripts
  - **Duration:** 4 hours

- [ ] **Task 4.2: Error handling improvements**
  - **Add:**
    - Database connection errors (retry logic)
    - R2 unavailable (fallback error message)
    - Invalid audio files (log + skip)
  - **Duration:** 2 hours

- [ ] **Task 4.3: Security audit**
  - **Checklist:**
    - [ ] All endpoints require `x-user-id` header (auth)
    - [ ] Zod validation on all inputs
    - [ ] SQL injection prevention (Prisma parameterized queries)
    - [ ] XSS prevention (no raw HTML in responses)
    - [ ] CORS properly configured
  - **Duration:** 2 hours

- [ ] **Task 4.4: API performance optimization**
  - **Targets:**
    - GET /api/listening/exercises: \< 100ms (p95)
    - POST /api/listening/submit: \< 50ms (p95)
  - **Optimizations:**
    - Add database indexes (coordinate with DB Specialist)
    - Cache exercise data (Redis, optional)
    - Use Prisma query optimization (select only needed fields)
  - **Duration:** 3 hours

---

## 📊 Deliverables Summary

| Deliverable | File Path | Status |
|-------------|-----------|--------|
| R2 bucket configured | Cloudflare dashboard | ⬜ |
| 70 audio files uploaded | R2 bucket | ⬜ |
| GET /api/listening/exercises | `pages/api/listening/exercises.ts` | ⬜ |
| POST /api/listening/submit | `pages/api/listening/submit.ts` | ⬜ |
| GET /api/listening/stats | `pages/api/listening/stats.ts` | ⬜ |
| GET /api/listening/metadata/:id | `pages/api/listening/metadata/[exerciseId].ts` | ⬜ |
| Answer checking logic | `lib/listening-utils.ts` | ⬜ |
| API tests | `tests/api/listening.test.ts` | ⬜ |
| API documentation | `.execution/API_DOCS_listening.md` | ⬜ |

---

## 🎯 Success Criteria

- [ ] 70 audio files uploaded to R2
- [ ] All 4 API endpoints functional
- [ ] API response time \< 100ms (p95)
- [ ] All tests passing (\> 20 test cases)
- [ ] Security audit passed (no vulnerabilities)
- [ ] API documentation complete

---

## 🚨 Blockers & Dependencies

**Dependencies:**
- DB Specialist must create tables first (Week 1-2)
- Coordinate audio URL format with DB Specialist (Week 3-4)

**Potential Blockers:**
- R2 bucket creation issues → Contact Cloudflare support
- Audio files missing → Source from public domain or record manually
- CORS errors → Check bucket CORS config

**Escalation:**
- If blocked for \> 4 hours → Report to PM or Tech Lead

---

## 📚 Resources

**Documentation:**
- Cloudflare R2 Docs: https://developers.cloudflare.com/r2/
- AWS SDK for JavaScript: https://docs.aws.amazon.com/sdk-for-javascript/
- Zod Validation: https://zod.dev/
- Prisma Docs: https://www.prisma.io/docs

**Example Code:**
- See `.execution/BACKEND_COMPLETION_vocab_phase1.md` for API patterns

**Contact:**
- DB Specialist: For schema questions, audio URL coordination
- Backend Dev (SRS): For progress update integration
- Frontend Dev: For API response structure requirements

---

**Task File Version:** 1.0  
**Last Updated:** 2026-02-06  
**Owner:** Backend Developer (Audio)
