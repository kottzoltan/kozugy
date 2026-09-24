import OpenAI from "openai";
import { listIssues } from "@/lib/data/issues";
import { getDictionary } from "@/lib/i18n/translate";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/types";
import { heuristicIssueAssist } from "@/lib/ai/issue-assist-fallback";
import type {
  IssueAssistRequestBody,
  IssueAssistResponse,
  IssueAssistSuggestion,
} from "@/lib/ai/issue-assist-types";
import type { CategoryId } from "@/lib/types";

const CATEGORY_IDS: CategoryId[] = [
  "kozlekedes",
  "katyu",
  "parkolas",
  "koztisztasag",
  "zoldterulet",
  "vilagitas",
  "zaj",
  "epuletek",
  "egyeb",
];

function gatewayAvailable(): boolean {
  return Boolean(
    process.env.OPENAI_API_KEY || process.env.NETLIFY_AI_GATEWAY_KEY,
  );
}

function parseSuggestion(
  raw: string,
): IssueAssistSuggestion | null {
  try {
    const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
    const data = JSON.parse(cleaned) as Partial<IssueAssistSuggestion>;
    if (!data.title || !data.problem || !data.request || !data.interpretation) {
      return null;
    }
    const suggestedCategory =
      data.suggestedCategory && CATEGORY_IDS.includes(data.suggestedCategory)
        ? data.suggestedCategory
        : undefined;
    return {
      title: String(data.title).trim(),
      problem: String(data.problem).trim(),
      request: String(data.request).trim(),
      interpretation: String(data.interpretation).trim(),
      suggestedCategory,
    };
  } catch {
    return null;
  }
}

async function aiStructure(
  input: IssueAssistRequestBody,
  lang: Locale,
): Promise<IssueAssistSuggestion | null> {
  if (!gatewayAvailable()) return null;

  const dict = getDictionary(lang);
  const categoryList = CATEGORY_IDS.map(
    (id) => `${id} (${dict.category[id]})`,
  ).join(", ");

  const system =
    lang === "en"
      ? `You help citizens phrase civic issue reports for KÖZÜGY (Hungary). Reply with JSON only: {"title","problem","request","interpretation","suggestedCategory"}. Use clear, respectful English. suggestedCategory must be one of: ${CATEGORY_IDS.join(", ")}. interpretation is 1-2 short sentences ("In brief"). Do not invent facts not present in the user input.`
      : `Közösségi ügybejelentéseket fogalmazol a KÖZÜGY platformhoz. Csak JSON-t adj: {"title","problem","request","interpretation","suggestedCategory"}. Magyarul, közérthetően. suggestedCategory egy ezek közül: ${CATEGORY_IDS.join(", ")}. Az interpretation 1-2 rövid mondat („Röviden”). Ne találj ki tényeket, amik nincsenek a bemenetben. Kategóriák: ${categoryList}.`;

  const userPayload = {
    title: input.title ?? "",
    problem: input.problem ?? "",
    request: input.request ?? "",
    category: input.category ?? null,
    type: input.type ?? null,
    settlement: input.settlement ?? "",
    address: input.address ?? "",
  };

  try {
    const openai = new OpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: JSON.stringify(userPayload),
        },
      ],
    });
    const content = completion.choices[0]?.message?.content;
    if (!content) return null;
    return parseSuggestion(content);
  } catch {
    return null;
  }
}

export async function runIssueAssist(
  input: IssueAssistRequestBody,
): Promise<IssueAssistResponse> {
  const lang: Locale = isLocale(input.lang) ? input.lang : DEFAULT_LOCALE;
  const issues = await listIssues();
  const fallback = heuristicIssueAssist({ ...input, lang }, issues);

  const aiSuggestion = await aiStructure({ ...input, lang }, lang);
  if (!aiSuggestion) return fallback;

  return {
    suggestion: aiSuggestion,
    duplicates: fallback.duplicates.map((d) => ({
      ...d,
      reason:
        d.score >= 0.45
          ? getDictionary(lang).duplicate.reasonAi
          : d.reason,
    })),
    source: "ai",
    lang,
  };
}
