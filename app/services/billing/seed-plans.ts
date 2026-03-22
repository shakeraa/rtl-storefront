import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_PLANS = [
  {
    name: "Starter",
    slug: "starter",
    priceInCents: 999,
    trialDays: 14,
    maxLanguages: 2,
    maxWordsPerMonth: 5000,
    features: JSON.stringify(["basic_translation", "rtl_support"]),
    sortOrder: 1,
    isActive: true,
  },
  {
    name: "Professional",
    slug: "professional",
    priceInCents: 2499,
    trialDays: 14,
    maxLanguages: 10,
    maxWordsPerMonth: 50000,
    features: JSON.stringify([
      "basic_translation",
      "rtl_support",
      "glossary",
      "premium_ai",
    ]),
    sortOrder: 2,
    isActive: true,
  },
  {
    name: "Enterprise",
    slug: "enterprise",
    priceInCents: 5999,
    trialDays: 14,
    maxLanguages: -1,
    maxWordsPerMonth: -1,
    features: JSON.stringify([
      "basic_translation",
      "rtl_support",
      "glossary",
      "premium_ai",
      "team_collab",
      "mena_payments",
      "analytics",
      "priority_support",
    ]),
    sortOrder: 3,
    isActive: true,
  },
];

async function seed() {
  console.log("Seeding billing plans...");

  for (const plan of DEFAULT_PLANS) {
    await prisma.billingPlan.upsert({
      where: { slug: plan.slug },
      create: plan,
      update: plan,
    });
    console.log(`  Upserted plan: ${plan.name} ($${(plan.priceInCents / 100).toFixed(2)}/mo)`);
  }

  console.log("Billing plans seeded successfully.");
}

seed()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
