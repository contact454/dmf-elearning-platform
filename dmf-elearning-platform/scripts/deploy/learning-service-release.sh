#!/usr/bin/env bash
set -euo pipefail

if ! command -v railway >/dev/null 2>&1; then
  echo "railway CLI is required"
  exit 1
fi

: "${SUPABASE_URL:?SUPABASE_URL is required}"
: "${SUPABASE_ANON_KEY:?SUPABASE_ANON_KEY is required}"

if [[ -z "${RAILWAY_TOKEN:-}" ]]; then
  echo "RAILWAY_TOKEN not set; using existing Railway CLI login context"
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
SERVICE_DIR="${REPO_ROOT}/services/learning-service"

cd "${SERVICE_DIR}"

if [[ -n "${RAILWAY_PROJECT_ID:-}" ]]; then
  railway link "${RAILWAY_PROJECT_ID}" >/dev/null
fi

railway variable set -s learning-service \
  NODE_ENV=production \
  AUTH_ENFORCE_SUBJECT_MATCH=true \
  AUTH_ALLOW_UNVERIFIED_JWT=false \
  SUPABASE_URL="${SUPABASE_URL}" \
  SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY}" \
  REQUEST_LOGGING_ENABLED=true \
  REQUEST_LOG_INCLUDE_QUERY=false \
  REQUEST_LOG_SERVICE_NAME=learning-service \
  MONITORING_ALERTS_ENABLED=true \
  MONITORING_5XX_ALERT_THRESHOLD=5 \
  MONITORING_429_ALERT_THRESHOLD=10 \
  MONITORING_AUTH_ALERT_THRESHOLD=25 \
  MONITORING_SLOW_REQUEST_MS=1500 \
  --skip-deploys >/dev/null

if [[ -n "${SUPABASE_JWT_SECRET:-}" ]]; then
  railway variable set -s learning-service SUPABASE_JWT_SECRET="${SUPABASE_JWT_SECRET}" --skip-deploys >/dev/null
  echo "SUPABASE_JWT_SECRET configured"
else
  echo "SUPABASE_JWT_SECRET not provided; fallback auth verification remains active"
fi

if [[ -n "${DATABASE_URL_REFERENCE:-}" ]]; then
  railway variable set -s learning-service DATABASE_URL="${DATABASE_URL_REFERENCE}" --skip-deploys >/dev/null
fi

railway up -s learning-service -d >/dev/null

BACKEND_URL="$(railway domain -s learning-service --json | node -e 'let d="";process.stdin.on("data",c=>d+=c);process.stdin.on("end",()=>{const j=JSON.parse(d);process.stdout.write(j.domain||"")})')"
if [[ -z "${BACKEND_URL}" ]]; then
  echo "Failed to resolve Railway domain for learning-service"
  exit 1
fi

if [[ "${BACKEND_URL}" != https://* ]]; then
  BACKEND_URL="https://${BACKEND_URL}"
fi

DEPLOYED_AT_UTC="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
COMMIT_SHA="${GITHUB_SHA:-$(git -C "${REPO_ROOT}" rev-parse HEAD)}"

METADATA_FILE="${SERVICE_DIR}/.deploy-learning-service-meta.env"
{
  echo "BACKEND_URL=${BACKEND_URL}"
  echo "DEPLOYED_AT_UTC=${DEPLOYED_AT_UTC}"
  echo "COMMIT_SHA=${COMMIT_SHA}"
} > "${METADATA_FILE}"

echo "Deployed learning-service to ${BACKEND_URL}"
echo "Metadata file: ${METADATA_FILE}"
