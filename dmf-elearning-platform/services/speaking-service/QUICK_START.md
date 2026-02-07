# 🚀 Quick Start Guide - Speaking Service

## Prerequisites
- Node.js 20+
- PostgreSQL 14+
- OpenAI API key

## Setup (5 minutes)

### 1. Install Dependencies
```bash
cd services/speaking-service
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and set:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dmf_speaking?schema=public"
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters-change-this"
OPENAI_API_KEY="sk-your-openai-api-key-here"
```

### 3. Database Setup
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed prompts (A1-B2)
npm run seed:prompts
```

### 4. Verify Setup
```bash
npm run verify
```

### 5. Start Server
```bash
npm run dev
```

Server runs on: `http://localhost:3002`

---

## Test the API

### Register User
```bash
curl -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "name": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

Save the `token` from response.

### Get Random Prompt
```bash
curl http://localhost:3002/api/prompts/random?cefr=A1
```

### Health Check
```bash
curl http://localhost:3002/health
```

---

## Run Tests
```bash
npm test
```

---

## Project Structure
```
speaking-service/
├── src/
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   ├── middleware/      # Auth, errors, rate limiting
│   ├── types/           # TypeScript types
│   ├── database/        # Prisma connection
│   └── server.ts        # Express app
├── scripts/             # Seed & verify scripts
├── prisma/              # Database schema
└── README.md            # Full documentation
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm test` | Run tests |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run migrations |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run seed:prompts` | Seed speaking prompts |
| `npm run verify` | Verify setup |

---

## API Endpoints (14 total)

### Authentication (Public)
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login

### Prompts (Public)
- `GET /api/prompts` - List (paginated, filtered)
- `GET /api/prompts/random?cefr=A1` - Random prompt
- `GET /api/prompts/:id` - Single prompt

### Submissions (Authenticated)
- `POST /api/submissions` - Create
- `GET /api/submissions` - List user's
- `GET /api/submissions/:id` - Get details
- `DELETE /api/submissions/:id` - Delete

### Analysis (Authenticated, Rate Limited)
- `POST /api/analyze/transcript` - STT (Whisper)
- `POST /api/analyze/speech` - Full analysis

### Analytics (Authenticated)
- `GET /api/analytics/progress` - Progress stats
- `GET /api/analytics/weaknesses` - Pronunciation issues

### Health
- `GET /health` - Health check

---

## Common Issues

### Database connection fails
```bash
# Check PostgreSQL is running
pg_isready

# Verify DATABASE_URL in .env
```

### TypeScript errors
```bash
npm run prisma:generate
rm -rf dist node_modules
npm install
```

### OpenAI API errors
- Check `OPENAI_API_KEY` is valid
- Verify billing is active

---

## Next Steps

1. ✅ Backend running → Integrate with frontend
2. ✅ Tests passing → Deploy to staging
3. ✅ Documentation complete → Share with team

---

**Full documentation:** See `README.md`  
**Completion report:** See `BACKEND_COMPLETION_speaking.md`
