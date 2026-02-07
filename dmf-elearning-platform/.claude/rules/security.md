---
paths:
  - apps/web-learner/src/app/**/auth/**/*
  - apps/web-learner/src/app/api/**/*
  - services/learning-service/src/api/**/*
  - services/learning-service/src/middlewares/**/*
---

# Security Rules

*Rules (quy tắc) bảo mật CRITICAL (QUAN TRỌNG NHẤT) cho authentication (xác thực) và sensitive operations (thao tác nhạy cảm)*

## 🔒 **CRITICAL RULES (QUY TẮC QUAN TRỌNG NHẤT)**

### 1. NEVER Expose Secrets (KHÔNG BAO GIỜ lộ bí mật)

```typescript
// ❌ NEVER commit secrets (không bao giờ commit bí mật)
const API_KEY = 'sk_live_abc123' // DANGER! (NGUY HIỂM!)

// ✅ ALWAYS use environment variables (luôn dùng biến môi trường)
const API_KEY = process.env.SUPABASE_API_KEY

// ❌ NEVER log sensitive data (không bao giờ ghi log dữ liệu nhạy cảm)
console.log('User password:', password) // DANGER!
console.log('API response:', response) // Might contain tokens (có thể chứa tokens)!

// ✅ DO THIS - log safely (ghi log an toàn)
console.log('User login:', { userId: user.id, email: user.email })
// Never log: passwords, tokens, API keys, credit cards
```

### 2. Input Validation (Kiểm tra đầu vào)

```typescript
// ALWAYS validate ALL user input (luôn kiểm tra TẤT CẢ đầu vào người dùng)
import { z } from 'zod'

// ❌ NEVER trust user input (không bao giờ tin đầu vào)
const userId = req.params.id // Could be malicious (có thể độc hại)
const user = await db.findUser(userId)

// ✅ ALWAYS validate (LUÔN kiểm tra)
const userIdSchema = z.string().uuid()
const userId = userIdSchema.parse(req.params.id)

// Common validations (kiểm tra phổ biến)
const emailSchema = z.string().email()
const passwordSchema = z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/)
const levelSchema = z.enum(['A1', 'A2', 'B1', 'B2'])
```

### 3. SQL Injection Prevention (Ngăn chặn SQL Injection)

```typescript
// ❌ NEVER use string concatenation (không bao giờ dùng nối chuỗi)
const query = `SELECT * FROM users WHERE email = '${email}'` // DANGER!

// ✅ ALWAYS use parameterized queries (luôn dùng truy vấn tham số)
const user = await prisma.user.findUnique({
  where: { email: email } // Safe (an toàn)
})
```

### 4. XSS Prevention (Ngăn chặn XSS)

```typescript
// ❌ NEVER use dangerouslySetInnerHTML (không dùng dangerouslySetInnerHTML)
<div dangerouslySetInnerHTML={{ __html: userInput }} /> // DANGER!

// ✅ DO THIS - React escapes (thoát) automatically (tự động)
<div>{userInput}</div> // Safe

// If you MUST render HTML (nếu PHẢI hiển thị HTML)
import DOMPurify from 'dompurify'
const clean = DOMPurify.sanitize(userInput)
<div dangerouslySetInnerHTML={{ __html: clean }} />
```

### 5. Authentication (Xác thực)

```typescript
// ALWAYS hash passwords (luôn mã hóa mật khẩu)
import bcrypt from 'bcrypt'

// ❌ NEVER store plain passwords (không bao giờ lưu mật khẩu thuần)
await db.user.create({
  password: password // DANGER!
})

// ✅ ALWAYS hash (LUÔN mã hóa)
const saltRounds = 12 // Min 12 (tối thiểu 12)
const hashedPassword = await bcrypt.hash(password, saltRounds)
await db.user.create({
  password: hashedPassword
})

// Verify password (xác minh mật khẩu)
const isValid = await bcrypt.compare(inputPassword, storedHash)
```

### 6. JWT Security (Bảo mật JWT)

```typescript
import jwt from 'jsonwebtoken'

// ✅ GOOD JWT practices (thực hành JWT tốt)
const token = jwt.sign(
  { 
    userId: user.id,
    // Don't include (không thêm) sensitive data (dữ liệu nhạy cảm)!
  },
  process.env.JWT_SECRET, // Strong secret (bí mật mạnh) (min 32 chars)
  { 
    expiresIn: '1h', // Short expiry (hết hạn ngắn)
    algorithm: 'HS256'
  }
)

// Verify token (xác minh token)
try {
  const payload = jwt.verify(token, process.env.JWT_SECRET)
} catch (error) {
  // Invalid token (token không hợp lệ)
  return res.status(401).json({ error: 'Unauthorized' })
}
```

### 7. Rate Limiting (Giới hạn tốc độ)

