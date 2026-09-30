import type {
  CategoryId,
  OrgLinkStatus,
  OrgRelationRole,
  OrgType,
  Organization,
} from "@/lib/types";
import { getOrganization, organizations as mockOrgs } from "@/lib/mock-data";

export const ORG_TYPE_LABEL: Record<OrgType, string> = {
  onkormanyzat: "Önkormányzat",
  kormanyhivatal: "Kormányhivatal",
  fovaros: "Főváros",
  kozut: "Közút",
  kozmu: "Közmű",
  egyeb: "Egyéb",
};

export const ORG_ROLE_LABEL: Record<OrgRelationRole, string> = {
  illetekes: "Illetékes",
  ertesitve: "Értesítve",
  kozmu: "Közmű",
  megfigyelo: "Megfigyelő",
};

export const ORG_LINK_STATUS_LABEL: Record<OrgLinkStatus, string> = {
  hozzarendelve: "Hozzárendelve",
  ertesitve: "Értesítve",
  valaszolt: "Válaszolt",
  folyamatban: "Folyamatban",
  lezarva: "Lezárva",
};

/** Heuristic suggestions by category + settlement (no DB). */
export function suggestOrganizations(input: {
  category: CategoryId;
  settlement?: string;
}): Organization[] {
  const bySettlement = input.settlement
    ? mockOrgs.filter(
        (o) =>
          o.orgType === "onkormanyzat" &&
          o.settlement?.toLowerCase() === input.settlement!.toLowerCase(),
      )
    : [];

  const extras: Organization[] = [];
  if (input.category === "katyu" || input.category === "kozlekedes") {
    const kozut = getOrganization("org-kozut");
    if (kozut) extras.push(kozut);
  }
  if (input.category === "vilagitas") {
    const elmu = getOrganization("org-elmu");
    const eon = getOrganization("org-eon");
    if (elmu) extras.push(elmu);
    if (eon) extras.push(eon);
  }
  if (input.settlement?.toLowerCase() === "budapest") {
    const fovaros = getOrganization("org-fovaros");
    if (fovaros) extras.push(fovaros);
  }

  const seen = new Set<string>();
  return [...bySettlement, ...extras].filter((o) => {
    if (seen.has(o.id)) return false;
    seen.add(o.id);
    return true;
  });
}
