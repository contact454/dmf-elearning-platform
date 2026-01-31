#!/bin/bash
# PostgreSQL Query Helper for Development
# Usage: ./scripts/db-query.sh "SELECT * FROM users LIMIT 5"

set -e

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-dmf_user}"
DB_PASSWORD="${DB_PASSWORD:-dmf_password}"
DB_NAME="${DB_NAME:-dmf_learning}"

if [ -z "$1" ]; then
  echo "Usage: $0 \"SQL_QUERY\""
  echo ""
  echo "Examples:"
  echo "  $0 \"SELECT * FROM users LIMIT 5\""
  echo "  $0 \"\\dt\"  # List tables"
  echo "  $0 \"\\d users\"  # Describe table"
  exit 1
fi

PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "$1"
