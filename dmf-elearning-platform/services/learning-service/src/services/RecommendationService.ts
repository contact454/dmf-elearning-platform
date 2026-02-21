/**
 * Recommendation Service — Phase 4, Sprint 4.2 + 4.3
 * OneRec-Think (CoT reasoning) + GR2 Reranker (diversity + anti-gaming)
 * Designed for Gemini 2.5 Flash via Vertex AI
 */

import { findSimilar, getEmbeddingStats, type SimilarityResult } from './ContentEmbeddingService';
import { getStudentProfile, type StudentBehaviorProfile } from './LRSService';

// ─── Types ───

export interface Recommendation {
    id: string;
    contentId: string;
    contentType: string;
    title: string;
    cefrLevel: string;
    score: number;          // Final score after reranking (0-100)
    explanation: string;    // CoT reasoning in Vietnamese
    reason: RecommendationReason;
    tags: string[];
}

type RecommendationReason =
    | 'weak_skill'           // Targets user's weak area
    | 'spaced_repetition'    // SRS due for review
    | 'difficulty_match'     // Matches current level
    | 'interest_based'       // Based on user's history
    | 'diversity'            // Introduces new content type
    | 'trending'             // Popular among similar learners
    | 'goal_aligned';        // Aligns with learning objectives

export interface RecommendationRequest {
    userId: string;
    count?: number;           // Default 5
    context?: string;         // What user is currently doing
    excludeIds?: string[];
    preferredTypes?: string[];
}

export interface RecommendationResponse {
    recommendations: Recommendation[];
    reasoning: string;         // Overall CoT reasoning chain
    generatedAt: Date;
    userProfile: StudentProfileSummary;
}

interface StudentProfileSummary {
    cefrLevel: string;
    strongSkills: string[];
    weakSkills: string[];
    motivationTrend: string;
    sessionsPerWeek: number;
}

// ─── OneRec-Think: Chain-of-Thought Recommendation ───

/**
 * Generate personalized recommendations with CoT reasoning
 * Production: Gemini 2.5 Flash API call
 * Dev: Rule-based recommendation engine
 */
export function getRecommendations(request: RecommendationRequest): RecommendationResponse {
    const count = request.count || 5;
    const profile = getStudentProfile(request.userId);

    // Step 1: Gather candidate content from embeddings
    const candidates = gatherCandidates(profile, request);

    // Step 2: Apply OneRec-Think scoring (CoT reasoning)
    const scored = applyOneRecThink(candidates, profile, request);

    // Step 3: Apply GR2 reranking (diversity + anti-gaming)
    const reranked = applyGR2Reranking(scored, profile);

    // Step 4: Take top N and build explanations
    const recommendations = reranked.slice(0, count).map((item, idx) => ({
        id: `rec_${Date.now()}_${idx}`,
        contentId: item.contentId,
        contentType: item.contentType,
        title: item.title,
        cefrLevel: item.cefrLevel,
        score: item.score,
        explanation: item.explanation,
        reason: item.reason,
        tags: item.tags,
    }));

    // Step 5: Build overall reasoning chain
    const reasoning = buildReasoningChain(profile, recommendations);

    return {
        recommendations,
        reasoning,
        generatedAt: new Date(),
        userProfile: {
            cefrLevel: profile.cefrLevel,
            strongSkills: profile.strongSkills.slice(0, 3),
            weakSkills: profile.weakSkills.slice(0, 3),
            motivationTrend: profile.motivationTrend,
            sessionsPerWeek: profile.sessionsPerWeek,
        },
    };
}

// ─── Candidate Gathering ───

interface ScoredCandidate {
    contentId: string;
    contentType: string;
    title: string;
    cefrLevel: string;
    score: number;
    explanation: string;
    reason: RecommendationReason;
    tags: string[];
    diversityBonus: number;
}

