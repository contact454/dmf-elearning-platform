# AI RESEARCH TEAM - DMF E-Learning Platform

*Pre-Development Research Team (Đội nghiên cứu tiền phát triển) - Competitive Analysis & Best Practices Mining (Phân tích đối thủ & Khai thác thực hành tốt nhất)*

---

## 🎯 **MISSION (SỨ MỆNH)**

**Objective (Mục tiêu):** Research top market products (sản phẩm hàng đầu thị trường) TRƯỚC KHI phát triển module mới → Extract (trích xuất) best practices → Adapt (điều chỉnh) cho DMF

**Philosophy (Triết lý):** "Học từ người giỏi nhất, sau đó làm tốt hơn" (Learn from the best, then do better)

---

## 👥 **TEAM STRUCTURE (CẤU TRÚC ĐỘI)**

### **5 Specialized Agents (5 Agents chuyên môn):**

```
Research Lead (Trưởng nhóm nghiên cứu)
    │
    ├─── Market Scout (Trinh sát thị trường)
    ├─── UX Analyst (Phân tích UX)
    ├─── Tech Detective (Thám tử công nghệ)
    └─── Strategy Synthesizer (Tổng hợp chiến lược)
```

---

## 📋 **AGENT ROLES (VAI TRÒ CỤ THỂ)**

### **1. Research Lead (Trưởng nhóm nghiên cứu)**
**Model:** Opus 4.5 (strategic thinking - tư duy chiến lược)

**Responsibilities (Trách nhiệm):**
- Receive module request (nhận yêu cầu module) từ user
- Break down (phân rã) research scope (phạm vi nghiên cứu)
- Coordinate (phối hợp) 4 agents bên dưới
- Compile (tổng hợp) final report (báo cáo cuối)
- Make recommendations (đưa ra khuyến nghị) for DMF

**Tools:**
- `sessions_spawn` - tạo worker agents
- `sessions_send` - giao nhiệm vụ
- `write` - tạo final report

**Output:**
- `RESEARCH_REPORT_[module].md` - Comprehensive findings (phát hiện toàn diện)

---

### **2. Market Scout (Trinh sát thị trường)**
**Model:** Sonnet 4 (cost-effective for volume searches - hiệu quả chi phí cho tìm kiếm số lượng lớn)

**Responsibilities:**
- Find top 5-10 competitors (đối thủ hàng đầu) in module category
- Identify (xác định) market leaders (người dẫn đầu thị trường)
- Collect URLs, pricing, features overview
- Rank by popularity/reviews (xếp hạng theo độ phổ biến/đánh giá)

**Tools/Skills:**
- **MCP:** `web-search-duckduckgo.search_and_fetch`
- Search queries: "[module type] top apps", "best [feature] platform", "[category] comparison 2026"

**Output:**
```markdown
## Market Landscape (Bối cảnh thị trường)
1. Duolingo (4.7★, 500M+ users)
   - URL: https://duolingo.com
   - Key feature: Gamified vocabulary
2. Babbel (4.5★, 10M+ users)
   ...
```

---

### **3. UX Analyst (Phân tích UX)**
**Model:** Sonnet 4

**Responsibilities:**
- Analyze UI/UX (phân tích giao diện/trải nghiệm) of top competitors
- Screenshot key screens (chụp màn hình quan trọng)
- Identify UX patterns (mẫu UX): onboarding, navigation, feedback, gamification
- Spot (phát hiện) innovative interactions (tương tác sáng tạo)

**Tools/Skills:**
- **Browser:** `browser` tool (profile:openclaw)
  - `action:open` - mở competitor site
  - `action:screenshot` - chụp UI
  - `action:snapshot` - lấy DOM structure
- **Skill:** `peekaboo` (macOS UI capture - chụp giao diện macOS) nếu có native app

**Workflow:**
```bash
# For each competitor
1. browser action:open targetUrl:[competitor-url]
2. browser action:screenshot fullPage:true
3. browser action:snapshot (get interactive elements - lấy phần tử tương tác)
4. Analyze layout, colors, typography, interactions
5. Document patterns found
```

**Output:**
```markdown
## UX Patterns Found
### Duolingo Vocabulary Module
- **Layout:** Flashcard-based, swipe gestures (cử chỉ vuốt)
- **Feedback:** Immediate animation (hoạt ảnh tức thì) + sound
- **Gamification:** Streak counter (bộ đếm chuỗi), XP points
- **Screenshots:** [attached 3 images]
```

---

### **4. Tech Detective (Thám tử công nghệ)**
**Model:** Sonnet 4

**Responsibilities:**
- Reverse-engineer (kỹ nghệ ngược) technical implementation (triển khai kỹ thuật)
- Inspect (kiểm tra) network requests (yêu cầu mạng), APIs, data structures
- Identify tech stack (công nghệ): frameworks, libraries, databases
- Find performance optimizations (tối ưu hóa hiệu suất)

