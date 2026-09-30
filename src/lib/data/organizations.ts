import type {
  IssueOrganizationLink,
  OrgLinkStatus,
  OrgRelationRole,
  OrgType,
  Organization,
} from "@/lib/types";
import {
  getIssueBySlug,
  getOrganization,
  mockIssueOrgLinks,
  organizations as mockOrgs,
} from "@/lib/mock-data";

export {
  ORG_TYPE_LABEL,
  ORG_ROLE_LABEL,
  ORG_LINK_STATUS_LABEL,
  suggestOrganizations,
} from "@/lib/org-labels";

function rowToOrg(row: {
  id: string;
  slug: string;
  name: string;
  orgType?: OrgType | null;
  settlement?: string | null;
  website?: string | null;
  contactEmail?: string | null;
  avgResponseDays?: number | null;
}): Organization {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    orgType: row.orgType ?? "egyeb",
    settlement: row.settlement ?? undefined,
    website: row.website ?? undefined,
    contactEmail: row.contactEmail ?? undefined,
    avgResponseDays: row.avgResponseDays ?? undefined,
  };
}

/** In-memory links when DB unavailable. */
const memoryLinks = new Map<string, IssueOrganizationLink[]>();

function seedMemoryFromMock(slug: string): IssueOrganizationLink[] {
  const defs = mockIssueOrgLinks[slug] ?? [];
  const issue = getIssueBySlug(slug);
  if (!defs.length && issue?.organizationId) {
    const org = getOrganization(issue.organizationId);
    if (!org) return [];
    return [
      {
        organization: org,
        role: "illetekes",
        linkStatus: org.respondedAt ? "valaszolt" : org.notifiedAt ? "ertesitve" : "hozzarendelve",
        notifiedAt: org.notifiedAt,
        respondedAt: org.respondedAt,
      },
    ];
  }
  const links: IssueOrganizationLink[] = [];
  for (const d of defs) {
    const org = getOrganization(d.organizationId);
    if (!org) continue;
    links.push({
      organization: org,
      role: d.role,
      linkStatus: d.linkStatus,
      notifiedAt: org.notifiedAt,
      respondedAt: org.respondedAt,
    });
  }
  return links;
}

export async function listOrganizations(opts?: {
  type?: OrgType;
  settlement?: string;
}): Promise<Organization[]> {
  try {
    const { db } = await import("@db");
    const { organizations } = await import("@db/schema");
    const { eq, and, ilike } = await import("drizzle-orm");
    const conditions = [];
    if (opts?.type) conditions.push(eq(organizations.orgType, opts.type));
    if (opts?.settlement) {
      conditions.push(ilike(organizations.settlement, opts.settlement));
    }
    const rows =
      conditions.length > 0
        ? await db
            .select()
            .from(organizations)
            .where(and(...conditions))
        : await db.select().from(organizations);
    if (rows.length === 0) return filterMock(opts);
    return rows.map(rowToOrg);
  } catch {
    return filterMock(opts);
  }
}

function filterMock(opts?: { type?: OrgType; settlement?: string }) {
  return mockOrgs.filter((o) => {
    if (opts?.type && o.orgType !== opts.type) return false;
    if (
      opts?.settlement &&
      o.settlement?.toLowerCase() !== opts.settlement.toLowerCase()
    )
      return false;
    return true;
  });
}

export async function listIssueOrganizations(
  slug: string,
): Promise<IssueOrganizationLink[]> {
  try {
    const { db } = await import("@db");
    const { issueOrganizations, organizations, issues } = await import(
      "@db/schema"
    );
    const { eq } = await import("drizzle-orm");

    const rows = await db
      .select({
        link: issueOrganizations,
        org: organizations,
      })
      .from(issueOrganizations)
      .innerJoin(issues, eq(issueOrganizations.issueId, issues.id))
      .innerJoin(
        organizations,
        eq(issueOrganizations.organizationId, organizations.id),
      )
      .where(eq(issues.slug, slug));

    if (rows.length === 0) {
      return memoryLinks.get(slug) ?? seedMemoryFromMock(slug);
    }

    return rows.map(({ link, org }) => ({
      organization: {
        ...rowToOrg(org),
        notifiedAt: link.notifiedAt?.toISOString(),
        respondedAt: link.respondedAt?.toISOString(),
      },
      role: link.role,
      linkStatus: link.linkStatus,
      notifiedAt: link.notifiedAt?.toISOString(),
      respondedAt: link.respondedAt?.toISOString(),
      note: link.note ?? undefined,
    }));
  } catch {
    return memoryLinks.get(slug) ?? seedMemoryFromMock(slug);
  }
}

