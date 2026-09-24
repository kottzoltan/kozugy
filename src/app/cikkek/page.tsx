import { articles } from "@/lib/mock-data";
import { ArticleCard } from "@/components/articles/article-card";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/translate";

export async function generateMetadata() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  return { title: t.articles.title };
}

export default async function ArticlesPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  return (
    <div className="container-page py-8 md:py-12">
      <h1 className="text-3xl font-bold tracking-tight">{t.articles.title}</h1>
      <p className="mt-2 text-muted-foreground">{t.articles.subtitle}</p>
      <div className="mt-8 space-y-4">
        <ArticleCard article={articles[0]} featured />
        <div className="grid gap-4 md:grid-cols-3">
          {articles.slice(1).map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      </div>
    </div>
  );
}
