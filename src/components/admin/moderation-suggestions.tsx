"use client";

import { useCallback, useEffect, useState, startTransition } from "react";
import Link from "next/link";
import type { EditSuggestion } from "@/lib/data/edit-suggestions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-provider";
import { CATEGORY_LABEL } from "@/lib/status";

function DiffRow({
  label,
  before,
  after,
}: {
  label: string;
  before: string;
  after: string | null;
}) {
  if (!after || after === before) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-red-700/80 line-through">{before || "—"}</p>
      <p className="mt-1 font-medium text-emerald-800">{after}</p>
    </div>
  );
}

export function ModerationSuggestionsPanel() {
  const { user } = useAuth();
  const [items, setItems] = useState<EditSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  const headers = useCallback((): HeadersInit => {
    const h: HeadersInit = { "Content-Type": "application/json" };
    if (user?.isDev) {
      h["x-kozugy-dev-user"] = JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        roles: ["admin"],
      });
    }
    return h;
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    startTransition(() => {
      setLoading(true);
      setError(null);
    });
    void (async () => {
      try {
        const res = await fetch("/api/admin/suggestions", { headers: headers() });
        if (cancelled) return;
        if (!res.ok) {
          setError(
            res.status === 403
              ? "Nincs moderátori jogosultság. Fejlesztői belépéssel próbáld."
              : "Nem sikerült betölteni a javaslatokat.",
          );
          setItems([]);
          return;
        }
        const data = (await res.json()) as { suggestions: EditSuggestion[] };
        setItems(data.suggestions);
      } catch {
        if (!cancelled) setError("Nem sikerült betölteni a javaslatokat.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [headers]);

  async function decide(id: string, decision: "approved" | "rejected") {
    setActing(id);
    try {
      const res = await fetch("/api/admin/suggestions", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ id, decision }),
      });
      if (res.ok) {
        setItems((prev) => prev.filter((s) => s.id !== id));
      }
    } finally {
      setActing(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Betöltés…</p>;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        {error}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Nincs függőben lévő szerkesztési javaslat.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {items.map((s) => (
        <li
          key={s.id}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <Link
                href={`/ugy/${s.issueSlug}`}
                className="font-semibold text-teal-800 hover:underline"
                target="_blank"
              >
                {s.previousTitle}
              </Link>
              <p className="mt-1 text-xs text-slate-500">
                {s.authorName || s.authorEmail} ·{" "}
                {new Date(s.createdAt).toLocaleString("hu-HU")}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={acting === s.id}
                onClick={() => void decide(s.id, "approved")}
                className={cn(buttonVariants({ size: "sm" }))}
              >
                Jóváhagyás
              </button>
              <button
                type="button"
                disabled={acting === s.id}
                onClick={() => void decide(s.id, "rejected")}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                Elutasítás
              </button>
            </div>
          </div>
          {s.rationale && (
            <p className="mt-3 text-sm italic text-slate-600">
              Indoklás: {s.rationale}
            </p>
          )}
          <div className="mt-3 space-y-2">
            <DiffRow label="Cím" before={s.previousTitle} after={s.proposedTitle} />
            <DiffRow
              label="Összefoglaló"
              before={s.previousSummary ?? ""}
              after={s.proposedSummary}
            />
            <DiffRow
              label="Probléma"
              before={s.previousProblem}
              after={s.proposedProblem}
            />
            <DiffRow
              label="Kérés"
              before={s.previousRequest}
              after={s.proposedRequest}
            />
            <DiffRow
              label="Település"
              before={s.previousSettlement}
              after={s.proposedSettlement}
            />
            <DiffRow
              label="Cím (utca)"
              before={s.previousAddress}
              after={s.proposedAddress}
            />
            {s.proposedCategory && s.proposedCategory !== s.previousCategory && (
              <DiffRow
                label="Kategória"
                before={CATEGORY_LABEL[s.previousCategory]}
                after={CATEGORY_LABEL[s.proposedCategory]}
              />
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
