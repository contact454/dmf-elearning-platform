# STEP 11 Runbook (MVP E2E Flow)
## Hướng dẫn Chạy Luồng E2E

This document shows how to run and test the E2E happy-path flow.

---

## Prerequisites (Điều kiện tiên quyết)

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build
```

---

## Start All Services (Khởi động Tất cả Dịch vụ)

```bash
# Start all services in development mode
pnpm dev
```

This will start:
- **onboarding-service** on port `3002`
- **curriculum-service** on port `3003`
- **practice-service** on port `3001`
- **progress-service** on port `3004`
- **motivation-progress-service** on port `3005`
- **assessment-service** on port `3006`

---

## E2E Happy-Path Flow (Luồng E2E Đường vui)

### Step 1: Register User (Đăng ký Người dùng)

```bash
curl -X POST http://localhost:3002/api/system/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "learner@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "targetLanguage": "de"
  }'
```

**Expected Response**:
```json
{
  "userId": "user-..."
}
```

**Event Emitted**: `system.user.registered`
- **Consumer**: `progress-service` initializes ProgressState

---

### Step 2: Login (Đăng nhập)

```bash
curl -X POST http://localhost:3002/api/system/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "learner@example.com",
    "password": "password123"
  }'
```

**Expected Response**:
```json
{
  "userId": "user-...",
  "token": "token_user-..."
}
```

**Event Emitted**: `system.user.login`

---

### Step 3: Enroll in Course (Ghi danh Khóa học)

```bash
# Use userId from Step 1
curl -X POST http://localhost:3003/api/curriculum/course/enroll \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-...",
    "courseId": "course-de-a1"
  }'
```

**Expected Response**:
```json
{
  "id": "enrollment-...",
  "userId": "user-...",
  "courseId": "course-de-a1",
  "enrolledAt": "2026-01-18T..."
}
```

**Event Emitted**: `curriculum.course.enrolled`
- **Consumer**: `progress-service` updates ProgressState with currentCourseId

---

### Step 4: Start Lesson (Bắt đầu Bài học)

```bash
curl -X POST http://localhost:3001/api/learning/lesson/start \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-...",
    "lessonId": "lesson-de-a1-01"
  }'
```

**Expected Response**:
```json
{
  "id": "attempt-...",
  "userId": "user-...",
  "lessonId": "lesson-de-a1-01",
  "status": "in-progress",
  "startedAt": "2026-01-18T..."
}
```

**Event Emitted**: `learning.lesson.started`

---

### Step 5: Submit Activity (Nộp Hoạt động)

```bash
# Use attemptId from Step 4
curl -X POST http://localhost:3001/api/learning/activity/submit \
  -H "Content-Type: application/json" \
  -d '{
    "attemptId": "attempt-...",
    "activityId": "activity-001",
    "type": "quiz",
    "answer": "answer123"
  }'
```

**Expected Response**:
```json
{
  "id": "submission-...",
  "attemptId": "attempt-...",
  "activityId": "activity-001",
  "type": "quiz",
  "answer": "answer123",
  "createdAt": "2026-01-18T..."
}
```

**Event Emitted**: `learning.submission.created`

---

### Step 6: Complete Lesson (Hoàn thành Bài học)

```bash
curl -X POST http://localhost:3001/api/learning/lesson/complete \
  -H "Content-Type: application/json" \
  -d '{
    "attemptId": "attempt-...",
    "status": "completed"
  }'
```

**Expected Response**:
```json
{
  "id": "attempt-...",
  "userId": "user-...",
  "lessonId": "lesson-de-a1-01",
  "status": "completed",
  "startedAt": "2026-01-18T...",
  "completedAt": "2026-01-18T..."
}
```

**Event Emitted**: `learning.lesson.completed`
- **Consumer**: `progress-service` updates ProgressState with completed lesson

---

### Step 7: Start Quiz (Bắt đầu Bài kiểm tra)

```bash
curl -X POST http://localhost:3006/api/commands/assessment.quiz.start \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-...",
    "quizId": "quiz-001"
  }'
