# Quick Test Guide - Security Fixes

## 🚀 Quick Start Testing

### 1. Start the Server
```bash
cd /Users/huynhngocphuc/Dev-Workspace/Active-Projects/05-DMF-Elearning/dmf-elearning-platform/apps/web-learner
npm run dev
```

### 2. Test Unauthenticated (Should Return 401)
```bash
# Test 1: GET /exercises without auth
curl -i http://localhost:3000/api/listening/exercises

# Test 2: POST /submit without auth
curl -i -X POST \
  -H "Content-Type: application/json" \
  -d '{"exerciseId":"test","userAnswer":"test"}' \
  http://localhost:3000/api/listening/submit

# Test 3: GET /metadata without auth
curl -i http://localhost:3000/api/listening/metadata

# Test 4: GET /audio without auth
curl -i http://localhost:3000/api/listening/audio/test-id
```

**Expected Result:** All return `401 Unauthorized` with error message:
```json
{
  "success": false,
  "error": "Unauthorized - Valid JWT token required"
}
```

### 3. Get Valid JWT Token

**Option A: From Browser DevTools**
1. Open http://localhost:3000 in browser
2. Login to your account
3. Open DevTools (F12) → Network tab
4. Make any API request
5. Find the request → Headers → Request Headers
6. Copy the value of `Authorization: Bearer <token>`
7. Extract just the `<token>` part (without "Bearer ")

**Option B: From Supabase Dashboard**
1. Go to Supabase project
2. Authentication → Users
3. Click on a user
4. Copy the JWT token

### 4. Test Authenticated (Should Return 200)
```bash
# Replace YOUR_TOKEN_HERE with actual token
TOKEN="YOUR_TOKEN_HERE"

# Test 1: GET /exercises with auth
curl -i -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/listening/exercises

# Test 2: POST /submit with auth
curl -i -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"exerciseId":"existing-exercise-id","userAnswer":"test answer"}' \
  http://localhost:3000/api/listening/submit

# Test 3: GET /metadata with auth
curl -i -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/listening/metadata

# Test 4: GET /audio with auth
curl -i -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/listening/audio/existing-audio-id
```

**Expected Result:** HTTP 200 with data

### 5. Test Account Impersonation Prevention
```bash
# Try to submit answer with userId in body (should be IGNORED)
curl -i -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "attacker-user-id-12345",
    "exerciseId": "test-exercise",
    "userAnswer": "hacked answer"
  }' \
  http://localhost:3000/api/listening/submit
```

**Expected Result:**
- Request succeeds (200)
- BUT userId from body is IGNORED
- Progress saved for authenticated user (from JWT) only
- Check database: progress entry should have userId from JWT token, NOT "attacker-user-id-12345"

---

## ✅ Pass Criteria

All tests pass if:
- ✅ Unauthenticated requests return 401
- ✅ Invalid tokens return 401
- ✅ Valid tokens return 200 (or 404 if resource not found)
- ✅ userId in request body is ignored
- ✅ Progress saved for JWT userId only

---

## 🐛 Common Issues

**Issue 1: "Cannot find module '@/middleware/auth'"**
- Solution: Restart dev server (npm run dev)
- TypeScript needs to recompile

**Issue 2: Token expires quickly**
- Solution: Get a fresh token from login
- Supabase tokens expire after 1 hour by default

**Issue 3: 404 for all routes**
- Solution: Check server is running on correct port
- Verify URL: http://localhost:3000/api/listening/...

**Issue 4: CORS errors in browser**
- Solution: Test with curl first
- Browser CORS handled separately

---

## 📊 Expected Test Results

| Test | Endpoint | Auth | Expected HTTP | Expected Response |
|------|----------|------|---------------|-------------------|
| 1 | GET /exercises | No | 401 | Unauthorized error |
| 2 | POST /submit | No | 401 | Unauthorized error |
| 3 | GET /metadata | No | 401 | Unauthorized error |
| 4 | GET /audio/[id] | No | 401 | Unauthorized error |
| 5 | GET /exercises | Yes | 200 | Exercise data |
| 6 | POST /submit | Yes | 200/404 | Success or not found |
| 7 | GET /metadata | Yes | 200 | Metadata + user stats |
| 8 | GET /audio/[id] | Yes | 200/404 | Audio URL or not found |
| 9 | POST /submit (with userId in body) | Yes | 200/404 | userId IGNORED |

---

## 🔍 Verify userId Extraction

To verify userId is extracted from JWT token (not body):

1. **Check logs:** Look for userId in server logs
2. **Check database:** Query `listeningProgress` table after submit
   ```sql
   SELECT * FROM "listeningProgress" 
   ORDER BY "lastAttemptAt" DESC 
   LIMIT 5;
   ```
3. **Verify:** userId should match JWT token user, NOT body userId

---

## 📞 Report Results

After testing, update:
- `.testing/RESULTS_security_listening.md` (re-run security tests)
- `.testing/CERTIFICATION_listening.md` (update certification status)

Report to main agent with:
- Test results (pass/fail for each endpoint)
- Any issues encountered
- Production readiness assessment
