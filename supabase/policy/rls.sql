ALTER TABLE "profiles"
ENABLE ROW LEVEL SECURITY;

ALTER TABLE "businesses"
ENABLE ROW LEVEL SECURITY;

ALTER TABLE "reports"
ENABLE ROW LEVEL SECURITY;

ALTER TABLE "locations"
ENABLE ROW LEVEL SECURITY;

ALTER TABLE "business_categories"
ENABLE ROW LEVEL SECURITY;


-- =========================================================
-- PROFILES
-- =========================================================

CREATE POLICY "profiles_select_own"
ON "profiles"
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND auth.uid() = user_id
);

CREATE POLICY "profiles_insert_own"
ON "profiles"
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND auth.uid() = user_id
);

CREATE POLICY "profiles_update_own"
ON "profiles"
FOR UPDATE
TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND auth.uid() = user_id
)
WITH CHECK (
  auth.uid() IS NOT NULL
  AND auth.uid() = user_id
);

CREATE POLICY "profiles_delete_own"
ON "profiles"
FOR DELETE
TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND auth.uid() = user_id
);


-- =========================================================
-- BUSINESSES
-- =========================================================

CREATE POLICY "businesses_select_own"
ON "businesses"
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND auth.uid() = user_id
);

CREATE POLICY "businesses_insert_own"
ON "businesses"
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND auth.uid() = user_id
);

CREATE POLICY "businesses_update_own"
ON "businesses"
FOR UPDATE
TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND auth.uid() = user_id
)
WITH CHECK (
  auth.uid() IS NOT NULL
  AND auth.uid() = user_id
);

CREATE POLICY "businesses_delete_own"
ON "businesses"
FOR DELETE
TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND auth.uid() = user_id
);


-- =========================================================
-- REPORTS
-- =========================================================

CREATE POLICY "reports_select_own"
ON "reports"
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND auth.uid() = user_id
);

CREATE POLICY "reports_insert_own"
ON "reports"
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND auth.uid() = user_id
);

CREATE POLICY "reports_update_own"
ON "reports"
FOR UPDATE
TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND auth.uid() = user_id
)
WITH CHECK (
  auth.uid() IS NOT NULL
  AND auth.uid() = user_id
);

CREATE POLICY "reports_delete_own"
ON "reports"
FOR DELETE
TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND auth.uid() = user_id
);


-- =========================================================
-- LOCATIONS
-- =========================================================

CREATE POLICY "locations_authenticated_read"
ON "locations"
FOR SELECT
TO authenticated
USING (true);


-- =========================================================
-- BUSINESS CATEGORIES
-- =========================================================

CREATE POLICY "business_categories_authenticated_read"
ON "business_categories"
FOR SELECT
TO authenticated
USING (true);