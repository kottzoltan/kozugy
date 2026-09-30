CREATE TYPE "org_link_status" AS ENUM('hozzarendelve', 'ertesitve', 'valaszolt', 'folyamatban', 'lezarva');--> statement-breakpoint
CREATE TYPE "org_relation_role" AS ENUM('illetekes', 'ertesitve', 'kozmu', 'megfigyelo');--> statement-breakpoint
CREATE TYPE "org_type" AS ENUM('onkormanyzat', 'kormanyhivatal', 'fovaros', 'kozut', 'kozmu', 'egyeb');--> statement-breakpoint
CREATE TABLE "issue_organizations" (
	"issue_id" varchar(64),
	"organization_id" varchar(64),
	"role" "org_relation_role" DEFAULT 'illetekes'::"org_relation_role" NOT NULL,
	"link_status" "org_link_status" DEFAULT 'hozzarendelve'::"org_link_status" NOT NULL,
	"notified_at" timestamp with time zone,
	"responded_at" timestamp with time zone,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "issue_organizations_pkey" PRIMARY KEY("issue_id","organization_id")
);
--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "org_type" "org_type" DEFAULT 'egyeb'::"org_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "settlement" varchar(120);--> statement-breakpoint
ALTER TABLE "issue_organizations" ADD CONSTRAINT "issue_organizations_issue_id_issues_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "issue_organizations" ADD CONSTRAINT "issue_organizations_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;