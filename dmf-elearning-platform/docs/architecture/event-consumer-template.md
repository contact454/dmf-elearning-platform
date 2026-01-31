# Safe Event Consumer Template
## Khung Consumer An toàn

This document provides a safe, no-logic template for implementing event consumers. It enforces boundaries and prevents unauthorized state mutations.

---

## Overview

**Purpose**: Provide a skeleton template for event consumers that enforces:
- State ownership rules
- No direct foreign state mutations
- Domain service calls (not direct DB access)
- Event emission for state changes

**Status**: Template only - no business logic implementation

---

## TypeScript Template

```typescript
import { DomainEvent, DomainEventUnion } from '@dmf/shared';
import { EventBus } from '../infra/event-bus'; // Placeholder - not implemented
import { CurriculumService } from '../domain/curriculum'; // Placeholder - not implemented

/**
 * Event Consumer Template
 * 
 * This is a SKELETON - no business logic yet.
 * Replace placeholders with actual domain services.
 */
export class CurriculumEventConsumer {
  constructor(
    private readonly curriculumService: CurriculumService,
    private readonly eventBus: EventBus
  ) {}

  /**
   * Handle Domain Events
   * 
   * Allowed:
   * - Validate event payload
   * - Call domain services (not direct DB access)
   * - Mutate ONLY own state (Progress, SRSItem, Enrollment)
   * - Emit new events if state changes
   * 
   * NOT Allowed:
   * - Mutate foreign state directly (Attempt, Submission, Assessment, etc.)
   * - Direct database access
   * - Business logic implementation (placeholder only)
   */
  async handleEvent(event: DomainEventUnion): Promise<void> {
    switch (event.event_name) {
      case 'learning.lesson.completed':
        await this.handleLessonCompleted(event);
        break;
      
      case 'assessment.level_test.completed':
        await this.handleLevelTestCompleted(event);
        break;
      
      case 'system.user.registered':
        await this.handleUserRegistered(event);
        break;
      
      // Add other events this consumer handles
      default:
        // Ignore events not handled by this consumer
        break;
    }
  }

  /**
   * Handle: learning.lesson.completed
   * 
   * Reaction: Unlock next lesson/unit if mastery threshold met
   * State: Progress (owned by curriculum-service)
   * 
   * Allowed:
   * - Read event payload (lessonId, attemptId, status, score)
   * - Call curriculumService.checkUnlock() to determine if unlock should happen
   * - Call curriculumService.unlockUnit() to mutate Progress state
   * - Emit curriculum.unit.unlocked if unlock happens
   * 
   * NOT Allowed:
   * - Mutate Attempt state (owned by practice-service)
   * - Direct DB access to Progress table
   * - Business logic for mastery calculation (call domain service)
   */
  private async handleLessonCompleted(
    event: DomainEvent<'learning.lesson.completed', LessonCompletedPayload>
  ): Promise<void> {
    // 1. Validate event payload
    if (!event.payload.lessonId || !event.payload.attemptId) {
      // Log error, skip processing
      return;
    }

    // 2. Call domain service to check if unlock should happen
    // TODO: Implement curriculumService.checkUnlock()
    const shouldUnlock = await this.curriculumService.checkUnlock(
      event.user_id,
      event.payload.lessonId,
      event.payload.score
    );

    if (shouldUnlock) {
      // 3. Call domain service to mutate OWN state (Progress)
      // TODO: Implement curriculumService.unlockNextUnit()
      const unlockedUnit = await this.curriculumService.unlockNextUnit(
        event.user_id,
        event.payload.lessonId
      );

      // 4. Emit new event if state changed
      if (unlockedUnit) {
        await this.eventBus.emit({
          event_name: 'curriculum.unit.unlocked',
          timestamp: new Date().toISOString(),
          user_id: event.user_id,
          session_id: event.session_id,
          payload: {
            unitId: unlockedUnit.unitId,
            courseId: unlockedUnit.courseId,
            reason: 'mastery' // From mastery threshold
          }
        });
      }
    }
  }

  /**
   * Handle: assessment.level_test.completed
   * 
   * Reaction: Unlock initial units up to determined level
   * State: Progress (owned by curriculum-service)
   * 
   * Allowed:
   * - Read event payload (assessmentId, finalGrade)
   * - Call curriculumService.unlockInitialUnits() to mutate Progress state
   * - Emit curriculum.unit.unlocked for each unlocked unit
   * 
   * NOT Allowed:
   * - Mutate Assessment state (owned by assessment-service)
   * - Mutate User state (owned by onboarding-service)
   * - Direct DB access
   */
  private async handleLevelTestCompleted(
    event: DomainEvent<'assessment.level_test.completed', LevelTestCompletedPayload>
  ): Promise<void> {
    // 1. Validate event payload
    if (!event.payload.assessmentId) {
      return;
    }

    // 2. Call domain service to determine initial level
    // TODO: Implement curriculumService.getInitialLevel()
    const initialLevel = await this.curriculumService.getInitialLevel(
      event.payload.assessmentId,
      event.payload.finalGrade
    );

    // 3. Call domain service to unlock initial units
    // TODO: Implement curriculumService.unlockInitialUnits()
    const unlockedUnits = await this.curriculumService.unlockInitialUnits(
      event.user_id,
      initialLevel
    );

    // 4. Emit events for each unlocked unit
    for (const unit of unlockedUnits) {
      await this.eventBus.emit({
        event_name: 'curriculum.unit.unlocked',
        timestamp: new Date().toISOString(),
        user_id: event.user_id,
        payload: {
          unitId: unit.unitId,
          courseId: unit.courseId,
          reason: 'assessment' // From level test
        }
      });
    }
  }

  /**
   * Handle: system.user.registered
   * 
   * Reaction: Initialize empty progress state
   * State: Progress (owned by curriculum-service)
   * 
   * Allowed:
   * - Read event payload (userId, targetLanguage)
   * - Call curriculumService.initializeProgress() to create empty Progress state
   * 
   * NOT Allowed:
   * - Mutate User state (owned by onboarding-service)
   * - Direct DB access
   */
  private async handleUserRegistered(
    event: DomainEvent<'system.user.registered', UserRegisteredPayload>
  ): Promise<void> {
    // 1. Validate event payload
    if (!event.payload.userId) {
      return;
    }

    // 2. Call domain service to initialize OWN state (Progress)
    // TODO: Implement curriculumService.initializeProgress()
    await this.curriculumService.initializeProgress(
      event.payload.userId,
      event.payload.targetLanguage
    );

    // No event emission needed (initialization, not a state change event)
  }
}
```

