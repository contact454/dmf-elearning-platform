---
paths:
  - services/learning-service/src/api/**/*.ts
  - services/learning-service/src/services/**/*.ts
  - services/learning-service/src/middlewares/**/*.ts
---

# Backend API Development Rules

*Rules cho phát triển Express.js backend API*

## 🎯 **Scope (Phạm vi)**

Rules này ONLY activate (kích hoạt) khi làm việc với:
- Backend API routes (`services/learning-service/src/api/`)
- Business logic services (`services/learning-service/src/services/`)
- Express middlewares (`services/learning-service/src/middlewares/`)

## ✅ **MUST DO (BẮT BUỘC LÀM)**

### 1. Request Validation (Kiểm tra đầu vào)
```typescript
import { z } from 'zod'

// ALWAYS define schema (luôn định nghĩa schema)
const CreateVocabularySchema = z.object({
  word: z.string().min(1),
  translation: z.string().min(1),
  level: z.enum(['A1', 'A2', 'B1', 'B2'])
})

// ALWAYS validate before processing (luôn kiểm tra trước khi xử lý)
export async function createVocabulary(req, res) {
  const result = CreateVocabularySchema.safeParse(req.body)
  
  if (!result.success) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: result.error.errors 
    })
  }
  
  // Process validated data (xử lý dữ liệu đã kiểm tra)
  const data = result.data
  // ...
}
```

### 2. Error Handling (Xử lý lỗi)
```typescript
// ALWAYS use try-catch (luôn dùng try-catch)
export async function getLesson(req, res) {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: req.params.id }
    })
    
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' })
    }
    
    res.json(lesson)
  } catch (error) {
    // ALWAYS log errors với context (luôn ghi log lỗi với ngữ cảnh)
    console.error('Failed to fetch lesson:', {
      lessonId: req.params.id,
      error: error.message
    })
    
    // NEVER expose internal errors to client (không bao giờ lộ lỗi nội bộ ra ngoài)
    res.status(500).json({ error: 'Internal server error' })
  }
}
```

### 3. HTTP Status Codes (Mã trạng thái HTTP)
```typescript
// Use correct status codes (dùng đúng mã trạng thái)
200 // OK - Success with response body (thành công có dữ liệu)
201 // Created - Resource created (tạo tài nguyên thành công)
204 // No Content - Success without body (thành công không có dữ liệu)
400 // Bad Request - Validation error (lỗi kiểm tra đầu vào)
401 // Unauthorized - Not authenticated (chưa xác thực)
403 // Forbidden - Not authorized (không có quyền)
404 // Not Found - Resource not found (không tìm thấy tài nguyên)
409 // Conflict - Duplicate resource (tài nguyên bị trùng)
500 // Internal Server Error - Server error (lỗi server)
```

### 4. Database Queries (Truy vấn database)
```typescript
// ALWAYS use Prisma parameterized queries (luôn dùng truy vấn tham số)
// ✅ GOOD (TỐT)
const user = await prisma.user.findUnique({
  where: { email: email } // Safe (an toàn)
})

// ❌ BAD (TỆ) - SQL injection risk (nguy cơ SQL injection)
const user = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = '${email}'
`

// ALWAYS use transactions cho multi-step operations (luôn dùng transaction cho nhiều bước)
await prisma.$transaction(async (tx) => {
  const lesson = await tx.lesson.create({ data: lessonData })
  await tx.progress.create({ data: { lessonId: lesson.id, userId } })
})
```

### 5. Logging & Monitoring (Ghi log & giám sát)
```typescript
// ALWAYS log important events (luôn ghi log sự kiện quan trọng)
console.log('[API] Creating vocabulary:', { 
  word: data.word, 
  level: data.level,
  userId: req.user?.id 
})

// ALWAYS include request ID for tracing (luôn thêm ID request để theo dõi)
import { v4 as uuidv4 } from 'uuid'

app.use((req, res, next) => {
  req.id = uuidv4()
  console.log(`[${req.id}] ${req.method} ${req.path}`)
  next()
})
```

## ❌ **NEVER DO (KHÔNG BAO GIỜ LÀM)**

### 1. Security (Bảo mật)
```typescript
// ❌ NEVER expose sensitive data (không bao giờ lộ dữ liệu nhạy cảm)
res.json({
  user: {
    ...user,
    password: user.password // DANGER! (NGUY HIỂM!)
  }
})

// ✅ DO THIS (LÀM NHƯ NÀY)
const { password, ...safeUser } = user
res.json({ user: safeUser })

// ❌ NEVER trust user input directly (không bao giờ tin đầu vào trực tiếp)
const userId = req.params.id // Could be malicious (có thể độc hại)

// ✅ ALWAYS validate (LUÔN kiểm tra)
const userId = z.string().uuid().parse(req.params.id)
```

### 2. Performance (Hiệu suất)
```typescript
// ❌ NEVER fetch unnecessary data (không fetch dữ liệu không cần)
const users = await prisma.user.findMany() // Gets ALL users! (lấy TẤT CẢ!)

