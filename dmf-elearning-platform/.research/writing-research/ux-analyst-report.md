# UX Analyst Report: Writing Interface & Experience Design

**Research Area**: Writing Editor UI/UX, Feedback Patterns, Progress Tracking  
**Date**: February 7, 2026  
**Analyst**: UX Analyst Team

## Executive Summary

After analyzing leading writing tools and educational platforms, the **recommended UX approach** combines:

1. **Distraction-free editor** (focus mode for writing)
2. **Inline error highlighting** (underlines à la Grammarly)
3. **Side panel** for detailed feedback and explanations
4. **Progress dashboard** with gamification (streaks, achievements)
5. **Mobile-first responsive design** (80% of learners use mobile)
6. **Accessibility compliance** (WCAG 2.1 AA standard)

**Key Insight**: Writers need **three modes**:
- **Write Mode**: Minimal distractions, focus on creation
- **Review Mode**: Full feedback panel, corrections, suggestions
- **Learn Mode**: Grammar explanations, examples, practice exercises

## Editor Interface Patterns

### Pattern Analysis

| Pattern | Example Tools | Pros | Cons | DMF Fit |
|---------|---------------|------|------|---------|
| **Inline Only** | Google Docs | Simple, familiar | Limited detail | ❌ Too basic |
| **Side Panel** | Grammarly, ProWritingAid | Detailed feedback | Can overwhelm | ✅ Yes (toggle) |
| **Modal Popups** | Hemingway | Focused attention | Interrupts flow | ⚠️ Sparingly |
| **Split Pane** | Some IDEs | Compare versions | Cluttered | ❌ Not for writing |
| **Distraction-Free** | iA Writer, Ulysses | Focus on writing | Minimal feedback | ✅ Yes (mode) |

### Recommended Layout: Adaptive Three-Panel

```
┌─────────────────────────────────────────────────────────────┐
│  Header: [Logo] [Prompt] [Word Count: 234] [Save] [Submit] │
├──────────┬──────────────────────────────────┬───────────────┤
│          │                                  │               │
│  Prompt  │         Editor Canvas            │   Feedback    │
│  Panel   │                                  │   Panel       │
│  (Left)  │   "Ich gehe oft zu die          │   (Right)     │
│          │    Bibliothek..."                │               │
│  - Topic │                                  │  ⚠️ Grammar   │
│  - Tips  │   [Underlined errors visible]   │     Errors: 3 │
│  - CEFR  │                                  │               │
│          │   [Clean, minimal interface]    │  💡 Style     │
│  Toggle  │                                  │     Tips: 2   │
│  ☰       │                                  │               │
│          │                                  │  📊 Stats     │
│          │                                  │   - Words: 234│
│          │                                  │   - Time: 12m │
│          │                                  │               │
│ 450px    │         Flexible (60%)          │    350px      │
└──────────┴──────────────────────────────────┴───────────────┘
│  Footer: Progress Bar ████░░░░░ 60% complete                │
└─────────────────────────────────────────────────────────────┘
```

**Responsive Behavior**:
- **Desktop (>1200px)**: Three panels visible
- **Tablet (768-1199px)**: Editor + feedback (prompt collapses to dropdown)
- **Mobile (<768px)**: Editor only (feedback via bottom drawer)

---

## Real-Time Feedback UI Design

### Error Highlighting System

#### Visual Indicators

**Color-coded underlines** (following accessibility standards):

```css
/* Error Types */
.error-spelling {
  border-bottom: 2px wavy #DC2626; /* Red for spelling */
}

.error-grammar {
  border-bottom: 2px solid #F59E0B; /* Orange for grammar */
}

.error-style {
  border-bottom: 2px dashed #3B82F6; /* Blue for style */
}

.error-vocabulary {
  border-bottom: 2px dotted #10B981; /* Green for vocab suggestions */
}
```