---

## Python Template (Alternative)

```python
from typing import Protocol
from packages.shared.events import DomainEvent, DomainEventUnion

class CurriculumService(Protocol):
    """Domain service interface - placeholder"""
    async def check_unlock(self, user_id: str, lesson_id: str, score: float) -> bool:
        """Check if next unit should unlock based on mastery"""
        ...
    
    async def unlock_next_unit(self, user_id: str, lesson_id: str) -> dict:
        """Unlock next unit - mutates Progress state"""
        ...

class EventBus(Protocol):
    """Event bus interface - placeholder"""
    async def emit(self, event: DomainEvent) -> None:
        """Emit domain event"""
        ...

class CurriculumEventConsumer:
    """
    Event Consumer Template (Python)
    
    This is a SKELETON - no business logic yet.
    """
    
    def __init__(
        self,
        curriculum_service: CurriculumService,
        event_bus: EventBus
    ):
        self.curriculum_service = curriculum_service
        self.event_bus = event_bus
    
    async def handle_event(self, event: DomainEventUnion) -> None:
        """Route event to appropriate handler"""
        event_name = event.event_name
        
        if event_name == 'learning.lesson.completed':
            await self.handle_lesson_completed(event)
        elif event_name == 'assessment.level_test.completed':
            await self.handle_level_test_completed(event)
        elif event_name == 'system.user.registered':
            await self.handle_user_registered(event)
        # Add other events...
    
    async def handle_lesson_completed(
        self,
        event: DomainEvent
    ) -> None:
        """
        Handle: learning.lesson.completed
        
        Allowed:
        - Validate payload
        - Call domain service
        - Mutate OWN state (Progress)
        - Emit new events
        
        NOT Allowed:
        - Mutate foreign state (Attempt, Submission, etc.)
        - Direct DB access
        """
        # 1. Validate payload
        payload = event.payload
        if not payload.get('lessonId') or not payload.get('attemptId'):
            return
        
        # 2. Call domain service
        should_unlock = await self.curriculum_service.check_unlock(
            event.user_id,
            payload['lessonId'],
            payload.get('score', 0)
        )
        
        if should_unlock:
            # 3. Mutate OWN state
            unlocked_unit = await self.curriculum_service.unlock_next_unit(
                event.user_id,
                payload['lessonId']
            )
            
            # 4. Emit new event
            if unlocked_unit:
                await self.event_bus.emit({
                    'event_name': 'curriculum.unit.unlocked',
                    'timestamp': datetime.now().isoformat(),
                    'user_id': event.user_id,
                    'session_id': event.session_id,
                    'payload': {
                        'unitId': unlocked_unit['unitId'],
                        'courseId': unlocked_unit['courseId'],
                        'reason': 'mastery'
                    }
                })
```

