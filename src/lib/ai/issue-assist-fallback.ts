import type { CategoryId, Issue, IssueType } from "@/lib/types";
import { getDictionary } from "@/lib/i18n/translate";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/types";
import type {
  DuplicateMatchDto,
  IssueAssistRequestBody,
  IssueAssistResponse,
  IssueAssistSuggestion,
} from "@/lib/ai/issue-assist-types";

const CATEGORY_KEYWORDS: Record<CategoryId, string[]> = {
  kozlekedes: [
    "zebra",
    "átkel",
    "atkel",
    "iskola",
    "forgalom",
    "út",
    "ut",
    "gyalog",
    "crosswalk",
    "pedestrian",
    "traffic",
    "school",
    "road",
    "speed",
  ],
  katyu: ["kátyú", "katyu", "lyuk", "pothole", "burkolat", "asphalt"],
  parkolas: ["parkol", "parking", "autó", "auto", "car"],
  koztisztasag: [
    "hulladék",
    "hulladek",
    "szemét",
    "szemet",
    "waste",
    "litter",
    "trash",
    "garbage",
    "dump",
  ],
  zoldterulet: ["fa", "park", "zöld", "zold", "tree", "green", "playground"],
  vilagitas: ["világít", "vilagit", "lámpa", "lampa", "light", "lamp", "dark"],
  zaj: ["zaj", "noise", "hangos", "loud"],
  epuletek: ["épület", "epulet", "building", "ház", "haz"],
  egyeb: [],
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(text: string): Set<string> {
  return new Set(
    normalize(text)
      .split(" ")
      .filter((t) => t.length > 2),
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter += 1;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

function haversineMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function guessCategory(blob: string, current?: CategoryId): CategoryId {
  const n = normalize(blob);
  let best: CategoryId = current ?? "egyeb";
  let bestScore = 0;
  for (const [id, words] of Object.entries(CATEGORY_KEYWORDS) as [
    CategoryId,
    string[],
  ][]) {
    if (id === "egyeb") continue;
    let score = 0;
    for (const w of words) {
      if (n.includes(normalize(w))) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = id;
    }
  }
  return best;
}

function capitalizeSentence(text: string, locale: Locale): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (!trimmed) return "";
  const first = trimmed.charAt(0).toLocaleUpperCase(locale === "en" ? "en" : "hu");
  return first + trimmed.slice(1);
}

function structureSuggestion(
  input: IssueAssistRequestBody,
  locale: Locale,
): IssueAssistSuggestion {
  const dict = getDictionary(locale);
  const type: IssueType = input.type === "javaslat" ? "javaslat" : "problema";
  const rawTitle = (input.title ?? "").trim();
  const rawProblem = (input.problem ?? "").trim();
  const rawRequest = (input.request ?? "").trim();
  const blob = [rawTitle, rawProblem, rawRequest].filter(Boolean).join(" ");
  const suggestedCategory = guessCategory(blob, input.category);

  let title = capitalizeSentence(rawTitle, locale);
  if (!title && rawProblem) {
    title = capitalizeSentence(
      rawProblem.split(/[.!?]/)[0]?.slice(0, 80) ?? "",
      locale,
    );
  }
  if (!title) {
    title =
      locale === "en"
        ? type === "javaslat"
          ? "Community improvement suggestion"
          : "Neighborhood problem report"
        : type === "javaslat"
          ? "Közösségi javaslat"
          : "Környékbeli problémabejelentés";
  }

  let problem = capitalizeSentence(rawProblem || rawTitle, locale);
  if (problem && !/[.!?]$/.test(problem)) problem += ".";

  let request = capitalizeSentence(rawRequest, locale);
  if (!request) {
    request =
      locale === "en"
        ? type === "javaslat"
          ? "Please consider implementing this improvement for the local community."
          : "Please investigate and resolve this issue as soon as possible."
        : type === "javaslat"
          ? "Kérjük, fontolják meg a javaslat megvalósítását a helyi közösség érdekében."
          : "Kérjük, vizsgálják ki és orvosolják a problémát mielőbb.";
  }
  if (request && !/[.!?]$/.test(request)) request += ".";

  const place = [input.settlement, input.address].filter(Boolean).join(", ");
  const catLabel = dict.category[suggestedCategory];
  const interpretation =
    locale === "en"
      ? `This looks like a ${catLabel.toLowerCase()} ${type === "javaslat" ? "suggestion" : "problem"}${place ? ` in ${place}` : ""}. Clear title and a concrete ask help others support it.`
      : `Ez ${catLabel.toLowerCase()} témájú ${type === "javaslat" ? "javaslat" : "probléma"}${place ? ` (${place})` : ""}. Egyértelmű cím és konkrét kérés segíti a támogatást.`;

  return {
    title,
    problem,
    request,
    suggestedCategory:
      !input.category || input.category === "egyeb"
        ? suggestedCategory
        : input.category !== suggestedCategory
          ? suggestedCategory
          : undefined,
    interpretation,
  };
}

function findDuplicates(
  input: IssueAssistRequestBody,
  issues: Issue[],
  locale: Locale,
): DuplicateMatchDto[] {
  const dict = getDictionary(locale);
  const queryText = [input.title, input.problem, input.request]
    .filter(Boolean)
    .join(" ");
  const qTokens = tokens(queryText);
  const settlement = normalize(input.settlement ?? "");

  const scored = issues
    .map((issue) => {
      const issueTokens = tokens(
        `${issue.title} ${issue.problem} ${issue.request} ${issue.summary ?? ""}`,
      );
      const titleScore = jaccard(tokens(input.title ?? ""), tokens(issue.title));
      const textScore = jaccard(qTokens, issueTokens);
      let distanceMeters: number | undefined;
      let distanceScore = 0;
      if (input.location) {
        distanceMeters = Math.round(
          haversineMeters(input.location, issue.location),
        );
        if (distanceMeters < 200) distanceScore = 0.35;
        else if (distanceMeters < 800) distanceScore = 0.2;
        else if (distanceMeters < 2500) distanceScore = 0.08;
      }
      const sameSettlement =
        settlement && normalize(issue.settlement).includes(settlement)
          ? 0.12
          : 0;
      const sameCategory =
        input.category && input.category === issue.category ? 0.08 : 0;

      const score = Math.min(
        1,
        titleScore * 0.45 +
          textScore * 0.35 +
          distanceScore +
          sameSettlement +
          sameCategory,
      );

      let reason = dict.duplicate.reasonTitle;
      if (distanceScore >= 0.2 && titleScore > 0.2) {
        reason = dict.duplicate.reasonNearby;
      }

      return { issue, score, reason, distanceMeters };
    })
    .filter((r) => r.score >= 0.28)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return scored.map(({ issue, score, reason, distanceMeters }) => ({
    id: issue.id,
    slug: issue.slug,
    title: issue.title,
    settlement: issue.settlement,
    address: issue.address,
    category: issue.category,
    type: issue.type,
    status: issue.status,
    supporters: issue.supporters,
    problem: issue.problem,
    request: issue.request,
    location: issue.location,
    images: issue.images,
    createdAt: issue.createdAt,
    distanceMeters: distanceMeters ?? issue.distanceMeters,
    score: Math.round(score * 100) / 100,
    reason,
  }));
}

export function heuristicIssueAssist(
  input: IssueAssistRequestBody,
  issues: Issue[],
): IssueAssistResponse {
  const lang = input.lang && (input.lang === "en" || input.lang === "hu")
    ? input.lang
    : DEFAULT_LOCALE;
  return {
    suggestion: structureSuggestion(input, lang),
    duplicates: findDuplicates(input, issues, lang),
    source: "heuristic",
    lang,
  };
}

export { findDuplicates, structureSuggestion };
