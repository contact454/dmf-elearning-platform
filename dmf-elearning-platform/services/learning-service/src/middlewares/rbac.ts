/**
 * RBAC Middleware — M6 S19-06
 * Role-based access control for teacher, admin, mentor routes
 */
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type UserRole = 'learner' | 'teacher' | 'mentor' | 'admin';

const ROLE_HIERARCHY: Record<UserRole, number> = {
    learner: 0,
    mentor: 1,
    teacher: 2,
    admin: 3,
};

/**
 * Middleware factory: requires ANY of the specified roles.
 * Reads userId from req.query.userId or req.body.userId (or auth header in production).
 */
export function requireRole(...allowedRoles: UserRole[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req.query.userId as string) || req.body?.userId;

            if (!userId) {
                return res.status(401).json({ success: false, error: 'Authentication required' });
            }

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { role: true },
            });

            if (!user) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }

            const userRole = user.role as UserRole;

            if (!allowedRoles.includes(userRole) && userRole !== 'admin') {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    required: allowedRoles,
                    current: userRole,
                });
            }

            // Attach role to request for downstream use
            (req as any).userRole = userRole;
            (req as any).authenticatedUserId = userId;
            next();
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    };
}

/**
 * Middleware: requires minimum role level (uses hierarchy)
 */
export function requireMinRole(minRole: UserRole) {
    const minLevel = ROLE_HIERARCHY[minRole];
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req.query.userId as string) || req.body?.userId;
            if (!userId) return res.status(401).json({ success: false, error: 'Authentication required' });

            const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
            if (!user) return res.status(404).json({ success: false, error: 'User not found' });

            const userLevel = ROLE_HIERARCHY[user.role as UserRole] ?? 0;
            if (userLevel < minLevel) {
                return res.status(403).json({ success: false, error: 'Insufficient permissions', required: minRole, current: user.role });
            }

            (req as any).userRole = user.role;
            (req as any).authenticatedUserId = userId;
            next();
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    };
}
