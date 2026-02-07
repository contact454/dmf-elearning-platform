# EXECUTION TEAM - DMF E-Learning Development

*Đội Thực Thi Chuyên Môn cho DMF E-learning Platform*

---

## 🎯 **MISSION (SỨ MỆNH)**

Biến research findings (phát hiện nghiên cứu) và strategic plans (kế hoạch chiến lược) thành working code (code hoạt động).

**Input (Đầu vào):**
- Research reports (báo cáo nghiên cứu) từ AI Research Team
- Action plans (kế hoạch hành động) với feature priorities (ưu tiên tính năng)
- Rules (luật) từ `.claude/rules/`

**Output (Đầu ra):**
- Working features (tính năng hoạt động) in production (sản xuất)
- Tested code (code đã test) với >80% coverage (độ phủ)
- Documentation (tài liệu) updated

---

## 👥 **TEAM STRUCTURE (CẤU TRÚC ĐỘI)**

```
Project Manager (Quản Lý Dự Án)
    │
    ├─── Tech Lead (Trưởng Nhóm Kỹ Thuật)
    │    │
    │    ├─ Backend Developer (existing - đã có)
    │    ├─ Frontend Developer (existing)
    │    └─ Database Specialist (new - mới)
    │
    └─── QA Tester (existing)
```

### **Roles & Responsibilities (Vai Trò & Trách Nhiệm):**

**1. Project Manager (PM)**
- Đọc research reports + rules
- Lên execution plan (kế hoạch thực thi)
- Phân rã thành mini tasks (nhiệm vụ nhỏ)
- Track progress (theo dõi tiến độ)
- Report to user (báo cáo cho user)

**2. Tech Lead**
- Review PM's plan
- Phân công tasks cho developers
- Code review (xem xét code)
- Architecture decisions (quyết định kiến trúc)
- Resolve blockers (giải quyết chướng ngại)

**3. Backend Developer** (existing)
- APIs, database, business logic (logic nghiệp vụ)

**4. Frontend Developer** (existing)
- UI components, user interactions (tương tác người dùng)

**5. Database Specialist** (NEW)
- Schema design (thiết kế sơ đồ)
- Migrations (di chuyển)
- Query optimization (tối ưu truy vấn)

**6. QA Tester** (existing)
- Test coverage (độ phủ kiểm thử)
- Bug discovery (phát hiện lỗi)
- Quality gates (cổng chất lượng)

---

## 🔄 **WORKFLOW (QUY TRÌNH LÀM VIỆC)**

### **Phase 1: Planning (Lập Kế Hoạch) - PM Lead**

**Input:**
- Research report: `.research/RESEARCH_REPORT_vocabulary.md`
- Action plan: `DMF_VOCABULARY_ACTION_PLAN.md`
- Rules: `.claude/rules/*.md`

**PM Actions:**
1. Read all inputs (đọc tất cả đầu vào)
2. Break down into mini tasks (phân rá thành mini tasks)
3. Estimate effort (ước tính nỗ lực) (hours, not days)
4. Assign owner (phân công chủ sở hữu) for each task
5. Create execution timeline (tạo timeline thực thi)

**Output:** 
- File: `.execution/EXECUTION_PLAN_[feature].md`
- Contains: Mini tasks, owners, dependencies (phụ thuộc), timeline

---

### **Phase 2: Task Breakdown (Phân Rã Task) - Tech Lead**

**Input:** PM's execution plan

**Tech Lead Actions:**
1. Review technical feasibility (xem xét khả thi kỹ thuật)
2. Add technical details (thêm chi tiết kỹ thuật):
   - File paths (đường dẫn file)
   - Function signatures (chữ ký hàm)
   - Dependencies between tasks (phụ thuộc giữa tasks)
3. Identify risks (xác định rủi ro)
4. Create task tickets (tạo phiếu task)

**Output:**
- File: `.execution/TASKS_[feature].md`
- Format: Checklist với technical specs (đặc tả kỹ thuật)

---

### **Phase 3: Development (Phát Triển) - Developers**

