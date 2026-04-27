import { pgTable, serial, text, boolean, timestamp, integer, jsonb } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: text('clerk_id').notNull().unique(),
  email: text('email').notNull(),
  freeCoverageUsed: boolean('free_coverage_used').notNull().default(false),

  // Stripe
  stripeCustomerId: text('stripe_customer_id').unique(),

  // Subscription tracking
  subscriptionTier: text('subscription_tier'),           // 'writer' | 'producer' | 'executive' | null
  subscriptionStatus: text('subscription_status'),       // 'active' | 'canceled' | 'past_due' | null
  stripeSubscriptionId: text('stripe_subscription_id'),
  subscriptionPeriodEnd: timestamp('subscription_period_end'),
  subscriptionCredits: integer('subscription_credits').notNull().default(0),
  subscriptionCreditsResetAt: timestamp('subscription_credits_reset_at'),

  // Purchased credits (one-offs and bundles — never expire, never reset)
  purchasedCredits: integer('purchased_credits').notNull().default(0),

  // Marketing attribution captured before signup and attached on first login
  firstTouchAttribution: jsonb('first_touch_attribution'),
  lastTouchAttribution: jsonb('last_touch_attribution'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const coverages = pgTable('coverages', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  title: text('title'),
  writer: text('writer'),
  draftDate: text('draft_date'),
  logline: text('logline'),
  genre: text('genre'),
  settingTimePeriod: text('setting_time_period'),
  recommendation: text('recommendation'),
  overallScore: integer('overall_score'),
  calculatedScore: integer('calculated_score'),
  categoryScores: jsonb('category_scores'),
  coverageText: text('coverage_text'),
  promptVersion: text('prompt_version'),
  screenplayBlobUrl: text('screenplay_blob_url'),
  coveragePdfBlobUrl: text('coverage_pdf_blob_url'),
  isSample: boolean('is_sample').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const sampleMetadata = pgTable('sample_metadata', {
  id: serial('id').primaryKey(),
  coverageId: integer('coverage_id').notNull().references(() => coverages.id).unique(),
  tmdbId: integer('tmdb_id'),
  posterPath: text('poster_path'),             // TMDB relative path, e.g. "/abc123.jpg"
  slug: text('slug').notNull().unique(),       // URL-friendly identifier, e.g. "sinners"
  displayGenre: text('display_genre'),         // Clean genre label for grid grouping (e.g. "Drama", "Thriller")
  releaseYear: integer('release_year'),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
