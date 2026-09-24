import Link from "next/link";
import { notFound } from "next/navigation";
import { officials, issues } from "@/lib/mock-data";
import { RELATION_LABEL } from "@/lib/status";
import { IssueCard } from "@/components/issues/issue-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ claim?: string }>;
}

export default async function PersonPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { claim } = await searchParams;
  const person = officials.find((o) => o.slug === slug);
  if (!person) notFound();

  const related = issues.filter((i) => i.officialIds?.includes(person.id));

  return (
    <div className="container-page py-8 md:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex size-20 items-center justify-center rounded-full bg-secondary text-xl font-bold">
          {person.name
            .split(" ")
            .map((p) => p[0])
            .slice(0, 2)
            .join("")}
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold">{person.name}</h1>
            {person.verified && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                Ellenőrzött
              </span>
            )}
          </div>
          <p className="mt-1 text-muted-foreground">
            {person.title} · {person.area}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {person.facebookUrl && (
              <a
                href={person.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                Facebook
              </a>
            )}
            {!person.claimed && (
              <Link
                href={`/szemely/${person.slug}?claim=1`}
                className={cn(buttonVariants({ size: "sm" }))}
              >
                Profil igénylése
              </Link>
            )}
          </div>
        </div>
      </div>

      {claim === "1" && !person.claimed && (
        <div className="mt-6 rounded-2xl border border-primary/20 bg-accent/40 p-5">
          <h2 className="font-semibold">Ön az?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Jelentkezz be Facebook, Google vagy email fiókkal, majd küldj claim
            kérelmet. Az admin ellenőrzés után a profil ellenőrzötté válik.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Facebook", "Google", "Email"].map((p) => (
              <button
                key={p}
                type="button"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Kapcsolódó KÖZÜGYEK</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {related.map((issue) => (
            <div key={issue.id}>
              <IssueCard issue={issue} showSupport={false} />
              {person.relation && (
                <p className="mt-2 text-sm font-medium text-primary">
                  {RELATION_LABEL[person.relation]}
                </p>
              )}
            </div>
          ))}
          {related.length === 0 && (
            <p className="text-muted-foreground">Még nincs kapcsolódó ügy.</p>
          )}
        </div>
      </section>
    </div>
  );
}
