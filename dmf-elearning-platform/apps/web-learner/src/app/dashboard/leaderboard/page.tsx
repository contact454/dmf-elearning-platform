'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import MagicCard from '@/components/ui/magic-card';
import NumberTicker from '@/components/ui/number-ticker';
import Confetti from '@/components/ui/confetti';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  xp: number;
  level: number;
  streak: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const CURRENT_USER_ID = 'user-m3-demo';

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('http://localhost:3006/api/gamification/leaderboard');
      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
      setLoading(false);

      // Trigger confetti on successful load
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  const topThree = leaderboard.slice(0, 3);
  const restOfLeaderboard = leaderboard.slice(3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 py-12 px-4">
      {/* Confetti Effect */}
      {showConfetti && <Confetti />}

      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/dashboard" className="inline-block mb-4 text-purple-600 hover:text-purple-700">
            ← Back to Dashboard
          </Link>
          <h1 className="text-5xl font-bold text-slate-900 mb-4">🏆 Leaderboard</h1>
          <p className="text-lg text-slate-600">See how you rank against other learners</p>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* 2nd Place */}
          {topThree[1] && (
            <div className="order-2 md:order-1 transform md:translate-y-8">
              <MagicCard
                className={`bg-gradient-to-br from-slate-300 to-slate-400 shadow-2xl p-8 text-center relative ${
                  topThree[1].userId === CURRENT_USER_ID ? 'ring-4 ring-blue-500' : ''
                }`}
                gradientColor="#E2E8F055"
              >
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <motion.div
                    className="bg-slate-400 rounded-full w-12 h-12 flex items-center justify-center text-2xl shadow-lg"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🥈
                  </motion.div>
                </div>
                <div className="mt-4 mb-4">
                  <motion.div
                    className="w-20 h-20 bg-white rounded-full mx-auto flex items-center justify-center text-4xl shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    👤
                  </motion.div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{topThree[1].username}</h3>
                <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm">
                  <p className="text-white font-semibold text-2xl">
                    <NumberTicker value={topThree[1].xp} delay={0.2} /> XP
                  </p>
                  <p className="text-white/90 text-sm">Level {topThree[1].level} • {topThree[1].streak}🔥</p>
                </div>
              </MagicCard>
            </div>
          )}

          {/* 1st Place */}
          {topThree[0] && (
            <div className="order-1 md:order-2">
              <MagicCard
                className={`bg-gradient-to-br from-amber-300 to-yellow-400 shadow-2xl p-8 text-center relative ${
                  topThree[0].userId === CURRENT_USER_ID ? 'ring-4 ring-blue-500' : ''
                }`}
                gradientColor="#FFD70055"
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                  <motion.div
                    className="bg-amber-400 rounded-full w-16 h-16 flex items-center justify-center text-4xl shadow-lg"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    👑
                  </motion.div>
                </div>
                <div className="mt-6 mb-4">
                  <motion.div
                    className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center text-5xl shadow-lg"
                    whileHover={{ scale: 1.15, rotate: -5 }}
                  >
                    👤
                  </motion.div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{topThree[0].username}</h3>
                <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                  <p className="text-white font-semibold text-3xl">
                    <NumberTicker value={topThree[0].xp} delay={0} /> XP
                  </p>
                  <p className="text-white/90">Level {topThree[0].level} • {topThree[0].streak}🔥</p>
                </div>
              </MagicCard>
            </div>
          )}

          {/* 3rd Place */}
          {topThree[2] && (
            <div className="order-3">
              <MagicCard
                className={`bg-gradient-to-br from-orange-300 to-amber-500 shadow-2xl p-8 text-center relative transform md:translate-y-16 ${
                  topThree[2].userId === CURRENT_USER_ID ? 'ring-4 ring-blue-500' : ''
                }`}
                gradientColor="#FFA50055"
              >
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <motion.div
                    className="bg-orange-400 rounded-full w-12 h-12 flex items-center justify-center text-2xl shadow-lg"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  >
                    🥉
                  </motion.div>
                </div>
                <div className="mt-4 mb-4">
                  <motion.div
                    className="w-20 h-20 bg-white rounded-full mx-auto flex items-center justify-center text-4xl shadow-lg"
                    whileHover={{ scale: 1.1, rotate: -5 }}
                  >
                    👤
                  </motion.div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{topThree[2].username}</h3>
                <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm">
                  <p className="text-white font-semibold text-2xl">
                    <NumberTicker value={topThree[2].xp} delay={0.4} /> XP
                  </p>
                  <p className="text-white/90 text-sm">Level {topThree[2].level} • {topThree[2].streak}🔥</p>
                </div>
              </MagicCard>
            </div>
          )}
        </div>

        {/* Rest of Leaderboard - Glassmorphism Table */}
        {restOfLeaderboard.length > 0 && (
          <motion.div
            className="backdrop-blur-md bg-white/60 rounded-3xl border border-white/20 shadow-2xl p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Rankings</h2>
            <div className="space-y-3">
              {restOfLeaderboard.map((entry, index) => {
                const isCurrentUser = entry.userId === CURRENT_USER_ID;
                return (
                  <motion.div
                    key={entry.userId}
                    className={`flex items-center justify-between p-5 rounded-2xl transition-all duration-200 ${
                      isCurrentUser
                        ? 'bg-blue-100 border-2 border-blue-400 shadow-lg scale-[1.02]'
                        : 'bg-white/50 border border-white/30 hover:bg-white/70'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      scale: isCurrentUser ? [1, 1.02, 1] : 1,
                    }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.1,
                      scale: {
                        repeat: isCurrentUser ? Infinity : 0,
                        duration: 2,
                        ease: 'easeInOut',
                      },
                    }}
                  >
                    <div className="flex items-center gap-6 flex-1">
                      {/* Rank */}
                      <motion.div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                          isCurrentUser ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                        whileHover={{ scale: 1.1, rotate: 10 }}
                      >
                        #{entry.rank}
                      </motion.div>

                      {/* User Info */}
                      <div className="flex-1">
                        <h3 className={`font-semibold text-lg ${
                          isCurrentUser ? 'text-blue-900' : 'text-slate-800'
                        }`}>
                          {entry.username}
                          {isCurrentUser && (
                            <motion.span
                              className="ml-2"
                              animate={{ x: [0, 5, 0] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              👈
                            </motion.span>
                          )}
                        </h3>
                        <p className="text-slate-600 text-sm">Level {entry.level}</p>
                      </div>

                      {/* Stats */}
                      <div className="text-right">
                        <p className="font-bold text-xl text-purple-600">
                          <NumberTicker value={entry.xp} delay={0.5 + index * 0.1} /> XP
                        </p>
                        <p className="text-slate-600 text-sm">{entry.streak} day streak 🔥</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {leaderboard.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-slate-600">No data available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
