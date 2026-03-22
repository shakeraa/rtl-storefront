import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  console.log("Seeding database...");

  // Seed billing plans
  const plans = [
    { name: "Starter", slug: "starter", priceInCents: 999, trialDays: 14, maxLanguages: 2, maxWordsPerMonth: 5000, features: JSON.stringify(["basic_translation", "rtl_support"]), sortOrder: 1 },
    { name: "Professional", slug: "professional", priceInCents: 2499, trialDays: 14, maxLanguages: 10, maxWordsPerMonth: 50000, features: JSON.stringify(["basic_translation", "rtl_support", "glossary", "premium_ai"]), sortOrder: 2 },
    { name: "Enterprise", slug: "enterprise", priceInCents: 5999, trialDays: 14, maxLanguages: -1, maxWordsPerMonth: -1, features: JSON.stringify(["basic_translation", "rtl_support", "glossary", "premium_ai", "team_collab", "mena_payments", "analytics", "priority_support"]), sortOrder: 3 },
  ];

  for (const plan of plans) {
    await prisma.billingPlan.upsert({
      where: { slug: plan.slug },
      create: plan,
      update: plan,
    });
    console.log(`  Plan: ${plan.name} ($${(plan.priceInCents / 100).toFixed(2)}/mo)`);
  }

  // Seed sample glossary entries for demo
  const glossaryEntries = [
    { shop: "demo", sourceLocale: "en", targetLocale: "ar", sourceTerm: "Abaya", translatedTerm: "عباية", neverTranslate: false, caseSensitive: false, category: "fashion" },
    { shop: "demo", sourceLocale: "en", targetLocale: "ar", sourceTerm: "Hijab", translatedTerm: "حجاب", neverTranslate: false, caseSensitive: false, category: "fashion" },
    { shop: "demo", sourceLocale: "en", targetLocale: "ar", sourceTerm: "Add to Cart", translatedTerm: "أضف إلى السلة", neverTranslate: false, caseSensitive: false, category: "ui" },
    { shop: "demo", sourceLocale: "en", targetLocale: "he", sourceTerm: "Add to Cart", translatedTerm: "הוסף לעגלה", neverTranslate: false, caseSensitive: false, category: "ui" },
  ];

  for (const entry of glossaryEntries) {
    await prisma.glossaryEntry.upsert({
      where: { shop_sourceLocale_targetLocale_sourceTerm: { shop: entry.shop, sourceLocale: entry.sourceLocale, targetLocale: entry.targetLocale, sourceTerm: entry.sourceTerm } },
      create: entry,
      update: entry,
    });
    console.log(`  Glossary: ${entry.sourceTerm} → ${entry.translatedTerm}`);
  }

  console.log("Seed complete.");
}

seed()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
