#!/bin/bash

# ========================================
# DMF E-Learning Platform - Auto Start Script
# ========================================
# Khởi động tất cả services chỉ bằng 1 lệnh!
#
# Usage: ./dmf-start-all.sh
# Stop: ./dmf-stop-all.sh
# ========================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Project root
PROJECT_ROOT="/Users/huynhngocphuc/Dev-Workspace/Active-Projects/05-DMF-Elearning/dmf-elearning-platform"
LOG_DIR="/tmp/dmf-logs"

# Create log directory
mkdir -p "$LOG_DIR"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   DMF E-Learning Platform Startup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to start a service
start_service() {
    local service_name=$1
    local service_path=$2
    local port=$3
    local log_file="$LOG_DIR/$service_name.log"

    echo -e "${YELLOW}Starting $service_name on port $port...${NC}"

    if check_port $port; then
        echo -e "${GREEN}✓ $service_name already running on port $port${NC}"
        return 0
    fi

    cd "$PROJECT_ROOT/$service_path"
    pnpm dev > "$log_file" 2>&1 &
    local pid=$!

    echo "$pid" > "$LOG_DIR/$service_name.pid"

    # Wait for service to start
    sleep 5

    if check_port $port; then
        echo -e "${GREEN}✓ $service_name started successfully (PID: $pid)${NC}"
        echo -e "  Log: $log_file"
    else
        echo -e "${RED}✗ $service_name failed to start${NC}"
        echo -e "  Check log: tail -f $log_file"
        return 1
    fi
}

# 1. Check Ollama
echo -e "${YELLOW}Checking Ollama service...${NC}"
if check_port 11434; then
    echo -e "${GREEN}✓ Ollama is running on port 11434${NC}"
else
    echo -e "${RED}✗ Ollama is not running!${NC}"
    echo -e "${YELLOW}Starting Ollama...${NC}"
    OLLAMA_ORIGINS="*" ollama serve > "$LOG_DIR/ollama.log" 2>&1 &
    echo $! > "$LOG_DIR/ollama.pid"
    sleep 3
    if check_port 11434; then
        echo -e "${GREEN}✓ Ollama started successfully${NC}"
    else
        echo -e "${RED}✗ Failed to start Ollama. Please start manually:${NC}"
        echo -e "  OLLAMA_ORIGINS=\"*\" ollama serve"
        exit 1
    fi
fi

echo ""

# 2. Start Onboarding Service (if needed - port 3002)
if [ -d "$PROJECT_ROOT/services/onboarding-service" ]; then
    start_service "onboarding-service" "services/onboarding-service" 3002
    echo ""
fi

# 3. Start Motivation Progress Service (port 3005)
start_service "motivation-progress-service" "services/motivation-progress-service" 3005
echo ""

# 4. Start Gamification Service (port 3006)
start_service "gamification-service" "services/gamification-service" 3006
echo ""

# 5. Start Frontend (port 3000)
start_service "web-learner" "apps/web-learner" 3000
echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}   All Services Started!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Access Points:${NC}"
echo -e "  Frontend:       http://localhost:3000"
echo -e "  Motivation API: http://localhost:3005/health"
echo -e "  Gamification:   http://localhost:3006/health"
echo -e "  Ollama API:     http://localhost:11434/api/tags"
echo ""
echo -e "${YELLOW}Logs:${NC}"
echo -e "  All logs: ls -lh $LOG_DIR"
echo -e "  View log: tail -f $LOG_DIR/<service-name>.log"
echo ""
echo -e "${YELLOW}Management:${NC}"
echo -e "  Stop all: ./dmf-stop-all.sh"
echo -e "  Monitor:  ./dmf-monitor.sh"
echo ""
