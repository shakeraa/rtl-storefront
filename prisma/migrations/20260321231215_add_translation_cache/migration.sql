-- CreateTable
CREATE TABLE "TranslationCache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cacheKey" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "sourceLocale" TEXT NOT NULL,
    "targetLocale" TEXT NOT NULL,
    "sourceText" TEXT NOT NULL,
    "translatedText" TEXT NOT NULL,
    "context" TEXT,
    "hits" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "TranslationCache_cacheKey_key" ON "TranslationCache"("cacheKey");

-- CreateIndex
CREATE INDEX "TranslationCache_sourceLocale_targetLocale_idx" ON "TranslationCache"("sourceLocale", "targetLocale");

-- CreateIndex
CREATE INDEX "TranslationCache_expiresAt_idx" ON "TranslationCache"("expiresAt");
