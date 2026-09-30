import type { CategoryId, Issue, IssueType } from "@/lib/types";
import {
  getIssueBySlug as getMockIssue,
  issues as mockIssues,
} from "@/lib/mock-data";
import { newIssueId, slugify } from "@/lib/ids";
import type { AuthUser } from "@/lib/auth/request-user";

export type CreateIssueInput = {
  title: string;
  settlement: string;
  address: string;
  category: CategoryId;
  type: IssueType;
  problem: string;
  request: string;
  summary?: string;
  lat: number;
  lng: number;
  images?: string[];
};

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

/** In-memory issues created when DB is unavailable (local next dev). */
const memoryIssues: Issue[] = [];

export async function listIssues(): Promise<Issue[]> {
  try {
    const { db } = await import("@db");
    const { issues } = await import("@db/schema");
    const { eq } = await import("drizzle-orm");
    const rows = await db
      .select()
      .from(issues)
      .where(eq(issues.moderationStatus, "approved"));
    if (rows.length === 0 && memoryIssues.length === 0) return mockIssues;
    return [...rows.map(rowToIssue), ...memoryIssues];
  } catch {
    if (memoryIssues.length) return [...memoryIssues, ...mockIssues];
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
  return memoryIssues.find((i) => i.slug === slug) ?? getMockIssue(slug);
}

export async function createIssue(
  input: CreateIssueInput,
  user: AuthUser,
): Promise<Issue> {
  const baseSlug = slugify(input.title) || "uj-ugy";
  let slug = baseSlug;
  const id = newIssueId();

  const ensureUniqueSlug = async (candidate: string) => {
    try {
      const { db } = await import("@db");
      const { issues } = await import("@db/schema");
      const { eq } = await import("drizzle-orm");
      let s = candidate;
      for (let i = 0; i < 20; i++) {
        const [existing] = await db
          .select({ id: issues.id })
          .from(issues)
          .where(eq(issues.slug, s))
          .limit(1);
        if (!existing && !memoryIssues.some((m) => m.slug === s) && !getMockIssue(s)) {
          return s;
        }
        s = `${candidate}-${i + 2}`;
      }
      return `${candidate}-${Date.now().toString(36)}`;
    } catch {
      let s = candidate;
      let n = 2;
      while (
        memoryIssues.some((m) => m.slug === s) ||
        getMockIssue(s) ||
        mockIssues.some((m) => m.slug === s)
      ) {
        s = `${candidate}-${n++}`;
      }
      return s;
    }
  };

  slug = await ensureUniqueSlug(baseSlug);

  const summary =
    input.summary?.trim() ||
    input.problem.trim().slice(0, 180) + (input.problem.length > 180 ? "…" : "");

  try {
    const { db } = await import("@db");
    const { issues, users } = await import("@db/schema");

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

    const [row] = await db
      .insert(issues)
      .values({
        id,
        slug,
        title: input.title.trim(),
        settlement: input.settlement.trim(),
        address: input.address.trim(),
        category: input.category,
        type: input.type,
        status: "uj",
        supportersCount: 1,
        supportersChange24h: 1,
        summary,
        problem: input.problem.trim(),
        request: input.request.trim() || input.problem.trim(),
        lat: input.lat,
        lng: input.lng,
        images: input.images ?? [],
        createdByUserId: user.id,
        moderationStatus: "approved",
      })
      .returning();

    // Auto-support by author
    try {
      const { issueSupports } = await import("@db/schema");
      await db
        .insert(issueSupports)
        .values({ issueId: id, userId: user.id })
        .onConflictDoNothing();
    } catch {
      /* optional */
    }

    return rowToIssue(row);
  } catch {
    const issue: Issue = {
      id,
      slug,
      title: input.title.trim(),
      settlement: input.settlement.trim(),
      address: input.address.trim(),
      category: input.category,
      type: input.type,
      status: "uj",
      supporters: 1,
      supportersChange24h: 1,
      summary,
      problem: input.problem.trim(),
      request: input.request.trim() || input.problem.trim(),
      location: { lat: input.lat, lng: input.lng },
      images: input.images ?? [],
      createdAt: new Date().toISOString(),
    };
    memoryIssues.unshift(issue);
    return issue;
  }
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
      const mock =
        memoryIssues.find((i) => i.slug === slug) ?? getMockIssue(slug);
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
    const mock = memoryIssues.find((i) => i.slug === slug) ?? getMockIssue(slug);
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

export async function applyApprovedFields(
  issueId: string,
  fields: Partial<{
    title: string;
    summary: string | null;
    problem: string;
    request: string;
    category: CategoryId;
    address: string;
    settlement: string;
  }>,
): Promise<Issue | null> {
  try {
    const { db } = await import("@db");
    const { issues } = await import("@db/schema");
    const { eq } = await import("drizzle-orm");
    const [updated] = await db
      .update(issues)
      .set({
        ...fields,
        updatedAt: new Date(),
      })
      .where(eq(issues.id, issueId))
      .returning();
    return updated ? rowToIssue(updated) : null;
  } catch {
    const mem = memoryIssues.find((i) => i.id === issueId);
    if (!mem) return null;
    if (fields.title != null) mem.title = fields.title;
    if (fields.summary !== undefined) mem.summary = fields.summary ?? undefined;
    if (fields.problem != null) mem.problem = fields.problem;
    if (fields.request != null) mem.request = fields.request;
    if (fields.category != null) mem.category = fields.category;
    if (fields.address != null) mem.address = fields.address;
    if (fields.settlement != null) mem.settlement = fields.settlement;
    return mem;
  }
}
