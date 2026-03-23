-- AlterTable
ALTER TABLE "ShopSettings" ADD COLUMN "anthropicApiKey" TEXT;
ALTER TABLE "ShopSettings" ADD COLUMN "awsAccessKeyId" TEXT;
ALTER TABLE "ShopSettings" ADD COLUMN "awsRegion" TEXT;
ALTER TABLE "ShopSettings" ADD COLUMN "awsSecretAccessKey" TEXT;
ALTER TABLE "ShopSettings" ADD COLUMN "azureTranslatorKey" TEXT;
ALTER TABLE "ShopSettings" ADD COLUMN "azureTranslatorRegion" TEXT;
ALTER TABLE "ShopSettings" ADD COLUMN "libreTranslateApiKey" TEXT;
ALTER TABLE "ShopSettings" ADD COLUMN "libreTranslateUrl" TEXT;
