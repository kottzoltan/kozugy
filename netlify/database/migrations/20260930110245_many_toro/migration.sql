CREATE TYPE "moderation_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "suggestion_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "issue_edit_suggestions" (
	"id" varchar(64) PRIMARY KEY,
	"issue_id" varchar(64) NOT NULL,
	"author_user_id" uuid NOT NULL,
	"status" "suggestion_status" DEFAULT 'pending'::"suggestion_status" NOT NULL,
	"rationale" text,
	"proposed_title" varchar(255),
	"proposed_summary" text,
	"proposed_problem" text,
	"proposed_request" text,
	"proposed_category" "category",
	"proposed_address" varchar(255),
	"proposed_settlement" varchar(120),
	"previous_title" varchar(255) NOT NULL,
	"previous_summary" text,
	"previous_problem" text NOT NULL,
	"previous_request" text NOT NULL,
	"previous_category" "category" NOT NULL,
	"previous_address" varchar(255) NOT NULL,
	"previous_settlement" varchar(120) NOT NULL,
	"reviewer_user_id" uuid,
	"review_note" text,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "issues" ADD COLUMN "created_by_user_id" uuid;--> statement-breakpoint
ALTER TABLE "issues" ADD COLUMN "moderation_status" "moderation_status" DEFAULT 'approved'::"moderation_status" NOT NULL;--> statement-breakpoint
ALTER TABLE "issues" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "issue_edit_suggestions" ADD CONSTRAINT "issue_edit_suggestions_issue_id_issues_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "issue_edit_suggestions" ADD CONSTRAINT "issue_edit_suggestions_author_user_id_users_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "issue_edit_suggestions" ADD CONSTRAINT "issue_edit_suggestions_reviewer_user_id_users_id_fkey" FOREIGN KEY ("reviewer_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_created_by_user_id_users_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id");