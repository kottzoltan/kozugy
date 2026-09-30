"use client";

import Link from "next/link";
import type { IssueOrganizationLink } from "@/lib/types";
import {
  ORG_LINK_STATUS_LABEL,
  ORG_ROLE_LABEL,
  ORG_TYPE_LABEL,
} from "@/lib/org-labels";
import { formatDate } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/i18n/locale-provider";

interface IssueOrganizationsPanelProps {
  links: IssueOrganizationLink[];
}

export function IssueOrganizationsPanel({ links }: IssueOrganizationsPanelProps) {
  const { locale, t } = useLocale();

  if (links.length === 0) return null;

  return (
    <aside className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {t("issue.competent")}
      </h2>
      <ul className="mt-3 space-y-3">
        {links.map((link) => (
          <li
            key={link.organization.id}
            className="rounded-xl border border-border/60 bg-background/60 p-3"
          >
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-secondary-foreground">
                {ORG_ROLE_LABEL[link.role]}
              </span>
              {link.organization.orgType && (
                <span className="text-[10px] font-medium text-muted-foreground">
                  {ORG_TYPE_LABEL[link.organization.orgType]}
                </span>
              )}
            </div>
            <p className="mt-1.5 font-semibold leading-snug">
              {link.organization.name}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {ORG_LINK_STATUS_LABEL[link.linkStatus]}
            </p>
            <dl className="mt-2 space-y-1 text-xs text-muted-foreground">
              {link.notifiedAt && (
                <div>
                  ✉️ {t("issue.notified")}:{" "}
                  <span className="font-medium text-foreground">
                    {formatDate(link.notifiedAt, locale)}
                  </span>
                </div>
              )}
              {link.respondedAt && (
                <div>
                  ✅ {t("issue.replied")}:{" "}
                  <span className="font-medium text-foreground">
                    {formatDate(link.respondedAt, locale)}
                  </span>
                </div>
              )}
            </dl>
            <Link
              href={`/szervezet/${link.organization.slug}`}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "mt-2 h-7 px-2 text-xs",
              )}
            >
              {t("issue.orgPage")}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
