#!/bin/bash
# Quick manual deploy to Cloud Run (without Cloud Build trigger)
# Usage: ./scripts/deploy-cloud-run.sh

set -e

PROJECT_ID="${GCP_PROJECT_ID:-dmf-elearning}"
REGION="asia-southeast1"
SERVICE_NAME="dmf-learning-service"
IMAGE="asia-southeast1-docker.pkg.dev/$PROJECT_ID/dmf-elearning/learning-service"

echo "🚀 Deploying DMF to Cloud Run..."
echo "   Project: $PROJECT_ID"
echo "   Region:  $REGION"
echo ""

# Build + push
echo "📦 Building Docker image..."
gcloud builds submit \
  --tag "${IMAGE}:latest" \
  --project "$PROJECT_ID" \
  services/learning-service

# Deploy
echo ""
echo "🌐 Deploying to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --image "${IMAGE}:latest" \
  --region "$REGION" \
  --platform managed \
  --port 3004 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 3 \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,PORT=3004" \
  --set-secrets "GEMINI_API_KEY=gemini-api-key:latest,DATABASE_URL=database-url:latest" \
  --project "$PROJECT_ID"

# Get URL
URL=$(gcloud run services describe "$SERVICE_NAME" --region="$REGION" --format="value(status.url)" --project "$PROJECT_ID")
echo ""
echo "═══════════════════════════════════════"
echo "  ✅ DEPLOYED!"
echo "  📍 URL: $URL"
echo "  📊 Health: $URL/health"
echo "  📋 API: $URL/api"
echo "═══════════════════════════════════════"
