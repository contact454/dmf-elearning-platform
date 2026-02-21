# Production Environment

## Overview
Production environment serving live users. All changes must be validated in staging first.

## Services
| Service | Port | Database | Deployment |
|---------|------|----------|------------|
| learning-service | 3003 | dmf_learning | Cloud Run |
| practice-service | 3001 | practice | Cloud Run |
| onboarding-service | 3002 | onboarding | Cloud Run |
| curriculum-service | 3013 | curriculum | Cloud Run |
| progress-service | 3004 | - | Cloud Run |
| motivation-progress-service | 3005 | - | Cloud Run |
| gamification-service | 3006 | - | Cloud Run |
| read-service | 3007 | - | Cloud Run |
| speaking-service | 3008 | speaking | Cloud Run |
| writing-service | 3009 | writing | Cloud Run |
| ops-admin-service | 3010 | - | Cloud Run |
| evidence-service | 3011 | - | Cloud Run |
| ops-service | 3012 | - | Cloud Run |
| assessment-service | 3014 | assessment | Cloud Run |

## Required Environment Variables
```env
NODE_ENV=production
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/dmf_learning
REDIS_URL=redis://<password>@<host>:6379
SUPABASE_URL=https://<production-project>.supabase.co
SUPABASE_ANON_KEY=<production-anon-key>
SUPABASE_JWT_SECRET=<production-jwt-secret>
CORS_ALLOWED_ORIGINS=https://dmf-elearning.vercel.app,https://dmf-learning-service-217304868664.asia-southeast1.run.app
```

## Infrastructure
- **PostgreSQL**: Cloud SQL (GCP) with high availability
- **Redis**: Managed Redis (GCP Memorystore) with persistence
- **Hosting**: Google Cloud Run (asia-southeast1) with autoscaling
- **CDN**: Vercel (frontend), Cloud CDN (static assets)
- **DNS**: Custom domain via Vercel + GCP load balancer

## Deployment
- **Branch**: `main` branch deploys to production
- **CI/CD**: GitHub Actions with manual approval gate
- **Database migrations**: Run with `pnpm prisma:migrate` (requires backup first)
- **Rollback**: Revert Cloud Run revision to previous version

## Monitoring
- Health checks: `https://api.dmf-elearning.app/health`
- Logs: Google Cloud Logging (30-day retention)
- Metrics: `/metrics` endpoint (Prometheus-compatible)
- Alerts: Configured for error rate > 1%, latency p95 > 2s

## Security Checklist
- [ ] All secrets stored in GCP Secret Manager
- [ ] CORS restricted to production domains only
- [ ] Rate limiting enabled (strict)
- [ ] HTTPS enforced (Cloud Run default)
- [ ] Database connections via private IP / Cloud SQL Proxy
- [ ] Regular dependency vulnerability scanning

## Scaling Configuration
- **Min instances**: 1 (avoid cold starts)
- **Max instances**: 10 (auto-scale based on CPU/request count)
- **Memory**: 512MB per instance
- **CPU**: 1 vCPU per instance
- **Request timeout**: 60s
- **Concurrency**: 80 requests per instance

## Backup Strategy
- **Database**: Daily automated backups (Cloud SQL), 30-day retention
- **Point-in-time recovery**: Enabled
- **Manual backup**: Before every migration
