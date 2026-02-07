# Daily Challenge Feature

## Overview
The Daily Challenge feature provides users with a daily German language challenge to maintain engagement and track learning progress through gamification.

## Location
- **Route**: `/challenges/daily`
- **Page**: `src/app/challenges/daily/page.tsx`
- **Components**: `src/components/challenges/`
- **Hooks**: `src/hooks/useChallengeQueries.ts`

## Features Implemented

### 1. Daily Challenge Interface
- **Challenge Card** (`ChallengeCard.tsx`)
  - Three states: Not Started, In Progress, Completed
  - Question navigation with progress tracking
  - Multiple question types support:
    - Multiple choice
    - Fill in the blank
    - Translation
    - Listening comprehension
    - Speaking practice
  - Interactive quiz interface with answer tracking
  - Submit functionality with real-time scoring

### 2. Timer System
- **Challenge Timer** (`ChallengeTimer.tsx`)
  - Countdown timer showing hours, minutes, seconds until expiry
  - Visual urgency indicators (changes color when < 1 hour remaining)
  - Automatic updates every second
  - Expired state handling

### 3. Streak Tracking
- **Streak Tracker** (`StreakTracker.tsx`)
  - Current streak display with animated emoji
  - Best streak tracking
  - Progress bar to next milestone
  - Total challenges completed counter
  - Total points earned display
  - Last completed date tracking
  - Streak broken warning system
  - Dynamic emoji based on streak length:
    - 🌱 No streak
    - 🔥 1-6 days
    - ⚡ 7-29 days
    - 🌟 30-99 days
    - 👑 100+ days

### 4. Leaderboard Integration
- **Leaderboard Preview** (`LeaderboardPreview.tsx`)
  - Full modal leaderboard display
  - Top 3 highlighted with special colors/icons
  - Current user highlighting
  - Rank, score, and time spent tracking
  - Real-time updates (30s stale time, 1min refetch)
  - Mini leaderboard in sidebar showing top 3

### 5. Rewards System
- **Rewards Panel** (`RewardsPanel.tsx`)
  - Points display for challenge completion
  - XP boost indicator (+50%)
  - Streak bonus (+25 points)
  - Score milestones:
    - 50%: Bronze Badge 🥉
    - 75%: Silver Badge 🥈
    - 90%: Gold Badge 🥇
    - 100%: Perfect Score 💎
  - Daily bonus reminder

### 6. Challenge History
- **Challenge History** (`ChallengeHistory.tsx`)
  - Full modal history view
  - Past performance tracking:
    - Score and percentage
    - Rank and total participants
    - Time spent
    - Challenge type and level
  - Average score calculation
  - Total challenges counter
  - Color-coded performance (green/blue/amber/red)

## Data Flow

### API Endpoints (Expected)
```
GET  /api/challenges/daily          - Fetch today's challenge
GET  /api/challenges/history        - Get challenge history
GET  /api/challenges/streak         - Get streak information
GET  /api/challenges/leaderboard    - Get leaderboard entries
POST /api/challenges/:id/start      - Start a challenge
POST /api/challenges/submit         - Submit challenge answers
```

### React Query Hooks
- `useDailyChallenge()` - Fetch daily challenge (5min stale, 5min refetch)
- `useChallengeHistory()` - Fetch history (10min stale)
- `useStreakInfo()` - Fetch streak data (5min stale)
- `useLeaderboard()` - Fetch leaderboard (30s stale, 1min refetch)
- `useSubmitChallenge()` - Submit answers (mutation)
- `useStartChallenge()` - Start challenge (mutation)

### State Management
- Challenge state: available → in_progress → completed
- Answer tracking: Record<questionId, answer>
- Timer: Real-time countdown with useEffect
- Modals: AnimatePresence for smooth transitions

## TypeScript Types

### Core Types
```typescript
interface DailyChallenge {
  id: string;
  date: string;
  title: string;
  description: string;
  level: string;
  type: 'vocabulary' | 'reading' | 'listening' | 'speaking' | 'writing' | 'grammar' | 'mixed';
  questions: ChallengeQuestion[];
  timeLimit: number;
  maxPoints: number;
  expiresAt: string;
  status: 'available' | 'in_progress' | 'completed' | 'expired';
  userScore?: number;
  userRank?: number;
  completedAt?: string;
}

interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  totalCompleted: number;
  totalPoints: number;
  streakBroken: boolean;
  nextMilestone: number;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  score: number;
  timeSpent: number;
  completedAt: string;
  isCurrentUser?: boolean;
}
```

## UI/UX Features

### Animations
- Framer Motion for all transitions
- Page load: fade + slide up
- Question changes: slide transition
- Progress bar: smooth width animation
- Stat cards: hover scale effect
- Modals: scale + fade overlay

