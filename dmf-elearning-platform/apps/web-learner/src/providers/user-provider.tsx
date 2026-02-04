'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

// Demo user for development
const DEMO_USER: User = {
  id: 'demo-user-001',
  name: 'Demo Learner',
  email: 'demo@dmf-learning.com',
  level: 'A1',
  avatar: undefined,
};

const USER_STORAGE_KEY = 'dmf-user';

// ═══════════════════════════════════════════════════════════════
// Provider
// ═══════════════════════════════════════════════════════════════

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const stored = localStorage.getItem(USER_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setUserState(parsed);
        } else {
          // Default to demo user for now
          setUserState(DEMO_USER);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(DEMO_USER));
        }
      } catch (error) {
        console.warn('Failed to load user from storage:', error);
        setUserState(DEMO_USER);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    if (newUser) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
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
    // Reset to demo user
    setUserState(DEMO_USER);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(DEMO_USER));
  };

  const value: UserContextType = {
    user,
    userId: user?.id || DEMO_USER.id,
    isLoading,
    isAuthenticated: !!user && user.id !== DEMO_USER.id,
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
export const DEMO_USER_ID = DEMO_USER.id;
