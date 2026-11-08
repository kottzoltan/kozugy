import { eq } from "drizzle-orm";
import { hash, compare } from "bcryptjs";
import type { AppRole } from "@/lib/auth/roles";
import { adminEmailsFromEnv, normalizeRoles } from "@/lib/auth/roles";

export type DbAuthUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  passwordHash: string | null;
  roles: AppRole[];
};

async function getDb() {
  const { db } = await import("@db");
  const { users, accounts } = await import("@db/schema");
  return { db, users, accounts };
}

function mapUser(row: {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  passwordHash: string | null;
  roles: string[] | null;
}): DbAuthUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    image: row.image,
    passwordHash: row.passwordHash,
    roles: normalizeRoles(row.roles),
  };
}

function rolesForEmail(email: string, existing?: string[] | null): AppRole[] {
  const roles = normalizeRoles(existing);
  if (adminEmailsFromEnv().has(email.toLowerCase()) && !roles.includes("admin")) {
    return [...roles.filter((r) => r !== "user"), "admin"];
  }
  return roles;
}

export async function findUserByEmail(email: string): Promise<DbAuthUser | null> {
  try {
    const { db, users } = await getDb();
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);
    return rows[0] ? mapUser(rows[0]) : null;
  } catch {
    return null;
  }
}

export async function findUserById(id: string): Promise<DbAuthUser | null> {
  try {
    const { db, users } = await getDb();
    const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return rows[0] ? mapUser(rows[0]) : null;
  } catch {
    return null;
  }
}

export async function createEmailUser(input: {
  email: string;
  password: string;
  name?: string;
}): Promise<DbAuthUser> {
  const { db, users } = await getDb();
  const email = input.email.toLowerCase().trim();
  const passwordHash = await hash(input.password, 12);
  const roles = rolesForEmail(email);
  const [row] = await db
    .insert(users)
    .values({
      email,
      name: input.name?.trim() || null,
      passwordHash,
      roles,
      emailVerified: null,
    })
    .returning();
  return mapUser(row);
}

export async function verifyEmailPassword(
  email: string,
  password: string,
): Promise<DbAuthUser | null> {
  const user = await findUserByEmail(email);
  if (!user?.passwordHash) return null;
  const ok = await compare(password, user.passwordHash);
  return ok ? user : null;
}

export async function upsertOAuthUser(input: {
  email: string;
  name?: string | null;
  image?: string | null;
  provider: string;
  providerAccountId: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  expiresAt?: number | null;
  idToken?: string | null;
  tokenType?: string | null;
  scope?: string | null;
}): Promise<DbAuthUser> {
  const { db, users, accounts } = await getDb();
  const email = input.email.toLowerCase().trim();

  let user = await findUserByEmail(email);
  if (!user) {
    const roles = rolesForEmail(email);
    const [row] = await db
      .insert(users)
      .values({
        email,
        name: input.name ?? null,
        image: input.image ?? null,
        roles,
        emailVerified: new Date(),
      })
      .returning();
    user = mapUser(row);
  } else {
    const roles = rolesForEmail(email, user.roles);
    await db
      .update(users)
      .set({
        name: input.name ?? user.name,
        image: input.image ?? user.image,
        roles,
        emailVerified: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));
    user = { ...user, name: input.name ?? user.name, image: input.image ?? user.image, roles };
  }

  await db
    .insert(accounts)
    .values({
      userId: user.id,
      type: "oauth",
      provider: input.provider,
      providerAccountId: input.providerAccountId,
      accessToken: input.accessToken ?? null,
      refreshToken: input.refreshToken ?? null,
      expiresAt: input.expiresAt ?? null,
      idToken: input.idToken ?? null,
      tokenType: input.tokenType ?? null,
      scope: input.scope ?? null,
    })
    .onConflictDoUpdate({
      target: [accounts.provider, accounts.providerAccountId],
      set: {
        accessToken: input.accessToken ?? null,
        refreshToken: input.refreshToken ?? null,
        expiresAt: input.expiresAt ?? null,
        idToken: input.idToken ?? null,
      },
    });

  return user;
}
