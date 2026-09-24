import Link from "next/link";
import type { Organization } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OrganizationCardProps {
  organization: Organization;
}

export function OrganizationCard({ organization }: OrganizationCardProps) {
  return (
    <aside className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Illetékes
      </h2>
      <p className="mt-2 text-lg font-semibold leading-snug">{organization.name}</p>
      <dl className="mt-4 space-y-2 text-sm">
        {organization.notifiedAt && (
          <div>
            <dt className="text-muted-foreground">✉️ Értesítve</dt>
            <dd className="font-medium">{formatDate(organization.notifiedAt)}</dd>
          </div>
        )}
        {organization.respondedAt && (
          <div>
            <dt className="text-muted-foreground">✅ Válaszolt</dt>
            <dd className="font-medium">{formatDate(organization.respondedAt)}</dd>
          </div>
        )}
      </dl>
      <Link
        href={`/szervezet/${organization.slug}`}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4 w-full")}
      >
        Szervezet adatlapja
      </Link>
    </aside>
  );
}
