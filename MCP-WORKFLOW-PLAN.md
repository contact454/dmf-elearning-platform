# Kế hoạch sử dụng MCP Servers cho DMF E-Learning Platform

## Tổng quan bộ MCP đã cài đặt

| MCP Server | Chức năng chính | Use case trong dự án |
|------------|-----------------|---------------------|
| **figma** | Đọc thiết kế từ Figma | Lấy specs UI/UX, colors, spacing |
| **tavily** | Web search | Research best practices, tài liệu |
| **apify** | Web scraping | Thu thập nội dung học tiếng Đức |
| **browser-use** | Browser automation | Test UI, screenshot |
| **sequential-thinking** | Reasoning phức tạp | Lập kế hoạch, debug logic |
| **memory** | Lưu context dài hạn | Nhớ decisions, preferences |
| **supabase** | Database operations | Query, migrate, backup data |
| **git** | Git operations | Commit, branch, merge |
| **filesystem** | File operations | Read/write code files |

---

## Workflow tổng thể

```
┌─────────────────────────────────────────────────────────────────┐
│                     DEVELOPMENT WORKFLOW                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐     │
│  │  PLAN   │───▶│ DESIGN  │───▶│  BUILD  │───▶│  TEST   │     │
│  └────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘     │
│       │              │              │              │           │
│  sequential    figma-mcp      filesystem      browser-use     │
│  thinking      tavily         supabase        apify           │
│  memory                       git                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Planning & Research

### 1.1 Sử dụng Sequential Thinking
```
Mục đích: Phân tích yêu cầu phức tạp, lập kế hoạch implementation

Ví dụ prompt:
"Sử dụng sequential thinking để phân tích cách implement
hệ thống Spaced Repetition với các yếu tố:
- SM-2 algorithm
- User progress tracking
- Notification scheduling
- Performance optimization"
```

### 1.2 Sử dụng Tavily (Web Search)
```
Mục đích: Research best practices, tài liệu kỹ thuật

Ví dụ prompt:
"Tìm kiếm các nghiên cứu mới nhất về:
- Comprehensible Input theory (i+1)
- Gamification trong language learning
- SM-2 algorithm variations"
```

### 1.3 Sử dụng Memory
```
Mục đích: Lưu trữ decisions, coding conventions, preferences

Ví dụ prompt:
"Lưu vào memory:
- Tech stack: Next.js 14, Prisma, PostgreSQL
- Design system: Indigo/Purple gradient theme
- User: Vietnamese learners studying German"
```

---

## Phase 2: Design Implementation

### 2.1 Sử dụng Figma MCP
```
Mục đích: Đọc design specs từ Figma files

Workflow:
1. Designer upload design lên Figma
2. Lấy Figma file URL
3. Sử dụng figma-mcp để extract:
   - Color palette
   - Typography specs
   - Component dimensions
   - Spacing values
   - Asset exports

Ví dụ prompt:
"Đọc Figma file [URL] và extract:
- Tất cả colors với hex values
- Font sizes và line heights
- Button styles (primary, secondary, ghost)
- Card component specs"
```

### 2.2 Design Token Generation
```
Figma → figma-mcp → Tailwind config → Components

Output mong đợi:
- tailwind.config.ts với custom colors
- Component variants với đúng specs
- Responsive breakpoints
```

---

## Phase 3: Content Collection

### 3.1 Sử dụng Apify (Web Scraping)
```
Mục đích: Thu thập nội dung học tiếng Đức

Nguồn có thể scrape:
- Deutsche Welle (dw.com) - Bài học miễn phí
- Goethe Institut resources
- German news (simplified)
- German Wikipedia (simple.wikipedia.org/wiki/German)

Workflow:
1. Xác định nguồn nội dung
2. Sử dụng Apify actors để crawl
3. Parse và clean data
4. Import vào database qua Supabase MCP

Ví dụ prompt:
"Sử dụng Apify để scrape 50 bài đọc A1-A2 từ
Deutsche Welle Deutsch lernen section.
Extract: title, content, level, topic, vocabulary list"
```

### 3.2 Audio Content
```
Mục đích: Thu thập audio cho Listening module

Nguồn:
- Slow German podcast
- Easy German YouTube transcripts
- DW Langsam gesprochene Nachrichten
```

---

## Phase 4: Database Operations

### 4.1 Sử dụng Supabase MCP
```
Mục đích: Quản lý database trực tiếp từ Claude

Operations:
- Schema migrations
- Data seeding
- Query optimization
- Backup/restore

Ví dụ prompt:
"Sử dụng Supabase MCP để:
1. Tạo table 'user_achievements' với schema:
   - id, user_id, achievement_type, earned_at, metadata
2. Tạo RLS policies cho user access
3. Seed 10 achievement types mẫu"
```

### 4.2 Analytics Queries
```
"Query Supabase để phân tích:
- Top 10 từ vựng khó nhất (lowest success rate)
- User retention rate theo tuần
- Average session duration by level"
```

---

## Phase 5: Development

### 5.1 Sử dụng Filesystem MCP
```
Mục đích: Read/write code files

