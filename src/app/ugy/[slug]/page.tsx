import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  comments,
  getArticleBySlug,
  getIssueBySlug,
  getOfficialsForIssue,
  getOrganization,
  getRelatedIssues,
  officialResponses,
  timelines,
} from "@/lib/mock-data";
import { formatDate, formatNumber } from "@/lib/format";
import { CATEGORY_LABEL } from "@/lib/status";
import { StatusBadge } from "@/components/issues/status-badge";
import { SupportButton } from "@/components/issues/support-button";
import { ShareButton } from "@/components/issues/share-button";
import { ImageGallery } from "@/components/issues/image-gallery";
import { Timeline } from "@/components/issues/timeline";
import { OfficialResponseCard } from "@/components/issues/official-response-card";
import { OrganizationCard } from "@/components/issues/organization-card";
import { PublicOfficialCard } from "@/components/issues/public-official-card";
import { CommentList } from "@/components/issues/comment-list";
import { IssueCard } from "@/components/issues/issue-card";
import { IssueMap } from "@/components/map/issue-map";
import { ArticleCard } from "@/components/articles/article-card";
import { MapPin } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const issue = getIssueBySlug(slug);
  if (!issue) return { title: "Ügy nem található" };
  return {
    title: issue.title,
    description: `${issue.settlement} · ${formatNumber(issue.supporters)} embert érint`,
    openGraph: {
      title: issue.title,
      description: `${issue.settlement} · ${formatNumber(issue.supporters)} embert érint`,
      siteName: "KÖZÜGY",
    },
  };
}

export default async function IssuePage({ params }: PageProps) {
  const { slug } = await params;
  const issue = getIssueBySlug(slug);
  if (!issue) notFound();

  const org = getOrganization(issue.organizationId);
  const decisionMakers = getOfficialsForIssue(issue.officialIds);
  const timeline = timelines[slug] ?? [
    {
      id: "default",
      date: issue.createdAt,
      title: "Ügy létrejött",
      icon: "created" as const,
    },
  ];
  const response = officialResponses[slug];
  const related = getRelatedIssues(slug);
  const article = issue.articleSlug
    ? getArticleBySlug(issue.articleSlug)
    : undefined;

  return (
    <>
      <div className="container-page py-6 md:py-10">
        <nav className="text-sm text-muted-foreground" aria-label="Morzsamenü">
          <Link href="/" className="hover:text-foreground">
            KÖZÜGY
          </Link>
          <span className="mx-1.5">›</span>
          <span>{issue.settlement}</span>
          <span className="mx-1.5">›</span>
          <span>{CATEGORY_LABEL[issue.category]}</span>
        </nav>

        <div className="mt-6 grid gap-8 lg:grid-cols-[65%_35%] lg:gap-10">
          <div className="min-w-0 space-y-8">
            <header>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold uppercase tracking-wide">
                  {CATEGORY_LABEL[issue.category]}
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
                <time dateTime={issue.createdAt}>{formatDate(issue.createdAt)}</time>
              </p>
            </header>

            {/* Main CTA */}
            <div className="rounded-2xl border border-primary/20 bg-accent/40 p-5 md:p-6">
              <p className="text-2xl font-bold md:text-3xl">
                {formatNumber(issue.supporters)} embert érint
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <SupportButton initialCount={issue.supporters} size="lg" />
                <ShareButton title={issue.title} size="lg" />
              </div>
              <button
                type="button"
                className="mt-3 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Követem
              </button>
            </div>

            <ImageGallery images={issue.images} alt={issue.title} />

            <section>
              <h2 className="text-xl font-semibold">Mi a probléma?</h2>
              {issue.summary && (
                <div className="mt-3 rounded-xl bg-muted/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Röviden
                  </p>
                  <p className="mt-1 leading-relaxed">{issue.summary}</p>
                </div>
              )}
              <p className="mt-4 leading-relaxed text-foreground/90">{issue.problem}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">Mit szeretnének az érintettek?</h2>
              <div className="mt-3 rounded-xl border-l-4 border-primary bg-card p-4 shadow-sm">
                <p className="text-lg font-medium leading-relaxed">{issue.request}</p>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">Hol van?</h2>
              <IssueMap
                issues={[issue]}
                interactive={false}
                mini
                heightClass="h-48"
                centerLabel={`${issue.settlement}, ${issue.address}`}
              />
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold">Mi történt eddig?</h2>
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
                <h2 className="text-xl font-semibold">Hasonló ügyek a közelben</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {related.map((r) => (
                    <IssueCard key={r.id} issue={r} showSupport={false} compact />
                  ))}
                </div>
              </section>
            )}

            {article && (
              <section>
                <h2 className="mb-4 text-xl font-semibold">Írtunk róla</h2>
                <ArticleCard article={article} />
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            {org && <OrganizationCard organization={org} />}
            {decisionMakers.length > 0 && (
              <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Kapcsolódó döntéshozók
                </h2>
                <div className="mt-3 space-y-3">
                  {decisionMakers.map((o) => (
                    <PublicOfficialCard key={o.id} official={o} />
                  ))}
                </div>
              </div>
            )}
            <div className="hidden rounded-2xl border border-border/80 bg-card p-4 text-sm text-muted-foreground lg:block">
              <p className="font-semibold text-foreground">Megosztás</p>
              <div className="mt-3">
                <ShareButton title={issue.title} className="w-full" />
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-background/95 p-3 backdrop-blur md:hidden">
        <div className="flex gap-2">
          <SupportButton initialCount={issue.supporters} size="sticky" />
          <ShareButton title={issue.title} size="sticky" />
        </div>
      </div>
    </>
  );
}
