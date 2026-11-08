-- Auth.js user profile fields + OAuth accounts
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "image" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_hash" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verified" timestamp with time zone;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "roles" text[] DEFAULT '{"user"}'::text[] NOT NULL;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_unique" ON "users" ("email");

CREATE TABLE IF NOT EXISTS "accounts" (
  "user_id" uuid NOT NULL,
  "type" varchar(32) NOT NULL,
  "provider" varchar(64) NOT NULL,
  "provider_account_id" varchar(255) NOT NULL,
  "refresh_token" text,
  "access_token" text,
  "expires_at" integer,
  "token_type" varchar(64),
  "scope" text,
  "id_token" text,
  "session_state" text,
  CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action,
  CONSTRAINT "accounts_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
