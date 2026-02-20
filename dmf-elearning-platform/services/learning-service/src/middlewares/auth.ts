import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { ensureUserProfile } from '../services/profileService';

type JwtPayload = {
  sub?: string;
  email?: string;
  exp?: number;
  nbf?: number;
  role?: string;
  scope?: string;
  app_metadata?: {
    roles?: string[];
  };
};

type AuthenticatedUser = {
  id: string;
  email?: string;
  roles: string[];
  scopes: string[];
};

const USER_ID_PATTERN = /^[A-Za-z0-9:_-]{6,128}$/;

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

function buildAuthError(
  status: 401 | 403,
  code: string,
  message: string,
  details?: string
) {
  return {
    success: false,
    error: {
      type: 'AUTH_ERROR',
      code,
      message,
      status,
      details,
      timestamp: new Date().toISOString(),
    },
  };
}

function sendAuthError(
  res: Response,
  status: 401 | 403,
  code: string,
  message: string,
  details?: string
) {
  return res.status(status).json(buildAuthError(status, code, message, details));
}

function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice('Bearer '.length).trim();
  return token.length > 0 ? token : null;
}

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(padded, 'base64').toString('utf-8');
}

function parseJwt(token: string): { payload: JwtPayload; signingInput: string; signature: string } | null {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  const [headerPart, payloadPart, signature] = parts;
  try {
    const header = JSON.parse(decodeBase64Url(headerPart)) as { alg?: string; typ?: string };
    if (header.alg !== 'HS256') {
      return null;
    }

    const payload = JSON.parse(decodeBase64Url(payloadPart)) as JwtPayload;
    return {
      payload,
      signingInput: `${headerPart}.${payloadPart}`,
      signature,
    };
  } catch {
    return null;
  }
}

function safeCompareBase64Url(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

function verifyHs256Signature(signingInput: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signingInput)
    .digest('base64url');
  return safeCompareBase64Url(expectedSignature, signature);
}

function isValidUserId(value: string | undefined): value is string {
  return !!value && USER_ID_PATTERN.test(value);
}

function buildUserFromPayload(payload: JwtPayload): AuthenticatedUser | null {
  if (!isValidUserId(payload.sub)) {
    return null;
  }

  const scopeList = payload.scope
    ? payload.scope.split(' ').map((scope) => scope.trim()).filter(Boolean)
    : [];
  const roleList = payload.app_metadata?.roles?.filter(Boolean) ?? (payload.role ? [payload.role] : []);

  return {
    id: payload.sub,
    email: payload.email,
    roles: roleList,
    scopes: scopeList,
  };
}

async function resolveUserFromSupabaseAuthApi(token: string): Promise<AuthenticatedUser | null> {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: supabaseAnonKey,
    },
  });

  if (!response.ok) {
    return null;
  }

  const user = (await response.json()) as { id?: string; email?: string };
  if (!isValidUserId(user.id)) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    roles: [],
    scopes: [],
  };
}

