-- CreateTable
CREATE TABLE "TranslationAlert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "resourceType" TEXT,
    "resourceId" TEXT,
    "count" INTEGER,
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "dismissedAt" DATETIME,
    "dismissedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "templateType" TEXT NOT NULL,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "inAppEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AlertConfiguration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "enableInApp" BOOLEAN NOT NULL DEFAULT true,
    "enableEmail" BOOLEAN NOT NULL DEFAULT false,
    "emailDigestFrequency" TEXT NOT NULL DEFAULT 'weekly',
    "emailRecipients" TEXT NOT NULL DEFAULT '[]',
    "untranslatedCritical" INTEGER NOT NULL DEFAULT 50,
    "untranslatedWarning" INTEGER NOT NULL DEFAULT 10,
    "coverageDropPercent" INTEGER NOT NULL DEFAULT 5,
    "staleTranslationDays" INTEGER NOT NULL DEFAULT 90,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "TranslationAlert_shop_dismissed_idx" ON "TranslationAlert"("shop", "dismissed");

-- CreateIndex
CREATE INDEX "TranslationAlert_shop_severity_idx" ON "TranslationAlert"("shop", "severity");

-- CreateIndex
CREATE INDEX "TranslationAlert_shop_createdAt_idx" ON "TranslationAlert"("shop", "createdAt");

-- CreateIndex
CREATE INDEX "TranslationAlert_dismissed_createdAt_idx" ON "TranslationAlert"("dismissed", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationPreference_shop_idx" ON "NotificationPreference"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_shop_templateType_key" ON "NotificationPreference"("shop", "templateType");

-- CreateIndex
CREATE UNIQUE INDEX "AlertConfiguration_shop_key" ON "AlertConfiguration"("shop");
