import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
  className?: string;
}

export function ArticleCard({ article, featured = false, className }: ArticleCardProps) {
  return (
    <article
      className={cn(
        "group flex overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-shadow hover:shadow-md",
        featured ? "flex-col md:flex-row" : "flex-col",
        className,
      )}
    >
      {article.imageUrl && (
        <Link
          href={`/cikk/${article.slug}`}
          className={cn(
            "relative overflow-hidden bg-muted",
            featured ? "aspect-[16/10] md:w-1/2 md:aspect-auto md:min-h-[280px]" : "aspect-[16/10]",
          )}
        >
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes={featured ? "(max-width:768px) 100vw, 50vw" : "(max-width:768px) 100vw, 33vw"}
          />
        </Link>
      )}
      <div className={cn("flex flex-1 flex-col gap-2 p-4 md:p-5", featured && "md:justify-center")}>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {article.category}
        </p>
        <Link href={`/cikk/${article.slug}`} className="focus-ring rounded-md">
          <h3
            className={cn(
              "font-semibold leading-snug group-hover:text-primary",
              featured ? "text-2xl md:text-3xl" : "text-lg",
            )}
          >
            {article.title}
          </h3>
        </Link>
        <p className={cn("text-muted-foreground", featured ? "text-base" : "line-clamp-2 text-sm")}>
          {article.lead}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-3 pt-2 text-sm text-muted-foreground">
          <time dateTime={article.date}>{formatDate(article.date)}</time>
          {article.relatedIssueCount != null && (
            <span>{article.relatedIssueCount} kapcsolódó ügy</span>
          )}
          {article.relatedSupporters != null && (
            <span className="font-medium text-foreground">
              {article.relatedSupporters.toLocaleString("hu-HU")} embert érint
            </span>
          )}
        </div>
        <Link
          href={`/cikk/${article.slug}`}
          className="mt-2 text-sm font-semibold text-primary hover:underline"
        >
          Elolvasom
        </Link>
      </div>
    </article>
  );
}
