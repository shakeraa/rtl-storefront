-- CreateTable
CREATE TABLE "TranslationMemory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "sourceLocale" TEXT NOT NULL,
    "targetLocale" TEXT NOT NULL,
    "sourceText" TEXT NOT NULL,
    "translatedText" TEXT NOT NULL,
    "context" TEXT,
    "category" TEXT,
    "quality" INTEGER NOT NULL DEFAULT 100,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "GlossaryEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "sourceLocale" TEXT NOT NULL,
    "targetLocale" TEXT NOT NULL,
    "sourceTerm" TEXT NOT NULL,
    "translatedTerm" TEXT NOT NULL,
    "neverTranslate" BOOLEAN NOT NULL DEFAULT false,
    "caseSensitive" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CulturalContext" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "dialect" TEXT,
    "formalityLevel" TEXT NOT NULL DEFAULT 'formal',
    "culturalNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ConsentRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT false,
    "grantedAt" DATETIME,
    "revokedAt" DATETIME,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DataAccessLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "performedBy" TEXT,
    "details" TEXT,
    "ipAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "DataRetentionPolicy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "retentionDays" INTEGER NOT NULL DEFAULT 365,
    "autoDelete" BOOLEAN NOT NULL DEFAULT false,
    "lastCleanup" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "TranslationMemory_shop_sourceLocale_targetLocale_idx" ON "TranslationMemory"("shop", "sourceLocale", "targetLocale");

-- CreateIndex
CREATE INDEX "TranslationMemory_shop_sourceText_idx" ON "TranslationMemory"("shop", "sourceText");

-- CreateIndex
CREATE INDEX "GlossaryEntry_shop_sourceLocale_idx" ON "GlossaryEntry"("shop", "sourceLocale");

-- CreateIndex
CREATE UNIQUE INDEX "GlossaryEntry_shop_sourceLocale_targetLocale_sourceTerm_key" ON "GlossaryEntry"("shop", "sourceLocale", "targetLocale", "sourceTerm");

-- CreateIndex
CREATE INDEX "CulturalContext_shop_locale_idx" ON "CulturalContext"("shop", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "CulturalContext_shop_locale_category_key" ON "CulturalContext"("shop", "locale", "category");

-- CreateIndex
CREATE INDEX "ConsentRecord_shop_idx" ON "ConsentRecord"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "ConsentRecord_shop_purpose_key" ON "ConsentRecord"("shop", "purpose");

-- CreateIndex
CREATE INDEX "DataAccessLog_shop_createdAt_idx" ON "DataAccessLog"("shop", "createdAt");

-- CreateIndex
CREATE INDEX "DataAccessLog_action_idx" ON "DataAccessLog"("action");

-- CreateIndex
CREATE UNIQUE INDEX "DataRetentionPolicy_shop_dataType_key" ON "DataRetentionPolicy"("shop", "dataType");
