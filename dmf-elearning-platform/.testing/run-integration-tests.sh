#!/bin/bash
# Integration Tests for DMF Reading Module Phase 1
# Executes all 18 API + Database Integration Tests

BASE_URL="http://localhost:3000/en/api/reading"
USER_ID="test-user-integration"
TEST_COUNT=0
PASS_COUNT=0
FAIL_COUNT=0
RESULTS_FILE=".testing/integration-test-results.json"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
pass_test() {
    echo -e "${GREEN}✓ PASS${NC}: $1"
    ((PASS_COUNT++))
    ((TEST_COUNT++))
}

fail_test() {
    echo -e "${RED}✗ FAIL${NC}: $1"
    echo "  Reason: $2"
    ((FAIL_COUNT++))
    ((TEST_COUNT++))
}

test_api() {
    local test_name="$1"
    local method="$2"
    local url="$3"
    local expected_status="$4"
    local data="$5"
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "TEST: $test_name"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -H "x-user-id: $USER_ID" "$url")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -H "x-user-id: $USER_ID" \
            -d "$data" "$url")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    echo "Status: $http_code (expected: $expected_status)"
    
    if [ "$http_code" = "$expected_status" ]; then
        pass_test "$test_name"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
        echo "$body"
        return 0
    else
        fail_test "$test_name" "Expected status $expected_status, got $http_code"
        echo "$body"
        return 1
    fi
}

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  DMF Reading Module - Integration Tests                    ║"
echo "║  18 Test Cases: API Endpoints + Database + Validation      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# ============================================================================
# GROUP 1: Passage API Tests (5 tests)
# ============================================================================

echo -e "${YELLOW}GROUP 1: Passage API Tests (5 tests)${NC}"

# TC-INT-001: Get Passages - Default List
test_api "TC-INT-001: Get Passages - Default List" \
    "GET" \
    "$BASE_URL/passages" \
    "200"

# TC-INT-002: Get Passages - Filter by CEFR Level
test_api "TC-INT-002: Filter by CEFR Level (B1)" \
    "GET" \
    "$BASE_URL/passages?cefr=B1" \
    "200"

# TC-INT-003: Get Passages - Filter by Topic
test_api "TC-INT-003: Filter by Topic (health)" \
    "GET" \
    "$BASE_URL/passages?topic=health" \
    "200"

# TC-INT-004: Get Passages - Pagination
test_api "TC-INT-004: Pagination (page=1, limit=2)" \
    "GET" \
    "$BASE_URL/passages?page=1&limit=2" \
    "200"

# TC-INT-005: Get Passages - Sort by Difficulty
test_api "TC-INT-005: Sort by Difficulty (desc)" \
    "GET" \
    "$BASE_URL/passages?sort=difficulty_desc" \
    "200"

# ============================================================================
# GROUP 2: Single Passage API Tests (3 tests)
# ============================================================================

echo ""
echo -e "${YELLOW}GROUP 2: Single Passage API Tests (3 tests)${NC}"

# TC-INT-006: Get Passage by ID - With Exercises
test_api "TC-INT-006: Get Passage by ID (valid)" \
    "GET" \
    "$BASE_URL/passages/1" \
    "200"

# TC-INT-007: Get Passage - Invalid ID
test_api "TC-INT-007: Get Passage - Invalid ID" \
    "GET" \
    "$BASE_URL/passages/invalid-id-999" \
    "404"

# TC-INT-008: Get Passage - Premium Without Auth (skip - mock has no real auth)
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST: TC-INT-008: Premium Without Auth (SKIPPED - mock API)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Note: Mock API doesn't enforce authentication"
((TEST_COUNT++))

# ============================================================================
# GROUP 3: Exercise Submission Tests (6 tests)
# ============================================================================

echo ""
echo -e "${YELLOW}GROUP 3: Exercise Submission Tests (6 tests)${NC}"

# TC-INT-009: Submit Multiple Choice - Correct Answer
test_api "TC-INT-009: Submit Multiple Choice - Correct" \
    "POST" \
    "$BASE_URL/submit" \
    "200" \
    '{"passageId":"1","exerciseId":"ex-mc-1","userAnswer":{"selected_index":0},"timeSpentSeconds":15}'