Operations:
- Create new components
- Modify existing files
- Generate boilerplate
- Update configurations
```

### 5.2 Sử dụng Git MCP
```
Mục đích: Version control operations

Workflow:
1. Create feature branch
2. Make changes
3. Stage và commit
4. Create PR

Ví dụ prompt:
"Sử dụng Git MCP để:
1. Tạo branch 'feature/gamification-system'
2. Sau khi code xong, commit với message có prefix 'feat(gamification)'"
```

---

## Phase 6: Testing & QA

### 6.1 Sử dụng Browser-Use
```
Mục đích: Automated UI testing, screenshot verification

Workflow:
1. Navigate đến page cần test
2. Interact với elements
3. Capture screenshots
4. Verify visual output

Ví dụ prompt:
"Sử dụng browser-use để:
1. Mở http://localhost:3001/learn/hub
2. Click vào card 'Vocabulary'
3. Screenshot kết quả
4. Verify page load thành công"
```

### 6.2 E2E Testing Flow
```
"Test complete user flow:
1. Login → Dashboard
2. Start vocabulary lesson
3. Complete 5 flashcards
4. Check XP updated
5. Verify streak maintained"
```

---

## Practical Workflow Examples

### Example 1: Implement New Feature
```
Step 1 - Plan (sequential-thinking):
"Phân tích cách implement Achievement System với badges,
XP milestones, và notifications"

Step 2 - Research (tavily):
"Tìm best practices cho gamification trong education apps 2024"

Step 3 - Design (figma):
"Đọc Figma design cho Achievement badges và modal"

Step 4 - Database (supabase):
"Tạo tables: achievements, user_achievements, achievement_rules"

Step 5 - Code (filesystem):
"Implement AchievementService.ts và AchievementCard component"

Step 6 - Commit (git):
"Commit changes với message 'feat(achievements): implement badge system'"

Step 7 - Test (browser-use):
"Test flow: complete lesson → earn achievement → show notification"
```

### Example 2: Content Pipeline
```
Step 1 - Scrape (apify):
"Scrape 100 German articles từ DW với levels A1-B2"

Step 2 - Process (sequential-thinking):
"Analyze và categorize content by topic, difficulty"

Step 3 - Store (supabase):
"Insert processed content vào reading_content table"

Step 4 - Verify (browser-use):
"Navigate to /learn/reading và verify content hiển thị đúng"
```

### Example 3: Bug Investigation
```
Step 1 - Remember (memory):
"Recall previous issues related to SRS algorithm"

Step 2 - Analyze (sequential-thinking):
"Debug: tại sao cards không hiện đúng theo schedule"

Step 3 - Query (supabase):
"Select cards where next_review < now() but not showing"

Step 4 - Fix (filesystem):
"Update SRSService.ts query logic"

Step 5 - Test (browser-use):
"Verify cards now appear correctly in review queue"
```

---

## Daily Development Routine

### Morning Setup
```bash
# Claude Desktop với MCP servers
1. Mở Claude Desktop
2. Verify MCP servers connected (🔨 icon)
3. Load project context từ memory
```

### Development Session
```
1. Check git status
2. Review tasks từ memory
3. Implement với filesystem + supabase
4. Test với browser-use
5. Commit với git
```

### End of Day
```
1. Commit pending changes
2. Update memory với progress
3. Note blockers for tomorrow
```

---

## Tips & Best Practices

### 1. Memory Management
```
- Lưu important decisions ngay khi make
- Store coding conventions
- Remember user preferences
- Track feature progress
```

### 2. Efficient Figma Workflow
```
- Request specific components, không toàn bộ file
- Extract design tokens first
- Generate Tailwind config từ colors
```

### 3. Safe Scraping với Apify
```
- Respect robots.txt
- Rate limiting
- Cache results
- Verify data quality
```

### 4. Database Best Practices
```
- Always backup before migrations
- Use transactions for bulk operations
- Test queries trên staging first
```

### 5. Git Hygiene
```
- Feature branches cho mỗi task
- Conventional commits
- Squash trước merge
- Keep commits atomic
```

---

## Monitoring & Logs

### MCP Server Logs
```bash
# View realtime logs
tail -f ~/Library/Logs/Claude/mcp*.log

# Check specific server
grep "supabase" ~/Library/Logs/Claude/mcp*.log
```

### Troubleshooting
```
1. Server không connect → Check API keys
2. Timeout → Reduce request size
3. Auth error → Regenerate tokens
4. Rate limit → Add delays between calls
```

---

## Security Notes

⚠️ **Quan trọng:**
- Không commit API keys vào git
- Rotate keys định kỳ
- Use environment variables
- Limit MCP server permissions

---

## Kết luận

Bộ MCP servers này tạo thành một complete development environment:

| Phase | MCP Servers Used |
|-------|------------------|
| Planning | sequential-thinking, memory, tavily |
| Design | figma, memory |
| Content | apify, tavily, supabase |
| Development | filesystem, supabase, git |
| Testing | browser-use, supabase |
| Deployment | git, supabase |

Sử dụng đúng cách, workflow sẽ:
- Giảm context switching
- Automate repetitive tasks
- Maintain consistency
- Speed up development 2-3x
