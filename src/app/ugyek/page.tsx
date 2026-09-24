import { issues } from "@/lib/mock-data";
import { IssueCard } from "@/components/issues/issue-card";

export const metadata = { title: "Ügyek" };

export default function IssuesPage() {
  const open = issues.filter((i) => i.status !== "megoldott");
  return (
    <div className="container-page py-8 md:py-12">
      <h1 className="text-3xl font-bold">Ügyek</h1>
      <p className="mt-2 text-muted-foreground">Aktív közösségi ügyek.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {open.map((issue) => (
          <IssueCard key={issue.id} issue={issue} showDelta />
        ))}
      </div>
    </div>
  );
}
