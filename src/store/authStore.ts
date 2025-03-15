import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create(
  persist<AuthState>(
    (set) => ({
      user: null,
      loading: true,

      setUser: (user) => set({ user }),

      signIn: async (email, password) => {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) throw authError;

        if (authData.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', authData.user.id)
            .maybeSingle();

          if (profileError) throw profileError;

          let userRole = profile?.role || 'user';

          if (!profile) {
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert([{ id: authData.user.id, role: userRole }])
              .select('role')
              .single();

            if (createError) throw createError;
            userRole = newProfile.role;
          }

          set({
            user: {
              id: authData.user.id,
              email: authData.user.email!,
              role: userRole,
            },
          });
        }
      },

      signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null });
      },

      fetchUser: async () => {
        set({ loading: true });

        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData.session;

        if (session?.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profileError) {
            set({ loading: false });
            return;
          }

          set({
            user: {
              id: session.user.id,
              email: session.user.email!,
              role: profile?.role || 'user',
            },
            loading: false,
          });
        } else {
          set({ user: null, loading: false });
        }
      },
    }),
    {
      name: 'auth-storage', // Key for local storage persistence
    }
  )
);
