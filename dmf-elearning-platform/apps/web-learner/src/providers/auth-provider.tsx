'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

interface User {
  id: string;
  email: string;
  name?: string;
  level?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, metadata?: { name?: string }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (locale?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

// ═══════════════════════════════════════════════════════════════
// Context
// ═══════════════════════════════════════════════════════════════

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ═══════════════════════════════════════════════════════════════
// Provider
// ═══════════════════════════════════════════════════════════════

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setSupabaseUser(session.user);
          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name,
            level: session.user.user_metadata?.level || 'A1',
            avatar: session.user.user_metadata?.avatar,
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name,
          level: session.user.user_metadata?.level || 'A1',
          avatar: session.user.user_metadata?.avatar,
        });
      } else {
        setSupabaseUser(null);
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signUp = async (email: string, password: string, metadata?: { name?: string }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: metadata?.name || '',
          level: 'A1',
        },
      },
    });

    if (error) {
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  };

  const signInWithGoogle = async (locale = 'en') => {
    const redirectTo = `${window.location.origin}/${locale}/auth/callback`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });

    if (error) {
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!supabaseUser) {
      throw new Error('No authenticated user');
    }

    const { error } = await supabase.auth.updateUser({
      data: {
        name: updates.name,
        level: updates.level,
        avatar: updates.avatar,
      },
    });

    if (error) {
      throw error;
    }

    // Update local state
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const getAccessToken = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.access_token ?? null;
  };

  const value: AuthContextType = {
    user,
    supabaseUser,
    isLoading,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    getAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ═══════════════════════════════════════════════════════════════
// Hook
// ═══════════════════════════════════════════════════════════════

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
