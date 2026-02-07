#!/usr/bin/env tsx

/**
 * Database Verification Script
 * Verifies that the writing module database is correctly set up
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface VerificationResult {
  test: string;
  passed: boolean;
  message: string;
}

const results: VerificationResult[] = [];

async function verify() {
  console.log('🔍 Verifying Writing Module Database Setup\n');

  try {
    // Test 1: Database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      results.push({
        test: 'Database Connection',
        passed: true,
        message: 'Successfully connected to database'
      });
    } catch (error) {
      results.push({
        test: 'Database Connection',
        passed: false,
        message: `Failed to connect: ${error}`
      });
      throw error; // Can't continue without connection
    }

    // Test 2: Tables exist
    const tableCount = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('users', 'prompts', 'essays', 'grammar_errors')
    `;
    const count = parseInt(tableCount[0].count);
    results.push({
      test: 'Table Creation',
      passed: count === 4,
      message: `Found ${count}/4 tables`
    });

    // Test 3: Prompts seeded
    const promptCount = await prisma.prompt.count();
    results.push({
      test: 'Prompts Seeded',
      passed: promptCount === 20,
      message: `Found ${promptCount}/20 prompts`
    });

    // Test 4: CEFR distribution
    const cefrCounts = await prisma.prompt.groupBy({
      by: ['cefrLevel'],
      _count: true,
    });
    const targetLevels = ['A1', 'A2', 'B1', 'B2'];
    const distributionCorrect = targetLevels.every(level => {
      const count = cefrCounts.find(c => c.cefrLevel === level)?._count || 0;
      return count === 5;
    });
    const distribution = cefrCounts.map(c => `${c.cefrLevel}=${c._count}`).join(', ');
    results.push({
      test: 'CEFR Distribution',
      passed: distributionCorrect,
      message: `Distribution: ${distribution}`
    });

    // Test 5: No duplicate titles
    const duplicates = await prisma.$queryRaw<any[]>`
      SELECT title, COUNT(*) as count
      FROM prompts
      GROUP BY title
      HAVING COUNT(*) > 1
    `;
    results.push({
      test: 'Unique Titles',
      passed: duplicates.length === 0,
      message: duplicates.length === 0 ? 'No duplicates found' : `Found ${duplicates.length} duplicates`
    });

    // Test 6: All prompts have tips
    const promptsWithoutTips = await prisma.prompt.count({
      where: {
        OR: [
          { tips: null },
          { tips: { equals: {} as any } }
        ]
      }
    });
    results.push({
      test: 'Prompts Have Tips',
      passed: promptsWithoutTips === 0,
      message: promptsWithoutTips === 0 ? 'All prompts have tips' : `${promptsWithoutTips} prompts missing tips`
    });

    // Test 7: Indexes exist
    const indexes = await prisma.$queryRaw<any[]>`
      SELECT indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND tablename IN ('users', 'prompts', 'essays', 'grammar_errors')
      AND indexname LIKE 'idx_%'
    `;
    const expectedIndexCount = 11; // As per schema
    results.push({
      test: 'Performance Indexes',
      passed: indexes.length >= expectedIndexCount,
      message: `Found ${indexes.length}/${expectedIndexCount} indexes`
    });

    // Test 8: Sample query performance
    const start = Date.now();
    await prisma.prompt.findMany({
      where: { cefrLevel: 'B1' }
    });
    const queryTime = Date.now() - start;
    results.push({
      test: 'Query Performance',
      passed: queryTime < 50, // Should be < 50ms
      message: `Query executed in ${queryTime}ms`
    });

  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await prisma.$disconnect();
  }

  // Print results
  console.log('📊 Verification Results:\n');
  results.forEach((result, index) => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${index + 1}. ${icon} ${result.test}`);
    console.log(`   ${result.message}\n`);
  });

  const passedCount = results.filter(r => r.passed).length;
  const totalTests = results.length;
  const percentage = Math.round((passedCount / totalTests) * 100);

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Final Score: ${passedCount}/${totalTests} tests passed (${percentage}%)`);
  console.log('='.repeat(50));

  if (passedCount === totalTests) {
    console.log('\n🎉 All tests passed! Database is ready for use.\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please review the issues above.\n');
    process.exit(1);
  }
}

verify();
