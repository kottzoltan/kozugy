"use client";

import { useState } from "react";
import type { OfficialResponse } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface OfficialResponseCardProps {
  response: OfficialResponse;
}

export function OfficialResponseCard({ response }: OfficialResponseCardProps) {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <section className="rounded-2xl border-2 border-primary/20 bg-card p-5 shadow-sm md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Hivatalos válasz</h2>
          <p className="mt-1 font-medium">{response.organizationName}</p>
          <time className="text-sm text-muted-foreground" dateTime={response.date}>
            {formatDate(response.date)}
          </time>
        </div>
        {response.verified && (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800">
            Ellenőrzött forrás
          </span>
        )}
      </div>

      <div className="mt-5 rounded-xl bg-accent/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Röviden · AI összefoglaló
        </p>
        <p className="mt-2 text-base leading-relaxed">{response.summary}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1")}
          onClick={() => setShowOriginal((v) => !v)}
          aria-expanded={showOriginal}
        >
          {showOriginal ? "Összefoglaló" : "Eredeti válasz"}
          <ChevronDown
            className={cn("size-4 transition-transform", showOriginal && "rotate-180")}
          />
        </button>
        {response.sourceUrl && (
          <a
            href={response.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Eredeti válasz megnyitása
          </a>
        )}
      </div>

      {showOriginal && (
        <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-border bg-muted/50 p-4 font-sans text-sm leading-relaxed">
          {response.originalText}
        </pre>
      )}
    </section>
  );
}
