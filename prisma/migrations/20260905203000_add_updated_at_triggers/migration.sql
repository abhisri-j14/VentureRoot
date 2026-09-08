-- =============================================
-- UPDATED_AT FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updated_at" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =============================================
-- LOCATIONS
-- =============================================

CREATE TRIGGER "locations_set_updated_at"
BEFORE UPDATE ON "locations"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- =============================================
-- BUSINESS CATEGORIES
-- =============================================

CREATE TRIGGER "business_categories_set_updated_at"
BEFORE UPDATE ON "business_categories"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- =============================================
-- PROFILES
-- =============================================

CREATE TRIGGER "profiles_set_updated_at"
BEFORE UPDATE ON "profiles"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- =============================================
-- BUSINESSES
-- =============================================

CREATE TRIGGER "businesses_set_updated_at"
BEFORE UPDATE ON "businesses"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- =============================================
-- REPORTS
-- =============================================

CREATE TRIGGER "reports_set_updated_at"
BEFORE UPDATE ON "reports"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();