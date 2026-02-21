'use client';

import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { Sparkles, ArrowRight, CheckCircle } from 'lucide-react';

const benefits = [
  'Không cần thẻ tín dụng',
  'Huỷ bất cứ lúc nào',
  '7 ngày dùng thử miễn phí',
];

export function CTASection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-5xl mx-auto"
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 rounded-[2.5rem] p-8 sm:p-12 lg:p-16">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          {/* German flag accent */}
          <div className="absolute top-8 right-8 flex gap-1 opacity-50">
            <div className="w-8 h-2 bg-black rounded-full" />
            <div className="w-8 h-2 bg-yellow-400 rounded-full" />
            <div className="w-8 h-2 bg-red-500 rounded-full" />
          </div>

          <div className="relative z-10 text-center">
            {/* Badge */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white/90 rounded-full text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              Bắt đầu hành trình của bạn
            </motion.div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-[family-name:var(--font-outfit)] leading-tight">
              Sẵn sàng chinh phục
              <br />
              <span className="text-yellow-300">Tiếng Đức?</span>
            </h2>

            {/* Subheadline */}
            <p className="mt-6 text-lg text-white/80 max-w-2xl mx-auto">
              Tham gia cùng 2,500+ học viên đang học tiếng Đức mỗi ngày.
              Bắt đầu miễn phí ngay hôm nay!
            </p>

            {/* CTA Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-10"
            >
              <Link
                href="/auth/login"
                className="group inline-flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold text-lg rounded-2xl shadow-2xl shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105 transition-all duration-300"
              >
                <Sparkles className="w-6 h-6" />
                Tạo Tài Khoản Miễn Phí
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex flex-wrap justify-center gap-6"
            >
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-2 text-white/80">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>{benefit}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
