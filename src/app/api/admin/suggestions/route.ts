import { NextResponse } from "next/server";
import { getRequestUser, isModerator } from "@/lib/auth/request-user";
import {
  listPendingSuggestions,
  reviewSuggestion,
} from "@/lib/data/edit-suggestions";

export async function GET(request: Request) {
  const user = await getRequestUser(request);
  if (!user || !isModerator(user)) {
    return NextResponse.json({ error: "Nincs jogosultság." }, { status: 403 });
  }
  const suggestions = await listPendingSuggestions();
  return NextResponse.json({ suggestions });
}

export async function POST(request: Request) {
  const user = await getRequestUser(request);
  if (!user || !isModerator(user)) {
    return NextResponse.json({ error: "Nincs jogosultság." }, { status: 403 });
  }

  let body: { id?: string; decision?: string; note?: string };
  try {
    body = (await request.json()) as {
      id?: string;
      decision?: string;
      note?: string;
    };
  } catch {
    return NextResponse.json({ error: "Érvénytelen kérés." }, { status: 400 });
  }

  if (!body.id || (body.decision !== "approved" && body.decision !== "rejected")) {
    return NextResponse.json({ error: "Hiányzó mezők." }, { status: 400 });
  }

  const result = await reviewSuggestion(
    body.id,
    body.decision,
    user,
    body.note,
  );
  if (!result) {
    return NextResponse.json(
      { error: "Javaslat nem található vagy már elbírált." },
      { status: 404 },
    );
  }
  return NextResponse.json({ suggestion: result });
}
