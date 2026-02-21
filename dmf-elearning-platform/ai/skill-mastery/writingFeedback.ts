/**
 * AI Writing Feedback Service — S14-01
 * Claude API → rubric-based grading → structured feedback JSON
 */
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `You are a German language teacher evaluating student writing.
Grade the submission using these 4 rubric dimensions (0-100 each):
1. grammar: correctness of grammar, verb conjugation, case usage
2. vocabulary: variety and appropriateness of vocabulary
3. coherence: logical flow, use of connectors, paragraph structure
4. taskCompletion: how well the task requirements are met

Also provide:
- corrections: array of {original, corrected, explanation, explanationVi}
- suggestions: array of improvement suggestions in German
- overallFeedback: 2-3 sentences of constructive feedback in German
- overallFeedbackVi: Same feedback in Vietnamese

Respond ONLY with valid JSON matching this schema:
{
  "grammar": number,
  "vocabulary": number, 
  "coherence": number,
  "taskCompletion": number,
  "corrections": [{"original": string, "corrected": string, "explanation": string, "explanationVi": string}],
  "suggestions": [string],
  "overallFeedback": string,
  "overallFeedbackVi": string
}`;

export interface AIWritingFeedback {
    grammar: number;
    vocabulary: number;
    coherence: number;
    taskCompletion: number;
    corrections: Array<{ original: string; corrected: string; explanation: string; explanationVi: string }>;
    suggestions: string[];
    overallFeedback: string;
    overallFeedbackVi: string;
}

export async function gradeWriting(
    submission: string,
    promptText: string,
    level: string,
): Promise<AIWritingFeedback> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const baseURL = process.env.ANTHROPIC_BASE_URL;

    if (!apiKey) {
        // Fallback: return rule-based scoring
        return fallbackGrading(submission, level);
    }

    try {
        const client = new Anthropic({ apiKey, baseURL: baseURL || undefined });

        const response = await client.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1500,
            system: SYSTEM_PROMPT,
            messages: [{
                role: 'user',
                content: `CEFR Level: ${level}\nTask: ${promptText}\n\nStudent submission:\n${submission}`,
            }],
        });

        const text = response.content[0].type === 'text' ? response.content[0].text : '';
        const parsed = JSON.parse(text);
        return parsed as AIWritingFeedback;
    } catch (error) {
        console.warn('[AI] Writing grading failed, using fallback:', error);
        return fallbackGrading(submission, level);
    }
}

function fallbackGrading(submission: string, level: string): AIWritingFeedback {
    const wordCount = submission.trim().split(/\s+/).length;
    const sentenceCount = submission.split(/[.!?]+/).filter(Boolean).length;
    const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;

    // Basic heuristic scoring
    const lengthScore = Math.min(100, wordCount * 2);
    const complexityScore = Math.min(100, avgWordsPerSentence * 10);

    return {
        grammar: Math.min(100, Math.round(lengthScore * 0.6 + complexityScore * 0.4)),
        vocabulary: Math.min(100, Math.round(lengthScore * 0.5 + 20)),
        coherence: Math.min(100, Math.round(sentenceCount > 3 ? 60 : 30)),
        taskCompletion: Math.min(100, Math.round(lengthScore * 0.7)),
        corrections: [],
        suggestions: ['Versuchen Sie, längere und komplexere Sätze zu schreiben.'],
        overallFeedback: 'Die KI-Bewertung ist momentan nicht verfügbar. Bitte lassen Sie Ihren Text von einem Lehrer überprüfen.',
        overallFeedbackVi: 'Đánh giá AI hiện không khả dụng. Vui lòng nhờ giáo viên kiểm tra bài viết.',
    };
}