**Parallel Execution (Thực thi song song):**

```
Backend Dev          Frontend Dev         DB Specialist
     ↓                    ↓                     ↓
API endpoints       React components      Schema migrations
Business logic      UI interactions       Query optimization
     ↓                    ↓                     ↓
Unit tests          Component tests       Migration tests
     ↓                    ↓                     ↓
     └────────────────────┴─────────────────────┘
                          ↓
                     Integration
                     (Tích hợp)
```

**Each Developer:**
1. Pick task from `.execution/TASKS_[feature].md`
2. Follow rules in `.claude/rules/[domain].md`
3. Implement feature (triển khai tính năng)
4. Write tests (viết tests)
5. Mark task complete (đánh dấu hoàn thành)

---

### **Phase 4: QA & Integration (Đảm Bảo Chất Lượng & Tích Hợp)**

**QA Tester Actions:**
1. Test each completed task
2. Find edge cases (trường hợp biên)
3. Report bugs (báo cáo lỗi) back to developers
4. Verify fixes (xác minh sửa)
5. Approve (chấp thuận) when passing (khi pass)

**Tech Lead Actions:**
1. Integrate all pieces (tích hợp tất cả mảnh)
2. End-to-end testing (kiểm thử đầu-cuối)
3. Performance check (kiểm tra hiệu suất)
4. Code review (xem xét code)

---

### **Phase 5: Delivery (Giao Hàng) - PM**

**PM Actions:**
1. Verify all tasks complete (xác minh tất cả tasks hoàn thành)
2. Update documentation (cập nhật tài liệu)
3. Prepare demo (chuẩn bị demo)
4. Report to user (báo cáo cho user)

**Deliverables (Sản phẩm giao):**
- Working feature (tính năng hoạt động) (localhost or deployed)
- Test coverage report (báo cáo độ phủ test)
- Documentation (tài liệu) updated
- Completion summary (tóm tắt hoàn thành)

---

## 📋 **TASK BREAKDOWN TEMPLATE (MẪU PHÂN RÁ TASK)**

### **Feature: SRS Algorithm (Thuật toán Lặp Lại Cách Quãng)**

**Epic (Sử thi):** Implement spaced repetition for vocabulary learning

**Mini Tasks:**

#### **T1: Database Schema (Sơ đồ Database)**
- **Owner:** Database Specialist
- **Effort:** 2 hours
- **Dependencies:** None
- **Files:**
  - `prisma/schema.prisma`
  - `prisma/migrations/[timestamp]_add_srs_fields.sql`
- **Checklist:**
  - [ ] Add UserVocabularyProgress model (Thêm model)
  - [ ] Add fields: nextReviewDate, interval, easeFactor, repetitions
  - [ ] Add indexes: [userId, nextReviewDate]
  - [ ] Generate migration (Tạo migration)
  - [ ] Test migration (Test migration) on dev database
- **Acceptance Criteria (Tiêu chí chấp nhận):**
  - Migration runs without errors (chạy không lỗi)
  - Indexes created (Indexes được tạo)
  - Can insert/query UserVocabularyProgress records

---

#### **T2: SRS Algorithm Logic (Logic Thuật Toán SRS)**
- **Owner:** Backend Developer
- **Effort:** 4 hours
- **Dependencies:** T1 (schema must exist)
- **Files:**
  - `services/learning-service/src/algorithms/srs.ts`
  - `services/learning-service/src/algorithms/srs.test.ts`
- **Checklist:**
  - [ ] Implement SM-2 algorithm (Triển khai thuật toán)
  - [ ] Function: calculateNextReview(schedule, quality)
  - [ ] Handle edge cases (Xử lý trường hợp biên): first review (ôn đầu tiên), forgotten (quên)
  - [ ] Write unit tests (Viết unit tests) (>90% coverage)
  - [ ] Test with sample data (Test với dữ liệu mẫu)
- **Acceptance Criteria:**
  - All tests pass (Tất cả tests pass)
  - Correctly schedules (Lên lịch đúng) reviews based on quality rating
  - Handles quality 0-5 inputs

