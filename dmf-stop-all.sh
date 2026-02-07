#!/bin/bash

# ========================================
# DMF E-Learning Platform - Stop All Script
# ========================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

LOG_DIR="/tmp/dmf-logs"

echo -e "${YELLOW}Stopping all DMF services...${NC}"
echo ""

# Function to stop service by PID file
stop_service() {
    local service_name=$1
    local pid_file="$LOG_DIR/$service_name.pid"

    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 $pid 2>/dev/null; then
            kill $pid
            echo -e "${GREEN}✓ Stopped $service_name (PID: $pid)${NC}"
        else
            echo -e "${YELLOW}  $service_name (PID: $pid) already stopped${NC}"
        fi
        rm -f "$pid_file"
    else
        echo -e "${YELLOW}  No PID file for $service_name${NC}"
    fi
}

# Stop services
stop_service "web-learner"
stop_service "motivation-progress-service"
stop_service "gamification-service"
stop_service "onboarding-service"

# Optional: stop Ollama (commented out by default)
# stop_service "ollama"

echo ""
echo -e "${GREEN}All services stopped!${NC}"
echo ""
echo -e "Logs are still available at: $LOG_DIR"
echo -e "To clear logs: rm -rf $LOG_DIR/*"
echo ""