**Tools/Skills:**
- **Browser:** `browser` tool
  - `action:console` - view console logs (xem nhật ký console)
  - Network tab inspection (kiểm tra tab mạng)
- **Skill:** `mcporter` (if competitor has public MCP - nếu đối thủ có MCP công khai)
- DevTools analysis (phân tích công cụ nhà phát triển)

**Workflow:**
```bash
# For each competitor
1. Open in browser với DevTools
2. Inspect network calls:
   - API endpoints (điểm cuối API)
   - Request/response format (định dạng yêu cầu/phản hồi)
   - Authentication method (phương pháp xác thực)
3. Analyze page source (phân tích mã nguồn trang):
   - JavaScript frameworks (React? Vue? Svelte?)
   - State management (quản lý trạng thái)
   - Data fetching patterns (mẫu lấy dữ liệu)
4. Check performance:
   - Load time (thời gian tải)
   - Bundle size (kích thước gói)
   - Optimization techniques (kỹ thuật tối ưu)
```

**Output:**
```markdown
## Tech Stack Analysis
### Duolingo
- **Frontend:** React 18 + Next.js 14
- **State:** Redux Toolkit
- **API:** REST + GraphQL hybrid
- **Performance:** 
  - Code splitting (phân tách code)
  - Image lazy loading (tải lười ảnh)
  - Service Worker caching (bộ nhớ đệm)
- **Notable patterns (Mẫu đáng chú ý):**
  - Optimistic UI updates (cập nhật UI lạc quan)
  - Offline-first approach (tiếp cận offline trước)
```

---

### **5. Strategy Synthesizer (Tổng hợp chiến lược)**
**Model:** Opus 4.5 (strategic synthesis - tổng hợp chiến lược)

**Responsibilities:**
- Receive findings (nhận phát hiện) from 3 agents above
- Identify patterns (xác định mẫu) across competitors
- Extract actionable insights (rút ra thông tin hữu ích)
- Prioritize (ưu tiên) features by impact/effort (tác động/nỗ lực)
- Create implementation roadmap (tạo lộ trình triển khai) for DMF

**Tools:**
- `read` - đọc reports từ agents khác
- `write` - tạo synthesis document (tài liệu tổng hợp)

**Output:**
```markdown
## Strategic Recommendations for DMF

### Must-Have Features (Tính năng bắt buộc)
1. **Flashcard system với spaced repetition (SRS)**
   - Found in: Duolingo, Anki, Quizlet
   - Implementation: Prisma schema + SM2 algorithm
   - Effort: Medium (2-3 days với Claude Sonnet)
   
2. **Audio pronunciation (phát âm)**
   - Found in: Duolingo, Babbel
   - Implementation: ElevenLabs API integration
   - Effort: Low (1 day)

### Nice-to-Have Features
...

### Avoid (Tránh)
- Auto-play videos (Memrise) → users find annoying (người dùng thấy khó chịu)
- Overly complex gamification (Busuu) → distracts from learning (làm mất tập trung học)

### Tech Stack Validation (Xác nhận công nghệ)
✅ Next.js 14 - Industry standard (chuẩn ngành)
✅ Prisma + PostgreSQL - Scalable (có thể mở rộng)
⚠️ Consider adding (cân nhắc thêm): Redis for caching (để lưu đệm)
```

---

## 🔄 **WORKFLOW (QUY TRÌNH LÀM VIỆC)**

### **Phase 0: Initialization (Khởi tạo)**

```bash
# User triggers research
"Em research vocabulary learning module cho DMF nhé"

# Research Lead spawns 3 workers
→ Market Scout
→ UX Analyst  
→ Tech Detective
```

### **Phase 1: Parallel Research (Nghiên cứu song song) - 15-20 min**

```
Market Scout        UX Analyst         Tech Detective
     ↓                   ↓                   ↓
Search top 10      Open Duolingo      Inspect network
competitors        Screenshot UI      Analyze tech stack
Rank by users      Document UX        Find APIs
     ↓                   ↓                   ↓
Find: Duolingo,    Find: Flashcard    Find: React +
Babbel, Memrise,   swipe, instant     GraphQL, SRS
Busuu, Quizlet     feedback, streaks  algorithm
```

**Duration:** ~15 minutes (parallel execution - thực thi song song)

### **Phase 2: Report to Lead (Báo cáo cho Lead) - 2-3 min**

```bash
# Each agent sends findings via sessions_send
Market Scout → Research Lead: "Top 5 competitors found, URLs attached"
UX Analyst → Research Lead: "3 key UX patterns identified, screenshots saved"
Tech Detective → Research Lead: "Tech stack analyzed, API patterns documented"
```

