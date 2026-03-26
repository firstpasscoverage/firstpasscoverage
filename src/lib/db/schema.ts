import { pgTable, serial, text, boolean, timestamp, integer, jsonb } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: text('clerk_id').notNull().unique(),
  email: text('email').notNull(),
  freeCoverageUsed: boolean('free_coverage_used').notNull().default(false),
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
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
