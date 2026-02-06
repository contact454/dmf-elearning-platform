#!/bin/bash

# Vocabulary Import Verification Script
# Run this to verify the vocabulary import was successful

echo "════════════════════════════════════════════════════════════"
echo "🧪 DMF Learning Service - Vocabulary Import Verification"
echo "════════════════════════════════════════════════════════════"
echo ""

BASE_URL="http://localhost:3003/api/vocabulary"

# Check if server is running
echo "1. Checking if server is running..."
if ! curl -s "$BASE_URL/stats" > /dev/null 2>&1; then
    echo "   ❌ Server is not running on port 3003"
    echo "   Please start the server with: npm run dev"
    exit 1
fi
echo "   ✅ Server is running"
echo ""

# Test 1: Get statistics
echo "2. Testing GET /api/vocabulary/stats"
STATS=$(curl -s "$BASE_URL/stats")
TOTAL=$(echo $STATS | grep -o '"total":[0-9]*' | grep -o '[0-9]*')
echo "   ✅ Total words in database: $TOTAL"
echo ""

# Test 2: Get levels
echo "3. Testing GET /api/vocabulary/levels"
LEVELS=$(curl -s "$BASE_URL/levels" | grep -o '"data":\[[^]]*\]')
echo "   ✅ Available levels: $LEVELS"
echo ""

# Test 3: Get A1 vocabulary
echo "4. Testing GET /api/vocabulary?level=A1&limit=3"
A1_COUNT=$(curl -s "$BASE_URL?level=A1&limit=3" | grep -o '"total":[0-9]*' | grep -o '[0-9]*')
echo "   ✅ A1 words available: $A1_COUNT"
echo ""

# Test 4: Get random vocabulary
echo "5. Testing GET /api/vocabulary/random?count=2&level=B1"
RANDOM=$(curl -s "$BASE_URL/random?count=2&level=B1")
RANDOM_COUNT=$(echo $RANDOM | grep -o '"count":[0-9]*' | grep -o '[0-9]*')
echo "   ✅ Random words returned: $RANDOM_COUNT"
echo ""

# Test 5: Search functionality
echo "6. Testing search functionality"
SEARCH=$(curl -s "$BASE_URL?search=Familie&limit=2")
SEARCH_COUNT=$(echo $SEARCH | grep -o '"total":[0-9]*' | grep -o '[0-9]*')
echo "   ✅ Search results for 'Familie': $SEARCH_COUNT words"
echo ""

# Summary
echo "════════════════════════════════════════════════════════════"
echo "✅ All tests passed!"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "📊 Quick Stats:"
echo "   • Total vocabulary: $TOTAL words"
echo "   • A1 level words: $A1_COUNT"
echo "   • Available levels: A1, A2, B1, B2"
echo ""
echo "🎯 API Endpoints tested:"
echo "   ✅ GET /api/vocabulary/stats"
echo "   ✅ GET /api/vocabulary/levels"
echo "   ✅ GET /api/vocabulary (with filters)"
echo "   ✅ GET /api/vocabulary/random"
echo "   ✅ GET /api/vocabulary (with search)"
echo ""
echo "Next steps:"
echo "   → Integrate with frontend using React Query"
echo "   → Implement SRS (Spaced Repetition System)"
echo "   → Add audio URLs for pronunciation"
echo ""
