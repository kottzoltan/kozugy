import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import { normalizeRoles } from "@/lib/auth/roles";

/**
 * Edge-safe Auth.js config (no Node/db imports).
 * Used by middleware; full providers + Credentials live in auth.ts.
 */
export const authConfig = {
  providers: [
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    ...(process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET
      ? [
          Facebook({
            clientId: process.env.AUTH_FACEBOOK_ID,
            clientSecret: process.env.AUTH_FACEBOOK_SECRET,
          }),
        ]
      : []),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/",
    error: "/",
  },
  callbacks: {
    authorized({ auth, request }) {
      const path = request.nextUrl.pathname;
      if (!path.startsWith("/admin") && !path.startsWith("/api/admin")) {
        return true;
      }
      const roles = normalizeRoles(auth?.user?.roles);
      return roles.includes("admin") || roles.includes("moderator");
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
        token.roles = normalizeRoles(user.roles);
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? "";
        session.user.roles = normalizeRoles(token.roles);
        if (token.email) session.user.email = String(token.email);
        if (token.name !== undefined) session.user.name = token.name as string | null;
        if (token.picture !== undefined) {
          session.user.image = token.picture as string | null;
        }
      }
      return session;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
