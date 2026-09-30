import { NextResponse } from "next/server";
import { listOrganizations } from "@/lib/data/organizations";
import { suggestOrganizations } from "@/lib/org-labels";
import type { CategoryId, OrgType } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as OrgType | null;
  const settlement = searchParams.get("settlement") ?? undefined;
  const suggest = searchParams.get("suggest") === "1";
  const category = searchParams.get("category") as CategoryId | null;

  if (suggest && category) {
    const suggestions = suggestOrganizations({
      category,
      settlement,
    });
    return NextResponse.json({ organizations: suggestions });
  }

  const organizations = await listOrganizations({
    type: type ?? undefined,
    settlement,
  });
  return NextResponse.json({ organizations });
}
