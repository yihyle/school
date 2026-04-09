'use client';

import { create } from 'zustand';
import type { User } from '@/types';
import { getUser } from '@/lib/api/users';

const STORAGE_KEY = 'learnhub_user';

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  login: (user: User) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,

  login: (user: User) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    set({ user, isLoggedIn: true });
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ user: null, isLoggedIn: false });
  },

  initialize: async () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const user: User = JSON.parse(stored);
      set({ user, isLoggedIn: true });
      try {
        const fresh = await getUser(user.id);
        set({ user: fresh, isLoggedIn: true });
      } catch (err: any) {
        if (err?.response?.status === 404) {
          localStorage.removeItem(STORAGE_KEY);
          set({ user: null, isLoggedIn: false });
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      set({ user: null, isLoggedIn: false });
    }
  },
}));
