'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './auth-provider';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

interface User {
  id: string;
  name: string;
  email: string;
  level: string;
  avatar?: string;
}

interface UserContextType {
  user: User | null;
  userId: string;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  login: (userId: string) => void;
  logout: () => void;
}

// ═══════════════════════════════════════════════════════════════
// Context
// ═══════════════════════════════════════════════════════════════

const UserContext = createContext<UserContextType | undefined>(undefined);

// ═══════════════════════════════════════════════════════════════
// Provider
// ═══════════════════════════════════════════════════════════════

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const { user: authUser, isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const [user, setUserState] = useState<User | null>(null);

  useEffect(() => {
    if (!authUser) {
      setUserState(null);
      return;
    }

    setUserState({
      id: authUser.id,
      email: authUser.email,
      name: authUser.name || authUser.email,
      level: authUser.level || 'A1',
      avatar: authUser.avatar,
    });
  }, [authUser]);

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
  };

  const login = (userId: string) => {
    // For now, create a basic user object
    // In production, this would fetch user data from API
    const newUser: User = {
      id: userId,
      name: 'Learner',
      email: `${userId}@dmf-learning.com`,
      level: 'A1',
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  const value: UserContextType = {
    user,
    userId: user?.id || '',
    isLoading: isAuthLoading,
    isAuthenticated: isAuthenticated && !!user?.id,
    setUser,
    login,
    logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// ═══════════════════════════════════════════════════════════════
// Hook
// ═══════════════════════════════════════════════════════════════

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

// Export the demo user ID for backwards compatibility
export const DEMO_USER_ID = '';
