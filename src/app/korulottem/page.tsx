import Link from "next/link";
import { getNearbyIssues } from "@/lib/mock-data";
import { IssueCard } from "@/components/issues/issue-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/translate";

export async function generateMetadata() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  return { title: t.nearby.pageTitle };
}

export default async function NearbyPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const nearby = getNearbyIssues();
  return (
    <div className="container-page py-8">
      <h1 className="text-3xl font-bold">{t.nearby.pageTitle}</h1>
      <p className="mt-2 text-muted-foreground">{t.nearby.pageSubtitle}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {nearby.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>
      {nearby.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed p-8 text-center">
          <p className="font-semibold">{t.nearby.emptyTitle}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t.nearby.emptySubtitle}
          </p>
          <Link href="/uj-ugy" className={cn(buttonVariants(), "mt-4")}>
            + {t.nav.newIssue}
          </Link>
        </div>
      )}
    </div>
  );
}
