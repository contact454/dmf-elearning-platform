import { DomainEvent, LessonCompletedPayload } from '@dmf/shared';
import { InMemoryMasteryStore } from '../store';
import { MasteryCalculator } from '../logic/calculator';

type LessonCompletedEvent = DomainEvent<'learning.lesson.completed', LessonCompletedPayload>;

export class LessonCompletedConsumer {
    constructor(private readonly store: InMemoryMasteryStore) { }

    async handle(event: LessonCompletedEvent): Promise<void> {
        console.log(`[LessonCompletedConsumer] Processing event for user ${event.user_id}`);

        const { lessonId, score } = event.payload;

        // M3-lite: specific check for smoke test
        if (score === undefined) {
            console.warn('[LessonCompletedConsumer] No score provided, skipping mastery update.');
            return;
        }

        // 1. Get or Init State
        const currentState = await this.store.getOrInit(event.user_id);

        // 2. Calculate New State
        const newState = MasteryCalculator.calculateLessonCompletion(
            currentState,
            lessonId,
            score
        );

        // 3. Save State
        await this.store.save(event.user_id, newState);

        console.log(`[LessonCompletedConsumer] Mastery updated for lesson ${lessonId}. Version: ${newState.version}`);
    }
}
