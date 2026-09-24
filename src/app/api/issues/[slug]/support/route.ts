import { NextResponse } from "next/server";
import { getUser } from "@netlify/identity";
import { supportIssue } from "@/lib/data/issues";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;

  let user: { id: string; email: string; name?: string | null } | null = null;

  try {
    const identityUser = await getUser();
    if (identityUser) {
      user = {
        id: identityUser.id,
        email: identityUser.email ?? "",
        name: identityUser.name ?? null,
      };
    }
  } catch {
    /* Identity not configured locally */
  }

  if (!user) {
    const header = request.headers.get("x-kozugy-dev-user");
    if (header && process.env.NODE_ENV !== "production") {
      try {
        user = JSON.parse(header) as {
          id: string;
          email: string;
          name?: string | null;
        };
      } catch {
        /* ignore */
      }
    }
  }

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