### Color Scheme
- Primary: Amber (500-600) / Orange (500-600)
- Success: Green (500-600) / Emerald (500-600)
- Streak: Orange (400-600) / Red (500)
- Leaderboard: Purple (500) / Indigo (500)
- Gradient backgrounds: from-{color}-50 to-{color}-50

### Responsive Design
- Mobile-first approach
- Grid layout: 1 col mobile, 3 col desktop
- Stats: 2 cols mobile, 4 cols desktop
- Touch-friendly buttons (min 44px height)
- Modal: Full screen mobile, centered desktop

### Loading States
- Skeleton components for initial load
- Inline spinners for mutations
- Pulse animations for placeholders

### Error Handling
- Connection error screen with retry
- Disabled states for ongoing mutations
- Expired challenge messaging
- Empty states with helpful messages

## Integration Points

### Backend Requirements
1. **Daily Challenge Generation**
   - Auto-generate challenge at midnight (server timezone)
   - Different difficulty levels (A1-C2)
   - Mixed question types
   - Fair point distribution

2. **Streak Logic**
   - Track consecutive days
   - Handle timezone correctly
   - Grace period for missed days (optional)
   - Milestone notifications

3. **Leaderboard**
   - Real-time ranking updates
   - Tie-breaking (time spent, submission time)
   - Daily reset at midnight
   - User identity handling

4. **Rewards Distribution**
   - Point calculation based on correctness
   - Streak bonus application
   - Badge unlocking
   - XP integration with main profile

### Database Schema (Suggested)
```sql
-- Daily Challenges
daily_challenges (
  id, date, type, level, time_limit, max_points, questions_json, expires_at
)

-- User Challenge Attempts
user_challenge_attempts (
  id, user_id, challenge_id, started_at, completed_at, score, answers_json, time_spent
)

-- User Streaks
user_streaks (
  user_id, current_streak, longest_streak, last_completed_date, total_completed, total_points
)

-- Leaderboard (materialized view)
daily_leaderboard (
  challenge_id, user_id, rank, score, time_spent, completed_at
)
```

## Testing Checklist

### Functional Tests
- [ ] Challenge loads correctly
- [ ] Timer counts down accurately
- [ ] Can answer all question types
- [ ] Navigation between questions works
- [ ] Submit only enabled when all answered
- [ ] Streak updates after completion
- [ ] Leaderboard shows correct ranking
- [ ] History displays past challenges
- [ ] Rewards panel shows correct values

### Edge Cases
- [ ] Expired challenge handling
- [ ] Already completed challenge
- [ ] Network error during submission
- [ ] Page refresh during challenge
- [ ] Midnight rollover behavior
- [ ] Tied scores in leaderboard
- [ ] First-time user (no history)
- [ ] Broken streak recovery

### Performance
- [ ] Initial load < 2s
- [ ] Smooth animations (60fps)
- [ ] No layout shifts
- [ ] Efficient re-renders
- [ ] Query caching works

### Accessibility
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Color contrast (WCAG AA)
- [ ] Focus indicators
- [ ] Touch targets (44px min)

## Future Enhancements

### Short-term
- [ ] Audio playback for listening questions
- [ ] Image support for visual questions
- [ ] Explanation/feedback after submission
- [ ] Social sharing of scores
- [ ] Push notifications for daily reminder

### Long-term
- [ ] Weekly challenges
- [ ] Team challenges
- [ ] Custom challenge creation
- [ ] Challenge difficulty adaptation
- [ ] Achievement badges system
- [ ] Global leaderboard (all-time)
- [ ] Challenge replay mode
- [ ] Offline support

## Module Dependencies

```json
{
  "required": [
    "react",
    "framer-motion",
    "lucide-react",
    "@tanstack/react-query",
    "next"
  ],
  "peer": [
    "@/components/ui",
    "@/hooks/useApiQueries",
    "@/services/german-api"
  ]
}
```

## File Structure

```
src/
├── app/
│   └── challenges/
│       └── daily/
│           └── page.tsx              # Main page component
├── components/
│   └── challenges/
│       ├── ChallengeCard.tsx         # Quiz interface
│       ├── ChallengeTimer.tsx        # Countdown timer
│       ├── StreakTracker.tsx         # Streak display
│       ├── LeaderboardPreview.tsx    # Leaderboard modal
│       ├── ChallengeHistory.tsx      # History modal
│       ├── RewardsPanel.tsx          # Rewards info
│       └── index.ts                  # Barrel export
└── hooks/
    └── useChallengeQueries.ts        # API hooks + types
```

## Notes

- All components follow the existing module pattern from listening/reading/speaking modules
- Uses React Query for data fetching with appropriate stale times
- Framer Motion for all animations (consistent with other pages)
- Tailwind CSS for styling (gradient themes)
- TypeScript strict mode compliant
- No browser automation or screenshots as per constraints
- Code-only implementation, ready for backend integration
