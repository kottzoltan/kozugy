import { NextResponse } from "next/server";
import { getRequestUser, isModerator } from "@/lib/auth/request-user";
import {
  assignOrganizationToIssue,
  listIssueOrganizations,
  removeOrganizationFromIssue,
  updateIssueOrgLink,
} from "@/lib/data/organizations";
import type { OrgLinkStatus, OrgRelationRole } from "@/lib/types";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const links = await listIssueOrganizations(slug);
  return NextResponse.json({ links });
}

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const user = await getRequestUser(request);
  if (!user || !isModerator(user)) {
    return NextResponse.json({ error: "Nincs jogosultság." }, { status: 403 });
  }

  let body: {
    organizationId?: string;
    role?: OrgRelationRole;
    linkStatus?: OrgLinkStatus;
    note?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Érvénytelen kérés." }, { status: 400 });
  }

  if (!body.organizationId) {
    return NextResponse.json(
      { error: "Hiányzó organizationId." },
      { status: 400 },
    );
  }

  const link = await assignOrganizationToIssue(
    slug,
    body.organizationId,
    body.role ?? "illetekes",
    body.linkStatus ?? "hozzarendelve",
    body.note,
  );
  if (!link) {
    return NextResponse.json(
      { error: "Nem sikerült a hozzárendelés." },
      { status: 404 },
    );
  }
  return NextResponse.json({ link }, { status: 201 });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const user = await getRequestUser(request);
  if (!user || !isModerator(user)) {
    return NextResponse.json({ error: "Nincs jogosultság." }, { status: 403 });
  }

  let body: {
    organizationId?: string;
    role?: OrgRelationRole;
    linkStatus?: OrgLinkStatus;
    note?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Érvénytelen kérés." }, { status: 400 });
  }

  if (!body.organizationId) {
    return NextResponse.json(
      { error: "Hiányzó organizationId." },
      { status: 400 },
    );
  }

  const link = await updateIssueOrgLink(slug, body.organizationId, {
    role: body.role,
    linkStatus: body.linkStatus,
    note: body.note,
  });
  if (!link) {
    return NextResponse.json({ error: "Kapcsolat nem található." }, { status: 404 });
  }
  return NextResponse.json({ link });
}

export async function DELETE(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const user = await getRequestUser(request);
  if (!user || !isModerator(user)) {
    return NextResponse.json({ error: "Nincs jogosultság." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId");
  if (!organizationId) {
    return NextResponse.json(
      { error: "Hiányzó organizationId." },
      { status: 400 },
    );
  }

  await removeOrganizationFromIssue(slug, organizationId);
  return NextResponse.json({ ok: true });
}
