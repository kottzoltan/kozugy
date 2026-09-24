"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { issues } from "@/lib/mock-data";
import { categories } from "@/lib/mock-data";
import { IssueMap } from "@/components/map/issue-map";
import { IssueCard } from "@/components/issues/issue-card";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { IssueStatus } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/status";

export default function MapPage() {
  const [view, setView] = useState<"map" | "list">("map");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

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
  }, [category, status, query]);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col md:h-[calc(100vh-4rem)] md:flex-row">
      <aside className="z-10 flex max-h-[45%] flex-col border-b border-border bg-card md:max-h-none md:w-96 md:border-b-0 md:border-r">
        <div className="space-y-3 border-b border-border p-4">
          <h1 className="text-lg font-bold">Térkép</h1>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Keresés ügy vagy település…"
            aria-label="Keresés"
            className="h-10"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setView("map")}
              className={cn(
                buttonVariants({ variant: view === "map" ? "default" : "outline", size: "sm" }),
                "flex-1",
              )}
            >
              Térkép
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={cn(
                buttonVariants({ variant: view === "list" ? "default" : "outline", size: "sm" }),
                "flex-1",
              )}
            >
              Lista
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select
              className="h-9 rounded-lg border border-input bg-background px-2 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Kategória"
            >
              <option value="all">Minden kategória</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <select
              className="h-9 rounded-lg border border-input bg-background px-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              aria-label="Státusz"
            >
              <option value="all">Minden státusz</option>
              {(Object.keys(STATUS_LABEL) as IssueStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-center">
              <p className="font-semibold">Még nincs ügy ezen a környéken.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Légy te az első, aki jelez valamit.
              </p>
              <Link href="/uj-ugy" className={cn(buttonVariants({ size: "sm" }), "mt-4")}>
                + Új ügy
              </Link>
            </div>
          ) : (
            filtered.map((issue) => (
              <IssueCard key={issue.id} issue={issue} compact showSupport={false} />
            ))
          )}
        </div>
      </aside>
      <div className={cn("relative min-h-0 flex-1", view === "list" && "hidden md:block")}>
        <IssueMap
          issues={filtered}
          heightClass="h-full min-h-[280px] rounded-none border-0"
          centerLabel={`${filtered.length} ügy`}
        />
      </div>
    </div>
  );
}
