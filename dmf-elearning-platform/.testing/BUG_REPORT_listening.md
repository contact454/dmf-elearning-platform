# Bug Report - DMF Listening Module E2E Testing

**Report Date:** 2026-02-06 19:40 GMT+7  
**Reporter:** E2E Tester (Subagent)  
**Test Phase:** E2E Testing Phase 1  
**Total Bugs Found:** 2 (both CRITICAL)

---

## 🐛 BUG-001: Backend Microservices Fail to Start (Port Conflicts)

**Severity:** 🔴 CRITICAL  
**Priority:** P0  
**Status:** NEW  
**Component:** Infrastructure / DevOps  
**Affects Version:** Development Build  
**Environment:** macOS arm64, Node.js v22.22.0, pnpm

### Description
Multiple backend microservices fail to start due to EADDRINUSE (address already in use) errors. This prevents the listening module backend API from being accessible to the frontend application.

### Reproduction Steps
1. Navigate to project root: `/Users/huynhngocphuc/Dev-Workspace/Active-Projects/05-DMF-Elearning/dmf-elearning-platform`
2. Run `pnpm dev`
3. Observe console output for service startup errors

### Expected Behavior
All backend microservices should start successfully on their assigned ports:
- Practice Service → Port 3001
- Onboarding Service → Port 3002
- Curriculum Service → Port 3003
- Progress Service → Port 3004
- Motivation Service → Port 3005
- Assessment Service → Port 3006
- Read Service → Port 3007
- Ops Admin Service → Port 3010
- Evidence Service → Port 3011
- Ops Service → Port 3012

### Actual Behavior
Services fail to start with error messages:
```
[ops] Error: listen EADDRINUSE: address already in use 0.0.0.0:3012
[practice] Error: listen EADDRINUSE: address already in use 0.0.0.0:3001
[assessment] Error: listen EADDRINUSE: address already in use 0.0.0.0:3006
[progress] Error: listen EADDRINUSE: address already in use 0.0.0.0:3004
[read] Error: listen EADDRINUSE: address already in use 0.0.0.0:3007
[motivation] Error: listen EADDRINUSE: address already in use 0.0.0.0:3005
[onboarding] Error: listen EADDRINUSE: address already in use 0.0.0.0:3002
[ops-admin] Error: listen EADDRINUSE: address already in use 0.0.0.0:3010
[evidence] Error: listen EADDRINUSE: address already in use 0.0.0.0:3011
```

### Impact
- **User Impact:** BLOCKING - Users cannot access listening module features
- **Testing Impact:** BLOCKING - E2E tests cannot execute (0/16 tests completed)
- **Development Impact:** HIGH - Backend development/testing blocked

### Root Cause (Suspected)
- Multiple instances of `pnpm dev` running simultaneously
- Previous dev server instances not properly terminated
- Port cleanup not performed between restarts

### Suggested Fix
1. Kill all existing Node.js/pnpm processes:
   ```bash
   pkill -f "pnpm dev"
   pkill -f "next dev"
   pkill -f "node"
   ```

2. Add cleanup script to package.json:
   ```json
   {
     "scripts": {
       "clean": "pkill -f 'pnpm dev' || true",
       "dev:fresh": "npm run clean && pnpm dev"
     }
   }
   ```

3. Consider using different port ranges or implementing port conflict detection

### Additional Notes
Only the Curriculum Service (Port 3003) started successfully, indicating the issue affects most backend services.

---

## 🐛 BUG-002: Listening Practice Page Shows Empty/Error State

**Severity:** 🔴 CRITICAL  
**Priority:** P0  
**Status:** NEW  
**Component:** Frontend / web-learner app  
**Affects Version:** Development Build  
**Environment:** Chrome browser, localhost:3000

