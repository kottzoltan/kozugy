import { articles } from "@/lib/mock-data";
import { ArticleCard } from "@/components/articles/article-card";

export const metadata = {
  title: "Cikkek",
};

export default function ArticlesPage() {
  return (
    <div className="container-page py-8 md:py-12">
      <h1 className="text-3xl font-bold tracking-tight">KÖZÜGY történetek</h1>
      <p className="mt-2 text-muted-foreground">
        Közérthető beszámolók ügyekről, válaszokról és megoldásokról.
      </p>
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
