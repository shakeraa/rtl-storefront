-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL DEFAULT '',
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,
    "refreshToken" TEXT,
    "refreshTokenExpires" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TranslationCache" (
    "id" TEXT NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "sourceLocale" TEXT NOT NULL,
    "targetLocale" TEXT NOT NULL,
    "sourceText" TEXT NOT NULL,
    "translatedText" TEXT NOT NULL,
    "context" TEXT,
    "shop" TEXT NOT NULL DEFAULT '',
    "hits" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TranslationCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TranslationMemory" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "sourceLocale" TEXT NOT NULL,
    "targetLocale" TEXT NOT NULL,
    "sourceText" TEXT NOT NULL,
    "translatedText" TEXT NOT NULL,
    "context" TEXT,
    "category" TEXT,
    "quality" INTEGER NOT NULL DEFAULT 100,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TranslationMemory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlossaryEntry" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "sourceLocale" TEXT NOT NULL,
    "targetLocale" TEXT NOT NULL,
    "sourceTerm" TEXT NOT NULL,
    "translatedTerm" TEXT NOT NULL,
    "neverTranslate" BOOLEAN NOT NULL DEFAULT false,
    "caseSensitive" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GlossaryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CulturalContext" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "dialect" TEXT,
    "formalityLevel" TEXT NOT NULL DEFAULT 'formal',
    "culturalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CulturalContext_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsentRecord" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT false,
    "grantedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataAccessLog" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "performedBy" TEXT,
    "details" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DataAccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataRetentionPolicy" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "retentionDays" INTEGER NOT NULL DEFAULT 365,
    "autoDelete" BOOLEAN NOT NULL DEFAULT false,
    "lastCleanup" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataRetentionPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "priceInCents" INTEGER NOT NULL,
    "trialDays" INTEGER NOT NULL DEFAULT 14,
    "maxLanguages" INTEGER NOT NULL,
    "maxWordsPerMonth" INTEGER NOT NULL,
    "features" TEXT NOT NULL DEFAULT '[]',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopSubscription" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "planId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'trial',
    "shopifyChargeId" TEXT,
    "trialStartedAt" TIMESTAMP(3),
    "trialEndsAt" TIMESTAMP(3),
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopUsage" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "wordsUsed" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TranslationUsage" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT,
    "characters" INTEGER NOT NULL,
    "words" INTEGER NOT NULL,
    "apiCalls" INTEGER NOT NULL DEFAULT 1,
    "costCents" INTEGER NOT NULL DEFAULT 0,
    "costPer1kChars" DOUBLE PRECISION NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TranslationUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TranslationAlert" (
    "id" TEXT NOT NULL,
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
    "dismissedAt" TIMESTAMP(3),
    "dismissedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TranslationAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "templateType" TEXT NOT NULL,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "inAppEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertConfiguration" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "enableInApp" BOOLEAN NOT NULL DEFAULT true,
    "enableEmail" BOOLEAN NOT NULL DEFAULT false,
    "emailDigestFrequency" TEXT NOT NULL DEFAULT 'weekly',
    "emailRecipients" TEXT NOT NULL DEFAULT '[]',
    "untranslatedCritical" INTEGER NOT NULL DEFAULT 50,
    "untranslatedWarning" INTEGER NOT NULL DEFAULT 10,
    "coverageDropPercent" INTEGER NOT NULL DEFAULT 5,
    "staleTranslationDays" INTEGER NOT NULL DEFAULT 90,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlertConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopSettings" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "aiProvider" TEXT NOT NULL DEFAULT 'openai',
    "openaiApiKey" TEXT,
    "deeplApiKey" TEXT,
    "googleAccessToken" TEXT,
    "googleProjectId" TEXT,
    "azureTranslatorKey" TEXT,
    "azureTranslatorRegion" TEXT,
    "awsAccessKeyId" TEXT,
    "awsSecretAccessKey" TEXT,
    "awsRegion" TEXT,
    "anthropicApiKey" TEXT,
    "libreTranslateUrl" TEXT,
    "libreTranslateApiKey" TEXT,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamInvite" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "invitedBy" TEXT NOT NULL,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "resentAt" TIMESTAMP(3),
    "resentCount" INTEGER NOT NULL DEFAULT 0,
    "emailError" TEXT,

    CONSTRAINT "TeamInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL,
    "invitedBy" TEXT NOT NULL,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "apiKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Session_shop_idx" ON "Session"("shop");

