'use client';

import { motion } from 'framer-motion';
import {
  BookOpen,
  Target,
  TrendingUp,
  Award,
  Clock,
  Zap,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProgressStats {
  passagesCompleted: number;
  accuracyByLevel: {
    level: string;
    averageAccuracy: number;
    attempts: number;
  }[];
  totalTimeSpentMinutes: number;
  recentAttempts: number;
  streak: {
    current: number;
    longest: number;
  };
}

interface ProgressDashboardProps {
  stats: ProgressStats;
}

export function ProgressDashboard({ stats }: ProgressDashboardProps) {
  // Calculate overall accuracy
  const overallAccuracy =
    stats.accuracyByLevel.length > 0
      ? Math.round(
          stats.accuracyByLevel.reduce((sum, item) => sum + item.averageAccuracy, 0) /
            stats.accuracyByLevel.length
        )
      : 0;

  // Pie chart colors
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="progress-dashboard space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<BookOpen className="h-5 w-5" />}
          label="Passages Completed"
          value={stats.passagesCompleted}
          color="blue"
        />
        <StatCard
          icon={<Target className="h-5 w-5" />}
          label="Overall Accuracy"
          value={`${overallAccuracy}%`}
          color="green"
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Time Spent"
          value={`${stats.totalTimeSpentMinutes}m`}
          color="orange"
        />
        <StatCard
          icon={<Zap className="h-5 w-5" />}
          label="Current Streak"
          value={`${stats.streak.current} days`}
          color="purple"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accuracy by Level - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Accuracy by CEFR Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.accuracyByLevel}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="level"
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number | undefined) => [`${(value ?? 0).toFixed(1)}%`, 'Accuracy']}
                  />
                  <Bar dataKey="averageAccuracy" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Attempts Distribution - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Attempts by Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.accuracyByLevel}
                    dataKey="attempts"
                    nameKey="level"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry: any) => `${entry.level}: ${entry.attempts}`}
                    labelLine={false}
                  >
                    {stats.accuracyByLevel.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.streak.current >= 7 && (
              <AchievementBadge
                title="Week Warrior"
                description="7-day reading streak!"
                icon="🔥"
                color="orange"
              />
            )}
            {stats.passagesCompleted >= 10 && (
              <AchievementBadge
                title="Bookworm"
                description="Completed 10 passages"
                icon="📚"
                color="blue"
              />
            )}
            {overallAccuracy >= 90 && (
              <AchievementBadge
                title="Master Reader"
                description="90%+ overall accuracy"
                icon="🏆"
                color="green"
              />
            )}
            {stats.totalTimeSpentMinutes >= 60 && (
              <AchievementBadge
                title="Dedicated Learner"
                description="1+ hour of reading"
                icon="⏰"
                color="purple"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Total exercises attempted
              </span>
              <Badge variant="secondary">{stats.recentAttempts}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Longest streak
              </span>
              <Badge variant="secondary">{stats.streak.longest} days</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Average time per passage
              </span>
              <Badge variant="secondary">
                {stats.passagesCompleted > 0
                  ? Math.round(stats.totalTimeSpentMinutes / stats.passagesCompleted)
                  : 0}{' '}
                min
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: 'blue' | 'green' | 'orange' | 'purple';
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    orange: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  };

  return (
    <motion.div
      className="stat-card bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-4">
        <div className={cn('p-3 rounded-lg', colorClasses[color])}>{icon}</div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {value}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

interface AchievementBadgeProps {
  title: string;
  description: string;
  icon: string;
  color: 'blue' | 'green' | 'orange' | 'purple';
}

function AchievementBadge({ title, description, icon, color }: AchievementBadgeProps) {
  const colorClasses = {
    blue: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
    green: 'border-green-500 bg-green-50 dark:bg-green-900/20',
    orange: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20',
    purple: 'border-purple-500 bg-purple-50 dark:bg-purple-900/20',
  };

  return (
    <div className={cn('p-4 rounded-lg border-2', colorClasses[color])}>
      <div className="flex items-start gap-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  );
}
