import type { Issue } from "@/lib/types";
import {
  getIssueBySlug as getMockIssue,
  issues as mockIssues,
} from "@/lib/mock-data";

function rowToIssue(row: {
  id: string;
  slug: string;
  title: string;
  settlement: string;
  address: string;
  category: Issue["category"];
  type: Issue["type"];
  status: Issue["status"];
  supportersCount: number;
  supportersChange24h: number;
  summary: string | null;
  problem: string;
  request: string;
  lat: number;
  lng: number;
  images: string[] | null;
  organizationId: string | null;
  articleSlug: string | null;
  createdAt: Date | string;
}): Issue {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    settlement: row.settlement,
    address: row.address,
    category: row.category,
    type: row.type,
    status: row.status,
    supporters: row.supportersCount,
    supportersChange24h: row.supportersChange24h,
    summary: row.summary ?? undefined,
    problem: row.problem,
    request: row.request,
    location: { lat: row.lat, lng: row.lng },
    images: row.images ?? [],
    organizationId: row.organizationId ?? undefined,
    articleSlug: row.articleSlug ?? undefined,
    createdAt:
      typeof row.createdAt === "string"
        ? row.createdAt
        : row.createdAt.toISOString(),
  };
}

export async function listIssues(): Promise<Issue[]> {
  try {
    const { db } = await import("@db");
    const { issues } = await import("@db/schema");
    const rows = await db.select().from(issues);
    if (rows.length === 0) return mockIssues;
    return rows.map(rowToIssue);
  } catch {
    return mockIssues;
  }
}

export async function getIssue(slug: string): Promise<Issue | undefined> {
  try {
    const { db } = await import("@db");
    const { issues } = await import("@db/schema");
    const { eq } = await import("drizzle-orm");
    const [row] = await db.select().from(issues).where(eq(issues.slug, slug)).limit(1);
    if (row) return rowToIssue(row);
  } catch {
    /* fall through */
  }
  return getMockIssue(slug);
}

export async function supportIssue(
  slug: string,
  user: {
    id: string;
    email: string;
    name?: string | null;
  },
): Promise<{ supporters: number; alreadySupported: boolean } | null> {
  try {
    const { db } = await import("@db");
    const { issues, issueSupports, users } = await import("@db/schema");
    const { eq, sql } = await import("drizzle-orm");

    const [issue] = await db.select().from(issues).where(eq(issues.slug, slug)).limit(1);
    if (!issue) {
      const mock = getMockIssue(slug);
      if (!mock) return null;
      mock.supporters += 1;
      return { supporters: mock.supporters, alreadySupported: false };
    }

    await db
      .insert(users)
      .values({
        id: user.id,
        email: user.email,
        name: user.name ?? null,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: { email: user.email, name: user.name ?? null },
      });

    const inserted = await db
      .insert(issueSupports)
      .values({ issueId: issue.id, userId: user.id })
      .onConflictDoNothing()
      .returning();

    if (inserted.length === 0) {
      return { supporters: issue.supportersCount, alreadySupported: true };
    }

    const [updated] = await db
      .update(issues)
      .set({
        supportersCount: sql`${issues.supportersCount} + 1`,
        supportersChange24h: sql`${issues.supportersChange24h} + 1`,
      })
      .where(eq(issues.id, issue.id))
      .returning();

    return {
      supporters: updated.supportersCount,
      alreadySupported: false,
    };
  } catch {
    const mock = getMockIssue(slug);
    if (!mock) return null;
    mock.supporters += 1;
    return { supporters: mock.supporters, alreadySupported: false };
  }
}

export async function hasUserSupported(
  slug: string,
  userId: string,
): Promise<boolean> {
  try {
    const { db } = await import("@db");
    const { issues, issueSupports } = await import("@db/schema");
    const { and, eq } = await import("drizzle-orm");
    const [issue] = await db.select().from(issues).where(eq(issues.slug, slug)).limit(1);
    if (!issue) return false;
    const [row] = await db
      .select()
      .from(issueSupports)
      .where(
        and(eq(issueSupports.issueId, issue.id), eq(issueSupports.userId, userId)),
      )
      .limit(1);
    return !!row;
  } catch {
    return false;
  }
}
