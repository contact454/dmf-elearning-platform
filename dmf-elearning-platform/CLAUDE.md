# DMF E-Learning Platform

German language learning platform với comprehensive (toàn diện) course structure và interactive (tương tác) learning modules.

## 📚 **Tech Stack (Công nghệ)**

**Frontend:**
- Next.js 14 (App Router)
- React 18 với TypeScript
- TailwindCSS + shadcn/ui
- React Query (data fetching = tải dữ liệu)
- i18n internationalization (đa ngôn ngữ)

**Backend:**
- Express.js (REST API)
- Prisma ORM (database toolkit = bộ công cụ database)
- PostgreSQL
- Node.js

**Project Structure:**
```
dmf-elearning-platform/
├── apps/
│   └── web-learner/          # Next.js frontend
├── services/
│   └── learning-service/     # Express backend API
└── prisma/                   # Database schema & migrations
```

## 🏗️ **Architecture (Kiến trúc)**

**Monorepo (kho mã nguồn đơn):** pnpm workspaces
- Shared configs (cấu hình dùng chung)
- Independent deployment (triển khai độc lập)

**6 Completed Modules:**
1. **Vocabulary** - Flashcards, SRS (Spaced Repetition System = hệ thống lặp lại cách quãng)
2. **Reading** - Comprehension passages (đoạn văn hiểu)
3. **Listening** - Audio exercises (bài tập nghe)
4. **Speaking** - Pronunciation practice (luyện phát âm)
5. **Writing** - Text composition (viết luận)
6. **Hub** - Learning dashboard (bảng điều khiển)

## 🔄 **Development Workflow (Quy trình phát triển)**

### Branch Strategy (Chiến lược nhánh):
```
main            # Production-ready code (code sẵn sàng production)
  └── feature/* # Feature branches (nhánh tính năng mới)
  └── bugfix/*  # Bug fixes (sửa lỗi)
```

### Development Commands:
```bash
# Install dependencies (cài đặt dependencies = gói phụ thuộc)
pnpm install

# Start development servers (khởi động servers phát triển)
pnpm dev                    # All services
pnpm dev --filter web-learner   # Frontend only
pnpm dev --filter learning-service  # Backend only

# Database operations (thao tác database)
cd services/learning-service
pnpm db:push      # Push schema changes (đẩy thay đổi schema)
pnpm db:studio    # Open Prisma Studio (mở công cụ quản lý DB)
pnpm db:seed      # Seed data (tạo dữ liệu mẫu)

# Testing
pnpm test         # Run all tests (chạy tất cả tests)
pnpm test:watch   # Watch mode (chế độ theo dõi)

# Build for production (build cho sản xuất)
pnpm build
```

## 📐 **Coding Conventions (Quy ước lập trình)**

### File Naming (Đặt tên file):
- Components: `PascalCase.tsx` (VocabularyCard.tsx)
- Utilities: `camelCase.ts` (formatDate.ts)
- API routes: `kebab-case.ts` (get-lessons.ts)
- Pages: lowercase (dashboard/page.tsx)

### Code Style:
- **TypeScript everywhere** - No `any` type
- **ESLint + Prettier** - Auto-format on save
- **Functional components** - React hooks pattern
- **Server/Client separation** - Explicit 'use client' directives

### Import Order:
```typescript
// 1. External libraries (thư viện bên ngoài)
import { useState } from 'react'

// 2. Internal utilities (tiện ích nội bộ)
import { formatDate } from '@/lib/utils'

// 3. Components
import { VocabularyCard } from '@/components/vocabulary'

// 4. Types (kiểu dữ liệu)
import type { Lesson } from '@/types'

// 5. Styles
import './styles.css'
```

## 🔒 **Critical Rules (Quy tắc quan trọng)**

### Security (Bảo mật):
- ❌ **NEVER** commit `.env` files
- ❌ **NEVER** expose API keys in frontend
- ✅ **ALWAYS** validate user input với Zod
- ✅ **ALWAYS** sanitize (làm sạch) database queries

### Database:
- ❌ **NEVER** edit existing migrations (sửa migrations đã có)
- ✅ **ALWAYS** create new migration for schema changes
- ✅ **ALWAYS** test migrations on local first
- ✅ **ALWAYS** backup before production migrations

