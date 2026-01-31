import { InMemoryEventBus } from '../services/shared/event-bus';
import { InMemoryMasteryStore } from '../services/motivation-progress/store';
import { LessonCompletedConsumer } from '../services/motivation-progress/consumers/lesson-completed.consumer';
import { AttemptStatus, DomainEvent } from '@dmf/shared';

// Mocks
const MOCK_USER_ID = 'user-m3-smoke';
const MOCK_LESSON_ID = 'lesson-101';
const MOCK_ATTEMPT_ID = 'attempt-abc';

async function runSmokeTestM3() {
    console.log('🚀 Starting M3-lite Smoke Test (Progress & Mastery)...');

    // 1. Setup Infrastructure
    const eventBus = new InMemoryEventBus();
    const store = new InMemoryMasteryStore();
    const consumer = new LessonCompletedConsumer(store);

    // 2. Wire Consumer
    await eventBus.subscribe('learning.lesson.completed', async (event: any) => {
        await consumer.handle(event);
    });
    console.log('👀 Wired LessonCompletedConsumer to EventBus');

    // 3. Emit Event
    console.log('👉 Emitting learning.lesson.completed (Score: 85)...');
    const event: any = { // Casting as any to avoid strict union check in script for now
        event_name: 'learning.lesson.completed',
        timestamp: new Date().toISOString(),
        user_id: MOCK_USER_ID,
        payload: {
            lessonId: MOCK_LESSON_ID,
            attemptId: MOCK_ATTEMPT_ID,
            status: AttemptStatus.COMPLETED,
            score: 85 // 85%
        }
    };

    await eventBus.emit(event);

    // 4. Verification Check
    // Wait for async handler
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check Store
    const state = await store.get(MOCK_USER_ID);

    if (!state) {
        console.error('❌ FAILURE: No state found in store for user.');
        process.exit(1);
    }

    console.log('✅ State retrieved from store:', JSON.stringify(state, null, 2));

    // Assertions
    const lessonMastery = state.lessonMastery.find(l => l.lessonId === MOCK_LESSON_ID);
    if (!lessonMastery) {
        console.error('❌ FAILURE: Lesson mastery not found.');
        process.exit(1);
    }

    // 85 / 100 = 0.85
    if (lessonMastery.overallScore === 0.85) {
        console.log('✨ SUCCESS: Overall Score is 0.85 as expected.');
    } else {
        console.error(`❌ FAILURE: Expected 0.85, got ${lessonMastery.overallScore}`);
        process.exit(1);
    }

    if (state.skillScores.length === 4) {
        console.log('✨ SUCCESS: Skill breakdown populated.');
    } else {
        console.error('❌ FAILURE: Skill breakdown missing.');
        process.exit(1);
    }

    process.exit(0);
}

runSmokeTestM3().catch(err => {
    console.error('❌ Unhandled error:', err);
    process.exit(1);
});
