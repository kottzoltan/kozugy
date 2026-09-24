"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  isDev?: boolean;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  identityAvailable: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  loginWithGoogle: () => void;
  loginDev: (email?: string) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const DEV_USER_KEY = "kozugy_dev_user";

function metaName(meta: Record<string, unknown> | undefined): string | null {
  if (!meta) return null;
  const full = meta.full_name;
  if (typeof full === "string" && full.trim()) return full;
  const name = meta.name;
  if (typeof name === "string" && name.trim()) return name;
  return null;
}

function toAuthUser(u: {
  id: string;
  email?: string | null;
  name?: string | null;
  userMetadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
}): AuthUser {
  return {
    id: u.id,
    email: u.email ?? "",
    name: metaName(u.userMetadata ?? u.user_metadata) ?? u.name ?? null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [identityAvailable, setIdentityAvailable] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    (async () => {
      try {
        const identity = await import("@netlify/identity");
        await identity.handleAuthCallback();
        // getSettings throws MissingIdentityError when Identity is not enabled
        await identity.getSettings();
        setIdentityAvailable(true);
        const current = await identity.getUser();
        if (current) setUser(toAuthUser(current));
        unsubscribe = identity.onAuthChange((_event, u) => {
          setUser(u ? toAuthUser(u) : null);
        });
      } catch {
        setIdentityAvailable(false);
        try {
          const raw = localStorage.getItem(DEV_USER_KEY);
          if (raw) setUser(JSON.parse(raw) as AuthUser);
        } catch {
          /* ignore */
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => unsubscribe?.();
  }, []);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    const { login } = await import("@netlify/identity");
    setUser(toAuthUser(await login(email, password)));
  }, []);

  const signupWithEmail = useCallback(
    async (email: string, password: string, name?: string) => {
      const { signup } = await import("@netlify/identity");
      const u = await signup(email, password, name ? { full_name: name } : undefined);
      setUser(toAuthUser(u));
    },
    [],
  );

  const loginWithGoogle = useCallback(() => {
    void import("@netlify/identity").then(({ oauthLogin }) => oauthLogin("google"));
  }, []);

  const loginDev = useCallback((email = "dev@kozosugyunk.hu") => {
    const devUser: AuthUser = {
      id: "00000000-0000-4000-8000-000000000001",
      email,
      name: "Fejlesztő",
      isDev: true,
    };
    localStorage.setItem(DEV_USER_KEY, JSON.stringify(devUser));
    setUser(devUser);
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem(DEV_USER_KEY);
    try {
      const { logout: identityLogout } = await import("@netlify/identity");
      await identityLogout();
    } catch {
      /* local only */
    }
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      identityAvailable,
      loginWithEmail,
      signupWithEmail,
      loginWithGoogle,
      loginDev,
      logout,
    }),
    [
      user,
      loading,
      identityAvailable,
      loginWithEmail,
      signupWithEmail,
      loginWithGoogle,
      loginDev,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
