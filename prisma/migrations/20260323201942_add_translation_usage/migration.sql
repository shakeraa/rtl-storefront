-- CreateTable
CREATE TABLE "TranslationUsage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT,
    "characters" INTEGER NOT NULL,
    "words" INTEGER NOT NULL,
    "apiCalls" INTEGER NOT NULL DEFAULT 1,
    "costCents" INTEGER NOT NULL DEFAULT 0,
    "costPer1kChars" REAL NOT NULL,
    "responseTimeMs" INTEGER,
    "sourceLocale" TEXT NOT NULL,
    "targetLocale" TEXT NOT NULL,
    "resourceType" TEXT,
    "resourceId" TEXT,
    "contentType" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "qualityScore" INTEGER,
    "cached" BOOLEAN NOT NULL DEFAULT false,
    "glossaryUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "TranslationUsage_shop_createdAt_idx" ON "TranslationUsage"("shop", "createdAt");

-- CreateIndex
CREATE INDEX "TranslationUsage_shop_provider_idx" ON "TranslationUsage"("shop", "provider");

-- CreateIndex
CREATE INDEX "TranslationUsage_shop_resourceType_idx" ON "TranslationUsage"("shop", "resourceType");

-- CreateIndex
CREATE INDEX "TranslationUsage_createdAt_idx" ON "TranslationUsage"("createdAt");
