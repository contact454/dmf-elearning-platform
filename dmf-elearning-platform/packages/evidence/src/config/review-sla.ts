/**
 * Review SLA Configuration (Cấu hình SLA Đánh giá)
 * 
 * Default SLA rules for evidence review.
 */

/**
 * Default SLA hours for evidence review
 */
export const REVIEW_SLA_HOURS = 72; // 3 days

/**
 * Calculate expiration date from creation date
 */
export function calculateExpirationDate(createdAt: string, slaHours: number = REVIEW_SLA_HOURS): string {
  const created = new Date(createdAt);
  const expiration = new Date(created.getTime() + slaHours * 60 * 60 * 1000);
  return expiration.toISOString();
}

/**
 * Check if review is expired
 */
export function isReviewExpired(review: { expiresAt?: string; status: string }): boolean {
  if (review.status !== 'pending') {
    return false;
  }
  if (!review.expiresAt) {
    return false;
  }
  return new Date(review.expiresAt) < new Date();
}
