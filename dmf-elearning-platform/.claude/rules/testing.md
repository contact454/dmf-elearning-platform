---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/__tests__/**/*"
  - "**/tests/**/*"
---

# Testing Rules

*Rules (quy tắc) cho viết tests (kiểm thử) và quality assurance (đảm bảo chất lượng)*

## 🎯 **Scope (Phạm vi)**

Rules này ONLY activate (kích hoạt) khi làm việc với:
- Test files (files kiểm thử) (`*.test.ts`, `*.test.tsx`)
- Test directories (thư mục kiểm thử) (`__tests__/`, `tests/`)

## ✅ **MUST DO (BẮT BUỘC LÀM)**

### 1. Test Structure (Cấu trúc Test)

```typescript
// ALWAYS follow AAA pattern (luôn theo mẫu AAA)
// Arrange (Chuẩn bị) → Act (Hành động) → Assert (Khẳng định)

describe('VocabularyCard', () => {
  it('should display word on front side (nên hiển thị từ mặt trước)', () => {
    // Arrange (Chuẩn bị)
    const word = 'Hallo'
    const translation = 'Hello'
    
    // Act (Hành động)
    render(<VocabularyCard word={word} translation={translation} />)
    
    // Assert (Khẳng định)
    expect(screen.getByText(word)).toBeInTheDocument()
  })
})
```

### 2. Test Naming (Đặt tên Test)

```typescript
// ✅ GOOD - Descriptive names (tên mô tả)
it('should flip card when clicked')
it('should show error message when API fails')
it('should disable submit button while loading')

// ❌ BAD - Vague names (tên mơ hồ)
it('test1')
it('works')
it('should work correctly')
```

### 3. Coverage Requirements (Yêu cầu độ phủ)

```typescript
// ALWAYS test (luôn test):
// - Happy path (đường đi vui - trường hợp thành công)
// - Error cases (trường hợp lỗi)
// - Edge cases (trường hợp biên)
// - Loading states (trạng thái đang tải)

describe('useVocabulary hook', () => {
  it('should fetch vocabulary successfully', async () => {
    // Happy path
  })
  
  it('should handle network error (xử lý lỗi mạng)', async () => {
    // Error case
  })
  
  it('should handle empty response (xử lý phản hồi rỗng)', async () => {
    // Edge case
  })
  
  it('should show loading state (hiển thị trạng thái đang tải)', () => {
    // Loading state
  })
})
```

**Target (Mục tiêu):** 80%+ coverage (độ phủ)

## 🧪 **Testing Patterns (Mẫu Kiểm thử)**

### API Tests:

```typescript
import request from 'supertest'
import { app } from '../src/app'

describe('POST /api/vocabulary', () => {
  it('should create vocabulary with valid data', async () => {
    const response = await request(app)
      .post('/api/vocabulary')
      .send({
        word: 'Hallo',
        translation: 'Hello',
        level: 'A1'
      })
    
    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      success: true,
      data: {
        word: 'Hallo',
        translation: 'Hello'
      }
    })
  })
  
  it('should return 400 with invalid data (trả về 400 với dữ liệu không hợp lệ)', async () => {
    const response = await request(app)
      .post('/api/vocabulary')
      .send({ word: '' }) // Invalid
    
    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
  })
})
```

### Component Tests:

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'

describe('LessonList', () => {
  const queryClient = new QueryClient()
  
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
  
  it('should render lessons list', async () => {
    render(<LessonList />, { wrapper })
    
    await waitFor(() => {
      expect(screen.getByText('Basic Greetings')).toBeInTheDocument()
    })
  })
})
```

### Hook Tests:

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { useVocabulary } from '../hooks/useVocabulary'

describe('useVocabulary', () => {
  it('should fetch vocabulary data', async () => {
    const { result } = renderHook(() => useVocabulary('A1'))
    
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    
    expect(result.current.data).toHaveLength(10)
  })
})
```

## ❌ **NEVER DO (KHÔNG BAO GIỜ LÀM)**

```typescript
// ❌ NEVER test implementation details (không test chi tiết triển khai)
expect(component.state.count).toBe(0) // BAD - internal state (trạng thái nội bộ)

// ✅ DO THIS - test behavior (test hành vi)
expect(screen.getByText('Count: 0')).toBeInTheDocument() // GOOD - user-visible (người dùng thấy được)

// ❌ NEVER use setTimeout trong tests
await new Promise(resolve => setTimeout(resolve, 1000)) // BAD

// ✅ DO THIS - use waitFor
await waitFor(() => expect(screen.getByText('Loaded')).toBeInTheDocument())

// ❌ NEVER commit tests that depend on external services (phụ thuộc dịch vụ bên ngoài)
await fetch('https://real-api.com/data') // BAD

// ✅ DO THIS - mock external dependencies (giả lập phụ thuộc bên ngoài)
vi.mock('fetch')
```

## 🎭 **Mocking (Giả lập)**

```typescript
// Mock API calls (giả lập gọi API)
import { vi } from 'vitest'

vi.mock('../lib/api', () => ({
  fetchVocabulary: vi.fn(() => Promise.resolve([
    { word: 'Hallo', translation: 'Hello' }
  ]))
}))

// Mock React Query
const mockUseQuery = vi.fn()
vi.mock('@tanstack/react-query', () => ({
  useQuery: mockUseQuery
}))

// Reset mocks between tests (đặt lại giả lập giữa các tests)
afterEach(() => {
  vi.clearAllMocks()
})
```

## 📊 **Running Tests (Chạy Tests)**

```bash
# Run all tests (chạy tất cả tests)
pnpm test

# Watch mode (chế độ theo dõi)
pnpm test:watch

# Coverage report (báo cáo độ phủ)
pnpm test:coverage

# Run specific file (chạy file cụ thể)
pnpm test VocabularyCard.test.tsx
```

---

**Remember (Nhớ rằng):** Tests are living documentation (tài liệu sống). Good tests (tests tốt) = confidence to refactor (tự tin tái cấu trúc)!
