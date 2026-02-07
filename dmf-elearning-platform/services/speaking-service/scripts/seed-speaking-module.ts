import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

interface PromptData {
  cefrLevel: string;
  topic: string;
  title: string;
  description: string;
  questionText: string;
  preparationTimeSeconds: number;
  speakingTimeSeconds: number;
  difficultyLevel: number;
  evaluationCriteria: any;
}

async function main() {
  console.log('🌱 Starting Speaking Module database seeding...\n');

  // Load prompt data
  const promptsPath = join(__dirname, '../data/speaking-prompts.json');
  const promptsData = JSON.parse(readFileSync(promptsPath, 'utf-8'));

  // Create speaking prompts
  console.log('📝 Creating speaking prompts...');
  let promptCount = 0;
  
  for (const promptData of promptsData.prompts as PromptData[]) {
    try {
      await prisma.speakingPrompt.create({
        data: {
          cefrLevel: promptData.cefrLevel,
          topic: promptData.topic,
          title: promptData.title,
          description: promptData.description,
          questionText: promptData.questionText,
          preparationTimeSeconds: promptData.preparationTimeSeconds,
          speakingTimeSeconds: promptData.speakingTimeSeconds,
          difficultyLevel: promptData.difficultyLevel,
          evaluationCriteria: promptData.evaluationCriteria,
        },
      });
      promptCount++;
      console.log(`  ✓ Created: ${promptData.cefrLevel} - ${promptData.title}`);
    } catch (error) {
      console.error(`  ✗ Failed to create prompt: ${promptData.title}`, error);
    }
  }

  console.log(`\n✅ Successfully created ${promptCount} speaking prompts`);

  // Summary statistics
  const stats = await getStats();
  console.log('\n📊 Database Statistics:');
  console.log(`  Total prompts: ${stats.totalPrompts}`);
  console.log('\n  By CEFR Level:');
  stats.byLevel.forEach(({ cefrLevel, count }) => {
    console.log(`    ${cefrLevel}: ${count} prompts`);
  });
  console.log('\n  By Topic:');
  stats.byTopic.forEach(({ topic, count }) => {
    console.log(`    ${topic}: ${count} prompts`);
  });

  console.log('\n✨ Seeding completed successfully!\n');
}

async function getStats() {
  const totalPrompts = await prisma.speakingPrompt.count();
  
  const byLevel = await prisma.speakingPrompt.groupBy({
    by: ['cefrLevel'],
    _count: true,
    orderBy: {
      cefrLevel: 'asc',
    },
  });

  const byTopic = await prisma.speakingPrompt.groupBy({
    by: ['topic'],
    _count: true,
    orderBy: {
      _count: {
        topic: 'desc',
      },
    },
  });

  return {
    totalPrompts,
    byLevel: byLevel.map((item) => ({
      cefrLevel: item.cefrLevel,
      count: item._count,
    })),
    byTopic: byTopic.map((item) => ({
      topic: item.topic,
      count: item._count,
    })),
  };
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
