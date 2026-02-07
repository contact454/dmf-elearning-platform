'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { BookOpen, Mail, MapPin, Phone } from 'lucide-react';

export function Footer() {
  const t = useTranslations('footer');
  const tCommon = useTranslations('common');

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
                {tCommon('appName')}
              </span>
            </Link>
            <p className="mt-4 text-indigo-300 text-sm leading-relaxed max-w-sm">
              {tCommon('tagline')}
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

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">{t('about')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-indigo-300 hover:text-white transition-colors text-sm">
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-indigo-300 hover:text-white transition-colors text-sm">
                  {t('contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-indigo-300 hover:text-white transition-colors text-sm">
                  {t('privacy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-indigo-300 hover:text-white transition-colors text-sm">
                  {t('terms')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold text-white mb-4">{t('followUs')}</h3>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 bg-indigo-900 hover:bg-indigo-800 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-indigo-900 hover:bg-indigo-800 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-indigo-300 text-sm">
            {t('copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
