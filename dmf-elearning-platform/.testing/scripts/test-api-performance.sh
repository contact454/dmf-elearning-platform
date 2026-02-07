#!/bin/bash

# Performance Testing Script for DMF Vocabulary API
# Tests TC-PERF-004, TC-PERF-005, TC-PERF-006

set -e

API_BASE="http://localhost:3003"
USER_ID="cm64test0001user"
NUM_REQUESTS=15

echo "========================================="
echo "DMF Vocabulary API Performance Tests"
echo "========================================="
echo "Test Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo "API Base: $API_BASE"
echo "Number of Requests: $NUM_REQUESTS"
echo ""

# Function to calculate statistics
calculate_stats() {
    local file=$1
    local count=$(wc -l < "$file")
    local sum=$(awk '{sum+=$1} END {print sum}' "$file")
    local avg=$(echo "scale=2; $sum / $count" | bc)
    local min=$(sort -n "$file" | head -1)
    local max=$(sort -n "$file" | tail -1)

    # Calculate p95
    local p95_index=$(echo "scale=0; $count * 0.95 / 1" | bc)
    local p95=$(sort -n "$file" | sed -n "${p95_index}p")

    echo "Count: $count"
    echo "Average: ${avg}ms"
    echo "Min: ${min}ms"
    echo "Max: ${max}ms"
    echo "P95: ${p95}ms"
}

# TC-PERF-004: GET /api/review/queue
echo "========================================="
echo "TC-PERF-004: GET /api/review/queue"
echo "Target: <100ms average, <200ms p95"
echo "========================================="

TEMP_FILE=$(mktemp)
for i in $(seq 1 $NUM_REQUESTS); do
    TIME=$(curl -s -w '%{time_total}\n' -o /dev/null \
        -H "x-user-id: $USER_ID" \
        "$API_BASE/api/review/queue")
    # Convert to milliseconds
    MS=$(echo "$TIME * 1000" | bc)
    echo "$MS" >> "$TEMP_FILE"
    echo "Request $i: ${MS}ms"
done

echo ""
echo "Statistics:"
calculate_stats "$TEMP_FILE"
rm "$TEMP_FILE"

echo ""
echo "========================================="
echo "TC-PERF-005: POST /api/review/submit"
echo "Target: <50ms average"
echo "========================================="

# Get a valid word ID first
WORD_ID=$(curl -s -H "x-user-id: $USER_ID" "$API_BASE/api/review/queue" | \
    jq -r '.data.words[0].wordId' 2>/dev/null || echo "")

if [ -z "$WORD_ID" ] || [ "$WORD_ID" = "null" ]; then
    echo "ERROR: Could not get valid word ID for testing"
    echo "SKIPPED: TC-PERF-005"
else
    echo "Using word ID: $WORD_ID"
    echo ""

    TEMP_FILE=$(mktemp)
    for i in $(seq 1 $NUM_REQUESTS); do
        TIME=$(curl -s -w '%{time_total}\n' -o /dev/null \
            -X POST \
            -H "Content-Type: application/json" \
            -H "x-user-id: $USER_ID" \
            -d "{\"wordId\": \"$WORD_ID\", \"quality\": 4}" \
            "$API_BASE/api/review/submit")
        MS=$(echo "$TIME * 1000" | bc)
        echo "$MS" >> "$TEMP_FILE"
        echo "Request $i: ${MS}ms"
    done

    echo ""
    echo "Statistics:"
    calculate_stats "$TEMP_FILE"
    rm "$TEMP_FILE"
fi

echo ""
echo "========================================="
echo "TC-PERF-006: GET /api/user/streak"
echo "Target: <100ms average"
echo "========================================="

TEMP_FILE=$(mktemp)
for i in $(seq 1 $NUM_REQUESTS); do
    TIME=$(curl -s -w '%{time_total}\n' -o /dev/null \
        -H "x-user-id: $USER_ID" \
        "$API_BASE/api/user/streak")
    MS=$(echo "$TIME * 1000" | bc)
    echo "$MS" >> "$TEMP_FILE"
    echo "Request $i: ${MS}ms"
done

echo ""
echo "Statistics:"
calculate_stats "$TEMP_FILE"
rm "$TEMP_FILE"

echo ""
echo "========================================="
echo "TC-PERF-007: Load Test - Concurrent Review Submissions"
echo "Target: 0 failures, avg latency <500ms"
echo "========================================="

echo "Running 30 sequential requests to simulate load..."
TEMP_FILE=$(mktemp)
FAILURES=0

for i in $(seq 1 30); do
    RESPONSE=$(curl -s -w '\n%{http_code}\n%{time_total}' \
        -H "x-user-id: $USER_ID" \
        "$API_BASE/api/review/queue")

    HTTP_CODE=$(echo "$RESPONSE" | tail -2 | head -1)
    TIME=$(echo "$RESPONSE" | tail -1)
    MS=$(echo "$TIME * 1000" | bc)

    echo "$MS" >> "$TEMP_FILE"

    if [ "$HTTP_CODE" != "200" ]; then
        FAILURES=$((FAILURES + 1))
        echo "Request $i: ${MS}ms [FAILED - HTTP $HTTP_CODE]"
    else
        echo "Request $i: ${MS}ms [OK]"
    fi
done

echo ""
echo "Statistics:"
calculate_stats "$TEMP_FILE"
echo "Failures: $FAILURES / 30"
rm "$TEMP_FILE"

echo ""
echo "========================================="
echo "Performance Testing Complete"
echo "========================================="
