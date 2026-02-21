/**
 * Security headers middleware — OWASP baseline
 *
 * Sets HTTP security headers to protect against common web vulnerabilities:
 * - XSS (Cross-Site Scripting)
 * - Clickjacking
 * - MIME type sniffing
 * - Information leakage
 *
 * @see https://owasp.org/www-project-secure-headers/
 */
import { Request, Response, NextFunction } from 'express';

export type SecurityHeadersConfig = {
    /** Enable or disable the middleware. Default: true */
    enabled: boolean;
    /** Allowed origins for CORS. Default: '*' (override in production) */
    allowedOrigins?: string[];
    /** Content Security Policy. Default: restrictive */
    csp?: string;
};

export function getSecurityHeadersConfigFromEnv(): SecurityHeadersConfig {
    return {
        enabled: process.env.SECURITY_HEADERS_ENABLED !== 'false',
        allowedOrigins: process.env.CORS_ALLOWED_ORIGINS
            ? process.env.CORS_ALLOWED_ORIGINS.split(',').map((o) => o.trim())
            : undefined,
        csp: process.env.CONTENT_SECURITY_POLICY,
    };
}

export function createSecurityHeaders(config: SecurityHeadersConfig) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!config.enabled) {
            next();
            return;
        }

        // Prevent clickjacking
        res.setHeader('X-Frame-Options', 'DENY');

        // Prevent MIME type sniffing
        res.setHeader('X-Content-Type-Options', 'nosniff');

        // XSS protection (legacy browsers)
        res.setHeader('X-XSS-Protection', '1; mode=block');

        // Referrer policy — don't leak full URL
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Don't leak server info
        res.removeHeader('X-Powered-By');

        // Permissions Policy — disable unused browser features
        res.setHeader(
            'Permissions-Policy',
            'camera=(), microphone=(self), geolocation=(), payment=()',
        );

        // Strict Transport Security (HSTS) — force HTTPS
        if (process.env.NODE_ENV === 'production') {
            res.setHeader(
                'Strict-Transport-Security',
                'max-age=31536000; includeSubDomains; preload',
            );
        }

        // Content Security Policy
        const csp =
            config.csp ??
            [
                "default-src 'self'",
                "script-src 'self'",
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' data: https:",
                "font-src 'self' https://fonts.gstatic.com",
                "connect-src 'self' https://*.supabase.co",
                "frame-ancestors 'none'",
            ].join('; ');
        res.setHeader('Content-Security-Policy', csp);

        next();
    };
}
