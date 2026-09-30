import type { CategoryId } from "@/lib/types";
import type { AuthUser } from "@/lib/auth/request-user";
import { newSuggestionId } from "@/lib/ids";
import { applyApprovedFields, getIssue } from "@/lib/data/issues";

export type EditSuggestion = {
  id: string;
  issueId: string;
  issueSlug: string;
  authorUserId: string;
  authorEmail?: string;
  authorName?: string | null;
  status: "pending" | "approved" | "rejected";
  rationale: string | null;
  proposedTitle: string | null;
  proposedSummary: string | null;
  proposedProblem: string | null;
  proposedRequest: string | null;
  proposedCategory: CategoryId | null;
  proposedAddress: string | null;
  proposedSettlement: string | null;
  previousTitle: string;
  previousSummary: string | null;
  previousProblem: string;
  previousRequest: string;
  previousCategory: CategoryId;
  previousAddress: string;
  previousSettlement: string;
  reviewerUserId: string | null;
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
};

export type ProposeEditInput = {
  title?: string;
  summary?: string;
  problem?: string;
  request?: string;
  category?: CategoryId;
  address?: string;
  settlement?: string;
  rationale?: string;
};

const memorySuggestions: EditSuggestion[] = [];

function normalize(s: string | undefined | null) {
  return (s ?? "").trim();
}

function hasChange(proposed: string | null | undefined, previous: string) {
  if (proposed == null) return false;
  return normalize(proposed) !== normalize(previous);
}

export async function proposeEdit(
  slug: string,
  input: ProposeEditInput,
  user: AuthUser,
): Promise<EditSuggestion | null> {
  const issue = await getIssue(slug);
  if (!issue) return null;

  const proposedTitle = input.title?.trim() || null;
  const proposedSummary =
    input.summary !== undefined ? input.summary.trim() || null : null;
  const proposedProblem = input.problem?.trim() || null;
  const proposedRequest = input.request?.trim() || null;
  const proposedCategory = input.category ?? null;
  const proposedAddress = input.address?.trim() || null;
  const proposedSettlement = input.settlement?.trim() || null;

  const changed =
    hasChange(proposedTitle, issue.title) ||
    (proposedSummary !== null &&
      normalize(proposedSummary) !== normalize(issue.summary ?? "")) ||
    hasChange(proposedProblem, issue.problem) ||
    hasChange(proposedRequest, issue.request) ||
    (proposedCategory != null && proposedCategory !== issue.category) ||
    hasChange(proposedAddress, issue.address) ||
    hasChange(proposedSettlement, issue.settlement);

  if (!changed) {
    throw new Error("NO_CHANGES");
  }

  const id = newSuggestionId();
  const createdAt = new Date().toISOString();

  try {
    const { db } = await import("@db");
    const { issueEditSuggestions, users, issues } = await import("@db/schema");
    const { eq } = await import("drizzle-orm");

    const [dbIssue] = await db
      .select()
      .from(issues)
      .where(eq(issues.slug, slug))
      .limit(1);
    if (!dbIssue) throw new Error("FALLBACK");

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
      .insert(issueEditSuggestions)
      .values({
        id,
        issueId: dbIssue.id,
        authorUserId: user.id,
        status: "pending",
        rationale: input.rationale?.trim() || null,
        proposedTitle: hasChange(proposedTitle, issue.title) ? proposedTitle : null,
        proposedSummary:
          proposedSummary !== null &&
          normalize(proposedSummary) !== normalize(issue.summary ?? "")
            ? proposedSummary
            : null,
        proposedProblem: hasChange(proposedProblem, issue.problem)
          ? proposedProblem
          : null,
        proposedRequest: hasChange(proposedRequest, issue.request)
          ? proposedRequest
          : null,
        proposedCategory:
          proposedCategory != null && proposedCategory !== issue.category
            ? proposedCategory
            : null,
        proposedAddress: hasChange(proposedAddress, issue.address)
          ? proposedAddress
          : null,
        proposedSettlement: hasChange(proposedSettlement, issue.settlement)
          ? proposedSettlement
          : null,
        previousTitle: issue.title,
        previousSummary: issue.summary ?? null,
        previousProblem: issue.problem,
        previousRequest: issue.request,
        previousCategory: issue.category,
        previousAddress: issue.address,
        previousSettlement: issue.settlement,
      })
      .returning();

    return {
      id: row.id,
      issueId: row.issueId,
      issueSlug: slug,
      authorUserId: row.authorUserId,
      authorEmail: user.email,
      authorName: user.name,
      status: row.status,
      rationale: row.rationale,
      proposedTitle: row.proposedTitle,
      proposedSummary: row.proposedSummary,
      proposedProblem: row.proposedProblem,
      proposedRequest: row.proposedRequest,
      proposedCategory: row.proposedCategory,
      proposedAddress: row.proposedAddress,
      proposedSettlement: row.proposedSettlement,
      previousTitle: row.previousTitle,
      previousSummary: row.previousSummary,
      previousProblem: row.previousProblem,
      previousRequest: row.previousRequest,
      previousCategory: row.previousCategory,
      previousAddress: row.previousAddress,
      previousSettlement: row.previousSettlement,
      reviewerUserId: row.reviewerUserId,
      reviewNote: row.reviewNote,
      reviewedAt: row.reviewedAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
    };
  } catch {
    const suggestion: EditSuggestion = {
      id,
      issueId: issue.id,
      issueSlug: slug,
      authorUserId: user.id,
      authorEmail: user.email,
      authorName: user.name,
      status: "pending",
      rationale: input.rationale?.trim() || null,
      proposedTitle: hasChange(proposedTitle, issue.title) ? proposedTitle : null,
      proposedSummary:
        proposedSummary !== null &&
        normalize(proposedSummary) !== normalize(issue.summary ?? "")
          ? proposedSummary
          : null,
      proposedProblem: hasChange(proposedProblem, issue.problem)
        ? proposedProblem
        : null,
      proposedRequest: hasChange(proposedRequest, issue.request)
        ? proposedRequest
        : null,
      proposedCategory:
        proposedCategory != null && proposedCategory !== issue.category
          ? proposedCategory
          : null,
      proposedAddress: hasChange(proposedAddress, issue.address)
        ? proposedAddress
        : null,
      proposedSettlement: hasChange(proposedSettlement, issue.settlement)
        ? proposedSettlement
        : null,
      previousTitle: issue.title,
      previousSummary: issue.summary ?? null,
      previousProblem: issue.problem,
      previousRequest: issue.request,
      previousCategory: issue.category,
      previousAddress: issue.address,
      previousSettlement: issue.settlement,
      reviewerUserId: null,
      reviewNote: null,
      reviewedAt: null,
      createdAt,
    };
    memorySuggestions.unshift(suggestion);
    return suggestion;
  }
}

