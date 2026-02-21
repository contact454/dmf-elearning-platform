/**
 * FSRS Algorithm — Sprint 4 Fix 2.1
 * Free Spaced Repetition Scheduler (FSRS-5)
 * Replaces SM-2 with modern memory model
 * 
 * Based on: https://github.com/open-spaced-repetition/fsrs4anki
 * Research: Piotr Wozniak's DSR model + Bayesian optimization
 */

// ─── TYPES ───

export type Rating = 1 | 2 | 3 | 4; // Again, Hard, Good, Easy
export type State = 'new' | 'learning' | 'review' | 'relearning';

export interface FSRSCard {
    due: Date;
    stability: number;     // Memory stability (days until 90% recall)
    difficulty: number;     // Item difficulty (0-10)
    elapsedDays: number;    // Days since last review
    scheduledDays: number;  // Days until next review
    reps: number;           // Total review count
    lapses: number;         // Times forgotten (pressed Again)
    state: State;
    lastReview: Date;
}

interface SchedulingResult {
    card: FSRSCard;
    reviewLog: ReviewLog;
}

interface ReviewLog {
    rating: Rating;
    state: State;
    due: Date;
    stability: number;
    difficulty: number;
    elapsedDays: number;
    scheduledDays: number;
    review: Date;
}

// ─── FSRS Parameters (optimized defaults from FSRS-5) ───

const FSRS_PARAMS = {
    w: [
        0.4072, 1.1829, 3.1262, 15.4722,  // Initial stability for Again/Hard/Good/Easy
        7.2102, 0.5316, 1.0651, 0.0589,    // Difficulty offset + multiplier
        1.5330, 0.1418, 1.0110,             // Stability decay
        2.0580, 0.0187, 0.3470, 1.4610,    // Recall + forget curves
        0.2223, 2.8149,                      // Short-term stability
    ],
    requestRetention: 0.9,  // Target 90% recall
    maximumInterval: 36500,  // 100 years max
    easyBonus: 1.3,
    hardFactor: 1.2,
};

// ─── Core FSRS Functions ───

/**
 * Create a new FSRS card
 */
export function createCard(): FSRSCard {
    return {
        due: new Date(),
        stability: 0,
        difficulty: 0,
        elapsedDays: 0,
        scheduledDays: 0,
        reps: 0,
        lapses: 0,
        state: 'new',
        lastReview: new Date(),
    };
}

/**
 * Calculate initial stability for a new card based on rating
 */
function initStability(rating: Rating): number {
    return Math.max(0.1, FSRS_PARAMS.w[rating - 1]);
}

/**
 * Calculate initial difficulty for a new card based on rating
 */
function initDifficulty(rating: Rating): number {
    const d = FSRS_PARAMS.w[4] - Math.exp(FSRS_PARAMS.w[5] * (rating - 1)) + 1;
    return Math.min(10, Math.max(1, d));
}

/**
 * Calculate next difficulty based on current difficulty and rating
 */
function nextDifficulty(d: number, rating: Rating): number {
    const deltaD = -FSRS_PARAMS.w[6] * (rating - 3);
    const nextD = d + deltaD * (10 - d) / 9; // Mean reversion
    return Math.min(10, Math.max(1, nextD));
}

/**
 * Calculate retrievability (probability of recall)
 */
function retrievability(elapsedDays: number, stability: number): number {
    if (stability <= 0) return 0;
    return Math.pow(1 + elapsedDays / (9 * stability), -1);
}

/**
 * Calculate next stability after successful recall
 */
function nextRecallStability(d: number, s: number, r: number, rating: Rating): number {
    const hardPenalty = rating === 2 ? FSRS_PARAMS.w[15] : 1;
    const easyBonus = rating === 4 ? FSRS_PARAMS.w[16] : 1;

    return s * (
        1 +
        Math.exp(FSRS_PARAMS.w[8]) *
        (11 - d) *
        Math.pow(s, -FSRS_PARAMS.w[9]) *
        (Math.exp((1 - r) * FSRS_PARAMS.w[10]) - 1) *
        hardPenalty *
        easyBonus
    );
}

/**
 * Calculate next stability after forgetting (lapse)
 */
function nextForgetStability(d: number, s: number, r: number): number {
    return FSRS_PARAMS.w[11] *
        Math.pow(d, -FSRS_PARAMS.w[12]) *
        (Math.pow(s + 1, FSRS_PARAMS.w[13]) - 1) *
        Math.exp((1 - r) * FSRS_PARAMS.w[14]);
}

