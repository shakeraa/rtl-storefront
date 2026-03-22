-- CreateTable
CREATE TABLE "ShopSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "aiProvider" TEXT NOT NULL DEFAULT 'openai',
    "sourceLocale" TEXT NOT NULL DEFAULT 'en',
    "targetLocales" TEXT NOT NULL DEFAULT '["ar","he"]',
    "autoDetectRTL" BOOLEAN NOT NULL DEFAULT true,
    "arabicFont" TEXT NOT NULL DEFAULT 'noto-sans-arabic',
    "hebrewFont" TEXT NOT NULL DEFAULT 'heebo',
    "farsiFont" TEXT NOT NULL DEFAULT 'vazirmatn',
    "enableTM" BOOLEAN NOT NULL DEFAULT true,
    "fuzzyThreshold" INTEGER NOT NULL DEFAULT 80,
    "autoSuggest" BOOLEAN NOT NULL DEFAULT true,
    "qualityReview" BOOLEAN NOT NULL DEFAULT false,
    "confidenceThreshold" INTEGER NOT NULL DEFAULT 70,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ShopSettings_shop_key" ON "ShopSettings"("shop");
