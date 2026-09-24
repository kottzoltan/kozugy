"use client";

import { useState } from "react";
import type { Issue } from "@/lib/types";
import { IssueCard } from "@/components/issues/issue-card";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Navigation } from "lucide-react";
import { useT } from "@/components/i18n/locale-provider";

interface NearbySectionProps {
  issues: Issue[];
}

export function NearbySection({ issues }: NearbySectionProps) {
  const t = useT();
  const [mode, setMode] = useState<"none" | "located" | "settlement">("none");
  const [settlement, setSettlement] = useState("");

  return (
    <section className="container-page section-y">
      <h2 className="text-2xl font-bold md:text-3xl">{t("nearby.title")}</h2>

      {mode === "none" && (
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-dashed border-border bg-card/60 p-6 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <label htmlFor="settlement" className="text-sm font-medium">
              {t("nearby.settlementLabel")}
            </label>
            <Input
              id="settlement"
              value={settlement}
              onChange={(e) => setSettlement(e.target.value)}
              placeholder={t("nearby.settlementPlaceholder")}
              className="h-11"
            />
          </div>
          <button
            type="button"
            className={cn(buttonVariants(), "h-11")}
            onClick={() => settlement.trim() && setMode("settlement")}
          >
            {t("nearby.show")}
          </button>
          <button
            type="button"
            className={cn(buttonVariants({ variant: "secondary" }), "h-11 gap-2")}
            onClick={() => setMode("located")}
          >
            <Navigation className="size-4" />
            {t("nearby.useLocation")}
          </button>
        </div>
      )}

      {(mode === "located" || mode === "settlement") && (
        <>
          <p className="mt-2 text-muted-foreground">
            {mode === "located"
              ? t("nearby.locatedHint")
              : t("nearby.settlementHint", { settlement })}
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {issues.slice(0, 6).map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
