import { listIssues } from "@/lib/data/issues";
import { IssueCard } from "@/components/issues/issue-card";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/translate";

export async function generateMetadata() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  return { title: t.issues.title };
}

export default async function IssuesPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const all = await listIssues();
  const open = all.filter((i) => i.status !== "megoldott");
  return (
    <div className="container-page py-8 md:py-12">
      <h1 className="text-3xl font-bold">{t.issues.title}</h1>
      <p className="mt-2 text-muted-foreground">{t.issues.subtitle}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {open.map((issue) => (
          <IssueCard key={issue.id} issue={issue} showDelta />
        ))}
      </div>
    </div>
  );
}
