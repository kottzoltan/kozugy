import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import {
  createEmailUser,
  findUserByEmail,
  upsertOAuthUser,
  verifyEmailPassword,
} from "@/lib/auth/users";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      id: "credentials",
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        mode: { label: "Mode", type: "text" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
          .toLowerCase()
          .trim();
        const password = String(credentials?.password ?? "");
        const mode = String(credentials?.mode ?? "login");
        const name = String(credentials?.name ?? "").trim();

        if (!email || password.length < 6) return null;

        if (mode === "signup") {
          const existing = await findUserByEmail(email);
          if (existing) throw new Error("EMAIL_IN_USE");
          const created = await createEmailUser({
            email,
            password,
            name: name || undefined,
          });
          return {
            id: created.id,
            email: created.email,
            name: created.name,
            image: created.image,
            roles: created.roles,
          };
        }

        const user = await verifyEmailPassword(email, password);
        if (!user) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          roles: user.roles,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      if (!account || account.provider === "credentials") return true;
      const email =
        user.email ??
        (typeof profile?.email === "string" ? profile.email : null);
      if (!email) return false;

      const saved = await upsertOAuthUser({
        email,
        name: user.name,
        image: user.image,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        accessToken: account.access_token,
        refreshToken: account.refresh_token,
        expiresAt: account.expires_at,
        idToken: account.id_token,
        tokenType: account.token_type,
        scope: account.scope,
      });
      user.id = saved.id;
      user.roles = saved.roles;
      user.name = saved.name;
      user.image = saved.image;
      return true;
    },
  },
  secret: process.env.AUTH_SECRET,
});
