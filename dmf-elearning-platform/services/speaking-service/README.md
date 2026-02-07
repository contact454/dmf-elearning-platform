# Speaking Service - DMF E-Learning Platform

## 🎤 Overview

The Speaking Service provides comprehensive API for German language speaking practice, including:
- **Speech-to-Text (STT)** using OpenAI Whisper
- **AI-powered pronunciation analysis**
- **Fluency and grammar feedback**
- **Progress tracking and analytics**
- **CEFR-aligned speaking prompts** (A1-C2)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Deployment](#-deployment)

---

## ✨ Features

### Core Functionality
- ✅ **User Authentication** - JWT-based auth with bcrypt password hashing
- ✅ **Speaking Prompts** - CEFR-aligned prompts with difficulty levels
- ✅ **Audio Transcription** - OpenAI Whisper for accurate German STT
- ✅ **AI Speech Analysis** - GPT-4 powered feedback on:
  - Pronunciation (0-100 score)
  - Fluency & coherence
  - Vocabulary range
  - Grammar accuracy
- ✅ **Pronunciation Feedback** - Word-level analysis with IPA notation
- ✅ **Progress Analytics** - Track improvements over time
- ✅ **Rate Limiting** - Protect expensive AI operations
- ✅ **Security** - Helmet, CORS, input validation (Zod)

### Database Models
- `User` - Authentication and profile
- `SpeakingPrompt` - Practice prompts by CEFR level
- `SpeakingSubmission` - User recordings with analysis
- `PronunciationFeedback` - Detailed pronunciation data

---

## 🛠 Tech Stack

- **Runtime:** Node.js 20+
- **Framework:** Express.js + TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT (jsonwebtoken) + bcrypt
- **AI Services:** OpenAI (Whisper STT + GPT-4)
- **File Upload:** Multer
- **Validation:** Zod
- **Testing:** Vitest
- **Security:** Helmet, express-rate-limit, CORS

---

## 📦 Prerequisites

- Node.js 20.x or higher
- PostgreSQL 14+
- OpenAI API key (for Whisper and GPT-4)
- npm or yarn

---

## 🚀 Installation

### 1. Clone and Install Dependencies

```bash
cd services/speaking-service
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dmf_speaking?schema=public"

# JWT Secret (minimum 32 characters)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-minimum-32-characters"

# OpenAI API
OPENAI_API_KEY="sk-your-openai-api-key-here"
OPENAI_MODEL="gpt-4o-mini"

# Server
NODE_ENV="development"
PORT=3002

# CORS
CORS_ORIGINS="http://localhost:5173,https://dmf-elearning.vercel.app"

# File Upload
MAX_FILE_SIZE_MB=10
UPLOAD_DIR="uploads/audio"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ANALYSIS_RATE_LIMIT_MAX=10
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed prompts (A1-B2 levels)
npm run seed:prompts
```

### 4. Verify Setup

```bash
npm run verify
```

This checks:
- ✅ Environment variables
- ✅ Database connection
- ✅ Directory structure
- ✅ TypeScript compilation

### 5. Start Development Server

```bash
npm run dev
```

Server runs on `http://localhost:3002`

---

## 🔧 Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ | - | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | - | JWT signing secret (min 32 chars) |
| `OPENAI_API_KEY` | ✅ | - | OpenAI API key for Whisper + GPT |
| `OPENAI_MODEL` | ❌ | `gpt-4o-mini` | GPT model for analysis |
| `PORT` | ❌ | `3002` | Server port |
| `NODE_ENV` | ❌ | `development` | Environment mode |
| `CORS_ORIGINS` | ❌ | See `.env.example` | Allowed CORS origins |
| `MAX_FILE_SIZE_MB` | ❌ | `10` | Max audio file size (MB) |
| `UPLOAD_DIR` | ❌ | `uploads/audio` | Audio upload directory |
| `RATE_LIMIT_WINDOW_MS` | ❌ | `900000` | Rate limit window (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | ❌ | `100` | Max requests per window |
| `ANALYSIS_RATE_LIMIT_MAX` | ❌ | `10` | Max AI analysis per window |

---

## 📚 API Documentation

### Base URL
```
http://localhost:3002/api
```

### Authentication

All endpoints except `/auth/*` and `/prompts/*` require JWT authentication:

```
Authorization: Bearer <your-jwt-token>
```

---

### 🔐 Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "tier": "free"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "tier": "free"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 📝 Speaking Prompts

#### List Prompts
```http
GET /api/prompts?page=1&limit=10&cefr=A1&topic=daily_conversation
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `cefr` (optional): Filter by level (A1, A2, B1, B2, C1, C2)
- `topic` (optional): Filter by topic

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "cefrLevel": "A1",
      "topic": "daily_conversation",
      "title": "Introduce Yourself",
      "description": "Tell us about yourself",
      "questionText": "Please introduce yourself...",
      "preparationTimeSeconds": 30,
      "speakingTimeSeconds": 60,
      "difficultyLevel": 1,
      "evaluationCriteria": { ... }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

#### Get Random Prompt
```http
GET /api/prompts/random?cefr=A1
```

**Response (200):**
```json
{
  "id": "uuid",
  "cefrLevel": "A1",
  "title": "Introduce Yourself",
  ...
}
```

#### Get Single Prompt
```http
GET /api/prompts/:id
```

---

### 🎙 Speaking Submissions

#### Create Submission
```http
POST /api/submissions
Authorization: Bearer <token>
Content-Type: application/json

{
  "promptId": "uuid",
  "audioUrl": "https://example.com/audio.mp3",
  "durationSeconds": 45.5
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "promptId": "uuid",
  "audioUrl": "https://example.com/audio.mp3",
  "durationSeconds": 45.5,
  "status": "pending",
  "submittedAt": "2026-02-07T06:00:00Z",
  "prompt": {
    "title": "Introduce Yourself",
    "cefrLevel": "A1",
    "questionText": "..."
  }
}
```

#### List User Submissions
```http
GET /api/submissions?page=1&limit=10&status=analyzed
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status (pending, analyzing, analyzed, reviewed)

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "submittedAt": "2026-02-07T06:00:00Z",
      "overallScore": 75.5,
      "status": "analyzed",
      "prompt": {
        "title": "Introduce Yourself",
        "cefrLevel": "A1",
        "topic": "daily_conversation"
      }
    }
  ],
  "pagination": { ... }
}
```

#### Get Submission Details
```http
GET /api/submissions/:id
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "transcriptText": "Mein Name ist John...",
  "overallScore": 75.5,
  "pronunciationScore": 80,
  "fluencyScore": 70,
  "vocabularyScore": 75,
  "grammarScore": 77,
  "aiFeedback": {
    "strengths": ["Clear pronunciation", "Good vocabulary range"],
    "weaknesses": ["Some grammar errors"],
    "suggestions": ["Practice past tense forms"],
    "detailedFeedback": "Overall good performance..."
  },
  "pronunciationFeedback": [
    {
      "word": "spreche",
      "expectedPronunciation": "ˈʃpʁɛçə",
      "accuracyScore": 85,
      "feedbackText": "Good pronunciation"
    }
  ],
  "status": "analyzed",
  ...
}
```

#### Delete Submission
```http
DELETE /api/submissions/:id
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Submission deleted successfully"
}
```

---

### 🤖 AI Speech Analysis

#### Transcribe Audio (STT)
```http
POST /api/analyze/transcript
Authorization: Bearer <token>
Content-Type: multipart/form-data

