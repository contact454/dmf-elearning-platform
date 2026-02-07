import { Request, Response, NextFunction } from 'express'

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email?: string
      }
    }
  }
}

/**
 * Simple auth middleware
 * In production, this should validate JWT tokens
 * For now, we'll use a test user from headers
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // For development: accept userId from header
    // In production: validate JWT and extract userId
    const userId = req.headers['x-user-id'] as string
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required. Provide x-user-id header.'
        }
      })
    }
    
    // Attach user to request
    req.user = {
      id: userId
    }
    
    next()
  } catch (error: any) {
    console.error('[authMiddleware] Error:', error.message)
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid authentication'
      }
    })
  }
}
