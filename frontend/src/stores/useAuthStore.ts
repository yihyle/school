'use client';

import { create } from 'zustand';
import type { User } from '@/types';
import { getMe } from '@/lib/api/auth';

const TOKEN_KEY = 'learnhub_token';
const USER_KEY = 'learnhub_user';

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,

  login: (token: string, user: User) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ user, isLoggedIn: true });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ user: null, isLoggedIn: false });
  },

  initialize: async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const stored = localStorage.getItem(USER_KEY);
      if (!token || !stored) return;

      const user: User = JSON.parse(stored);
      set({ user, isLoggedIn: true });

      try {
        const fresh = await getMe();
        set({ user: fresh, isLoggedIn: true });
        localStorage.setItem(USER_KEY, JSON.stringify(fresh));
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        set({ user: null, isLoggedIn: false });
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      set({ user: null, isLoggedIn: false });
    }
  },
}));