### Git:
- ✅ **ALWAYS** run tests before commit
- ✅ **ALWAYS** use conventional commit messages
- ✅ **NEVER** force push to main
- ✅ **ALWAYS** create PR for review

## 📂 **Project Structure Detail**

### Frontend (apps/web-learner):
```
src/
├── app/              # Next.js App Router pages
│   └── [locale]/     # i18n routes (định tuyến đa ngôn ngữ)
│       ├── learn/    # Learning modules
│       ├── dashboard/# User dashboard
│       └── auth/     # Authentication pages
├── components/       # React components
│   ├── ui/          # shadcn/ui base components
│   ├── vocabulary/  # Vocabulary module
│   ├── reading/     # Reading module
│   └── ...
├── lib/             # Utilities & helpers
├── hooks/           # Custom React hooks
└── types/           # TypeScript types
```

### Backend (services/learning-service):
```
src/
├── api/             # Express routes (đường dẫn API)
│   ├── vocabulary/  # Vocabulary endpoints
│   ├── lessons/     # Lesson endpoints
│   └── users/       # User endpoints
├── services/        # Business logic (logic nghiệp vụ)
├── middlewares/     # Express middlewares
└── types/           # TypeScript types
```

### Database (prisma/):
```
├── schema.prisma    # Database schema (sơ đồ database)
├── migrations/      # Migration history (lịch sử thay đổi)
└── seed.ts          # Seed data script (script tạo dữ liệu mẫu)
```

## 🎯 **Current Phase (Giai đoạn hiện tại)**

**Status:** Frontend-Backend Integration Complete
**Next:** User Authentication (Xác thực người dùng) with Supabase

**Pending Tasks:**
1. Implement (triển khai) JWT authentication
2. Add role-based access control (RBAC = kiểm soát truy cập dựa trên vai trò)
3. Protect API endpoints (bảo vệ điểm cuối API)
4. User profile management (quản lý hồ sơ người dùng)

## 🧪 **Testing Strategy (Chiến lược kiểm thử)**

- **Unit tests:** Individual functions (hàm riêng lẻ)
- **Integration tests:** API endpoints
- **E2E tests:** User workflows (quy trình người dùng)
- **Target coverage:** 80%+

## 📦 **Dependencies Note (Ghi chú về Dependencies)**

**Critical packages (Gói quan trọng):**
- `@prisma/client` - Database ORM
- `react-query` - Server state management (quản lý trạng thái server)
- `zod` - Schema validation (kiểm tra schema)
- `i18next` - Internationalization (đa ngôn ngữ)

**Dev tools:**
- `typescript` - Type safety (an toàn kiểu)
- `eslint` - Linting (kiểm tra code)
- `prettier` - Code formatting (định dạng code)

## ⚡ **Quick Reference (Tham khảo nhanh)**

**Start working:**
1. `git pull` - Update code (cập nhật code)
2. `pnpm install` - Install new deps (cài packages mới)
3. `pnpm dev` - Start servers
4. Open http://localhost:3000 (frontend)
5. API at http://localhost:3003 (backend)

**Common issues:**
- Port 3000/3003 busy → Kill process: `lsof -ti:3000 | xargs kill`
- Prisma errors → `pnpm db:push` hoặc `pnpm db:generate`
- Type errors → Restart TypeScript server trong VSCode

## 🌐 **API Endpoints (Điểm cuối API)**

**Base URL:** http://localhost:3003/api

**Vocabulary:**
- `GET /vocabulary` - List vocabulary (danh sách từ vựng)
- `GET /vocabulary/:id` - Get single word (lấy 1 từ)
- `POST /vocabulary` - Create word (tạo từ mới)

**Lessons:**
- `GET /lessons` - List lessons (danh sách bài học)
- `GET /lessons/:id` - Get lesson detail (chi tiết bài học)
- `POST /lessons/:id/complete` - Mark complete (đánh dấu hoàn thành)

**Full API docs:** See `/docs/api.md`

---

**Project Goal:** Build comprehensive (toàn diện) German learning platform với engaging (hấp dẫn) UX và effective (hiệu quả) pedagogy (phương pháp giảng dạy).

**Team:** Solo developer (developer đơn độc) + Claude Code assistant
**Timeline:** MVP (Minimum Viable Product = sản phẩm khả thi tối thiểu) complete, adding advanced features (tính năng nâng cao)
