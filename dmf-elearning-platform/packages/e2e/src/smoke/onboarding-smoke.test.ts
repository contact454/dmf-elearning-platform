import { test, expect } from '@playwright/test';
import {
  InMemoryDatabase,
  InMemoryEventBus,
  InMemoryIdempotencyStore,
  InMemoryOutbox,
  sharedEventBus,
} from '../../../../packages/infra/src/adapters/index.js';
import { UserRepository } from '../../../../services/onboarding-service/src/state/user.repository.js';
import { handleSystemUserRegister } from '../../../../services/onboarding-service/src/application/system.user.register.handler.js';
import { handleSystemProfileModify } from '../../../../services/onboarding-service/src/application/system.profile.modify.handler.js';

test('onboarding register -> profile update emits events (active onboarding-service path)', async () => {
  const bus = sharedEventBus;
  if (bus instanceof InMemoryEventBus) {
    bus.clearProcessedEvents();
  }

  const db = new InMemoryDatabase();
  await db.connect({ host: 'localhost', port: 5432, database: 'e2e-onboarding-smoke' });
  const userRepository = new UserRepository(db);
  const idempotencyStore = new InMemoryIdempotencyStore();
  const outbox = new InMemoryOutbox();

  const events: string[] = [];
  await bus.subscribe('*', async (event) => {
    events.push(event.eventName);
  });

  const registerRes = await handleSystemUserRegister(
    {
      email: `onboarding-smoke-${Date.now()}@example.com`,
      password: 'Password123',
      firstName: 'Alice',
      lastName: 'Liddell',
      targetLanguage: 'en',
      correlationId: `corr-reg-${Date.now()}`,
    },
    {},
    { userRepository, eventBus: bus, idempotencyStore, outbox }
  );

  expect(registerRes.userId).toBeTruthy();

  const profileRes = await handleSystemProfileModify(
    {
      userId: registerRes.userId,
      firstName: 'Alice',
      lastName: 'Wonder',
      targetLanguage: 'de',
      correlationId: `corr-prof-${Date.now()}`,
    },
    { userId: '' },
    { userRepository, eventBus: bus, idempotencyStore, outbox }
  );

  expect(profileRes.userId).toBe(registerRes.userId);
  expect(events).toContain('system.user.registered');
  expect(events).toContain('system.profile.updated');
});
