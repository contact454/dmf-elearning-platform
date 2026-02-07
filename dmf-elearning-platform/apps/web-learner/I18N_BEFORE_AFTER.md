# i18n Migration Example: Before & After

## Component: HeroSection

### ❌ BEFORE (Hardcoded Vietnamese)

```tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import NumberTicker from '@/components/ui/number-ticker';
import { Sparkles, BookOpen } from 'lucide-react';

const stats = [
  { value: 15000, label: 'Từ vựng', suffix: '+' },
  { value: 500, label: 'Bài học', suffix: '+' },
  { value: 24, label: 'AI Hỗ trợ', suffix: '/7' },
];

export function HeroSection() {
  return (
    <section>
      <motion.div>
        <Sparkles />
        Chuẩn Goethe A1-C2
      </motion.div>

      <motion.h1>
        Làm Chủ{' '}
        <span>Tiếng Đức</span>
        <br />
        <span>Từ A1 đến C2</span>
      </motion.h1>

      <motion.p>
        Học thông minh với AI Sensei, Flashcards thông minh và Quiz thích ứng.
      </motion.p>

      <Link href="/auth/login">
        <Sparkles />
        Học Thử Miễn Phí
      </Link>

      <Link href="/learn/german">
        <BookOpen />
        Xem Khoá Học
      </Link>
    </section>
  );
}
```

**Problems:**
- ❌ Vietnamese text hardcoded
- ❌ Cannot switch languages
- ❌ Not type-safe
- ❌ No SEO for other languages
- ❌ Using regular Link (no locale awareness)

---

### ✅ AFTER (i18n with next-intl)

```tsx
'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import NumberTicker from '@/components/ui/number-ticker';
import { Sparkles, BookOpen } from 'lucide-react';

export function HeroSection() {
  const t = useTranslations('hero');
  
  const stats = [
    { value: 15000, label: t('stats.vocabulary'), suffix: '+' },
    { value: 500, label: t('stats.lessons'), suffix: '+' },
    { value: 24, label: t('stats.aiSupport'), suffix: '/7' },
  ];

  return (
    <section>
      <motion.div>
        <Sparkles />
        {t('badge')}
      </motion.div>

      <motion.h1>
        {t('title')}{' '}
        <span>{t('titleHighlight')}</span>
        <br />
        <span>{t('subtitle')}</span>
      </motion.h1>

      <motion.p>
        {t('description')}
      </motion.p>

      <Link href="/auth/login">
        <Sparkles />
        {t('cta.tryFree')}
      </Link>

      <Link href="/learn/german">
        <BookOpen />
        {t('cta.viewCourses')}
      </Link>
    </section>
  );
}
```

**Benefits:**
- ✅ Supports English & German
- ✅ Type-safe translation keys
- ✅ Auto-complete in IDE
- ✅ Locale-aware links
- ✅ SEO-friendly URLs
- ✅ Easy to add more languages

---

## Translation Files

### messages/en.json
```json
{
  "hero": {
    "badge": "Goethe Standard A1-C2",
    "title": "Master",
    "titleHighlight": "German",
    "subtitle": "From A1 to C2",
    "description": "Learn smartly with AI Sensei, intelligent Flashcards, and adaptive Quizzes.",
    "stats": {
      "vocabulary": "Vocabulary",
      "lessons": "Lessons",
      "aiSupport": "AI Support"
    },
    "cta": {
      "tryFree": "Try Free",
      "viewCourses": "View Courses"
    }
  }
}
```

### messages/de.json
```json
{
  "hero": {
    "badge": "Goethe-Standard A1-C2",
    "title": "Beherrsche",
    "titleHighlight": "Deutsch",
    "subtitle": "Von A1 bis C2",
    "description": "Lerne intelligent mit KI-Sensei, intelligenten Karteikarten und adaptiven Quiz.",
    "stats": {
      "vocabulary": "Vokabeln",
      "lessons": "Lektionen",
      "aiSupport": "KI-Support"
    },
    "cta": {
      "tryFree": "Kostenlos testen",
      "viewCourses": "Kurse ansehen"
    }
  }
}
```

---

## URL Structure

### Before:
```
/                    → Vietnamese only
/auth/login          → Vietnamese only
/learn/german        → Vietnamese only
```

### After:
```
/                    → Redirects to /en
/en                  → English homepage
/de                  → German homepage
/en/auth/login       → English login
/de/auth/login       → German login
/en/learn/german     → English course page
/de/learn/german     → German course page
```

---

## Language Switching

### User clicks 🇬🇧 → 🇩🇪

**Current URL:** `/en/learn/german`

**After switch:** `/de/learn/german`

✅ **Same page, different language!**

---

## Type Safety

### IDE Autocomplete

When you type `t('`, your IDE shows:
```
badge
title
titleHighlight
subtitle
description
stats.vocabulary
stats.lessons
stats.aiSupport
cta.tryFree
cta.viewCourses
```

### Compile-time Errors

```tsx
// ❌ TypeScript error - invalid key
{t('invalidKey')}

// ✅ Valid - autocompleted
{t('title')}
```

---

## Migration Checklist

For any component:

1. **Add translations to JSON files**
   - [ ] messages/en.json
   - [ ] messages/de.json

2. **Update imports**
   ```tsx
   // ❌ Before
   import Link from 'next/link';
   
   // ✅ After
   import { Link } from '@/i18n/routing';
   import { useTranslations } from 'next-intl';
   ```

3. **Add translation hook**
   ```tsx
   const t = useTranslations('namespace');
   ```

4. **Replace hardcoded strings**
   ```tsx
   // ❌ Before
   <h1>Làm Chủ Tiếng Đức</h1>
   
   // ✅ After
   <h1>{t('title')} {t('titleHighlight')}</h1>
   ```

5. **Test both languages**
   - [ ] Visit /en/page
   - [ ] Visit /de/page
   - [ ] Switch languages
   - [ ] Verify text

---

## Performance Impact

**Bundle Size:**
- next-intl: ~50KB gzipped
- Translation files: ~12KB total (both languages)
- **Total overhead: ~62KB** ✅ Minimal!

**Runtime:**
- No performance impact
- Translations loaded per route
- Automatic code splitting

---

## SEO Benefits

### Before:
```html
<html lang="vi">
  <title>DMF German Learning - Học Tiếng Đức</title>
</html>
```

### After (English):
```html
<html lang="en">
  <title>DMF German Learning - Learn German Intelligently</title>
</html>
```

### After (German):
```html
<html lang="de">
  <title>DMF Deutsch Lernen - Deutsch intelligent lernen</title>
</html>
```

✅ **Google indexes both languages separately!**

---

## Developer Experience

### Before:
- Change text → Edit JSX file
- Add language → Impossible
- Find strings → Search entire codebase
- Translator access → Need code access

### After:
- Change text → Edit JSON file
- Add language → Create new JSON file
- Find strings → Check messages/*.json
- Translator access → Just JSON files

---

## Summary

| Aspect | Before | After |
|--------|--------|-------|
| Languages | 1 (Vietnamese) | 2+ (EN, DE, ...) |
| Type Safety | ❌ None | ✅ Full |
| SEO | ❌ Single language | ✅ Multi-language |
| Maintenance | ❌ Hard | ✅ Easy |
| Translation | ❌ Code access needed | ✅ JSON only |
| Performance | ✅ Fast | ✅ Still fast |
| Bundle Size | - | +62KB |

**Overall: Massive improvement! 🎉**

---

**Ready to migrate more components?**

Follow this pattern for all remaining components. See `I18N_CHECKLIST.md` for the full list.
