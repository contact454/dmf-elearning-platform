import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const config: NextConfig = {
  typescript: {
    // TypeScript errors have been fixed - strict checking enabled
    ignoreBuildErrors: false,
  },
};

export default withNextIntl(config);
