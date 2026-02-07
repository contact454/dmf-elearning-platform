# i18n Implementation Guide

## Overview
Multi-language support for DMF E-Learning Platform using `next-intl` with German (DE) and English (EN) locales.

## Tech Stack
- **next-intl** v4.8.2 - Type-safe internationalization for Next.js
- **Supported Languages**: English (en), German (de)
- **Default Language**: English (en)

## Directory Structure

```
apps/web-learner/
├── messages/
│   ├── en.json          # English translations
│   └── de.json          # German translations
├── src/
│   ├── i18n/
│   │   ├── request.ts   # i18n configuration
│   │   └── routing.ts   # Routing configuration
│   ├── app/
│   │   ├── [locale]/    # Locale-based routes
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── ... (all pages)
│   │   ├── layout.tsx   # Root layout (minimal)
│   │   └── page.tsx     # Redirect to default locale
│   ├── components/
│   │   └── ui/
│   │       └── language-switcher.tsx
│   └── types/
│       └── i18n.d.ts    # TypeScript definitions
├── middleware.ts        # next-intl middleware
└── next.config.ts       # Next.js config with i18n plugin
```

## Key Files

### 1. Translation Files (`messages/*.json`)
JSON files containing all UI strings organized by namespace:

**Structure:**
```json
{
  "common": { ... },      // Common UI elements
  "navigation": { ... },  // Navigation items
  "hero": { ... },        // Hero section
  "practice": { ... },    // Practice modules
  "challenges": { ... },  // Daily challenges
  "leaderboard": { ... }, // Leaderboard
  "achievements": { ... },// Achievements
  "analytics": { ... },   // Analytics
  "profile": { ... },     // User profile
  "auth": { ... },        // Authentication
  "errors": { ... },      // Error messages
  "footer": { ... }       // Footer
}
```

### 2. i18n Configuration (`src/i18n/request.ts`)
Loads the appropriate messages for each locale.

### 3. Routing Configuration (`src/i18n/routing.ts`)
Defines supported locales and exports type-safe navigation utilities:
- `Link` - Locale-aware Link component
- `redirect` - Locale-aware redirect
- `usePathname` - Hook for current pathname
- `useRouter` - Locale-aware router

### 4. Middleware (`middleware.ts`)
Handles locale detection and URL prefix management.

### 5. Next.js Config (`next.config.ts`)
Integrates next-intl plugin.

## Usage

### In Components

```tsx
'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export function MyComponent() {
  const t = useTranslations('navigation');
  
  return (
    <div>
      <h1>{t('home')}</h1>
      <Link href="/dashboard">{t('dashboard')}</Link>
    </div>
  );
}
```

### Multiple Namespaces

```tsx
const t = useTranslations('hero');
const tCommon = useTranslations('common');

return (
  <div>
    <h1>{t('title')}</h1>
    <button>{tCommon('signup')}</button>
  </div>
);
```

### Language Switcher Component

The `<LanguageSwitcher />` component is available for easy language switching:

```tsx
import { LanguageSwitcher } from '@/components/ui/language-switcher';

<LanguageSwitcher />
```

### Type-Safe Navigation

Always use the exported navigation utilities from `@/i18n/routing`:

```tsx
import { Link, useRouter, usePathname } from '@/i18n/routing';

// Link component
<Link href="/dashboard">Dashboard</Link>

// Programmatic navigation
const router = useRouter();
router.push('/profile');

// Get current pathname (without locale prefix)
const pathname = usePathname();
```

## URL Structure

All routes are prefixed with the locale:

- `/en/dashboard` - English dashboard
- `/de/dashboard` - German dashboard
- `/en/practice/vocabulary` - English vocabulary practice
- `/de/practice/vocabulary` - German vocabulary practice

Root URL (`/`) redirects to default locale (`/en`).

## Adding New Translations

1. **Add keys to translation files:**
   ```json
   // messages/en.json
   {
     "myFeature": {
       "title": "My Feature",
       "description": "Description here"
     }
   }
   
   // messages/de.json
   {
     "myFeature": {
       "title": "Meine Funktion",
       "description": "Beschreibung hier"
     }
   }
   ```

2. **Use in component:**
   ```tsx
   const t = useTranslations('myFeature');
   <h1>{t('title')}</h1>
   ```

## Type Safety

TypeScript automatically infers translation keys from `messages/en.json`. You'll get:
- Autocomplete for translation keys
- Type errors for missing keys
- Compile-time validation

## Migration Checklist

When migrating existing components:

- [ ] Replace `next/link` with `@/i18n/routing` Link
- [ ] Replace `next/navigation` hooks with `@/i18n/routing` hooks
- [ ] Extract hardcoded strings to translation files
- [ ] Add `useTranslations()` hook
- [ ] Test in both languages

## Language Coverage

### ✅ Completed Components
- [x] Navbar (with language switcher)
- [x] HeroSection
- [x] Footer
- [x] LanguageSwitcher

### 🔄 Components to Update
- [ ] BentoGrid
- [ ] CourseShowcase
- [ ] AISenseiDemo
- [ ] SocialProof
- [ ] CTASection
- [ ] Practice modules (vocabulary, reading, listening, speaking, writing, grammar)
- [ ] Dashboard components
- [ ] Authentication pages
- [ ] Profile pages
- [ ] Leaderboard
- [ ] Achievements
- [ ] Analytics

## Testing

Test both languages:

```bash
# Development server
pnpm dev

# Visit:
# http://localhost:3000/en
# http://localhost:3000/de
```

Switch languages using the language switcher in the navbar.

## Best Practices

1. **Organize by namespace** - Group related translations
2. **Use descriptive keys** - `hero.cta.tryFree` not `button1`
3. **Keep translations consistent** - Use same structure in all language files
4. **Avoid hardcoded strings** - Always use translation keys
5. **Type safety** - Let TypeScript catch missing translations
6. **Context matters** - Add context in comments for translators

## Future Enhancements

- [ ] Add Vietnamese (vi) support
- [ ] Implement RTL support for Arabic/Hebrew
- [ ] Add translation management platform integration (e.g., Crowdin)
- [ ] Server-side translation caching
- [ ] Language detection based on browser preferences
- [ ] Per-user language preference storage

## References

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Next.js i18n Routing](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
