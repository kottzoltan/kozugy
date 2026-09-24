import { NextResponse } from "next/server";
import { runIssueAssist } from "@/lib/ai/issue-assist";
import type { IssueAssistRequestBody } from "@/lib/ai/issue-assist-types";
import { isLocale } from "@/lib/i18n/types";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as IssueAssistRequestBody;
    const lang = isLocale(body.lang) ? body.lang : "hu";

    const hasText = [body.title, body.problem, body.request].some(
      (v) => typeof v === "string" && v.trim().length > 0,
    );
    if (!hasText) {
      return NextResponse.json(
        {
          error:
            lang === "en"
              ? "Enter at least a short title or description."
              : "Írj legalább egy rövid címet vagy leírást.",
        },
        { status: 400 },
      );
    }

    const result = await runIssueAssist({ ...body, lang });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "AI assist failed" },
      { status: 500 },
    );
  }
}
