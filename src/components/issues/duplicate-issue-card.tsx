import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Issue } from "@/lib/types";
import { formatDistance, formatNumber } from "@/lib/format";
import { StatusBadge } from "@/components/issues/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DuplicateIssueCardProps {
  issue: Issue;
  onSupport?: () => void;
}

export function DuplicateIssueCard({ issue, onSupport }: DuplicateIssueCardProps) {
  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <h3 className="text-lg font-semibold">{issue.title}</h3>
      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
        <MapPin className="size-3.5" />
        {issue.settlement}
        {issue.distanceMeters != null && (
          <span>· {formatDistance(issue.distanceMeters)}</span>
        )}
      </p>
      <p className="mt-2 text-sm font-medium">
        {formatNumber(issue.supporters)} embert érint
      </p>
      <div className="mt-2">
        <StatusBadge status={issue.status} />
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={onSupport}
          className={cn(buttonVariants(), "h-11 w-full font-bold")}
        >
          ENGEM IS ÉRINT
        </button>
        <Link
          href={`/ugy/${issue.slug}`}
          className={cn(buttonVariants({ variant: "outline" }), "h-10 w-full")}
        >
          Ügy megnyitása
        </Link>
      </div>
    </article>
  );
}
