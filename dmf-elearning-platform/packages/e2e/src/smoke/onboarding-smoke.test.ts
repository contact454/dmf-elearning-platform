import { test, expect } from '@playwright/test';
import { createOnboardingBootstrap } from '../../../../services/onboarding/bootstrap';

test('onboarding register -> profile update emits events (in-memory bus)', async () => {
  const { bus, registerUser, updateProfile } = createOnboardingBootstrap();

  const events: string[] = [];
  await bus.subscribe('*', (event) => {
    events.push(event.event_name);
  });

  const res = await registerUser.execute({
    email: 'alice@example.com',
    role: 'learner',
    firstName: 'Alice',
    lastName: 'Liddell',
    targetLanguage: 'en',
  });

  expect(res.userId).toBeTruthy();

  await updateProfile.execute({
    userId: res.userId,
    firstName: 'Alice',
    lastName: 'Wonder',
    targetLanguage: 'en',
  });

  expect(events).toContain('system.user.registered');
  expect(events).toContain('system.profile.updated');
});

