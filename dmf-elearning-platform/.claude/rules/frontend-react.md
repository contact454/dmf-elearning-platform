---
paths:
  - apps/web-learner/src/app/**/*.tsx
  - apps/web-learner/src/components/**/*.tsx
  - apps/web-learner/src/hooks/**/*.ts
  - apps/web-learner/src/lib/**/*.ts
---

# Frontend React Development Rules

*Rules (quy tắc) cho phát triển Next.js 14 + React frontend*

## 🎯 **Scope (Phạm vi)**

Rules này ONLY activate (kích hoạt) khi làm việc với:
- Next.js pages (`apps/web-learner/src/app/`)
- React components (thành phần) (`apps/web-learner/src/components/`)
- Custom hooks (hooks tùy chỉnh) (`apps/web-learner/src/hooks/`)
- Utilities (tiện ích) (`apps/web-learner/src/lib/`)

## ✅ **MUST DO (BẮT BUỘC LÀM)**

### 1. Component Structure (Cấu trúc Component)

```typescript
// ALWAYS use functional components (luôn dùng functional components)
// với TypeScript

import { useState } from 'react'
import type { FC } from 'react'

interface VocabularyCardProps {
  word: string
  translation: string
  level: 'A1' | 'A2' | 'B1' | 'B2'
  onFlip?: () => void
}

export const VocabularyCard: FC<VocabularyCardProps> = ({
  word,
  translation,
  level,
  onFlip
}) => {
  const [isFlipped, setIsFlipped] = useState(false)
  
  return (
    <div className="vocabulary-card">
      {/* Component JSX */}
    </div>
  )
}
```

### 2. Server vs Client Components (Server vs Client Components)

```typescript
// DEFAULT: Server Component (không cần 'use client')
// ✅ GOOD cho static content (nội dung tĩnh)
export default function LessonsPage() {
  return <div>Lessons</div>
}

// ONLY add 'use client' when needed (chỉ thêm khi cần)
// CHỈ KHI: useState, useEffect, event handlers, browser APIs
'use client'

import { useState } from 'react'

export default function InteractivePage() {
  const [count, setCount] = useState(0)
  // Client-side logic (logic phía client)
}
```

**When to use Client Component (Khi nào dùng Client Component):**
- ✅ Interactive elements (phần tử tương tác) - buttons, forms
- ✅ useState, useEffect, useRef hooks
- ✅ Event handlers (xử lý sự kiện) - onClick, onChange
- ✅ Browser APIs - localStorage, window, document
- ✅ Real-time data (dữ liệu thời gian thực)

**Keep as Server Component (Giữ là Server Component):**
- ✅ Static content (nội dung tĩnh)
- ✅ Data fetching (lấy dữ liệu) với async/await
- ✅ SEO-critical pages (trang quan trọng cho SEO)
- ✅ Layouts, navigation

### 3. Data Fetching với React Query

```typescript
// ALWAYS use React Query cho API calls (lời gọi API)
import { useQuery, useMutation } from '@tanstack/react-query'

// ✅ GOOD - Query hook pattern
export function useVocabulary(level: string) {
  return useQuery({
    queryKey: ['vocabulary', level],
    queryFn: async () => {
      const response = await fetch(`/api/vocabulary?level=${level}`)
      if (!response.ok) throw new Error('Failed to fetch')
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes (formerly cacheTime)
  })
}

// Usage in component (sử dụng trong component)
function VocabularyList({ level }) {
  const { data, isLoading, error } = useVocabulary(level)
  
  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />
  
  return <div>{data.map(/* ... */)}</div>
}

// ✅ GOOD - Mutation hook pattern
export function useCreateLesson() {
  return useMutation({
    mutationFn: async (lessonData) => {
      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lessonData)
      })
      if (!response.ok) throw new Error('Failed to create')
      return response.json()
    },
    onSuccess: () => {
      // Invalidate (vô hiệu hóa) queries để refetch (lấy lại)
      queryClient.invalidateQueries({ queryKey: ['lessons'] })
    }
  })
}
```

### 4. Type Safety (An toàn kiểu)

```typescript
// ALWAYS define types (luôn định nghĩa types)
// ❌ BAD
function LessonCard({ lesson }) {
  return <div>{lesson.title}</div>
}

// ✅ GOOD
interface Lesson {
  id: string
  title: string
  content: string
  level: 'A1' | 'A2' | 'B1' | 'B2'
  type: 'vocabulary' | 'reading' | 'listening'
  createdAt: Date
}

interface LessonCardProps {
  lesson: Lesson
  onComplete?: (lessonId: string) => void
}

function LessonCard({ lesson, onComplete }: LessonCardProps) {
  return <div>{lesson.title}</div>
}

// ALWAYS use shared types (luôn dùng types dùng chung)
import type { Lesson } from '@/types'
```

