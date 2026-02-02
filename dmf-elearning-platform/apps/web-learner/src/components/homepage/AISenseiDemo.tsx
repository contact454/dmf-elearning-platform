'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Mic, RotateCcw, ThumbsUp, ThumbsDown, Bot, Send, Sparkles } from 'lucide-react';

const demoWords = [
  { word: 'Entschuldigung', phonetic: '/ɛntˈʃʊldɪgʊŋ/', meaning: 'Xin lỗi / Xin phép' },
  { word: 'Guten Morgen', phonetic: '/ˈɡuːtən ˈmɔʁɡən/', meaning: 'Chào buổi sáng' },
  { word: 'Danke schön', phonetic: '/ˈdaŋkə ʃøːn/', meaning: 'Cảm ơn nhiều' },
];

const aiResponses = [
  { question: 'Khi nào dùng "Entschuldigung"?', answer: 'Dùng khi xin lỗi lịch sự, hoặc khi muốn hỏi đường, gọi phục vụ, hay chen vào cuộc nói chuyện.' },
  { question: 'Khác gì với "Verzeihung"?', answer: '"Verzeihung" trang trọng hơn, thường dùng khi xin lỗi lỗi lớn. "Entschuldigung" phổ biến hơn trong giao tiếp hàng ngày.' },
];

export function AISenseiDemo() {
  const [currentWord, setCurrentWord] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [score, setScore] = useState(0);
  const [isScoring, setIsScoring] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [showResponse, setShowResponse] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const word = demoWords[currentWord];

  const handleRecord = () => {
    setIsScoring(true);
    setScore(0);
    // Simulate scoring animation
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 85) {
        setScore(85);
        clearInterval(interval);
        setIsScoring(false);
      } else {
        setScore(Math.floor(progress));
      }
    }, 100);
  };

  const handleAsk = () => {
    if (!chatMessage.trim()) return;
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setShowResponse(true);
    }, 1500);
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-indigo-50/50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
            <Bot className="w-4 h-4" />
            AI Sensei
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-indigo-950 font-[family-name:var(--font-outfit)]">
            Trải Nghiệm{' '}
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Học Thông Minh
            </span>
          </h2>
          <p className="mt-4 text-lg text-indigo-700/70 max-w-2xl mx-auto">
            AI Sensei chấm điểm phát âm và giải đáp mọi thắc mắc về ngữ pháp
          </p>
        </motion.div>

        {/* Demo Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Flashcard Side */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 shadow-2xl shadow-indigo-500/30">
            <h3 className="text-white/80 text-sm font-medium mb-6 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              FLASHCARD DEMO
            </h3>

            {/* Card */}
            <motion.div
              onClick={() => setIsFlipped(!isFlipped)}
              className="relative h-64 cursor-pointer perspective-1000"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 bg-white rounded-2xl shadow-xl preserve-3d"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center p-6 backface-hidden"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <span className="text-4xl font-bold text-indigo-900 font-[family-name:var(--font-outfit)]">
                    {word.word}
                  </span>
                  <span className="mt-2 text-indigo-500 text-lg">{word.phonetic}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); }}
                    className="mt-4 p-3 bg-indigo-100 rounded-full hover:bg-indigo-200 transition-colors"
                  >
                    <Volume2 className="w-6 h-6 text-indigo-600" />
                  </button>
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-emerald-50 to-white rounded-2xl"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <span className="text-2xl font-bold text-emerald-700">
                    {word.meaning}
                  </span>
                </div>
              </motion.div>
            </motion.div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <button className="flex items-center gap-2 px-6 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors">
                <ThumbsDown className="w-5 h-5" />
                Không nhớ
              </button>
              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="p-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-colors">
                <ThumbsUp className="w-5 h-5" />
                Nhớ rồi
              </button>
            </div>

            {/* Progress */}
            <div className="mt-6">
              <div className="flex justify-between text-white/70 text-sm mb-2">
                <span>Tiến độ</span>
                <span>{currentWord + 1}/10 từ</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full"
                  initial={{ width: '10%' }}
                  animate={{ width: `${((currentWord + 1) / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* AI Sensei Side */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl">
            <h3 className="text-indigo-900 font-semibold mb-6 flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-600" />
              AI SENSEI
            </h3>

            {/* Pronunciation Score */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Mic className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-indigo-900">Chấm điểm phát âm</span>
              </div>

              {/* Waveform placeholder */}
              <div className="h-12 bg-white rounded-xl flex items-center justify-center gap-1 mb-4">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-purple-400 rounded-full"
                    animate={{
                      height: isScoring ? [8, Math.random() * 32 + 8, 8] : 8,
                    }}
                    transition={{
                      duration: 0.3,
                      repeat: isScoring ? Infinity : 0,
                      delay: i * 0.05,
                    }}
                    style={{ height: 8 }}
                  />
                ))}
              </div>

              {/* Score Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-indigo-600">Điểm phát âm</span>
                  <span className="font-bold text-indigo-900 font-[family-name:var(--font-space-grotesk)]">
                    {score}%
                  </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    animate={{ width: `${score}%` }}
                  />
                </div>
              </div>

              {score > 0 && (
                <p className="text-sm text-purple-700 bg-purple-100 px-3 py-2 rounded-lg">
                  {score >= 80 ? '🎉 Tuyệt vời! Phát âm rất chuẩn.' : "👍 Rất tốt! Chú ý âm 'sch' phát rõ hơn nhé."}
                </p>
              )}

              <button
                onClick={handleRecord}
                disabled={isScoring}
                className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50"
              >
                <Mic className="w-5 h-5" />
                {isScoring ? 'Đang phân tích...' : 'Thu âm & Chấm điểm'}
              </button>
            </div>

            {/* Chat */}
            <div className="border border-gray-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-indigo-900">Hỏi AI Sensei</span>
              </div>

              {/* Messages */}
              <div className="space-y-3 mb-4 max-h-32 overflow-y-auto">
                <AnimatePresence>
                  {showResponse && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-purple-50 rounded-xl p-3 text-sm text-purple-900"
                    >
                      <p className="font-medium mb-1">Q: {aiResponses[0].question}</p>
                      <p className="text-purple-700">{aiResponses[0].answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {isTyping && (
                  <div className="flex items-center gap-2 text-purple-600">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-purple-400 rounded-full"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                        />
                      ))}
                    </div>
                    <span className="text-sm">AI đang trả lời...</span>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder='Ví dụ: "Khi nào dùng Entschuldigung?"'
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
                  onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                />
                <button
                  onClick={handleAsk}
                  className="p-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
