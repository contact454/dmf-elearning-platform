/**
 * Achievement seed — M3 Gamification
 * Run: npx tsx prisma/seed-achievements.ts
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const ACHIEVEMENTS = [
    // Vocab
    { code: 'vocab_10', title: 'Wortschatz-Anfänger', titleVi: 'Người mới bắt đầu', description: 'Review 10 vocabulary words', icon: '📚', category: 'vocab', triggerType: 'count', triggerField: 'vocabReviewed', triggerValue: 10, xpReward: 25, rarity: 'common' },
    { code: 'vocab_50', title: 'Wortschatz-Lerner', titleVi: 'Người học từ vựng', description: 'Review 50 vocabulary words', icon: '📖', category: 'vocab', triggerType: 'count', triggerField: 'vocabReviewed', triggerValue: 50, xpReward: 50, rarity: 'common' },
    { code: 'vocab_100', title: 'Wortschatz-Meister', titleVi: 'Bậc thầy từ vựng', description: 'Review 100 vocabulary words', icon: '🎓', category: 'vocab', triggerType: 'count', triggerField: 'vocabReviewed', triggerValue: 100, xpReward: 100, rarity: 'rare' },
    { code: 'vocab_500', title: 'Wortschatz-Experte', titleVi: 'Chuyên gia từ vựng', description: 'Review 500 vocabulary words', icon: '👑', category: 'vocab', triggerType: 'count', triggerField: 'vocabReviewed', triggerValue: 500, xpReward: 250, rarity: 'epic' },
    // Reading
    { code: 'reading_5', title: 'Bücherwurm', titleVi: 'Mọt sách', description: 'Complete 5 reading exercises', icon: '📕', category: 'reading', triggerType: 'count', triggerField: 'readingCompleted', triggerValue: 5, xpReward: 50, rarity: 'common' },
    { code: 'reading_25', title: 'Leseratte', titleVi: 'Người đọc chăm chỉ', description: 'Complete 25 readings', icon: '📗', category: 'reading', triggerType: 'count', triggerField: 'readingCompleted', triggerValue: 25, xpReward: 150, rarity: 'rare' },
    { code: 'reading_50', title: 'Bibliophile', titleVi: 'Người yêu sách', description: 'Complete 50 readings', icon: '📘', category: 'reading', triggerType: 'count', triggerField: 'readingCompleted', triggerValue: 50, xpReward: 300, rarity: 'epic' },
    // Listening
    { code: 'listening_5', title: 'Guter Zuhörer', titleVi: 'Người nghe tốt', description: 'Complete 5 listening exercises', icon: '🎧', category: 'listening', triggerType: 'count', triggerField: 'listeningCompleted', triggerValue: 5, xpReward: 50, rarity: 'common' },
    { code: 'listening_25', title: 'Hörversteher', titleVi: 'Chuyên gia nghe', description: 'Complete 25 listening exercises', icon: '🎵', category: 'listening', triggerType: 'count', triggerField: 'listeningCompleted', triggerValue: 25, xpReward: 150, rarity: 'rare' },
    // Speaking
    { code: 'speaking_5', title: 'Sprechanfänger', titleVi: 'Người mới nói', description: 'Master 5 speaking prompts', icon: '🎤', category: 'speaking', triggerType: 'count', triggerField: 'speakingMastered', triggerValue: 5, xpReward: 50, rarity: 'common' },
    { code: 'speaking_20', title: 'Redner', titleVi: 'Diễn giả', description: 'Master 20 speaking prompts', icon: '🗣️', category: 'speaking', triggerType: 'count', triggerField: 'speakingMastered', triggerValue: 20, xpReward: 200, rarity: 'rare' },
    // Writing
    { code: 'writing_5', title: 'Schreibanfänger', titleVi: 'Người mới viết', description: 'Complete 5 writing exercises', icon: '✏️', category: 'writing', triggerType: 'count', triggerField: 'writingCompleted', triggerValue: 5, xpReward: 50, rarity: 'common' },
    { code: 'writing_20', title: 'Schriftsteller', titleVi: 'Nhà văn', description: 'Complete 20 writing exercises', icon: '✍️', category: 'writing', triggerType: 'count', triggerField: 'writingCompleted', triggerValue: 20, xpReward: 200, rarity: 'rare' },
    // Streaks
    { code: 'streak_3', title: 'Ausdauernd', titleVi: 'Bền bỉ', description: '3-day learning streak', icon: '🔥', category: 'streak', triggerType: 'streak', triggerField: 'currentStreak', triggerValue: 3, xpReward: 30, rarity: 'common' },
    { code: 'streak_7', title: 'Wochenheld', titleVi: 'Anh hùng tuần', description: '7-day learning streak', icon: '🔥', category: 'streak', triggerType: 'streak', triggerField: 'currentStreak', triggerValue: 7, xpReward: 75, rarity: 'rare' },
    { code: 'streak_30', title: 'Monatschampion', titleVi: 'Nhà vô địch tháng', description: '30-day learning streak', icon: '💎', category: 'streak', triggerType: 'streak', triggerField: 'currentStreak', triggerValue: 30, xpReward: 500, rarity: 'legendary' },
    // XP milestones
    { code: 'xp_500', title: 'Erster Meilenstein', titleVi: 'Cột mốc đầu tiên', description: 'Earn 500 XP total', icon: '⭐', category: 'general', triggerType: 'count', triggerField: 'totalXP', triggerValue: 500, xpReward: 50, rarity: 'common' },
    { code: 'xp_2500', title: 'Aufsteiger', titleVi: 'Người tiến bộ', description: 'Earn 2500 XP total', icon: '🌟', category: 'general', triggerType: 'count', triggerField: 'totalXP', triggerValue: 2500, xpReward: 100, rarity: 'rare' },
    { code: 'xp_10000', title: 'Legende', titleVi: 'Huyền thoại', description: 'Earn 10000 XP total', icon: '💫', category: 'general', triggerType: 'count', triggerField: 'totalXP', triggerValue: 10000, xpReward: 500, rarity: 'legendary' },
    // Level milestones
    { code: 'level_5', title: 'Level 5', titleVi: 'Cấp 5', description: 'Reach level 5', icon: '🏅', category: 'general', triggerType: 'count', triggerField: 'currentLevel', triggerValue: 5, xpReward: 100, rarity: 'common' },
    { code: 'level_10', title: 'Level 10', titleVi: 'Cấp 10', description: 'Reach level 10', icon: '🥇', category: 'general', triggerType: 'count', triggerField: 'currentLevel', triggerValue: 10, xpReward: 250, rarity: 'rare' },
    { code: 'level_20', title: 'Level 20', titleVi: 'Cấp 20', description: 'Reach level 20', icon: '🏆', category: 'general', triggerType: 'count', triggerField: 'currentLevel', triggerValue: 20, xpReward: 1000, rarity: 'epic' },
];

async function main() {
    console.log('🏆 Seeding Achievements...\n');
    for (const a of ACHIEVEMENTS) {
        await prisma.achievement.upsert({
            where: { code: a.code },
            update: { title: a.title, description: a.description, xpReward: a.xpReward },
            create: a as any,
        });
    }
    console.log(`✅ ${ACHIEVEMENTS.length} achievements seeded`);
}

main().catch(e => { console.error('❌', e); process.exit(1); }).finally(() => prisma.$disconnect());
