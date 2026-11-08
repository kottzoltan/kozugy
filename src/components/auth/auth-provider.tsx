"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import type { AppRole } from "@/lib/auth/roles";
import { isModeratorRole, normalizeRoles } from "@/lib/auth/roles";

export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  roles: AppRole[];
  isDev?: boolean;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  identityAvailable: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  loginWithGoogle: () => void;
  loginWithFacebook: () => void;
  loginDev: (email?: string) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const DEV_USER_KEY = "kozugy_dev_user";

function AuthStateProvider({ children }: { children: ReactNode }) {
  const { data, status } = useSession();
  const loading = status === "loading";

  const user = useMemo<AuthUser | null>(() => {
    if (data?.user?.id && data.user.email) {
      return {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        image: data.user.image,
        roles: normalizeRoles(data.user.roles),
      };
    }
    if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
      try {
        const raw = localStorage.getItem(DEV_USER_KEY);
        if (raw) return JSON.parse(raw) as AuthUser;
      } catch {
        /* ignore */
      }
    }
    return null;
  }, [data]);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    const res = await signIn("credentials", {
      email,
      password,
      mode: "login",
      redirect: false,
    });
    if (res?.error) throw new Error(res.error);
  }, []);

  const signupWithEmail = useCallback(
    async (email: string, password: string, name?: string) => {
      const res = await signIn("credentials", {
        email,
        password,
        name: name ?? "",
        mode: "signup",
        redirect: false,
      });
      if (res?.error) {
        throw new Error(
          res.error === "EMAIL_IN_USE" || res.code === "EMAIL_IN_USE"
            ? "EMAIL_IN_USE"
            : res.error,
        );
      }
    },
    [],
  );

  const loginWithGoogle = useCallback(() => {
    void signIn("google", { callbackUrl: "/" });
  }, []);

  const loginWithFacebook = useCallback(() => {
    void signIn("facebook", { callbackUrl: "/" });
  }, []);

  const loginDev = useCallback((email = "dev@kozugy.info") => {
    const devUser: AuthUser = {
      id: "00000000-0000-4000-8000-000000000001",
      email,
      name: "Fejlesztő",
      roles: ["admin"],
      isDev: true,
    };
    localStorage.setItem(DEV_USER_KEY, JSON.stringify(devUser));
    window.location.reload();
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem(DEV_USER_KEY);
    await signOut({ callbackUrl: "/" });
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      identityAvailable: true,
      isAdmin: !!user && (user.roles.includes("admin") || !!user.isDev),
      isModerator: !!user && (isModeratorRole(user.roles) || !!user.isDev),
      loginWithEmail,
      signupWithEmail,
      loginWithGoogle,
      loginWithFacebook,
      loginDev,
      logout,
    }),
    [
      user,
      loading,
      loginWithEmail,
      signupWithEmail,
      loginWithGoogle,
      loginWithFacebook,
      loginDev,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthStateProvider>{children}</AuthStateProvider>
    </SessionProvider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