export async function assignOrganizationToIssue(
  slug: string,
  organizationId: string,
  role: OrgRelationRole = "illetekes",
  linkStatus: OrgLinkStatus = "hozzarendelve",
  note?: string,
): Promise<IssueOrganizationLink | null> {
  try {
    const { db } = await import("@db");
    const { issueOrganizations, organizations, issues } = await import(
      "@db/schema"
    );
    const { eq } = await import("drizzle-orm");

    const [issue] = await db
      .select()
      .from(issues)
      .where(eq(issues.slug, slug))
      .limit(1);
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);
    if (!issue || !org) throw new Error("FALLBACK");

    await db
      .insert(issueOrganizations)
      .values({
        issueId: issue.id,
        organizationId,
        role,
        linkStatus,
        note: note ?? null,
        notifiedAt: linkStatus === "ertesitve" || linkStatus === "valaszolt" || linkStatus === "folyamatban"
          ? new Date()
          : null,
      })
      .onConflictDoUpdate({
        target: [issueOrganizations.issueId, issueOrganizations.organizationId],
        set: {
          role,
          linkStatus,
          note: note ?? null,
        },
      });

    // Keep legacy primary org field in sync if this is the illetékes
    if (role === "illetekes") {
      await db
        .update(issues)
        .set({ organizationId })
        .where(eq(issues.id, issue.id));
    }

    return {
      organization: rowToOrg(org),
      role,
      linkStatus,
      note,
    };
  } catch {
    const org = getOrganization(organizationId);
    if (!org) return null;
    const link: IssueOrganizationLink = {
      organization: org,
      role,
      linkStatus,
      note,
      notifiedAt:
        linkStatus !== "hozzarendelve" ? new Date().toISOString() : undefined,
    };
    const existing = memoryLinks.get(slug) ?? seedMemoryFromMock(slug);
    const next = [
      ...existing.filter((l) => l.organization.id !== organizationId),
      link,
    ];
    memoryLinks.set(slug, next);
    return link;
  }
}

export async function removeOrganizationFromIssue(
  slug: string,
  organizationId: string,
): Promise<boolean> {
  try {
    const { db } = await import("@db");
    const { issueOrganizations, issues } = await import("@db/schema");
    const { and, eq } = await import("drizzle-orm");
    const [issue] = await db
      .select()
      .from(issues)
      .where(eq(issues.slug, slug))
      .limit(1);
    if (!issue) throw new Error("FALLBACK");
    await db
      .delete(issueOrganizations)
      .where(
        and(
          eq(issueOrganizations.issueId, issue.id),
          eq(issueOrganizations.organizationId, organizationId),
        ),
      );
    return true;
  } catch {
    const existing = memoryLinks.get(slug) ?? seedMemoryFromMock(slug);
    memoryLinks.set(
      slug,
      existing.filter((l) => l.organization.id !== organizationId),
    );
    return true;
  }
}

export async function updateIssueOrgLink(
  slug: string,
  organizationId: string,
  patch: {
    role?: OrgRelationRole;
    linkStatus?: OrgLinkStatus;
    note?: string;
  },
): Promise<IssueOrganizationLink | null> {
  try {
    const { db } = await import("@db");
    const { issueOrganizations, organizations, issues } = await import(
      "@db/schema"
    );
    const { and, eq } = await import("drizzle-orm");
    const [issue] = await db
      .select()
      .from(issues)
      .where(eq(issues.slug, slug))
      .limit(1);
    if (!issue) throw new Error("FALLBACK");

    const set: Record<string, unknown> = { ...patch };
    if (patch.linkStatus === "ertesitve" && !set.notifiedAt) {
      set.notifiedAt = new Date();
    }
    if (patch.linkStatus === "valaszolt") {
      set.respondedAt = new Date();
      if (!set.notifiedAt) set.notifiedAt = new Date();
    }

    await db
      .update(issueOrganizations)
      .set(set)
      .where(
        and(
          eq(issueOrganizations.issueId, issue.id),
          eq(issueOrganizations.organizationId, organizationId),
        ),
      );

    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);
    if (!org) return null;

    const [link] = await db
      .select()
      .from(issueOrganizations)
      .where(
        and(
          eq(issueOrganizations.issueId, issue.id),
          eq(issueOrganizations.organizationId, organizationId),
        ),
      )
      .limit(1);

    if (!link) return null;
    return {
      organization: rowToOrg(org),
      role: link.role,
      linkStatus: link.linkStatus,
      notifiedAt: link.notifiedAt?.toISOString(),
      respondedAt: link.respondedAt?.toISOString(),
      note: link.note ?? undefined,
    };
  } catch {
    const existing = memoryLinks.get(slug) ?? seedMemoryFromMock(slug);
    const idx = existing.findIndex((l) => l.organization.id === organizationId);
    if (idx < 0) return null;
    const updated = {
      ...existing[idx],
      ...patch,
      notifiedAt:
        patch.linkStatus === "ertesitve" || patch.linkStatus === "valaszolt"
          ? new Date().toISOString()
          : existing[idx].notifiedAt,
      respondedAt:
        patch.linkStatus === "valaszolt"
          ? new Date().toISOString()
          : existing[idx].respondedAt,
    };
    existing[idx] = updated;
    memoryLinks.set(slug, existing);
    return updated;
  }
}
