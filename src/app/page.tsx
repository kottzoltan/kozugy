import {
  articles,
  getNearbyIssues,
  getRecentResponses,
  getResolvedIssues,
  getTrendingIssues,
} from "@/lib/mock-data";
import { listIssues } from "@/lib/data/issues";
import { formatNumber } from "@/lib/format";
import { IssueMap } from "@/components/map/issue-map";
import { IssueCard } from "@/components/issues/issue-card";
import { ArticleCard } from "@/components/articles/article-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NearbySection } from "@/components/home/nearby-section";
import Link from "next/link";
import { Plus, Map } from "lucide-react";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary, interpolate } from "@/lib/i18n/translate";

export default async function HomePage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const allIssues = await listIssues();
  const trending = getTrendingIssues().map(
    (item) => allIssues.find((i) => i.slug === item.slug) ?? item,
  );
  const mapIssues = allIssues.filter((i) => i.status !== "megoldott").slice(0, 8);
  const resolved = getResolvedIssues().map(
    (item) => allIssues.find((i) => i.slug === item.slug) ?? item,
  );
  const nearby = getNearbyIssues().map(
    (item) => allIssues.find((i) => i.slug === item.slug) ?? item,
  );
  const responses = getRecentResponses().slice(0, 3);
  const featuredArticle = articles[0];
  const otherArticles = articles.slice(1, 4);

  return (
    <>
      <section className="container-page section-y">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
              {t.home.heroTitle}
            </h1>
            <p className="mt-4 max-w-lg text-lg text-muted-foreground">
              {t.home.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/uj-ugy"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-12 gap-2 px-6 text-base font-semibold",
                )}
              >
                <Plus className="size-5" />
                {t.home.reportCta}
              </Link>
              <Link
                href="/terkep"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-12 gap-2 px-6 text-base font-semibold",
                )}
              >
                <Map className="size-5" />
                {t.home.openMap}
              </Link>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">{t.home.tagline}</p>
          </div>
          <div className="animate-in fade-in zoom-in-95 duration-700 delay-100">
            <IssueMap
              issues={mapIssues}
              heightClass="h-[300px] sm:h-[380px] lg:h-[440px]"
            />
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-card/40 section-y">
        <div className="container-page">
          <h2 className="text-2xl font-bold md:text-3xl">{t.home.trendingTitle}</h2>
          <p className="mt-2 text-muted-foreground">{t.home.trendingSubtitle}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trending.map((issue) => (
              <IssueCard key={issue.id} issue={issue} showDelta />
            ))}
          </div>
        </div>
      </section>

      <NearbySection issues={nearby} />

      <section className="container-page section-y">
        <h2 className="text-2xl font-bold md:text-3xl">{t.home.responsesTitle}</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {responses.map(({ slug, response, issue }) => (
            <article
              key={slug}
              className="flex flex-col rounded-2xl border border-border/80 bg-card p-5 shadow-sm"
            >
              <p className="font-semibold">
                {interpolate(t.home.responded, { org: response.organizationName })}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {t.home.relatedIssue}{" "}
                <Link href={`/ugy/${slug}`} className="font-medium text-foreground hover:underline">
                  {issue.title}
                </Link>
              </p>
              <p className="mt-3 flex-1 text-sm leading-relaxed">{response.summary}</p>
              <Link
                href={`/ugy/${slug}#hivatalos-valasz`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4 self-start")}
              >
                {t.home.readResponse}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-border/60 bg-emerald-50/40 section-y">
        <div className="container-page">
          <h2 className="text-2xl font-bold md:text-3xl">{t.home.resolvedTitle}</h2>
          <p className="mt-2 text-muted-foreground">{t.home.resolvedSubtitle}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {resolved.map((issue) => (
              <article
                key={issue.id}
                className="rounded-2xl border border-emerald-200/80 bg-card p-5 shadow-sm"
              >
                <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">
                  ✅ {t.home.resolvedBadge}
                </p>
                <h3 className="mt-2 text-xl font-semibold">{issue.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {interpolate(t.common.peopleAffectedPast, {
                    count: formatNumber(issue.supporters, locale),
                  })}
                </p>
                <p className="mt-1 text-sm font-medium">
                  {interpolate(t.common.inDays, { days: 23 })}
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
      </section>

      <section className="container-page section-y">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold md:text-3xl">{t.home.storiesTitle}</h2>
          <Link href="/cikkek" className="text-sm font-semibold text-primary hover:underline">
            {t.home.allArticles}
          </Link>
        </div>
        <div className="mt-8 space-y-4">
          <ArticleCard article={featuredArticle} featured />
          <div className="grid gap-4 md:grid-cols-3">
            {otherArticles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">{t.brand}</p>
        <p className="mt-1">kozugy.info</p>
      </footer>
    </>
  );
}