```typescript
import rateLimit from 'express-rate-limit'

// ALWAYS add rate limiting (luôn thêm giới hạn tốc độ)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes (15 phút)
  max: 5, // Max 5 login attempts (tối đa 5 lần đăng nhập)
  message: 'Too many login attempts (Quá nhiều lần thử đăng nhập)'
})

app.post('/auth/login', loginLimiter, loginHandler)

// Different limits (giới hạn khác nhau) for different endpoints
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100 // 100 requests/minute
})
```

### 8. CORS Configuration (Cấu hình CORS)

```typescript
import cors from 'cors'

// ❌ NEVER allow all origins (không bao giờ cho phép tất cả origins)
app.use(cors({ origin: '*' })) // DANGER!

// ✅ ALWAYS whitelist specific origins (luôn liệt kê origins cụ thể)
const allowedOrigins = [
  'http://localhost:3000',
  'https://dmf-elearning.com'
]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true // Allow cookies (cho phép cookies)
}))
```

### 9. File Upload Security (Bảo mật tải lên file)

```typescript
import multer from 'multer'

// ALWAYS validate file types (luôn kiểm tra loại file)
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: (req, file, cb) => {
    // ONLY allow specific types (CHỈ cho phép loại cụ thể)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type (Loại file không hợp lệ)'))
    }
  }
})

// NEVER trust file extension (không tin phần mở rộng file)
// Check MIME type (kiểm tra loại MIME) instead
```

### 10. Session Security (Bảo mật phiên)

```typescript
import session from 'express-session'

app.use(session({
  secret: process.env.SESSION_SECRET, // Strong secret
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true, // Prevent XSS (ngăn XSS)
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    sameSite: 'strict', // CSRF protection (bảo vệ CSRF)
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}))
```

## 🛡️ **Security Checklist (Danh sách kiểm tra bảo mật)**

### Before Deployment (Trước khi triển khai):

- [ ] All secrets (tất cả bí mật) in environment variables (biến môi trường)
- [ ] .env files in .gitignore
- [ ] Input validation (kiểm tra đầu vào) on ALL endpoints
- [ ] Rate limiting (giới hạn tốc độ) enabled
- [ ] CORS configured properly (cấu hình CORS đúng)
- [ ] HTTPS enabled (bật HTTPS) in production
- [ ] Passwords hashed (mật khẩu đã mã hóa) với bcrypt
- [ ] JWT with short expiry (JWT có hết hạn ngắn)
- [ ] No sensitive data (không có dữ liệu nhạy cảm) in logs
- [ ] SQL injection (SQL injection) prevention
- [ ] XSS prevention (ngăn chặn XSS)
- [ ] CSRF tokens (tokens CSRF) where needed

## 🚨 **Common Vulnerabilities (Lỗ hổng phổ biến)**

### 1. Broken Authentication (Xác thực bị phá vỡ)
```typescript
// ❌ BAD - Weak password requirements (yêu cầu mật khẩu yếu)
const password = z.string().min(4) // Too weak! (Quá yếu!)

// ✅ GOOD - Strong requirements (yêu cầu mạnh)
const password = z.string()
  .min(8)
  .regex(/[A-Z]/, 'Need uppercase (Cần chữ hoa)')
  .regex(/[a-z]/, 'Need lowercase (Cần chữ thường)')
  .regex(/[0-9]/, 'Need number (Cần số)')
```

### 2. Sensitive Data Exposure (Lộ dữ liệu nhạy cảm)
```typescript
// ❌ BAD - Returning sensitive fields (trả về fields nhạy cảm)
res.json({ user: user }) // Includes password hash!

// ✅ GOOD - Exclude sensitive fields (loại trừ fields nhạy cảm)
const { password, ...safeUser } = user
res.json({ user: safeUser })
```

### 3. Broken Access Control (Kiểm soát truy cập bị phá vỡ)
```typescript
// ❌ BAD - No authorization check (không kiểm tra ủy quyền)
app.delete('/api/users/:id', async (req, res) => {
  await prisma.user.delete({ where: { id: req.params.id } })
})

// ✅ GOOD - Check authorization (kiểm tra ủy quyền)
app.delete('/api/users/:id', requireAuth, async (req, res) => {
  if (req.user.id !== req.params.id && !req.user.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  await prisma.user.delete({ where: { id: req.params.id } })
})
```

---

**⚠️ CRITICAL (QUAN TRỌNG NHẤT):** Security is NOT optional (Bảo mật KHÔNG phải tùy chọn). ALWAYS follow these rules (LUÔN tuân theo quy tắc này) for ANY code (cho BẤT KỲ code nào) touching authentication (chạm vào xác thực), user data (dữ liệu người dùng), or external input (đầu vào bên ngoài)!
