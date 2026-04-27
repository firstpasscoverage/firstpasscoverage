CREATE TABLE IF NOT EXISTS "users" (
  "id" serial PRIMARY KEY NOT NULL,
  "clerk_id" text NOT NULL,
  "email" text NOT NULL,
  "free_coverage_used" boolean DEFAULT false NOT NULL,
  "stripe_customer_id" text,
  "subscription_tier" text,
  "subscription_status" text,
  "stripe_subscription_id" text,
  "subscription_period_end" timestamp,
  "subscription_credits" integer DEFAULT 0 NOT NULL,
  "subscription_credits_reset_at" timestamp,
  "purchased_credits" integer DEFAULT 0 NOT NULL,
  "first_touch_attribution" jsonb,
  "last_touch_attribution" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id"),
  CONSTRAINT "users_stripe_customer_id_unique" UNIQUE("stripe_customer_id")
);

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "first_touch_attribution" jsonb,
  ADD COLUMN IF NOT EXISTS "last_touch_attribution" jsonb;

CREATE TABLE IF NOT EXISTS "coverages" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL REFERENCES "users"("id"),
  "title" text,
  "writer" text,
  "draft_date" text,
  "logline" text,
  "genre" text,
  "setting_time_period" text,
  "recommendation" text,
  "overall_score" integer,
  "calculated_score" integer,
  "category_scores" jsonb,
  "coverage_text" text,
  "prompt_version" text,
  "screenplay_blob_url" text,
  "coverage_pdf_blob_url" text,
  "is_sample" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "sample_metadata" (
  "id" serial PRIMARY KEY NOT NULL,
  "coverage_id" integer NOT NULL REFERENCES "coverages"("id"),
  "tmdb_id" integer,
  "poster_path" text,
  "slug" text NOT NULL,
  "display_genre" text,
  "release_year" integer,
  "display_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "sample_metadata_coverage_id_unique" UNIQUE("coverage_id"),
  CONSTRAINT "sample_metadata_slug_unique" UNIQUE("slug")
);
