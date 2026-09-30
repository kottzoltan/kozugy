import Link from "next/link";
import { ModerationSuggestionsPanel } from "@/components/admin/moderation-suggestions";

export const metadata = { title: "Moderáció" };

export default function AdminModerationPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <Link href="/admin" className="text-sm font-medium text-teal-700 hover:underline">
          ← Admin
        </Link>
        <h1 className="mt-1 text-xl font-bold">Moderáció · Szerkesztési javaslatok</h1>
        <p className="mt-1 text-sm text-slate-500">
          Wiki-szerű diff: a javaslatok csak jóváhagyás után jelennek meg az ügyön.
        </p>
      </header>
      <div className="mx-auto max-w-3xl p-4 sm:p-6">
        <ModerationSuggestionsPanel />
      </div>
    </div>
  );
}
