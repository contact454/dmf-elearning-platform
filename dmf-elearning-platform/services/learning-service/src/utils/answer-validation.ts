/**
 * Answer Validation Utilities
 * Fuzzy matching with Levenshtein distance for Reading exercises
 */

/**
 * Calculate Levenshtein distance between two strings
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Distance (number of edits needed)
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;

  // Create 2D array for dynamic programming
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  // Initialize base cases
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  // Fill the matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,    // deletion
          dp[i][j - 1] + 1,    // insertion
          dp[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * Calculate similarity percentage between two strings
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Similarity (0-1)
 */
export function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1.0;
  if (str1.length === 0 || str2.length === 0) return 0.0;

  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  
  return 1 - distance / maxLength;
}

/**
 * Normalize answer string for comparison
 * @param answer - Raw answer string
 * @param caseSensitive - Whether to preserve case
 * @returns Normalized string
 */
export function normalizeAnswer(answer: string, caseSensitive: boolean = false): string {
  let normalized = answer.trim();
  
  // Remove extra whitespace
  normalized = normalized.replace(/\s+/g, ' ');
  
  // Convert to lowercase if not case sensitive
  if (!caseSensitive) {
    normalized = normalized.toLowerCase();
  }
  
  return normalized;
}

/**
 * Check if answer matches with fuzzy matching
 * @param userAnswer - User's answer
 * @param correctAnswer - Correct answer
 * @param threshold - Similarity threshold (default: 0.85)
 * @param caseSensitive - Whether comparison is case sensitive
 * @returns Match result with similarity score
 */
export function fuzzyMatch(
  userAnswer: string,
  correctAnswer: string,
  threshold: number = 0.85,
  caseSensitive: boolean = false
): { matches: boolean; similarity: number; type: 'exact' | 'fuzzy' | 'incorrect' } {
  const normalizedUser = normalizeAnswer(userAnswer, caseSensitive);
  const normalizedCorrect = normalizeAnswer(correctAnswer, caseSensitive);

  // Check exact match first
  if (normalizedUser === normalizedCorrect) {
    return { matches: true, similarity: 1.0, type: 'exact' };
  }

  // Calculate similarity
  const similarity = calculateSimilarity(normalizedUser, normalizedCorrect);

  if (similarity >= threshold) {
    return { matches: true, similarity, type: 'fuzzy' };
  }

  return { matches: false, similarity, type: 'incorrect' };
}

/**
 * Check if answer matches any of the accepted answers
 * @param userAnswer - User's answer
 * @param acceptedAnswers - List of correct answers
 * @param threshold - Similarity threshold
 * @param caseSensitive - Whether comparison is case sensitive
 * @returns Best match result
 */
export function matchAnyAnswer(
  userAnswer: string,
  acceptedAnswers: string[],
  threshold: number = 0.85,
  caseSensitive: boolean = false
): { matches: boolean; similarity: number; type: 'exact' | 'fuzzy' | 'incorrect'; matchedAnswer?: string } {
  let bestMatch: { matches: boolean; similarity: number; type: 'exact' | 'fuzzy' | 'incorrect'; matchedAnswer?: string } = {
    matches: false,
    similarity: 0,
    type: 'incorrect',
    matchedAnswer: undefined,
  };

  for (const correctAnswer of acceptedAnswers) {
    const result = fuzzyMatch(userAnswer, correctAnswer, threshold, caseSensitive);
    
    if (result.matches && result.similarity > bestMatch.similarity) {
      bestMatch = { ...result, matchedAnswer: correctAnswer };
    }
    
    // If we found an exact match, no need to continue
    if (result.type === 'exact') {
      return bestMatch;
    }
  }

  return bestMatch;
}

// ═══════════════════════════════════════════════════════════════
// Exercise Type Validators
// ═══════════════════════════════════════════════════════════════

export interface ValidationResult {
  isCorrect: boolean;
  accuracyScore: number; // 0-100
  feedback: {
    type: 'exact_match' | 'fuzzy_match' | 'incorrect';
    similarity?: number;
    mistakes?: string[];
  };
}

