import { auth } from "@/auth";
import { isModeratorRole, normalizeRoles, type AppRole } from "@/lib/auth/roles";

export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  roles: AppRole[];
  isDev?: boolean;
};

export async function getRequestUser(request: Request): Promise<AuthUser | null> {
  try {
    const session = await auth();
    if (session?.user?.id && session.user.email) {
      return {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
        roles: normalizeRoles(session.user.roles),
      };
    }
  } catch {
    /* auth not configured */
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
          roles: normalizeRoles(parsed.roles ?? ["admin"]),
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
  return isModeratorRole(user.roles) || !!user.isDev;
}

export function isAdmin(user: AuthUser): boolean {
  return user.roles.includes("admin") || !!user.isDev;
}