function gatherCandidates(
    profile: StudentBehaviorProfile,
    request: RecommendationRequest
): SimilarityResult[] {
    const stats = getEmbeddingStats();

    // Build query from user context
    const queryParts: string[] = [];

    // Add weak skills
    if (profile.weakSkills.length > 0) {
        queryParts.push(`Improve ${profile.weakSkills.join(', ')}`);
    }
    // Add CEFR level
    queryParts.push(`CEFR:${profile.cefrLevel}`);
    // Add user context
    if (request.context) queryParts.push(request.context);
    // Default query
    if (queryParts.length === 0) queryParts.push('German language learning practice');

    const query = queryParts.join(' ');
    return findSimilar(query, {
        topK: 50,
        minScore: 0.01,
        filterLevel: profile.cefrLevel,
        excludeIds: request.excludeIds,
    });
}

// ─── OneRec-Think Scoring ───

function applyOneRecThink(
    candidates: SimilarityResult[],
    profile: StudentBehaviorProfile,
    request: RecommendationRequest
): ScoredCandidate[] {
    return candidates.map(c => {
        let score = c.score * 40; // Base similarity score (max 40)
        let reason: RecommendationReason = 'difficulty_match';
        let explanation = '';

        // Boost: targets weak skills (+30)
        const isWeakSkill = profile.weakSkills.some(ws =>
            c.item.type.includes(ws) || c.item.tags.some(t => t.includes(ws))
        );
        if (isWeakSkill) {
            score += 30;
            reason = 'weak_skill';
            explanation = `${c.item.type} là điểm cần cải thiện của bạn — luyện tập sẽ giúp nâng trình nhanh hơn`;
        }

        // Boost: matching CEFR level (+15)
        if (c.item.cefrLevel === profile.cefrLevel) {
            score += 15;
            if (!explanation) explanation = `Phù hợp với trình độ ${profile.cefrLevel} hiện tại`;
        }

        // Boost: preferred type (+10)
        if (request.preferredTypes?.includes(c.item.type)) {
            score += 10;
            if (!explanation) explanation = `Loại nội dung bạn thường chọn`;
        }

        // Boost: motivation declining → easier/fun content (+10)
        if (profile.motivationTrend === 'declining' && c.item.tags.includes('fun')) {
            score += 10;
            reason = 'interest_based';
            explanation = 'Nội dung nhẹ nhàng để lấy lại hứng thú học tập';
        }

        // Penalty: already strong in this area (-15)
        const isStrongSkill = profile.strongSkills.some(ss =>
            c.item.type.includes(ss)
        );
        if (isStrongSkill) {
            score -= 15;
        }

        score = Math.max(0, Math.min(100, Math.round(score)));
        if (!explanation) explanation = `Nội dung liên quan đến chủ đề bạn đang học — độ phù hợp ${score}%`;

        return {
            contentId: c.item.id,
            contentType: c.item.type,
            title: c.item.title,
            cefrLevel: c.item.cefrLevel,
            score,
            explanation,
            reason,
            tags: c.item.tags,
            diversityBonus: 0,
        };
    }).sort((a, b) => b.score - a.score);
}

// ─── GR2 Reranking ───

function applyGR2Reranking(
    candidates: ScoredCandidate[],
    profile: StudentBehaviorProfile
): ScoredCandidate[] {
    if (candidates.length === 0) return candidates;

    // Rule 1: Diversity — ensure variety of content types
    const typeCount = new Map<string, number>();
    const maxPerType = 2;

    const reranked: ScoredCandidate[] = [];
    const remaining = [...candidates];

    // First pass: take best from each type
    const types = [...new Set(candidates.map(c => c.contentType))];
    for (const type of types) {
        const best = remaining.find(c => c.contentType === type);
        if (best) {
            best.diversityBonus = 5;
            best.score = Math.min(100, best.score + 5);
            reranked.push(best);
            remaining.splice(remaining.indexOf(best), 1);
            typeCount.set(type, 1);
        }
    }

    // Second pass: fill with highest scores, respecting maxPerType
    for (const candidate of remaining) {
        const count = typeCount.get(candidate.contentType) || 0;
        if (count >= maxPerType) {
            candidate.score = Math.max(0, candidate.score - 10); // Penalty for over-represented type
        }
        typeCount.set(candidate.contentType, count + 1);
        reranked.push(candidate);
    }

    // Rule 2: Anti-reward-hacking — penalize items that are too easy
    // (prevents user from gaming XP by only doing easy content)
    for (const item of reranked) {
        const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const userIdx = levelOrder.indexOf(profile.cefrLevel);
        const itemIdx = levelOrder.indexOf(item.cefrLevel);
        if (itemIdx < userIdx - 1) {
            // Content is 2+ levels below user → penalize
            item.score = Math.max(0, item.score - 20);
            item.explanation += ' (giảm điểm vì dưới trình độ)';
        }
    }

    // Rule 3: Boost novelty — content user hasn't seen
    // (tracked via excludeIds in request; here we just ensure varied tags)
    const seenTags = new Set<string>();
    for (const item of reranked) {
        const newTags = item.tags.filter(t => !seenTags.has(t));
        if (newTags.length > 0) {
            item.score = Math.min(100, item.score + 3);
            newTags.forEach(t => seenTags.add(t));
        }
    }

    return reranked.sort((a, b) => b.score - a.score);
}

