#!/bin/bash

# 🧪 Script kiểm tra AI Tutor API

echo "🔍 Checking Ollama Service Health..."
echo ""

# Test 1: Check if Ollama is running
echo "Test 1: Ollama Health Check"
curl -s http://127.0.0.1:11434/api/tags | jq '.models[] | {name: .name, size: .size}' || echo "❌ Ollama is not running or jq not installed"
echo ""

# Test 2: Check AI Tutor Health
echo "Test 2: AI Tutor Service Health"
curl -s http://127.0.0.1:3005/api/learning/ai-health | jq '.' || echo "❌ Learning Service not running on port 3005"
echo ""

# Test 3: Request AI Explanation
echo "Test 3: AI Explanation Request"
curl -s -X POST http://127.0.0.1:3005/api/learning/ai-explain \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is the purpose of getServerSideProps in Next.js?",
    "userAnswer": "To fetch data on the client side",
    "correctAnswer": "To fetch data on the server side before rendering"
  }' | jq '.' || echo "❌ AI Explain endpoint failed"
echo ""

echo "✅ All tests completed!"
