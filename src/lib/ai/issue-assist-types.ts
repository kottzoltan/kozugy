import type { CategoryId, Issue, IssueType } from "@/lib/types";
import type { Locale } from "@/lib/i18n/types";

export interface IssueAssistRequestBody {
  title?: string;
  problem?: string;
  request?: string;
  category?: CategoryId;
  type?: IssueType | null;
  settlement?: string;
  address?: string;
  location?: { lat: number; lng: number };
  lang?: Locale;
}

export interface IssueAssistSuggestion {
  title: string;
  problem: string;
  request: string;
  suggestedCategory?: CategoryId;
  interpretation: string;
}

export interface DuplicateMatchDto {
  id: string;
  slug: string;
  title: string;
  settlement: string;
  address: string;
  category: CategoryId;
  type: IssueType;
  status: Issue["status"];
  supporters: number;
  problem: string;
  request: string;
  location: Issue["location"];
  images: string[];
  createdAt: string;
  distanceMeters?: number;
  score: number;
  reason: string;
}

export interface IssueAssistResponse {
  suggestion: IssueAssistSuggestion;
  duplicates: DuplicateMatchDto[];
  source: "ai" | "heuristic";
  lang: Locale;
}