/**
 * Validate Multiple Choice answer
 */
export function validateMultipleChoice(
  userAnswer: number,
  correctIndex: number
): ValidationResult {
  const isCorrect = userAnswer === correctIndex;
  
  return {
    isCorrect,
    accuracyScore: isCorrect ? 100 : 0,
    feedback: {
      type: isCorrect ? 'exact_match' : 'incorrect',
    },
  };
}

/**
 * Validate True/False answer
 */
export function validateTrueFalse(
  userAnswer: boolean,
  correctAnswer: boolean
): ValidationResult {
  const isCorrect = userAnswer === correctAnswer;
  
  return {
    isCorrect,
    accuracyScore: isCorrect ? 100 : 0,
    feedback: {
      type: isCorrect ? 'exact_match' : 'incorrect',
    },
  };
}

/**
 * Validate Short Answer with fuzzy matching
 */
export function validateShortAnswer(
  userAnswer: string,
  acceptedAnswers: string[],
  caseSensitive: boolean = false,
  threshold: number = 0.85
): ValidationResult {
  const result = matchAnyAnswer(userAnswer, acceptedAnswers, threshold, caseSensitive);
  
  const feedbackType = result.type === 'exact' ? 'exact_match' : result.type === 'fuzzy' ? 'fuzzy_match' : 'incorrect';
  
  return {
    isCorrect: result.matches,
    accuracyScore: result.matches ? Math.round(result.similarity * 100) : 0,
    feedback: {
      type: feedbackType,
      similarity: result.similarity,
      mistakes: result.matches ? [] : [`Expected: ${acceptedAnswers.join(' or ')}, Got: ${userAnswer}`],
    },
  };
}

/**
 * Validate Fill in the Blank (multiple blanks)
 */
export function validateFillBlank(
  userAnswers: string[],
  blanks: Array<{
    acceptedAnswers: string[];
    caseSensitive: boolean;
  }>,
  threshold: number = 0.85
): ValidationResult {
  if (userAnswers.length !== blanks.length) {
    return {
      isCorrect: false,
      accuracyScore: 0,
      feedback: {
        type: 'incorrect',
        mistakes: [`Expected ${blanks.length} answers, got ${userAnswers.length}`],
      },
    };
  }

  const results = userAnswers.map((userAnswer, index) => {
    const blank = blanks[index];
    return matchAnyAnswer(userAnswer, blank.acceptedAnswers, threshold, blank.caseSensitive);
  });

  const allCorrect = results.every(r => r.matches);
  const averageSimilarity = results.reduce((sum, r) => sum + r.similarity, 0) / results.length;
  const accuracyScore = Math.round(averageSimilarity * 100);

  const mistakes = results
    .map((result, index) => {
      if (!result.matches) {
        return `Blank ${index + 1}: Expected ${blanks[index].acceptedAnswers.join(' or ')}, Got: ${userAnswers[index]}`;
      }
      return null;
    })
    .filter((m): m is string => m !== null);

  return {
    isCorrect: allCorrect,
    accuracyScore,
    feedback: {
      type: allCorrect ? 'exact_match' : 'incorrect',
      similarity: averageSimilarity,
      mistakes,
    },
  };
}

/**
 * Validate answer based on exercise type
 */
export function validateAnswer(
  exerciseType: string,
  userAnswer: any,
  exerciseData: any
): ValidationResult {
  switch (exerciseType) {
    case 'multiple_choice':
      return validateMultipleChoice(userAnswer, exerciseData.correctIndex);
    
    case 'true_false':
      return validateTrueFalse(userAnswer, exerciseData.correctAnswer);
    
    case 'short_answer':
      return validateShortAnswer(
        userAnswer,
        exerciseData.acceptedAnswers,
        exerciseData.caseSensitive || false
      );
    
    case 'fill_blank':
      return validateFillBlank(
        userAnswer,
        exerciseData.blanks
      );
    
    default:
      throw new Error(`Unknown exercise type: ${exerciseType}`);
  }
}
