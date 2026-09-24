import { NextResponse } from "next/server";
import { listIssues } from "@/lib/data/issues";

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
