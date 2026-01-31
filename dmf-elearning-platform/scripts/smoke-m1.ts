
import { InMemoryEventBus } from '../services/shared/event-bus';
import { RegisterUserHandler } from '../services/onboarding/handlers/register-user.handler';
import { UserRole, LanguageCode } from '@dmf/shared';

async function runSmokeTest() {
    console.log('🚀 Starting M1-lite Smoke Test...');

    // 1. Instantiate Infrastructure
    const eventBus = new InMemoryEventBus();
    const handler = new RegisterUserHandler(eventBus);

    // 2. Setup Verification
    let eventReceived = false;
    const expectedEmail = 'smoke-test@dmf.com';

    await eventBus.subscribe('system.user.registered', async (event) => {
        console.log('✅ Event received:', event.event_name);
        console.log('   Payload:', JSON.stringify(event.payload, null, 2));

        if (event.event_name === 'system.user.registered' &&
            (event.payload as any).targetLanguage === LanguageCode.VI) {
            eventReceived = true;
        }
    });
    console.log('👀 Subscribed to system.user.registered');

    // 3. Execute Command
    console.log('👉 Executing RegisterUserHandler...');
    try {
        const result = await handler.execute({
            email: expectedEmail,
            role: UserRole.LEARNER,
            firstName: 'Smoke',
            lastName: 'Tester',
            targetLanguage: LanguageCode.VI
        });

        console.log('🎉 Handler returned success:', result);
    } catch (error) {
        console.error('❌ Handler failed:', error);
        process.exit(1);
    }

    // 4. Assert with timeout
    // Wait a bit for event loop to process
    await new Promise(resolve => setTimeout(resolve, 100));

    if (eventReceived) {
        console.log('✨ SUCCESS: M1-lite wiring verified!');
        process.exit(0);
    } else {
        console.error('❌ FAILURE: Event was not received.');
        process.exit(1);
    }
}

runSmokeTest().catch(err => {
    console.error('❌ Unhandled error:', err);
    process.exit(1);
});