**Why these colors?**:
- **Red (spelling)**: Universal "error" color, highest urgency
- **Orange (grammar)**: Important but not critical
- **Blue (style)**: Informational, optional improvements
- **Green (vocabulary)**: Positive suggestion, enhancement

**Accessibility**: Underline patterns (wavy, solid, dashed, dotted) allow color-blind users to distinguish error types.

---

### Tooltip Interaction

**Hover/Click behavior**:

```
┌─────────────────────────────────────────┐
│ Ich gehe zu die Bibliothek.             │
│         ─────                            │
│           │                              │
│           └──────────┐                   │
│                      ▼                   │
│         ┌──────────────────────────┐     │
│         │ ⚠️ Grammar Error          │     │
│         │                          │     │
│         │ "zu die" → "zur"         │     │
│         │                          │     │
│         │ Explanation:             │     │
│         │ "zu" + "die" (Dativ)     │     │
│         │ contracts to "zur"       │     │
│         │                          │     │
│         │ [Apply] [Ignore] [Learn] │     │
│         └──────────────────────────┘     │
└─────────────────────────────────────────┘
```

**Tooltip Content**:
1. **Icon + Error Type** (visual hierarchy)
2. **Suggestion** (highlighted, bold)
3. **Brief Explanation** (1-2 sentences)
4. **Action Buttons**:
   - **Apply**: Accept correction (one-click fix)
   - **Ignore**: Dismiss this instance
   - **Learn More**: Open detailed explanation in side panel

**Interaction Details**:
- **Desktop**: Hover to preview, click to interact
- **Mobile**: Tap to open tooltip, tap outside to close
- **Keyboard**: Tab to navigate, Enter to apply, Esc to dismiss

---

### Feedback Side Panel

**Structure**:

```
┌────────────────────────────────┐
│  📝 Feedback (5)               │
│                                │
│  ▼ Grammar Errors (3)          │
│     ┌──────────────────────┐   │
│     │ ⚠️ Article Error     │   │
│     │ Line 2: "zu die" → "zur"│
│     │ [Apply] [Ignore]     │   │
│     └──────────────────────┘   │
│     ┌──────────────────────┐   │
│     │ ⚠️ Verb Conjugation  │   │
│     │ Line 5: "geht" → "gehe"│
│     └──────────────────────┘   │
│                                │
│  ▼ Style Suggestions (2)       │
│     ┌──────────────────────┐   │
│     │ 💡 Wordiness         │   │
│     │ "sehr viel" → "zahlreich"│
│     │ [Apply] [Ignore]     │   │
│     └──────────────────────┘   │
│                                │
│  📊 Writing Stats              │
│     • Words: 234               │
│     • Readability: Medium      │
│     • Errors/100 words: 2.1    │
│                                │
│  [Clear All] [Export Report]   │
└────────────────────────────────┘
```

**Features**:
- **Collapsible sections** (Grammar, Style, Vocabulary)
- **Click to highlight** error in editor (bidirectional linking)
- **Batch actions** ("Apply all grammar fixes")
- **Export report** (PDF summary of errors for review)

---

## Correction Interaction Flows

### Flow 1: Accept Correction (Happy Path)

```
User types → Error detected → Underline appears → User hovers
→ Tooltip shows suggestion → User clicks "Apply" 
→ Text corrected ✅ → Underline removed → Success animation
```

**UX Details**:
- **Success animation**: Brief green checkmark fade-in (500ms)
- **Undo option**: Show "Undo" button for 5 seconds (cmd/ctrl+z also works)
- **Learning**: Silently log correction type for analytics

---

### Flow 2: Learn More (Educational Path)

```
User hovers error → Clicks "Learn More" → Side panel expands
→ Detailed explanation with examples → Related grammar rule link
→ Optional: "Practice this rule" button → Quick quiz (3 questions)
→ Return to writing
```

**Example Detailed Explanation**:

