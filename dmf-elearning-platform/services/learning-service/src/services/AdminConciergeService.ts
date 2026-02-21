/**
 * Admin Concierge Bot — Phase 5, Sprint 5.3
 * Automated FAQ, reporting, and platform management
 * Designed for Gemini 2.5 Flash with tool calling
 */

import { getDashboardMetrics, getTrendingAlerts } from './AnalyticsService';
import { getAlerts } from './EarlyWarningService';
import { getEmbeddingStats } from './ContentEmbeddingService';
import { getPendingNudgesCount } from './NotificationService';

// ─── Types ───

export interface ConciergeQuery {
    question: string;
    adminId: string;
    language?: 'vi' | 'en' | 'de';
}

export interface ConciergeResponse {
    answer: string;
    sources: string[];
    actions: SuggestedAction[];
    category: QueryCategory;
    confidence: number;
}

type QueryCategory =
    | 'platform_stats'
    | 'student_support'
    | 'content_management'
    | 'technical'
    | 'reporting'
    | 'faq';

interface SuggestedAction {
    label: string;
    endpoint: string;
    method: string;
    description: string;
}

// ─── FAQ Knowledge Base ───

const FAQ: Array<{
    patterns: RegExp[];
    category: QueryCategory;
    answer: string;
    sources: string[];
    actions: SuggestedAction[];
}> = [
        {
            patterns: [/bao\s*nhi[eê]u.*h[oọ]c\s*vi[eê]n/i, /how\s*many.*user/i, /total.*student/i, /s[oố].*ng[ươ]ời/i],
            category: 'platform_stats',
            answer: '',  // Dynamic
            sources: ['GET /api/analytics/dashboard'],
            actions: [{ label: 'Xem dashboard', endpoint: '/api/analytics/dashboard', method: 'GET', description: 'View full analytics dashboard' }],
        },
        {
            patterns: [/c[aả]nh\s*b[aá]o/i, /warning/i, /alert/i, /nguy\s*c[oơ]/i, /risk/i],
            category: 'student_support',
            answer: '',  // Dynamic
            sources: ['GET /api/agents/warnings'],
            actions: [{ label: 'Xem cảnh báo', endpoint: '/api/agents/warnings', method: 'GET', description: 'View all active warnings' }],
        },
        {
            patterns: [/n[oộ]i\s*dung/i, /content/i, /b[aà]i\s*h[oọ]c/i, /embedding/i],
            category: 'content_management',
            answer: '',  // Dynamic
            sources: ['GET /api/recommend/embed/stats'],
            actions: [{ label: 'Thống kê content', endpoint: '/api/recommend/embed/stats', method: 'GET', description: 'View content embedding statistics' }],
        },
        {
            patterns: [/push|notification|th[oô]ng\s*b[aá]o|nudge/i],
            category: 'technical',
            answer: '',  // Dynamic
            sources: ['GET /api/notifications/pending'],
            actions: [{ label: 'Nudges pending', endpoint: '/api/notifications/pending', method: 'GET', description: 'Check pending notification nudges' }],
        },
        {
            patterns: [/b[aá]o\s*c[aá]o|report|th[oố]ng\s*k[eê]/i],
            category: 'reporting',
            answer: '',  // Dynamic
            sources: ['GET /api/analytics/dashboard', 'GET /api/adaptive/xapi/export'],
            actions: [
                { label: 'Dashboard', endpoint: '/api/analytics/dashboard', method: 'GET', description: 'Full dashboard metrics' },
                { label: 'Export xAPI', endpoint: '/api/adaptive/xapi/export', method: 'GET', description: 'Export learning data for analysis' },
            ],
        },
        {
            patterns: [/deploy|tri[eể]n\s*khai|server|cloud\s*run/i],
            category: 'technical',
            answer: 'Hệ thống đang chạy trên: Frontend (Vercel) + Backend (Cloud Run/Railway). Để deploy mới: `git push origin main` → auto-deploy qua CI/CD.',
            sources: ['DEPLOY_FREE.md'],
            actions: [],
        },
        {
            patterns: [/gemini|api\s*key|llm|ai/i],
            category: 'technical',
            answer: 'Gemini 2.5 Flash API key đã cấu hình trong .env. Các service sử dụng: NPC Conversations, Socratic Tutor, Recommendation Engine. Chi phí ước tính: ~$5/tháng (50M tokens).',
            sources: ['.env'],
            actions: [],
        },
        {
            patterns: [/help|gi[uú]p|h[ưướ]ng\s*d[aẫ]n|command|l[eệ]nh/i],
            category: 'faq',
            answer: `Các lệnh admin có sẵn:
• 📊 "Thống kê" → Dashboard metrics
• ⚠️ "Cảnh báo" → Early Warning alerts  
• 📚 "Nội dung" → Content embedding stats
• 🔔 "Thông báo" → Pending nudges
• 📋 "Báo cáo" → Full report + export
• 🚀 "Deploy" → Deployment guide
• 🤖 "Gemini" → AI service status`,
            sources: ['Admin Help'],
            actions: [],
        },
    ];

