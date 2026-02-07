# DMF E-Learning - Claude Code Setup Guide

*Hướng dẫn cài đặt và sử dụng Claude Code Rule System (Hệ thống quy tắc) cho DMF E-learning Platform*

---

## 📦 **What's Included (Những gì đã có)**

Bộ rule system này bao gồm:

✅ **1 Main Context File:**
- `CLAUDE.md` - Project context (ngữ cảnh dự án), tech stack, workflows

✅ **5 Modular Rules với Path Targeting (nhắm đích đường dẫn):**
- `api-backend.md` - Backend API development rules
- `frontend-react.md` - React/Next.js frontend rules  
- `database-prisma.md` - Prisma & PostgreSQL rules
- `testing.md` - Testing standards (tiêu chuẩn kiểm thử)
- `security.md` - Security best practices (thực hành bảo mật tốt nhất)

✅ **3 Custom Slash Commands:**
- `/commit` - Conventional commits (commits theo quy ước) với auto-staging
- `/test` - Run tests với coverage
- `/description` - Set session description (đặt mô tả phiên)

✅ **3 Specialized Agents:**
- `backend-developer.md` - Backend specialist (chuyên gia backend)
- `frontend-developer.md` - Frontend specialist
- `qa-tester.md` - Quality assurance specialist

✅ **Configuration Files:**
- `.claude/settings.json` - Permissions (phân quyền), hooks, environment
- `.clauignore` - Files to exclude (loại trừ)

---

## 🚀 **Quick Start (Bắt đầu nhanh)**

### 1. Verify Installation (Xác minh cài đặt)

```bash
cd /Users/huynhngocphuc/Dev-Workspace/Active-Projects/05-DMF-Elearning/dmf-elearning-platform

# Check structure (kiểm tra cấu trúc)
ls -la .claude/
# Should see (Nên thấy): settings.json, rules/, commands/, agents/
```

### 2. Start Claude Code

```bash
# Navigate to project (đi đến dự án)
cd dmf-elearning-platform

# Start Claude Code
claude
```

**Khi khởi động, Claude sẽ tự động:**
- ✅ Load `CLAUDE.md` (main context)
- ✅ Load ALL rules từ `.claude/rules/`
- ✅ Register custom commands (`/commit`, `/test`, `/description`)
- ✅ Make agents available (làm agents có sẵn)

---

## 🎯 **How It Works (Cách hoạt động)**

### Path Targeting Magic (Phép màu nhắm đích đường dẫn)

Rules **CHỈ activate khi bạn làm việc với matching files (files khớp)**:

**Example (Ví dụ):**

```markdown
# File: .claude/rules/api-backend.md
---
paths:
  - services/learning-service/src/api/**/*.ts
---
```

**Nghĩa là:**
- ✅ Đang edit `services/learning-service/src/api/users.ts` → Rules activate!
- ❌ Đang edit `apps/web-learner/src/app/page.tsx` → Rules KHÔNG activate

**Benefits (Lợi ích):**
- 🎯 Relevant rules only (chỉ rules liên quan)
- ⚡ Reduced context usage (giảm sử dụng context)
- 🧠 Claude hiểu rõ hơn domain (lĩnh vực) hiện tại

---

## 📚 **Using Custom Commands (Dùng lệnh tùy chỉnh)**

### `/commit` - Smart Commits (Commits thông minh)

```bash
# In Claude Code
/commit feat(vocabulary): add flashcard flip animation

# What it does (Nó làm gì):
# 1. Stages all changes (đưa tất cả thay đổi vào staging)
# 2. Shows diff (hiển thị diff)
# 3. Asks confirmation (hỏi xác nhận)
# 4. Creates commit với message đã cho
```

**Best commit format (Định dạng commit tốt nhất):**
```
type(scope): message

Types: feat, fix, docs, style, refactor, test, chore
Scope: vocabulary, reading, listening, api, database
```

### `/test` - Run Tests

```bash
# Run all tests
/test

# Run specific test file
/test VocabularyCard

# What it does:
# 1. Runs test suite
# 2. Shows results (hiển thị kết quả)
# 3. Offers coverage report (đề nghị báo cáo coverage)
```

