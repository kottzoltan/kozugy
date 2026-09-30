import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth/request-user";
import { supportIssue } from "@/lib/data/issues";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const user = await getRequestUser(request);

  if (!user?.id || !user.email) {
    return NextResponse.json(
      { error: "Jelentkezz be a támogatáshoz." },
      { status: 401 },
    );
  }

  const result = await supportIssue(slug, user);
  if (!result) {
    return NextResponse.json(
      { error: "Nem sikerült megtalálni az ügyet." },
      { status: 404 },
    );
  }

  return NextResponse.json(result);
}
