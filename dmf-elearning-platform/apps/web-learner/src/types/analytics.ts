export interface UserStats {
  user: {
    xp: number;
    level: number;
    streak: number;
    lastActive: Date | null;
  };
  vocabulary: {
    totalWords: number;
    averageEaseFactor: number;
    averageInterval: number;
  };
  reading: {
    totalContent: number;
    avgProgress: number;
    totalWordsRead: number;
    totalReadTime: number;
    avgReadTime: number;
  };
  listening: {
    totalContent: number;
    avgProgress: number;
    avgAccuracy: number;
    totalListenTime: number;
    exercisesCompleted: number;
  };
  speaking: {
    totalAttempts: number;
    avgPronunciation: number;
    avgFluency: number;
    avgAccuracy: number;
    avgOverall: number;
    totalRecordingTime: number;
  };
  writing: {
    totalSubmissions: number;
    avgOverallScore: number;
    avgGrammarScore: number;
    avgVocabularyScore: number;
    avgCoherenceScore: number;
    totalWordsWritten: number;
    totalTimeSpent: number;
  };
  achievements: {
    total: number;
    byTier: Record<string, number>;
    recent: Array<{
      id: string;
      name: string;
      icon: string;
      tier: string;
      unlockedAt: Date | null;
    }>;
  };
  challenges: {
    total: number;
    completed: number;
  };
  leaderboard: {
    rank: number | null;
    period: string | null;
  };
  period: string;
}

export interface LearningInsights {
  vocabulary: {
    stats: Record<string, number>;
    timeline: Array<{
      date: string;
      count: number;
      avg_ease: number;
      avg_interval: number;
    }>;
  };
  reading: {
    stats: Record<string, { count: number; avgProgress: number }>;
    timeline: Array<any>;
  };
  listening: {
    avgAccuracy: number;
    timeline: Array<any>;
  };
  speaking: {
    avgScores: {
      pronunciation: number;
      fluency: number;
    };
    timeline: Array<any>;
  };
  writing: {
    avgScores: {
      overall: number;
      grammar: number;
    };
    timeline: Array<any>;
  };
  patterns: {
    byHour: Array<{ hour: number; activity_count: number }>;
    byDay: Array<{ day_of_week: number; activity_count: number }>;
  };
  skillScores: {
    vocabulary: {
      mastery: number;
      learning: number;
      new: number;
    };
    reading: {
      completed: number;
      inProgress: number;
      avgProgress: number;
    };
    listening: {
      avgAccuracy: number;
      totalAttempts: number;
    };
    speaking: {
      avgPronunciation: number;
      avgFluency: number;
      totalAttempts: number;
    };
    writing: {
      avgScore: number;
      avgGrammar: number;
      totalSubmissions: number;
    };
  };
  totalStudyTime: number;
  recommendations: Array<{
    type: string;
    priority: string;
    message: string;
  }>;
  period: {
    days: number;
    startDate: Date;
  };
}

export interface SystemMetrics {
  users: {
    total: number;
    active: number;
    new: number;
    activeRate: number;
  };
  content: {
    vocabulary: number;
    reading: number;
    listening: number;
    speaking: number;
    writing: number;
    total: number;
  };
  engagement: {
    vocabulary: number;
    reading: number;
    listening: number;
    speaking: number;
    writing: number;
    total: number;
  };
  gamification: {
    totalAchievements: number;
    achievementsUnlocked: number;
    challengesCompleted: number;
    avgStreak: number;
    avgXp: number;
  };
  performance: {
    speaking: {
      avgPronunciation: number;
      avgFluency: number;
      avgOverall: number;
    };
    writing: {
      avgOverall: number;
      avgGrammar: number;
      avgVocabulary: number;
    };
    listening: {
      avgAccuracy: number;
    };
  };
  topUsers: Array<{
    userId: string;
    xp: number;
    level: number;
    streak: number;
  }>;
  popularContent: {
    reading: Array<{ contentId: string; _count: { _all: number } }>;
    listening: Array<{ contentId: string; _count: { _all: number } }>;
  };
  dailyActivity: Array<{
    date: string;
    active_users: number;
    total_activities: number;
  }>;
  systemHealth: {
    status: string;
    timestamp: Date;
    uptime: number;
    memory: NodeJS.MemoryUsage;
  };
  period: string;
}

export interface ChartData {
  progress?: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
    }>;
  };
  skills?: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
    }>;
  };
  time?: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string[];
    }>;
  };
  activity?: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      fill: boolean;
    }>;
  };
  achievements?: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string[];
    }>;
  };
}

export interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  area: string;
  title: string;
  description: string;
  action: string;
}

export interface RecommendationsResponse {
  recommendations: Recommendation[];
  strengths: Array<{
    area: string;
    achievement: string;
  }>;
  weaknesses: Array<{
    area: string;
    issue: string;
  }>;
  nextSteps: Array<{
    title: string;
    description: string;
  }>;
  stats: {
    level: number;
    xp: number;
    xpForNextLevel: number;
    xpProgress: number;
    streak: number;
    activeDays: number;
    completedChallenges: number;
    totalChallenges: number;
  };
}
