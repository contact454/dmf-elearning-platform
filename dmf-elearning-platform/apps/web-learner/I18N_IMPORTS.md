# i18n Import Cheatsheet

Quick reference for all i18n-related imports you'll need.

---

## 🎯 Most Common Imports

### For Components (Client-side)
```tsx
'use client';
import { useTranslations } from 'next-intl';
import { Link, useRouter, usePathname } from '@/i18n/routing';
import { useLocale } from 'next-intl';
```

### For Server Components
```tsx
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
```

---

## 📖 Detailed Import Guide

### 1. Translations Hook (Client Components)
```tsx
'use client';
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('namespace');
  return <h1>{t('title')}</h1>;
}
```

### 2. Navigation Components
```tsx
import { Link } from '@/i18n/routing';

<Link href="/dashboard">Dashboard</Link>
// Auto becomes /en/dashboard or /de/dashboard
```

### 3. Router Hook (Client Components)
```tsx
'use client';
import { useRouter } from '@/i18n/routing';

export function MyComponent() {
  const router = useRouter();
  
  const handleClick = () => {
    router.push('/profile');
  };
  
  return <button onClick={handleClick}>Go</button>;
}
```

### 4. Pathname Hook (Client Components)
```tsx
'use client';
import { usePathname } from '@/i18n/routing';

export function MyComponent() {
  const pathname = usePathname();
  // Returns '/dashboard' (without locale prefix)
  
  return <p>Current path: {pathname}</p>;
}
```

### 5. Locale Hook (Client Components)
```tsx
'use client';
import { useLocale } from 'next-intl';

export function MyComponent() {
  const locale = useLocale(); // 'en' or 'de'
  
  return <p>Current locale: {locale}</p>;
}
```

### 6. Server-side Translations
```tsx
import { getTranslations } from 'next-intl/server';

export default async function ServerComponent() {
  const t = await getTranslations('namespace');
  
  return <h1>{t('title')}</h1>;
}
```

### 7. Language Switcher Component
```tsx
import { LanguageSwitcher } from '@/components/ui/language-switcher';

<LanguageSwitcher />
```

### 8. Redirect (Server Actions)
```tsx
import { redirect } from '@/i18n/routing';

export async function serverAction() {
  redirect('/dashboard');
}
```

---

## 🔧 Configuration Imports

### Routing Config
```tsx
// src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';
```

### Request Config
```tsx
// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
```

### Middleware
```tsx
// middleware.ts
import createMiddleware from 'next-intl/middleware';
```

### Next Config
```tsx
// next.config.ts
import createNextIntlPlugin from 'next-intl/plugin';
```

---

## 📝 Import Templates by File Type

### Client Component Template
```tsx
'use client';

import { useTranslations } from 'next-intl';
import { Link, useRouter, usePathname } from '@/i18n/routing';
import { useLocale } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('namespace');
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <Link href="/dashboard">{t('dashboard')}</Link>
      <p>Path: {pathname}</p>
      <p>Locale: {locale}</p>
    </div>
  );
}
```

### Server Component Template
```tsx
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

export default async function MyServerComponent() {
  const t = await getTranslations('namespace');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <Link href="/dashboard">{t('dashboard')}</Link>
    </div>
  );
}
```

### Page Template
```tsx
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations('namespace');
  
  return (
    <main>
      <h1>{t('title')}</h1>
    </main>
  );
}
```

---

## ❌ Common Mistakes

### DON'T use these imports:
```tsx
// ❌ WRONG - Regular Next.js imports
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { redirect } from 'next/navigation';
```

### DO use these instead:
```tsx
// ✅ CORRECT - i18n-aware imports
import { Link, useRouter, usePathname, redirect } from '@/i18n/routing';
```

---

## 🎨 Advanced Patterns

### Multiple Namespaces
```tsx
'use client';
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('hero');
  const tCommon = useTranslations('common');
  const tNav = useTranslations('navigation');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <button>{tCommon('signup')}</button>
      <nav>{tNav('home')}</nav>
    </div>
  );
}
```

### With Rich Text
```tsx
'use client';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export function MyComponent() {
  const t = useTranslations('legal');
  
  return (
    <p>
      {t.rich('terms', {
        link: (chunks) => <Link href="/terms">{chunks}</Link>
      })}
    </p>
  );
}
```

### With Dynamic Values
```tsx
'use client';
import { useTranslations } from 'next-intl';

export function MyComponent({ userName }: { userName: string }) {
  const t = useTranslations('welcome');
  
  // Translation: "Hello, {name}!"
  return <h1>{t('greeting', { name: userName })}</h1>;
}
```

---

## 🔍 Import Path Reference

| Import | Path |
|--------|------|
| useTranslations | next-intl |
| useLocale | next-intl |
| getTranslations | next-intl/server |
| Link | @/i18n/routing |
| useRouter | @/i18n/routing |
| usePathname | @/i18n/routing |
| redirect | @/i18n/routing |
| LanguageSwitcher | @/components/ui/language-switcher |
| routing | @/i18n/routing |

---

## 📋 Checklist for New Components

When creating a new component:

- [ ] Add `'use client'` if using hooks
- [ ] Import `useTranslations` from `next-intl`
- [ ] Import `Link` from `@/i18n/routing` (not `next/link`)
- [ ] Import router/pathname from `@/i18n/routing` (not `next/navigation`)
- [ ] Add translations to `messages/en.json`
- [ ] Add translations to `messages/de.json`
- [ ] Test in both `/en` and `/de` routes

---

## 🚀 Quick Copy-Paste

### Minimal Client Component
```tsx
'use client';
import { useTranslations } from 'next-intl';

export function Component() {
  const t = useTranslations('namespace');
  return <div>{t('key')}</div>;
}
```

### Minimal Server Component
```tsx
import { getTranslations } from 'next-intl/server';

export default async function Component() {
  const t = await getTranslations('namespace');
  return <div>{t('key')}</div>;
}
```

### With Navigation
```tsx
'use client';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export function Component() {
  const t = useTranslations('nav');
  return <Link href="/page">{t('link')}</Link>;
}
```

---

## 📚 Resources

- Full docs: `I18N_IMPLEMENTATION.md`
- Quick ref: `I18N_QUICK_REF.md`
- Examples: `I18N_BEFORE_AFTER.md`
- Checklist: `I18N_CHECKLIST.md`

---

**Bookmark this page for quick reference!** 📌
