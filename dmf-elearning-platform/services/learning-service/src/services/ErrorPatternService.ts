/**
 * Error Pattern Service — Sprint 4 Fix 2.8
 * Tracks learning errors, identifies patterns, and generates targeted recommendations
 */

type ErrorType = 'grammar' | 'vocabulary' | 'spelling' | 'pronunciation' | 'comprehension' | 'word_order';
type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2';

export interface LearningError {
    userId: string;
    type: ErrorType;
    skill: 'vocabulary' | 'reading' | 'listening' | 'speaking' | 'writing' | 'grammar';
    details: string;       // e.g., "Confused der/die/das"
    context: string;       // e.g., "Article exercise A1"
    timestamp: Date;
    level: CEFRLevel;
}

interface ErrorPattern {
    type: ErrorType;
    count: number;
    percentage: number;
    examples: string[];
    frequency: 'high' | 'medium' | 'low';
    trend: 'improving' | 'stable' | 'worsening';
}

interface WeaknessReport {
    userId: string;
    analyzedErrors: number;
    topWeaknesses: ErrorPattern[];
    recommendations: Recommendation[];
    overallAccuracy: number;
}

interface Recommendation {
    priority: 'high' | 'medium' | 'low';
    type: ErrorType;
    title: string;
    description: string;
    suggestedExercise: string;
    estimatedMinutes: number;
}

// In-memory error store (in production, use DB)
const errorStore = new Map<string, LearningError[]>();

/**
 * Record a learning error
 */
export function recordError(error: LearningError): void {
    const existing = errorStore.get(error.userId) || [];
    existing.push({ ...error, timestamp: new Date() });

    // Keep last 200 errors per user
    if (existing.length > 200) existing.splice(0, existing.length - 200);

    errorStore.set(error.userId, existing);
}

/**
 * Analyze error patterns for a user
 */
export function analyzePatterns(userId: string, days = 30): ErrorPattern[] {
    const errors = errorStore.get(userId) || [];
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const recent = errors.filter(e => e.timestamp >= cutoff);

    if (recent.length === 0) return [];

    // Group by error type
    const groups = new Map<ErrorType, LearningError[]>();
    for (const e of recent) {
        const existing = groups.get(e.type) || [];
        existing.push(e);
        groups.set(e.type, existing);
    }

    // Build patterns
    const patterns: ErrorPattern[] = [];
    for (const [type, typeErrors] of groups) {
        const count = typeErrors.length;
        const percentage = Math.round((count / recent.length) * 100);
        const examples = [...new Set(typeErrors.map(e => e.details))].slice(0, 3);

        // Determine frequency
        let frequency: 'high' | 'medium' | 'low' = 'low';
        if (percentage > 40) frequency = 'high';
        else if (percentage > 20) frequency = 'medium';

        // Determine trend (compare first half vs second half)
        const mid = recent.length / 2;
        const firstHalf = typeErrors.filter((_, i) => i < mid).length;
        const secondHalf = typeErrors.filter((_, i) => i >= mid).length;
        let trend: 'improving' | 'stable' | 'worsening' = 'stable';
        if (secondHalf < firstHalf * 0.7) trend = 'improving';
        else if (secondHalf > firstHalf * 1.3) trend = 'worsening';

        patterns.push({ type, count, percentage, examples, frequency, trend });
    }

    return patterns.sort((a, b) => b.count - a.count);
}

/**
 * Generate weakness report with recommendations
 */
export function getWeaknessReport(userId: string): WeaknessReport {
    const errors = errorStore.get(userId) || [];
    const patterns = analyzePatterns(userId);
    const recommendations: Recommendation[] = [];

    // Generate targeted recommendations based on patterns
    for (const pattern of patterns.slice(0, 5)) {
        const rec = generateRecommendation(pattern);
        if (rec) recommendations.push(rec);
    }

    return {
        userId,
        analyzedErrors: errors.length,
        topWeaknesses: patterns.slice(0, 5),
        recommendations,
        overallAccuracy: errors.length > 0 ? 100 - patterns.reduce((sum, p) => sum + p.percentage, 0) : 100,
    };
}

/**
 * Generate recommendation for a specific error pattern
 */
function generateRecommendation(pattern: ErrorPattern): Recommendation | null {
    const recommendations: Record<ErrorType, Recommendation> = {
        grammar: {
            priority: pattern.frequency === 'high' ? 'high' : 'medium',
            type: 'grammar',
            title: 'Luyện ngữ pháp',
            description: `Bạn hay sai ở phần ngữ pháp (${pattern.examples.join(', ')}). Hãy tập trung vào bài tập ngữ pháp tương tác.`,
            suggestedExercise: '/api/grammar/exercises?type=fill_blank',
            estimatedMinutes: 10,
        },
        vocabulary: {
            priority: pattern.frequency === 'high' ? 'high' : 'medium',
            type: 'vocabulary',
            title: 'Ôn từ vựng yếu',
            description: `Bạn cần ôn lại các từ hay quên (${pattern.examples.join(', ')}). Review SRS sẽ giúp nhớ lâu hơn.`,
            suggestedExercise: '/api/vocabulary/srs/due',
            estimatedMinutes: 8,
        },
        spelling: {
            priority: 'medium',
            type: 'spelling',
            title: 'Luyện chính tả',
            description: `Chú ý cách viết tiếng Đức — đặc biệt ä, ö, ü, ß. (${pattern.examples.join(', ')})`,
            suggestedExercise: '/api/grammar/exercises?type=fill_blank',
            estimatedMinutes: 5,
        },
        pronunciation: {
            priority: 'medium',
            type: 'pronunciation',
            title: 'Luyện phát âm',
            description: `Phát âm cần cải thiện (${pattern.examples.join(', ')}). Nghe và nhắc lại với audio slow.`,
            suggestedExercise: '/api/grammar/pronunciation',
            estimatedMinutes: 7,
        },
        comprehension: {
            priority: pattern.frequency === 'high' ? 'high' : 'low',
            type: 'comprehension',
            title: 'Luyện đọc hiểu',
            description: `Đọc hiểu cần cải thiện. Tập đọc bài ở level thấp hơn 1 bậc rồi tăng dần.`,
            suggestedExercise: '/api/reading/recommended',
            estimatedMinutes: 10,
        },
        word_order: {
            priority: 'medium',
            type: 'word_order',
            title: 'Luyện trật tự câu',
            description: `Tiếng Đức có trật tự câu đặc biệt (V2, Nebensatz). Tập sắp xếp câu.`,
            suggestedExercise: '/api/grammar/exercises?type=reorder',
            estimatedMinutes: 8,
        },
    };

    return recommendations[pattern.type] || null;
}

/**
 * Clear error history
 */
export function clearErrors(userId: string): void {
    errorStore.delete(userId);
}
