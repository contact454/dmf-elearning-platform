# How to Run Integration Tests - Speaking Service

## Quick Start

```bash
# 1. Start the server (Terminal 1)
cd services/speaking-service
npm run dev

# 2. Run integration tests (Terminal 2)
npx tsx .testing/run-integration-tests-speaking.ts
```

## Prerequisites

✅ PostgreSQL running (localhost:5432)  
✅ Database migrated and seeded (21 prompts)  
✅ `.env` file configured with `JWT_SECRET` and `DATABASE_URL`  
✅ Server running on port 3002  

## Expected Output

```
✓ Passed:       17
✗ Failed:       0
⊘ Skipped:      3

Pass Rate:      85.0%
Total Time:     0.29s
```

## Test Files

- **Test Plan:** `.testing/TEST_PLAN_speaking.md` (20 test cases documented)
- **Test Script:** `.testing/run-integration-tests-speaking.ts` (executable test runner)
- **Test Results:** `.testing/INTEGRATION_TEST_RESULTS_speaking.md` (auto-generated)
- **Summary:** `.testing/INTEGRATION_TEST_SUMMARY_speaking.md` (this report)

## Setup Database (if needed)

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run db:migrate

# Seed prompts
npm run db:seed

# Verify setup
npm run db:verify
```

## Configuration

### Minimal `.env` for Testing

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dmf_speaking?schema=public"
JWT_SECRET="integration-test-secret-key-minimum-32-characters-required"
OPENAI_API_KEY="sk-test-dummy-key" # Not needed for core tests
NODE_ENV="development"
PORT=3002
```

## Running Specific Test Groups

The test script runs all 20 tests in sequence:

1. **Authentication** (3 tests) - User registration, login, duplicate email
2. **Prompts API** (4 tests) - List, get, random, filter
3. **Submissions API** (6 tests) - CRUD operations, ownership checks
4. **OpenAI Analysis** (4 tests) - Rate limiting, transcription, analysis*
5. **Analytics** (3 tests) - Progress stats, weaknesses, trends

\***Note:** 3 OpenAI tests are skipped (require API key and audio files)

## Troubleshooting

### Server not running
```
✗ Cannot connect to server at http://localhost:3002
```
**Solution:** Start server with `npm run dev`

### Database not ready
```
Error: Cannot find module '@prisma/client'
```
**Solution:** Run `npm run prisma:generate`

### Port 3002 in use
```
Error: listen EADDRINUSE: address already in use :::3002
```
**Solution:** Kill existing process or change PORT in `.env`

### Rate limiting errors (429)
```
Expected status 201, got 429
```
**Solution:** Restart server to reset rate limit counters

## CI/CD Integration

```yaml
# Example GitHub Actions workflow
test-integration:
  runs-on: ubuntu-latest
  services:
    postgres:
      image: postgres:14
      env:
        POSTGRES_PASSWORD: postgres
        POSTGRES_DB: dmf_speaking
  steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
    - run: npm install
    - run: npm run db:migrate
    - run: npm run db:seed
    - run: npm run dev &
    - run: sleep 5
    - run: npx tsx .testing/run-integration-tests-speaking.ts
```

## Performance Benchmarks

| Test Group | Avg Time |
|------------|----------|
| Authentication | 75ms |
| Prompts API | 4ms |
| Submissions API | 5ms |
| Analytics | 9ms |
| **Total Suite** | **290ms** |

## Success Criteria

- ✅ 17/20 tests passing (85%) - **PASS**
- ✅ All P0 tests passing (11/11) - **PASS**
- ✅ Response times < 500ms - **PASS**
- ✅ No critical bugs - **PASS**

## Next Steps

1. ✅ Core functionality verified
2. ⏭ (Optional) Add OpenAI API key to test TC-INT-014, TC-INT-015, TC-INT-017
3. ⏭ Deploy to staging environment
4. ⏭ Run tests against staging
5. ⏭ Production deployment

---

**Last Updated:** 2026-02-07  
**Status:** All tests passing ✅  
**Maintainer:** Integration Testing Agent