### **Phase 3: Synthesis (Tổng hợp) - 5-10 min**

```
Strategy Synthesizer (Opus 4.5)
    ↓
Reads all 3 reports
Identifies common patterns (mẫu chung)
Creates priority matrix (ma trận ưu tiên)
Writes implementation plan (kế hoạch triển khai)
    ↓
Delivers to Research Lead
```

### **Phase 4: Final Report (Báo cáo cuối) - 3-5 min**

```
Research Lead (Opus 4.5)
    ↓
Compiles all findings (tổng hợp tất cả phát hiện)
Adds executive summary (tóm tắt điều hành)
Creates RESEARCH_REPORT_vocabulary.md
Notifies user via Telegram
```

**Total Duration:** ~25-38 minutes per module

---

## 📊 **OUTPUT STRUCTURE (CẤU TRÚC KẾT QUẢ)**

### **File: `RESEARCH_REPORT_[module].md`**

```markdown
# Research Report: [Module Name]
*Generated (Được tạo): 2026-02-06 | Team: AI Research Team*

---

## Executive Summary (Tóm tắt điều hành)
- **Market Leaders:** Duolingo, Babbel, Memrise
- **Key Insight:** All use SRS + gamification + audio
- **Recommendation:** Implement flashcards + streak system + TTS
- **Effort Estimate:** 3-5 days với Claude Sonnet

---

## 1. Market Landscape (Market Scout findings)
[Top 10 competitors với URLs, ratings, features]

## 2. UX Patterns (UX Analyst findings)
[Screenshots, interaction patterns, design systems]

## 3. Technical Implementation (Tech Detective findings)
[Tech stacks, APIs, performance optimizations]

## 4. Strategic Synthesis (Strategy Synthesizer)
### Must-Have Features
### Nice-to-Have Features
### Avoid These Mistakes
### Implementation Roadmap

---

## Appendix (Phụ lục)
- Screenshots: [links]
- Competitor URLs: [list]
- API examples: [code snippets]
```

---

## 🛠️ **REQUIRED TOOLS & SKILLS (Công cụ & Kỹ năng cần thiết)**

### **MCP Servers:**
- ✅ **web-search-duckduckgo** - Market research (nghiên cứu thị trường)
- ⚠️ **Browser automation** - Built-in `browser` tool (công cụ tích hợp)
- 🆕 **Firecrawl** (optional - tùy chọn) - Advanced web scraping (crawl web nâng cao)

### **OpenClaw Skills:**
- ✅ **peekaboo** - macOS UI capture (đã có)
- 🆕 **web-crawler** - Custom crawling logic (logic crawl tùy chỉnh) - CẦN TẠO
- 🆕 **competitor-analyzer** - Automated competitor analysis (phân tích tự động) - CẦN TẠO

### **Browser Tool Capabilities:**
```javascript
// Already available (đã có sẵn)
browser action:open profile:openclaw targetUrl:[url]
browser action:screenshot fullPage:true
browser action:snapshot refs:aria
browser action:navigate targetUrl:[url]
```

---

## 💰 **COST ESTIMATE (Ước tính chi phí)**

**Per Module Research (Mỗi module nghiên cứu):**

| Agent | Model | Duration | Cost |
|-------|-------|----------|------|
| Research Lead | Opus 4.5 | 10 min | ~$3-5 |
| Market Scout | Sonnet 4 | 15 min | ~$2-3 |
| UX Analyst | Sonnet 4 | 15 min | ~$2-3 |
| Tech Detective | Sonnet 4 | 15 min | ~$2-3 |
| Strategy Synthesizer | Opus 4.5 | 10 min | ~$3-5 |
| **TOTAL** | Mixed | **~30-40 min** | **~$12-19** |

**For 4 DMF modules (Vocabulary, Reading, Listening, Speaking):**
- Total: ~$48-76
- Time: ~2-3 hours
- **ROI:** Tránh được hàng giờ trial-and-error (thử và sai) + best practices từ đầu

---

## 🚀 **ACTIVATION WORKFLOW (Quy trình kích hoạt)**

### **Option 1: Manual Trigger (Kích hoạt thủ công)**

```bash
# User sends to Fuchs
"Em research [module name] module cho DMF nhé"

# Fuchs spawns Research Lead
sessions_spawn(
  task: "Research [module] best practices from top competitors",
  agentId: "research-lead",
  model: "opus",
  runTimeoutSeconds: 3600
)

# Research Lead spawns 3 workers + coordinates
# Final report delivered to Telegram
```

### **Option 2: Automated Pre-Development Hook (Móc nối tự động trước phát triển)**

**Integrate vào Claude Code workflow:**

