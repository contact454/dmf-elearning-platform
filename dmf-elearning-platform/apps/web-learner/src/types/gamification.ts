export interface UserStats {
  id: string;
  userId: string;
  xp: number;
  level: number;
  streak: number;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  xpReward: number;
  requirement: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  achievement: Achievement;
  progress: number;
  isUnlocked: boolean;
  unlockedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyChallenge {
  id: string;
  userId: string;
  type: 'vocabulary' | 'reading' | 'listening' | 'speaking' | 'writing' | 'grammar';
  goal: number;
  progress: number;
  isCompleted: boolean;
  xpReward: number;
  date: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  xp: number;
  level: number;
  streak: number;
  rank: number | null;
  period: 'daily' | 'weekly' | 'monthly' | 'allTime';
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PointsUpdateRequest {
  userId: string;
  points: number;
  action?: string;
}

export interface PointsUpdateResponse {
  success: boolean;
  data: UserStats;
  leveledUp: boolean;
  newLevel?: number;
}

export interface AchievementUpdateRequest {
  userId: string;
  achievementKey: string;
  progress?: number;
}

export interface AchievementUpdateResponse {
  success: boolean;
  data: UserAchievement;
  unlocked: boolean;
}

export interface LeaderboardGetParams {
  period?: 'daily' | 'weekly' | 'monthly' | 'allTime';
  limit?: number;
  userId?: string;
}

export interface LeaderboardResponse {
  success: boolean;
  data: {
    entries: LeaderboardEntry[];
    userEntry: LeaderboardEntry | null;
    period: string;
    startDate: Date;
    endDate: Date;
  };
}

export interface StreakUpdateRequest {
  userId: string;
}

export interface StreakUpdateResponse {
  success: boolean;
  data: UserStats;
  streakIncreased: boolean;
  message: string;
}

export interface DailyChallengeUpdateRequest {
  userId: string;
  type: string;
  progress?: number;
}

export interface DailyChallengeResponse {
  success: boolean;
  data: DailyChallenge | DailyChallenge[];
  completed?: boolean;
  message?: string;
}
