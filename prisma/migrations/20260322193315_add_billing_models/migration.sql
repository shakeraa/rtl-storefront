-- CreateTable
CREATE TABLE "BillingPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "priceInCents" INTEGER NOT NULL,
    "trialDays" INTEGER NOT NULL DEFAULT 14,
    "maxLanguages" INTEGER NOT NULL,
    "maxWordsPerMonth" INTEGER NOT NULL,
    "features" TEXT NOT NULL DEFAULT '[]',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ShopSubscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "planId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'trial',
    "shopifyChargeId" TEXT,
    "trialStartedAt" DATETIME,
    "trialEndsAt" DATETIME,
    "currentPeriodStart" DATETIME,
    "currentPeriodEnd" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ShopSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "BillingPlan" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ShopUsage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "periodStart" DATETIME NOT NULL,
    "wordsUsed" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "BillingPlan_slug_key" ON "BillingPlan"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ShopSubscription_shop_key" ON "ShopSubscription"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "ShopSubscription_shopifyChargeId_key" ON "ShopSubscription"("shopifyChargeId");

-- CreateIndex
CREATE INDEX "ShopSubscription_status_idx" ON "ShopSubscription"("status");

-- CreateIndex
CREATE INDEX "ShopUsage_shop_idx" ON "ShopUsage"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "ShopUsage_shop_periodStart_key" ON "ShopUsage"("shop", "periodStart");
