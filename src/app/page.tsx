import Link from "next/link";
import { Plus, Map } from "lucide-react";
import {
  articles,
  getNearbyIssues,
  getRecentResponses,
  getResolvedIssues,
  getTrendingIssues,
  issues,
} from "@/lib/mock-data";
import { formatNumber } from "@/lib/format";
import { IssueMap } from "@/components/map/issue-map";
import { IssueCard } from "@/components/issues/issue-card";
import { ArticleCard } from "@/components/articles/article-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NearbySection } from "@/components/home/nearby-section";

export default function HomePage() {
  const trending = getTrendingIssues();
  const resolved = getResolvedIssues();
  const nearby = getNearbyIssues();
  const responses = getRecentResponses().slice(0, 3);
  const featuredArticle = articles[0];
  const otherArticles = articles.slice(1, 4);

  return (
    <>
      {/* Hero */}
      <section className="container-page section-y">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
              Mi a gond a környékeden?
            </h1>
            <p className="mt-4 max-w-lg text-lg text-muted-foreground">
              Mutasd meg a térképen, és nézd meg, másokat is érint-e.
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
                Ügy bejelentése
              </Link>
              <Link
                href="/terkep"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-12 gap-2 px-6 text-base font-semibold",
                )}
              >
                <Map className="size-5" />
                Térkép megnyitása
              </Link>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Közösségi ügyek. Nyilvános válaszok. Követhető megoldások.
            </p>
          </div>
          <div className="animate-in fade-in zoom-in-95 duration-700 delay-100">
            <IssueMap
              issues={issues.filter((i) => i.status !== "megoldott").slice(0, 8)}
              heightClass="h-[300px] sm:h-[380px] lg:h-[440px]"
            />
          </div>
        </div>
      </section>

      {/* Most pörög */}
      <section className="border-t border-border/60 bg-card/40 section-y">
        <div className="container-page">
          <h2 className="text-2xl font-bold md:text-3xl">Most pörög</h2>
          <p className="mt-2 text-muted-foreground">
            A legtöbb új támogatást kapó ügyek az elmúlt 24 órában.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trending.map((issue) => (
              <IssueCard key={issue.id} issue={issue} showDelta />
            ))}
          </div>
        </div>
      </section>

      <NearbySection issues={nearby} />

      {/* Friss válaszok */}
      <section className="container-page section-y">
        <h2 className="text-2xl font-bold md:text-3xl">Friss válaszok</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {responses.map(({ slug, response, issue }) => (
            <article
              key={slug}
              className="flex flex-col rounded-2xl border border-border/80 bg-card p-5 shadow-sm"
            >
              <p className="font-semibold">{response.organizationName} válaszolt</p>
              <p className="mt-2 text-sm text-muted-foreground">
                kapcsolódó ügy:{" "}
                <Link href={`/ugy/${slug}`} className="font-medium text-foreground hover:underline">
                  {issue.title}
                </Link>
              </p>
              <p className="mt-3 flex-1 text-sm leading-relaxed">{response.summary}</p>
              <Link
                href={`/ugy/${slug}#hivatalos-valasz`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4 self-start")}
              >
                Válasz elolvasása
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Megoldódott */}
      <section className="border-t border-border/60 bg-emerald-50/40 section-y">
        <div className="container-page">
          <h2 className="text-2xl font-bold md:text-3xl">Megoldódott</h2>
          <p className="mt-2 text-muted-foreground">
            Amikor a közösség hangja változást hoz.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {resolved.map((issue) => (
              <article
                key={issue.id}
                className="rounded-2xl border border-emerald-200/80 bg-card p-5 shadow-sm"
              >
                <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">
                  ✅ Megoldódott
                </p>
                <h3 className="mt-2 text-xl font-semibold">{issue.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {formatNumber(issue.supporters)} embert érintett
                </p>
                <p className="mt-1 text-sm font-medium">23 nap alatt</p>
                <Link
                  href={`/ugy/${issue.slug}`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4")}
                >
                  Történet megtekintése
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Cikkek */}
      <section className="container-page section-y">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold md:text-3xl">KÖZÜGY történetek</h2>
          <Link href="/cikkek" className="text-sm font-semibold text-primary hover:underline">
            Összes cikk
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
        <p className="font-semibold text-foreground">KÖZÜGY</p>
        <p className="mt-1">kozosugyunk.hu</p>
      </footer>
    </>
  );
}
