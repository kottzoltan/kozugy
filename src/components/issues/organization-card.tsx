"use client";

import Link from "next/link";
import type { Organization } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/i18n/locale-provider";

interface OrganizationCardProps {
  organization: Organization;
}

export function OrganizationCard({ organization }: OrganizationCardProps) {
  const { locale, t } = useLocale();

  return (
    <aside className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {t("issue.competent")}
      </h2>
      <p className="mt-2 text-lg font-semibold leading-snug">{organization.name}</p>
      <dl className="mt-4 space-y-2 text-sm">
        {organization.notifiedAt && (
          <div>
            <dt className="text-muted-foreground">✉️ {t("issue.notified")}</dt>
            <dd className="font-medium">
              {formatDate(organization.notifiedAt, locale)}
            </dd>
          </div>
        )}
        {organization.respondedAt && (
          <div>
            <dt className="text-muted-foreground">✅ {t("issue.replied")}</dt>
            <dd className="font-medium">
              {formatDate(organization.respondedAt, locale)}
            </dd>
          </div>
        )}
      </dl>
      <Link
        href={`/szervezet/${organization.slug}`}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4 w-full")}
      >
        {t("issue.orgPage")}
      </Link>
    </aside>
  );
}
