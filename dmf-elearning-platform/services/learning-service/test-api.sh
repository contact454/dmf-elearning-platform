#!/bin/bash

# Learning Service API Test Script

BASE_URL="http://localhost:3003/api"

echo "================================================"
echo "   DMF Learning Service API Test Suite"
echo "================================================"
echo ""

echo "1️⃣  Testing Health Endpoint..."
echo "GET /api/health"
curl -s $BASE_URL/health | jq
echo ""

echo "2️⃣  Testing Levels Endpoint..."
echo "GET /api/resources/levels"
curl -s $BASE_URL/resources/levels | jq
echo ""

echo "3️⃣  Testing Topics Endpoint (A1)..."
echo "GET /api/resources/A1/topics"
curl -s $BASE_URL/resources/A1/topics | jq '.data | {level, count, first_5_topics: .topics[:5]}'
echo ""

echo "4️⃣  Testing Topics Endpoint (A2)..."
echo "GET /api/resources/A2/topics"
curl -s $BASE_URL/resources/A2/topics | jq '.data | {level, count}'
echo ""

echo "5️⃣  Testing Level Summary (A1)..."
echo "GET /api/resources/A1/summary"
curl -s $BASE_URL/resources/A1/summary | jq
echo ""

echo "6️⃣  Testing Vocabulary Endpoint..."
echo "GET /api/resources/A1/Conjunctions"
curl -s $BASE_URL/resources/A1/Conjunctions | jq
echo ""

echo "7️⃣  Testing Error Handling (Invalid Level)..."
echo "GET /api/resources/X9/topics"
curl -s $BASE_URL/resources/X9/topics | jq
echo ""

echo "8️⃣  Testing Error Handling (Non-existent Topic)..."
echo "GET /api/resources/A1/NonExistentTopic"
curl -s $BASE_URL/resources/A1/NonExistentTopic | jq
echo ""

echo "================================================"
echo "   ✅ All Tests Complete"
echo "================================================"
