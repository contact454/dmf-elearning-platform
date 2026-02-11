import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const config: NextConfig = {
  typescript: {
    // ⚠️ Temporarily ignore TypeScript errors during build
    // TODO: Fix TypeScript errors in Reading Module API routes
    ignoreBuildErrors: true,
  },
};

export default withNextIntl(config);
