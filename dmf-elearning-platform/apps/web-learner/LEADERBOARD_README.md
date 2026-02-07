# Leaderboard Component - Quick Reference

## 📂 File Structure
```
apps/web-learner/src/
├── app/
│   └── leaderboard/
│       └── page.tsx                    # Main leaderboard page
├── components/
│   └── leaderboard/
│       ├── index.ts                    # Barrel exports
│       ├── LeaderboardCard.tsx         # Individual ranking entry
│       ├── LeaderboardFilters.tsx      # Filter controls
│       ├── LeaderboardStatsCards.tsx   # Global statistics
│       └── UserRankingsCard.tsx        # Personal rankings
├── hooks/
│   └── useApiQueries.ts               # Added leaderboard hooks
└── services/
    └── german-api.ts                  # Added leaderboard API
```

## 🎯 Key Components

### Page: `/leaderboard`
Main leaderboard page with full filtering and search

### LeaderboardCard
Individual user ranking entry with:
- Rank badge (Crown for #1, Medal for #2, Award for #3)
- Avatar
- Username & display name
- Stats (level, streak, badges)
- Points (total, weekly, monthly)

### LeaderboardFilters
Filter controls:
- **Timeframe**: Weekly | Monthly | All-time
- **Scope**: Global | By Level | By Module
- **Conditional**: Level/Module dropdowns
- **Search**: Username/display name

### UserRankingsCard
Personal rankings overview:
- Global, Weekly, Monthly ranks
- Best module/level performance
- Motivational messages

### LeaderboardStatsCards
Global statistics:
- Total users
- Average points
- Top level
- Highest streak

## 🔌 API Integration

### Endpoints Needed
```typescript
GET /api/leaderboard/:userId?timeframe=...&scope=...&level=...&module=...
GET /api/leaderboard/:userId/rankings
GET /api/leaderboard/stats?timeframe=...
```

### Response Format
```typescript
{
  entries: LeaderboardEntry[],
  currentUser?: LeaderboardEntry,
  stats: LeaderboardStats,
  total: number,
  timeframe: 'weekly' | 'monthly' | 'all-time',
  scope: 'global' | 'level' | 'module'
}
```

## 📊 Points System

| Activity | Points |
|----------|--------|
| Vocabulary practice | +10 |
| Reading completion | +50 |
| Listening practice | +30 |
| Speaking submission | +40 |
| Writing submission | +60 |
| Grammar quiz | +20 |
| Daily streak bonus | +5/day |

## 🎨 Design Features

- **Top 3 Badges**: Crown (gold), Medal (silver), Award (bronze)
- **Current User**: Purple highlight border
- **Animations**: Framer Motion for smooth transitions
- **Responsive**: Mobile-first design
- **Loading States**: Skeleton screens
- **Empty States**: Helpful messages
- **Error Handling**: Retry functionality

## 🚀 Usage Example

```tsx
import { LeaderboardCard, LeaderboardFilters } from '@/components/leaderboard';
import { useLeaderboard } from '@/hooks/useApiQueries';

function MyPage() {
  const { data } = useLeaderboard({ 
    timeframe: 'weekly',
    scope: 'global'
  });
  
  return (
    <div>
      {data?.entries.map((entry, i) => (
        <LeaderboardCard 
          key={entry.userId}
          entry={entry}
          index={i}
          timeframe="weekly"
        />
      ))}
    </div>
  );
}
```

## ✅ Features Implemented

- [x] Global leaderboard
- [x] Weekly/Monthly/All-time views
- [x] User ranking display
- [x] Points system
- [x] Filter by level
- [x] Filter by module
- [x] Search users
- [x] Personal rankings
- [x] Global statistics
- [x] Top 3 special badges
- [x] Mobile responsive
- [x] Loading states
- [x] Error handling

## 🔧 Backend TODO

1. Create `user_points` table (total, weekly, monthly)
2. Implement leaderboard ranking calculation
3. Cache top 100 rankings in Redis
4. Add WebSocket for real-time updates
5. Calculate streaks from activity logs
6. Implement points award system

---

**Status**: ✅ Frontend Complete | ⏳ Backend Integration Pending
