"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  IssueOrganizationLink,
  Organization,
  OrgLinkStatus,
  OrgRelationRole,
} from "@/lib/types";
import {
  ORG_LINK_STATUS_LABEL,
  ORG_ROLE_LABEL,
  ORG_TYPE_LABEL,
} from "@/lib/org-labels";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-provider";
import { Plus, Trash2 } from "lucide-react";

interface AssignOrganizationsPanelProps {
  slug: string;
  category: string;
  settlement: string;
}

export function AssignOrganizationsPanel({
  slug,
  category,
  settlement,
}: AssignOrganizationsPanelProps) {
  const { user } = useAuth();
  const [links, setLinks] = useState<IssueOrganizationLink[]>([]);
  const [catalog, setCatalog] = useState<Organization[]>([]);
  const [suggestions, setSuggestions] = useState<Organization[]>([]);
  const [orgId, setOrgId] = useState("");
  const [role, setRole] = useState<OrgRelationRole>("illetekes");
  const [linkStatus, setLinkStatus] = useState<OrgLinkStatus>("hozzarendelve");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const headers = useCallback((): HeadersInit => {
    const h: HeadersInit = { "Content-Type": "application/json" };
    if (user?.isDev) {
      h["x-kozugy-dev-user"] = JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        roles: ["admin"],
      });
    }
    return h;
  }, [user]);

  const reload = useCallback(async () => {
    const [linksRes, allRes, sugRes] = await Promise.all([
      fetch(`/api/issues/${slug}/organizations`),
      fetch("/api/organizations"),
      fetch(
        `/api/organizations?suggest=1&category=${encodeURIComponent(category)}&settlement=${encodeURIComponent(settlement)}`,
      ),
    ]);
    if (linksRes.ok) {
      const data = (await linksRes.json()) as { links: IssueOrganizationLink[] };
      setLinks(data.links);
    }
    if (allRes.ok) {
      const data = (await allRes.json()) as { organizations: Organization[] };
      setCatalog(data.organizations);
    }
    if (sugRes.ok) {
      const data = (await sugRes.json()) as { organizations: Organization[] };
      setSuggestions(data.organizations);
    }
  }, [slug, category, settlement]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await reload();
      } catch {
        if (!cancelled) setError("Nem sikerült betölteni a szervezeteket.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reload]);

  async function assign(organizationId: string, r = role, s = linkStatus) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/issues/${slug}/organizations`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ organizationId, role: r, linkStatus: s }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Hozzárendelés sikertelen.");
        return;
      }
      await reload();
      setOrgId("");
    } finally {
      setBusy(false);
    }
  }

  async function remove(organizationId: string) {
    setBusy(true);
    try {
      await fetch(
        `/api/issues/${slug}/organizations?organizationId=${encodeURIComponent(organizationId)}`,
        { method: "DELETE", headers: headers() },
      );
      await reload();
    } finally {
      setBusy(false);
    }
  }

  async function patchStatus(organizationId: string, next: OrgLinkStatus) {
    setBusy(true);
    try {
      await fetch(`/api/issues/${slug}/organizations`, {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify({ organizationId, linkStatus: next }),
      });
      await reload();
    } finally {
      setBusy(false);
    }
  }

  const linkedIds = new Set(links.map((l) => l.organization.id));
  const available = catalog.filter((o) => !linkedIds.has(o.id));
  const suggestedAvailable = suggestions.filter((o) => !linkedIds.has(o.id));

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold">Illetékes szervezetek</h2>
      <p className="text-sm text-slate-500">
        Önkormányzat, kormányhivatal, közmű – több is hozzárendelhető.
      </p>

      {links.length > 0 ? (
        <ul className="space-y-2">
          {links.map((link) => (
            <li
              key={link.organization.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium">{link.organization.name}</p>
                <p className="text-xs text-slate-500">
                  {ORG_ROLE_LABEL[link.role]}
                  {link.organization.orgType
                    ? ` · ${ORG_TYPE_LABEL[link.organization.orgType]}`
                    : ""}{" "}
                  · {ORG_LINK_STATUS_LABEL[link.linkStatus]}
                </p>
              </div>
              <div className="flex flex-wrap gap-1">
                {(
                  [
                    "ertesitve",
                    "valaszolt",
                    "folyamatban",
                    "lezarva",
                  ] as OrgLinkStatus[]
                ).map((st) => (
                  <button
                    key={st}
                    type="button"
                    disabled={busy || link.linkStatus === st}
                    onClick={() => void patchStatus(link.organization.id, st)}
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "xs" }),
                      "text-[10px]",
                    )}
                  >
                    {ORG_LINK_STATUS_LABEL[st]}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void remove(link.organization.id)}
                  className={cn(buttonVariants({ variant: "ghost", size: "icon-xs" }))}
                  aria-label="Eltávolítás"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">Még nincs hozzárendelt szervezet.</p>
      )}

      {suggestedAvailable.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Javasolt (kategória / település)
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedAvailable.map((o) => (
              <button
                key={o.id}
                type="button"
                disabled={busy}
                onClick={() =>
                  void assign(
                    o.id,
                    o.orgType === "kozmu" ? "kozmu" : "illetekes",
                  )
                }
                className={cn(
                  buttonVariants({ variant: "secondary", size: "sm" }),
                  "gap-1",
                )}
              >
                <Plus className="size-3.5" />
                {o.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2 border-t border-slate-100 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Hozzáadás katalógusból
        </p>
        <select
          className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm"
          value={orgId}
          onChange={(e) => setOrgId(e.target.value)}
        >
          <option value="">Válassz szervezetet…</option>
          {available.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
              {o.orgType ? ` (${ORG_TYPE_LABEL[o.orgType]})` : ""}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-2">
          <select
            className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm"
            value={role}
            onChange={(e) => setRole(e.target.value as OrgRelationRole)}
          >
            {(Object.keys(ORG_ROLE_LABEL) as OrgRelationRole[]).map((r) => (
              <option key={r} value={r}>
                {ORG_ROLE_LABEL[r]}
              </option>
            ))}
          </select>
          <select
            className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm"
            value={linkStatus}
            onChange={(e) => setLinkStatus(e.target.value as OrgLinkStatus)}
          >
            {(Object.keys(ORG_LINK_STATUS_LABEL) as OrgLinkStatus[]).map((s) => (
              <option key={s} value={s}>
                {ORG_LINK_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          disabled={busy || !orgId}
          onClick={() => void assign(orgId)}
          className={cn(buttonVariants(), "w-full gap-1")}
        >
          <Plus className="size-4" />
          Hozzárendelés
        </button>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