-- CreateIndex
CREATE INDEX "Session_expires_idx" ON "Session"("expires");

-- CreateIndex
CREATE UNIQUE INDEX "TranslationCache_cacheKey_key" ON "TranslationCache"("cacheKey");

-- CreateIndex
CREATE INDEX "TranslationCache_sourceLocale_targetLocale_idx" ON "TranslationCache"("sourceLocale", "targetLocale");

-- CreateIndex
CREATE INDEX "TranslationCache_expiresAt_idx" ON "TranslationCache"("expiresAt");

-- CreateIndex
CREATE INDEX "TranslationCache_shop_idx" ON "TranslationCache"("shop");

-- CreateIndex
CREATE INDEX "TranslationMemory_shop_sourceLocale_targetLocale_idx" ON "TranslationMemory"("shop", "sourceLocale", "targetLocale");

-- CreateIndex
CREATE INDEX "TranslationMemory_shop_sourceText_idx" ON "TranslationMemory"("shop", "sourceText");

-- CreateIndex
CREATE UNIQUE INDEX "TranslationMemory_shop_sourceLocale_targetLocale_sourceText_key" ON "TranslationMemory"("shop", "sourceLocale", "targetLocale", "sourceText");

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

-- CreateIndex
CREATE UNIQUE INDEX "BillingPlan_slug_key" ON "BillingPlan"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ShopSubscription_shop_key" ON "ShopSubscription"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "ShopSubscription_shopifyChargeId_key" ON "ShopSubscription"("shopifyChargeId");

-- CreateIndex
CREATE INDEX "ShopSubscription_status_idx" ON "ShopSubscription"("status");

-- CreateIndex
CREATE INDEX "ShopSubscription_planId_idx" ON "ShopSubscription"("planId");

-- CreateIndex
CREATE INDEX "ShopUsage_shop_idx" ON "ShopUsage"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "ShopUsage_shop_periodStart_key" ON "ShopUsage"("shop", "periodStart");

-- CreateIndex
CREATE INDEX "TranslationUsage_shop_createdAt_idx" ON "TranslationUsage"("shop", "createdAt");

-- CreateIndex
CREATE INDEX "TranslationUsage_shop_provider_idx" ON "TranslationUsage"("shop", "provider");

-- CreateIndex
CREATE INDEX "TranslationUsage_shop_resourceType_idx" ON "TranslationUsage"("shop", "resourceType");

-- CreateIndex
CREATE INDEX "TranslationUsage_createdAt_idx" ON "TranslationUsage"("createdAt");

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

-- CreateIndex
CREATE UNIQUE INDEX "ShopSettings_shop_key" ON "ShopSettings"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "TeamInvite_token_key" ON "TeamInvite"("token");

-- CreateIndex
CREATE INDEX "TeamInvite_shop_status_idx" ON "TeamInvite"("shop", "status");

-- CreateIndex
CREATE INDEX "TeamInvite_token_idx" ON "TeamInvite"("token");

-- CreateIndex
CREATE UNIQUE INDEX "TeamInvite_shop_email_key" ON "TeamInvite"("shop", "email");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_userId_key" ON "TeamMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_apiKey_key" ON "TeamMember"("apiKey");

-- CreateIndex
CREATE INDEX "TeamMember_shop_status_idx" ON "TeamMember"("shop", "status");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_shop_email_key" ON "TeamMember"("shop", "email");

-- AddForeignKey
ALTER TABLE "ShopSubscription" ADD CONSTRAINT "ShopSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "BillingPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
