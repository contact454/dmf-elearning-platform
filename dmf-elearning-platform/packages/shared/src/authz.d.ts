/**
 * Authorization Helpers (Trợ giúp Phân quyền)
 * Enforces STEP 8B error semantics: 403 role-only, 404 ownership hide-existence
 */
/**
 * User Role (Vai trò Người dùng)
 */
export type UserRole = 'learner' | 'teacher' | 'mentor' | 'admin' | 'system';
/**
 * Authorization Error (Lỗi Phân quyền)
 */
export declare class AuthorizationError extends Error {
    readonly statusCode: 403 | 404;
    readonly category: 'Forbidden' | 'NotFound';
    constructor(statusCode: 403 | 404, category: 'Forbidden' | 'NotFound', message: string);
}
/**
 * Forbid role (Cấm vai trò)
 * Returns 403 Forbidden for role violations per STEP 8B
 * @throws {AuthorizationError} with statusCode 403
 */
export declare function forbidRole(userRole: UserRole, allowedRoles: UserRole[]): void;
/**
 * Fail ownership check (Thất bại kiểm tra quyền sở hữu)
 * Returns 404 NotFound to hide existence per STEP 8B
 * @throws {AuthorizationError} with statusCode 404
 */
export declare function failOwnership(entityType: string, entityId: string): never;
/**
 * Check ownership (Kiểm tra quyền sở hữu)
 * Returns true if owned, throws 404 if not (hide existence)
 */
export declare function checkOwnership(ownedBy: string, requesterId: string, entityType: string, entityId: string): void;
//# sourceMappingURL=authz.d.ts.map