#!/usr/bin/env bash
set -euo pipefail

: "${BACKEND_URL:?BACKEND_URL is required}"
: "${NEXT_PUBLIC_SUPABASE_URL:?NEXT_PUBLIC_SUPABASE_URL is required}"
: "${NEXT_PUBLIC_SUPABASE_ANON_KEY:?NEXT_PUBLIC_SUPABASE_ANON_KEY is required}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

health_status="$(curl -sS -m 12 -o /tmp/learning-health.json -w "%{http_code}" "${BACKEND_URL}/api/health" || true)"
if [[ "${health_status}" != "200" ]]; then
  echo "Health check failed: ${health_status}"
  cat /tmp/learning-health.json || true
  exit 1
fi

route_status="$(curl -sS -m 12 -o /tmp/learning-route-protection.json -w "%{http_code}" "${BACKEND_URL}/api/route-protection" || true)"
if [[ "${route_status}" != "200" ]]; then
  echo "Route protection check failed: ${route_status}"
  cat /tmp/learning-route-protection.json || true
  exit 1
fi

cd "${ROOT_DIR}"
LEARNING_SERVICE_URL="${BACKEND_URL}" \
S1_SMOKE_USE_ADMIN="${S1_SMOKE_USE_ADMIN:-true}" \
S1_SMOKE_EMAIL_DOMAIN="${S1_SMOKE_EMAIL_DOMAIN:-gmail.com}" \
pnpm s1:auth-smoke

echo "Smoke checks passed for ${BACKEND_URL}"