---

#### **T3: Review API Endpoints (Điểm Cuối API Ôn Tập)**
- **Owner:** Backend Developer
- **Effort:** 3 hours
- **Dependencies:** T2 (algorithm must work)
- **Files:**
  - `services/learning-service/src/api/vocabulary/review.ts`
  - `services/learning-service/src/api/vocabulary/review.test.ts`
- **Checklist:**
  - [ ] POST /api/vocabulary/review endpoint
    - Input: vocabularyId, quality (0-5)
    - Output: nextReview date, success message
  - [ ] GET /api/vocabulary/due endpoint
    - Input: userId (from auth)
    - Output: cards due today (array)
  - [ ] Add validation (Thêm validation) with Zod
  - [ ] Write integration tests (Viết integration tests)
- **Acceptance Criteria:**
  - APIs return correct data (APIs trả dữ liệu đúng)
  - Validation catches (Validation bắt) invalid inputs
  - Tests cover happy path + error cases (Tests phủ đường đi vui + trường hợp lỗi)

---

#### **T4: Flashcard UI Component (Component Giao Diện Thẻ)**
- **Owner:** Frontend Developer
- **Effort:** 4 hours
- **Dependencies:** T3 (APIs must exist)
- **Files:**
  - `apps/web-learner/src/components/VocabularyFlashcard.tsx`
  - `apps/web-learner/src/components/VocabularyFlashcard.test.tsx`
- **Checklist:**
  - [ ] Create Flashcard component (Tạo component)
  - [ ] Add flip animation (Thêm hoạt ảnh lật) (Framer Motion)
  - [ ] Audio playback button (Nút phát âm thanh)
  - [ ] Rating buttons (Nút đánh giá): Again/Hard/Good/Easy
  - [ ] Connect to API (Kết nối API) (React Query)
  - [ ] Write component tests (Viết component tests)
- **Acceptance Criteria:**
  - Card flips smoothly (Thẻ lật mượt mà) (animation works)
  - Audio plays (Âm thanh phát) when button clicked
  - Rating submits (Đánh giá gửi) to API successfully
  - Component tests pass (Component tests pass)

---

#### **T5: Review Page (Trang Ôn Tập)**
- **Owner:** Frontend Developer
- **Effort:** 3 hours
- **Dependencies:** T4 (component must work)
- **Files:**
  - `apps/web-learner/src/app/(authenticated)/vocabulary/review/page.tsx`
- **Checklist:**
  - [ ] Create /vocabulary/review route
  - [ ] Fetch due cards (Lấy cards đến hạn) from API
  - [ ] Show one card at a time (Hiển thị một thẻ một lúc)
  - [ ] Progress indicator (Chỉ báo tiến độ): 5/20 cards
  - [ ] Completion screen (Màn hình hoàn thành) when done (khi xong)
- **Acceptance Criteria:**
  - Page loads (Trang tải) cards from API
  - Users can review (Users có thể ôn) all due cards
  - Progress updates (Tiến độ cập nhật) after each card
  - Completion message (Thông báo hoàn thành) shows stats (thống kê)

---

#### **T6: QA Testing (Kiểm Thử QA)**
- **Owner:** QA Tester
- **Effort:** 2 hours
- **Dependencies:** T1-T5 complete
- **Checklist:**
  - [ ] Test happy path (Test đường đi vui): Complete full review session
  - [ ] Test edge cases (Test trường hợp biên):
    - [ ] No cards due (Không có thẻ đến hạn)
    - [ ] All cards forgotten (quality 0)
    - [ ] All cards easy (quality 5)
  - [ ] Test error handling (Test xử lý lỗi):
    - [ ] API timeout (hết thời gian)
    - [ ] Invalid vocabulary ID
  - [ ] Cross-browser testing (Test đa trình duyệt): Chrome, Safari, Firefox
  - [ ] Mobile responsive (Tương thích mobile) check
- **Acceptance Criteria:**
  - No critical bugs (Không lỗi nghiêm trọng)
  - All edge cases handled (Tất cả trường hợp biên được xử lý)
  - Works on mobile (Hoạt động trên mobile)

