import Link from "next/link";
import { adminKpis, issues, organizations } from "@/lib/mock-data";
import { formatNumber } from "@/lib/format";
import { STATUS_LABEL, CATEGORY_LABEL } from "@/lib/status";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/ugyek", label: "Ügyek" },
  { href: "/admin", label: "Moderáció" },
  { href: "/admin", label: "Cikkek" },
  { href: "/admin", label: "Szervezetek" },
  { href: "/admin", label: "Döntéshozók" },
  { href: "/admin", label: "Válaszok" },
  { href: "/admin", label: "Email" },
  { href: "/admin", label: "Routing" },
  { href: "/admin", label: "Felhasználók" },
  { href: "/admin", label: "Analytics" },
];

const kpis = [
  { label: "Új ügyek ma", value: adminKpis.newIssuesToday },
  { label: "Moderációra vár", value: adminKpis.pendingModeration },
  { label: "Megválaszolatlan ügyek", value: adminKpis.unanswered },
  { label: "Hivatalos válaszok ma", value: adminKpis.officialResponsesToday },
  { label: "Cikk draftok", value: adminKpis.articleDrafts },
  { label: "Megoldott ügyek", value: adminKpis.resolved },
];

export const metadata = { title: "Admin" };

export default function AdminPage() {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white p-4 lg:block">
        <Link href="/" className="text-lg font-bold text-teal-800">
          KÖZÜGY
        </Link>
        <p className="mt-0.5 text-xs text-slate-500">Admin</p>
        <nav className="mt-6 space-y-0.5" aria-label="Admin navigáció">
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex-1 overflow-auto">
        <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
          <h1 className="text-xl font-bold sm:text-2xl">Dashboard</h1>
        </header>

        <div className="space-y-8 p-4 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {kpis.map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <p className="text-xs font-medium text-slate-500">{kpi.label}</p>
                <p className="mt-2 text-2xl font-bold tabular-nums">{kpi.value}</p>
              </div>
            ))}
          </div>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Ügyek</h2>
              <Link href="/admin/ugyek" className="text-sm font-medium text-teal-700 hover:underline">
                Összes
              </Link>
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2.5 font-medium">ID</th>
                    <th className="px-3 py-2.5 font-medium">Cím</th>
                    <th className="px-3 py-2.5 font-medium">Hely</th>
                    <th className="px-3 py-2.5 font-medium">Kategória</th>
                    <th className="px-3 py-2.5 font-medium">Támogatók</th>
                    <th className="px-3 py-2.5 font-medium">Illetékes</th>
                    <th className="px-3 py-2.5 font-medium">Státusz</th>
                    <th className="px-3 py-2.5 font-medium">Műveletek</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.slice(0, 8).map((issue) => {
                    const org = organizations.find((o) => o.id === issue.organizationId);
                    return (
                      <tr key={issue.id} className="border-b border-slate-100 last:border-0">
                        <td className="px-3 py-2.5 font-mono text-xs text-slate-500">
                          {issue.id}
                        </td>
                        <td className="max-w-[200px] truncate px-3 py-2.5 font-medium">
                          {issue.title}
                        </td>
                        <td className="px-3 py-2.5">{issue.settlement}</td>
                        <td className="px-3 py-2.5">{CATEGORY_LABEL[issue.category]}</td>
                        <td className="px-3 py-2.5 tabular-nums">
                          {formatNumber(issue.supporters)}
                        </td>
                        <td className="max-w-[140px] truncate px-3 py-2.5 text-slate-600">
                          {org?.name ?? "—"}
                        </td>
                        <td className="px-3 py-2.5">{STATUS_LABEL[issue.status]}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex flex-wrap gap-1">
                            <Link
                              href={`/admin/ugyek/${issue.slug}`}
                              className={cn(buttonVariants({ variant: "outline", size: "xs" }))}
                            >
                              Megnyitás
                            </Link>
                            <button
                              type="button"
                              className={cn(buttonVariants({ variant: "ghost", size: "xs" }))}
                            >
                              Routing
                            </button>
                            <button
                              type="button"
                              className={cn(buttonVariants({ variant: "ghost", size: "xs" }))}
                            >
                              Email
                            </button>
                            <button
                              type="button"
                              className={cn(buttonVariants({ variant: "ghost", size: "xs" }))}
                            >
                              Cikk
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
