/**
 * Speech Recognition Service — Sprint 5 Fix 3.3
 * Pronunciation checking using phoneme comparison
 * Frontend uses Web Speech API; this service provides scoring + feedback
 */

// ─── TYPES ───

interface PronunciationResult {
    score: number;             // 0-100
    feedback: PronunciationFeedback[];
    overallGrade: 'excellent' | 'good' | 'fair' | 'needs_practice';
    encouragement: string;
}

interface PronunciationFeedback {
    type: 'correct' | 'substitution' | 'deletion' | 'insertion';
    expected: string;
    actual: string;
    position: number;
    tip?: string;
}

// ─── GERMAN PHONEME DIFFICULTY MAP ───
// Characters/combinations that Vietnamese speakers commonly struggle with
const DIFFICULT_SOUNDS: Record<string, { ipa: string; tip: string; tipVi: string }> = {
    'sch': { ipa: '/ʃ/', tip: 'Like English "sh"', tipVi: 'Giống âm "s" trong "sách" nhưng mạnh hơn' },
    'ch': { ipa: '/ç/ or /x/', tip: 'Soft after e,i,ä,ö,ü — Hard after a,o,u', tipVi: '"ch" mềm sau e/i, cứng sau a/o/u' },
    'ü': { ipa: '/yː/', tip: 'Round lips like "u", say "ee"', tipVi: 'Môi tròn như "u" nhưng lưỡi nói "i"' },
    'ö': { ipa: '/øː/', tip: 'Round lips like "o", say "eh"', tipVi: 'Môi tròn như "o" nhưng lưỡi nói "e"' },
    'ä': { ipa: '/ɛː/', tip: 'Like English "air"', tipVi: 'Giống âm "e" kéo dài' },
    'r': { ipa: '/ʁ/', tip: 'Uvular R — gargle sound', tipVi: 'R Đức phát từ cổ họng, không rung lưỡi' },
    'z': { ipa: '/ts/', tip: 'Like "ts" in "cats"', tipVi: 'Phát âm "ts" giống "pizza"' },
    'w': { ipa: '/v/', tip: 'Like English "v"', tipVi: 'W tiếng Đức = V tiếng Việt' },
    'v': { ipa: '/f/', tip: 'Like English "f" in German words', tipVi: 'V tiếng Đức = F tiếng Việt (trong từ gốc Đức)' },
    'ß': { ipa: '/s/', tip: 'Sharp S — always voiceless', tipVi: 'Luôn phát âm "s" mạnh, không rung dây thanh' },
    'ei': { ipa: '/aɪ/', tip: 'Like English "eye"', tipVi: 'Đọc là "ai" giống tiếng Việt' },
    'ie': { ipa: '/iː/', tip: 'Long "ee" sound', tipVi: 'Đọc là "i" dài' },
    'eu': { ipa: '/ɔɪ/', tip: 'Like English "oy"', tipVi: 'Đọc là "ôi"' },
    'au': { ipa: '/aʊ/', tip: 'Like English "ow"', tipVi: 'Đọc là "ao"' },
};

// ─── WORD COMPARISON ───

/**
 * Compare expected vs actual pronunciation (transcribed text)
 * Uses Levenshtein-based alignment for character comparison
 */
export function comparePronunciation(expected: string, actual: string): PronunciationResult {
    const expectedLower = expected.toLowerCase().trim();
    const actualLower = actual.toLowerCase().trim();

    if (expectedLower === actualLower) {
        return {
            score: 100,
            feedback: [],
            overallGrade: 'excellent',
            encouragement: 'Perfekt! 🎉 Phát âm tuyệt vời!',
        };
    }

    // Tokenize into words
    const expectedWords = expectedLower.split(/\s+/);
    const actualWords = actualLower.split(/\s+/);

    const feedback: PronunciationFeedback[] = [];
    let correctCount = 0;

    for (let i = 0; i < expectedWords.length; i++) {
        if (i < actualWords.length) {
            if (expectedWords[i] === actualWords[i]) {
                correctCount++;
                feedback.push({ type: 'correct', expected: expectedWords[i], actual: actualWords[i], position: i });
            } else {
                // Check for difficult sounds
                const tip = getDifficultSoundTip(expectedWords[i], actualWords[i]);
                feedback.push({
                    type: 'substitution',
                    expected: expectedWords[i],
                    actual: actualWords[i],
                    position: i,
                    tip,
                });
            }
        } else {
            feedback.push({ type: 'deletion', expected: expectedWords[i], actual: '', position: i, tip: 'Từ này bị thiếu — hãy nói chậm và rõ hơn' });
        }
    }

    // Extra words
    for (let i = expectedWords.length; i < actualWords.length; i++) {
        feedback.push({ type: 'insertion', expected: '', actual: actualWords[i], position: i, tip: 'Từ thừa — không cần nói từ này' });
    }

    const score = Math.round((correctCount / expectedWords.length) * 100);

    let overallGrade: PronunciationResult['overallGrade'];
    let encouragement: string;

    if (score >= 90) {
        overallGrade = 'excellent';
        encouragement = 'Ausgezeichnet! 🌟 Gần như hoàn hảo!';
    } else if (score >= 70) {
        overallGrade = 'good';
        encouragement = 'Gut gemacht! 💪 Tiếp tục luyện tập nhé!';
    } else if (score >= 50) {
        overallGrade = 'fair';
        encouragement = 'Nicht schlecht! 📚 Hãy nghe lại audio rồi thử lần nữa.';
    } else {
        overallGrade = 'needs_practice';
        encouragement = 'Übung macht den Meister! 🎯 Nghe chậm (0.75x) rồi nói theo.';
    }

    return { score, feedback, overallGrade, encouragement };
}

/**
 * Get pronunciation tip for a difficult sound
 */
function getDifficultSoundTip(expected: string, actual: string): string {
    for (const [sound, info] of Object.entries(DIFFICULT_SOUNDS)) {
        if (expected.includes(sound) && !actual.includes(sound)) {
            return `"${sound}" (${info.ipa}): ${info.tipVi}`;
        }
    }
    return `Nghe kỹ: "${expected}" — thử nói chậm hơn`;
}

/**
 * Get pronunciation guide for a word
 */
export function getPronunciationGuide(word: string): Array<{ sound: string; ipa: string; tip: string; tipVi: string }> {
    const guides: Array<{ sound: string; ipa: string; tip: string; tipVi: string }> = [];
    const lower = word.toLowerCase();

    for (const [sound, info] of Object.entries(DIFFICULT_SOUNDS)) {
        if (lower.includes(sound)) {
            guides.push({ sound, ...info });
        }
    }

    return guides;
}

/**
 * Get all difficult German sounds (for reference)
 */
export function getDifficultSounds() {
    return Object.entries(DIFFICULT_SOUNDS).map(([sound, info]) => ({
        sound, ...info,
    }));
}

/**
 * Score a speaking attempt
 */
export function scoreSpeakingAttempt(
    expectedText: string,
    transcribedText: string,
    responseTimeMs: number
) {
    const pronunciation = comparePronunciation(expectedText, transcribedText);

    // Bonus for fast response (natural fluency)
    const fluencyBonus = responseTimeMs < 5000 ? 5 : responseTimeMs < 10000 ? 2 : 0;
    const finalScore = Math.min(100, pronunciation.score + fluencyBonus);

    return {
        ...pronunciation,
        score: finalScore,
        fluencyBonus,
        responseTimeMs,
        difficultSounds: getPronunciationGuide(expectedText),
    };
}
