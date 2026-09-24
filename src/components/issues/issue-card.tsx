import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import type { Issue } from "@/lib/types";
import { formatNumber } from "@/lib/format";
import { CATEGORY_LABEL } from "@/lib/status";
import { StatusBadge } from "@/components/issues/status-badge";
import { SupportButton } from "@/components/issues/support-button";
import { cn } from "@/lib/utils";

interface IssueCardProps {
  issue: Issue;
  showSupport?: boolean;
  showDelta?: boolean;
  compact?: boolean;
  className?: string;
}

export function IssueCard({
  issue,
  showSupport = true,
  showDelta = false,
  compact = false,
  className,
}: IssueCardProps) {
  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      {issue.images[0] && !compact && (
        <Link href={`/ugy/${issue.slug}`} className="relative aspect-[16/9] overflow-hidden bg-muted">
          <Image
            src={issue.images[0]}
            alt={issue.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width:768px) 100vw, 33vw"
          />
        </Link>
      )}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {CATEGORY_LABEL[issue.category]}
          </span>
          <StatusBadge status={issue.status} />
        </div>
        <Link href={`/ugy/${issue.slug}`} className="focus-ring rounded-md">
          <h3 className="text-lg font-semibold leading-snug text-foreground group-hover:text-primary">
            {issue.title}
          </h3>
        </Link>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          {issue.settlement}
          {issue.distanceMeters != null && (
            <span className="text-muted-foreground/80">
              · {issue.distanceMeters < 1000
                ? `${issue.distanceMeters} m`
                : `${(issue.distanceMeters / 1000).toFixed(1)} km`}
            </span>
          )}
        </p>
        <p className="text-sm font-medium">
          {formatNumber(issue.supporters)} embert érint
        </p>
        {showDelta && issue.supportersChange24h != null && (
          <p className="text-sm font-medium text-emerald-700">
            +{formatNumber(issue.supportersChange24h)} támogatás 24 óra alatt
          </p>
        )}
        {showSupport && (
          <div className="mt-auto pt-1">
            <SupportButton initialCount={issue.supporters} className="w-full" />
          </div>
        )}
      </div>
    </article>
  );
}
