import type { FastifyInstance } from 'fastify';
import type { MasteryStateRepository } from '../state/in-memory-mastery.repository.js';
import type { SkillScoreRepository } from '../state/in-memory-skillscore.repository.js';
import { MasteryCalculator } from '../logic/calculator.js';
import { createEmptyMasteryState } from '../state/models.js';

export function registerDebugSeedRoute(
    app: FastifyInstance,
    deps: {
        masteryRepo: MasteryStateRepository;
        skillScoreRepo: SkillScoreRepository;
    }
): void {
    // ONLY for dev/test environments
    app.post<{ Body: { userId: string; score: number } }>('/api/debug/seed-mastery', async (request, reply) => {
        const { userId, score } = request.body;

        // 1. Create or get state
        let state = await deps.masteryRepo.findByUserId(userId as any);
        if (!state) {
            state = createEmptyMasteryState(userId as any);
        }

        // 2. Simulate completion
        const lessonId = `L-SEED-${Date.now()}`;
        const newState = MasteryCalculator.calculateLessonCompletion(state, lessonId, score);

        // 3. Save
        await deps.masteryRepo.save(newState);

        // 4. Update Skills (Simplified sync)
        // For seeding, we just want the mastery state visible. 
        // Ideally we re-use logic but for debug this is enough to update the Store that the Read API uses.

        return reply.send({
            message: 'Seeded successfully',
            userId,
            overallScore: newState.overallScore
        });
    });
}
