#!/bin/bash

# ========================================
# DMF E-Learning Platform - Monitor Script
# ========================================
# Giám sát logs và performance của tất cả services
#
# Usage: ./dmf-monitor.sh [service-name]
#   service-name: motivation-progress-service, web-learner, gamification-service, ollama, all
# ========================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

LOG_DIR="/tmp/dmf-logs"
SERVICE="${1:-all}"

# AI Tutor Performance Monitoring
AI_RESPONSE_THRESHOLD=10  # seconds

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   DMF Platform Monitor${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to check service health
check_health() {
    local service_name=$1
    local port=$2
    local health_endpoint=$3

    echo -e "${YELLOW}Checking $service_name...${NC}"

    if ! lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${RED}✗ $service_name is DOWN (port $port not listening)${NC}"
        return 1
    fi

    if [ -n "$health_endpoint" ]; then
        local response=$(curl -s -w "\n%{http_code}" "$health_endpoint" 2>/dev/null | tail -1)
        if [ "$response" = "200" ]; then
            echo -e "${GREEN}✓ $service_name is HEALTHY${NC}"
        else
            echo -e "${YELLOW}⚠ $service_name is UP but health check failed (HTTP $response)${NC}"
        fi
    else
        echo -e "${GREEN}✓ $service_name is UP${NC}"
    fi
}

# Function to monitor AI Tutor response time
monitor_ai_tutor() {
    echo -e "${YELLOW}Monitoring AI Tutor Performance...${NC}"

    local log_file="$LOG_DIR/motivation-progress-service.log"

    if [ ! -f "$log_file" ]; then
        echo -e "${RED}✗ Log file not found: $log_file${NC}"
        return 1
    fi

    # Check for slow AI responses in last 50 lines
    local slow_responses=$(grep -i "ai.*explanation" "$log_file" | tail -50 | grep -c "slow\|timeout\|error" || true)

    if [ $slow_responses -gt 0 ]; then
        echo -e "${RED}⚠ Found $slow_responses slow/error AI responses${NC}"
        echo -e "${YELLOW}Recommendation: Consider optimizing Ollama num_threads${NC}"
    else
        echo -e "${GREEN}✓ AI Tutor response time is good${NC}"
    fi
}

# Function to show latest logs
show_logs() {
    local service_name=$1
    local lines=${2:-30}
    local log_file="$LOG_DIR/$service_name.log"

    if [ -f "$log_file" ]; then
        echo -e "${BLUE}Latest $lines lines from $service_name:${NC}"
        tail -n $lines "$log_file"
    else
        echo -e "${RED}✗ Log file not found: $log_file${NC}"
    fi
}

# Main monitoring logic
case $SERVICE in
    "all")
        check_health "Ollama" 11434 "http://127.0.0.1:11434/api/tags"
        echo ""
        check_health "Motivation Progress" 3005 "http://127.0.0.1:3005/health"
        echo ""
        check_health "Gamification" 3006 "http://127.0.0.1:3006/health"
        echo ""
        check_health "Frontend" 3000 ""
        echo ""
        monitor_ai_tutor
        echo ""
        echo -e "${YELLOW}For detailed logs, run:${NC}"
        echo -e "  ./dmf-monitor.sh motivation-progress-service"
        echo -e "  ./dmf-monitor.sh web-learner"
        echo -e "  ./dmf-monitor.sh gamification-service"
        ;;
    "motivation-progress-service"|"web-learner"|"gamification-service"|"ollama")
        show_logs "$SERVICE" 50
        ;;
    *)
        echo -e "${RED}Unknown service: $SERVICE${NC}"
        echo -e "Usage: $0 [all|motivation-progress-service|web-learner|gamification-service|ollama]"
        exit 1
        ;;
esac

echo ""
