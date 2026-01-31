import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      initializeAuth: () => {
        const stored = JSON.parse(localStorage.getItem('auth-storage') || '{}');
        if (stored?.state?.token) {
          return {
            user: stored.state.user,
            token: stored.state.token,
            isAuthenticated: true,
          };
        }
        return { user: null, token: null, isAuthenticated: false };
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
