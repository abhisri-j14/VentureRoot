-- =========================================================
-- Supabase Auth Foreign Keys
-- =========================================================

ALTER TABLE "profiles"
ADD CONSTRAINT "profiles_user_id_fkey"
FOREIGN KEY ("user_id")
REFERENCES "auth"."users"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;


ALTER TABLE "businesses"
ADD CONSTRAINT "businesses_user_id_fkey"
FOREIGN KEY ("user_id")
REFERENCES "auth"."users"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;


ALTER TABLE "reports"
ADD CONSTRAINT "reports_user_id_fkey"
FOREIGN KEY ("user_id")
REFERENCES "auth"."users"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;