### 5. State Management (Quản lý trạng thái)

```typescript
// PREFER (ưu tiên) React Query cho server state (trạng thái server)
// PREFER useState cho local UI state (trạng thái UI local)

// ✅ GOOD - Local UI state
function VocabularyCard() {
  const [isFlipped, setIsFlipped] = useState(false)
  const [userAnswer, setUserAnswer] = useState('')
  
  // Local state only (chỉ trạng thái local)
}

// ✅ GOOD - Server state với React Query
function LessonsList() {
  const { data: lessons } = useQuery({
    queryKey: ['lessons'],
    queryFn: fetchLessons
  })
  
  // Server data managed by React Query
}

// AVOID (tránh) complex state management libraries (thư viện quản lý state phức tạp)
// unless absolutely needed (trừ khi thực sự cần)
// DMF project doesn't need Redux/Zustand yet
```

### 6. Error Handling (Xử lý lỗi)

```typescript
// ALWAYS handle loading & error states (luôn xử lý states loading & lỗi)
function LessonDetail({ id }: { id: string }) {
  const { data, isLoading, error } = useLesson(id)
  
  // Handle loading (xử lý đang tải)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
        <span className="ml-2">Loading lesson (Đang tải bài học)...</span>
      </div>
    )
  }
  
  // Handle error (xử lý lỗi)
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-800">
          Failed to load lesson (Không tải được bài học)
        </p>
        <button onClick={() => refetch()}>
          Try again (Thử lại)
        </button>
      </div>
    )
  }
  
  // Handle empty state (xử lý trạng thái rỗng)
  if (!data) {
    return <div>Lesson not found (Không tìm thấy bài học)</div>
  }
  
  // Render success state (hiển thị trạng thái thành công)
  return <div>{data.title}</div>
}
```

### 7. Form Handling (Xử lý biểu mẫu)

```typescript
// ALWAYS use controlled components (luôn dùng controlled components)
// với validation (kiểm tra)

import { useState } from 'react'
import { z } from 'zod'

const lessonSchema = z.object({
  title: z.string().min(1, 'Title required (Tiêu đề bắt buộc)'),
  content: z.string().min(10, 'Content too short (Nội dung quá ngắn)'),
  level: z.enum(['A1', 'A2', 'B1', 'B2'])
})

function LessonForm() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    level: 'A1'
  })
  const [errors, setErrors] = useState({})
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate (kiểm tra)
    const result = lessonSchema.safeParse(formData)
    
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors)
      return
    }
    
    // Submit (gửi)
    await createLesson(result.data)
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
      />
      {errors.title && <span className="text-red-500">{errors.title}</span>}
      {/* ... */}
    </form>
  )
}
```

## ❌ **NEVER DO (KHÔNG BAO GIỜ LÀM)**

### 1. Performance Anti-patterns (Mẫu chống hiệu suất)

```typescript
// ❌ NEVER fetch trong component body (không fetch trong thân component)
function BadComponent() {
  fetch('/api/data') // WRONG! Causes infinite loop (vòng lặp vô hạn)
  return <div>Bad</div>
}

// ✅ DO THIS - Use React Query hoặc useEffect
function GoodComponent() {
  const { data } = useQuery({ 
    queryKey: ['data'], 
    queryFn: () => fetch('/api/data').then(r => r.json()) 
  })
  return <div>Good</div>
}

// ❌ NEVER inline object/array trong dependency array
useEffect(() => {
  // ...
}, [{ id: userId }]) // WRONG! New object every render (đối tượng mới mỗi lần render)

// ✅ DO THIS
useEffect(() => {
  // ...
}, [userId]) // CORRECT (đúng)
```

### 2. Prop Drilling (Truyền props sâu)

```typescript
// ❌ BAD - Passing props (truyền props) qua nhiều levels
<Parent>
  <Child user={user}>
    <GrandChild user={user}>
      <GreatGrandChild user={user} />
    </GrandChild>
  </Child>
</Parent>

// ✅ GOOD - Use React Context cho shared data (dữ liệu chia sẻ)
const UserContext = createContext<User | null>(null)

<UserContext.Provider value={user}>
  <Parent>
    <Child>
      <GrandChild>
        <GreatGrandChild /> {/* useContext(UserContext) inside */}
      </GrandChild>
    </Child>
  </Parent>
</UserContext.Provider>
```

