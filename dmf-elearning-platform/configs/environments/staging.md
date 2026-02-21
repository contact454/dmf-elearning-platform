# Staging Environment

## Overview
Staging mirrors production as closely as possible. Used for final validation before production deployments.

## Services
| Service | Port | Database | Deployment |
|---------|------|----------|------------|
| learning-service | 3003 | dmf_learning_staging | Cloud Run |
| practice-service | 3001 | practice_staging | Cloud Run |
| onboarding-service | 3002 | onboarding_staging | Cloud Run |
| curriculum-service | 3013 | curriculum_staging | Cloud Run |
| progress-service | 3004 | - | Cloud Run |
| motivation-progress-service | 3005 | - | Cloud Run |
| gamification-service | 3006 | - | Cloud Run |
| read-service | 3007 | - | Cloud Run |
| speaking-service | 3008 | speaking_staging | Cloud Run |
| writing-service | 3009 | writing_staging | Cloud Run |
| ops-admin-service | 3010 | - | Cloud Run |
| evidence-service | 3011 | - | Cloud Run |
| ops-service | 3012 | - | Cloud Run |
| assessment-service | 3014 | assessment_staging | Cloud Run |

## Required Environment Variables
```env
NODE_ENV=staging
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/dmf_learning_staging
REDIS_URL=redis://<password>@<host>:6379
SUPABASE_URL=https://<staging-project>.supabase.co
SUPABASE_ANON_KEY=<staging-anon-key>
SUPABASE_JWT_SECRET=<staging-jwt-secret>
CORS_ALLOWED_ORIGINS=https://staging.dmf-elearning.vercel.app
```

## Infrastructure
- **PostgreSQL**: Cloud SQL (GCP) or Supabase managed instance
- **Redis**: Managed Redis (GCP Memorystore or similar)
- **Hosting**: Google Cloud Run (asia-southeast1)
- **CDN**: Vercel (frontend), Cloud CDN (assets)

## Deployment
- **Branch**: `develop` branch auto-deploys to staging
- **CI/CD**: GitHub Actions triggers Cloud Run deployment
- **Database migrations**: Run manually before deploy via `pnpm prisma:migrate`

## Monitoring
- Health checks: `https://staging-api.dmf-elearning.app/health`
- Logs: Google Cloud Logging
- Metrics: `/metrics` endpoint (Prometheus-compatible)

## Key Differences from Production
- Relaxed rate limiting for QA testing
- Debug logging enabled (`LOG_LEVEL=debug`)
- Test accounts with seeded data available
- No real payment processing (sandbox mode)