async function verifyAccessToken(token: string): Promise<{ user: AuthenticatedUser | null; reason?: string }> {
  const parsed = parseJwt(token);
  if (!parsed) {
    const userFromSupabase = await resolveUserFromSupabaseAuthApi(token);
    if (userFromSupabase) {
      return { user: userFromSupabase };
    }
    return { user: null, reason: 'Malformed or unsupported JWT token' };
  }

  const nowInSeconds = Math.floor(Date.now() / 1000);
  if (typeof parsed.payload.nbf === 'number' && nowInSeconds < parsed.payload.nbf) {
    return { user: null, reason: 'Token is not valid yet' };
  }
  if (typeof parsed.payload.exp === 'number' && nowInSeconds >= parsed.payload.exp) {
    return { user: null, reason: 'Token has expired' };
  }

  const jwtSecret = process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET;
  if (jwtSecret) {
    const signatureValid = verifyHs256Signature(parsed.signingInput, parsed.signature, jwtSecret);
    if (!signatureValid) {
      return { user: null, reason: 'Token signature verification failed' };
    }

    const userFromPayload = buildUserFromPayload(parsed.payload);
    if (!userFromPayload) {
      return { user: null, reason: 'Token payload is missing a valid subject' };
    }

    return { user: userFromPayload };
  }

  const userFromSupabase = await resolveUserFromSupabaseAuthApi(token);
  if (userFromSupabase) {
    return { user: userFromSupabase };
  }

  const userFromPayload = buildUserFromPayload(parsed.payload);
  if (userFromPayload && process.env.AUTH_ALLOW_UNVERIFIED_JWT === 'true') {
    return { user: userFromPayload };
  }

  return {
    user: null,
    reason:
      'Token cannot be verified. Set SUPABASE_JWT_SECRET or SUPABASE_URL/SUPABASE_ANON_KEY in environment.',
  };
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      return sendAuthError(
        res,
        401,
        'AUTH_MISSING_TOKEN',
        'Authentication required',
        'Provide a Bearer token in the Authorization header'
      );
    }

    const verification = await verifyAccessToken(token);
    if (!verification.user) {
      return sendAuthError(
        res,
        401,
        'AUTH_INVALID_TOKEN',
        'Invalid or expired access token',
        verification.reason
      );
    }

    req.user = verification.user;
    next();
  } catch (error: any) {
    console.error('[authMiddleware] Unexpected error:', error?.message ?? error);
    return sendAuthError(res, 401, 'AUTH_INVALID_TOKEN', 'Invalid authentication token');
  }
}

export function attachAuthenticatedUserId(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.id) {
    return sendAuthError(res, 401, 'AUTH_MISSING_CONTEXT', 'Authentication context is missing');
  }

  const authenticatedUserId = req.user.id;
  const enforceSubjectMatch = process.env.AUTH_ENFORCE_SUBJECT_MATCH === 'true';
  const incomingUserIds = [
    req.params?.userId,
    typeof req.query?.userId === 'string' ? req.query.userId : undefined,
    req.body && typeof req.body === 'object' ? (req.body as Record<string, unknown>).userId : undefined,
  ].filter((value): value is string => typeof value === 'string' && value.length > 0);

  if (enforceSubjectMatch) {
    const hasMismatch = incomingUserIds.some((value) => value !== authenticatedUserId);
    if (hasMismatch) {
      return sendAuthError(
        res,
        403,
        'AUTH_FORBIDDEN',
        'You are not allowed to access another user resource'
      );
    }
  }

  if (req.params && Object.prototype.hasOwnProperty.call(req.params, 'userId')) {
    req.params.userId = authenticatedUserId;
  }

  if (req.query && typeof req.query === 'object') {
    (req.query as Record<string, unknown>).userId = authenticatedUserId;
  }

  if (!req.body || typeof req.body !== 'object') {
    req.body = {};
  }
  (req.body as Record<string, unknown>).userId = authenticatedUserId;

  next();
}

export function requireScopes(requiredScopes: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendAuthError(res, 401, 'AUTH_MISSING_CONTEXT', 'Authentication context is missing');
    }

    const hasScope = requiredScopes.every((scope) => req.user!.scopes.includes(scope));
    if (!hasScope) {
      return sendAuthError(res, 403, 'AUTH_FORBIDDEN', 'Insufficient permission scope');
    }

    next();
  };
}

export async function ensureAuthenticatedUserProfile(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.id) {
    return sendAuthError(res, 401, 'AUTH_MISSING_CONTEXT', 'Authentication context is missing');
  }

  try {
    await ensureUserProfile({
      id: req.user.id,
      email: req.user.email,
    });
    next();
  } catch (error: any) {
    console.error('[ensureAuthenticatedUserProfile] Failed to sync user:', error?.message ?? error);
    return res.status(500).json({
      success: false,
      error: {
        type: 'INTERNAL_ERROR',
        code: 'PROFILE_SYNC_FAILED',
        message: 'Failed to synchronize user profile',
        timestamp: new Date().toISOString(),
      },
    });
  }
}
