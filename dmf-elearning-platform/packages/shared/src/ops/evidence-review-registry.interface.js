/**
 * Evidence Review Registry Interface (Giao diện Đăng ký Đánh giá Bằng chứng)
 *
 * Interface for evidence review registry to break cyclic dependency.
 * Implementation is in @dmf/evidence, but interface is in @dmf/shared.
 */
/**
 * Registry provider function type
 *
 * This allows @dmf/evidence to register its registry implementation with @dmf/shared,
 * and @dmf/ops to get it without importing from @dmf/evidence.
 */
let registryProvider = null;
export function setEvidenceReviewRegistryProvider(provider) {
    registryProvider = provider;
}
export function getEvidenceReviewRegistry() {
    if (!registryProvider) {
        throw new Error('EvidenceReviewRegistry provider not set. Ensure @dmf/evidence is initialized.');
    }
    return registryProvider();
}
//# sourceMappingURL=evidence-review-registry.interface.js.map