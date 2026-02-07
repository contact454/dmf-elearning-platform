import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Listening Module exercises...');

  // Create 10 sample listening exercises  
  for (let i = 0; i < 10; i++) {
    await prisma.listeningExercise.create({
      data: {
        title: `Listening Exercise ${i + 1}`,
        difficulty: 1 + (i % 10), // 1-10
        audioUrl: `listening/exercise-${i + 1}.mp3`,
        transcript: `Sample transcript ${i + 1}. This is a test audio.`,
        translation: `Bản dịch mẫu ${i + 1}. Đây là audio thử nghiệm.`,
        durationSeconds: 30 + i * 5,
        exerciseType: i % 2 === 0 ? 'multiple_choice' : 'dictation',
        exerciseData: i % 2 === 0 ? {
          question: 'What did you hear?',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctOption: 0
        } : null,
      },
    });
  }

  console.log(`✅ Created 10 listening exercises`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
