'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  TrendingUp,
  Clock,
  Target,
  Award,
  Calendar,
  BookOpen,
  Headphones,
  MessageSquare,
  PenTool,
  CheckCircle2,
  Flame,
  BarChart3,
  PieChart,
  Activity,
  Sparkles,
  TrendingDown,
  AlertCircle,
} from 'lucide-react';
import { ThemeToggle, CountUp } from '@/components/ui';

// Types
interface StudySession {
  id: string;
  date: string;
  module: string;
  duration: number; // minutes
  wordsLearned: number;
  accuracy: number;
}

interface ModulePerformance {
  module: string;
  icon: React.ReactNode;
  color: string;
  totalTime: number;
  sessions: number;
  avgAccuracy: number;
  progress: number;
  trend: 'up' | 'down' | 'stable';
}

interface StudyGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  completed: boolean;
}

interface DayStreak {
  date: string;
  studied: boolean;
  minutes: number;
}

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');
  const [selectedModule, setSelectedModule] = useState<string>('all');

  // Mock data - In production, this would come from React Query hooks
  const studyStats = {
    totalTime: 1247, // minutes
    currentStreak: 12,
    bestStreak: 23,
    wordsLearned: 342,
    lessonsCompleted: 28,
    avgAccuracy: 87,
    totalSessions: 45,
    weeklyGoal: 300,
    weeklyProgress: 245,
  };

  const recentSessions: StudySession[] = [
    { id: '1', date: '2026-02-05', module: 'vocabulary', duration: 25, wordsLearned: 15, accuracy: 92 },
    { id: '2', date: '2026-02-05', module: 'reading', duration: 30, wordsLearned: 8, accuracy: 88 },
    { id: '3', date: '2026-02-04', module: 'listening', duration: 20, wordsLearned: 12, accuracy: 85 },
    { id: '4', date: '2026-02-04', module: 'speaking', duration: 15, wordsLearned: 6, accuracy: 78 },
    { id: '5', date: '2026-02-03', module: 'writing', duration: 35, wordsLearned: 10, accuracy: 90 },
  ];

  const modulePerformance: ModulePerformance[] = [
    {
      module: 'Vocabulary',
      icon: <BookOpen className="w-5 h-5" />,
      color: 'emerald',
      totalTime: 342,
      sessions: 15,
      avgAccuracy: 92,
      progress: 78,
      trend: 'up',
    },
    {
      module: 'Reading',
      icon: <BookOpen className="w-5 h-5" />,
      color: 'blue',
      totalTime: 287,
      sessions: 12,
      avgAccuracy: 88,
      progress: 65,
      trend: 'up',
    },
    {
      module: 'Listening',
      icon: <Headphones className="w-5 h-5" />,
      color: 'purple',
      totalTime: 198,
      sessions: 8,
      avgAccuracy: 85,
      progress: 54,
      trend: 'stable',
    },
    {
      module: 'Speaking',
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'orange',
      totalTime: 156,
      sessions: 6,
      avgAccuracy: 78,
      progress: 42,
      trend: 'down',
    },
    {
      module: 'Writing',
      icon: <PenTool className="w-5 h-5" />,
      color: 'pink',
      totalTime: 264,
      sessions: 4,
      avgAccuracy: 90,
      progress: 38,
      trend: 'up',
    },
  ];

  const studyGoals: StudyGoal[] = [
    {
      id: '1',
      title: 'Study 300 minutes this week',
      target: 300,
      current: 245,
      unit: 'minutes',
      deadline: '2026-02-09',
      completed: false,
    },
    {
      id: '2',
      title: 'Learn 500 new words',
      target: 500,
      current: 342,
      unit: 'words',
      deadline: '2026-02-28',
      completed: false,
    },
    {
      id: '3',
      title: 'Complete 50 lessons',
      target: 50,
      current: 28,
      unit: 'lessons',
      deadline: '2026-02-15',
      completed: false,
    },
    {
      id: '4',
      title: 'Maintain 7-day streak',
      target: 7,
      current: 12,
      unit: 'days',
      deadline: '2026-02-05',
      completed: true,
    },
  ];

  // Generate streak calendar for last 60 days
  const streakCalendar: DayStreak[] = useMemo(() => {
    const days: DayStreak[] = [];
    const today = new Date();
    
    for (let i = 59; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Mock: Random study pattern
      const studied = Math.random() > 0.3;
      const minutes = studied ? Math.floor(Math.random() * 60) + 10 : 0;
      
      days.push({
        date: date.toISOString().split('T')[0],
        studied,
        minutes,
      });
    }
    
    return days;
  }, []);

  // Learning graph data (time series)
  const learningGraphData = useMemo(() => {
    const data: { date: string; minutes: number; words: number; accuracy: number }[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0].slice(5), // MM-DD
        minutes: Math.floor(Math.random() * 60) + 20,
        words: Math.floor(Math.random() * 20) + 5,
        accuracy: Math.floor(Math.random() * 20) + 75,
      });
    }
    
    return data;
  }, []);

  // Insights & Recommendations
  const insights = [
    {
      type: 'success',
      icon: <TrendingUp className="w-5 h-5" />,
      title: 'Great Progress!',
      message: 'Your accuracy in Vocabulary improved by 12% this week. Keep it up!',
      color: 'emerald',
    },
    {
      type: 'warning',
      icon: <AlertCircle className="w-5 h-5" />,
      title: 'Speaking Needs Attention',
      message: 'Your Speaking module accuracy is below average. Try 2-3 sessions this week.',
      color: 'orange',
    },
    {
      type: 'tip',
      icon: <Sparkles className="w-5 h-5" />,
      title: 'Streak Power!',
      message: "You're on a 12-day streak! Study 5 more minutes today to maintain it.",
      color: 'purple',
    },
    {
      type: 'achievement',
      icon: <Award className="w-5 h-5" />,
      title: 'Goal Almost Reached',
      message: "You're 82% through your weekly study goal. Just 55 more minutes!",
      color: 'blue',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-indigo-500" />
                  Study Analytics
                </h1>
                <p className="text-sm text-gray-600">Track your learning journey</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Period Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center gap-2 mb-8"
        >
          {(['week', 'month', 'all'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                selectedPeriod === period
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'All Time'}
            </button>
          ))}
        </motion.div>

        {/* Key Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <StatCard
            icon={<Clock className="w-5 h-5" />}
            label="Total Time"
            value={studyStats.totalTime}
            unit="min"
            color="indigo"
          />
          <StatCard
            icon={<Flame className="w-5 h-5" />}
            label="Current Streak"
            value={studyStats.currentStreak}
            unit="days"
            color="orange"
          />
          <StatCard
            icon={<BookOpen className="w-5 h-5" />}
            label="Words Learned"
            value={studyStats.wordsLearned}
            unit=""
            color="emerald"
          />
          <StatCard
            icon={<Target className="w-5 h-5" />}
            label="Avg Accuracy"
            value={studyStats.avgAccuracy}
            unit="%"
            color="purple"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Learning Graph */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" />
                Learning Progress
              </h2>
            </div>
            
            {/* Simple bar chart */}
            <div className="space-y-3">
              {learningGraphData.map((day, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 font-medium">{day.date}</span>
                    <span className="text-gray-900">{day.minutes} min</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                        style={{ width: `${(day.minutes / 90) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-16">{day.words} words</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Weekly Goal Progress */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-500" />
              Weekly Goal
            </h2>
            
            <div className="relative pt-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-gray-900">
                  <CountUp end={studyStats.weeklyProgress} />
                  <span className="text-sm text-gray-500 font-normal">/{studyStats.weeklyGoal} min</span>
                </span>
                <span className="text-sm font-medium text-indigo-600">
                  {Math.round((studyStats.weeklyProgress / studyStats.weeklyGoal) * 100)}%
                </span>
              </div>
              
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                  style={{ width: `${(studyStats.weeklyProgress / studyStats.weeklyGoal) * 100}%` }}
                />
              </div>
              
              <p className="text-sm text-gray-600 mt-3">
                {studyStats.weeklyGoal - studyStats.weeklyProgress} minutes to reach your goal!
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="bg-emerald-50 rounded-lg p-3">
                <div className="text-xs text-emerald-700 font-medium mb-1">Sessions</div>
                <div className="text-xl font-bold text-emerald-900">
                  <CountUp end={studyStats.totalSessions} />
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="text-xs text-purple-700 font-medium mb-1">Lessons</div>
                <div className="text-xl font-bold text-purple-900">
                  <CountUp end={studyStats.lessonsCompleted} />
                </div>
              </div>
            </div>
          </motion.section>
        </div>

        {/* Streak Calendar */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl border border-gray-200 p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              Study Streak Calendar
            </h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-emerald-500 rounded" />
                <span className="text-gray-600">Studied</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 rounded" />
                <span className="text-gray-600">Missed</span>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-10 md:grid-cols-15 lg:grid-cols-20 gap-1.5">
            {streakCalendar.map((day, idx) => {
              const intensity = day.studied
                ? day.minutes > 40
                  ? 'bg-emerald-600'
                  : day.minutes > 20
                  ? 'bg-emerald-400'
                  : 'bg-emerald-200'
                : 'bg-gray-200';

              return (
                <div
                  key={idx}
                  className={`aspect-square rounded ${intensity} hover:ring-2 ring-indigo-400 cursor-pointer transition group relative`}
                  title={`${day.date}: ${day.studied ? `${day.minutes} min` : 'No study'}`}
                >
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-10">
                    {day.date.slice(5)}: {day.studied ? `${day.minutes}m` : 'Rest'}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">Current streak:</span> {studyStats.currentStreak} days
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">Best streak:</span> {studyStats.bestStreak} days
            </p>
          </div>
        </motion.section>

        {/* Module Performance */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl border border-gray-200 p-6 mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-500" />
            Module Performance
          </h2>

          <div className="space-y-4">
            {modulePerformance.map((module) => (
              <ModulePerformanceCard key={module.module} module={module} />
            ))}
          </div>
        </motion.section>

        {/* Study Goals */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl border border-gray-200 p-6 mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-500" />
            Study Goals
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studyGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </motion.section>

        {/* Insights & Recommendations */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            Insights & Recommendations
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, idx) => (
              <InsightCard key={idx} insight={insight} />
            ))}
          </div>
        </motion.section>
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Components
// ═══════════════════════════════════════════════════════════════

function StatCard({
  icon,
  label,
  value,
  unit,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-700',
    orange: 'bg-orange-50 text-orange-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    purple: 'bg-purple-50 text-purple-700',
  };

  return (
    <div className={`p-4 rounded-xl ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs font-medium opacity-80">{label}</span>
      </div>
      <p className="text-2xl font-bold">
        <CountUp end={value} />
        {unit && <span className="text-lg ml-1">{unit}</span>}
      </p>
    </div>
  );
}

function ModulePerformanceCard({ module }: { module: ModulePerformance }) {
  const colorClasses: Record<string, { bg: string; text: string; accent: string }> = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', accent: 'bg-emerald-500' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', accent: 'bg-blue-500' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', accent: 'bg-purple-500' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-700', accent: 'bg-orange-500' },
    pink: { bg: 'bg-pink-50', text: 'text-pink-700', accent: 'bg-pink-500' },
  };

  const colors = colorClasses[module.color];
  const TrendIcon = module.trend === 'up' ? TrendingUp : module.trend === 'down' ? TrendingDown : Activity;

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colors.bg} ${colors.text}`}>
            {module.icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{module.module}</h3>
            <p className="text-xs text-gray-500">{module.sessions} sessions</p>
          </div>
        </div>
        <div className={`flex items-center gap-1 ${colors.text}`}>
          <TrendIcon className="w-4 h-4" />
          <span className="text-sm font-medium">{module.avgAccuracy}%</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium text-gray-900">{module.progress}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className={`h-full ${colors.accent} transition-all`} style={{ width: `${module.progress}%` }} />
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{module.totalTime} min total</span>
          <span>{Math.round(module.totalTime / module.sessions)} min/session</span>
        </div>
      </div>
    </div>
  );
}

function GoalCard({ goal }: { goal: StudyGoal }) {
  const progress = (goal.current / goal.target) * 100;
  const isCompleted = goal.completed;

  return (
    <div
      className={`border rounded-lg p-4 transition ${
        isCompleted
          ? 'bg-emerald-50 border-emerald-200'
          : 'bg-white border-gray-200 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className={`font-semibold mb-1 ${isCompleted ? 'text-emerald-900' : 'text-gray-900'}`}>
            {goal.title}
          </h3>
          <p className="text-xs text-gray-500">Deadline: {goal.deadline}</p>
        </div>
        {isCompleted && (
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className={isCompleted ? 'text-emerald-700' : 'text-gray-900'}>
            {goal.current} / {goal.target} {goal.unit}
          </span>
          <span className={`font-medium ${isCompleted ? 'text-emerald-600' : 'text-indigo-600'}`}>
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function InsightCard({
  insight,
}: {
  insight: {
    type: string;
    icon: React.ReactNode;
    title: string;
    message: string;
    color: string;
  };
}) {
  const colorClasses: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    emerald: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-900',
      icon: 'text-emerald-600',
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-900',
      icon: 'text-orange-600',
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-900',
      icon: 'text-purple-600',
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      icon: 'text-blue-600',
    },
  };

  const colors = colorClasses[insight.color];

  return (
    <div className={`border rounded-lg p-4 ${colors.bg} ${colors.border}`}>
      <div className="flex items-start gap-3">
        <div className={colors.icon}>{insight.icon}</div>
        <div className="flex-1">
          <h3 className={`font-semibold mb-1 ${colors.text}`}>{insight.title}</h3>
          <p className="text-sm text-gray-700">{insight.message}</p>
        </div>
      </div>
    </div>
  );
}
