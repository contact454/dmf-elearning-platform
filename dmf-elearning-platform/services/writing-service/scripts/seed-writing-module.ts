import { PrismaClient } from '@prisma/client';
import { readFile } from 'fs/promises';
import { join } from 'path';

const prisma = new PrismaClient();

interface PromptData {
  title: string;
  description: string;
  cefr_level: string;
  category: string;
  target_word_count: number;
  tips: {
    tips: string[];
  };
}

interface SeedData {
  prompts: PromptData[];
}

async function main() {
  console.log('🌱 Seeding writing module...\n');

  try {
    // Read seed data
    const seedFilePath = join(__dirname, '../data/writing-prompts-seed.json');
    const seedFileContent = await readFile(seedFilePath, 'utf-8');
    const seedData: SeedData = JSON.parse(seedFileContent);

    console.log(`📄 Loaded ${seedData.prompts.length} prompts from seed file\n`);

    // Clear existing data (optional, for development)
    console.log('🧹 Clearing existing data...');
    const deletedErrors = await prisma.grammarError.deleteMany();
    const deletedEssays = await prisma.essay.deleteMany();
    const deletedPrompts = await prisma.prompt.deleteMany();
    console.log(`   Deleted ${deletedErrors.count} grammar errors`);
    console.log(`   Deleted ${deletedEssays.count} essays`);
    console.log(`   Deleted ${deletedPrompts.count} prompts\n`);

    // Seed prompts
    console.log('📝 Seeding prompts...');
    let successCount = 0;
    const cefrCounts: Record<string, number> = {};

    for (const promptData of seedData.prompts) {
      try {
        const prompt = await prisma.prompt.create({
          data: {
            title: promptData.title,
            description: promptData.description,
            cefrLevel: promptData.cefr_level,
            category: promptData.category,
            targetWordCount: promptData.target_word_count,
            tips: promptData.tips,
          },
        });

        // Count by CEFR level
        cefrCounts[promptData.cefr_level] = (cefrCounts[promptData.cefr_level] || 0) + 1;

        console.log(`   ✅ Created: ${promptData.title} (${promptData.cefr_level})`);
        successCount++;
      } catch (error) {
        console.error(`   ❌ Failed to create: ${promptData.title}`, error);
      }
    }

    console.log('\n📊 Seeding Summary:');
    console.log(`   Total prompts created: ${successCount}/${seedData.prompts.length}`);
    console.log('\n   Distribution by CEFR level:');
    Object.entries(cefrCounts).sort().forEach(([level, count]) => {
      console.log(`   - ${level}: ${count} prompts`);
    });

    // Verify data integrity
    console.log('\n🔍 Verifying data integrity...');
    
    // Check for duplicate titles
    const allPrompts = await prisma.prompt.findMany({
      select: { title: true }
    });
    const titles = allPrompts.map(p => p.title);
    const duplicates = titles.filter((title, index) => titles.indexOf(title) !== index);
    
    if (duplicates.length > 0) {
      console.log(`   ⚠️  Warning: Found ${duplicates.length} duplicate titles`);
    } else {
      console.log('   ✅ No duplicate titles found');
    }

    // Check CEFR distribution
    const expectedPerLevel = 5;
    const targetLevels = ['A1', 'A2', 'B1', 'B2'];
    let distributionOk = true;

    for (const level of targetLevels) {
      const count = cefrCounts[level] || 0;
      if (count !== expectedPerLevel) {
        console.log(`   ⚠️  Warning: ${level} has ${count} prompts (expected ${expectedPerLevel})`);
        distributionOk = false;
      }
    }

    if (distributionOk) {
      console.log(`   ✅ CEFR distribution correct: ${expectedPerLevel} prompts per level (A1-B2)`);
    }

    // Check all prompts have tips
    const promptsWithoutTips = await prisma.prompt.count({
      where: {
        OR: [
          { tips: null },
          { tips: { equals: {} } }
        ]
      }
    });

    if (promptsWithoutTips > 0) {
      console.log(`   ⚠️  Warning: ${promptsWithoutTips} prompts without tips`);
    } else {
      console.log('   ✅ All prompts have tips');
    }

    console.log('\n🎉 Seeding complete!');
    console.log('\n💡 Next steps:');
    console.log('   1. Run `npm run prisma:studio` to view the data');
    console.log('   2. Test queries against the database');
    console.log('   3. Start the backend service\n');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
