'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Demo data
const weeklyActivity = [
  { day: 'Mon', words: 12, minutes: 25 },
  { day: 'Tue', words: 18, minutes: 35 },
  { day: 'Wed', words: 8, minutes: 15 },
  { day: 'Thu', words: 22, minutes: 40 },
  { day: 'Fri', words: 15, minutes: 30 },
  { day: 'Sat', words: 30, minutes: 55 },
  { day: 'Sun', words: 25, minutes: 45 },
];

const moduleBreakdown = [
  { name: 'Vocabulary', value: 45, color: '#3B82F6' },
  { name: 'Reading', value: 25, color: '#10B981' },
  { name: 'Listening', value: 15, color: '#F59E0B' },
  { name: 'Speaking', value: 10, color: '#EF4444' },
  { name: 'Writing', value: 5, color: '#8B5CF6' },
];

const levelProgress = [
  { level: 'A1', mastered: 120, learning: 30, total: 150 },
  { level: 'A2', mastered: 80, learning: 45, total: 125 },
  { level: 'B1', mastered: 40, learning: 60, total: 100 },
  { level: 'B2', mastered: 15, learning: 35, total: 50 },
];

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📊 Your Learning Analytics
          </h1>
          <p className="text-gray-600">
            Track your progress and stay motivated
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Total Words</span>
              <span className="text-3xl">📚</span>
            </div>
            <div className="text-4xl font-bold text-gray-900">285</div>
            <div className="text-sm text-green-600 mt-2">+12 this week</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Study Time</span>
              <span className="text-3xl">⏱️</span>
            </div>
            <div className="text-4xl font-bold text-gray-900">3.5h</div>
            <div className="text-sm text-green-600 mt-2">+45m today</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Current Streak</span>
              <span className="text-3xl">🔥</span>
            </div>
            <div className="text-4xl font-bold text-gray-900">7</div>
            <div className="text-sm text-gray-600 mt-2">days in a row</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Average Score</span>
              <span className="text-3xl">⭐</span>
            </div>
            <div className="text-4xl font-bold text-gray-900">87%</div>
            <div className="text-sm text-green-600 mt-2">+3% this month</div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Weekly Activity */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Weekly Activity
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="words"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Words Learned"
                />
                <Line
                  type="monotone"
                  dataKey="minutes"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Study Minutes"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Module Breakdown */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Time by Module
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={moduleBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {moduleBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Level Progress */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Progress by Level
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={levelProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="level" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="mastered" stackId="a" fill="#10B981" name="Mastered" />
              <Bar dataKey="learning" stackId="a" fill="#F59E0B" name="Learning" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Achievements */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            🏆 Recent Achievements
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-xl">
              <div className="text-4xl">🏅</div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">Week Warrior</h3>
                <p className="text-sm text-gray-600">
                  Studied 7 days in a row
                </p>
              </div>
              <div className="text-sm text-gray-500">2 days ago</div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
              <div className="text-4xl">📚</div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">Vocabulary Master</h3>
                <p className="text-sm text-gray-600">
                  Learned 100 new words
                </p>
              </div>
              <div className="text-sm text-gray-500">5 days ago</div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl">
              <div className="text-4xl">🎯</div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">Perfect Score</h3>
                <p className="text-sm text-gray-600">
                  Got 100% on a reading test
                </p>
              </div>
              <div className="text-sm text-gray-500">1 week ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
