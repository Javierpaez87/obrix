import { useState, useEffect } from 'react';
import { User as SupabaseUser, AuthError, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient'; // 👈 IMPORT CORREGIDO
import { User } from '../types';

interface AuthState {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
}

// Helper para mapear una fila de "profiles" a tu tipo User
const mapProfileRowToUser = (row: any): User => ({
  id: row.id,
  name: row.name || '',
  email: row.email,
  phone: row.phone || '',
  role: (row.role as 'constructor' | 'client') ?? 'constructor',
  company: row.company || '',
  avatar: row.avatar_url || '',
});

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    supabaseUser: null,
    session: null,
    loading: true,
    error: null,
  });

  // Busca perfil; si no existe y tengo session.user, lo crea
  const fetchOrCreateProfile = async (sessionUser: SupabaseUser): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows, puede variar según versión
        console.error('Error fetching profile:', error);
        return null;
      }

      if (data) {
        return mapProfileRowToUser(data);
      }

      // No había fila: la creamos
      const insertPayload = {
        id: sessionUser.id,
        email: sessionUser.email,
        name: (sessionUser.user_metadata as any)?.name || sessionUser.email,
        role: 'constructor', // 👈 default, ajustá si querés
        phone: (sessionUser.user_metadata as any)?.phone || null,
        company: null,
        avatar_url: (sessionUser.user_metadata as any)?.picture || null,
      };

      const { data: inserted, error: insertError } = await supabase
        .from('profiles')
        .insert(insertPayload)
        .select('*')
        .maybeSingle();

      if (insertError) {
        console.error('Error creating profile:', insertError);
        return null;
      }

      if (!inserted) return null;

      return mapProfileRowToUser(inserted);
    } catch (err) {
      console.error('Error in fetchOrCreateProfile:', err);
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          const profile = await fetchOrCreateProfile(session.user);

          setAuthState({
            user: profile, // puede ser null si algo falló, pero supabaseUser igual existe
            supabaseUser: session.user,
            session,
            loading: false,
            error: null,
          });
        } else {
          setAuthState({
            user: null,
            supabaseUser: null,
            session: null,
            loading: false,
            error: null,
          });
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setAuthState({
          user: null,
          supabaseUser: null,
          session: null,
          loading: false,
          error: err as AuthError,
        });
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
          const profile = await fetchOrCreateProfile(session.user);
          setAuthState({
            user: profile,
            supabaseUser: session.user,
            session,
            loading: false,
            error: null,
          });
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            user: null,
            supabaseUser: null,
            session: null,
            loading: false,
            error: null,
          });
        }
      })();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, role: 'constructor' | 'client', name?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email,
            role,
          },
        },
      });

      if (error) {
        setAuthState((prev) => ({ ...prev, error }));
        return { error };
      }

      if (data.user) {
        await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email,
            name: name || email,
            role,
          })
          .eq('id', data.user.id);
      }

      return { data, error: null };
    } catch (err) {
      const error = err as AuthError;
      setAuthState((prev) => ({ ...prev, error }));
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthState((prev) => ({ ...prev, error }));
        return { error };
      }

      return { data, error: null };
    } catch (err) {
      const error = err as AuthError;
      setAuthState((prev) => ({ ...prev, error }));
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
        },
      });

      if (error) {
        setAuthState((prev) => ({ ...prev, error }));
        return { error };
      }

      return { data, error: null };
    } catch (err) {
      const error = err as AuthError;
      setAuthState((prev) => ({ ...prev, error }));
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setAuthState((prev) => ({ ...prev, error }));
        return { error };
      }
      return { error: null };
    } catch (err) {
      const error = err as AuthError;
      setAuthState((prev) => ({ ...prev, error }));
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { error };
      }

      return { data, error: null };
    } catch (err) {
      return { error: err as AuthError };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { error };
      }

      return { data, error: null };
    } catch (err) {
      return { error: err as AuthError };
    }
  };

  const deleteAccount = async () => {
    try {
      const { error } = await supabase.rpc('delete_user');

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (err) {
      return { error: err as AuthError };
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!authState.user?.id) {
      return { error: new Error('No user logged in') };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: updates.name,
          phone: updates.phone,
          company: updates.company,
          avatar_url: updates.avatar,
          role: updates.role,
        })
        .eq('id', authState.user.id);

      if (error) {
        return { error };
      }

      const updatedProfile = await fetchOrCreateProfile(authState.supabaseUser!);
      setAuthState((prev) => ({
        ...prev,
        user: updatedProfile,
      }));

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  return {
    user: authState.user,
    supabaseUser: authState.supabaseUser,
    session: authState.session,
    loading: authState.loading,
    error: authState.error,
    isAuthenticated: !!authState.user,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    deleteAccount,
    updateProfile,
  };
};
