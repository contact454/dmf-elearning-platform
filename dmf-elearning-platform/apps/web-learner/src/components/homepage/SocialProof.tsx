'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, BookOpen, Trophy, Flame, Rocket, Award, Zap, Users } from 'lucide-react';

const testimonials = [
  {
    content: 'Flashcard rất dễ nhớ, học mọi lúc mọi nơi! Spaced Repetition giúp tôi không quên từ vựng.',
    author: 'An N.',
    role: 'Học viên A1',
    rating: 5,
    avatar: 'A',
  },
  {
    content: 'Đã đạt B1 sau 6 tháng học! AI Sensei giải thích ngữ pháp rất dễ hiểu.',
    author: 'Minh T.',
    role: 'Học viên B1',
    rating: 5,
    avatar: 'M',
  },
  {
    content: 'Quiz thích ứng giúp tôi tập trung vào điểm yếu. Rất hiệu quả!',
    author: 'Hương L.',
    role: 'Học viên A2',
    rating: 5,
    avatar: 'H',
  },
  {
    content: 'Bảng xếp hạng và XP khiến việc học trở nên vui như game!',
    author: 'Bình P.',
    role: 'Học viên B2',
    rating: 5,
    avatar: 'B',
  },
];

const activityTypes = [
  { icon: BookOpen, label: 'thuộc', color: 'text-blue-600', bg: 'bg-blue-100' },
  { icon: Trophy, label: 'hoàn thành Quiz', color: 'text-yellow-600', bg: 'bg-yellow-100' },
  { icon: Flame, label: 'đạt streak', color: 'text-orange-600', bg: 'bg-orange-100' },
  { icon: Rocket, label: 'lên level', color: 'text-purple-600', bg: 'bg-purple-100' },
  { icon: Award, label: 'nhận badge', color: 'text-green-600', bg: 'bg-green-100' },
  { icon: Zap, label: 'đạt', color: 'text-indigo-600', bg: 'bg-indigo-100' },
];

const generateActivity = (index: number) => {
  const names = ['An N.', 'Minh T.', 'Hương L.', 'Bình P.', 'Linh K.', 'Tuấn M.', 'Mai H.', 'Khoa D.'];
  const levels = ['A1', 'A2', 'B1', 'B2'];
  const type = activityTypes[index % activityTypes.length];
  const name = names[index % names.length];
  const level = levels[index % levels.length];

  const messages: Record<string, string> = {
    'thuộc': `${Math.floor(Math.random() * 20 + 10)} từ level ${level}`,
    'hoàn thành Quiz': `${level} - ${Math.floor(Math.random() * 20 + 80)}% đúng`,
    'đạt streak': `${Math.floor(Math.random() * 10 + 3)} ngày liên tục`,
    'lên level': `${levels[index % (levels.length - 1)]} → ${levels[(index % (levels.length - 1)) + 1]}`,
    'nhận badge': '"Siêng năng"',
    'đạt': `${Math.floor(Math.random() * 500 + 100)} XP`,
  };

  const xp = Math.floor(Math.random() * 100 + 20);
  const time = index === 0 ? 'Vừa xong' : `${index * 2} phút trước`;

  return {
    id: index,
    name,
    type,
    message: messages[type.label],
    xp,
    time,
  };
};

export function SocialProof() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [activities, setActivities] = useState(() =>
    Array.from({ length: 5 }, (_, i) => generateActivity(i))
  );
  const [onlineCount, setOnlineCount] = useState(2547);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto-add activities
  useEffect(() => {
    const interval = setInterval(() => {
      setActivities((prev) => {
        const newActivity = generateActivity(Date.now());
        return [newActivity, ...prev.slice(0, 4)];
      });
      setOnlineCount((prev) => prev + Math.floor(Math.random() * 5) - 2);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-indigo-950 font-[family-name:var(--font-outfit)]">
            Cộng Đồng{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Sôi Động
            </span>
          </h2>
          <p className="mt-4 text-lg text-indigo-700/70">
            Tham gia cùng hàng nghìn học viên đang chinh phục tiếng Đức
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Testimonials */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 min-h-[400px]">
              <Quote className="w-12 h-12 text-indigo-200 mb-6" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTestimonial}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-xl text-indigo-900 font-medium leading-relaxed mb-8">
                    "{testimonials[currentTestimonial].content}"
                  </p>

                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {testimonials[currentTestimonial].avatar}
                    </div>
                    <div>
                      <div className="font-bold text-indigo-900">
                        {testimonials[currentTestimonial].author}
                      </div>
                      <div className="text-indigo-600 text-sm">
                        {testimonials[currentTestimonial].role}
                      </div>
                      <div className="flex gap-0.5 mt-1">
                        {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Dots */}
              <div className="flex justify-center gap-2 mt-8">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentTestimonial(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      i === currentTestimonial
                        ? 'bg-indigo-600 w-8'
                        : 'bg-indigo-300 hover:bg-indigo-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Live Activity Feed */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                </div>
                <span className="font-bold text-indigo-900">LIVE ACTIVITY</span>
              </div>
              <div className="flex items-center gap-2 text-indigo-600 text-sm">
                <Users className="w-4 h-4" />
                <span className="font-[family-name:var(--font-space-grotesk)] font-semibold">
                  {onlineCount.toLocaleString()}
                </span>
                <span>đang học</span>
              </div>
            </div>

            {/* Activity List */}
            <div className="space-y-3 max-h-[320px] overflow-hidden">
              <AnimatePresence initial={false}>
                {activities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: -20, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gray-50 rounded-xl p-4 flex items-center gap-4"
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {activity.name[0]}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-indigo-900">{activity.name}</span>
                        <span className="text-indigo-700">{activity.type.label}</span>
                        <span className="text-indigo-900 font-medium">{activity.message}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm">
                        <span className={`flex items-center gap-1 ${activity.type.color}`}>
                          <Zap className="w-3 h-3" />
                          +{activity.xp} XP
                        </span>
                        <span className="text-gray-400">{activity.time}</span>
                      </div>
                    </div>

                    {/* Icon */}
                    <div className={`w-10 h-10 ${activity.type.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <activity.type.icon className={`w-5 h-5 ${activity.type.color}`} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