/**
 * Calculate next interval from stability
 */
function nextInterval(stability: number): number {
    const interval = (stability / FSRS_PARAMS.w[4]) *
        (Math.pow(FSRS_PARAMS.requestRetention, 1 / FSRS_PARAMS.w[4]) - 1);
    return Math.min(
        FSRS_PARAMS.maximumInterval,
        Math.max(1, Math.round(Math.max(stability * 0.9, interval)))
    );
}

/**
 * Schedule a card review based on rating
 * This is the main entry point — replaces SM-2's calculateNextReview
 */
export function scheduleReview(card: FSRSCard, rating: Rating): SchedulingResult {
    const now = new Date();
    const elapsedDays = card.state === 'new' ? 0 :
        Math.max(0, (now.getTime() - card.lastReview.getTime()) / (1000 * 60 * 60 * 24));

    let newCard: FSRSCard = { ...card };
    newCard.elapsedDays = Math.round(elapsedDays);
    newCard.lastReview = now;
    newCard.reps++;

    if (card.state === 'new') {
        // ─── NEW CARD ───
        newCard.stability = initStability(rating);
        newCard.difficulty = initDifficulty(rating);

        if (rating === 1) {
            // Again → learning
            newCard.state = 'learning';
            newCard.scheduledDays = 0;
            newCard.lapses++;
        } else {
            // Hard/Good/Easy → review
            newCard.state = 'review';
            newCard.scheduledDays = nextInterval(newCard.stability);
        }
    } else if (card.state === 'learning' || card.state === 'relearning') {
        // ─── LEARNING / RELEARNING ───
        if (rating === 1) {
            newCard.scheduledDays = 0;
            newCard.stability = initStability(1);
        } else {
            newCard.state = 'review';
            newCard.stability = rating === 2
                ? initStability(2)
                : rating === 3
                    ? initStability(3)
                    : initStability(4);
            newCard.difficulty = nextDifficulty(card.difficulty, rating);
            newCard.scheduledDays = nextInterval(newCard.stability);
        }
    } else {
        // ─── REVIEW ───
        const r = retrievability(elapsedDays, card.stability);
        newCard.difficulty = nextDifficulty(card.difficulty, rating);

        if (rating === 1) {
            // Forgot → relearning
            newCard.state = 'relearning';
            newCard.stability = nextForgetStability(newCard.difficulty, card.stability, r);
            newCard.scheduledDays = 0;
            newCard.lapses++;
        } else {
            // Remembered
            newCard.stability = nextRecallStability(newCard.difficulty, card.stability, r, rating);
            newCard.scheduledDays = nextInterval(newCard.stability);
        }
    }

    // Set due date
    newCard.due = new Date(now);
    newCard.due.setDate(newCard.due.getDate() + newCard.scheduledDays);
    newCard.due.setHours(0, 0, 0, 0);

    const reviewLog: ReviewLog = {
        rating,
        state: card.state,
        due: newCard.due,
        stability: newCard.stability,
        difficulty: newCard.difficulty,
        elapsedDays: Math.round(elapsedDays),
        scheduledDays: newCard.scheduledDays,
        review: now,
    };

    return { card: newCard, reviewLog };
}

/**
 * Convert SM-2 quality (0-5) to FSRS rating (1-4) for backward compatibility
 */
export function sm2ToFSRS(quality: 0 | 1 | 2 | 3 | 4 | 5): Rating {
    if (quality <= 1) return 1;      // Again
    if (quality === 2) return 1;     // Again (fail)
    if (quality === 3) return 2;     // Hard
    if (quality === 4) return 3;     // Good
    return 4;                         // Easy
}

/**
 * Get human-readable button labels
 */
export function getButtonLabels(): Array<{ rating: Rating; label: string; labelDe: string; labelVi: string }> {
    return [
        { rating: 1, label: 'Again', labelDe: 'Nochmal', labelVi: 'Lại' },
        { rating: 2, label: 'Hard', labelDe: 'Schwer', labelVi: 'Khó' },
        { rating: 3, label: 'Good', labelDe: 'Gut', labelVi: 'Tốt' },
        { rating: 4, label: 'Easy', labelDe: 'Leicht', labelVi: 'Dễ' },
    ];
}