```json
// .claude/settings.json
{
  "hooks": {
    "BeforeModuleDevelopment": [{
      "matcher": "new-module-*",
      "hooks": [{
        "type": "research",
        "command": "openclaw gateway wake --text 'Research team needed for [module]'"
      }]
    }]
  }
}
```

---

## 📁 **FILE STRUCTURE (Cấu trúc file)**

```
dmf-elearning-platform/
├── .research/
│   ├── RESEARCH_REPORT_vocabulary.md
│   ├── RESEARCH_REPORT_reading.md
│   ├── RESEARCH_REPORT_listening.md
│   ├── RESEARCH_REPORT_speaking.md
│   ├── screenshots/
│   │   ├── duolingo-flashcard.png
│   │   ├── babbel-onboarding.png
│   │   └── memrise-gamification.png
│   └── competitor-data/
│       ├── duolingo-api-analysis.json
│       └── market-landscape.json
└── .claude/
    └── agents/
        ├── research-lead.md (CẦN TẠO)
        ├── market-scout.md (CẦN TẠO)
        ├── ux-analyst.md (CẦN TẠO)
        ├── tech-detective.md (CẦN TẠO)
        └── strategy-synthesizer.md (CẦN TẠO)
```

---

## ✅ **NEXT STEPS TO IMPLEMENT (Bước tiếp theo để triển khai)**

### **Phase 1: Core Agents (3-5 hours với Fuchs + Opus 4.5)**
1. ✅ Create `.research/` directory structure
2. ✅ Write 5 agent definition files (`.claude/agents/`)
3. ✅ Create report templates (mẫu báo cáo)
4. ✅ Test với 1 module (Vocabulary) để validate workflow

### **Phase 2: Skills Enhancement (2-3 hours)**
1. 🆕 Create `web-crawler` skill (if needed - nếu cần)
2. 🆕 Create `competitor-analyzer` skill
3. ✅ Verify browser tool capabilities (xác minh khả năng công cụ trình duyệt)

### **Phase 3: Integration (1-2 hours)**
1. ✅ Integrate với DMF development workflow
2. ✅ Add cron job (optional - tùy chọn): Weekly competitor monitoring (giám sát đối thủ hàng tuần)
3. ✅ Create dashboard (optional): Track competitive landscape changes (theo dõi thay đổi bối cảnh cạnh tranh)

---

## 🎯 **SUCCESS METRICS (Chỉ số thành công)**

**Per Research Session:**
- ✅ 5-10 competitors identified (đối thủ được xác định)
- ✅ 10+ screenshots collected (ảnh chụp màn hình được thu thập)
- ✅ 3+ UX patterns documented (mẫu UX được ghi chép)
- ✅ Tech stack fully analyzed (công nghệ được phân tích đầy đủ)
- ✅ Implementation roadmap created (lộ trình triển khai được tạo)
- ✅ Report delivered \<40 minutes (báo cáo giao \<40 phút)

**Long-term Impact:**
- 📈 Faster development (phát triển nhanh hơn) - best practices từ đầu
- 🎨 Better UX - học từ market leaders
- 🏆 Competitive advantage (lợi thế cạnh tranh) - biết đối thủ làm gì
- 💰 Cost savings (tiết kiệm chi phí) - tránh reinventing the wheel (tái phát minh bánh xe)

---

## 🔥 **COMPETITIVE ADVANTAGES (Lợi thế cạnh tranh)**

**What makes this team special (Điều gì làm team này đặc biệt):**

1. **Parallel Execution (Thực thi song song):** 3 agents work simultaneously (đồng thời) → 3x faster than sequential (tuần tự)
2. **Multi-Modal Analysis (Phân tích đa phương thức):** Market + UX + Tech combined (kết hợp)
3. **Automated Best Practices Mining (Khai thác tự động):** No manual research needed (không cần nghiên cứu thủ công)
4. **Actionable Output (Kết quả hữu ích):** Not just data (không chỉ dữ liệu), but implementation roadmap (mà lộ trình triển khai)
5. **Cost-Effective (Hiệu quả chi phí):** ~$15/module vs. days of manual work (so với ngày làm việc thủ công)

---

**Created by (Được tạo bởi):** Fuchs 🦊  
**Model:** Opus 4.5  
**Status:** Concept design complete (Thiết kế ý tưởng hoàn thành) - Ready for implementation (Sẵn sàng triển khai)

---

## 💬 **ANH CÓ MUỐN EM:**

**Option A:** Triển khai ngay 5 agent files + test với Vocabulary module?  
**Option B:** Bổ sung thêm gì vào concept này trước?  
**Option C:** Tạo luôn automation script để user chỉ cần 1 lệnh kích hoạt?

Anh chọn option nào ạ? 🦊✨
