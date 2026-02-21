import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/app/[locale]/auth/login/page';

const mockPush = vi.fn();
const mockSignIn = vi.fn();
const mockSignInWithGoogle = vi.fn();
const mockSearchGet = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: mockSearchGet }),
}));

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
}));

vi.mock('@/providers', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    signInWithGoogle: mockSignInWithGoogle,
  }),
}));

describe('Login page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchGet.mockReturnValue(null);
  });

  it('submits login successfully and redirects to localized dashboard', async () => {
    mockSignIn.mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<LoginPage />);

    await user.type(screen.getByLabelText('Email'), 'learner@dmf.test');
    await user.type(screen.getByLabelText('Mật khẩu'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Đăng nhập' }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('learner@dmf.test', 'password123');
    });
    expect(mockPush).toHaveBeenCalledWith('/en/dashboard');
  });
});
