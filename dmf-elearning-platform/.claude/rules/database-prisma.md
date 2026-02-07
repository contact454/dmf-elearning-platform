---
paths:
  - prisma/**/*
  - services/learning-service/prisma/**/*
---

# Database & Prisma Rules

*Rules (quy tắc) cho Prisma ORM và PostgreSQL database operations (thao tác database)*

## 🎯 **Scope (Phạm vi)**

Rules này ONLY activate (kích hoạt) khi làm việc với:
- Prisma schema (`prisma/schema.prisma`)
- Migrations (di chuyển schema) (`prisma/migrations/`)
- Seed scripts (scripts tạo dữ liệu mẫu) (`prisma/seed.ts`)

## ✅ **MUST DO (BẮT BUỘC LÀM)**

### 1. Schema Design (Thiết kế Schema)

```prisma
// ALWAYS use proper naming conventions (quy ước đặt tên đúng)
// Models: PascalCase
// Fields: camelCase
// Relations: descriptive names (tên mô tả)

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations (quan hệ)
  progress  UserProgress[]
  
  @@index([email])
  @@map("users") // Map to table name (ánh xạ tên bảng)
}

model Lesson {
  id          String   @id @default(cuid())
  title       String
  content     String   @db.Text // Use @db.Text for long text
  level       Level    // Use enums (dùng enums)
  type        LessonType
  createdAt   DateTime @default(now())
  
  // Always add indexes (luôn thêm indexes) for query fields
  @@index([level, type])
  @@map("lessons")
}

// ALWAYS define enums (luôn định nghĩa enums) for fixed values
enum Level {
  A1
  A2
  B1
  B2
}

enum LessonType {
  VOCABULARY
  READING
  LISTENING
  SPEAKING
  WRITING
}
```

### 2. Migrations (Di chuyển Schema)

```bash
# ALWAYS create migration (luôn tạo migration) for schema changes
pnpm prisma migrate dev --name add_user_preferences

# NEVER edit existing migrations (không bao giờ sửa migrations có sẵn)
# ❌ BAD - Editing prisma/migrations/20240101_create_users/migration.sql
# ✅ GOOD - Create new migration (tạo migration mới)

# ALWAYS test migrations locally first (luôn test local trước)
pnpm prisma migrate dev

# For production (cho production)
pnpm prisma migrate deploy

# ALWAYS backup database trước khi run migrations trên production
pg_dump dmf_elearning > backup_$(date +%Y%m%d).sql
```

**Migration Checklist:**
- [ ] Schema changes (thay đổi schema) are necessary (cần thiết)
- [ ] Migration name is descriptive (tên mô tả rõ)
- [ ] Tested locally (đã test local)
- [ ] Backward compatible (tương thích ngược) if possible
- [ ] Includes rollback plan (kế hoạch hoàn tác)

### 3. Queries (Truy vấn)

```typescript
// ALWAYS use Prisma Client type-safe queries (truy vấn an toàn kiểu)

// ✅ GOOD - Select only needed fields (chỉ chọn fields cần thiết)
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    name: true
    // Don't fetch (không lấy) password, sensitive data
  },
  where: {
    createdAt: {
      gte: new Date('2024-01-01') // Greater than or equal (lớn hơn hoặc bằng)
    }
  },
  orderBy: {
    createdAt: 'desc' // Descending (giảm dần)
  },
  take: 20, // Limit (giới hạn)
  skip: page * 20 // Offset (bù trừ) for pagination (phân trang)
})

// ✅ GOOD - Use include (dùng include) for relations (quan hệ)
const lesson = await prisma.lesson.findUnique({
  where: { id: lessonId },
  include: {
    progress: {
      where: { userId: currentUserId },
      select: {
        completed: true,
        score: true
      }
    }
  }
})

// ❌ BAD - N+1 query problem (vấn đề truy vấn N+1)
const lessons = await prisma.lesson.findMany()
for (const lesson of lessons) {
  // Separate query (truy vấn riêng) for each lesson - SLOW! (CHẬM!)
  lesson.progress = await prisma.userProgress.findMany({
    where: { lessonId: lesson.id }
  })
}

// ✅ GOOD - Single query với include
const lessons = await prisma.lesson.findMany({
  include: {
    progress: true
  }
})
```

