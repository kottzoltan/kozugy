import type { IssueStatus, OfficialRelation } from "@/lib/types";

export const STATUS_LABEL: Record<IssueStatus, string> = {
  uj: "Új ügy",
  ertesitve: "Értesítve",
  vizsgalat: "Vizsgálat alatt",
  folyamatban: "Folyamatban",
  megoldott: "Megoldódott",
  elutasitott: "Elutasítva",
};

export const STATUS_DOT: Record<IssueStatus, string> = {
  uj: "bg-sky-500",
  ertesitve: "bg-blue-500",
  vizsgalat: "bg-amber-400",
  folyamatban: "bg-orange-500",
  megoldott: "bg-emerald-500",
  elutasitott: "bg-slate-400",
};

export const STATUS_EMOJI: Record<IssueStatus, string> = {
  uj: "🔵",
  ertesitve: "🔵",
  vizsgalat: "🟡",
  folyamatban: "🟠",
  megoldott: "✅",
  elutasitott: "⚪",
};

export const RELATION_LABEL: Record<OfficialRelation, string> = {
  megszolitva: "Megszólítva",
  valaszolt: "Válaszolt",
  foglalkozik: "Foglalkozik az üggyel",
  megoldasban: "Részt vett a megoldásban",
};

export const CATEGORY_LABEL: Record<string, string> = {
  kozlekedes: "Közlekedés",
  katyu: "Kátyú",
  parkolas: "Parkolás",
  koztisztasag: "Köztisztaság",
  zoldterulet: "Zöldterület",
  vilagitas: "Világítás",
  zaj: "Zaj",
  epuletek: "Épületek",
  egyeb: "Egyéb",
};
