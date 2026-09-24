import Link from "next/link";
import { getNearbyIssues } from "@/lib/mock-data";
import { IssueCard } from "@/components/issues/issue-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = { title: "Körülöttem" };

export default function NearbyPage() {
  const nearby = getNearbyIssues();
  return (
    <div className="container-page py-8">
      <h1 className="text-3xl font-bold">Körülöttem</h1>
      <p className="mt-2 text-muted-foreground">Közeli ügyek a környékeden.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {nearby.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>
      {nearby.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed p-8 text-center">
          <p className="font-semibold">Még nincs ügy ezen a környéken.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Légy te az első, aki jelez valamit.
          </p>
          <Link href="/uj-ugy" className={cn(buttonVariants(), "mt-4")}>
            + Új ügy
          </Link>
        </div>
      )}
    </div>
  );
}