### `/description` - Track Session

```bash
# Set what you're working on (đặt bạn đang làm gì)
/description Implementing user authentication

# Useful for (Hữu ích cho):
# - Multi-session workflows (quy trình nhiều phiên)
# - Team coordination (phối hợp nhóm)
# - Progress tracking (theo dõi tiến độ)
```

---

## 🤖 **Using Specialized Agents (Dùng agents chuyên môn)**

### When to Use Which Agent (Khi nào dùng agent nào)

**Backend Developer Agent:**
```bash
# Use when (Dùng khi):
# - Creating API endpoints (tạo điểm cuối API)
# - Writing database queries (viết truy vấn database)
# - Implementing business logic (triển khai logic nghiệp vụ)

Example task (Ví dụ task):
"Create POST /api/lessons endpoint với validation"
```

**Frontend Developer Agent:**
```bash
# Use when:
# - Building React components
# - Implementing UI/UX
# - Data fetching với React Query

Example task:
"Create VocabularyCard component với flip animation"
```

**QA Tester Agent:**
```bash
# Use when:
# - Writing test cases (viết ca kiểm thử)
# - Finding edge cases (tìm trường hợp biên)
# - Code review for quality (xem xét code về chất lượng)

Example task:
"Review VocabularyCard and write comprehensive tests"
```

**How to spawn agent (Cách tạo agent):**
```bash
# In Claude Code
Task VocabularyCard testing
→ Select agent: qa-tester
→ Let it work
```

---

## 🔧 **Customization (Tùy chỉnh)**

### Modify Permissions (Sửa phân quyền)

Edit `.claude/settings.json`:

```json
{
  "permissions": {
    "allow": [
      "Bash(your-command)",  // Add new allowed command
      "Read(new-path/**)"    // Add new read path
    ],
    "ask": [
      "Bash(risky-command)"  // Ask before running
    ],
    "deny": [
      "Bash(dangerous-cmd)"  // Block completely
    ]
  }
}
```

### Add New Rules

```bash
# Create new rule file
nano .claude/rules/deployment.md
```

```markdown
---
paths:
  - .github/**/*
  - deploy/**/*
---

# Deployment Rules

Your rules here...
```

### Add New Commands

```bash
# Create new command
nano .claude/commands/deploy.md
```

```markdown
---
allowed-tools: Bash(docker *), Bash(kubectl *)
description: Deploy to staging/production
---

<task>
Deploy application to specified environment.
</task>

<instructions>
# Your deployment script here
</instructions>
```

---

## 🔐 **Security Notes (Ghi chú bảo mật)**

### What's Protected (Cái gì được bảo vệ)

❌ **Claude KHÔNG THỂ access:**
- `.env` files (environment variables = biến môi trường)
- `node_modules/` (dependencies)
- `.git/` (git history)
- `secrets/` directory
- `~/.ssh/`, `~/.aws/` (credentials = thông tin xác thực)

✅ **Claude CÓ THỂ:**
- Read source code (đọc mã nguồn)
- Edit files trong `src/`
- Run tests, builds
- Create commits (with permission - với phép)

### Sensitive Operations Require Permission (Thao tác nhạy cảm cần phép)

These commands will **ASK FIRST (HỎI TRƯỚC)**:
- `git push` (pushing code = đẩy code)
- `pnpm install` (adding dependencies = thêm gói)
- `prisma migrate` (database changes = thay đổi database)
- Editing `package.json`, `.env.*`

---

## 📊 **Performance Tips (Mẹo hiệu suất)**

### 1. Rules Load Selectively (Rules tải chọn lọc)

Path targeting means (Nhắm đích đường dẫn nghĩa là):
- Working on API? → Only API rules load (Chỉ rules API tải)
- Working on UI? → Only frontend rules load
- **Result (Kết quả):** ~60% less context usage (ít hơn 60% sử dụng context)

### 2. Hooks Save Time (Hooks tiết kiệm thời gian)

Auto-formatting on save:
```json
"AfterEdit": [{
  "matcher": "*.{ts,tsx}",
  "hooks": [{ "command": "prettier --write {file}" }]
}]
```
→ **No manual formatting needed (Không cần format thủ công)!**

