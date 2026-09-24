CREATE TYPE "category" AS ENUM('kozlekedes', 'katyu', 'parkolas', 'koztisztasag', 'zoldterulet', 'vilagitas', 'zaj', 'epuletek', 'egyeb');--> statement-breakpoint
CREATE TYPE "issue_status" AS ENUM('uj', 'ertesitve', 'vizsgalat', 'folyamatban', 'megoldott', 'elutasitott');--> statement-breakpoint
CREATE TYPE "issue_type" AS ENUM('problema', 'javaslat');--> statement-breakpoint
CREATE TABLE "issue_supports" (
	"issue_id" varchar(64),
	"user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "issue_supports_pkey" PRIMARY KEY("issue_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "issues" (
	"id" varchar(64) PRIMARY KEY,
	"slug" varchar(160) NOT NULL UNIQUE,
	"title" varchar(255) NOT NULL,
	"settlement" varchar(120) NOT NULL,
	"address" varchar(255) NOT NULL,
	"category" "category" NOT NULL,
	"type" "issue_type" NOT NULL,
	"status" "issue_status" DEFAULT 'uj'::"issue_status" NOT NULL,
	"supporters_count" integer DEFAULT 0 NOT NULL,
	"supporters_change_24h" integer DEFAULT 0 NOT NULL,
	"summary" text,
	"problem" text NOT NULL,
	"request" text NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"images" text[] DEFAULT '{}'::text[] NOT NULL,
	"organization_id" varchar(64),
	"article_slug" varchar(160),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "official_responses" (
	"id" varchar(64) PRIMARY KEY,
	"issue_id" varchar(64) NOT NULL,
	"organization_name" varchar(255) NOT NULL,
	"summary" text NOT NULL,
	"original_text" text NOT NULL,
	"verified" boolean DEFAULT true NOT NULL,
	"responded_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" varchar(64) PRIMARY KEY,
	"slug" varchar(128) NOT NULL UNIQUE,
	"name" varchar(255) NOT NULL,
	"website" text,
	"contact_email" varchar(255),
	"avg_response_days" double precision
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "issue_supports" ADD CONSTRAINT "issue_supports_issue_id_issues_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "issue_supports" ADD CONSTRAINT "issue_supports_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id");--> statement-breakpoint
ALTER TABLE "official_responses" ADD CONSTRAINT "official_responses_issue_id_issues_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE CASCADE;