import { getUser } from "@netlify/identity";

export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  roles: string[];
  isDev?: boolean;
};

export async function getRequestUser(request: Request): Promise<AuthUser | null> {
  try {
    const identityUser = await getUser();
    if (identityUser) {
      const roles = Array.isArray(identityUser.appMetadata?.roles)
        ? (identityUser.appMetadata.roles as string[])
        : [];
      return {
        id: identityUser.id,
        email: identityUser.email ?? "",
        name: identityUser.name ?? null,
        roles,
      };
    }
  } catch {
    /* Identity not configured */
  }

  const header = request.headers.get("x-kozugy-dev-user");
  if (header && process.env.NODE_ENV !== "production") {
    try {
      const parsed = JSON.parse(header) as {
        id: string;
        email: string;
        name?: string | null;
        roles?: string[];
      };
      if (parsed.id && parsed.email) {
        return {
          id: parsed.id,
          email: parsed.email,
          name: parsed.name ?? null,
          roles: parsed.roles ?? ["admin"],
          isDev: true,
        };
      }
    } catch {
      /* ignore */
    }
  }

  return null;
}

export function isModerator(user: AuthUser): boolean {
  return user.roles.includes("admin") || user.roles.includes("moderator") || !!user.isDev;
}
