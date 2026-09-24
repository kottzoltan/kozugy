"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LocationPicker } from "@/components/wizard/location-picker";
import { CategoryPicker } from "@/components/wizard/category-picker";
import { DuplicateIssueCard } from "@/components/issues/duplicate-issue-card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CategoryId, IssueType } from "@/lib/types";
import { getIssueBySlug } from "@/lib/mock-data";
import { Camera, Lightbulb, AlertCircle, Sparkles } from "lucide-react";

const TOTAL = 6;

export default function NewIssueWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [type, setType] = useState<IssueType | null>(null);
  const [category, setCategory] = useState<CategoryId | undefined>();
  const [title, setTitle] = useState("");
  const [problem, setProblem] = useState("");
  const [request, setRequest] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [forceNew, setForceNew] = useState(false);
  const [published, setPublished] = useState(false);

  const duplicate = getIssueBySlug("zebra-kell-az-iskola-ele");

  function next() {
    setStep((s) => Math.min(TOTAL, s + 1));
  }
  function back() {
    setStep((s) => Math.max(1, s - 1));
  }

  if (published) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-[800px] flex-col justify-center px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight">
          Köszönjük, az ügy megjelent!
        </h1>
        <article className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase text-muted-foreground">Előnézet</p>
          <h2 className="mt-2 text-xl font-semibold">
            {title || "Zebra kell az iskola elé"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">Budaörs</p>
        </article>
        <div className="mt-8 flex flex-col gap-3">
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent("https://kozosugyunk.hu/ugy/zebra-kell-az-iskola-ele")}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ size: "lg" }), "h-12 font-bold")}
          >
            Megosztom Facebookon
          </a>
          <Link
            href="/ugy/zebra-kell-az-iskola-ele"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12")}
          >
            Ügy megnyitása
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-[calc(100vh-4rem)] max-w-[800px] px-4 py-6 md:py-10">
      <div className="mb-6">
        <p className="text-sm font-medium text-muted-foreground">
          {step} / {TOTAL}
        </p>
        <Progress value={(step / TOTAL) * 100} className="mt-2 h-1.5" />
      </div>

      {step === 1 && (
        <section className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">Hol van a probléma?</h1>
          <LocationPicker />
          <div className="flex justify-end">
            <button type="button" onClick={next} className={cn(buttonVariants({ size: "lg" }), "h-11 px-8")}>
              Tovább
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">Mit szeretnél bejelenteni?</h1>
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
              <p className="mt-3 text-xl font-bold">Probléma</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Valami nem működik jól.
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
              <p className="mt-3 text-xl font-bold">Javaslat</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Valamit szeretnél jobbá tenni.
              </p>
            </button>
          </div>
          <div className="flex justify-between">
            <button type="button" onClick={back} className={cn(buttonVariants({ variant: "ghost" }))}>
              Vissza
            </button>
            <button
              type="button"
              onClick={next}
              disabled={!type}
              className={cn(buttonVariants({ size: "lg" }), "h-11 px-8")}
            >
              Tovább
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">Milyen kategória?</h1>
          <CategoryPicker value={category} onChange={setCategory} />
          <div className="flex justify-between">
            <button type="button" onClick={back} className={cn(buttonVariants({ variant: "ghost" }))}>
              Vissza
            </button>
            <button
              type="button"
              onClick={next}
              disabled={!category}
              className={cn(buttonVariants({ size: "lg" }), "h-11 px-8")}
            >
              Tovább
            </button>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">Mondd el röviden</h1>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="text-sm font-medium">
                Mi legyen az ügy címe?
              </label>
              <Input
                id="title"
                className="mt-1.5 h-11"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="pl. Zebra kell az iskola elé"
              />
            </div>
            <div>
              <label htmlFor="problem" className="text-sm font-medium">
                Mi a probléma?
              </label>
              <Textarea
                id="problem"
                className="mt-1.5"
                rows={4}
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="Írd le, mi a gond…"
              />
            </div>
            <div>
              <label htmlFor="request" className="text-sm font-medium">
                Mit szeretnél, mi történjen?
              </label>
              <Textarea
                id="request"
                className="mt-1.5"
                rows={3}
                value={request}
                onChange={(e) => setRequest(e.target.value)}
                placeholder="pl. Gyalogátkelőhely kialakítását…"
              />
            </div>
            <button
              type="button"
              className={cn(buttonVariants({ variant: "secondary" }), "gap-2")}
              onClick={() => {
                if (!title) setTitle("Zebra kell az iskola elé");
                if (!problem)
                  setProblem(
                    "Az iskola előtt nincs biztonságos átkelési lehetőség a gyerekeknek.",
                  );
                if (!request)
                  setRequest(
                    "Gyalogátkelőhely kialakítását és 30 km/h-s sebességkorlátozást.",
                  );
              }}
            >
              <Sparkles className="size-4" />
              Segíts megfogalmazni
            </button>
            <p className="text-xs text-muted-foreground">
              Az AI csak javaslatot ad – a szöveget te hagyod jóvá.
            </p>
          </div>
          <div className="flex justify-between">
            <button type="button" onClick={back} className={cn(buttonVariants({ variant: "ghost" }))}>
              Vissza
            </button>
            <button
              type="button"
              onClick={next}
              disabled={!title.trim() || !problem.trim()}
              className={cn(buttonVariants({ size: "lg" }), "h-11 px-8")}
            >
              Tovább
            </button>
          </div>
        </section>
      )}

      {step === 5 && (
        <section className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">Mutasd meg</h1>
          <p className="text-muted-foreground">Maximum 5 kép. Mobilon a kamerát is használhatod.</p>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card p-10 hover:bg-muted/40">
            <Camera className="size-10 text-muted-foreground" />
            <span className="font-medium">Képek feltöltése vagy fénykép</span>
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
            <p className="text-sm text-emerald-700">{images.length} kép kiválasztva</p>
          )}
          <div className="flex justify-between">
            <button type="button" onClick={back} className={cn(buttonVariants({ variant: "ghost" }))}>
              Vissza
            </button>
            <button type="button" onClick={next} className={cn(buttonVariants({ size: "lg" }), "h-11 px-8")}>
              Tovább
            </button>
          </div>
        </section>
      )}

      {step === 6 && (
        <section className="space-y-6">
          {!forceNew && duplicate ? (
            <>
              <h1 className="text-3xl font-bold tracking-tight">
                Lehet, hogy ezt már más is jelezte
              </h1>
              <DuplicateIssueCard
                issue={{ ...duplicate, distanceMeters: 136 }}
                onSupport={() => router.push(`/ugy/${duplicate.slug}`)}
              />
              <button
                type="button"
                onClick={() => setForceNew(true)}
                className={cn(buttonVariants({ variant: "ghost" }), "w-full")}
              >
                Mégis új ügyet hozok létre
              </button>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold tracking-tight">Ellenőrzés</h1>
              <article className="rounded-2xl border border-border bg-card p-5">
                <p className="text-xs uppercase text-muted-foreground">Előnézet</p>
                <h2 className="mt-2 text-xl font-semibold">{title}</h2>
                <p className="mt-3 text-sm leading-relaxed">{problem}</p>
                <p className="mt-3 text-sm font-medium">{request}</p>
              </article>
              <button
                type="button"
                onClick={() => setPublished(true)}
                className={cn(buttonVariants({ size: "lg" }), "h-12 w-full font-bold")}
              >
                Közzéteszem
              </button>
            </>
          )}
          <button type="button" onClick={back} className={cn(buttonVariants({ variant: "ghost" }))}>
            Vissza
          </button>
        </section>
      )}
    </div>
  );
}
