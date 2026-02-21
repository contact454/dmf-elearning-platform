export type RouteAccess = 'public' | 'protected';

export type RoutePolicy = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  access: RouteAccess;
  note?: string;
};

export const routeProtectionMatrix: RoutePolicy[] = [
  { method: 'GET', path: '/api/health', access: 'public' },

  { method: 'GET', path: '/api/review/queue', access: 'protected', note: 'Vocabulary SRS queue' },
  { method: 'POST', path: '/api/review/submit', access: 'protected', note: 'Vocabulary SRS submission' },
  { method: 'GET', path: '/api/review/stats', access: 'protected', note: 'Vocabulary SRS stats' },

  { method: 'GET', path: '/api/user/streak', access: 'protected', note: 'User streak' },
  { method: 'GET', path: '/api/user/profile', access: 'protected', note: 'User profile' },
  { method: 'PATCH', path: '/api/user/profile', access: 'protected', note: 'User profile updates' },

  { method: 'GET', path: '/api/vocabulary/srs/due', access: 'protected' },
  { method: 'POST', path: '/api/vocabulary/srs/review', access: 'protected' },
  { method: 'GET', path: '/api/vocabulary/srs/progress/:userId', access: 'protected' },
  { method: 'GET', path: '/api/vocabulary/with-progress', access: 'protected' },

  { method: 'GET', path: '/api/reading/recommended', access: 'protected' },
  { method: 'POST', path: '/api/reading/submit', access: 'protected' },
  { method: 'GET', path: '/api/reading/progress', access: 'protected' },
  { method: 'POST', path: '/api/reading/vocabulary/save', access: 'protected' },
  { method: 'GET', path: '/api/reading/user/:userId/history', access: 'protected' },
  { method: 'GET', path: '/api/reading/user/:userId/stats', access: 'protected' },
  { method: 'POST', path: '/api/reading/:id/start', access: 'protected' },
  { method: 'PUT', path: '/api/reading/:id/progress', access: 'protected' },
  { method: 'POST', path: '/api/reading/:id/complete', access: 'protected' },

  { method: 'GET', path: '/api/listening/user/:userId/history', access: 'protected' },
  { method: 'GET', path: '/api/listening/user/:userId/stats', access: 'protected' },
  { method: 'POST', path: '/api/listening/exercise/:exerciseId/attempt', access: 'protected' },
  { method: 'POST', path: '/api/listening/:id/start', access: 'protected' },
  { method: 'PUT', path: '/api/listening/:id/progress', access: 'protected' },

  { method: 'GET', path: '/api/speaking/:id/attempts', access: 'protected' },
  { method: 'POST', path: '/api/speaking/:id/attempt', access: 'protected' },
  { method: 'GET', path: '/api/speaking/user/:userId/history', access: 'protected' },
  { method: 'GET', path: '/api/speaking/user/:userId/stats', access: 'protected' },

  { method: 'GET', path: '/api/writing/:id/submissions', access: 'protected' },
  { method: 'POST', path: '/api/writing/:id/submit', access: 'protected' },
  { method: 'GET', path: '/api/writing/:id/draft', access: 'protected' },
  { method: 'POST', path: '/api/writing/:id/draft', access: 'protected' },
  { method: 'GET', path: '/api/writing/user/:userId/history', access: 'protected' },
  { method: 'GET', path: '/api/writing/user/:userId/stats', access: 'protected' },

  { method: 'GET', path: '/api/hub/:userId', access: 'protected' },
  { method: 'GET', path: '/api/hub/:userId/skills', access: 'protected' },
  { method: 'GET', path: '/api/hub/:userId/daily-goals', access: 'protected' },
  { method: 'GET', path: '/api/hub/:userId/recommendation', access: 'protected' },

  { method: 'GET', path: '/api/analytics/listening/stats', access: 'protected' },
  { method: 'GET', path: '/api/analytics/listening/weekly', access: 'protected' },
  { method: 'GET', path: '/api/analytics/listening/daily', access: 'protected' },
  { method: 'GET', path: '/api/analytics/listening/recommended', access: 'protected' },
];

export const isProtectedRoute = (method: string, path: string) =>
  routeProtectionMatrix.some(
    (entry) => entry.access === 'protected' && entry.method === method.toUpperCase() && path.startsWith(entry.path)
  );