---

## Key Patterns

### 1. Event Routing
```typescript
// ✅ Allowed: Route events by event_name
switch (event.event_name) {
  case 'learning.lesson.completed':
    await this.handleLessonCompleted(event);
    break;
}
```

### 2. Payload Validation
```typescript
// ✅ Allowed: Validate payload before processing
if (!event.payload.lessonId || !event.payload.attemptId) {
  return; // Skip invalid events
}
```

### 3. Domain Service Calls
```typescript
// ✅ Allowed: Call domain service (not direct DB)
const shouldUnlock = await this.curriculumService.checkUnlock(
  event.user_id,
  event.payload.lessonId,
  event.payload.score
);
```

### 4. Own State Mutation
```typescript
// ✅ Allowed: Mutate OWN state via domain service
await this.curriculumService.unlockNextUnit(
  event.user_id,
  event.payload.lessonId
);
```

### 5. Event Emission
```typescript
// ✅ Allowed: Emit new event if state changed
await this.eventBus.emit({
  event_name: 'curriculum.unit.unlocked',
  timestamp: new Date().toISOString(),
  user_id: event.user_id,
  payload: { unitId, courseId, reason }
});
```

### 6. Forbidden Patterns
```typescript
// ❌ Forbidden: Mutate foreign state directly
await this.attemptRepository.update(attemptId, { status: 'completed' }); // NO!

// ❌ Forbidden: Direct DB access
await this.db.query('UPDATE progress SET unlocked = true'); // NO!

// ❌ Forbidden: Business logic in consumer
const mastery = calculateMastery(score); // NO! Call domain service instead
```

---

## Implementation Checklist

Before implementing a consumer, verify:
- [ ] Consumer only handles events relevant to its domain
- [ ] Consumer validates event payload before processing
- [ ] Consumer calls domain services (not direct DB access)
- [ ] Consumer mutates ONLY its own state
- [ ] Consumer emits new events if state changes
- [ ] Consumer does not mutate foreign state
- [ ] Consumer does not contain business logic (calls domain services)

---

## Example: Practice Service Consumer (Skeleton)

```typescript
/**
 * Practice Service Event Consumer
 * 
 * Handles events that affect Practice domain state (Attempt, Submission)
 */
export class PracticeEventConsumer {
  constructor(
    private readonly practiceService: PracticeService,
    private readonly eventBus: EventBus
  ) {}

  async handleEvent(event: DomainEventUnion): Promise<void> {
    // Practice service typically EMITS events, not consumes them
    // But it may consume curriculum.srs_items.due to suggest reviews
    switch (event.event_name) {
      case 'curriculum.srs_items.due':
        await this.handleSRSItemsDue(event);
        break;
    }
  }

  private async handleSRSItemsDue(
    event: DomainEvent<'curriculum.srs_items.due', SRSItemsDuePayload>
  ): Promise<void> {
    // Allowed: Suggest review activities based on due SRS items
    // NOT allowed: Mutate SRSItem state (owned by curriculum-service)
    // TODO: Implement practiceService.suggestSRSReview()
    await this.practiceService.suggestSRSReview(
      event.user_id,
      event.payload.itemIds
    );
  }
}
```

---

**Last Updated**: 2024-12-19  
**Status**: ✅ Template Complete - Ready for Implementation
