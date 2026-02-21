import { Request, Response, NextFunction } from 'express';

function sanitizeString(str: string): string {
  return str
    .replace(/[<>]/g, '') // Remove angle brackets (basic XSS)
    .trim();
}

function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') return sanitizeString(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  return obj;
}

export function sanitizeInput() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body) req.body = sanitizeObject(req.body);
    if (req.query) req.query = sanitizeObject(req.query);
    if (req.params) req.params = sanitizeObject(req.params);
    next();
  };
}
