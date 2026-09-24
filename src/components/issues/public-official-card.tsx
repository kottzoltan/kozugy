import Link from "next/link";
import type { PublicOfficial } from "@/lib/types";
import { RELATION_LABEL } from "@/lib/status";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

interface PublicOfficialCardProps {
  official: PublicOfficial;
}

export function PublicOfficialCard({ official }: PublicOfficialCardProps) {
  const initials = official.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  return (
    <article className="flex gap-3 rounded-xl border border-border/80 bg-card p-3">
      <div
        className="flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground"
        aria-hidden
      >
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <Link
          href={`/szemely/${official.slug}`}
          className="font-semibold hover:text-primary focus-ring rounded"
        >
          {official.name}
        </Link>
        <p className="text-sm text-muted-foreground">{official.title}</p>
        {official.relation && (
          <p className="mt-1 text-xs font-medium text-primary">
            {RELATION_LABEL[official.relation]}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {official.facebookUrl && (
            <a
              href={official.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "ghost", size: "icon-xs" }))}
              aria-label={`${official.name} Facebook`}
            >
              <ExternalLink className="size-3.5" />
            </a>
          )}
          {!official.claimed && (
            <Link
              href={`/szemely/${official.slug}?claim=1`}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Ön az? Profil igénylése
            </Link>
          )}
          {official.verified && (
            <span className="text-xs text-emerald-700">Ellenőrzött</span>
          )}
        </div>
      </div>
    </article>
  );
}
