# Local Development Environment

## Services
| Service | Port | Database | Notes |
|---------|------|----------|-------|
| learning-service | 3003 | dmf_learning | Main monolithic service |
| practice-service | 3001 | practice | CQRS commands |
| onboarding-service | 3002 | onboarding | Auth + registration |
| curriculum-service | 3013 | curriculum | Course management |
| progress-service | 3004 | - | Event consumer (read-only) |
| motivation-progress-service | 3005 | - | AI + mastery tracking |
| gamification-service | 3006 | - | XP, achievements |
| read-service | 3007 | - | Query projections |
| speaking-service | 3008 | speaking | Speech analysis |
| writing-service | 3009 | writing | Grammar checking |
| ops-admin-service | 3010 | - | Admin operations |
| evidence-service | 3011 | - | Anti-cheating |
| ops-service | 3012 | - | Operations |
| assessment-service | 3014 | assessment | Placement tests |

## Required Environment Variables
```env
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/dmf_learning
REDIS_URL=redis://:password@localhost:6379
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_JWT_SECRET=your-jwt-secret
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

## Setup Steps
1. Copy `.env.example` to `.env`
2. Fill in required values
3. Run `docker-compose up -d postgres redis`
4. Run `pnpm install`
5. Run `pnpm prisma:migrate`
6. Run `pnpm dev`

## Infrastructure Dependencies
- **PostgreSQL 15+**: Main database (localhost:5432)
- **Redis 7+**: Caching and rate limiting (localhost:6379)
- **Node.js 18+**: Runtime
- **pnpm 8+**: Package manager

## Debugging Tips
- Prisma Studio: `pnpm prisma:studio` (opens at http://localhost:5555)
- API docs available at: http://localhost:3003
- Health check: http://localhost:3003/health
- Kill stuck ports: `lsof -ti:3003 | xargs kill`
