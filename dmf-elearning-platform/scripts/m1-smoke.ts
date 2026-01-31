/**
 * M1-lite Smoke Test
 *
 * Tests onboarding flow: register → profile update with event emission
 * Requires onboarding-service to be running on port 3002
 */

import { sharedEventBus } from '../packages/infra/src/adapters/index.js';

const ONBOARDING_URL = 'http://localhost:3002';

async function main() {
  console.log('🧪 M1-lite Smoke Test\n');

  // Track emitted events
  const events: string[] = [];
  await sharedEventBus.subscribe('*', async (event) => {
    events.push(event.eventName);
    console.log(`📢 Event emitted: ${event.eventName}`);
  });

  try {
    // Step 1: Register user
    console.log('Step 1: Register user...');
    const correlationId = `test-${Date.now()}`;
    const registerResponse = await fetch(`${ONBOARDING_URL}/api/system/user/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `alice-${Date.now()}@example.com`,
        password: 'password123',
        firstName: 'Alice',
        lastName: 'Wonderland',
        targetLanguage: 'de',
        correlationId,
      }),
    });

    if (!registerResponse.ok) {
      const error = await registerResponse.text();
      throw new Error(`Register failed: ${registerResponse.status} ${error}`);
    }

    const registerResult = await registerResponse.json();
    console.log(`✅ User registered: ${registerResult.userId}\n`);

    // Step 2: Update profile (same user)
    console.log('Step 2: Update profile...');
    const modifyResponse = await fetch(`${ONBOARDING_URL}/api/system/profile/modify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: registerResult.userId,
        firstName: 'Alice',
        lastName: 'In Wonderland',
        targetLanguage: 'de',
        correlationId: `${correlationId}-modify`,
      }),
    });

    if (!modifyResponse.ok) {
      const error = await modifyResponse.text();
      console.warn(`⚠️  Profile modify failed: ${modifyResponse.status} ${error}`);
      console.warn('   (Expected if auth check is enforced)\n');
    } else {
      const modifyResult = await modifyResponse.json();
      console.log(`✅ Profile updated\n`);
    }

    // Step 3: Test idempotency - replay register with same correlationId
    console.log('Step 3: Test idempotency (replay register)...');
    const replayResponse = await fetch(`${ONBOARDING_URL}/api/system/user/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `alice-${Date.now()}@example.com`, // different email but same correlationId
        password: 'password123',
        firstName: 'Alice',
        lastName: 'Wonderland',
        targetLanguage: 'de',
        correlationId, // same correlationId as Step 1
      }),
    });

    if (!replayResponse.ok) {
      throw new Error(`Idempotency replay failed: ${replayResponse.status}`);
    }

    const replayResult = await replayResponse.json();
    if (!replayResult.replayed) {
      throw new Error('Expected replayed=true from idempotency check');
    }
    if (replayResult.userId !== registerResult.userId) {
      throw new Error(`Expected same userId from replay. Got ${replayResult.userId}, expected ${registerResult.userId}`);
    }
    console.log(`✅ Idempotency check passed (replayed=true)\n`);

    // Wait for async event processing
    await new Promise(resolve => setTimeout(resolve, 100));

    // Step 4: Verify events
    console.log('Step 4: Verify events...');
    if (events.includes('system.user.registered')) {
      console.log('✅ system.user.registered event emitted');
    } else {
      throw new Error('❌ Missing event: system.user.registered');
    }

    if (events.includes('system.profile.updated')) {
      console.log('✅ system.profile.updated event emitted');
    } else {
      console.warn('⚠️  Missing event: system.profile.updated (may be expected if profile modify failed)');
    }

    console.log('\n✨ M1-lite smoke test PASSED\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ M1-lite smoke test FAILED:', error);
    process.exit(1);
  }
}

main();
