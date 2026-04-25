ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "first_touch_attribution" jsonb,
  ADD COLUMN IF NOT EXISTS "last_touch_attribution" jsonb;