```

**Expected Response**:
```json
{
  "id": "assessment-...",
  "userId": "user-...",
  "quizId": "quiz-001",
  "status": "in-progress",
  "startedAt": "2026-01-18T..."
}
```

**Event Emitted**: `assessment.quiz.started`
- **Consumer**: `motivation-progress-service` may update MasteryState

---

### Step 8: Submit Quiz (Nộp Bài kiểm tra)

```bash
# Use assessmentId from Step 7
curl -X POST http://localhost:3006/api/commands/assessment.quiz.submit \
  -H "Content-Type: application/json" \
  -d '{
    "assessmentId": "assessment-...",
    "answers": {
      "q1": "answer1",
      "q2": "answer2",
      "q3": "answer3"
    }
  }'
```

**Expected Response**:
```json
{
  "id": "assessment-...",
  "userId": "user-...",
  "quizId": "quiz-001",
  "status": "graded",
  "score": 75,
  "submittedAt": "2026-01-18T..."
}
```

**Event Emitted**: `assessment.quiz.submitted` (IDs-only, NO score in payload)
- **Consumer**: `motivation-progress-service` updates MasteryState and SkillScore
- **Consumer**: `assessment-service` invalidates ReadinessState cache

---

### Step 9: Query Dashboard (Truy vấn Bảng điều khiển)

```bash
curl -X GET "http://localhost:3004/api/learner/dashboard?userId=user-..."
```

**Expected Response**:
```json
{
  "dashboard": {
    "userId": "user-...",
    "currentCourseId": "course-de-a1",
    "progressSummary": {
      "completedLessons": 1,
      "completedUnits": 0,
      "totalLessons": 0,
      "totalUnits": 0
    },
    "masterySummary": {
      "overallScore": 0.75,
      "skillScores": {
        "grammar": 0.7,
        "vocabulary": 0.8,
        "speaking": 0.6,
        "listening": 0.75,
        "reading": 0.7,
        "writing": 0.65
      }
    },
    "readinessStatus": "not_ready",
    "lastUpdatedAt": "2026-01-18T..."
  }
}
```

**Note**: Dashboard aggregates data from:
- **ProgressState** (own state) → `progressSummary`
- **MasteryState** (read-only from motivation-progress-service) → `masterySummary`
- **ReadinessState** (read-only from assessment-service) → `readinessStatus`

---

## Event Flow Summary (Tóm tắt Luồng Sự kiện)

```
1. system.user.register
   └─> system.user.registered
       └─> progress-service: Initialize ProgressState

2. curriculum.course.enroll
   └─> curriculum.course.enrolled
       └─> progress-service: Update ProgressState.currentCourseId

3. learning.lesson.start
   └─> learning.lesson.started

4. learning.activity.submit
   └─> learning.submission.created

5. learning.lesson.complete
   └─> learning.lesson.completed
       └─> progress-service: Update ProgressState.completedLessons
       └─> motivation-progress-service: Update MasteryState
       └─> assessment-service: Invalidate ReadinessState cache

6. assessment.quiz.start
   └─> assessment.quiz.started

7. assessment.quiz.submit
   └─> assessment.quiz.submitted (IDs-only, NO score)
       └─> motivation-progress-service: Update MasteryState and SkillScore
       └─> assessment-service: Invalidate ReadinessState cache
```

## Outbox-like Emission Safety (An toàn Phát Sự kiện)

### Write-Then-Emit Pattern (Mẫu Ghi Rồi Mới Phát)

All command handlers follow a write-then-emit pattern to ensure events are not emitted twice:

1. **Write state** (Ghi trạng thái) - Persist entity changes
2. **Create outbox record** (Tạo bản ghi outbox) - Record event as pending
3. **Publish event** (Phát sự kiện) - Emit to event bus
4. **Mark outbox published** (Đánh dấu outbox đã phát hành) - Update status

### Safety Guarantees (Đảm bảo An toàn)

- **No duplicate events** (Không trùng lặp sự kiện): Events are deduplicated by `eventId` in outbox
- **Retry-safe** (An toàn khi thử lại): If handler fails after state write but before event emission, retry will check outbox and skip emission if already published
- **Command-key tracking** (Theo dõi khóa lệnh): Events are tracked by `commandKey` (correlationId or natural key) to prevent duplicate emissions for same command

### How It Works (Cách Hoạt động)

When a command handler emits an event:

```typescript
// 1. Write state
const user = await userRepository.create(...);

