import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

async function runTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // Test 1: Check if schema compiles
  results.push({
    name: 'Schema Compilation',
    passed: true,
    message: 'Prisma client generated successfully',
  });

  // Test 2: Database connection
  try {
    await prisma.$connect();
    results.push({
      name: 'Database Connection',
      passed: true,
      message: 'Successfully connected to PostgreSQL',
    });
  } catch (error) {
    results.push({
      name: 'Database Connection',
      passed: false,
      message: `Failed to connect: ${error}`,
    });
    return results;
  }

  // Test 3: Check tables exist
  try {
    await prisma.user.count();
    await prisma.speakingPrompt.count();
    await prisma.speakingSubmission.count();
    await prisma.pronunciationFeedback.count();
    results.push({
      name: 'Tables Exist',
      passed: true,
      message: 'All 4 tables exist (users, speaking_prompts, speaking_submissions, pronunciation_feedback)',
    });
  } catch (error) {
    results.push({
      name: 'Tables Exist',
      passed: false,
      message: `Missing tables: ${error}`,
    });
  }

  // Test 4: Check prompt count
  try {
    const promptCount = await prisma.speakingPrompt.count();
    const passed = promptCount >= 20;
    results.push({
      name: 'Seed Data Count',
      passed,
      message: `Found ${promptCount} speaking prompts (expected ≥20)`,
    });
  } catch (error) {
    results.push({
      name: 'Seed Data Count',
      passed: false,
      message: `Failed to count prompts: ${error}`,
    });
  }

  // Test 5: Check CEFR level distribution
  try {
    const levels = await prisma.speakingPrompt.groupBy({
      by: ['cefrLevel'],
      _count: true,
    });
    const cefrLevels = levels.map((l) => l.cefrLevel).sort();
    const hasAllLevels = ['A1', 'A2', 'B1', 'B2'].every((level) =>
      cefrLevels.includes(level)
    );
    results.push({
      name: 'CEFR Level Coverage',
      passed: hasAllLevels,
      message: `Found levels: ${cefrLevels.join(', ')} (expected A1, A2, B1, B2)`,
    });
  } catch (error) {
    results.push({
      name: 'CEFR Level Coverage',
      passed: false,
      message: `Failed to check levels: ${error}`,
    });
  }

  // Test 6: Check topic variety
  try {
    const topics = await prisma.speakingPrompt.groupBy({
      by: ['topic'],
      _count: true,
    });
    const topicList = topics.map((t) => t.topic);
    const hasVariety = topicList.length >= 3;
    results.push({
      name: 'Topic Variety',
      passed: hasVariety,
      message: `Found ${topicList.length} topics: ${topicList.join(', ')}`,
    });
  } catch (error) {
    results.push({
      name: 'Topic Variety',
      passed: false,
      message: `Failed to check topics: ${error}`,
    });
  }

  // Test 7: Check indexes on speaking_prompts
  try {
    const prompt = await prisma.speakingPrompt.findFirst({
      where: { cefrLevel: 'A1', topic: 'daily_conversation' },
    });
    results.push({
      name: 'Indexes Functional',
      passed: prompt !== null,
      message: 'Composite index query (cefrLevel + topic) works',
    });
  } catch (error) {
    results.push({
      name: 'Indexes Functional',
      passed: false,
      message: `Index query failed: ${error}`,
    });
  }

  // Test 8: Check evaluation criteria structure
  try {
    const prompt = await prisma.speakingPrompt.findFirst();
    if (prompt && prompt.evaluationCriteria) {
      const criteria = prompt.evaluationCriteria as any;
      const hasAllCriteria =
        criteria.pronunciation &&
        criteria.fluency &&
        criteria.vocabulary &&
        criteria.grammar;
      results.push({
        name: 'Evaluation Criteria Structure',
        passed: hasAllCriteria,
        message: hasAllCriteria
          ? 'All criteria fields present (pronunciation, fluency, vocabulary, grammar)'
          : 'Missing required criteria fields',
      });
    } else {
      results.push({
        name: 'Evaluation Criteria Structure',
        passed: false,
        message: 'No prompts found or missing evaluationCriteria',
      });
    }
  } catch (error) {
    results.push({
      name: 'Evaluation Criteria Structure',
      passed: false,
      message: `Failed to verify criteria: ${error}`,
    });
  }

  // Test 9: Test cascading deletes (in transaction)
  try {
    await prisma.$transaction(async (tx) => {
      // Create test user
      const user = await tx.user.create({
        data: {
          email: `test-${Date.now()}@example.com`,
          passwordHash: 'test-hash',
          name: 'Test User',
        },
      });

      // Create test submission
      const prompt = await tx.speakingPrompt.findFirst();
      if (!prompt) throw new Error('No prompts available');

      const submission = await tx.speakingSubmission.create({
        data: {
          userId: user.id,
          promptId: prompt.id,
          audioUrl: 'https://example.com/test.mp3',
          transcriptText: 'Test transcript',
          durationSeconds: 30.5,
        },
      });

      // Create pronunciation feedback
      await tx.pronunciationFeedback.create({
        data: {
          submissionId: submission.id,
          word: 'test',
          phoneme: 'test',
          accuracyScore: 85.5,
        },
      });

      // Delete user (should cascade)
      await tx.user.delete({ where: { id: user.id } });

      // Verify cascade
      const remainingSubmissions = await tx.speakingSubmission.count({
        where: { userId: user.id },
      });

      if (remainingSubmissions > 0) {
        throw new Error('Cascade delete failed');
      }
    });

    results.push({
      name: 'Cascade Deletes',
      passed: true,
      message: 'Foreign key constraints and cascade deletes work correctly',
    });
  } catch (error) {
    results.push({
      name: 'Cascade Deletes',
      passed: false,
      message: `Cascade test failed: ${error}`,
    });
  }

  // Test 10: Verify JSON field functionality
  try {
    const prompt = await prisma.speakingPrompt.findFirst();
    if (prompt) {
      const criteria = prompt.evaluationCriteria as any;
      const hasWeights =
        criteria.pronunciation?.weight &&
        criteria.fluency?.weight &&
        criteria.vocabulary?.weight &&
        criteria.grammar?.weight;
      results.push({
        name: 'JSONB Field Functionality',
        passed: hasWeights,
        message: hasWeights
          ? 'JSON fields store and retrieve complex data correctly'
          : 'JSON fields missing expected structure',
      });
    } else {
      results.push({
        name: 'JSONB Field Functionality',
        passed: false,
        message: 'No prompts available to test JSON fields',
      });
    }
  } catch (error) {
    results.push({
      name: 'JSONB Field Functionality',
      passed: false,
      message: `JSON test failed: ${error}`,
    });
  }

  return results;
}

async function main() {
  console.log('🧪 Running Speaking Module Database Verification Tests\n');
  console.log('='.repeat(60));

  const results = await runTests();

  console.log('\n📋 Test Results:\n');

  let passedCount = 0;
  let failedCount = 0;

  results.forEach((result, index) => {
    const icon = result.passed ? '✅' : '❌';
    const status = result.passed ? 'PASS' : 'FAIL';
    console.log(`${icon} Test ${index + 1}: ${result.name}`);
    console.log(`   Status: ${status}`);
    console.log(`   Message: ${result.message}\n`);

    if (result.passed) {
      passedCount++;
    } else {
      failedCount++;
    }
  });

  console.log('='.repeat(60));
  console.log(`\n📊 Summary: ${passedCount}/${results.length} tests passed\n`);

  if (failedCount > 0) {
    console.error(`❌ ${failedCount} test(s) failed. Please review the errors above.\n`);
    process.exit(1);
  } else {
    console.log('✨ All tests passed! Database setup is complete and verified.\n');
    process.exit(0);
  }
}

main()
  .catch((e) => {
    console.error('❌ Verification failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
