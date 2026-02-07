# TEST ENVIRONMENT CONFIGURATION

**Date:** 2026-02-06
**Test Lead:** Test Lead Agent (Subagent)

## Server Configuration

- **API Server URL:** http://localhost:3003
- **Learning Service Port:** 3003
- **Database:** PostgreSQL (test mode)

## Test User

- **User ID:** cm64test0001user
- **Email:** test@dmf.test
- **Current Streak:** 5 days
- **Longest Streak:** 10 days
- **Words in Progress:** 5 (all due today)

## API Endpoints

```bash
# Review Queue
GET http://localhost:3003/api/review/queue
Header: x-user-id: cm64test0001user

# Submit Review
POST http://localhost:3003/api/review/submit
Header: x-user-id: cm64test0001user
Body: {"wordId": "...", "quality": 0-5}

# Progress Stats
GET http://localhost:3003/api/review/stats
Header: x-user-id: cm64test0001user

# Streak Data
GET http://localhost:3003/api/user/streak
Header: x-user-id: cm64test0001user
```

## Testers Assigned

| Tester | Session ID | Status |
|--------|------------|--------|
| Integration Tester | crisp-seaslug | Running |
| E2E Tester | good-breeze | Running |
| Performance Tester | mellow-crustacean | Running |
| Security Tester | cool-otter | Running |

## Expected Outputs

1. `.testing/integration-results-vocabulary.md`
2. `.testing/e2e-results-vocabulary.md`
3. `.testing/performance-results-vocabulary.md`
4. `.testing/security-results-vocabulary.md`
