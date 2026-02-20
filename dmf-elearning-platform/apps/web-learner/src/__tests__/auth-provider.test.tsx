import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/providers/auth-provider';

const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();
const mockSignOut = vi.fn();
const mockUpdateUser = vi.fn();
const mockSignInWithOAuth = vi.fn();
let authStateCallback: ((event: string, session: any) => void) | null = null;

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signOut: mockSignOut,
      updateUser: mockUpdateUser,
      signInWithOAuth: mockSignInWithOAuth,
    },
  }),
}));

function AuthConsumer() {
  const { user, isAuthenticated, isLoading } = useAuth();
  return (
    <div>
      <div data-testid="loading">{String(isLoading)}</div>
      <div data-testid="authenticated">{String(isAuthenticated)}</div>
      <div data-testid="email">{user?.email ?? ''}</div>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authStateCallback = null;
    mockOnAuthStateChange.mockImplementation((callback) => {
      authStateCallback = callback;
      return {
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      };
    });
  });

  it('restores session on initial load (refresh lifecycle)', async () => {
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'token-123',
          user: {
            id: 'supabase-user-01',
            email: 'learner@dmf.test',
            user_metadata: { name: 'Learner', level: 'A2' },
          },
        },
      },
    });

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('email')).toHaveTextContent('learner@dmf.test');
  });

  it('updates user state on token refresh event', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
    });

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');

    act(() => {
      authStateCallback?.('TOKEN_REFRESHED', {
        access_token: 'token-refreshed',
        user: {
          id: 'supabase-user-02',
          email: 'refresh@dmf.test',
          user_metadata: { name: 'Refreshed User', level: 'B1' },
        },
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('email')).toHaveTextContent('refresh@dmf.test');
    });
  });
});
