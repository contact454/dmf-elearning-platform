#!/usr/bin/env node
// Test script for Listening Module API endpoints

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testAPI(method, endpoint, body = null) {
  const url = `${BASE_URL}${endpoint}`;
  console.log(`\n${method} ${endpoint}`);
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Success:', response.status);
      console.log(JSON.stringify(data, null, 2).substring(0, 500) + '...');
    } else {
      console.log('❌ Error:', response.status);
      console.log(data);
    }
    
    return { success: response.ok, data };
  } catch (error) {
    console.log('❌ Request failed:', error.message);
    return { success: false, error };
  }
}

async function runTests() {
  console.log('🧪 Testing Listening Module API Endpoints\n');
  console.log('=' .repeat(60));
  
  // Test 1: GET /api/listening/metadata
  console.log('\n📊 Test 1: Fetch Metadata');
  await testAPI('GET', '/api/listening/metadata');
  
  // Test 2: GET /api/listening/exercises
  console.log('\n📚 Test 2: Fetch All Exercises');
  await testAPI('GET', '/api/listening/exercises?limit=5');
  
  // Test 3: GET /api/listening/exercises with filters
  console.log('\n🔍 Test 3: Fetch A1 Dictation Exercises');
  await testAPI('GET', '/api/listening/exercises?level=A1&type=DICTATION&limit=3');
  
  // Test 4: Submit attempt (you'll need a real exerciseId and userId)
  console.log('\n✍️ Test 4: Submit Exercise Attempt');
  
  // First, get an exercise ID
  const exercisesResponse = await testAPI('GET', '/api/listening/exercises?limit=1');
  
  if (exercisesResponse.success && exercisesResponse.data?.data?.exercises?.[0]) {
    const exercise = exercisesResponse.data.data.exercises[0];
    const exerciseId = exercise.id;
    
    console.log(`\nSubmitting attempt for exercise: ${exercise.title}`);
    
    const attemptData = {
      userId: 'test-user-123', // Replace with real user ID
      exerciseId,
      userAnswer: exercise.exerciseType === 'MULTIPLE_CHOICE' 
        ? 'A' 
        : 'Sample user answer text',
      timeSpent: 45,
      playbackCount: 2,
      pauseCount: 1,
    };
    
    await testAPI('POST', '/api/listening/submit', attemptData);
    
    // Test 5: Get audio URL
    console.log('\n🔊 Test 5: Fetch Audio URL');
    await testAPI('GET', `/api/listening/audio/${exerciseId}`);
  } else {
    console.log('\n⚠️ Skipping submit test - no exercises found');
  }
  
  // Test 6: GET metadata with userId
  console.log('\n👤 Test 6: Fetch Metadata with User Stats');
  await testAPI('GET', '/api/listening/metadata?userId=test-user-123');
  
  console.log('\n' + '='.repeat(60));
  console.log('\n✅ All tests completed!\n');
}

// Run tests
runTests().catch(console.error);
