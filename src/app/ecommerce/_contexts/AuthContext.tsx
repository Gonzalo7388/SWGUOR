'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface EcommerceUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
  };
  app_metadata?: {
    provider?: 'email' | 'google';
  };
}

interface LocalAccount {
  email: string;
  password: string;
  name: string;
  provider: 'email' | 'google';
  createdAt: string;
}

interface LocalSession {
  email: string;
  provider: 'email' | 'google';
}

const STORAGE_ACCOUNTS_KEY = 'ecommerce.local.accounts.v1';
const STORAGE_SESSION_KEY = 'ecommerce.local.session.v1';

interface EcommerceContextType {
  user: EcommerceUser | null;
  session: LocalSession | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  registerWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refetch: () => Promise<void>;
}

const EcommerceContext = createContext<EcommerceContextType | undefined>(undefined);

export function EcommerceProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<EcommerceUser | null>(null);
  const [session, setSession] = useState<LocalSession | null>(null);
  const [loading, setLoading] = useState(true);

  const emailToName = (email: string) => email.split('@')[0] || 'Mi cuenta';

  const getAccounts = (): LocalAccount[] => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as LocalAccount[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const saveAccounts = (accounts: LocalAccount[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
  };

  const getStoredSession = (): LocalSession | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(STORAGE_SESSION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as LocalSession;
      if (!parsed?.email || !parsed?.provider) return null;
      return parsed;
    } catch {
      return null;
    }
  };

  const saveSession = (value: LocalSession | null) => {
    if (typeof window === 'undefined') return;
    if (!value) {
      localStorage.removeItem(STORAGE_SESSION_KEY);
      return;
    }
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(value));
  };

  const buildUserFromSession = (activeSession: LocalSession | null): EcommerceUser | null => {
    if (!activeSession) return null;
    const accounts = getAccounts();
    const account = accounts.find((item) => item.email.toLowerCase() === activeSession.email.toLowerCase());
    const displayName = account?.name || emailToName(activeSession.email);

    return {
      id: `local-${activeSession.email.toLowerCase()}`,
      email: activeSession.email,
      user_metadata: {
        name: displayName,
        full_name: displayName,
      },
      app_metadata: {
        provider: activeSession.provider,
      },
    };
  };

  useEffect(() => {
    const activeSession = getStoredSession();
    setSession(activeSession);
    setUser(buildUserFromSession(activeSession));
    setLoading(false);
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    const safeEmail = email.trim().toLowerCase();
    const accounts = getAccounts();
    const account = accounts.find((item) => item.email.toLowerCase() === safeEmail);

    if (!account || account.password !== password) {
      return { error: 'No se pudo iniciar sesion con ese correo.' };
    }

    const nextSession: LocalSession = {
      email: account.email,
      provider: account.provider,
    };

    saveSession(nextSession);
    setSession(nextSession);
    setUser(buildUserFromSession(nextSession));
    return { error: null };
  };

  const registerWithEmail = async (email: string, password: string) => {
    const safeEmail = email.trim().toLowerCase();
    const accounts = getAccounts();
    const exists = accounts.some((item) => item.email.toLowerCase() === safeEmail);

    if (exists) {
      return { error: 'Ese correo ya esta registrado.' };
    }

    const newAccount: LocalAccount = {
      email: safeEmail,
      password,
      name: emailToName(safeEmail),
      provider: 'email',
      createdAt: new Date().toISOString(),
    };

    saveAccounts([...accounts, newAccount]);

    const nextSession: LocalSession = {
      email: newAccount.email,
      provider: 'email',
    };

    saveSession(nextSession);
    setSession(nextSession);
    setUser(buildUserFromSession(nextSession));
    return { error: null };
  };

  const signInWithGoogle = async (email: string) => {
    const safeEmail = email.trim().toLowerCase();

    if (!safeEmail.endsWith('@gmail.com')) {
      return { error: 'Ingresa un correo Gmail valido para continuar con Google.' };
    }

    const accounts = getAccounts();
    const existing = accounts.find((item) => item.email.toLowerCase() === safeEmail);

    if (!existing) {
      const googleAccount: LocalAccount = {
        email: safeEmail,
        password: '',
        name: emailToName(safeEmail),
        provider: 'google',
        createdAt: new Date().toISOString(),
      };
      saveAccounts([...accounts, googleAccount]);
    }

    const nextSession: LocalSession = {
      email: safeEmail,
      provider: 'google',
    };

    saveSession(nextSession);
    setSession(nextSession);
    setUser(buildUserFromSession(nextSession));
    return { error: null };
  };

  const refetch = async () => {
    const activeSession = getStoredSession();
    setSession(activeSession);
    setUser(buildUserFromSession(activeSession));
  };

  const handleSignOut = async () => {
    saveSession(null);
    setUser(null);
    setSession(null);
  };

  return (
    <EcommerceContext.Provider
      value={{
        user,
        session,
        loading,
        signInWithEmail,
        registerWithEmail,
        signInWithGoogle,
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
