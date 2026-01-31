import Fastify from 'fastify';
import { InMemoryLogger } from '@dmf/infra/adapters';
import { createInMemoryMasteryRepository } from '../src/state/in-memory-mastery.repository';
import { createInMemorySkillScoreRepository } from '../src/state/in-memory-skillscore.repository';
import { setupEventConsumers } from '../src/events/consumers/index';
import { registerMasteryReadRoute } from '../src/http/queries/mastery.read.route';
import { AttemptStatus } from '@dmf/shared';
// Import local InMemoryEventBus to guarantee in-process behavior
// Path: services/motivation-progress-service/scripts/smoke-api.ts -> services/shared/event-bus.ts
import { InMemoryEventBus } from '../../shared/event-bus';

// Setup App (Mini version of index.ts)
async function buildApp() {
    const logger = new InMemoryLogger();
    // Use local InMemoryEventBus instead of infra sharedEventBus
    const eventBus = new InMemoryEventBus();
    const masteryRepo = createInMemoryMasteryRepository();
    const skillScoreRepo = createInMemorySkillScoreRepository();

    // Setup Consumers (Wire logic)
    setupEventConsumers(eventBus as any, { masteryRepo, skillScoreRepo, logger });

    const app = Fastify({ logger: false });

    // Setup Routes (Wire API)
    registerMasteryReadRoute(app, { masteryRepo, skillScoreRepo, logger });

    return { app, eventBus };
}

async function runApiSmokeTest() {
    console.log('🚀 Starting M3-lite API Smoke Test (Service Scope)...');

    const { app, eventBus } = await buildApp();
    await app.ready();

    const USER_ID = 'user-api-smoke';
    const EXPECTED_SCORE = 85;

    // 1. Emit Event (Updates In-Memory State)
    console.log('👉 Emitting learning.lesson.completed...');
    await eventBus.emit({
        event_name: 'learning.lesson.completed',
        timestamp: new Date().toISOString(),
        user_id: USER_ID,
        payload: {
            eventId: 'evt-2', // New ID
            userId: USER_ID,
            lessonId: 'L-API-2',
            attemptId: 'att-2',
            status: AttemptStatus.COMPLETED,
            score: EXPECTED_SCORE
        }
    });

    // Wait for processing
    await new Promise(r => setTimeout(r, 100));

    // 2. Call API (Reads In-Memory State)
    console.log(`👉 calling GET /api/read/mastery/${USER_ID}...`);
    const response = await app.inject({
        method: 'GET',
        url: `/api/read/mastery/${USER_ID}`
    });

    console.log('📬 Response Code:', response.statusCode);
    console.log('📦 Response Body:', response.body);

    if (response.statusCode !== 200) {
        console.error('❌ FAILURE: API returned non-200');
        process.exit(1);
    }

    const body = response.json();
    const overallScoreUi = body.overallScore; // Route returns 0-100 formatted

    // 0.85 * 100 = 85
    if (overallScoreUi === 85) {
        console.log('✨ SUCCESS: API returned correct score 85!');
        process.exit(0);
    } else {
        console.error(`❌ FAILURE: Expected 85, got ${overallScoreUi}`);
        process.exit(1);
    }
}

runApiSmokeTest().catch(err => {
    console.error('❌ Unhandled error:', err);
    process.exit(1);
});
