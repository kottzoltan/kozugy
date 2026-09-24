import Link from "next/link";
import { notFound } from "next/navigation";
import { issues, organizations } from "@/lib/mock-data";
import { IssueCard } from "@/components/issues/issue-card";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function OrganizationPage({ params }: PageProps) {
  const { slug } = await params;
  const org = organizations.find((o) => o.slug === slug);
  if (!org) notFound();

  const related = issues.filter((i) => i.organizationId === org.id);
  const active = related.filter((i) => i.status !== "megoldott" && i.status !== "elutasitott");
  const answered = related.filter((i) => !!i);
  const resolved = related.filter((i) => i.status === "megoldott");

  return (
    <div className="container-page py-8 md:py-12">
      <h1 className="text-3xl font-bold">{org.name}</h1>
      <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
        {org.website && (
          <a href={org.website} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
            Weboldal
          </a>
        )}
        {org.contactEmail && <span>{org.contactEmail}</span>}
        {org.avgResponseDays != null && (
          <span>Átlagos válaszidő: {org.avgResponseDays} nap</span>
        )}
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Aktív ügyek</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {active.map((i) => (
            <IssueCard key={i.id} issue={i} showSupport={false} />
          ))}
          {active.length === 0 && (
            <p className="text-muted-foreground">Jelenleg nincs aktív ügy.</p>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Válaszolt ügyek</h2>
        <ul className="mt-3 space-y-2">
          {answered.map((i) => (
            <li key={i.id}>
              <Link href={`/ugy/${i.slug}`} className="font-medium hover:text-primary">
                {i.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {resolved.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Megoldott ügyek</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {resolved.map((i) => (
              <IssueCard key={i.id} issue={i} showSupport={false} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
