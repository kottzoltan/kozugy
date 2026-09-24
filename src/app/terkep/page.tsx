"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { categories } from "@/lib/mock-data";
import { IssueMap } from "@/components/map/issue-map";
import { IssueCard } from "@/components/issues/issue-card";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Issue, IssueStatus } from "@/lib/types";
import { getCategoryLabel, getStatusLabel } from "@/lib/status";
import { useLocale } from "@/components/i18n/locale-provider";

export default function MapPage() {
  const { locale, t } = useLocale();
  const [view, setView] = useState<"map" | "list">("map");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/issues");
        if (!res.ok) throw new Error("load failed");
        const data = (await res.json()) as { issues: Issue[] };
        if (!cancelled) setIssues(data.issues);
      } catch {
        if (!cancelled) {
          setError(t("map.loadError"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const filtered = useMemo(() => {
    return issues.filter((i) => {
      if (category !== "all" && i.category !== category) return false;
      if (status !== "all" && i.status !== status) return false;
      if (
        query &&
        !`${i.title} ${i.settlement}`.toLowerCase().includes(query.toLowerCase())
      )
        return false;
      return true;
    });
  }, [issues, category, status, query]);

  const statuses = [
    "uj",
    "ertesitve",
    "vizsgalat",
    "folyamatban",
    "megoldott",
    "elutasitott",
  ] as IssueStatus[];

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col md:h-[calc(100vh-4rem)] md:flex-row">
      <aside className="z-10 flex max-h-[45%] flex-col border-b border-border bg-card md:max-h-none md:w-96 md:border-b-0 md:border-r">
        <div className="space-y-3 border-b border-border p-4">
          <h1 className="text-lg font-bold">{t("map.title")}</h1>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("map.searchPlaceholder")}
            aria-label={t("nav.search")}
            className="h-10"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setView("map")}
              className={cn(
                buttonVariants({
                  variant: view === "map" ? "default" : "outline",
                  size: "sm",
                }),
                "flex-1",
              )}
            >
              {t("map.title")}
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={cn(
                buttonVariants({
                  variant: view === "list" ? "default" : "outline",
                  size: "sm",
                }),
                "flex-1",
              )}
            >
              {t("map.list")}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select
              className="h-9 rounded-lg border border-input bg-background px-2 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label={t("map.categoryAria")}
            >
              <option value="all">{t("common.allCategories")}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {getCategoryLabel(c.id, locale)}
                </option>
              ))}
            </select>
            <select
              className="h-9 rounded-lg border border-input bg-background px-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              aria-label={t("map.statusAria")}
            >
              <option value="all">{t("common.allStatuses")}</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {getStatusLabel(s, locale)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {loading && (
            <p className="text-sm text-muted-foreground">{t("map.loading")}</p>
          )}
          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
              {error}
            </div>
          )}
          {!loading && !error && filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-center">
              <p className="font-semibold">{t("nearby.emptyTitle")}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("nearby.emptySubtitle")}
              </p>
              <Link
                href="/uj-ugy"
                className={cn(buttonVariants({ size: "sm" }), "mt-4")}
              >
                + {t("nav.newIssue")}
              </Link>
            </div>
          ) : (
            filtered.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                compact
                showSupport={false}
              />
            ))
          )}
        </div>
      </aside>
      <div
        className={cn("relative min-h-0 flex-1", view === "list" && "hidden md:block")}
      >
        <IssueMap
          issues={filtered}
          heightClass="h-full min-h-[280px] rounded-none border-0"
          centerLabel={t("map.issueCount", { count: filtered.length })}
        />
      </div>
    </div>
  );
}