```
┌─────────────────────────────────────────┐
│ 📚 Grammar Rule: Dativ Contractions     │
│                                         │
│ Rule:                                   │
│ "zu" + "der/dem/den" contracts in      │
│ spoken and written German:             │
│                                         │
│ • zu + der = zur                       │
│ • zu + dem = zum                       │
│                                         │
│ Examples:                               │
│ ✅ Ich gehe zur Schule. (to the school)│
│ ✅ Er geht zum Arzt. (to the doctor)   │
│ ❌ Ich gehe zu der Schule. (too formal)│
│                                         │
│ CEFR Level: A2                         │
│                                         │
│ [Practice with 3 exercises] [Got it!]  │
└─────────────────────────────────────────┘
```

---

### Flow 3: Ignore Correction (User Disagrees)

```
User clicks "Ignore" → Underline fades out 
→ Error logged as "ignored" (for analytics)
→ Optional: "Why did you ignore this?" feedback form
```

**Feedback Form** (optional, 20% of users):
```
Why did you ignore this correction?
○ The suggestion is wrong
○ It's a proper noun/name
○ It's intentional (stylistic choice)
○ Other: [text field]

[Submit Feedback]
```

**Purpose**: Improve grammar checking accuracy over time

---

## Progress & Analytics Dashboard

### Dashboard Layout

```
┌────────────────────────────────────────────────────────────┐
│  📊 Your Writing Progress                                  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ 🔥 12-Day    │  │ ✍️ 23 Essays │  │ 📈 8% Better │    │
│  │   Streak     │  │   Completed  │  │  This Month  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                            │
│  📅 Activity Heatmap (Last 60 Days)                       │
│  ┌────────────────────────────────────────────────────┐   │
│  │ Mon │ ▓▓ ░░ ▓▓ ░░ ▓▓ ▓▓ ░░ ▓▓ ... (GitHub-style)│   │
│  │ Tue │ ░░ ▓▓ ▓▓ ▓▓ ░░ ░░ ▓▓ ░░ ...               │   │
│  │ ... │                                            │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  📊 Error Trends (Last 30 Days)                           │
│  ┌────────────────────────────────────────────────────┐   │
│  │     Errors per 100 words                           │   │
│  │  4 │                                               │   │
│  │  3 │     ●                                         │   │
│  │  2 │       ●   ●                                   │   │
│  │  1 │           ●   ●   ●   ●   ●  (declining!)    │   │
│  │  0 └───────────────────────────────────────────   │   │
│  │     Week 1   Week 2   Week 3   Week 4             │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  🎯 Common Errors (Top 5)                                 │
│  1. Dativ vs. Akkusativ (12 times) → [Practice]          │
│  2. Verb position (8 times) → [Practice]                 │
│  3. Adjective endings (6 times) → [Practice]             │
│  4. Spelling: dass/das (5 times) → [Practice]            │
│  5. Comma splices (4 times) → [Practice]                 │
│                                                            │
│  📚 Vocabulary Growth                                     │
│  • Unique words used: 1,247 (↑ 8% this month)            │
│  • New B2 words learned: 23                              │
│  • Type-Token Ratio: 0.68 (Good diversity!)              │
│                                                            │
│  🏆 Achievements                                          │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                    │
│  │ 🎖️  │ │ 📝  │ │ 🔥  │ │ 🌟  │ [+5 more]           │
│  │First │ │ 10   │ │ 7-Day│ │Error │                    │
│  │Essay │ │Essays│ │Streak│ │ Free │                    │
│  └──────┘ └──────┘ └──────┘ └──────┘                    │
└────────────────────────────────────────────────────────────┘
```

### Key Metrics Explained

**1. Streak**:
- **Definition**: Consecutive days with at least one completed essay
- **Gamification**: Visual fire emoji, milestone notifications (7, 14, 30, 100 days)
- **Reset**: Skipping a day resets streak (motivates daily practice)

**2. Essays Completed**:
- **Total count** across all time
- **Milestones**: Badges at 1, 10, 25, 50, 100, 250, 500 essays

