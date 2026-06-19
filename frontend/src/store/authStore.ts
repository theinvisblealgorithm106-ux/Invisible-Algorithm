'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  hasRole: (role: string | string[]) => boolean;
}

const roleHierarchy: Record<string, number> = {
  student: 0,
  member: 1,
  researcher: 2,
  admin: 3,
  super_admin: 4,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user, accessToken, refreshToken) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
        }
        set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false });
      },

      setUser: (user) => set({ user }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },

      hasRole: (role) => {
        const { user } = get();
        if (!user) return false;
        const userLevel = roleHierarchy[user.role] ?? -1;
        if (Array.isArray(role)) {
          return role.some((r) => userLevel >= (roleHierarchy[r] ?? Infinity));
        }
        return userLevel >= (roleHierarchy[role] ?? Infinity);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
