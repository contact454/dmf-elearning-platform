'use client';

import Link from 'next/link';
import { BookOpen, Mail, MapPin, Phone } from 'lucide-react';

const footerLinks = {
  product: {
    title: 'Sản phẩm',
    links: [
      { label: 'Khoá học A1-C2', href: '/learn/german' },
      { label: 'Flashcards', href: '/practice/flashcard' },
      { label: 'Quiz Game', href: '/quiz' },
      { label: 'AI Sensei', href: '/ai-sensei' },
    ],
  },
  resources: {
    title: 'Tài nguyên',
    links: [
      { label: 'Blog', href: '/blog' },
      { label: 'Hướng dẫn', href: '/guides' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Cộng đồng', href: '/community' },
    ],
  },
  company: {
    title: 'Công ty',
    links: [
      { label: 'Về chúng tôi', href: '/about' },
      { label: 'Liên hệ', href: '/contact' },
      { label: 'Tuyển dụng', href: '/careers' },
      { label: 'Đối tác', href: '/partners' },
    ],
  },
  legal: {
    title: 'Pháp lý',
    links: [
      { label: 'Điều khoản', href: '/terms' },
      { label: 'Chính sách', href: '/privacy' },
      { label: 'Cookie', href: '/cookies' },
    ],
  },
};

export function Footer() {
  return (
    <footer className="bg-indigo-950 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold font-[family-name:var(--font-outfit)]">
                DMF German
              </span>
            </Link>
            <p className="mt-4 text-indigo-300 text-sm leading-relaxed max-w-sm">
              Nền tảng học tiếng Đức thông minh với AI, giúp bạn chinh phục ngôn ngữ
              một cách hiệu quả và thú vị.
            </p>

            {/* Contact Info */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-indigo-300 text-sm">
                <Mail className="w-4 h-4" />
                <span>support@dmfgerman.com</span>
              </div>
              <div className="flex items-center gap-3 text-indigo-300 text-sm">
                <Phone className="w-4 h-4" />
                <span>+84 123 456 789</span>
              </div>
              <div className="flex items-center gap-3 text-indigo-300 text-sm">
                <MapPin className="w-4 h-4" />
                <span>Ho Chi Minh City, Vietnam</span>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="font-semibold text-white mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-indigo-300 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* German Flag Decoration */}
        <div className="mt-12 flex justify-center">
          <div className="flex gap-2">
            <div className="w-12 h-3 bg-black rounded-full" />
            <div className="w-12 h-3 bg-red-500 rounded-full" />
            <div className="w-12 h-3 bg-yellow-400 rounded-full" />
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-indigo-400 text-sm">
              © {new Date().getFullYear()} DMF German. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-300 hover:text-white hover:bg-indigo-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-300 hover:text-white hover:bg-indigo-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-300 hover:text-white hover:bg-indigo-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
