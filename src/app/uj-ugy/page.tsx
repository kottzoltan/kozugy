"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LocationPicker, type LocationValue } from "@/components/wizard/location-picker";
import { CategoryPicker } from "@/components/wizard/category-picker";
import { IssueAiAssist } from "@/components/wizard/issue-ai-assist";
import { DuplicateIssueCard } from "@/components/issues/duplicate-issue-card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CategoryId, Issue, IssueType } from "@/lib/types";
import { Camera, Lightbulb, AlertCircle } from "lucide-react";
import { useLocale } from "@/components/i18n/locale-provider";
import { useAuth } from "@/components/auth/auth-provider";
import { LoginModal } from "@/components/auth/login-modal";
import type { DuplicateMatchDto } from "@/lib/ai/issue-assist-types";

const TOTAL = 6;

function toIssue(d: DuplicateMatchDto): Issue & { score?: number; reason?: string } {
  return {
    id: d.id,
    slug: d.slug,
    title: d.title,
    settlement: d.settlement,
    address: d.address,
    category: d.category,
    type: d.type,
    status: d.status,
    supporters: d.supporters,
    problem: d.problem,
    request: d.request,
    location: d.location,
    images: d.images,
    createdAt: d.createdAt,
    distanceMeters: d.distanceMeters,
    score: d.score,
    reason: d.reason,
  };
}

