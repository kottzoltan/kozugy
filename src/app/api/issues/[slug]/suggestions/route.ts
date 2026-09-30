import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth/request-user";
import {
  listSuggestionsForIssue,
  proposeEdit,
} from "@/lib/data/edit-suggestions";
import type { CategoryId } from "@/lib/types";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const suggestions = await listSuggestionsForIssue(slug);
  return NextResponse.json({ suggestions });
}

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const user = await getRequestUser(request);
  if (!user) {
    return NextResponse.json(
      { error: "Jelentkezz be a szerkesztési javaslathoz." },
      { status: 401 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Érvénytelen kérés." }, { status: 400 });
  }

  try {
    const suggestion = await proposeEdit(
      slug,
      {
        title: body.title != null ? String(body.title) : undefined,
        summary: body.summary != null ? String(body.summary) : undefined,
        problem: body.problem != null ? String(body.problem) : undefined,
        request: body.request != null ? String(body.request) : undefined,
        category: body.category as CategoryId | undefined,
        address: body.address != null ? String(body.address) : undefined,
        settlement:
          body.settlement != null ? String(body.settlement) : undefined,
        rationale: body.rationale != null ? String(body.rationale) : undefined,
      },
      user,
    );
    if (!suggestion) {
      return NextResponse.json({ error: "Ügy nem található." }, { status: 404 });
    }
    return NextResponse.json({ suggestion }, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === "NO_CHANGES") {
      return NextResponse.json(
        { error: "Nincs változás a javaslatban." },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Nem sikerült elküldeni a javaslatot." },
      { status: 500 },
    );
  }
}