**3. Improvement Rate**:
- **Calculation**: `(Last week's error rate - This week's error rate) / Last week's error rate × 100`
- **Example**: 3.2 errors/100 words → 2.8 errors/100 words = 12.5% improvement

**4. Activity Heatmap**:
- **Style**: GitHub contribution graph (familiar to developers, learners)
- **Colors**: Dark green (lots of writing), light green (some), gray (none)
- **Interaction**: Hover to see exact word count per day

**5. Error Trends**:
- **Line chart** showing errors per 100 words over time
- **Goal**: Downward trend (fewer errors = learning progress)
- **Granularity**: Weekly or monthly aggregates

**6. Common Errors**:
- **Top 5 most frequent** error types
- **Action**: Click "Practice" to get targeted exercises
- **Update**: Refreshes as user corrects errors (dynamic learning path)

**7. Vocabulary Growth**:
- **Unique words**: Total distinct lemmas used
- **New words**: Words not seen in previous essays (vocabulary expansion)
- **Type-Token Ratio**: Unique words / Total words (higher = more diverse)

**8. Achievements**:
- **Badges**: Unlock by hitting milestones
- **Examples**:
  - 🎖️ First Essay (complete 1 essay)
  - 📝 Prolific Writer (complete 10 essays)
  - 🔥 Week Warrior (7-day streak)
  - 🌟 Error-Free Essay (0 grammar errors in 300+ word essay)
  - 📚 Vocabulary Master (use 100 unique B2-level words)
  - ⚡ Speed Writer (write 500 words in under 30 minutes)

---

## Gamification Strategies

### Psychological Principles