---

**Total Effort for SRS Feature:** 18 hours (~2.5 days)

---

## 📊 **PROGRESS TRACKING (THEO DÕI TIẾN ĐỘ)**

### **Daily Standups (Họp Hàng Ngày):**

**Format (Định dạng):**
```markdown
## Daily Standup - [Date]

### Backend Dev:
- **Yesterday (Hôm qua):** Completed T2 (SRS algorithm)
- **Today (Hôm nay):** Working on T3 (API endpoints)
- **Blockers (Chướng ngại):** None

### Frontend Dev:
- **Yesterday:** Started T4 (Flashcard component)
- **Today:** Finishing T4, starting T5
- **Blockers:** Waiting for API to be deployed

### QA:
- **Yesterday:** Tested T1 (database migration)
- **Today:** Waiting for T4-T5 to test
- **Blockers:** None

### PM:
- **Progress (Tiến độ):** 3/6 tasks complete (50%)
- **On track (Đúng tiến độ):** Yes
- **ETA:** Friday EOD (cuối ngày thứ Sáu)
```

---

## 🚨 **ESCALATION PROTOCOL (QUY TRÌNH LÊN THANG)**

### **When to Escalate to Tech Lead:**
- Task blocked >4 hours (Task bị chặn >4 giờ)
- Technical uncertainty (Không chắc kỹ thuật)
- Architecture decision needed (Cần quyết định kiến trúc)

### **When to Escalate to PM:**
- Timeline at risk (Timeline có rủi ro)
- Scope creep (Phạm vi lan tỏa) (requirements change - yêu cầu thay đổi)
- Resource conflict (Xung đột tài nguyên)

### **When to Escalate to User:**
- Critical blocker (Chướng ngại nghiêm trọng) (>1 day delay - trễ >1 ngày)
- Major requirement clarification (Làm rõ yêu cầu lớn) needed
- Budget overrun (Vượt ngân sách) risk

---

## 📁 **FILE STRUCTURE (CẤU TRÚC FILE)**

```
dmf-elearning-platform/
├── .execution/                    # Execution team workspace (Không gian làm việc)
│   ├── EXECUTION_PLAN_vocabulary.md      # PM's master plan
│   ├── TASKS_vocabulary.md               # Task breakdown (Phân rã task)
│   ├── DAILY_STANDUP_YYYY-MM-DD.md      # Daily progress (Tiến độ hàng ngày)
│   ├── COMPLETION_REPORT_vocabulary.md   # Final summary (Tóm tắt cuối)
│   └── workflows/
│       ├── WORKFLOW_RESEARCH_TO_CODE.md  # Documentation (Tài liệu)
│       └── WORKFLOW_FEATURE_DELIVERY.md
├── .research/                     # Research team output (Đầu ra nhóm nghiên cứu)
│   └── RESEARCH_REPORT_vocabulary.md
├── .claude/
│   ├── agents/
│   │   ├── project-manager.md (NEW)
│   │   ├── tech-lead.md (NEW)
│   │   ├── database-specialist.md (NEW)
│   │   ├── backend-developer.md (existing)
│   │   ├── frontend-developer.md (existing)
│   │   └── qa-tester.md (existing)
│   └── rules/
│       └── [all existing rules]
└── [DMF codebase]
```

---

## ✅ **SUCCESS CRITERIA (TIÊU CHÍ THÀNH CÔNG)**

**For Each Feature (Cho mỗi tính năng):**

1. ✅ **Code Quality (Chất lượng code):**
   - Follows rules (Tuân theo luật) in `.claude/rules/`
   - >80% test coverage (độ phủ test)
   - No linting errors (Không lỗi linting)
   - Code reviewed (Code được xem xét) by Tech Lead

2. ✅ **Functionality (Chức năng):**
   - Meets acceptance criteria (Đáp ứng tiêu chí chấp nhận)
   - Works on dev environment (Hoạt động trên môi trường dev)
   - QA approved (QA chấp thuận)

