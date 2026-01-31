/**
 * Evidence Review Registry Interface (Giao diện Đăng ký Đánh giá Bằng chứng)
 *
 * Interface for evidence review registry to break cyclic dependency.
 * Implementation is in @dmf/evidence, but interface is in @dmf/shared.
 */
export interface ReviewQueueFilter {
    status?: 'pending' | 'approved' | 'rejected' | 'expired';
    reviewerRole?: 'teacher' | 'mentor';
    courseId?: string;
    lessonId?: string;
}
export interface ReviewQueueItem {
    reviewId: string;
    evidenceId: string;
    userId: string;
    reviewerId?: string;
    reviewerRole?: 'teacher' | 'mentor';
    status: 'pending' | 'approved' | 'rejected' | 'expired';
    courseId?: string;
    lessonId?: string;
    submittedAt?: string;
    createdAt?: string;
    reviewedAt?: string;
    expiresAt?: string;
}
/**
 * Evidence Review Registry Interface
 *
 * This interface allows @dmf/ops to depend on the registry without importing from @dmf/evidence.
 */
export interface EvidenceReviewRegistry {
    getReviewQueue(filter?: ReviewQueueFilter): ReviewQueueItem[];
}
export declare function setEvidenceReviewRegistryProvider(provider: () => EvidenceReviewRegistry): void;
export declare function getEvidenceReviewRegistry(): EvidenceReviewRegistry;
//# sourceMappingURL=evidence-review-registry.interface.d.ts.map