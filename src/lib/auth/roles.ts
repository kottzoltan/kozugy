export type AppRole = "user" | "moderator" | "admin";

export function normalizeRoles(raw: unknown): AppRole[] {
  if (!Array.isArray(raw)) return ["user"];
  const roles = raw.filter(
    (r): r is AppRole => r === "user" || r === "moderator" || r === "admin",
  );
  return roles.length ? roles : ["user"];
}

export function hasRole(roles: string[], role: AppRole): boolean {
  return roles.includes(role);
}

export function isAdminRole(roles: string[]): boolean {
  return roles.includes("admin");
}

export function isModeratorRole(roles: string[]): boolean {
  return roles.includes("admin") || roles.includes("moderator");
}

/** Comma-separated admin emails from env (bootstrap first admins). */
export function adminEmailsFromEnv(): Set<string> {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}
