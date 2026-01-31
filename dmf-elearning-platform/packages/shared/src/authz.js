/**
 * Authorization Helpers (Trợ giúp Phân quyền)
 * Enforces STEP 8B error semantics: 403 role-only, 404 ownership hide-existence
 */
/**
 * Authorization Error (Lỗi Phân quyền)
 */
export class AuthorizationError extends Error {
    statusCode;
    category;
    constructor(statusCode, category, message) {
        super(message);
        this.statusCode = statusCode;
        this.category = category;
        this.name = 'AuthorizationError';
    }
}
/**
 * Forbid role (Cấm vai trò)
 * Returns 403 Forbidden for role violations per STEP 8B
 * @throws {AuthorizationError} with statusCode 403
 */
export function forbidRole(userRole, allowedRoles) {
    if (!allowedRoles.includes(userRole)) {
        throw new AuthorizationError(403, 'Forbidden', `Role "${userRole}" is not allowed. Allowed roles: ${allowedRoles.join(', ')}`);
    }
}
/**
 * Fail ownership check (Thất bại kiểm tra quyền sở hữu)
 * Returns 404 NotFound to hide existence per STEP 8B
 * @throws {AuthorizationError} with statusCode 404
 */
export function failOwnership(entityType, entityId) {
    throw new AuthorizationError(404, 'NotFound', `${entityType} with id "${entityId}" not found` // Generic message to hide existence
    );
}
/**
 * Check ownership (Kiểm tra quyền sở hữu)
 * Returns true if owned, throws 404 if not (hide existence)
 */
export function checkOwnership(ownedBy, requesterId, entityType, entityId) {
    if (ownedBy !== requesterId) {
        failOwnership(entityType, entityId);
    }
}
//# sourceMappingURL=authz.js.map