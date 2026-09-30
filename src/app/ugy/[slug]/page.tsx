import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  comments,
  getArticleBySlug,
  getOfficialsForIssue,
  getRelatedIssues,
  officialResponses,
  timelines,
} from "@/lib/mock-data";
import { getIssue } from "@/lib/data/issues";
import { listIssueOrganizations } from "@/lib/data/organizations";
import { formatDate, formatNumber } from "@/lib/format";
import { getCategoryLabel } from "@/lib/status";
import { StatusBadge } from "@/components/issues/status-badge";
import { SupportButton } from "@/components/issues/support-button";
import { ShareButton } from "@/components/issues/share-button";
import { EditSuggestionForm } from "@/components/issues/edit-suggestion-form";
import { ImageGallery } from "@/components/issues/image-gallery";
import { Timeline } from "@/components/issues/timeline";
import { OfficialResponseCard } from "@/components/issues/official-response-card";
import { IssueOrganizationsPanel } from "@/components/issues/issue-organizations-panel";
import { PublicOfficialCard } from "@/components/issues/public-official-card";
import { CommentList } from "@/components/issues/comment-list";
import { IssueCard } from "@/components/issues/issue-card";
import { IssueMap } from "@/components/map/issue-map";
import { ArticleCard } from "@/components/articles/article-card";
import { MapPin } from "lucide-react";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary, interpolate } from "@/lib/i18n/translate";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const { slug } = await params;
  const issue = await getIssue(slug);
  if (!issue) return { title: t.issue.notFound };
  const description = interpolate(t.issue.metaAffected, {
    settlement: issue.settlement,
    count: formatNumber(issue.supporters, locale),
  });
  return {
    title: issue.title,
    description,
    openGraph: {
      title: issue.title,
      description,
      siteName: t.brand,
    },
  };
}

export default async function IssuePage({ params }: PageProps) {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const { slug } = await params;
  const issue = await getIssue(slug);
  if (!issue) notFound();

  const orgLinks = await listIssueOrganizations(slug);
  const decisionMakers = getOfficialsForIssue(issue.officialIds);
  const timeline = timelines[slug] ?? [
    {
      id: "default",
      date: issue.createdAt,
      title: t.issue.created,
      icon: "created" as const,
    },
  ];
  const response = officialResponses[slug];
  const related = getRelatedIssues(slug);
  const article = issue.articleSlug
    ? getArticleBySlug(issue.articleSlug)
    : undefined;
  const categoryLabel = getCategoryLabel(issue.category, locale);

  return (
    <>
      <div className="container-page py-6 md:py-10">
        <nav className="text-sm text-muted-foreground" aria-label={t.issue.breadcrumb}>
          <Link href="/" className="hover:text-foreground">
            {t.brand}
          </Link>
          <span className="mx-1.5">›</span>
          <span>{issue.settlement}</span>
          <span className="mx-1.5">›</span>
          <span>{categoryLabel}</span>
        </nav>

        <div className="mt-6 grid gap-8 lg:grid-cols-[65%_35%] lg:gap-10">
          <div className="min-w-0 space-y-8">
            <header>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold uppercase tracking-wide">
                  {categoryLabel}
                </span>
                <StatusBadge status={issue.status} />
              </div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                {issue.title}
              </h1>
              <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-4" />
                  {issue.settlement}, {issue.address}
                </span>
                <time dateTime={issue.createdAt}>
                  {formatDate(issue.createdAt, locale)}
                </time>
              </p>
            </header>

            <div className="rounded-2xl border border-primary/20 bg-accent/40 p-5 md:p-6">
              <p className="text-2xl font-bold md:text-3xl">
                {interpolate(t.common.peopleAffected, {
                  count: formatNumber(issue.supporters, locale),
                })}
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <SupportButton
                  slug={issue.slug}
                  initialCount={issue.supporters}
                  size="lg"
                />
                <ShareButton title={issue.title} size="lg" />
                <EditSuggestionForm issue={issue} />
              </div>
              <button
                type="button"
                className="mt-3 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {t.issue.follow}
              </button>
            </div>

            <ImageGallery images={issue.images} alt={issue.title} />

            <section>
              <h2 className="text-xl font-semibold">{t.issue.problem}</h2>
              {issue.summary && (
                <div className="mt-3 rounded-xl bg-muted/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t.issue.briefly}
                  </p>
                  <p className="mt-1 leading-relaxed">{issue.summary}</p>
                </div>
              )}
              <p className="mt-4 leading-relaxed text-foreground/90">{issue.problem}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">{t.issue.request}</h2>
              <div className="mt-3 rounded-xl border-l-4 border-primary bg-card p-4 shadow-sm">
                <p className="text-lg font-medium leading-relaxed">{issue.request}</p>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">{t.issue.where}</h2>
              <IssueMap
                issues={[issue]}
                interactive={false}
                mini
                heightClass="h-48"
                centerLabel={`${issue.settlement}, ${issue.address}`}
              />
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold">{t.issue.timeline}</h2>
              <Timeline events={timeline} />
            </section>

            {response && (
              <div id="hivatalos-valasz">
                <OfficialResponseCard response={response} />
              </div>
            )}

            <CommentList comments={comments} />

            {related.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold">{t.issue.similar}</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {related.map((r) => (
                    <IssueCard key={r.id} issue={r} showSupport={false} compact />
                  ))}
                </div>
              </section>
            )}

            {article && (
              <section>
                <h2 className="mb-4 text-xl font-semibold">{t.issue.wroteAbout}</h2>
                <ArticleCard article={article} />
              </section>
            )}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <IssueOrganizationsPanel links={orgLinks} />
            {decisionMakers.length > 0 && (
              <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {t.issue.decisionMakers}
                </h2>
                <div className="mt-3 space-y-3">
                  {decisionMakers.map((o) => (
                    <PublicOfficialCard key={o.id} official={o} />
                  ))}
                </div>
              </div>
            )}
            <div className="hidden rounded-2xl border border-border/80 bg-card p-4 text-sm text-muted-foreground lg:block">
              <p className="font-semibold text-foreground">{t.issue.share}</p>
              <div className="mt-3">
                <ShareButton title={issue.title} className="w-full" />
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-background/95 p-3 backdrop-blur md:hidden">
        <div className="flex gap-2">
          <SupportButton
            slug={issue.slug}
            initialCount={issue.supporters}
            size="sticky"
          />
          <ShareButton title={issue.title} size="sticky" />
        </div>
      </div>
    </>
  );
}