// ─── Core Function ───

/**
 * Process an admin query and return intelligent response
 * Production: Gemini 2.5 Flash with tool calling for complex queries
 */
export function processQuery(query: ConciergeQuery): ConciergeResponse {
    const q = query.question.toLowerCase();

    // Match against FAQ patterns
    for (const faq of FAQ) {
        if (faq.patterns.some(p => p.test(q))) {
            // Dynamic answers based on live data
            let answer = faq.answer;
            if (!answer) {
                answer = getDynamicAnswer(faq.category);
            }

            return {
                answer,
                sources: faq.sources,
                actions: faq.actions,
                category: faq.category,
                confidence: 0.9,
            };
        }
    }

    // No match → generic response
    return {
        answer: `Tôi chưa hiểu câu hỏi "${query.question}". Hãy thử: "thống kê", "cảnh báo", "nội dung", "thông báo", "báo cáo", hoặc "help" để xem tất cả lệnh.`,
        sources: [],
        actions: [{ label: 'Xem help', endpoint: '/api/agents/concierge', method: 'POST', description: 'Send "help" for all commands' }],
        category: 'faq',
        confidence: 0.3,
    };
}

function getDynamicAnswer(category: QueryCategory): string {
    try {
        switch (category) {
            case 'platform_stats': {
                const m = getDashboardMetrics();
                return `📊 **Platform Stats**:
• Tổng users: ${m.overview.totalUsers}
• Active hôm nay: ${m.overview.activeToday}
• Active tuần này: ${m.overview.activeThisWeek}
• Retention 7d: ${m.overview.retentionRate7d}%
• Avg accuracy: ${m.learning.avgAccuracy}%
• Total XP: ${m.gamification.totalXPAwarded.toLocaleString()}`;
            }
            case 'student_support': {
                const warnings = getAlerts({ status: 'pending' });
                const critical = warnings.filter(w => w.severity === 'critical').length;
                const high = warnings.filter(w => w.severity === 'high').length;
                return `⚠️ **Cảnh báo**: ${warnings.length} pending
• 🔴 Critical: ${critical}
• 🟠 High: ${high}
• 🟡 Medium: ${warnings.length - critical - high}
${warnings.slice(0, 3).map(w => `  → ${w.messageVi}`).join('\n')}`;
            }
            case 'content_management': {
                const stats = getEmbeddingStats();
                return `📚 **Content**: ${stats.totalItems} items embedded
• Dimension: ${stats.dimension}
• By type: ${Object.entries(stats.byType).map(([k, v]) => `${k}: ${v}`).join(', ') || 'chưa có'}
• By level: ${Object.entries(stats.byLevel).map(([k, v]) => `${k}: ${v}`).join(', ') || 'chưa có'}`;
            }
            case 'technical': {
                const pending = getPendingNudgesCount();
                return `🔔 **Notifications**: ${pending} nudges pending`;
            }
            case 'reporting': {
                const m = getDashboardMetrics();
                const alerts = getTrendingAlerts();
                return `📋 **Báo cáo nhanh**:
• DAU: ${m.overview.activeToday} | WAU: ${m.overview.activeThisWeek}
• Accuracy: ${m.learning.avgAccuracy}% | XP: ${m.gamification.totalXPAwarded}
• Streaks active: ${m.gamification.activeStreaks}
• Alerts: ${alerts.map(a => `[${a.type}] ${a.message}`).join('; ') || 'Không có'}`;
            }
            default:
                return 'Hãy thử "help" để xem danh sách lệnh.';
        }
    } catch {
        return 'Không thể lấy dữ liệu. Hãy thử lại sau.';
    }
}

/**
 * Build Gemini system prompt for complex admin queries
 */
export function buildConciergeGeminiPrompt(): string {
    return `You are the Admin Concierge for DMF E-Learning Platform. You help administrators manage the platform.

TOOLS AVAILABLE:
1. get_dashboard() → Platform statistics (DAU, WAU, retention, accuracy, XP)
2. get_warnings(severity?) → Student risk alerts (dropout, frustration, absence)
3. get_content_stats() → Content embedding statistics
4. get_pending_nudges() → Notification queue status
5. export_data(since?) → Export xAPI learning records

RULES:
1. Respond in Vietnamese
2. Always provide actionable next steps
3. For complex queries, use multiple tools
4. Present data in formatted tables when appropriate
5. Suggest relevant API endpoints for programmatic access
6. Be concise — admins are busy

RESPONSE FORMAT:
{ "answer": "Vietnamese response", "sources": ["data source"], "actions": [{"label": "action", "endpoint": "/api/...", "method": "GET"}], "confidence": 0.95 }`;
}
