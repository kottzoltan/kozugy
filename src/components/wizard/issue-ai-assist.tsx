"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/i18n/locale-provider";
import type { CategoryId, IssueType } from "@/lib/types";
import type { Locale } from "@/lib/i18n/types";
import type {
  IssueAssistResponse,
  IssueAssistSuggestion,
} from "@/lib/ai/issue-assist-types";
import { getCategoryLabel } from "@/lib/status";

export interface IssueAiAssistProps {
  title: string;
  problem: string;
  request: string;
  category?: CategoryId;
  type: IssueType | null;
  settlement?: string;
  address?: string;
  location?: { lat: number; lng: number };
  onAccept: (suggestion: IssueAssistSuggestion & { applyCategory?: CategoryId }) => void;
  onDuplicates?: (response: IssueAssistResponse) => void;
}

export function IssueAiAssist({
  title,
  problem,
  request,
  category,
  type,
  settlement,
  address,
  location,
  onAccept,
  onDuplicates,
}: IssueAiAssistProps) {
  const { locale, setLocale, t } = useLocale();
  const [assistLang, setAssistLang] = useState<Locale>(locale);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<IssueAssistResponse | null>(null);

  async function runAssist() {
    if (![title, problem, request].some((v) => v.trim())) {
      setError(t("aiAssist.needInput"));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/issue-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          problem,
          request,
          category,
          type,
          settlement,
          address,
          location,
          lang: assistLang,
        }),
      });
      const data = (await res.json()) as IssueAssistResponse & { error?: string };
      if (!res.ok) {
        setError(data.error ?? t("aiAssist.error"));
        return;
      }
      setResult(data);
      onDuplicates?.(data);
      if (data.source === "heuristic") {
        setError(t("aiAssist.error"));
      }
    } catch {
      setError(t("aiAssist.error"));
    } finally {
      setLoading(false);
    }
  }

  function acceptAll() {
    if (!result) return;
    onAccept({
      ...result.suggestion,
      applyCategory: result.suggestion.suggestedCategory,
    });
    if (assistLang !== locale) setLocale(assistLang);
    setResult(null);
    setError(null);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => void runAssist()}
          className={cn(buttonVariants({ variant: "secondary" }), "gap-2")}
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {loading ? t("aiAssist.loading") : t("aiAssist.button")}
        </button>
        <div
          className="inline-flex items-center gap-1 rounded-lg border border-border p-0.5 text-xs font-semibold"
          role="group"
          aria-label={t("aiAssist.langLabel")}
        >
          {(["hu", "en"] as const).map((l) => (
            <button
              type="button"
              key={l}
              onClick={() => setAssistLang(l)}
              className={cn(
                "rounded-md px-2 py-1",
                assistLang === l
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground",
              )}
              aria-pressed={assistLang === l}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{t("aiAssist.hint")}</p>
      {error && !result && (
        <p className="text-sm text-amber-800" role="status">
          {error}
        </p>
      )}

      {result && (
        <div className="space-y-3 rounded-2xl border border-primary/25 bg-accent/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold">{t("aiAssist.suggestionTitle")}</p>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-secondary-foreground">
              {result.source === "ai"
                ? t("aiAssist.sourceAi")
                : t("aiAssist.sourceHeuristic")}
            </span>
          </div>
          {error && result.source === "heuristic" && (
            <p className="text-xs text-amber-800">{error}</p>
          )}
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              {t("aiAssist.interpretation")}
            </p>
            <p className="mt-1 text-sm leading-relaxed">
              {result.suggestion.interpretation}
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">{t("aiAssist.acceptTitle")}: </span>
              {result.suggestion.title}
            </p>
            <p>
              <span className="font-medium">{t("aiAssist.acceptProblem")}: </span>
              {result.suggestion.problem}
            </p>
            <p>
              <span className="font-medium">{t("aiAssist.acceptRequest")}: </span>
              {result.suggestion.request}
            </p>
            {result.suggestion.suggestedCategory && (
              <p>
                <span className="font-medium">
                  {t("aiAssist.suggestedCategory")}:{" "}
                </span>
                {getCategoryLabel(
                  result.suggestion.suggestedCategory,
                  assistLang,
                )}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={acceptAll}
              className={cn(buttonVariants({ size: "sm" }))}
            >
              {t("aiAssist.acceptAll")}
            </button>
            <button
              type="button"
              onClick={() => {
                setResult(null);
                setError(null);
              }}
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              {t("aiAssist.dismiss")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