audio: <audio-file.mp3>
```

**Rate Limit:** 10 requests per 15 minutes

**Response (200):**
```json
{
  "text": "Mein Name ist John. Ich komme aus Deutschland...",
  "confidence": 0.95,
  "duration": 45.3,
  "language": "de"
}
```

#### Analyze Speech (Full Analysis)
```http
POST /api/analyze/speech
Authorization: Bearer <token>
Content-Type: application/json

{
  "submissionId": "uuid"
}
```

**Rate Limit:** 10 requests per 15 minutes

**Response (200):**
```json
{
  "id": "uuid",
  "transcriptText": "Mein Name ist John...",
  "overallScore": 75.5,
  "pronunciationScore": 80,
  "fluencyScore": 70,
  "vocabularyScore": 75,
  "grammarScore": 77,
  "aiFeedback": {
    "strengths": [...],
    "weaknesses": [...],
    "suggestions": [...],
    "detailedFeedback": "..."
  },
  "status": "analyzed"
}
```

**Note:** Submission must have `transcriptText` set first (via `/analyze/transcript`)

---

### 📊 Analytics

#### Get User Progress
```http
GET /api/analytics/progress
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "overview": {
    "totalSubmissions": 25,
    "analyzedSubmissions": 20,
    "pendingSubmissions": 5,
    "totalPracticeTimeSeconds": 1800
  },
  "averageScores": {
    "overall": 75.5,
    "pronunciation": 78,
    "fluency": 72,
    "vocabulary": 76,
    "grammar": 76
  },
  "cefrDistribution": {
    "A1": 10,
    "A2": 8,
    "B1": 7
  },
  "recentSubmissions": [...],
  "scoreTrends": [
    {
      "date": "2026-02-01T00:00:00Z",
      "overallScore": 70,
      "pronunciationScore": 75,
      ...
    }
  ]
}
```

#### Get Pronunciation Weaknesses
```http
GET /api/analytics/weaknesses?limit=20
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "word": "spreche",
    "expectedPronunciation": "ˈʃpʁɛçə",
    "accuracyScore": 65,
    "feedbackText": "Practice the 'ch' sound"
  },
  ...
]
```

---

### 🏥 Health Check

```http
GET /health
```

**Response (200):**
```json
{
  "status": "ok",
  "service": "speaking-service",
  "timestamp": "2026-02-07T06:00:00Z",
  "uptime": 12345.67,
  "environment": "development"
}
```

---

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Test Files
- `src/services/__tests__/authService.test.ts` - Authentication tests
- `src/services/__tests__/submissionService.test.ts` - Submission CRUD tests

**Test Coverage:** Targets 80%+ coverage

---

## 🏗 Build & Deployment

### Build for Production
```bash
npm run build
```

Outputs compiled JavaScript to `dist/`

### Start Production Server
```bash
npm start
```

### Environment-Specific Notes

**Development:**
- Hot reload with nodemon
- Detailed error messages
- Source maps enabled

**Production:**
- Set `NODE_ENV=production`
- Use strong `JWT_SECRET` (32+ characters)
- Configure proper CORS origins
- Use environment variables (not `.env` file)
- Set up reverse proxy (nginx)
- Enable HTTPS
- Monitor OpenAI API usage (costs money!)

---

## 📁 Project Structure

```
speaking-service/
├── src/
│   ├── database/
│   │   └── connection.ts          # Prisma client
│   ├── middleware/
│   │   ├── authMiddleware.ts      # JWT verification
│   │   ├── errorHandler.ts        # Global error handler
│   │   └── rateLimiter.ts         # Rate limiting configs
│   ├── routes/
│   │   ├── auth.ts                # Authentication endpoints
│   │   ├── prompts.ts             # Prompt management
│   │   ├── submissions.ts         # Submission CRUD
│   │   ├── analyze.ts             # Speech analysis
│   │   └── analytics.ts           # Progress tracking
│   ├── services/
│   │   ├── authService.ts         # Auth logic
│   │   ├── speechAnalysisService.ts # OpenAI integration
│   │   ├── submissionService.ts   # Submission logic
│   │   ├── analyticsService.ts    # Analytics logic
│   │   └── __tests__/             # Unit tests
│   ├── types/
│   │   └── index.ts               # TypeScript types
│   └── server.ts                  # Express app entry point
├── scripts/
│   ├── seed-prompts.ts            # Seed speaking prompts
│   └── verify-setup.ts            # Setup verification
├── prisma/
│   └── schema.prisma              # Database schema
├── uploads/                       # Audio file uploads
├── .env.example                   # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔒 Security Considerations