### 3. Direct DOM Manipulation (Thao tác DOM trực tiếp)

```typescript
// ❌ NEVER use document.getElementById, jQuery, etc.
function BadComponent() {
  document.getElementById('myDiv').innerHTML = 'Bad' // WRONG!
}

// ✅ DO THIS - Use React refs
function GoodComponent() {
  const divRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (divRef.current) {
      divRef.current.textContent = 'Good'
    }
  }, [])
  
  return <div ref={divRef} />
}
```

## 🎨 **Styling với TailwindCSS**

```typescript
// ALWAYS use Tailwind classes (luôn dùng Tailwind classes)
// ✅ GOOD
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-bold text-gray-900">{title}</h2>
</div>

// Use cn() utility cho conditional classes (classes có điều kiện)
import { cn } from '@/lib/utils'

<button 
  className={cn(
    "px-4 py-2 rounded-md",
    isActive ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700",
    disabled && "opacity-50 cursor-not-allowed"
  )}
>
  Click me
</button>

// AVOID inline styles (tránh inline styles) unless necessary (trừ khi cần)
<div style={{ color: 'red' }}> {/* ❌ BAD */}
<div className="text-red-500"> {/* ✅ GOOD */}
```

## 🧩 **Component Composition (Tổng hợp Component)**

```typescript
// PREFER composition over props (ưu tiên composition hơn props)

// ❌ BAD - Too many props (quá nhiều props)
<Card 
  title="Title"
  subtitle="Subtitle"
  showIcon={true}
  iconType="star"
  iconColor="yellow"
  footer={<Button />}
/>

// ✅ GOOD - Composition pattern
<Card>
  <Card.Header>
    <Card.Icon type="star" color="yellow" />
    <Card.Title>Title</Card.Title>
    <Card.Subtitle>Subtitle</Card.Subtitle>
  </Card.Header>
  <Card.Footer>
    <Button />
  </Card.Footer>
</Card>
```

## 📱 **Responsive Design (Thiết kế responsive)**

```typescript
// ALWAYS design mobile-first (luôn thiết kế mobile-first)
<div className="
  w-full        // Mobile: full width (chiều rộng đầy)
  md:w-1/2      // Tablet: half width (nửa chiều rộng)
  lg:w-1/3      // Desktop: third width (một phần ba)
  p-4           // Mobile: padding 4
  md:p-6        // Tablet: padding 6
  lg:p-8        // Desktop: padding 8
">
  Content
</div>

// Test responsive trong browser DevTools (công cụ dev trình duyệt)
// Breakpoints: sm(640px), md(768px), lg(1024px), xl(1280px)
```

## ♿ **Accessibility (Khả năng truy cập)**

```typescript
// ALWAYS add proper ARIA labels (luôn thêm ARIA labels đúng)
<button 
  aria-label="Close dialog (Đóng hộp thoại)"
  onClick={onClose}
>
  <XIcon />
</button>

// Use semantic HTML (HTML ngữ nghĩa)
<nav> {/* Not <div> for navigation (không dùng <div> cho điều hướng) */}
<main> {/* Not <div> for main content */}
<article> {/* Not <div> for articles */}

// Keyboard navigation (điều hướng bàn phím)
<div 
  role="button"
  tabIndex={0}
  onKeyDown={(e) => e.key === 'Enter' && onClick()}
>
```

## 🧪 **Testing (Kiểm thử)**

```typescript
// ALWAYS write tests cho critical components (components quan trọng)
import { render, screen, fireEvent } from '@testing-library/react'

describe('VocabularyCard', () => {
  it('should flip when clicked (nên lật khi click)', () => {
    render(<VocabularyCard word="Hallo" translation="Hello" />)
    
    const card = screen.getByRole('button')
    expect(card).toHaveTextContent('Hallo')
    
    fireEvent.click(card)
    expect(card).toHaveTextContent('Hello')
  })
})
```

## 📝 **Code Organization (Tổ chức code)**

```
components/
├── ui/                    # Base components (shadcn/ui)
├── vocabulary/            # Domain-specific (theo lĩnh vực)
│   ├── VocabularyCard.tsx
│   ├── VocabularyList.tsx
│   └── index.ts           # Export all (xuất tất cả)
└── shared/                # Shared components (components dùng chung)
    ├── LoadingSpinner.tsx
    └── ErrorMessage.tsx
```

---

**Remember (Nhớ rằng):** React components là building blocks (khối xây dựng) của UI. Type safety (an toàn kiểu), proper state management (quản lý state đúng), và good UX (trải nghiệm người dùng tốt) là CRITICAL (QUAN TRỌNG NHẤT)!