1. **Progress Visualization**: Humans love seeing improvement (charts, graphs)
2. **Streak Motivation**: Loss aversion (don't want to break streak)
3. **Achievements**: Dopamine hit from unlocking badges
4. **Leaderboards**: Social comparison (optional, privacy-respecting)
5. **Micro-goals**: Small, achievable targets (write 100 words today)

### Gamification Elements for DMF

#### 1. Daily Goals

```
┌─────────────────────────────────┐
│ 🎯 Today's Goal                 │
│                                 │
│ Write 200 words                 │
│ ████████░░ 160/200 (80%)        │
│                                 │
│ Keep your 12-day streak! 🔥     │
└─────────────────────────────────┘
```

**Goal Types**:
- Word count (100, 200, 500 words)
- Time spent (15, 30, 60 minutes)
- Error-free writing (< 2 errors/100 words)
- Vocabulary goal (use 5 new B2 words)

#### 2. Level System

**XP (Experience Points)**:
- 10 XP per 100 words written
- 50 XP per completed essay
- 100 XP per error-free essay
- 25 XP per grammar lesson completed

**Levels**:
- Level 1: Beginner (0-500 XP)
- Level 2: Learner (500-1,500 XP)
- Level 3: Writer (1,500-3,000 XP)
- Level 4: Wordsmith (3,000-6,000 XP)
- Level 5: Author (6,000-10,000 XP)
- Level 6: Master (10,000+ XP)

**Level-up Rewards**:
- Unlock new essay prompts (harder levels)
- Unlock premium features (free trial)
- Special badges

#### 3. Challenges

**Weekly Challenges**:
- "Write 5 essays this week" (reward: 200 XP)
- "Reduce errors by 10%" (reward: special badge)
- "Use 20 new vocabulary words" (reward: vocabulary flashcard set)

**Monthly Competitions** (optional, opt-in):
- "Most improved writer" (based on error reduction)
- "Most consistent" (longest streak)
- "Vocabulary champion" (most diverse word usage)

#### 4. Social Features (Privacy-First)

**Optional Leaderboards**:
- **Global**: Top 100 writers (anonymous or nickname)
- **Friends**: Compare with connections (opt-in)
- **Classroom**: Teacher-created leaderboards (for schools)

**Privacy Controls**:
- Default: Private (only user sees own stats)
- Opt-in to leaderboards
- Anonymous mode (username = "Writer #12345")

---

## Mobile Experience

### Mobile-First Design Principles

**80% of German learners access e-learning on mobile** (Source: mobile learning trends)

**Challenges**:
- Small screen (editing long text is hard)
- Touch interface (no hover states)
- Slower typing (virtual keyboard)
- Intermittent connectivity (need offline mode)

### Mobile UI Adaptations

#### Editor Layout (Mobile)

```
┌──────────────────────────┐
│  [≡] DMF Writing    [✓]  │ ← Header (compact)
├──────────────────────────┤
│ Prompt: Describe your... │ ← Collapsible prompt
├──────────────────────────┤
│                          │
│  Editor Canvas           │
│                          │
│  Ich gehe oft zu die     │
│  Bibliothek...           │
│  ─────                   │ ← Error underlines
│                          │
│  [Full-height editor]    │
│                          │
│                          │
├──────────────────────────┤
│ ⚠️ 3 errors | 💡 2 tips  │ ← Bottom bar (tap to open)
└──────────────────────────┘
```

**Tap bottom bar → opens feedback drawer**:

```
┌──────────────────────────┐
│ [Drag to dismiss ──]     │
│                          │
│ 📝 Feedback (5)          │
│                          │
│ ⚠️ Grammar: "zu die"→"zur"│
│    [Apply] [Ignore]      │
│                          │
│ ⚠️ Verb: "geht"→"gehe"   │
│    [Apply] [Ignore]      │
│                          │
│ 💡 Style: "sehr"→"äußerst"│
│    [Apply] [Ignore]      │
│                          │
│ [Scroll for more...]     │
└──────────────────────────┘
```

**Interaction Patterns**:
- **Tap error** in editor → highlight + show tooltip
- **Tap tooltip** → expand to full explanation
- **Swipe up** from bottom bar → open feedback drawer
- **Swipe down** drawer → dismiss

---

### Offline Mode (Progressive Web App)

**Features**:
- Write offline (text saved locally)
- Grammar check queued (runs when back online)
- Sync when connected (automatic)

**Implementation** (Service Worker):
```javascript
// Cache essay content locally
localStorage.setItem(`essay_draft_${id}`, JSON.stringify({
  text: editorContent,
  timestamp: Date.now(),
  synced: false
}));

// When online, sync to server
if (navigator.onLine) {
  syncDraftsToServer();
}
```

---

## Accessibility Standards

### WCAG 2.1 AA Compliance

**Requirements**:

1. **Keyboard Navigation**:
   - All interactive elements (buttons, errors) focusable via Tab
   - Logical tab order (left-to-right, top-to-bottom)
   - Shortcuts: Ctrl+E (focus editor), Ctrl+F (open feedback panel)

2. **Screen Reader Support**:
   - Semantic HTML (`<main>`, `<nav>`, `<section>`)
   - ARIA labels for icons and buttons
   - Error announcements via `aria-live="polite"`

**Example**:
```html
<span class="error-grammar" 
      role="button"
      tabindex="0"
      aria-label="Grammar error: zu die should be zur. Press Enter for details.">
  zu die
</span>
```

3. **Color Contrast**:
   - Text-to-background ratio ≥ 4.5:1 (AA standard)
   - Error underlines use patterns (not just color)
   - Dark mode support (toggle in settings)

4. **Font & Readability**:
   - Minimum font size: 16px (base text)
   - Line height: 1.5 (easier to read)
   - Dyslexia-friendly font option (OpenDyslexic)

5. **Focus Indicators**:
   - Visible outline on keyboard focus (2px solid blue)
   - Never disable focus styles (common mistake)

---

## Onboarding & Tutorials

### First-Time User Experience (FTUE)

**Goal**: Get user to complete first essay within 5 minutes

#### Step 1: Welcome Splash (5 seconds)

```
┌─────────────────────────────────┐
│                                 │
│     ✍️ Welcome to DMF Writing   │
│                                 │
│  The smart way to practice      │
│  German writing with real-time  │
│  feedback and personalized      │
│  learning.                      │
│                                 │
│     [Start Writing] [Tutorial]  │
│                                 │
└─────────────────────────────────┘
```

**Option A**: "Start Writing" (skip tutorial, jump to editor)  
**Option B**: "Tutorial" (30-second interactive guide)

---

#### Step 2: Interactive Tutorial (Optional)

**Style**: Inline tooltips (not modal that blocks UI)

```
Step 1: Choose a prompt
┌────────────────────────────────┐
│ 👈 Pick an essay topic here    │ ← Tooltip points to prompt selector
│                                │
│ [Describe your daily routine]  │
│ [My favorite hobby]            │
└────────────────────────────────┘

Step 2: Start typing
┌────────────────────────────────┐
│ Editor                         │
│ 📝 Type your essay here        │ ← Placeholder text
│    Grammar errors will be      │
│    underlined automatically.   │
└────────────────────────────────┘

Step 3: Review errors
┌────────────────────────────────┐
│ Ich gehe zu die Bibliothek.    │
│         ──────                 │
│ 👆 Click underlined words to   │
│    see corrections!            │
└────────────────────────────────┘

Step 4: Check your progress
┌────────────────────────────────┐
│ 🎯 Complete your first essay   │
│    to start your streak! 🔥    │
│                                │
│ [Got it!]                      │
└────────────────────────────────┘
```

**Duration**: 30 seconds (4 steps × 7 seconds each)

---

#### Step 3: First Essay Prompt

**Beginner-Friendly Prompts** (A2-B1):
1. "Beschreibe deinen Tagesablauf" (Describe your daily routine) — 100 words
2. "Mein Lieblingsessen" (My favorite food) — 80 words
3. "Ein schöner Tag" (A beautiful day) — 120 words

**Prompt Card**:
```
┌────────────────────────────────────────┐
│ 📝 Essay Prompt (A2 Level)             │
│                                        │
│ Beschreibe deinen Tagesablauf.         │
│ (Describe your daily routine.)         │
│                                        │
│ Tips:                                  │
│ • Use present tense (Präsens)         │
│ • Include times (um 8 Uhr...)         │
│ • Mention activities (frühstücken,    │
│   arbeiten, schlafen...)              │
│                                        │
│ Target: 100 words                      │
│ Time: ~10 minutes                      │
│                                        │
│ [Start Writing]                        │
└────────────────────────────────────────┘
```

---

#### Step 4: First Submission Celebration

**When user clicks "Submit"**:

```
┌────────────────────────────────────────┐
│         🎉 Congratulations! 🎉         │
│                                        │
│  You completed your first essay!       │
│                                        │
│  📊 Your Results:                      │
│  • Words written: 102                  │
│  • Errors found: 4                     │
│  • Time spent: 8 minutes               │
│                                        │
│  🏆 Achievement Unlocked:              │
│     "First Steps" badge                │
│                                        │
│  💡 Your error rate: 3.9 per 100 words │
│     (Average for beginners: 5.2)       │
│     You're doing great!                │
│                                        │
│  🔥 Start your streak by writing       │
│     again tomorrow!                    │
│                                        │
│  [View Dashboard] [Write Another]      │
└────────────────────────────────────────┘
```

**Psychology**:
- Celebrate completion (positive reinforcement)
- Show stats (quantified progress)
- Unlock badge (achievement motivation)
- Encourage habit (mention streak)

---

### Ongoing Guidance

**Contextual Tips** (shown based on user behavior):

- **After 3 similar errors**: "We noticed you struggle with Dativ case. [Practice exercises]"
- **After 7 days without writing**: "Your streak ended 😢 Start a new one today! [Quick prompt]"
- **After 10 essays**: "You're improving! Your error rate dropped 15% this week. 📈"
- **When reaching new CEFR level**: "🎉 Your vocabulary suggests B2 level! Try harder prompts."

---

## UI Component Library Recommendations

### Suggested Tools

**Design System**:
- **Radix UI** (headless components, accessible by default)
- **Tailwind CSS** (utility-first styling)
- **Framer Motion** (smooth animations)

**Editor**:
- **Lexical** (Meta's modern rich text framework)
  - Pros: Modern, modular, TypeScript support
  - Cons: Newer (less mature than Draft.js)
- **Draft.js** (Facebook's older editor)
  - Pros: Battle-tested, large community
  - Cons: Older API, less active development

**Charts**:
- **Recharts** (React charting library)
  - Use for error trends, activity heatmap
  - Simple API, customizable

**Icons**:
- **Lucide Icons** (clean, modern, tree-shakeable)
- Fallback: **Heroicons** (Tailwind's icon set)

---

## Wireframe Concepts (Text Descriptions)

### Wireframe 1: Writing Session (Desktop)

**Layout**:
- **Header** (60px): Logo, prompt title, word count, save button, submit button
- **Left sidebar** (300px): Prompt description, tips, related grammar rules
- **Center editor** (60% width): Large text area, minimal toolbar, error underlines
- **Right panel** (350px): Feedback list (collapsible sections), writing stats
- **Footer** (40px): Progress bar showing completion percentage

**Color Scheme**:
- Background: Light gray (#F9FAFB)
- Editor: White (#FFFFFF)
- Accent: Blue (#3B82F6) for interactive elements
- Error: Red (#DC2626), Orange (#F59E0B), Blue (#3B82F6), Green (#10B981)

---

### Wireframe 2: Progress Dashboard (Desktop)

**Layout**:
- **Top stats bar**: Three cards (streak, essays, improvement rate)
- **Activity heatmap**: GitHub-style contribution graph (60 days)
- **Error trends chart**: Line chart showing decline over time
- **Common errors list**: Top 5 with "Practice" buttons
- **Achievements grid**: 4×3 grid of unlocked badges
- **Vocabulary stats**: Card with unique words, TTR, new words learned

---

### Wireframe 3: Mobile Editor

**Layout** (vertical scroll):
- **Top bar** (50px): Menu icon, title, save icon
- **Collapsible prompt** (tap to expand): Shows essay topic and tips
- **Full-screen editor**: Text area with underlined errors
- **Bottom action bar** (60px): Error count, style tips count, "Review" button
- **Feedback drawer** (slides up from bottom): List of errors/suggestions

**Interaction**:
- Tap error in editor → tooltip appears
- Tap "Review" button → feedback drawer slides up
- Swipe down drawer → dismiss
- Tap prompt → expands to show full details

---

## Conclusion

**UX Strategy for DMF Writing Module**:

1. **Editor First**: Clean, distraction-free writing experience
2. **Smart Feedback**: Inline errors + detailed side panel (toggle modes)
3. **Gamification**: Streaks, achievements, progress visualization (motivate daily practice)
4. **Mobile-Optimized**: Bottom drawer pattern, touch-friendly interactions
5. **Accessible**: WCAG 2.1 AA compliance (keyboard nav, screen readers, color contrast)
6. **Onboarding**: 30-second tutorial → first essay → celebration (build habit loop)

**Design Principles**:
- **Clarity**: Simple, uncluttered interfaces
- **Feedback**: Immediate, helpful, educational (not just "wrong")
- **Motivation**: Visible progress, achievements, positive reinforcement
- **Flexibility**: Beginner to advanced, mobile to desktop, dark/light mode

**Next Steps**:
1. Review WRITING_ACTION_PLAN.md for implementation phases
2. Create high-fidelity mockups in Figma (use wireframes above)
3. Conduct user testing with 5-10 German learners (early feedback)
4. Iterate based on feedback before development

---

**Report Status**: ✅ Complete  
**Design Confidence**: High (based on UX patterns from leading writing tools)  
**Recommended Tool**: Figma for mockups, Radix UI + Tailwind for implementation