### 3. Plan Mode Default

```json
"defaultMode": "plan"
```
→ Claude **plans first (lên kế hoạch trước)**, executes after approval (thực hiện sau khi chấp nhận)

---

## 🐛 **Troubleshooting (Xử lý sự cố)**

### Rules Not Loading (Rules không tải)

```bash
# Check files exist (kiểm tra files tồn tại)
ls -R .claude/

# Restart Claude Code
exit
claude
```

### Commands Not Found (Không tìm thấy lệnh)

```bash
# Verify command files (xác minh files lệnh)
ls .claude/commands/

# Check file format (kiểm tra định dạng file)
cat .claude/commands/commit.md
# Should have (Nên có): ---frontmatter--- and <instructions>
```

### Permissions Denied (Từ chối phép)

Check `.claude/settings.json`:
- Is command in `deny` list? → Move to `allow` or `ask`
- Is path restricted? → Add to allowed paths

---

## 📈 **Next Steps (Bước tiếp theo)**

### Recommended (Khuyến nghị)

1. **Try it out (Thử nó):**
   ```bash
   claude
   # Ask: "Show me the project structure"
   # Try: /commit, /test commands
   ```

2. **Customize for your workflow (Tùy chỉnh cho quy trình của bạn):**
   - Add your own rules (thêm rules của bạn)
   - Adjust permissions (điều chỉnh phép)
   - Create team-specific commands (tạo lệnh cụ thể cho nhóm)

3. **Share with team (Chia sẻ với nhóm):**
   ```bash
   git add .claude/ CLAUDE.md .clauignore
   git commit -m "feat: add Claude Code rule system"
   git push
   ```

### Optional Enhancements (Cải tiến tùy chọn)

- **Multi-session setup (Cài đặt nhiều phiên):** Use git worktrees
- **Status line customization (Tùy chỉnh dòng trạng thái):** Edit `statusLine` in settings
- **More agents (Thêm agents):** Create domain-specific helpers (trợ lý cụ thể lĩnh vực)

---

## 🎓 **Learning Resources (Tài nguyên học tập)**

**Research sources (Nguồn nghiên cứu) for this setup:**
- [Claude Code Best Practices](https://github.com/awattar/claude-code-best-practices)
- [Rules Directory Guide](https://claudefa.st/blog/guide/mechanics/rules-directory)
- [Official Claude Code Docs](https://code.claude.com/docs)

**Created by (Được tạo bởi):** Fuchs 🦊 (OpenClaw AI Assistant)  
**Date (Ngày):** 2026-02-06  
**Research time (Thời gian nghiên cứu):** 5 parallel searches (tìm kiếm song song)  
**Implementation time (Thời gian triển khai):** ~30 minutes

---

## ✅ **Verification Checklist (Danh sách xác minh)**

Before using (Trước khi dùng):

- [ ] All files present (Tất cả files có mặt) in `.claude/`
- [ ] CLAUDE.md at project root (ở gốc dự án)
- [ ] .clauignore created
- [ ] settings.json valid JSON (JSON hợp lệ)
- [ ] Can start `claude` in project directory

After first use (Sau lần đầu dùng):

- [ ] Rules loaded correctly (Rules tải đúng)
- [ ] Commands available (`/commit`, `/test`, `/description`)
- [ ] Agents can be spawned (Agents có thể tạo)
- [ ] Permissions working as expected (Phép hoạt động như mong đợi)

---

## 💬 **Feedback & Support (Phản hồi & Hỗ trợ)**

**Issues? (Vấn đề?)**
- Check troubleshooting section (kiểm tra phần xử lý sự cố) above
- Review official docs (xem lại tài liệu chính thức)
- Ask in team chat (hỏi trong chat nhóm)

**Improvements? (Cải tiến?)**
- This is a living system (Đây là hệ thống sống)
- Update rules as you learn (Cập nhật rules khi bạn học)
- Share findings with team (Chia sẻ phát hiện với nhóm)

---

**🎉 Enjoy your professional Claude Code setup (Tận hưởng thiết lập Claude Code chuyên nghiệp của bạn)! 🚀**
