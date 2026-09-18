/**
 * Mobile auth store (Zustand + Supabase session).
 */
import { create } from 'zustand';
import { supabase } from './supabase';

interface AuthUser { id: string; email: string; fullName: string; role: string; }

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setUser:  (user: AuthUser) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user:            null,
  isAuthenticated: false,
  setUser:  (user) => set({ user, isAuthenticated: true }),
  clearUser: ()   => set({ user: null, isAuthenticated: false }),
}));

// Sync with Supabase auth state changes
supabase.auth.onAuthStateChange((_event, session) => {
  if (session?.user) {
    useAuthStore.getState().setUser({
      id:       session.user.id,
      email:    session.user.email ?? '',
      fullName: session.user.user_metadata?.full_name ?? '',
      role:     session.user.user_metadata?.role ?? 'CITIZEN',
    });
  } else {
    useAuthStore.getState().clearUser();
  }
});
