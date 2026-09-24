import Link from "next/link";
import { getResolvedIssues } from "@/lib/mock-data";
import { formatNumber } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary, interpolate } from "@/lib/i18n/translate";

export async function generateMetadata() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  return { title: t.resolved.title };
}

export default async function ResolvedPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const resolved = getResolvedIssues();
  return (
    <div className="container-page py-8 md:py-12">
      <h1 className="text-3xl font-bold">{t.resolved.title}</h1>
      <p className="mt-2 text-muted-foreground">{t.resolved.subtitle}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {resolved.map((issue) => (
          <article
            key={issue.id}
            className="rounded-2xl border border-emerald-200 bg-card p-5 shadow-sm"
          >
            <p className="text-sm font-bold uppercase text-emerald-700">
              ✅ {t.home.resolvedBadge}
            </p>
            <h2 className="mt-2 text-xl font-semibold">{issue.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {interpolate(t.common.peopleAffectedPast, {
                count: formatNumber(issue.supporters, locale),
              })}{" "}
              · {issue.settlement}
            </p>
            <Link
              href={`/ugy/${issue.slug}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4")}
            >
              {t.common.viewStory}
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
