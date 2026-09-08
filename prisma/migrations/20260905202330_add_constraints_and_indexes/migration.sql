-- This is an empty migration.
-- ==============================
-- PROFILE CONSTRAINTS
-- ==============================

ALTER TABLE "profiles"
ADD CONSTRAINT "profiles_available_capital_non_negative"
CHECK (
  "available_capital" IS NULL
  OR "available_capital" >= 0
);

ALTER TABLE "profiles"
ADD CONSTRAINT "profiles_income_non_negative"
CHECK (
  "income" IS NULL
  OR "income" >= 0
);


-- ==============================
-- BUSINESS CONSTRAINTS
-- ==============================

ALTER TABLE "businesses"
ADD CONSTRAINT "businesses_available_margin_non_negative"
CHECK ("available_margin" >= 0);

ALTER TABLE "businesses"
ADD CONSTRAINT "businesses_expected_revenue_non_negative"
CHECK ("expected_revenue" >= 0);


-- ==============================
-- REPORT CONSTRAINTS
-- ==============================

ALTER TABLE "reports"
ADD CONSTRAINT "reports_file_size_non_negative"
CHECK (
  "file_size" IS NULL
  OR "file_size" >= 0
);


-- ==============================
-- LOCATION BASIC CONSTRAINT
-- ==============================

ALTER TABLE "locations"
ADD CONSTRAINT "locations_state_parent_check"
CHECK (
  ("type" = 'STATE' AND "parent_id" IS NULL)
  OR
  ("type" <> 'STATE' AND "parent_id" IS NOT NULL)
);


CREATE UNIQUE INDEX "locations_parent_type_name_unique"
ON "locations" (
  "parent_id",
  "type",
  "name"
)
WHERE "parent_id" IS NOT NULL;
CREATE UNIQUE INDEX "locations_state_name_unique"
ON "locations" ("name")
WHERE "type" = 'STATE';


CREATE OR REPLACE FUNCTION validate_location_hierarchy()
RETURNS TRIGGER AS $$
DECLARE
  parent_type "LocationType";
BEGIN

  IF NEW."type" = 'STATE' THEN
    IF NEW."parent_id" IS NOT NULL THEN
      RAISE EXCEPTION 'STATE cannot have a parent';
    END IF;

    RETURN NEW;
  END IF;

  IF NEW."parent_id" IS NULL THEN
    RAISE EXCEPTION '% must have a parent', NEW."type";
  END IF;

  IF NEW."id" = NEW."parent_id" THEN
    RAISE EXCEPTION 'Location cannot be its own parent';
  END IF;

  SELECT "type"
  INTO parent_type
  FROM "locations"
  WHERE "id" = NEW."parent_id";

  IF parent_type IS NULL THEN
    RAISE EXCEPTION 'Parent location does not exist';
  END IF;

  IF NEW."type" = 'DISTRICT'
     AND parent_type <> 'STATE' THEN
    RAISE EXCEPTION 'DISTRICT parent must be STATE';
  END IF;

  IF NEW."type" = 'BLOCK'
     AND parent_type <> 'DISTRICT' THEN
    RAISE EXCEPTION 'BLOCK parent must be DISTRICT';
  END IF;

  IF NEW."type" = 'VILLAGE'
     AND parent_type <> 'BLOCK' THEN
    RAISE EXCEPTION 'VILLAGE parent must be BLOCK';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;