// ✅ DO THIS - paginate (phân trang)
const users = await prisma.user.findMany({
  take: 20,
  skip: page * 20
})

// ❌ NEVER use N+1 queries (không dùng truy vấn N+1)
const lessons = await prisma.lesson.findMany()
for (const lesson of lessons) {
  lesson.progress = await prisma.progress.findMany({ 
    where: { lessonId: lesson.id } 
  }) // BAD! Multiple queries (TỆ! Nhiều truy vấn)
}

// ✅ DO THIS - use include (dùng include)
const lessons = await prisma.lesson.findMany({
  include: { progress: true } // Single query (1 truy vấn)
})
```

## 🔧 **Best Practices (Thực hành tốt)**

### 1. API Response Format (Định dạng phản hồi API)
```typescript
// Consistent response structure (cấu trúc phản hồi nhất quán)
{
  success: true,
  data: { /* actual data (dữ liệu thực) */ },
  meta: { 
    page: 1, 
    total: 100,
    timestamp: new Date().toISOString()
  }
}

// Error response
{
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid input',
    details: [/* validation errors */]
  }
}
```

### 2. Middleware Order (Thứ tự middleware)
```typescript
// Correct order matters (thứ tự đúng quan trọng)
app.use(cors()) // 1. CORS first (CORS đầu tiên)
app.use(express.json()) // 2. Body parsing (phân tích body)
app.use(authMiddleware) // 3. Authentication (xác thực)
app.use(loggingMiddleware) // 4. Logging (ghi log)
app.use('/api', routes) // 5. Routes (định tuyến)
app.use(errorHandler) // 6. Error handler LAST (xử lý lỗi CUỐI CÙNG)
```

### 3. Environment Variables (Biến môi trường)
```typescript
// ALWAYS use env vars cho config (luôn dùng env vars cho cấu hình)
const PORT = process.env.PORT || 3003
const DATABASE_URL = process.env.DATABASE_URL

// NEVER hardcode secrets (không bao giờ hardcode bí mật)
const API_KEY = 'abc123' // ❌ BAD (TỆ)
const API_KEY = process.env.API_KEY // ✅ GOOD (TỐT)

// ALWAYS validate env vars at startup (luôn kiểm tra env vars khi khởi động)
const envSchema = z.object({
  PORT: z.string(),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32)
})

envSchema.parse(process.env)
```

### 4. Rate Limiting (Giới hạn tốc độ)
```typescript
import rateLimit from 'express-rate-limit'

// ALWAYS add rate limiting (luôn thêm giới hạn tốc độ)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per 15 min
  message: 'Too many requests, please try again later'
})

app.use('/api', limiter)
```

## 📝 **Code Examples (Ví dụ code)**

### Complete API Endpoint (Endpoint API hoàn chỉnh):
```typescript
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import type { Request, Response } from 'express'

// Schema definition (định nghĩa schema)
const CreateLessonSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(10),
  level: z.enum(['A1', 'A2', 'B1', 'B2']),
  type: z.enum(['vocabulary', 'reading', 'listening'])
})

export async function createLesson(req: Request, res: Response) {
  try {
    // 1. Validate input (kiểm tra đầu vào)
    const result = CreateLessonSchema.safeParse(req.body)
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: result.error.errors
        }
      })
    }
    
    const data = result.data
    
    // 2. Business logic (logic nghiệp vụ)
    const lesson = await prisma.lesson.create({
      data: {
        ...data,
        createdBy: req.user.id // From auth middleware
      }
    })
    
    // 3. Log success (ghi log thành công)
    console.log('[API] Lesson created:', {
      lessonId: lesson.id,
      userId: req.user.id
    })
    
    // 4. Return response (trả về phản hồi)
    return res.status(201).json({
      success: true,
      data: lesson,
      meta: {
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    // Error handling (xử lý lỗi)
    console.error('[API] Failed to create lesson:', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id
    })
    
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create lesson'
      }
    })
  }
}
```

## 🧪 **Testing Requirements (Yêu cầu kiểm thử)**

```typescript
// ALWAYS write tests cho API endpoints (luôn viết tests)
describe('POST /api/lessons', () => {
  it('should create lesson với valid data', async () => {
    const response = await request(app)
      .post('/api/lessons')
      .send({
        title: 'Test Lesson',
        content: 'Test content',
        level: 'A1',
        type: 'vocabulary'
      })
    
    expect(response.status).toBe(201)
    expect(response.body.success).toBe(true)
  })
  
  it('should return 400 với invalid data', async () => {
    const response = await request(app)
      .post('/api/lessons')
      .send({ title: '' }) // Invalid
    
    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
  })
})
```

---

**Remember (Nhớ rằng):** Backend API là giao diện giữa frontend và database. Security (bảo mật), validation (kiểm tra), và error handling (xử lý lỗi) là CRITICAL (QUAN TRỌNG NHẤT)!