### Description
The listening practice page (http://localhost:3000/listening/practice) loads but displays an error state or empty page with no content. The audio player, exercise controls, and UI components are not visible.

### Reproduction Steps
1. Start the web-learner frontend app (should be running on port 3000)
2. Open browser and navigate to http://localhost:3000
3. Observe homepage loads but shows minimal content
4. Navigate to http://localhost:3000/listening/practice
5. Observe page shows error or empty state

### Expected Behavior
The listening practice page should display:
- Audio player component with Play/Pause/Replay controls
- Exercise type selection or current exercise display
- Exercise content (dictation text input, multiple choice options, etc.)
- Progress indicators
- Submit button and feedback area

### Actual Behavior
- Homepage loads but appears mostly empty
- Listening practice page shows error state or blank page
- No audio player visible
- No exercise UI elements visible
- Cannot interact with the page

### Screenshots
1. Homepage: browser/4f549e7d-abaf-4121-8095-a1689497d696.jpg
2. Listening practice page: browser/1039eb5f-66d0-4f5e-a13e-7d2c8ce63ac7.jpg

### Impact
- **User Impact:** BLOCKING - Users cannot access listening exercises
- **Testing Impact:** BLOCKING - Cannot execute any E2E tests
- **Business Impact:** HIGH - Core feature unavailable

### Root Cause (Suspected)
1. Backend API endpoints not responding (see BUG-001)
2. Frontend-backend integration issue
3. Missing environment variables or configuration
4. Database not properly seeded with listening exercises
5. Authentication/authorization blocking content

### Suggested Fix
**Investigate in this order:**

1. **Verify backend API endpoints:**
   ```bash
   curl http://localhost:3001/api/listening/exercises
   curl http://localhost:3004/api/listening/stats
   ```

2. **Check browser console for errors:**
   - Open DevTools
   - Check Console tab for JavaScript errors
   - Check Network tab for failed API requests

3. **Verify database seeding:**
   ```sql
   SELECT COUNT(*) FROM listening_exercises;
   -- Should return 70
   ```

4. **Check frontend API integration:**
   - Review API endpoint configuration in web-learner app
   - Verify correct ports are being used
   - Check environment variables (.env.local)

5. **Test authentication:**
   - Verify if authentication is required
   - Check if mock user session is active
   - Review auth middleware logs

### Additional Notes
This bug is likely a **cascade effect** of BUG-001. Once backend services start properly, this issue may resolve automatically. However, if the issue persists after fixing BUG-001, it indicates a separate frontend integration problem.

### Dependencies
- **Blocked by:** BUG-001 (Backend services not running)
- **Blocks:** All E2E tests (TC-E2E-001 through TC-E2E-016)

---

## 📊 BUG SUMMARY

| Category | Count |
|----------|-------|
| **Total Bugs** | 2 |
| **Critical (P0)** | 2 |
| **High (P1)** | 0 |
| **Medium (P2)** | 0 |
| **Low (P3)** | 0 |

### Bugs by Component
- Infrastructure/DevOps: 1
- Frontend/web-learner: 1
- Backend API: 0 (pending - cannot test due to BUG-001)
- Database: 0 (pending - cannot test)
- Audio Player: 0 (pending - cannot test)

### Bugs by Type
- Configuration/Environment: 1 (BUG-001)
- Integration: 1 (BUG-002)
- Functional: 0 (pending)
- Performance: 0 (pending)
- Security: 0 (pending)

---

## 🎯 RESOLUTION PRIORITY

### Immediate (Fix Today)
1. **BUG-001** - Fix backend service port conflicts
   - **Owner:** DevOps/Backend Team
   - **Estimated Time:** 30 min
   - **Status:** BLOCKING all other work

### After BUG-001 Resolution
2. **BUG-002** - Investigate and fix listening practice page
   - **Owner:** Frontend Team
   - **Estimated Time:** 1-2 hours
   - **Status:** Cannot start until BUG-001 fixed
   - **May auto-resolve** if issue is purely backend connectivity

---

## 🚨 IMPACT ASSESSMENT

### Testing Impact
- **E2E Testing:** BLOCKED (0% complete)
- **Integration Testing:** BLOCKED (cannot test API endpoints)
- **Performance Testing:** BLOCKED (no running services to test)
- **Security Testing:** BLOCKED (no endpoints to test)

### Overall Project Impact
- **Phase 1 Completion:** AT RISK
- **Production Readiness:** NOT READY
- **Certification Status:** CANNOT CERTIFY

**Estimated Delay:** 2-4 hours (assuming quick resolution of both bugs)

---

## 📝 RECOMMENDATIONS

1. **DO NOT PROCEED TO PRODUCTION** - Critical infrastructure issues must be resolved first

2. **PRIORITIZE BUG-001** - All other issues may be cascade effects

3. **IMPLEMENT HEALTH CHECKS** - Add service health monitoring to detect port conflicts early

4. **ADD SMOKE TESTS** - Automated checks before running full E2E test suite

5. **IMPROVE DEV WORKFLOW** - Better process management and cleanup scripts

6. **DOCUMENTATION** - Update README with troubleshooting guide for common issues

---

**Report Generated By:** E2E Tester (Subagent)  
**Session ID:** agent:main:subagent:3012efbb-91bf-4e5c-b9e8-0e1856f49e40  
**Next Steps:** Fix BUG-001 → Re-test → Update bug status → Resume E2E testing
