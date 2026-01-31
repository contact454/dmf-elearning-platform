# Shared Types Guidelines
## Quy chuẩn Types Dùng Chung

This document defines the standards and conventions for using shared TypeScript types in the DMF E-Learning Platform.

---

## 1. Purpose / Mục đích

The `@dmf/shared` package provides a single source of truth for TypeScript type definitions used across the entire platform. These types ensure:

- **Type Safety**: Consistent data shapes across services, apps, and APIs
- **Contract Alignment**: Types mirror the JSON schemas in `contracts/schemas/`
- **Developer Experience**: Autocomplete and compile-time validation
- **Maintainability**: Changes to data structures are centralized

**Why shared types exist**: To prevent type drift between services and ensure all codebases use identical type definitions for domain entities and API contracts.

---

## 2. Public Import Rule / Quy tắc Import

### ✅ CORRECT - Import from package root

```typescript
import { User, UserId, UserRole, CreateAttemptInput } from '@dmf/shared';
```

### ❌ WRONG - Deep imports are forbidden

```typescript
// DO NOT DO THIS
import { User } from '@dmf/shared/src/entities';
import { UserId } from '@dmf/shared/src/ids';
```

**Rule**: All consumers MUST import types ONLY from `@dmf/shared`. The package's `src/index.ts` re-exports all public types. Deep imports break encapsulation and make refactoring difficult.

---

## 3. Entity vs DTO Rule / Phân biệt Entity vs DTO

### Entities (`src/entities/`)

**What belongs here**: Domain entities that represent persistent data structures in the system.

- **Purpose**: Shape of data stored/retrieved from databases or internal state
- **Examples**: `User`, `Course`, `Lesson`, `Attempt`, `Submission`, `Assessment`
- **Characteristics**:
  - Represent domain concepts
  - May include computed/derived fields
  - Used for internal service-to-service communication
  - Aligned with `contracts/schemas/*.schema.json`

### DTOs / Contracts (`src/contracts/`)

**What belongs here**: Data Transfer Objects for API input/output and event payloads.

- **Purpose**: Shape of data sent/received between client ↔ API or service ↔ service
- **Examples**: `CreateAttemptInput`, `SubmitSpeakingInput`, `UpdateProgressEvent`
- **Characteristics**:
  - Represent API contracts
  - Often subset or transformation of entities
  - Used for external boundaries (HTTP requests, events)
  - May include validation hints

**Decision Rule**: If it's sent over HTTP or events → `contracts/`. If it's stored/queried internally → `entities/`.

---

## 4. Naming Conventions / Quy ước Đặt Tên

### ID Types

```typescript
export type UserId = string;
export type LessonId = string;
export type AttemptId = string;
```

**Pattern**: `{EntityName}Id` → `string` alias  
**Location**: `src/ids/index.ts`

### Enums

```typescript
export enum UserRole {
    LEARNER = 'learner',
    TEACHER = 'teacher',
    MENTOR = 'mentor',
    ADMIN = 'admin',
}
```

**Pattern**: PascalCase enum name, UPPER_SNAKE_CASE keys, lowercase string values  
**Location**: `src/enums/index.ts`

### Interfaces

```typescript
export interface User {
    id: UserId;
    email: string;
    role: UserRole;
}
```

**Pattern**: PascalCase interface name  
**Location**: `src/entities/index.ts` or `src/contracts/index.ts`

---

## 5. Optional vs Required Rule / Quy tắc Optional/Required

### Source of Truth

The `required` array in `contracts/schemas/*.schema.json` determines which fields are mandatory.

### Rule

- **Fields in schema `required` array** → Required in TypeScript interface (no `?`)
- **Fields NOT in schema `required` array** → Optional in TypeScript interface (with `?`)

### Example

**Schema** (`contracts/schemas/user.schema.json`):
```json
{
  "required": ["id", "email", "role"],
  "properties": {
    "id": { "type": "string" },
    "email": { "type": "string" },
    "firstName": { "type": "string" }
  }
}
```

**TypeScript** (`packages/shared/src/entities/index.ts`):
```typescript
export interface User {
    id: UserId;           // Required (in schema required)
    email: string;         // Required (in schema required)
    role: UserRole;       // Required (in schema required)
    firstName?: string;    // Optional (NOT in schema required)
}
```

**Critical**: Any mismatch between schema `required` and TypeScript optionality is a bug. Always verify against the schema.

---

## 6. Change Policy / Chính sách Thay đổi

### ⚠️ FREEZE STATUS

**Shared types are FROZEN** as of the completion of Step 1. This means:

- Types are stable and should not change arbitrarily
- Breaking changes require explicit approval and coordination
- All changes must be traceable and documented

### Change Workflow

1. **Schema First**: If a data structure change is needed, update `contracts/schemas/*.schema.json` first
2. **Then Types**: After schema approval, update `packages/shared/src/**` to match
3. **Document**: Update this guidelines doc if conventions change
4. **Verify**: Run type checks across all consumers

### Breaking Changes

A breaking change is any modification that:
- Removes a field
- Changes a field type (e.g., `string` → `number`)
- Makes a required field optional (or vice versa) without schema alignment
- Renames a field or type

**Process**: Breaking changes require:
1. Update `contracts/schemas/`
2. Update `packages/shared/`
3. Update all consumers in a coordinated release
4. Document in `task.md` and release notes

---

## 7. Glossary / Từ điển Mini

### English → Vietnamese

| Term | Vietnamese | Definition |
|------|------------|------------|
| **Entity** | Thực thể | A data structure representing a domain concept (User, Course, Lesson) |
| **DTO** | Dữ liệu trung gian | Data Transfer Object - shape of data sent/received via APIs |
| **Contract/Schema** | Hợp đồng dữ liệu | JSON Schema definition in `contracts/schemas/` - the source of truth |
| **Source of Truth** | Nguồn dữ liệu gốc | The authoritative definition (schemas) that all types must align with |
| **Runtime state** | Trạng thái khi chạy | Data in memory during application execution |
| **Static content** | Nội dung tĩnh | Immutable content files (e.g., lesson content in `data/content/`) |
| **Optional field** | Trường có thể không có | A field that may be absent (marked with `?` in TypeScript) |
| **Required field** | Trường bắt buộc | A field that must always be present (no `?` in TypeScript) |

---

## 8. Verification Checklist

Before using or modifying shared types:

- [ ] Import from `@dmf/shared` only (no deep imports)
- [ ] Verify field optionality matches `contracts/schemas/*.schema.json` `required` array
- [ ] Use correct ID types (`UserId`, not `string`)
- [ ] Use correct enum types (`UserRole`, not string literals)
- [ ] Entities for domain data, DTOs for API boundaries
- [ ] No invented fields (all fields must exist in schemas)

---

## 9. Examples

### ✅ Good: Using Shared Types

```typescript
import { User, UserId, CreateAttemptInput, AttemptStatus } from '@dmf/shared';

function createAttempt(input: CreateAttemptInput): Promise<Attempt> {
    // Implementation
}

function getUser(id: UserId): User {
    // Implementation
}
```

### ❌ Bad: Not Using Shared Types

```typescript
// Don't define your own types
interface MyUser {
    id: string;  // Should use UserId
    email: string;
}

// Don't use deep imports
import { User } from '@dmf/shared/src/entities';
```

---

**Last Updated**: 2024-12-19  
**Status**: ✅ FROZEN - Types are stable and aligned with schemas