// 2. Emit via outbox (checks if already published)
await emitViaOutbox(
  { eventName: 'system.user.registered', payload: {...} },
  eventBus,
  outbox,
  commandKey // correlationId or natural key
);
```

The `emitViaOutbox` helper:
- Checks if `eventId` already exists in outbox with status `published` → skip emission
- Creates outbox record as `pending`
- Publishes event to event bus
- Marks outbox record as `published`

On retry: If the same `eventId` is found in outbox with status `published`, the event is not emitted again, ensuring idempotency.

---

## Idempotency Testing (Kiểm tra Idempotency)

### Test Idempotent Replay (Kiểm tra Phát lại Idempotent)

All commands support idempotency via `correlationId`. Calling the same command twice with the same `correlationId` returns the same result and emits only one event.

**Example: Register User Twice (Same correlationId)**

```bash
# First call
curl -X POST http://localhost:3002/api/system/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "learner@example.com",
    "password": "password123",
    "correlationId": "corr-123"
  }'

# Second call (same correlationId) - Returns same userId, no new event
curl -X POST http://localhost:3002/api/system/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "learner@example.com",
    "password": "password123",
    "correlationId": "corr-123"
  }'
```

**Expected**: Both calls return the same `userId`, but only one `system.user.registered` event is emitted (check logs).

### Test Conflict Without correlationId (Kiểm tra Conflict Không có correlationId)

Calling enroll twice without `correlationId` results in Conflict:

```bash
# First call
curl -X POST http://localhost:3003/api/curriculum/course/enroll \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-...",
    "courseId": "course-de-a1"
  }'

# Second call (same userId + courseId, no correlationId) - Returns 409 Conflict
curl -X POST http://localhost:3003/api/curriculum/course/enroll \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-...",
    "courseId": "course-de-a1"
  }'
```

**Expected**: Second call returns `409 Conflict`.

## Verification (Xác minh)

### Check Event Processing (Kiểm tra Xử lý Sự kiện)

Events are processed synchronously in-memory. Check service logs for:
- Event emission logs (should show only one event per unique correlationId)
- Event consumer logs
- ProgressState updates

### Check ProgressState (Kiểm tra ProgressState)

Query dashboard endpoint to verify ProgressState was updated correctly.

### Check Idempotency Store (Kiểm tra Kho Idempotency)

Idempotency results are stored in-memory. Multiple calls with same `correlationId` return cached results without emitting duplicate events.

---

## Error Semantics (Ngữ nghĩa Lỗi)

### Error Categories (Loại Lỗi)

Per STEP 4.4, all errors follow standardized categories:

| Category | HTTP Status | Usage |
|----------|-------------|-------|
| `ValidationError` | 400 | Invalid input (payload validation, format errors) |
| `NotFound` | 404 | Entity does not exist OR ownership check fails (hide existence per STEP 8B) |
| `Forbidden` | 403 | Role violations only (per STEP 8B) |
| `Conflict` | 409 | Resource already exists or state conflict |
| `IdempotentReplay` | 200/201 | Command already processed (same correlationId) - includes `replayed: true` flag |
| `TransientFailure` | 503 | Retryable failures (service unavailable, timeout) |

### Error Response Format (Định dạng Phản hồi Lỗi)

All errors follow this structure:

```json
{
  "error": {
    "code": "CONFLICT",
    "category": "Conflict",
    "message": "Conflict: Already enrolled",
    "details": {
      "reason": "Already enrolled"
    }
  }
}
```

### Examples (Ví dụ)

#### Conflict (409)

```bash
# First enrollment
curl -X POST http://localhost:3003/api/curriculum/course/enroll \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "courseId": "course-de-a1"
  }'

# Second enrollment (same userId + courseId, no correlationId) -> 409 Conflict
curl -X POST http://localhost:3003/api/curriculum/course/enroll \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "courseId": "course-de-a1"
  }'
```

**Response**:
```json
{
  "error": {
    "code": "CONFLICT",
    "category": "Conflict",
    "message": "Conflict: Already enrolled",
    "details": {
      "reason": "Already enrolled"
    }
  }
}
```

#### IdempotentReplay (200/201)

```bash
# First call
curl -X POST http://localhost:3002/api/system/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "pass123",
    "correlationId": "corr-123"
  }'

# Second call (same correlationId) -> 201 with replayed: true
curl -X POST http://localhost:3002/api/system/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "pass123",
    "correlationId": "corr-123"
  }'