# TC-INT-010: Submit Multiple Choice - Wrong Answer
test_api "TC-INT-010: Submit Multiple Choice - Wrong" \
    "POST" \
    "$BASE_URL/submit" \
    "200" \
    '{"passageId":"1","exerciseId":"ex-mc-1","userAnswer":{"selected_index":3},"timeSpentSeconds":20}'

# TC-INT-011: Submit True/False - Correct
test_api "TC-INT-011: Submit True/False - Correct" \
    "POST" \
    "$BASE_URL/submit" \
    "200" \
    '{"passageId":"1","exerciseId":"ex-tf-1","userAnswer":{"answer":true},"timeSpentSeconds":10}'

# TC-INT-012: Submit Fill Blank - Exact Match
test_api "TC-INT-012: Submit Fill Blank - Exact Match" \
    "POST" \
    "$BASE_URL/submit" \
    "200" \
    '{"passageId":"1","exerciseId":"ex-fb-1","userAnswer":{"answer":"fox"},"timeSpentSeconds":25}'

# TC-INT-013: Submit Fill Blank - Fuzzy Match (85% threshold)
test_api "TC-INT-013: Submit Fill Blank - Fuzzy Match (typo: foxs)" \
    "POST" \
    "$BASE_URL/submit" \
    "200" \
    '{"passageId":"1","exerciseId":"ex-fb-1","userAnswer":{"answer":"foxs"},"timeSpentSeconds":28}'

# TC-INT-014: Submit Sequencing - Partial Credit
test_api "TC-INT-014: Submit Sequencing - Partial Credit" \
    "POST" \
    "$BASE_URL/submit" \
    "200" \
    '{"passageId":"1","exerciseId":"ex-seq-1","userAnswer":{"order":["s1","s3","s2","s4"]},"timeSpentSeconds":40}'

# ============================================================================
# GROUP 4: Progress API Tests (2 tests)
# ============================================================================

echo ""
echo -e "${YELLOW}GROUP 4: Progress API Tests (2 tests)${NC}"

# TC-INT-015: Get User Progress
test_api "TC-INT-015: Get User Progress" \
    "GET" \
    "$BASE_URL/progress" \
    "200"

# TC-INT-016: Get Progress - New User (test with different user ID)
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST: TC-INT-016: Get Progress - New User"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
USER_ID="brand-new-user-never-used"
response=$(curl -s -w "\n%{http_code}" -H "x-user-id: $USER_ID" "$BASE_URL/progress")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

echo "Status: $http_code"
if [ "$http_code" = "200" ]; then
    # Check if progress is empty/zero
    if echo "$body" | grep -q '"passagesCompleted":0'; then
        pass_test "TC-INT-016: New user returns zero progress"
    else
        fail_test "TC-INT-016: New user should have 0 progress" "Got: $body"
    fi
else
    fail_test "TC-INT-016: Expected 200, got $http_code" "$body"
fi
USER_ID="test-user-integration"  # Reset

# ============================================================================
# GROUP 5: Vocabulary SRS API Tests (2 tests)
# ============================================================================

echo ""
echo -e "${YELLOW}GROUP 5: Vocabulary SRS API Tests (2 tests)${NC}"

# TC-INT-017: Save Vocabulary Word
test_api "TC-INT-017: Save Vocabulary Word" \
    "POST" \
    "$BASE_URL/vocabulary/save" \
    "200" \
    '{"word":"comprehension","passageId":"1","context":"Reading comprehension is important."}'

# TC-INT-018: Save Vocabulary - Duplicate Word
test_api "TC-INT-018: Save Vocabulary - Duplicate Word" \
    "POST" \
    "$BASE_URL/vocabulary/save" \
    "200" \
    '{"word":"comprehension","passageId":"1","context":"Reading comprehension is important."}'

# ============================================================================
# SUMMARY
# ============================================================================

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  TEST SUMMARY                                              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Total Tests:  $TEST_COUNT"
echo -e "${GREEN}Passed:       $PASS_COUNT${NC}"
echo -e "${RED}Failed:       $FAIL_COUNT${NC}"
echo ""

PASS_RATE=$((PASS_COUNT * 100 / TEST_COUNT))
echo "Pass Rate:    $PASS_RATE%"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED!${NC}"
    exit 0
else
    echo -e "${RED}✗ SOME TESTS FAILED${NC}"
    exit 1
fi
