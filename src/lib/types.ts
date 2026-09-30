export type IssueStatus =
  | "uj"
  | "ertesitve"
  | "vizsgalat"
  | "folyamatban"
  | "megoldott"
  | "elutasitott";

export type IssueType = "problema" | "javaslat";

export type OfficialRelation =
  | "megszolitva"
  | "valaszolt"
  | "foglalkozik"
  | "megoldasban";

export type CategoryId =
  | "kozlekedes"
  | "katyu"
  | "parkolas"
  | "koztisztasag"
  | "zoldterulet"
  | "vilagitas"
  | "zaj"
  | "epuletek"
  | "egyeb";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Issue {
  id: string;
  slug: string;
  title: string;
  settlement: string;
  address: string;
  category: CategoryId;
  type: IssueType;
  status: IssueStatus;
  supporters: number;
  supportersChange24h?: number;
  createdAt: string;
  summary?: string;
  problem: string;
  request: string;
  location: GeoPoint;
  images: string[];
  distanceMeters?: number;
  organizationId?: string;
  officialIds?: string[];
  articleSlug?: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description?: string;
  icon?: "created" | "email" | "response" | "status";
}

export interface OfficialResponse {
  id: string;
  organizationName: string;
  date: string;
  summary: string;
  originalText: string;
  sourceUrl?: string;
  verified: boolean;
}

export interface PublicOfficial {
  id: string;
  slug: string;
  name: string;
  title: string;
  area: string;
  imageUrl?: string;
  facebookUrl?: string;
  websiteUrl?: string;
  verified: boolean;
  claimed: boolean;
  relation?: OfficialRelation;
}

export interface Organization {
  id: string;
  slug: string;
  name: string;
  orgType?: OrgType;
  settlement?: string;
  website?: string;
  contactEmail?: string;
  notifiedAt?: string;
  respondedAt?: string;
  avgResponseDays?: number;
}

export type OrgType =
  | "onkormanyzat"
  | "kormanyhivatal"
  | "fovaros"
  | "kozut"
  | "kozmu"
  | "egyeb";

export type OrgRelationRole =
  | "illetekes"
  | "ertesitve"
  | "kozmu"
  | "megfigyelo";

export type OrgLinkStatus =
  | "hozzarendelve"
  | "ertesitve"
  | "valaszolt"
  | "folyamatban"
  | "lezarva";

export interface IssueOrganizationLink {
  organization: Organization;
  role: OrgRelationRole;
  linkStatus: OrgLinkStatus;
  notifiedAt?: string;
  respondedAt?: string;
  note?: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  lead: string;
  category: string;
  date: string;
  author: string;
  imageUrl?: string;
  relatedIssueSlug?: string;
  relatedSupporters?: number;
  relatedIssueCount?: number;
  body: {
    happened: string;
    request: string;
    response: string;
    timeline: string;
    next: string;
  };
}

export interface Comment {
  id: string;
  author: string;
  date: string;
  text: string;
}

export interface CategoryOption {
  id: CategoryId;
  label: string;
  icon: string;
}
