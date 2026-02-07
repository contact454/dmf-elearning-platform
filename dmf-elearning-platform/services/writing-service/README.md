# Writing Service

**DMF E-Learning Platform - Writing Module API**

Backend service providing German grammar correction, essay management, and progress analytics.

## Features

- ✅ **Authentication** - JWT-based user registration/login
- ✅ **Grammar Checking** - LanguageTool API integration with Redis caching
- ✅ **Essay Management** - Full CRUD operations for user essays
- ✅ **Prompts** - CEFR-leveled writing prompts with tips
- ✅ **Analytics** - Progress tracking and error analytics

## Tech Stack

- **Framework:** Express.js + TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Cache:** Redis
- **Auth:** JWT + bcrypt
- **Grammar:** LanguageTool API
- **Validation:** Zod

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your database credentials
nano .env

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed writing prompts (optional)
npm run seed:prompts
```

### Development

```bash
# Start development server (with hot reload)
npm run dev

# Server runs on http://localhost:3001
# Health check: http://localhost:3001/health
```

### Build & Production

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (returns JWT)

### Grammar Checking

- `POST /api/grammar/check` - Check text for grammar errors (requires auth)

### Essays

- `POST /api/essays` - Create new essay (requires auth)
- `GET /api/essays` - List user's essays (requires auth)
- `GET /api/essays/:id` - Get essay with errors (requires auth)
- `PUT /api/essays/:id` - Update essay (requires auth)
- `DELETE /api/essays/:id` - Delete essay (requires auth)

### Prompts

- `GET /api/prompts` - List prompts (no auth required)
- `GET /api/prompts?level=B1` - Filter by CEFR level
- `GET /api/prompts/:id` - Get single prompt

### Analytics

- `GET /api/analytics/:userId` - Get user statistics (requires auth)
- `GET /api/analytics/:userId?period=week` - Filter by time period (week/month/all)

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/dmf_writing` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | Secret key for JWT signing (min 32 chars) | `your-super-secret-key...` |
| `LANGUAGETOOL_API_URL` | LanguageTool API endpoint | `https://api.languagetool.org/v2/check` |
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment mode | `development` or `production` |

## API Rate Limits

- **Grammar Check:** 60 requests/minute per user
- **Cache TTL:** 24 hours for grammar results

## Database Schema

See `prisma/schema.prisma` for full schema definition.

Key tables:
- `users` - User accounts
- `prompts` - Writing prompts
- `essays` - User essays
- `grammar_errors` - Grammar errors linked to essays

## Performance

- Grammar check caching (60-80% hit rate target)
- Database query optimization with indexes
- Response time targets:
  - Auth endpoints: <200ms
  - Essay CRUD: <300ms
  - Grammar check: <1000ms (with cache)
  - Analytics: <500ms

## Architecture

```
Client → API Gateway → Writing Service
                       ├── PostgreSQL (essays, users)
                       ├── Redis (grammar cache)
                       └── LanguageTool API (grammar)
```

## Deployment

- **Recommended:** Railway, Render, or Fly.io
- **Requirements:** 512MB RAM minimum
- **Database:** Railway PostgreSQL or Supabase
- **Cache:** Railway Redis or Upstash

## Contributing

1. Create feature branch
2. Write tests for new features
3. Ensure `npm test` passes
4. Submit pull request

## License

ISC

## Support

For issues, contact the DMF team or open a GitHub issue.
