#!/bin/bash

# ========================================
# Ollama Auto-Optimizer
# ========================================
# Tự động tối ưu hóa Ollama khi phát hiện AI Tutor chậm
# ========================================

set -e

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Ollama Auto-Optimizer${NC}"
echo ""

# Get current CPU cores
CPU_CORES=$(sysctl -n hw.ncpu)
OPTIMAL_THREADS=$((CPU_CORES / 2))

echo -e "${YELLOW}System Info:${NC}"
echo -e "  CPU Cores: $CPU_CORES"
echo -e "  Recommended Threads: $OPTIMAL_THREADS"
echo ""

# Test current AI response time
echo -e "${YELLOW}Testing AI Tutor response time...${NC}"

START_TIME=$(date +%s)

curl -s -X POST http://127.0.0.1:3005/api/learning/ai-explain \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Test question",
    "userAnswer": "Wrong answer",
    "correctAnswer": "Correct answer"
  }' > /dev/null 2>&1

END_TIME=$(date +%s)
RESPONSE_TIME=$((END_TIME - START_TIME))

echo -e "  Response Time: ${RESPONSE_TIME}s"

if [ $RESPONSE_TIME -gt 10 ]; then
    echo -e "${YELLOW}⚠ Response time is slow (>10s)${NC}"
    echo -e "${YELLOW}Optimizing Ollama configuration...${NC}"
    echo ""

    # Create Ollama modelfile with optimized settings
    cat > /tmp/llama-optimized.modelfile <<EOF
FROM llama3.2:latest

# Optimize for faster inference
PARAMETER num_thread $OPTIMAL_THREADS
PARAMETER num_gpu 1
PARAMETER num_ctx 2048
PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER num_predict 300
EOF

    echo -e "${YELLOW}Creating optimized model...${NC}"
    ollama create llama3.2-optimized -f /tmp/llama-optimized.modelfile

    echo -e "${GREEN}✓ Optimized model created: llama3.2-optimized${NC}"
    echo ""
    echo -e "${YELLOW}To use the optimized model, update AITutorService:${NC}"
    echo -e "  Model name: llama3.2-optimized"
    echo ""
    echo -e "Or I can do it automatically for you!"

else
    echo -e "${GREEN}✓ Response time is acceptable${NC}"
fi

echo ""