export async function listPendingSuggestions(): Promise<EditSuggestion[]> {
  try {
    const { db } = await import("@db");
    const { issueEditSuggestions, issues, users } = await import("@db/schema");
    const { eq, desc } = await import("drizzle-orm");

    const rows = await db
      .select({
        sug: issueEditSuggestions,
        slug: issues.slug,
        authorEmail: users.email,
        authorName: users.name,
      })
      .from(issueEditSuggestions)
      .innerJoin(issues, eq(issueEditSuggestions.issueId, issues.id))
      .innerJoin(users, eq(issueEditSuggestions.authorUserId, users.id))
      .where(eq(issueEditSuggestions.status, "pending"))
      .orderBy(desc(issueEditSuggestions.createdAt));

    return rows.map(({ sug, slug, authorEmail, authorName }) => ({
      id: sug.id,
      issueId: sug.issueId,
      issueSlug: slug,
      authorUserId: sug.authorUserId,
      authorEmail,
      authorName,
      status: sug.status,
      rationale: sug.rationale,
      proposedTitle: sug.proposedTitle,
      proposedSummary: sug.proposedSummary,
      proposedProblem: sug.proposedProblem,
      proposedRequest: sug.proposedRequest,
      proposedCategory: sug.proposedCategory,
      proposedAddress: sug.proposedAddress,
      proposedSettlement: sug.proposedSettlement,
      previousTitle: sug.previousTitle,
      previousSummary: sug.previousSummary,
      previousProblem: sug.previousProblem,
      previousRequest: sug.previousRequest,
      previousCategory: sug.previousCategory,
      previousAddress: sug.previousAddress,
      previousSettlement: sug.previousSettlement,
      reviewerUserId: sug.reviewerUserId,
      reviewNote: sug.reviewNote,
      reviewedAt: sug.reviewedAt?.toISOString() ?? null,
      createdAt: sug.createdAt.toISOString(),
    }));
  } catch {
    return memorySuggestions.filter((s) => s.status === "pending");
  }
}

export async function listSuggestionsForIssue(
  slug: string,
): Promise<EditSuggestion[]> {
  try {
    const { db } = await import("@db");
    const { issueEditSuggestions, issues, users } = await import("@db/schema");
    const { eq, desc } = await import("drizzle-orm");

    const rows = await db
      .select({
        sug: issueEditSuggestions,
        slug: issues.slug,
        authorEmail: users.email,
        authorName: users.name,
      })
      .from(issueEditSuggestions)
      .innerJoin(issues, eq(issueEditSuggestions.issueId, issues.id))
      .innerJoin(users, eq(issueEditSuggestions.authorUserId, users.id))
      .where(eq(issues.slug, slug))
      .orderBy(desc(issueEditSuggestions.createdAt))
      .limit(20);

    return rows.map(({ sug, slug: issueSlug, authorEmail, authorName }) => ({
      id: sug.id,
      issueId: sug.issueId,
      issueSlug,
      authorUserId: sug.authorUserId,
      authorEmail,
      authorName,
      status: sug.status,
      rationale: sug.rationale,
      proposedTitle: sug.proposedTitle,
      proposedSummary: sug.proposedSummary,
      proposedProblem: sug.proposedProblem,
      proposedRequest: sug.proposedRequest,
      proposedCategory: sug.proposedCategory,
      proposedAddress: sug.proposedAddress,
      proposedSettlement: sug.proposedSettlement,
      previousTitle: sug.previousTitle,
      previousSummary: sug.previousSummary,
      previousProblem: sug.previousProblem,
      previousRequest: sug.previousRequest,
      previousCategory: sug.previousCategory,
      previousAddress: sug.previousAddress,
      previousSettlement: sug.previousSettlement,
      reviewerUserId: sug.reviewerUserId,
      reviewNote: sug.reviewNote,
      reviewedAt: sug.reviewedAt?.toISOString() ?? null,
      createdAt: sug.createdAt.toISOString(),
    }));
  } catch {
    return memorySuggestions.filter((s) => s.issueSlug === slug);
  }
}

