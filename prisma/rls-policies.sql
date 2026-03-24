-- Row-Level Security (RLS) Policies for Tenant Data Isolation
-- Run this after Prisma migrations to enforce shop-level data isolation at the DB level.
--
-- These policies ensure that even if application code has a bug,
-- the database itself prevents cross-tenant data access.

-- Enable RLS on all shop-scoped tables
ALTER TABLE "TranslationCache" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TranslationMemory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GlossaryEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CulturalContext" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ConsentRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DataAccessLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DataRetentionPolicy" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ShopSubscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ShopUsage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TranslationUsage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TranslationAlert" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NotificationPreference" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AlertConfiguration" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ShopSettings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TeamInvite" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TeamMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;

-- Create policies for each table
-- The app sets current_setting('app.current_shop') before each request

CREATE POLICY tenant_isolation ON "TranslationCache"
  USING (shop = current_setting('app.current_shop', true));
CREATE POLICY tenant_isolation ON "TranslationMemory"
  USING (shop = current_setting('app.current_shop', true));
CREATE POLICY tenant_isolation ON "GlossaryEntry"
  USING (shop = current_setting('app.current_shop', true));
CREATE POLICY tenant_isolation ON "CulturalContext"
  USING (shop = current_setting('app.current_shop', true));
CREATE POLICY tenant_isolation ON "ConsentRecord"
  USING (shop = current_setting('app.current_shop', true));
CREATE POLICY tenant_isolation ON "DataAccessLog"
  USING (shop = current_setting('app.current_shop', true));
CREATE POLICY tenant_isolation ON "DataRetentionPolicy"
  USING (shop = current_setting('app.current_shop', true));
CREATE POLICY tenant_isolation ON "ShopSubscription"
  USING (shop = current_setting('app.current_shop', true));
CREATE POLICY tenant_isolation ON "ShopUsage"
  USING (shop = current_setting('app.current_shop', true));
CREATE POLICY tenant_isolation ON "TranslationUsage"
  USING (shop = current_setting('app.current_shop', true));
CREATE POLICY tenant_isolation ON "TranslationAlert"
  USING (shop = current_setting('app.current_shop', true));
CREATE POLICY tenant_isolation ON "NotificationPreference"
  USING (shop = current_setting('app.current_shop', true));
CREATE POLICY tenant_isolation ON "AlertConfiguration"
  USING (shop = current_setting('app.current_shop', true));
CREATE POLICY tenant_isolation ON "ShopSettings"
  USING (shop = current_setting('app.current_shop', true));
CREATE POLICY tenant_isolation ON "TeamInvite"
  USING (shop = current_setting('app.current_shop', true));
CREATE POLICY tenant_isolation ON "TeamMember"
  USING (shop = current_setting('app.current_shop', true));
CREATE POLICY tenant_isolation ON "Session"
  USING (shop = current_setting('app.current_shop', true));

-- BillingPlan is global (no shop column) — no RLS needed
-- Allow the Prisma connection role to bypass RLS for migrations/admin
-- (The app user should NOT have this bypass)
