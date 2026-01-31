# Domain Events Guidelines
## Quy chuẩn Sự kiện Hệ thống

This document defines the standards and conventions for Domain Events in the DMF E-Learning Platform.

---

## 1. Why Events Exist / Vì sao cần Event

Domain Events enable **decoupled communication** between services in a microservices architecture.

### Benefits

- **Loose Coupling**: Services don't need direct dependencies on each other
- **Asynchronous Processing**: Events can be processed later (analytics, notifications, etc.)
- **Event Sourcing**: Events provide an audit trail of what happened
- **Scalability**: Event consumers can scale independently

### Anti-Pattern: "Học ảo" (Hallucination)

**DO NOT**:
- Invent events not in `contracts/events/events.catalog.md`
- Add payload fields not implied by the event name
- Create events for synchronous request/response patterns (use API calls instead)

**DO**:
- Use only events defined in the catalog
- Keep payloads minimal and stable
- Emit events from services, not from apps

---

## 2. Event Naming Convention / Quy ước Đặt Tên

### Format

```
domain.entity.action_past_tense
```

### Pattern

- **Domain**: `learning`, `assessment`, `curriculum`, `mentoring`, `system`
- **Entity**: The domain object (e.g., `lesson`, `quiz`, `user`)
- **Action**: Past tense verb (e.g., `started`, `completed`, `created`)

### Examples

✅ **Correct**:
- `learning.lesson.completed` - Lesson finished
- `assessment.quiz.submitted` - Quiz submitted
- `curriculum.unit.unlocked` - Unit unlocked
- `system.user.registered` - User registered

❌ **Wrong**:
- `learning.lesson.complete` (not past tense)
- `lesson.completed` (missing domain)
- `learning.complete_lesson` (wrong format)

### Rules

1. Use dots (`.`) as separators
2. Use lowercase with underscores
3. Use past tense for actions
4. Be specific: `lesson.completed` not `activity.done`

---

## 3. Payload Principles / Nguyên tắc Payload

### Minimal but Meaningful

Payloads should contain **only what's necessary** to understand the event:

```typescript
// ✅ Good: Minimal, clear
export interface LessonCompletedPayload {
    lessonId: LessonId;
    attemptId: AttemptId;
    status: AttemptStatus;
    score?: number;
}

// ❌ Bad: Too much data
export interface LessonCompletedPayload {
    lessonId: LessonId;
    attemptId: AttemptId;
    status: AttemptStatus;
    score?: number;
    userEmail: string;        // Not needed (in envelope.user_id)
    lessonTitle: string;       // Not needed (can be fetched)
    allSubmissions: Submission[]; // Too much data
}
```

### Stable

- **DO NOT** change payload structure without versioning
- **DO** use optional fields for new data
- **DO** use types from `@dmf/shared` (IDs, enums)

### Schema-Aligned

- Payloads must align with `contracts/events/events.schema.json`
- Use existing entity IDs and enums
- Don't invent new field types

### Conservative Approach

If the catalog lacks detail, use a **conservative payload**:

```typescript
// If catalog says "learning.lesson.completed" with no detail:
export interface LessonCompletedPayload {
    lessonId: LessonId;
    attemptId: AttemptId;
    // Add only what's clearly implied
}
```

**Conservative payload rule**: Conservative payloads MUST only include fields listed in `domain-events-payload-spec.md` tables (IDs, enums, status, score). No new fields outside spec. This enforces anti-hallucination and semantics freeze.

---

## 4. Versioning Rule / Quy ước Version

### When to Add Version

Add `version` field **only** when making breaking payload changes:

```typescript
// Version 1 (initial)
interface LessonCompletedPayload {
    lessonId: LessonId;
    attemptId: AttemptId;
}

// Version 2 (breaking change - removed attemptId)
interface LessonCompletedPayload {
    lessonId: LessonId;
    // attemptId removed
}
// → Must add version: "2.0"
```

### Version Format

- Use semantic versioning: `"1.0"`, `"2.0"`, `"2.1"`
- Major version for breaking changes
- Minor version for additive changes (new optional fields)

### Migration Strategy

1. **Add new version** to event type
2. **Keep old version** for backward compatibility
3. **Update consumers** gradually
4. **Deprecate old version** after migration

---

## 5. When to Emit Which Events / Khi nào Bắn Event

### Services Emit Events

**✅ Services** (`services/*`) emit events:
- After completing a business operation
- When state changes (lesson completed, unit unlocked)
- When user actions trigger domain logic

**Example**:
```typescript
// In services/practice/
async function completeLesson(attemptId: AttemptId) {
    // ... business logic ...
    
    // Emit event
    await eventBus.emit({
        event_name: 'learning.lesson.completed',
        timestamp: new Date().toISOString(),
        user_id: userId,
        session_id: attemptId,
        payload: { lessonId, attemptId, status: 'completed', score }
    });
}
```

### Apps Do NOT Emit Events

