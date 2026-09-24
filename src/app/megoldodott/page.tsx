import Link from "next/link";
import { getResolvedIssues } from "@/lib/mock-data";
import { formatNumber } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = { title: "Megoldódott" };

export default function ResolvedPage() {
  const resolved = getResolvedIssues();
  return (
    <div className="container-page py-8 md:py-12">
      <h1 className="text-3xl font-bold">Megoldódott</h1>
      <p className="mt-2 text-muted-foreground">
        Sikeres ügyek – amikor a közösség hangja változást hozott.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {resolved.map((issue) => (
          <article
            key={issue.id}
            className="rounded-2xl border border-emerald-200 bg-card p-5 shadow-sm"
          >
            <p className="text-sm font-bold uppercase text-emerald-700">✅ Megoldódott</p>
            <h2 className="mt-2 text-xl font-semibold">{issue.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {formatNumber(issue.supporters)} embert érintett · {issue.settlement}
            </p>
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
  );
}