// ─── CoT Reasoning Chain ───

function buildReasoningChain(profile: StudentBehaviorProfile, recs: Recommendation[]): string {
    const steps: string[] = [];

    // Step 1: User analysis
    steps.push(`📊 Phân tích: Trình độ ${profile.cefrLevel}, xu hướng ${profile.motivationTrend === 'rising' ? '📈 tăng' : profile.motivationTrend === 'declining' ? '📉 giảm' : '➡️ ổn định'
        }`);

    if (profile.weakSkills.length > 0) {
        steps.push(`🎯 Điểm yếu cần cải thiện: ${profile.weakSkills.join(', ')}`);
    }
    if (profile.strongSkills.length > 0) {
        steps.push(`💪 Kỹ năng tốt: ${profile.strongSkills.join(', ')}`);
    }

    // Step 2: Content matching
    const types = [...new Set(recs.map(r => r.contentType))];
    steps.push(`📚 Đã chọn ${recs.length} nội dung từ ${types.length} loại: ${types.join(', ')}`);

    // Step 3: Reranking explanation
    const weakRecs = recs.filter(r => r.reason === 'weak_skill');
    if (weakRecs.length > 0) {
        steps.push(`🔄 Ưu tiên ${weakRecs.length} bài tập cho kỹ năng yếu`);
    }

    const diverseRecs = recs.filter(r => r.reason === 'diversity');
    if (diverseRecs.length > 0) {
        steps.push(`🌈 Đa dạng hóa: thêm ${diverseRecs.length} loại nội dung mới`);
    }

    return steps.join('\n');
}

/**
 * Generate Gemini prompt for personalized recommendation
 * Used when calling Gemini 2.5 Flash API in production
 */
export function buildGeminiRecommendationPrompt(
    profile: StudentBehaviorProfile,
    contentCandidates: Array<{ id: string; title: string; type: string; level: string; tags: string[] }>,
    count: number
): string {
    return `You are an intelligent learning content recommendation engine for DMF E-Learning platform.

STUDENT PROFILE:
- CEFR Level: ${profile.cefrLevel}
- Strong skills: ${profile.strongSkills.join(', ') || 'none identified'}
- Weak skills: ${profile.weakSkills.join(', ') || 'none identified'}
- Motivation trend: ${profile.motivationTrend}
- Sessions/week: ${profile.sessionsPerWeek}
- Vocab mastered: ${profile.vocabMastered}

AVAILABLE CONTENT (${contentCandidates.length} items):
${contentCandidates.slice(0, 20).map(c => `- [${c.id}] ${c.title} (${c.type}, ${c.level}) tags: ${c.tags.join(', ')}`).join('\n')}

TASK: Select the best ${count} items for this student. For each item, provide:
1. Content ID
2. Score (0-100)
3. Explanation in Vietnamese (one sentence)
4. Reason category: weak_skill|spaced_repetition|difficulty_match|interest_based|diversity|trending|goal_aligned

RULES:
- Prioritize weak skills
- Ensure content type diversity (max 2 of same type)
- Don't recommend content 2+ levels below student
- If motivation declining, include 1 fun/easy item
- Show Chain-of-Thought reasoning

Respond in JSON format.`;
}
