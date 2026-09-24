"use client";

import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const actions = [
  "Illetékes hozzáadása",
  "Döntéshozó hozzáadása",
  "Email küldése",
  "Külső válasz hozzáadása",
  "Státusz módosítása",
  "Cikk generálása",
  "Duplikáció összevonása",
];

export function AdminIssueActions() {
  const [responseOpen, setResponseOpen] = useState(false);
  const [articleOpen, setArticleOpen] = useState(false);
  const [aiDone, setAiDone] = useState(false);
  const [fbPost, setFbPost] = useState(
    "Több százan kérnek zebrát az iskola elé Budaörsön. Olvasd el, mit válaszolt az önkormányzat → kozosugyunk.hu",
  );

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold">Gyors műveletek</h2>
      <div className="flex flex-col gap-2">
        {actions.map((label) => (
          <button
            key={label}
            type="button"
            className={cn(buttonVariants({ variant: "outline" }), "h-10 justify-start")}
            onClick={() => {
              if (label === "Külső válasz hozzáadása") setResponseOpen(true);
              if (label === "Cikk generálása") setArticleOpen(true);
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <Dialog open={responseOpen} onOpenChange={setResponseOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Külső válasz hozzáadása</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Forrás típusa (email, web, dokumentum)" />
            <Input placeholder="Szervezet" />
            <Input placeholder="Döntéshozó (opcionális)" />
            <Input placeholder="Forrás URL" />
            <Input type="date" defaultValue="2026-09-27" />
            <Textarea rows={5} placeholder="Eredeti szöveg" />
            <button
              type="button"
              className={cn(buttonVariants(), "w-full")}
              onClick={() => setAiDone(true)}
            >
              AI feldolgozás
            </button>
            {aiDone && (
              <div className="space-y-2 rounded-lg border border-teal-200 bg-teal-50/50 p-3 text-sm">
                <p>
                  <strong>Összefoglaló:</strong> Helyszíni vizsgálat, döntés okt. 15-ig.
                </p>
                <p>
                  <strong>Vállalás:</strong> Helyszíni bejárás
                </p>
                <p>
                  <strong>Határidő:</strong> 2026-10-15
                </p>
                <p>
                  <strong>Javasolt státusz:</strong> Vizsgálat alatt
                </p>
                <p>
                  <strong>Bizonyosság:</strong> 0,86
                </p>
                <button type="button" className={cn(buttonVariants({ size: "sm" }))}>
                  Jóváhagyás és mentés
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={articleOpen} onOpenChange={setArticleOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Cikk generálása</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div>
              <label className="font-medium">Cím</label>
              <Input
                className="mt-1"
                defaultValue="Több százan kérnek zebrát az iskola elé Budaörsön"
              />
            </div>
            <div>
              <label className="font-medium">Lead</label>
              <Textarea
                className="mt-1"
                rows={2}
                defaultValue="A budaörsi iskola előtt egyre többen jelzik: nincs biztonságos átkelés."
              />
            </div>
            <div>
              <label className="font-medium">Cikk törzs</label>
              <Textarea
                className="mt-1"
                rows={4}
                defaultValue="Szeptember végén több mint nyolcszáz érintett jelezte…"
              />
            </div>
            <div>
              <label className="font-medium">Facebook poszt</label>
              <Textarea
                className="mt-1"
                rows={3}
                value={fbPost}
                onChange={(e) => setFbPost(e.target.value)}
              />
              <button
                type="button"
                className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "mt-2")}
                onClick={() => navigator.clipboard.writeText(fbPost)}
              >
                Másolás
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <button type="button" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                Mentés draftként
              </button>
              <button type="button" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                Előnézet
              </button>
              <button type="button" className={cn(buttonVariants({ size: "sm" }))}>
                Közzététel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