3. ✅ **Documentation (Tài liệu):**
   - Code comments (Bình luận code) (Vietnamese for technical terms - tiếng Việt cho thuật ngữ kỹ thuật)
   - API docs (Tài liệu API) updated
   - README updated (README cập nhật) if needed

4. ✅ **Performance (Hiệu suất):**
   - API response <500ms
   - UI loads <3s
   - No memory leaks (Không rò rỉ bộ nhớ)

---

## 🎯 **ACTIVATION COMMAND (LỆNH KÍCH HOẠT)**

### **How to Start Execution (Cách Bắt Đầu Thực Thi):**

**User says (User nói):**
```
"Em execute feature [feature name] theo research findings nhé"
```

**Example (Ví dụ):**
```
"Em execute feature SRS Algorithm theo research findings nhé"
```

**Fuchs workflow (Quy trình Fuchs):**
1. Spawn Project Manager agent
2. PM reads:
   - `.research/RESEARCH_REPORT_vocabulary.md`
   - `DMF_VOCABULARY_ACTION_PLAN.md`
   - `.claude/rules/*.md`
3. PM creates execution plan (tạo kế hoạch thực thi)
4. PM spawns Tech Lead
5. Tech Lead breaks down tasks (phân rã tasks)
6. Tech Lead spawns developers (Backend, Frontend, DB Specialist)
7. Developers execute in parallel (thực thi song song)
8. QA tests when ready (test khi sẵn sàng)
9. PM reports completion (báo cáo hoàn thành) to user

**Duration (Thời gian):** ~1-3 days per feature (depending on complexity - tùy độ phức tạp)

---

## 📝 **REPORTING FORMAT (ĐỊNH DẠNG BÁO CÁO)**

### **Completion Report (Báo Cáo Hoàn Thành):**

```markdown
# ✅ FEATURE COMPLETE: [Feature Name]

**Date (Ngày):** YYYY-MM-DD  
**Duration (Thời gian):** X hours/days  
**Team (Đội):** PM, Tech Lead, Backend, Frontend, DB, QA

---

## Deliverables (Sản phẩm giao):

### Code (Mã):
- ✅ `path/to/file1.ts` - Description (Mô tả)
- ✅ `path/to/file2.tsx` - Description
- ✅ X files changed, Y insertions, Z deletions

### Tests (Tests):
- ✅ Unit tests: X passing (pass)
- ✅ Integration tests: Y passing
- ✅ Coverage: Z% (target >80%)

### Documentation (Tài liệu):
- ✅ API docs updated (Tài liệu API cập nhật)
- ✅ README updated (README cập nhật)
- ✅ Code comments (Bình luận code) added (Vietnamese translations - dịch tiếng Việt)

---

## Metrics (Chỉ số):

- **Lines of Code (Dòng code):** XXX
- **Test Coverage (Độ phủ test):** XX%
- **API Response Time (Thời gian phản hồi API):** XXXms
- **Bundle Size Impact (Tác động kích thước gói):** +XXkB

---

## Demo (Thử nghiệm):

**How to test (Cách test):**
1. Start dev server: `pnpm dev`
2. Navigate to: `/vocabulary/review`
3. Expected behavior (Hành vi mong đợi): ...

**Screenshots (Ảnh chụp màn hình):**
- [Link to screenshots]

---

## Next Steps (Bước tiếp theo):

- [ ] Deploy to staging (Triển khai lên staging)
- [ ] User acceptance testing (Kiểm thử chấp nhận người dùng)
- [ ] Production deployment (Triển khai sản xuất)

---

**Completed by (Hoàn thành bởi):** Execution Team  
**Status (Trạng thái):** ✅ READY FOR DEPLOYMENT (Sẵn sàng triển khai)
```

---

**Created by (Được tạo bởi):** Fuchs 🦊  
**Date:** 2026-02-06  
**Purpose (Mục đích):** Bridge research to production code (Cầu nối nghiên cứu đến code sản xuất)  
**Next:** Create agent definition files (Tạo files định nghĩa agent)

