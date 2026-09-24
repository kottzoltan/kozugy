"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Issue } from "@/lib/types";
import { formatNumber } from "@/lib/format";
import { STATUS_DOT, STATUS_EMOJI, STATUS_LABEL } from "@/lib/status";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface IssueMapProps {
  issues: Issue[];
  className?: string;
  heightClass?: string;
  interactive?: boolean;
  selectedSlug?: string;
  mini?: boolean;
  centerLabel?: string;
}

/** Visual map placeholder with clickable pins — ready to swap for MapLibre/Mapbox later. */
export function IssueMap({
  issues,
  className,
  heightClass = "h-[320px] md:h-full md:min-h-[420px]",
  interactive = true,
  selectedSlug,
  mini = false,
  centerLabel = "Budapest és környéke",
}: IssueMapProps) {
  const [active, setActive] = useState<string | null>(selectedSlug ?? null);
  const activeIssue = issues.find((i) => i.slug === active);

  // Deterministic pin positions from lat/lng for the mock canvas
  const pins = issues.map((issue) => {
    const x = ((issue.location.lng - 18.85) / 0.25) * 100;
    const y = (1 - (issue.location.lat - 47.35) / 0.3) * 100;
    return {
      issue,
      left: Math.min(92, Math.max(8, x)),
      top: Math.min(88, Math.max(12, y)),
    };
  });

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/80 bg-map",
        heightClass,
        className,
      )}
      role="img"
      aria-label={`Térkép: ${centerLabel}, ${issues.length} ügy`}
    >
      {/* Soft map grid / terrain feel */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage: `
            linear-gradient(oklch(0.88 0.03 200 / 0.5) 1px, transparent 1px),
            linear-gradient(90deg, oklch(0.88 0.03 200 / 0.5) 1px, transparent 1px),
            radial-gradient(ellipse at 30% 40%, oklch(0.9 0.04 160 / 0.45), transparent 50%),
            radial-gradient(ellipse at 70% 60%, oklch(0.91 0.03 230 / 0.4), transparent 45%)
          `,
          backgroundSize: "32px 32px, 32px 32px, 100% 100%, 100% 100%",
        }}
      />
      <div className="absolute left-3 top-3 z-10 rounded-lg bg-background/90 px-2.5 py-1.5 text-xs font-medium shadow-sm backdrop-blur">
        {centerLabel}
      </div>

      {pins.map(({ issue, left, top }) => (
        <MapIssueMarker
          key={issue.id}
          issue={issue}
          style={{ left: `${left}%`, top: `${top}%` }}
          active={active === issue.slug}
          onSelect={() => interactive && setActive(issue.slug)}
          compact={mini}
        />
      ))}

      {interactive && activeIssue && !mini && (
        <div className="absolute bottom-3 left-3 right-3 z-20 rounded-xl border border-border bg-card p-3 shadow-lg sm:left-auto sm:right-3 sm:w-72">
          <p className="font-semibold leading-snug">{activeIssue.title}</p>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5" />
            {activeIssue.settlement}
          </p>
          <p className="mt-1 text-sm font-medium">
            {formatNumber(activeIssue.supporters)} embert érint
          </p>
          <p className="mt-1 text-sm">
            {STATUS_EMOJI[activeIssue.status]} {STATUS_LABEL[activeIssue.status]}
          </p>
          <Link
            href={`/ugy/${activeIssue.slug}`}
            className={cn(buttonVariants({ size: "sm" }), "mt-3 w-full")}
          >
            Megnézem
          </Link>
        </div>
      )}

      {!interactive && (
        <div className="absolute inset-0 flex items-end justify-center p-3">
          <Link
            href="/terkep"
            className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "shadow-sm")}
          >
            Nagy térképen
          </Link>
        </div>
      )}
    </div>
  );
}

interface MapIssueMarkerProps {
  issue: Issue;
  style: React.CSSProperties;
  active?: boolean;
  onSelect?: () => void;
  compact?: boolean;
}

export function MapIssueMarker({
  issue,
  style,
  active,
  onSelect,
  compact,
}: MapIssueMarkerProps) {
  return (
    <button
      type="button"
      style={style}
      onClick={onSelect}
      className={cn(
        "absolute z-10 -translate-x-1/2 -translate-y-full rounded-full border-2 border-white shadow-md transition-transform focus-ring",
        STATUS_DOT[issue.status],
        active ? "scale-125 ring-2 ring-primary/40" : "hover:scale-110",
        compact ? "size-3" : "size-4",
      )}
      aria-label={`${issue.title}, ${STATUS_LABEL[issue.status]}`}
      title={issue.title}
    />
  );
}