- ✅ **Password Hashing:** bcrypt with salt rounds
- ✅ **JWT Tokens:** 7-day expiry, secure secret
- ✅ **Rate Limiting:** Protect expensive AI operations
- ✅ **Input Validation:** Zod schemas on all endpoints
- ✅ **Ownership Checks:** Users can only access their data
- ✅ **CORS:** Whitelist trusted origins
- ✅ **Helmet:** Security headers
- ✅ **File Upload Limits:** Max 10MB, audio files only

**Production Checklist:**
- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Enable HTTPS
- [ ] Rotate API keys regularly
- [ ] Monitor OpenAI costs
- [ ] Set up logging (Winston, Sentry)
- [ ] Database backups
- [ ] Rate limit per user (not just IP)

---

## 🤝 Contributing

1. Follow existing code style (TypeScript strict mode)
2. Write tests for new features
3. Update this README
4. Ensure `npm run verify` passes

---

## 📄 License

ISC - DMF E-Learning Platform

---

## 🆘 Troubleshooting

### Database Connection Fails
```bash
# Check PostgreSQL is running
pg_isready

# Verify DATABASE_URL in .env
# Run migrations
npm run prisma:migrate
```

### TypeScript Compilation Errors
```bash
# Regenerate Prisma client
npm run prisma:generate

# Clear and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### OpenAI API Errors
- Verify `OPENAI_API_KEY` is valid
- Check API quota/billing
- Reduce request rate if hitting limits

### Rate Limit Issues
- Increase limits in `.env`:
  ```
  ANALYSIS_RATE_LIMIT_MAX=20
  ```

---

## 📞 Support

For issues or questions:
- Check existing GitHub issues
- Review this README
- Contact: DMF Development Team

---

**Built with ❤️ for German language learners**