export async function reviewSuggestion(
  suggestionId: string,
  decision: "approved" | "rejected",
  reviewer: AuthUser,
  reviewNote?: string,
): Promise<EditSuggestion | null> {
  try {
    const { db } = await import("@db");
    const { issueEditSuggestions, users, issues } = await import("@db/schema");
    const { eq } = await import("drizzle-orm");

    await db
      .insert(users)
      .values({
        id: reviewer.id,
        email: reviewer.email,
        name: reviewer.name ?? null,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: { email: reviewer.email, name: reviewer.name ?? null },
      });

    const [sug] = await db
      .select()
      .from(issueEditSuggestions)
      .where(eq(issueEditSuggestions.id, suggestionId))
      .limit(1);
    if (!sug || sug.status !== "pending") return null;

    if (decision === "approved") {
      const fields: Parameters<typeof applyApprovedFields>[1] = {};
      if (sug.proposedTitle) fields.title = sug.proposedTitle;
      if (sug.proposedSummary !== null && sug.proposedSummary !== undefined) {
        fields.summary = sug.proposedSummary;
      }
      if (sug.proposedProblem) fields.problem = sug.proposedProblem;
      if (sug.proposedRequest) fields.request = sug.proposedRequest;
      if (sug.proposedCategory) fields.category = sug.proposedCategory;
      if (sug.proposedAddress) fields.address = sug.proposedAddress;
      if (sug.proposedSettlement) fields.settlement = sug.proposedSettlement;
      await applyApprovedFields(sug.issueId, fields);
    }

    const [updated] = await db
      .update(issueEditSuggestions)
      .set({
        status: decision,
        reviewerUserId: reviewer.id,
        reviewNote: reviewNote?.trim() || null,
        reviewedAt: new Date(),
      })
      .where(eq(issueEditSuggestions.id, suggestionId))
      .returning();

    const [issueRow] = await db
      .select({ slug: issues.slug })
      .from(issues)
      .where(eq(issues.id, updated.issueId))
      .limit(1);

    return {
      id: updated.id,
      issueId: updated.issueId,
      issueSlug: issueRow?.slug ?? "",
      authorUserId: updated.authorUserId,
      status: updated.status,
      rationale: updated.rationale,
      proposedTitle: updated.proposedTitle,
      proposedSummary: updated.proposedSummary,
      proposedProblem: updated.proposedProblem,
      proposedRequest: updated.proposedRequest,
      proposedCategory: updated.proposedCategory,
      proposedAddress: updated.proposedAddress,
      proposedSettlement: updated.proposedSettlement,
      previousTitle: updated.previousTitle,
      previousSummary: updated.previousSummary,
      previousProblem: updated.previousProblem,
      previousRequest: updated.previousRequest,
      previousCategory: updated.previousCategory,
      previousAddress: updated.previousAddress,
      previousSettlement: updated.previousSettlement,
      reviewerUserId: updated.reviewerUserId,
      reviewNote: updated.reviewNote,
      reviewedAt: updated.reviewedAt?.toISOString() ?? null,
      createdAt: updated.createdAt.toISOString(),
    };
  } catch {
    const sug = memorySuggestions.find((s) => s.id === suggestionId);
    if (!sug || sug.status !== "pending") return null;

    if (decision === "approved") {
      const fields: Parameters<typeof applyApprovedFields>[1] = {};
      if (sug.proposedTitle) fields.title = sug.proposedTitle;
      if (sug.proposedSummary !== null)
        fields.summary = sug.proposedSummary;
      if (sug.proposedProblem) fields.problem = sug.proposedProblem;
      if (sug.proposedRequest) fields.request = sug.proposedRequest;
      if (sug.proposedCategory) fields.category = sug.proposedCategory;
      if (sug.proposedAddress) fields.address = sug.proposedAddress;
      if (sug.proposedSettlement) fields.settlement = sug.proposedSettlement;
      await applyApprovedFields(sug.issueId, fields);
    }

    sug.status = decision;
    sug.reviewerUserId = reviewer.id;
    sug.reviewNote = reviewNote?.trim() || null;
    sug.reviewedAt = new Date().toISOString();
    return sug;
  }
}