```

**Response** (second call):
```json
{
  "userId": "user-...",
  "replayed": true
}
```

**Note**: Only one event is emitted (check logs). The second call returns the same `userId` without creating a new user or emitting a new event.

## Hardening Verification (Xác minh Củng cố)

### Automated Tests (Kiểm tra Tự động)

Run contract and E2E tests:

```bash
# Contract tests (IDs-only policy, command registry)
pnpm --filter @dmf/contracts test

# E2E idempotency tests
pnpm --filter @dmf/testing test
```

### Manual Verification Checklist (Danh sách Kiểm tra Thủ công)

#### 1. Idempotency Replay Check (Kiểm tra Phát lại Idempotent)

**Test**: Call same command twice with same `correlationId`

```bash
# First call
curl -X POST http://localhost:3002/api/system/user/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "pass123", "correlationId": "test-123"}'

# Second call (same correlationId)
curl -X POST http://localhost:3002/api/system/user/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "pass123", "correlationId": "test-123"}'
```

**Expected**:
- ✅ Both calls return same `userId`
- ✅ Second call includes `replayed: true` in response
- ✅ Only ONE event emitted (check service logs)
- ✅ HTTP 201 status (not 409)

#### 2. Conflict Check (Kiểm tra Xung đột)

**Test**: Call enroll twice without `correlationId` (or with different `correlationId`)

```bash
# First enrollment
curl -X POST http://localhost:3003/api/curriculum/course/enroll \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"userId": "user-123", "courseId": "course-de-a1", "correlationId": "enroll-1"}'

# Second enrollment (same userId + courseId, different/no correlationId)
curl -X POST http://localhost:3003/api/curriculum/course/enroll \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"userId": "user-123", "courseId": "course-de-a1"}'
```

**Expected**:
- ✅ Second call returns HTTP 409 Conflict
- ✅ Error response: `{"error": {"code": "CONFLICT", "category": "Conflict", ...}}`

#### 3. Outbox Check (Kiểm tra Outbox)

**Test**: Verify no duplicate events on retry

```bash
# Call command with correlationId
curl -X POST http://localhost:3001/api/learning/lesson/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"userId": "user-123", "lessonId": "lesson-abc", "correlationId": "start-1"}'

# Call again with same correlationId (simulate retry)
curl -X POST http://localhost:3001/api/learning/lesson/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"userId": "user-123", "lessonId": "lesson-abc", "correlationId": "start-1"}'
```

**Expected**:
- ✅ Check service logs for event emissions
- ✅ Only ONE `learning.lesson.started` event emitted
- ✅ Outbox records show first event as `published`, second skipped

#### 4. IDs-only Event Policy Check (Kiểm tra Chính sách Sự kiện Chỉ ID)

**Test**: Verify event payloads contain only IDs

```bash
# Trigger an event and check logs
# Event payload should contain ONLY:
# - eventId
# - occurredAt
# - correlationId (optional)
# - ID fields (userId, attemptId, lessonId, etc.)
# 
# Should NOT contain:
# - score, cefrLevel, email, passwordHash, text, audioUrl, etc.
```

**Expected**:
- ✅ All event payloads follow IDs-only policy
- ✅ No computed values (score, mastery) in events
- ✅ No PII (email, passwordHash) in events
- ✅ Run contract tests: `pnpm --filter @dmf/contracts test`

## Troubleshooting (Xử lý Sự cố)

### Service Not Starting

- Check port conflicts (3001-3004)
- Verify `pnpm install` completed successfully
- Check TypeScript compilation errors: `pnpm build`

### Events Not Processing

- Verify all services are running
- Check event bus logs in console
- Verify event consumers are registered

### 404/403 Errors

- Verify userId matches authenticated user (for ownership checks)
- Verify role is 'learner' (for role checks)
- Check command payload validation

### Error Response Format

All errors follow the standardized format with `code`, `category`, `message`, and optional `details`. Check the `category` field to determine the error type.

### Test Failures

- Run `pnpm build` to ensure all packages are compiled
- Check that in-memory adapters are properly initialized
- Verify test imports are correct (use workspace protocol)

---

**Last Updated**: 2026-01-18  
**Status**: ✅ Complete - E2E flow runnable
