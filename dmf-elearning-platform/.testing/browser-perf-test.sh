#!/bin/bash

# Browser Performance Tests for DMF Reading Module
# Tests page load times and frontend performance

BASE_URL="http://localhost:3000/en"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  BROWSER PERFORMANCE TESTS - MANUAL INSTRUCTIONS           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo "📊 TC-PERF-001: Passage List Page Load Time"
echo "   URL: ${BASE_URL}/reading/passages"
echo "   1. Open Chrome DevTools (F12)"
echo "   2. Go to Performance tab"
echo "   3. Record page load"
echo "   4. Check metrics:"
echo "      - First Contentful Paint (FCP): <1s"
echo "      - Largest Contentful Paint (LCP): <2.5s"
echo "      - Time to Interactive (TTI): <3s"
echo "      - Cumulative Layout Shift (CLS): <0.1"
echo ""

echo "📊 TC-PERF-002: Passage Detail Page Load Time"
echo "   URL: ${BASE_URL}/reading/passages/1"
echo "   Target: <3 seconds full page load"
echo "   Same metrics as TC-PERF-001"
echo ""

echo "📊 TC-PERF-003: Progress Dashboard Load Time"
echo "   URL: ${BASE_URL}/reading/dashboard"
echo "   Target: <2.5 seconds"
echo "   Check: Charts render without blocking"
echo ""

echo "📊 TC-PERF-004: Exercise Animations Frame Rate"
echo "   1. Complete 10 exercises rapidly"
echo "   2. Open Performance tab → Frames"
echo "   3. Check: Average frame time <17ms (60fps)"
echo "   4. Look for dropped frames during animations"
echo ""

echo "🚀 AUTOMATED API TESTS (curl-based)"
echo ""

# Test with correct locale path
echo "Testing GET /en/api/reading/passages..."
response=$(curl -s -w "\n%{http_code}|%{time_total}" "${BASE_URL}/api/reading/passages?limit=5")
status=$(echo "$response" | tail -1 | cut -d'|' -f1)
time=$(echo "$response" | tail -1 | cut -d'|' -f2)
echo "  Status: $status, Time: ${time}s"

echo ""
echo "Testing GET /en/api/reading/passages/:id..."
response=$(curl -s -w "\n%{http_code}|%{time_total}" "${BASE_URL}/api/reading/passages/1")
status=$(echo "$response" | tail -1 | cut -d'|' -f1)
time=$(echo "$response" | tail -1 | cut -d'|' -f2)
echo "  Status: $status, Time: ${time}s"

echo ""
echo "Testing POST /en/api/reading/submit..."
response=$(curl -s -w "\n%{http_code}|%{time_total}" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user-perf" \
  -d '{"passageId":"1","exerciseId":"ex-1","userAnswer":{"selected_index":0},"timeSpentSeconds":15}' \
  "${BASE_URL}/api/reading/submit")
status=$(echo "$response" | tail -1 | cut -d'|' -f1)
time=$(echo "$response" | tail -1 | cut -d'|' -f2)
echo "  Status: $status, Time: ${time}s"

echo ""
echo "Testing GET /en/api/reading/progress..."
response=$(curl -s -w "\n%{http_code}|%{time_total}" \
  -H "x-user-id: test-user-perf" \
  "${BASE_URL}/api/reading/progress")
status=$(echo "$response" | tail -1 | cut -d'|' -f1)
time=$(echo "$response" | tail -1 | cut -d'|' -f2)
echo "  Status: $status, Time: ${time}s"

echo ""
echo "Testing POST /en/api/reading/vocabulary/save..."
response=$(curl -s -w "\n%{http_code}|%{time_total}" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user-perf" \
  -d '{"word":"comprehension","passageId":"1","context":"Reading comprehension is important."}' \
  "${BASE_URL}/api/reading/vocabulary/save")
status=$(echo "$response" | tail -1 | cut -d'|' -f1)
time=$(echo "$response" | tail -1 | cut -d'|' -f2)
echo "  Status: $status, Time: ${time}s"

echo ""
echo "✅ All API endpoint tests completed!"
echo ""
echo "📝 Next Steps:"
echo "   1. Open browser to test frontend performance manually"
echo "   2. Use Lighthouse in Chrome DevTools for automated scores"
echo "   3. Document results in PERFORMANCE_TEST_RESULTS_reading_v2.md"
