import { NextResponse } from "next/server";
import { createIssue, listIssues } from "@/lib/data/issues";
import { getRequestUser } from "@/lib/auth/request-user";
import type { CategoryId, IssueType } from "@/lib/types";

export async function GET() {
  try {
    const issues = await listIssues();
    return NextResponse.json({ issues });
  } catch {
    return NextResponse.json(
      { error: "Nem sikerült betölteni az ügyeket. Próbáld újra." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const user = await getRequestUser(request);
  if (!user) {
    return NextResponse.json(
      { error: "Jelentkezz be az ügy bejelentéséhez." },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Érvénytelen kérés." }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const title = String(b.title ?? "").trim();
  const problem = String(b.problem ?? "").trim();
  const requestText = String(b.request ?? "").trim();
  const settlement = String(b.settlement ?? "").trim();
  const address = String(b.address ?? "").trim();
  const category = b.category as CategoryId | undefined;
  const type = b.type as IssueType | undefined;
  const lat = Number(b.lat);
  const lng = Number(b.lng);
  const summary = b.summary != null ? String(b.summary) : undefined;
  const images = Array.isArray(b.images)
    ? (b.images as unknown[]).map(String).slice(0, 5)
    : [];

  if (!title || !problem || !settlement || !address || !category || !type) {
    return NextResponse.json(
      { error: "Hiányzó kötelező mezők." },
      { status: 400 },
    );
  }
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json(
      { error: "Érvénytelen helyszín." },
      { status: 400 },
    );
  }

  try {
    const issue = await createIssue(
      {
        title,
        problem,
        request: requestText || problem,
        settlement,
        address,
        category,
        type,
        lat,
        lng,
        summary,
        images,
      },
      user,
    );
    return NextResponse.json({ issue }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Nem sikerült létrehozni az ügyet. Próbáld újra." },
      { status: 500 },
    );
  }
}