export default function NewIssueWizardPage() {
  const router = useRouter();
  const { locale, t } = useLocale();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [location, setLocation] = useState<LocationValue>({
    address: "",
    settlement: "",
    pin: { x: 50, y: 50 },
    location: { lat: 47.4608, lng: 18.9583 },
  });
  const [type, setType] = useState<IssueType | null>(null);
  const [category, setCategory] = useState<CategoryId | undefined>();
  const [title, setTitle] = useState("");
  const [problem, setProblem] = useState("");
  const [request, setRequest] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [forceNew, setForceNew] = useState(false);
  const [published, setPublished] = useState(false);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicateMatchDto[]>([]);
  const [dupLoading, setDupLoading] = useState(false);
  const [dupChecked, setDupChecked] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);

  function next() {
    if (step === 5) {
      void loadDuplicates();
    }
    setStep((s) => Math.min(TOTAL, s + 1));
  }
  function back() {
    setStep((s) => Math.max(1, s - 1));
  }

  async function loadDuplicates() {
    setDupLoading(true);
    setDupChecked(false);
    try {
      const res = await fetch("/api/ai/issue-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          problem,
          request,
          category,
          type,
          settlement: location.settlement,
          address: location.address,
          location: location.location,
          lang: locale,
        }),
      });
      if (!res.ok) {
        setDuplicates([]);
        return;
      }
      const data = (await res.json()) as { duplicates?: DuplicateMatchDto[] };
      setDuplicates(data.duplicates ?? []);
    } catch {
      setDuplicates([]);
    } finally {
      setDupLoading(false);
      setDupChecked(true);
    }
  }

  async function publish() {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    if (!type || !category) return;
    setPublishing(true);
    setPublishError(null);
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
      const res = await fetch("/api/issues", {
        method: "POST",
        headers,
        body: JSON.stringify({
          title,
          problem,
          request,
          settlement: location.settlement,
          address: location.address || location.settlement,
          category,
          type,
          lat: location.location?.lat ?? 47.4608,
          lng: location.location?.lng ?? 18.9583,
          images,
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        issue?: { slug: string };
        error?: string;
      } | null;
      if (!res.ok || !data?.issue) {
        setPublishError(data?.error ?? t("wizard.publishError"));
        return;
      }
      setPublishedSlug(data.issue.slug);
      setPublished(true);
    } catch {
      setPublishError(t("wizard.publishError"));
    } finally {
      setPublishing(false);
    }
  }

  if (published && publishedSlug) {
    const shareUrl = `https://kozosugyunk.hu/ugy/${publishedSlug}`;
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-[800px] flex-col justify-center px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight">
          {t("wizard.publishedTitle")}
        </h1>
        <article className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            {t("wizard.previewLabel")}
          </p>
          <h2 className="mt-2 text-xl font-semibold">{title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {location.settlement || t("wizard.settlementFallback")}
          </p>
        </article>
        <div className="mt-8 flex flex-col gap-3">
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ size: "lg" }), "h-12 font-bold")}
          >
            {t("wizard.shareFacebook")}
          </a>
          <Link
            href={`/ugy/${publishedSlug}`}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12")}
          >
            {t("wizard.openIssue")}
          </Link>
        </div>
      </div>
    );
  }

  const showDuplicates =
    !forceNew && (dupLoading || (dupChecked && duplicates.length > 0));

  return (
    <div className="mx-auto min-h-[calc(100vh-4rem)] max-w-[800px] px-4 py-6 md:py-10">
      <div className="mb-6">
        <p className="text-sm font-medium text-muted-foreground">
          {t("wizard.stepOf", { step, total: TOTAL })}
        </p>
        <Progress value={(step / TOTAL) * 100} className="mt-2 h-1.5" />
      </div>

      {step === 1 && (
        <section className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">
            {t("wizard.locationTitle")}
          </h1>
          <LocationPicker value={location} onChange={setLocation} />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={next}
              className={cn(buttonVariants({ size: "lg" }), "h-11 px-8")}
            >
              {t("common.next")}
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">
            {t("wizard.typeTitle")}
          </h1>
          <div className="grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setType("problema")}
              className={cn(
                "rounded-2xl border p-6 text-left transition-colors focus-ring",
                type === "problema"
                  ? "border-primary bg-accent"
                  : "border-border bg-card hover:bg-muted/50",
              )}
            >
              <AlertCircle className="size-8 text-red-500" />
              <p className="mt-3 text-xl font-bold">{t("wizard.typeProblem")}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("wizard.typeProblemHint")}
              </p>
            </button>
            <button
              type="button"
              onClick={() => setType("javaslat")}
              className={cn(
                "rounded-2xl border p-6 text-left transition-colors focus-ring",
                type === "javaslat"
                  ? "border-primary bg-accent"
                  : "border-border bg-card hover:bg-muted/50",
              )}
            >
              <Lightbulb className="size-8 text-amber-500" />
              <p className="mt-3 text-xl font-bold">
                {t("wizard.typeSuggestion")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("wizard.typeSuggestionHint")}
              </p>
            </button>
          </div>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={back}
              className={cn(buttonVariants({ variant: "ghost" }))}
            >
              {t("common.back")}
            </button>
            <button
              type="button"
              onClick={next}
              disabled={!type}
              className={cn(buttonVariants({ size: "lg" }), "h-11 px-8")}
            >
              {t("common.next")}
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">
            {t("wizard.categoryTitle")}
          </h1>
          <CategoryPicker value={category} onChange={setCategory} />
          <div className="flex justify-between">
            <button
              type="button"
              onClick={back}
              className={cn(buttonVariants({ variant: "ghost" }))}
            >
              {t("common.back")}
            </button>
            <button
              type="button"
              onClick={next}
              disabled={!category}
              className={cn(buttonVariants({ size: "lg" }), "h-11 px-8")}
            >
              {t("common.next")}
            </button>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">
            {t("wizard.detailsTitle")}
          </h1>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="text-sm font-medium">
                {t("wizard.titleLabel")}
              </label>
              <Input
                id="title"
                className="mt-1.5 h-11"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("wizard.titlePlaceholder")}
              />
            </div>
            <div>
              <label htmlFor="problem" className="text-sm font-medium">
                {t("wizard.problemLabel")}
              </label>
              <Textarea
                id="problem"
                className="mt-1.5"
                rows={4}
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder={t("wizard.problemPlaceholder")}
              />
            </div>
            <div>
              <label htmlFor="request" className="text-sm font-medium">
                {t("wizard.requestLabel")}
              </label>
              <Textarea
                id="request"
                className="mt-1.5"
                rows={3}
                value={request}
                onChange={(e) => setRequest(e.target.value)}
                placeholder={t("wizard.requestPlaceholder")}
              />
            </div>
            <IssueAiAssist
              title={title}
              problem={problem}
              request={request}
              category={category}
              type={type}
              settlement={location.settlement}
              address={location.address}
              location={location.location}
              onAccept={(s) => {
                setTitle(s.title);
                setProblem(s.problem);
                setRequest(s.request);
                if (s.applyCategory) setCategory(s.applyCategory);
              }}
              onDuplicates={(res) => setDuplicates(res.duplicates)}
            />
          </div>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={back}
              className={cn(buttonVariants({ variant: "ghost" }))}
            >
              {t("common.back")}
            </button>
            <button
              type="button"
              onClick={next}
              disabled={!title.trim() || !problem.trim()}
              className={cn(buttonVariants({ size: "lg" }), "h-11 px-8")}
            >
              {t("common.next")}
            </button>
          </div>
        </section>
      )}

      {step === 5 && (
        <section className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">
            {t("wizard.imagesTitle")}
          </h1>
          <p className="text-muted-foreground">{t("wizard.imagesHint")}</p>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card p-10 hover:bg-muted/40">
            <Camera className="size-10 text-muted-foreground" />
            <span className="font-medium">{t("wizard.uploadImages")}</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              className="sr-only"
              onChange={() =>
                setImages([
                  "https://images.unsplash.com/photo-1544620341-1adc273c8312?w=400&q=80",
                ])
              }
            />
          </label>
          {images.length > 0 && (
            <p className="text-sm text-emerald-700">
              {t("wizard.imagesSelected", { count: images.length })}
            </p>
          )}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={back}
              className={cn(buttonVariants({ variant: "ghost" }))}
            >
              {t("common.back")}
            </button>
            <button
              type="button"
              onClick={next}
              className={cn(buttonVariants({ size: "lg" }), "h-11 px-8")}
            >
              {t("common.next")}
            </button>
          </div>
        </section>
      )}

      {step === 6 && (
        <section className="space-y-6">
          {showDuplicates ? (
            <>
              <h1 className="text-3xl font-bold tracking-tight">
                {t("wizard.duplicateTitle")}
              </h1>
              {dupLoading && (
                <p className="text-sm text-muted-foreground">
                  {t("duplicate.checking")}
                </p>
              )}
              <div className="space-y-4">
                {duplicates.map((d) => (
                  <DuplicateIssueCard
                    key={d.id}
                    issue={toIssue(d)}
                    onSupport={() => router.push(`/ugy/${d.slug}`)}
                  />
                ))}
              </div>
              {!dupLoading && duplicates.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {t("duplicate.noneFound")}
                </p>
              )}
              <button
                type="button"
                onClick={() => setForceNew(true)}
                className={cn(buttonVariants({ variant: "ghost" }), "w-full")}
              >
                {t("wizard.forceNew")}
              </button>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold tracking-tight">
                {t("wizard.previewTitle")}
              </h1>
              <article className="rounded-2xl border border-border bg-card p-5">
                <p className="text-xs uppercase text-muted-foreground">
                  {t("wizard.previewLabel")}
                </p>
                <h2 className="mt-2 text-xl font-semibold">{title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {location.settlement}
                </p>
                <p className="mt-3 text-sm leading-relaxed">{problem}</p>
                <p className="mt-3 text-sm font-medium">{request}</p>
              </article>
              {publishError && (
                <p className="text-sm text-destructive" role="alert">
                  {publishError}
                </p>
              )}
              {!user && (
                <p className="text-sm text-muted-foreground">
                  {t("wizard.loginToPublish")}
                </p>
              )}
              <button
                type="button"
                onClick={() => void publish()}
                disabled={publishing}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-12 w-full font-bold",
                )}
              >
                {publishing ? t("wizard.publishing") : t("wizard.publish")}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={back}
            className={cn(buttonVariants({ variant: "ghost" }))}
          >
            {t("common.back")}
          </button>
        </section>
      )}
      <LoginModal
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onSuccess={() => {
          setLoginOpen(false);
          void publish();
        }}
      />
    </div>
  );
}
