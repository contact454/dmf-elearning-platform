/**
 * M1-lite smoke (in-process):
 * register -> profile modify -> placement submit
 * + correlation/idempotency replay checks + event emission checks.
 */

import {
  InMemoryDatabase,
  InMemoryEventBus,
  InMemoryIdempotencyStore,
  InMemoryOutbox,
  sharedEventBus,
} from '../packages/infra/src/adapters/index.js';
import type { Event } from '../packages/infra/src/event-bus.js';
import { UserRepository } from '../services/onboarding-service/src/state/user.repository.js';
import { handleSystemUserRegister } from '../services/onboarding-service/src/application/system.user.register.handler.js';
import { handleSystemProfileModify } from '../services/onboarding-service/src/application/system.profile.modify.handler.js';
import { handleOnboardingPlacementSubmit } from '../services/onboarding-service/src/application/onboarding.placement.submit.handler.js';

async function main(): Promise<void> {
  console.log('🧪 M1-lite Smoke Test (active onboarding-service handlers)\n');

  const eventBus = sharedEventBus;
  if (eventBus instanceof InMemoryEventBus) {
    eventBus.clearProcessedEvents();
  }

  const db = new InMemoryDatabase();
  await db.connect({ host: 'localhost', port: 5432, database: 'onboarding-smoke' });
  const userRepository = new UserRepository(db);
  const idempotencyStore = new InMemoryIdempotencyStore();
  const outbox = new InMemoryOutbox();

  const seenEvents: Event[] = [];
  await eventBus.subscribe('*', async (event) => {
    seenEvents.push(event);
  });

  const registerCorrelationId = `m1-register-${Date.now()}`;
  const profileCorrelationId = `m1-profile-${Date.now()}`;
  const placementCorrelationId = `m1-placement-${Date.now()}`;

  try {
    console.log('Step 1: Register user...');
    const registerResult = await handleSystemUserRegister(
      {
        email: `m1-${Date.now()}@example.com`,
        password: 'Password123',
        firstName: 'M1',
        lastName: 'Smoke',
        targetLanguage: 'de',
        correlationId: registerCorrelationId,
      },
      {},
      { userRepository, eventBus, idempotencyStore, outbox }
    );
    console.log(`✅ userId=${registerResult.userId}`);

    console.log('Step 2: Modify profile...');
    const profileResult = await handleSystemProfileModify(
      {
        userId: registerResult.userId,
        firstName: 'M1',
        lastName: 'Smoke Updated',
        targetLanguage: 'en',
        correlationId: profileCorrelationId,
      },
      { userId: '' },
      { userRepository, eventBus, idempotencyStore, outbox }
    );
    if (!profileResult.userId) {
      throw new Error('Profile modify did not return userId');
    }
    console.log(`✅ profile updated for userId=${profileResult.userId}`);

    console.log('Step 3: Submit placement...');
    const placementResult = await handleOnboardingPlacementSubmit(
      {
        userId: registerResult.userId,
        answers: [{ id: 'q1', answer: 'A' }, { id: 'q2', answer: 'B' }],
        correlationId: placementCorrelationId,
      },
      { userRepository, eventBus, idempotencyStore, outbox }
    );
    if (!placementResult.assessmentId) {
      throw new Error('Placement submit did not return assessmentId');
    }
    console.log(`✅ assessmentId=${placementResult.assessmentId}`);

    console.log('Step 4: Replay same correlations (idempotency)...');
    const registerReplay = await handleSystemUserRegister(
      {
        email: `ignored-${Date.now()}@example.com`,
        password: 'Password123',
        firstName: 'M1',
        lastName: 'Replay',
        targetLanguage: 'de',
        correlationId: registerCorrelationId,
      },
      {},
      { userRepository, eventBus, idempotencyStore, outbox }
    );
    const profileReplay = await handleSystemProfileModify(
      {
        userId: registerResult.userId,
        firstName: 'M1',
        lastName: 'Replay',
        targetLanguage: 'vi',
        correlationId: profileCorrelationId,
      },
      { userId: '' },
      { userRepository, eventBus, idempotencyStore, outbox }
    );
    const placementReplay = await handleOnboardingPlacementSubmit(
      {
        userId: registerResult.userId,
        answers: [{ id: 'q1', answer: 'C' }],
        correlationId: placementCorrelationId,
      },
      { userRepository, eventBus, idempotencyStore, outbox }
    );

    if (!registerReplay.replayed || registerReplay.userId !== registerResult.userId) {
      throw new Error('Register replay failed idempotency check');
    }
    if (!profileReplay.replayed || profileReplay.userId !== profileResult.userId) {
      throw new Error('Profile replay failed idempotency check');
    }
    if (!placementReplay.replayed || placementReplay.assessmentId !== placementResult.assessmentId) {
      throw new Error('Placement replay failed idempotency check');
    }
    console.log('✅ idempotent replays returned original IDs');

    const eventNames = seenEvents.map((e) => e.eventName);
    const expectedNames = [
      'system.user.registered',
      'system.profile.updated',
      'assessment.level_test.completed',
    ];
    for (const expectedName of expectedNames) {
      if (!eventNames.includes(expectedName as Event['eventName'])) {
        throw new Error(`Missing emitted event: ${expectedName}`);
      }
    }

    const byName = (name: Event['eventName']) =>
      seenEvents.find((e) => e.eventName === name);
    const registerEvent = byName('system.user.registered');
    const profileEvent = byName('system.profile.updated');
    const placementEvent = byName('assessment.level_test.completed');

    if (registerEvent?.payload.correlationId !== registerCorrelationId) {
      throw new Error('Register event missing correlationId');
    }
    if (profileEvent?.payload.correlationId !== profileCorrelationId) {
      throw new Error('Profile event missing correlationId');
    }
    if (placementEvent?.payload.correlationId !== placementCorrelationId) {
      throw new Error('Placement event missing correlationId');
    }

    const registerCount = seenEvents.filter((e) => e.eventName === 'system.user.registered').length;
    const profileCount = seenEvents.filter((e) => e.eventName === 'system.profile.updated').length;
    const placementCount = seenEvents.filter((e) => e.eventName === 'assessment.level_test.completed').length;
    if (registerCount !== 1 || profileCount !== 1 || placementCount !== 1) {
      throw new Error('Idempotent replays emitted duplicate events');
    }

    console.log('\n✨ M1-lite smoke test PASSED\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ M1-lite smoke test FAILED:', error);
    process.exit(1);
  }
}

main();
