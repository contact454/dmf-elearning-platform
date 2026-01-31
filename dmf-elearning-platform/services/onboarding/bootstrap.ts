import { InMemoryEventBus } from '../shared/event-bus';
import { RegisterUserHandler } from './handlers/register-user.handler';
import { SubmitPlacementTestHandler } from './handlers/submit-placement-test.handler';
import { UpdateUserProfileHandler } from './handlers/update-user-profile.handler';

// Simple bootstrap wiring for manual tests or E2E harness
export function createOnboardingBootstrap() {
  const bus = new InMemoryEventBus();

  const registerUser = new RegisterUserHandler(bus);
  const submitPlacement = new SubmitPlacementTestHandler(bus);
  const updateProfile = new UpdateUserProfileHandler(bus);

  return { bus, registerUser, submitPlacement, updateProfile };
}