### 4. Transactions (Giao dịch)

```typescript
// ALWAYS use transactions (luôn dùng transactions) for multi-step operations

// ✅ GOOD - Interactive transaction (giao dịch tương tác)
const result = await prisma.$transaction(async (tx) => {
  // Step 1: Create lesson (tạo bài học)
  const lesson = await tx.lesson.create({
    data: {
      title: 'New Lesson',
      content: 'Content...',
      level: 'A1',
      type: 'VOCABULARY'
    }
  })
  
  // Step 2: Create initial progress (tạo tiến độ ban đầu) for all users
  await tx.userProgress.createMany({
    data: users.map(user => ({
      userId: user.id,
      lessonId: lesson.id,
      completed: false
    }))
  })
  
  return lesson
})

// If ANY step fails (nếu BẤT KỲ bước nào thất bại)
// → ALL changes rolled back (tất cả thay đổi được hoàn tác)
```

### 5. Seeding (Tạo dữ liệu mẫu)

```typescript
// prisma/seed.ts
// ALWAYS use idempotent seeding (tạo dữ liệu có thể chạy nhiều lần)

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding (Bắt đầu tạo dữ liệu mẫu)...')
  
  // Use upsert (update or insert = cập nhật hoặc thêm) để avoid duplicates (tránh trùng)
  const user1 = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {}, // Don't update if exists (không cập nhật nếu đã có)
    create: {
      email: 'test@example.com',
      name: 'Test User'
    }
  })
  
  // Seed lessons
  const lessons = await Promise.all([
    prisma.lesson.create({
      data: {
        title: 'Basic Greetings',
        content: 'Learn basic German greetings',
        level: 'A1',
        type: 'VOCABULARY'
      }
    }),
    // ...more lessons
  ])
  
  console.log({ user1, lessons })
  console.log('Seeding finished (Hoàn tất tạo dữ liệu).')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

## ❌ **NEVER DO (KHÔNG BAO GIỜ LÀM)**

### 1. Security (Bảo mật)

```typescript
// ❌ NEVER use raw SQL với user input (không bao giờ dùng SQL thô với đầu vào người dùng)
const email = req.body.email
const users = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = '${email}'
` // SQL INJECTION RISK! (NGUY CƠ SQL INJECTION!)

// ✅ DO THIS - Use Prisma parameterized queries
const users = await prisma.user.findMany({
  where: { email: email } // Safe (an toàn)
})

// OR if you MUST use raw SQL (hoặc nếu PHẢI dùng SQL thô)
const users = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${email}
` // Prisma escapes (thoát) parameters automatically (tự động)
```

### 2. Performance (Hiệu suất)

```typescript
// ❌ NEVER fetch all records without limit (không lấy tất cả bản ghi không giới hạn)
const allUsers = await prisma.user.findMany() // Could be millions! (có thể hàng triệu!)

// ✅ DO THIS - Always paginate (luôn phân trang)
const users = await prisma.user.findMany({
  take: 20,
  skip: page * 20
})

// ❌ NEVER select * when you need few fields (không select * khi chỉ cần vài fields)
const users = await prisma.user.findMany() // Gets all fields (lấy tất cả fields)

// ✅ DO THIS - Select only needed fields
const users = await prisma.user.findMany({
  select: { id: true, email: true }
})
```

### 3. Data Integrity (Toàn vẹn dữ liệu)

```typescript
// ❌ NEVER delete without checking relations (không xóa mà không kiểm tra quan hệ)
await prisma.user.delete({
  where: { id: userId }
}) // Might fail (có thể thất bại) if user has progress records (nếu user có bản ghi tiến độ)