**❌ Apps** (`apps/*`) do NOT emit events directly:
- Apps call service APIs
- Services emit events after processing
- Apps are event consumers (for UI updates), not emitters

**Example**:
```typescript
// ❌ Wrong: App emitting event
// In apps/web-learner/
function handleLessonComplete() {
    eventBus.emit({ ... }); // NO!
}

// ✅ Correct: App calls service
// In apps/web-learner/
async function handleLessonComplete() {
    await api.post('/practice/complete-lesson', { attemptId });
    // Service emits event internally
}
```

### Event Flow

```
User Action (App)
    ↓
API Call (App → Service)
    ↓
Business Logic (Service)
    ↓
Event Emitted (Service → Event Bus)
    ↓
Event Consumers (Analytics, Notifications, etc.)
```

---

## 6. Domain Event Envelope / Khung Event Chuẩn

All events use the `DomainEvent` envelope:

```typescript
interface DomainEvent<TName, TPayload> {
    event_name: TName;        // Event name (e.g., 'learning.lesson.completed')
    timestamp: string;        // ISO 8601 date-time
    user_id: UserId;          // User who triggered the event
    session_id?: string | AttemptId; // Optional correlation ID
    payload: TPayload;         // Event-specific data
    context?: EventContext;   // Metadata (app, locale, device, traceId)
    version?: string;         // Optional version for evolution
}
```

### Required Fields

- `event_name`: Must match catalog
- `timestamp`: ISO 8601 format
- `user_id`: User who triggered the event
- `payload`: Event-specific data

### Optional Fields

- `session_id`: For correlating related events
- `context`: Metadata for debugging/analytics
- `version`: For future evolution

---

## 7. Glossary / Từ điển Mini

### English → Vietnamese

| Term | Vietnamese | Definition |
|------|------------|------------|
| **Domain Event** | Sự kiện hệ thống | An event representing something that happened in the domain |
| **Envelope** | Phong bì/khung chuẩn | The standard structure wrapping all events |
| **Payload** | Dữ liệu bên trong | Event-specific data inside the envelope |
| **Emit** | Phát event | To publish/send an event to the event bus |
| **Consumer** | Bên nhận/đọc event | Service or component that listens to events |
| **Event Bus** | Bus sự kiện | Infrastructure for routing events to consumers |
| **Event Catalog** | Danh mục sự kiện | List of all events defined in the system |
| **Correlation ID** | ID liên kết | ID used to group related events (e.g., session_id) |
| **Breaking Change** | Thay đổi phá vỡ | Change that requires consumers to update |

---

## 8. Usage Examples

### ✅ Good: Typed Event

```typescript
import { DomainEvent, LearningEvent } from '@dmf/shared';

// Type-safe event creation
const event: LearningEvent = {
    event_name: 'learning.lesson.completed',
    timestamp: new Date().toISOString(),
    user_id: userId,
    session_id: attemptId,
    payload: {
        lessonId: 'lesson-123',
        attemptId: 'attempt-456',
        status: AttemptStatus.COMPLETED,
        score: 85
    },
    context: {
        app: 'web-learner',
        locale: 'en-US'
    }
};
```

### ❌ Bad: Untyped Event

```typescript
// Don't use 'any' or loose types
const event: any = {
    event_name: 'learning.lesson.completed',
    // Missing required fields
    payload: { lessonId: 'lesson-123' } // Missing attemptId
};
```

### ✅ Good: Event Consumer

```typescript
import { LearningEvent } from '@dmf/shared';

function handleLearningEvent(event: LearningEvent) {
    switch (event.event_name) {
        case 'learning.lesson.completed':
            // TypeScript knows payload type
            console.log(event.payload.lessonId);
            console.log(event.payload.score);
            break;
    }
}
```

---

## 9. Event Catalog Reference

All events are defined in:
- **Catalog**: `contracts/events/events.catalog.md` (15 events)
- **Schema**: `contracts/events/events.schema.json` (envelope structure)
- **Types**: `packages/shared/src/events/` (TypeScript definitions)

### Event Count by Domain

- **Learning**: 4 events
- **Assessment**: 3 events
- **Curriculum**: 3 events
- **Mentoring**: 2 events
- **System**: 3 events
- **Total**: 15 events

---

## 10. Verification Checklist

Before emitting or consuming events:

- [ ] Event name matches `contracts/events/events.catalog.md`
- [ ] Payload uses types from `@dmf/shared` (IDs, enums)
- [ ] Payload is minimal (only necessary fields)
- [ ] Event is emitted from service, not app
- [ ] Envelope includes required fields (event_name, timestamp, user_id, payload)
- [ ] Version field added only for breaking changes
- [ ] Event types imported from `@dmf/shared` (not deep imports)

---

**Status**: ✅ Defined - All 15 events typed and ready for use  
**Related**: See [`domain-events-payload-spec.md`](./domain-events-payload-spec.md) for detailed payload specifications and semantics freeze policy.
