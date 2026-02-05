'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getSupabaseBrowserClient, signOut } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface EcommerceContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refetch: () => Promise<void>;
}

const EcommerceContext = createContext<EcommerceContextType | undefined>(undefined);

export function EcommerceProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        
        // Obtener sesión actual
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('[ECOMMERCE_CONTEXT] Warning getting session:', error.message);
          if (isMounted) {
            setSession(null);
            setUser(null);
            setLoading(false);
          }
          return;
        }

        if (isMounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
        }

        // Escuchar cambios en autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event: string, newSession: Session | null) => {
            if (isMounted) {
              setSession(newSession);
              setUser(newSession?.user ?? null);
            }
          }
        );

        if (isMounted) {
          setLoading(false);
        }

        return () => {
          subscription?.unsubscribe();
        };
      } catch (error) {
        console.error('[ECOMMERCE_CONTEXT] Error initializing auth:', error);
        if (isMounted) {
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const refetch = async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
    } catch (error) {
      console.error('[ECOMMERCE_CONTEXT] Error refetching user:', error);
      setUser(null);
      setSession(null);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('[ECOMMERCE_CONTEXT] Error signing out:', error);
    }
  };

  return (
    <EcommerceContext.Provider
      value={{
        user,
        session,
        loading,
        signOut: handleSignOut,
        refetch,
      }}
    >
      {children}
    </EcommerceContext.Provider>
  );
}

export function useEcommerce() {
  const context = useContext(EcommerceContext);
  if (!context) {
    throw new Error('useEcommerce debe usarse dentro de EcommerceProvider');
  }
  return context;
}
