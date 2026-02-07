# i18n Quick Reference Card

## 🚀 Quick Start

### 1. Import translations in component
```tsx
'use client';
import { useTranslations } from 'next-intl';

const t = useTranslations('namespace');
```

### 2. Use translations
```tsx
<h1>{t('title')}</h1>
<p>{t('description')}</p>
<button>{t('cta.action')}</button>
```

### 3. Use locale-aware navigation
```tsx
import { Link } from '@/i18n/routing';

<Link href="/dashboard">Dashboard</Link>
// Auto becomes /en/dashboard or /de/dashboard
```

---

## 📖 Common Patterns

### Single namespace
```tsx
const t = useTranslations('hero');
return <h1>{t('title')}</h1>;
```

### Multiple namespaces
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

### Dynamic values
```tsx
// In messages/en.json:
// "welcome": "Welcome, {name}!"

{t('welcome', { name: user.name })}
// → "Welcome, John!"
```

### Pluralization
```tsx
// In messages/en.json:
// "items": "{count, plural, =0 {No items} one {# item} other {# items}}"

{t('items', { count: 5 })}
// → "5 items"
```

### Rich text
```tsx
// In messages/en.json:
// "terms": "I agree to the <link>terms</link>"

{t.rich('terms', {
  link: (chunks) => <Link href="/terms">{chunks}</Link>
})}
```

---

## 🔗 Navigation

### Link component
```tsx
import { Link } from '@/i18n/routing';

<Link href="/profile">Profile</Link>
```

### Router
```tsx
import { useRouter } from '@/i18n/routing';

const router = useRouter();
router.push('/dashboard');
router.replace('/login');
```

### Pathname
```tsx
import { usePathname } from '@/i18n/routing';

const pathname = usePathname();
// Returns '/dashboard' (without locale prefix)
```

### Locale
```tsx
import { useLocale } from 'next-intl';

const locale = useLocale(); // 'en' or 'de'
```

---

## 📝 Adding Translations

### 1. Add to messages/en.json
```json
{
  "myFeature": {
    "title": "My Feature",
    "subtitle": "Description here",
    "cta": "Click me"
  }
}
```

### 2. Add to messages/de.json
```json
{
  "myFeature": {
    "title": "Meine Funktion",
    "subtitle": "Beschreibung hier",
    "cta": "Klick mich"
  }
}
```

### 3. Use in component
```tsx
const t = useTranslations('myFeature');

<div>
  <h1>{t('title')}</h1>
  <p>{t('subtitle')}</p>
  <button>{t('cta')}</button>
</div>
```

---

## 🗂️ Namespaces

| Namespace | Purpose | Example Keys |
|-----------|---------|--------------|
| common | UI elements | login, signup, cancel, save |
| navigation | Menu items | home, dashboard, profile |
| hero | Hero section | title, subtitle, cta |
| practice | Practice modules | vocabulary, reading, listening |
| challenges | Daily challenges | currentStreak, completedToday |
| leaderboard | Rankings | rank, points, level |
| achievements | Achievements | unlocked, locked, progress |
| analytics | Analytics | studyTime, accuracy |
| profile | User profile | bio, learningGoals |
| auth | Authentication | email, password, forgotPassword |
| errors | Error messages | generic, networkError |
| footer | Footer | about, contact, privacy |

---

## 🎨 Language Switcher

### Add to component
```tsx
import { LanguageSwitcher } from '@/components/ui/language-switcher';

<LanguageSwitcher />
```

---

## 🔍 Type Safety

### Autocomplete
Start typing `t('` and your IDE will show all available keys.

### Compile errors
```tsx
{t('invalidKey')} // ❌ TypeScript error
{t('title')}      // ✅ Valid
```

---

## 🌐 URL Structure

```
/                    → Redirects to /en
/en                  → English
/de                  → German
/en/dashboard        → English dashboard
/de/dashboard        → German dashboard
```

---

## 🧪 Testing

```bash
# Development
pnpm dev

# Visit both languages
http://localhost:3000/en
http://localhost:3000/de

# Test language switching
Click language switcher → verify URL and content change
```

---

## 🐛 Troubleshooting

### Missing translation
**Error:** Key not found  
**Fix:** Add key to both en.json and de.json

### Wrong import
**Error:** Link doesn't preserve locale  
**Fix:** Import from `@/i18n/routing`, not `next/link`

### Hydration error
**Error:** Text mismatch  
**Fix:** Use 'use client' directive

---

## 📚 Resources

- Full guide: `I18N_IMPLEMENTATION.md`
- Checklist: `I18N_CHECKLIST.md`
- Examples: `I18N_BEFORE_AFTER.md`
- Docs: https://next-intl-docs.vercel.app/

---

## ⚡ Quick Commands

```bash
# Add package
pnpm add next-intl

# Build
pnpm build

# Dev server
pnpm dev
```

---

## 🎯 Migration Quick Steps

1. Extract strings → add to messages/*.json
2. Import: `import { Link } from '@/i18n/routing'`
3. Import: `import { useTranslations } from 'next-intl'`
4. Add hook: `const t = useTranslations('namespace')`
5. Replace strings: `{t('key')}`
6. Test: Visit /en/* and /de/*

---

**Keep this card handy while migrating components!** 📌