// ✅ DO THIS - Check relations first (kiểm tra quan hệ trước)
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { progress: true }
})

if (user.progress.length > 0) {
  throw new Error('Cannot delete user with progress (Không thể xóa user có tiến độ)')
}

// OR use cascade delete (hoặc dùng cascade delete) trong schema
model User {
  progress UserProgress[] @relation(onDelete: Cascade)
}
```

## 🔍 **Indexes & Performance (Indexes & Hiệu suất)**

```prisma
// ALWAYS add indexes (luôn thêm indexes) for:

// 1. Foreign keys (khóa ngoại)
model UserProgress {
  userId   String
  lessonId String
  
  user   User   @relation(fields: [userId], references: [id])
  lesson Lesson @relation(fields: [lessonId], references: [id])
  
  @@index([userId]) // Index for foreign key (index cho khóa ngoại)
  @@index([lessonId])
}

// 2. Fields used in WHERE clauses (fields dùng trong WHERE)
model Lesson {
  level Level
  type  LessonType
  
  @@index([level]) // Queries by level (truy vấn theo level)
  @@index([type])
  @@index([level, type]) // Composite index (index kết hợp) for both
}

// 3. Fields used in ORDER BY
model User {
  createdAt DateTime
  
  @@index([createdAt]) // For sorting (để sắp xếp)
}

// 4. Unique constraints (ràng buộc duy nhất)
model User {
  email String @unique // Automatically creates index (tự động tạo index)
}
```

## 📊 **Monitoring Queries (Giám sát truy vấn)**

```typescript
// Enable query logging (bật ghi log truy vấn) trong development
const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'error' },
    { emit: 'stdout', level: 'warn' }
  ]
})

prisma.$on('query', (e) => {
  console.log('Query: ' + e.query)
  console.log('Duration: ' + e.duration + 'ms')
})

// Find slow queries (tìm truy vấn chậm)
// Look for duration > 100ms (tìm duration > 100ms)
```

## 🧪 **Testing (Kiểm thử)**

```typescript
// Use separate test database (dùng database test riêng)
// .env.test
DATABASE_URL="postgresql://user:pass@localhost:5432/dmf_test"

// Seed test data (tạo dữ liệu test) before each test suite
beforeAll(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE users CASCADE`
  await prisma.user.create({
    data: { email: 'test@example.com', name: 'Test' }
  })
})

afterAll(async () => {
  await prisma.$disconnect()
})
```

## 📝 **Common Patterns (Mẫu thường dùng)**

### Soft Delete (Xóa mềm):
```prisma
model Lesson {
  id        String    @id @default(cuid())
  deletedAt DateTime? // Null = not deleted (null = chưa xóa)
  
  @@index([deletedAt]) // For filtering (để lọc)
}

// Query only active records (chỉ truy vấn bản ghi hoạt động)
const activeLessons = await prisma.lesson.findMany({
  where: { deletedAt: null }
})
```

### Timestamps (Dấu thời gian):
```prisma
// ALWAYS include timestamps (luôn thêm timestamps)
model Lesson {
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### UUID vs Auto-increment (UUID vs Tự tăng):
```prisma
// PREFER cuid() over uuid() (ưu tiên cuid() hơn uuid())
// cuid() is sortable (có thể sắp xếp) and URL-safe
model User {
  id String @id @default(cuid()) // ✅ GOOD
  // id String @id @default(uuid()) // OK but less ideal (OK nhưng kém lý tưởng hơn)
  // id Int @id @default(autoincrement()) // Only for simple cases (chỉ cho trường hợp đơn giản)
}
```

---

**Remember (Nhớ rằng):** Database là single source of truth (nguồn sự thật duy nhất). Migrations phải reversible (có thể hoàn tác), indexes phải strategic (chiến lược), và data integrity (toàn vẹn dữ liệu) là CRITICAL (QUAN TRỌNG NHẤT)!
