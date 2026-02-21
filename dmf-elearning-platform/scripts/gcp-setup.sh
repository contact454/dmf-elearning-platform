#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# DMF E-Learning Platform — Google Cloud Setup Script
# Run this ONCE to set up your GCP project for deployment
# ═══════════════════════════════════════════════════════════════

set -e

# ─── Configuration ───
PROJECT_ID="${GCP_PROJECT_ID:-dmf-elearning}"
REGION="asia-southeast1"  # Singapore (closest to Vietnam)
SERVICE_NAME="dmf-learning-service"
REPO_NAME="dmf-elearning"

echo "═══════════════════════════════════════════"
echo "  DMF E-Learning — Google Cloud Setup"
echo "  Project: $PROJECT_ID"
echo "  Region:  $REGION"
echo "═══════════════════════════════════════════"

# ─── Step 1: Login & set project ───
echo ""
echo "📋 Step 1: Authenticating..."
gcloud auth login
gcloud config set project "$PROJECT_ID"
gcloud config set run/region "$REGION"

# ─── Step 2: Enable required APIs ───
echo ""
echo "🔌 Step 2: Enabling Google Cloud APIs..."
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  sqladmin.googleapis.com \
  speech.googleapis.com \
  texttospeech.googleapis.com \
  translate.googleapis.com \
  aiplatform.googleapis.com \
  bigquery.googleapis.com \
  cloudscheduler.googleapis.com \
  cloudtasks.googleapis.com \
  firebase.googleapis.com \
  fcm.googleapis.com \
  vision.googleapis.com \
  monitoring.googleapis.com \
  logging.googleapis.com

echo "  ✅ All APIs enabled"

# ─── Step 3: Create Artifact Registry repository ───
echo ""
echo "📦 Step 3: Creating Artifact Registry..."
gcloud artifacts repositories create "$REPO_NAME" \
  --repository-format=docker \
  --location="$REGION" \
  --description="DMF E-Learning Docker images" \
  2>/dev/null || echo "  ⚠️  Repository already exists"

echo "  ✅ Artifact Registry ready"

# ─── Step 4: Store secrets ───
echo ""
echo "🔐 Step 4: Setting up Secret Manager..."

# Gemini API Key — read from environment variable
if [ -z "$GEMINI_API_KEY" ]; then
  echo "  ⚠️  GEMINI_API_KEY environment variable not set!"
  echo "     Set it with: export GEMINI_API_KEY='your-api-key-here'"
  echo "     Then re-run this script."
  exit 1
fi

echo -n "$GEMINI_API_KEY" | \
  gcloud secrets create gemini-api-key --data-file=- 2>/dev/null || \
  echo -n "$GEMINI_API_KEY" | \
  gcloud secrets versions add gemini-api-key --data-file=-

# Database URL placeholder
echo -n "postgresql://postgres:postgres@localhost:5432/dmf_learning_db" | \
  gcloud secrets create database-url --data-file=- 2>/dev/null || \
  echo "  ⚠️  database-url secret already exists"

# Supabase JWT Secret placeholder
echo -n "your-supabase-jwt-secret" | \
  gcloud secrets create supabase-jwt-secret --data-file=- 2>/dev/null || \
  echo "  ⚠️  supabase-jwt-secret already exists"

echo "  ✅ Secrets stored"

# ─── Step 5: Grant Cloud Build permissions ───
echo ""
echo "🔑 Step 5: Granting Cloud Build permissions..."
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format="value(projectNumber)")
CB_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${CB_SA}" \
  --role="roles/run.admin" --quiet

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${CB_SA}" \
  --role="roles/iam.serviceAccountUser" --quiet

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${CB_SA}" \
  --role="roles/secretmanager.secretAccessor" --quiet

echo "  ✅ Permissions granted"

# ─── Step 6: Create Cloud Build trigger ───
echo ""
echo "🔄 Step 6: Creating Cloud Build trigger..."
gcloud builds triggers create github \
  --name="dmf-deploy-main" \
  --repo-name="dmf-elearning-platform" \
  --repo-owner="contact454" \
  --branch-pattern="^main$" \
  --build-config="cloudbuild.yaml" \
  2>/dev/null || echo "  ⚠️  Trigger already exists (or needs GitHub connection)"

echo "  ✅ CI/CD trigger ready"

# ─── Step 7: Create BigQuery dataset ───
echo ""
echo "📊 Step 7: Setting up BigQuery..."
bq mk --dataset --location="$REGION" "${PROJECT_ID}:dmf_analytics" 2>/dev/null || \
  echo "  ⚠️  Dataset already exists"

echo "  ✅ BigQuery ready"

# ─── Step 8: Create Cloud Scheduler jobs ───
echo ""
echo "⏰ Step 8: Creating Cloud Scheduler jobs..."

# Nudge processor — runs every 15 minutes
gcloud scheduler jobs create http dmf-process-nudges \
  --schedule="*/15 * * * *" \
  --uri="https://${SERVICE_NAME}-${PROJECT_NUMBER}.${REGION}.run.app/api/notifications/process-nudges" \
  --http-method=POST \
  --location="$REGION" \
  2>/dev/null || echo "  ⚠️  Nudge processor job already exists"

# Drift detection — runs daily at 3am
gcloud scheduler jobs create http dmf-drift-detection \
  --schedule="0 3 * * *" \
  --uri="https://${SERVICE_NAME}-${PROJECT_NUMBER}.${REGION}.run.app/api/advanced/ml/drift/detect" \
  --http-method=POST \
  --headers="Content-Type=application/json" \
  --body='{"modelName":"pronunciation-de-v1"}' \
  --location="$REGION" \
  2>/dev/null || echo "  ⚠️  Drift detection job already exists"

echo "  ✅ Scheduler jobs ready"

# ─── Summary ───
echo ""
echo "═══════════════════════════════════════════"
echo "  ✅ SETUP COMPLETE!"
echo "═══════════════════════════════════════════"
echo ""
echo "  Project:  $PROJECT_ID"
echo "  Region:   $REGION"
echo "  Registry: $REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME"
echo ""
echo "  Next steps:"
echo "  1. Push to main → auto-deploys via Cloud Build"
echo "  2. Or manual deploy: gcloud builds submit --config=cloudbuild.yaml"
echo "  3. Check status: gcloud run services describe $SERVICE_NAME --region=$REGION"
echo ""
