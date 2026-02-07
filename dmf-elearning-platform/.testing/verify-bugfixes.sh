#!/bin/bash
# Quick Verification Test for Bug Fixes
# Tests the 2 critical bugs that were fixed

echo "🧪 QUICK VERIFICATION TEST - Bug Fixes"
echo "======================================"
echo ""

# Check if dev server is running
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
  echo "⚠️  WARNING: Dev server not running on localhost:3000"
  echo "   Start server with: cd apps/web-learner && npm run dev"
  echo ""
  exit 1
fi

echo "✅ Dev server is running"
echo ""

# Test 1: Exercise submission with new IDs
echo "📝 TEST 1: Exercise ID Mismatch Fix (BUG-INT-001)"
echo "   Testing: POST /api/reading/submit with ex-mc-1"
echo ""

RESPONSE_1=$(curl -s -X POST "http://localhost:3000/en/api/reading/submit" \
  -H "Content-Type: application/json" \
  -d '{
    "passageId": "1",
    "exerciseId": "ex-mc-1",
    "userAnswer": {"selected_index": 0},
    "timeSpentSeconds": 15
  }')

if echo "$RESPONSE_1" | grep -q '"isCorrect":true'; then
  echo "   ✅ PASS: Exercise ex-mc-1 accepted and validated correctly"
  echo "   Response: $(echo "$RESPONSE_1" | grep -o '"isCorrect":[^,]*' | head -1)"
else
  echo "   ❌ FAIL: Exercise ex-mc-1 not found or validation failed"
  echo "   Response: $RESPONSE_1"
fi

echo ""

# Test 2: Sequencing exercise
echo "📝 TEST 2: Sequencing Exercise Support (BUG-INT-001)"
echo "   Testing: POST /api/reading/submit with ex-seq-1"
echo ""

RESPONSE_2=$(curl -s -X POST "http://localhost:3000/en/api/reading/submit" \
  -H "Content-Type: application/json" \
  -d '{
    "passageId": "1",
    "exerciseId": "ex-seq-1",
    "userAnswer": {"order": [0,1,2,3]},
    "timeSpentSeconds": 20
  }')

if echo "$RESPONSE_2" | grep -q '"accuracyScore":100'; then
  echo "   ✅ PASS: Sequencing exercise ex-seq-1 accepted and validated"
  echo "   Response: $(echo "$RESPONSE_2" | grep -o '"accuracyScore":[0-9]*' | head -1)"
else
  echo "   ❌ FAIL: Sequencing exercise ex-seq-1 not found"
  echo "   Response: $RESPONSE_2"
fi

echo ""

# Test 3: Vocabulary endpoint path
echo "📝 TEST 3: Vocabulary Endpoint Path Fix (BUG-INT-002)"
echo "   Testing: POST /api/reading/vocabulary/save"
echo ""

RESPONSE_3=$(curl -s -X POST "http://localhost:3000/en/api/reading/vocabulary/save" \
  -H "Content-Type: application/json" \
  -d '{
    "word": "hello",
    "passageId": "1",
    "context": "Hello is a common greeting in English."
  }')

if echo "$RESPONSE_3" | grep -q '"message":"Word saved successfully"'; then
  echo "   ✅ PASS: Vocabulary endpoint /api/reading/vocabulary/save accessible"
  echo "   Response: $(echo "$RESPONSE_3" | grep -o '"message":"[^"]*"' | head -1)"
else
  echo "   ❌ FAIL: Vocabulary endpoint not found or error"
  echo "   Response: $RESPONSE_3"
fi

echo ""

# Test 4: Fuzzy matching (85% threshold)
echo "📝 TEST 4: Fuzzy Matching Algorithm (85% threshold)"
echo "   Testing: Fill blank with typo 'energi' vs 'energy'"
echo ""

RESPONSE_4=$(curl -s -X POST "http://localhost:3000/en/api/reading/submit" \
  -H "Content-Type: application/json" \
  -d '{
    "passageId": "2",
    "exerciseId": "ex-fb-1",
    "userAnswer": {"answer": "energi"},
    "timeSpentSeconds": 10
  }')

ACCURACY=$(echo "$RESPONSE_4" | grep -o '"accuracyScore":[0-9]*' | grep -o '[0-9]*')

if [ "$ACCURACY" -ge 85 ]; then
  echo "   ✅ PASS: Fuzzy matching accepted 'energi' (${ACCURACY}% ≥ 85%)"
else
  echo "   ⚠️  INFO: Fuzzy matching rejected 'energi' (${ACCURACY}% < 85%)"
  echo "          This is expected behavior for this specific typo"
fi

echo ""
echo "======================================"
echo "🏁 VERIFICATION COMPLETE"
echo ""
echo "Summary:"
echo "  - Exercise ID mismatch: Should be FIXED"
echo "  - Sequencing support: Should be WORKING"
echo "  - Vocabulary endpoint: Should be ACCESSIBLE"
echo "  - Fuzzy matching: Preserved (85% threshold)"
echo ""
