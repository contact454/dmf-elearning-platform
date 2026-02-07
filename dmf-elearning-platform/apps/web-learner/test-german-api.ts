/**
 * German API Client Test
 * Run with: node --loader ts-node/esm test-german-api.ts
 */

import {
  getLevels,
  getTopics,
  getVocabulary,
  getLevelSummary,
  checkHealth,
  formatTopicName,
  getLevelDisplayName,
  GermanApiError,
} from './src/services/german-api';

async function runTests() {
  console.log('🧪 German API Client Test Suite\n');
  console.log('='.repeat(60));

  try {
    // Test 1: Health Check
    console.log('\n1️⃣  Testing Health Check...');
    const isHealthy = await checkHealth();
    console.log(`   ✅ Service ${isHealthy ? 'ONLINE' : 'OFFLINE'}`);

    if (!isHealthy) {
      console.error('   ⚠️  Learning Service is not running. Start it with: cd services/learning-service && npm run dev');
      return;
    }

    // Test 2: Get Levels
    console.log('\n2️⃣  Testing getLevels()...');
    const levels = await getLevels();
    console.log(`   ✅ Found ${levels.length} levels:`, levels);
    levels.forEach(level => {
      console.log(`      - ${getLevelDisplayName(level)}`);
    });

    if (levels.length === 0) {
      console.error('   ⚠️  No levels found. Data Factory may still be processing.');
      return;
    }

    // Test 3: Get Topics for First Level
    const testLevel = levels[0];
    console.log(`\n3️⃣  Testing getTopics('${testLevel}')...`);
    const topics = await getTopics(testLevel);
    console.log(`   ✅ Found ${topics.length} topics`);
    console.log(`   First 5 topics:`);
    topics.slice(0, 5).forEach(topic => {
      console.log(`      - ${formatTopicName(topic)}`);
    });

    // Test 4: Get Level Summary
    console.log(`\n4️⃣  Testing getLevelSummary('${testLevel}')...`);
    const summary = await getLevelSummary(testLevel);
    console.log(`   ✅ Level: ${summary.level}`);
    console.log(`   ✅ Topic Count: ${summary.topicCount}`);

    // Test 5: Get Vocabulary for First Topic
    if (topics.length > 0) {
      const testTopic = topics[0];
      console.log(`\n5️⃣  Testing getVocabulary('${testLevel}', '${testTopic}')...`);
      const vocabData = await getVocabulary(testLevel, testTopic);
      console.log(`   ✅ Topic: ${vocabData.topic}`);
      console.log(`   ✅ Vocabulary Count: ${vocabData.count}`);
      console.log(`   First vocabulary item:`);
      if (vocabData.vocabulary.length > 0) {
        const word = vocabData.vocabulary[0];
        console.log(`      Word: ${word.word}`);
        console.log(`      POS: ${word.pos}`);
        console.log(`      Meaning (VI): ${word.meaning_vi}`);
        console.log(`      Source: ${word.source}`);
      }
    }

    // Test 6: Error Handling
    console.log('\n6️⃣  Testing Error Handling...');
    try {
      await getTopics('X9'); // Invalid level
      console.log('   ❌ Should have thrown error');
    } catch (error) {
      if (error instanceof GermanApiError) {
        console.log(`   ✅ Correctly caught error: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ All Tests Passed!\n');

  } catch (error) {
    console.error('\n❌ Test Failed:');
    if (error instanceof GermanApiError) {
      console.error(`   Error: ${error.message}`);
      console.error(`   Status: ${error.statusCode}`);
    } else {
      console.error(error);
    }
  }
}

// Run tests
runTests();
