import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { articles, getArticleBySlug, getIssueBySlug } from "@/lib/mock-data";
import { formatDate, formatNumber } from "@/lib/format";
import { SupportButton } from "@/components/issues/support-button";
import { ShareButton } from "@/components/issues/share-button";
import { ArticleCard } from "@/components/articles/article-card";
import { IssueCard } from "@/components/issues/issue-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary, interpolate } from "@/lib/i18n/translate";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: t.articles.notFound };
  return {
    title: article.title,
    description: article.lead,
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const relatedIssue = article.relatedIssueSlug
    ? getIssueBySlug(article.relatedIssueSlug)
    : undefined;
  const similar = articles.filter((a) => a.slug !== slug).slice(0, 3);

  return (
    <article className="relative">
      <aside className="fixed left-4 top-1/3 z-20 hidden flex-col gap-2 xl:flex">
        <ShareButton
          title={article.title}
          size="icon"
          variant="outline"
          label={t.share.title}
        />
      </aside>

      <div className="container-page max-w-3xl py-8 md:py-12">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {article.category}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl md:leading-[1.1]">
          {article.title}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground md:text-xl">{article.lead}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <time dateTime={article.date}>{formatDate(article.date, locale)}</time>
          <span>·</span>
          <span>{article.author}</span>
          {article.relatedSupporters != null && (
            <>
              <span>·</span>
              <span className="rounded-full bg-accent px-2.5 py-0.5 font-medium text-accent-foreground">
                {interpolate(t.common.peopleAffected, {
                  count: formatNumber(article.relatedSupporters, locale),
                })}
              </span>
            </>
          )}
        </div>

        {article.imageUrl && (
          <figure className="mt-8">
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                className="object-cover"
                sizes="(max-width:768px) 100vw, 768px"
                priority
              />
            </div>
            <figcaption className="mt-2 text-sm text-muted-foreground">
              {t.articles.photoCaption}
            </figcaption>
          </figure>
        )}

        <div className="prose-kozugy mt-10 space-y-8 text-base leading-relaxed md:text-lg">
          <section>
            <h2 className="text-2xl font-semibold">{t.articles.happened}</h2>
            <p className="mt-3 text-foreground/90">{article.body.happened}</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold">{t.articles.request}</h2>
            <p className="mt-3 text-foreground/90">{article.body.request}</p>
          </section>

          {relatedIssue && (
            <aside className="rounded-2xl border border-primary/25 bg-accent/50 p-5 md:p-6">
              <h2 className="text-xl font-bold">{t.articles.affectedCta}</h2>
              <p className="mt-2 text-muted-foreground">
                {interpolate(t.articles.alreadySignaled, {
                  count: formatNumber(relatedIssue.supporters, locale),
                })}
              </p>
              <div className="mt-4 space-y-2">
                <SupportButton
                  slug={relatedIssue.slug}
                  initialCount={relatedIssue.supporters}
                  size="lg"
                />
                <Link
                  href={`/ugy/${relatedIssue.slug}`}
                  className={cn(buttonVariants({ variant: "outline" }), "h-10 w-full")}
                >
                  {t.articles.viewOriginal}
                </Link>
              </div>
            </aside>
          )}

          <section>
            <h2 className="text-2xl font-semibold">{t.articles.response}</h2>
            <p className="mt-3 text-foreground/90">{article.body.response}</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold">{t.articles.timeline}</h2>
            <p className="mt-3 text-foreground/90">{article.body.timeline}</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold">{t.articles.next}</h2>
            <p className="mt-3 text-foreground/90">{article.body.next}</p>
          </section>
        </div>

        {relatedIssue && (
          <section className="mt-12 border-t border-border pt-10">
            <h2 className="text-xl font-semibold">{t.articles.relatedIssue}</h2>
            <div className="mt-4">
              <IssueCard issue={relatedIssue} />
            </div>
          </section>
        )}

        <section className="mt-12 border-t border-border pt-10">
          <h2 className="text-xl font-semibold">{t.articles.similar}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {similar.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-16 z-30 flex justify-center gap-2 border-t border-border bg-background/95 p-2 backdrop-blur md:hidden">
        <ShareButton
          title={article.title}
          className="flex-1"
          label={t.share.title}
        />
      </div>
    </article>
  );
}
