"use client";

import { useState } from "react";
import type { Issue } from "@/lib/types";
import { categories } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-provider";
import { LoginModal } from "@/components/auth/login-modal";
import { useLocale } from "@/components/i18n/locale-provider";
import { Pencil } from "lucide-react";

interface EditSuggestionFormProps {
  issue: Issue;
}

export function EditSuggestionForm({ issue }: EditSuggestionFormProps) {
  const { t } = useLocale();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [title, setTitle] = useState(issue.title);
  const [summary, setSummary] = useState(issue.summary ?? "");
  const [problem, setProblem] = useState(issue.problem);
  const [requestText, setRequestText] = useState(issue.request);
  const [settlement, setSettlement] = useState(issue.settlement);
  const [address, setAddress] = useState(issue.address);
  const [category, setCategory] = useState(issue.category);
  const [rationale, setRationale] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function openForm() {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    setTitle(issue.title);
    setSummary(issue.summary ?? "");
    setProblem(issue.problem);
    setRequestText(issue.request);
    setSettlement(issue.settlement);
    setAddress(issue.address);
    setCategory(issue.category);
    setRationale("");
    setError(null);
    setDone(false);
    setOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      setLoginOpen(true);
      return;
    }
    setPending(true);
    setError(null);
    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (user.isDev) {
        headers["x-kozugy-dev-user"] = JSON.stringify({
          id: user.id,
          email: user.email,
          name: user.name,
          roles: ["admin"],
        });
      }
      const res = await fetch(`/api/issues/${issue.slug}/suggestions`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          title,
          summary,
          problem,
          request: requestText,
          settlement,
          address,
          category,
          rationale,
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) {
        setError(data?.error ?? t("edit.error"));
        return;
      }
      setDone(true);
    } catch {
      setError(t("edit.error"));
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openForm}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
      >
        <Pencil className="size-3.5" />
        {t("edit.suggestButton")}
      </button>

      <LoginModal
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onSuccess={() => {
          setLoginOpen(false);
          setOpen(true);
        }}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("edit.suggestTitle")}</DialogTitle>
            <DialogDescription>{t("edit.suggestDescription")}</DialogDescription>
          </DialogHeader>

          {done ? (
            <div className="space-y-3 py-2">
              <p className="text-sm text-emerald-700">{t("edit.submitted")}</p>
              <button
                type="button"
                className={cn(buttonVariants(), "w-full")}
                onClick={() => setOpen(false)}
              >
                {t("common.close")}
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="text-sm font-medium">{t("wizard.titleLabel")}</label>
                <Input
                  className="mt-1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t("edit.summaryLabel")}</label>
                <Textarea
                  className="mt-1"
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t("wizard.problemLabel")}</label>
                <Textarea
                  className="mt-1"
                  rows={4}
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t("wizard.requestLabel")}</label>
                <Textarea
                  className="mt-1"
                  rows={3}
                  value={requestText}
                  onChange={(e) => setRequestText(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium">{t("edit.settlementLabel")}</label>
                  <Input
                    className="mt-1"
                    value={settlement}
                    onChange={(e) => setSettlement(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{t("edit.addressLabel")}</label>
                  <Input
                    className="mt-1"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">{t("wizard.categoryTitle")}</label>
                <select
                  className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-2 text-sm"
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as Issue["category"])
                  }
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">{t("edit.rationaleLabel")}</label>
                <Textarea
                  className="mt-1"
                  rows={2}
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  placeholder={t("edit.rationalePlaceholder")}
                />
              </div>
              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={pending}
                className={cn(buttonVariants(), "h-11 w-full")}
              >
                {pending ? t("common.loading") : t("edit.submit")}
              </button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
