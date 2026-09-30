import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getOfficialsForIssue,
  officialResponses,
} from "@/lib/mock-data";
import { getIssue } from "@/lib/data/issues";
import { formatNumber } from "@/lib/format";
import { STATUS_LABEL } from "@/lib/status";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AdminIssueActions } from "@/components/admin/issue-actions";
import { AssignOrganizationsPanel } from "@/components/admin/assign-organizations";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminIssueDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const issue = await getIssue(slug);
  if (!issue) notFound();

  const officials = getOfficialsForIssue(issue.officialIds);
  const response = officialResponses[slug];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <Link href="/admin" className="text-sm font-medium text-teal-700 hover:underline">
          ← Admin
        </Link>
        <h1 className="mt-1 text-xl font-bold">{issue.title}</h1>
      </header>
      <div className="mx-auto grid max-w-6xl gap-6 p-4 lg:grid-cols-2 lg:p-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase text-slate-500">Előnézet</p>
          <h2 className="mt-2 text-2xl font-semibold">{issue.title}</h2>
          <p className="mt-2 text-sm text-slate-600">
            {issue.settlement} · {STATUS_LABEL[issue.status]} ·{" "}
            {formatNumber(issue.supporters)} támogató
          </p>
          <p className="mt-4 text-sm leading-relaxed">{issue.problem}</p>
          <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm font-medium">
            {issue.request}
          </p>
          {officials.length > 0 && (
            <p className="mt-2 text-sm">
              Döntéshozók: {officials.map((o) => o.name).join(", ")}
            </p>
          )}
          {response && (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 text-sm">
              <p className="font-semibold">Hivatalos válasz</p>
              <p className="mt-1">{response.summary}</p>
            </div>
          )}
          <Link
            href={`/ugy/${issue.slug}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4")}
            target="_blank"
          >
            Nyilvános oldal
          </Link>
        </div>
        <div className="space-y-4">
          <AssignOrganizationsPanel
            slug={issue.slug}
            category={issue.category}
            settlement={issue.settlement}
          />
          <AdminIssueActions />
        </div>
      </div>
    </div>
  );
}
