import db from "../db.server";

/**
 * Tenant-isolated Prisma query wrapper.
 * Ensures all queries are scoped to the authenticated shop.
 *
 * Usage in loaders/actions:
 *   const tenant = getTenantDb(session.shop);
 *   const entries = await tenant.glossaryEntry.findMany();
 *   // Automatically filtered by shop
 */
export function getTenantDb(shop: string) {
  if (!shop) {
    throw new Error("Shop identifier is required for tenant isolation");
  }

  return {
    // Translation
    translationCache: {
      findMany: (args?: any) => db.translationCache.findMany({ ...args, where: { ...args?.where, shop } }),
      findFirst: (args?: any) => db.translationCache.findFirst({ ...args, where: { ...args?.where, shop } }),
      create: (args: any) => db.translationCache.create({ ...args, data: { ...args.data, shop } }),
      update: (args: any) => db.translationCache.update(args),
      upsert: (args: any) => db.translationCache.upsert({ ...args, create: { ...args.create, shop } }),
      deleteMany: (args?: any) => db.translationCache.deleteMany({ ...args, where: { ...args?.where, shop } }),
      count: (args?: any) => db.translationCache.count({ ...args, where: { ...args?.where, shop } }),
    },
    translationMemory: {
      findMany: (args?: any) => db.translationMemory.findMany({ ...args, where: { ...args?.where, shop } }),
      findFirst: (args?: any) => db.translationMemory.findFirst({ ...args, where: { ...args?.where, shop } }),
      create: (args: any) => db.translationMemory.create({ ...args, data: { ...args.data, shop } }),
      upsert: (args: any) => db.translationMemory.upsert({ ...args, create: { ...args.create, shop } }),
      deleteMany: (args?: any) => db.translationMemory.deleteMany({ ...args, where: { ...args?.where, shop } }),
      count: (args?: any) => db.translationMemory.count({ ...args, where: { ...args?.where, shop } }),
    },
    glossaryEntry: {
      findMany: (args?: any) => db.glossaryEntry.findMany({ ...args, where: { ...args?.where, shop } }),
      findFirst: (args?: any) => db.glossaryEntry.findFirst({ ...args, where: { ...args?.where, shop } }),
      create: (args: any) => db.glossaryEntry.create({ ...args, data: { ...args.data, shop } }),
      update: (args: any) => db.glossaryEntry.update(args),
      upsert: (args: any) => db.glossaryEntry.upsert({ ...args, create: { ...args.create, shop } }),
      delete: (args: any) => db.glossaryEntry.delete(args),
      deleteMany: (args?: any) => db.glossaryEntry.deleteMany({ ...args, where: { ...args?.where, shop } }),
      count: (args?: any) => db.glossaryEntry.count({ ...args, where: { ...args?.where, shop } }),
    },
    shopSettings: {
      findUnique: (args?: any) => db.shopSettings.findUnique({ where: { shop } }),
      upsert: (args: any) => db.shopSettings.upsert({ where: { shop }, ...args }),
      update: (args: any) => db.shopSettings.update({ where: { shop }, ...args }),
      create: (args: any) => db.shopSettings.create({ ...args, data: { ...args.data, shop } }),
    },
    translationUsage: {
      findMany: (args?: any) => db.translationUsage.findMany({ ...args, where: { ...args?.where, shop } }),
      create: (args: any) => db.translationUsage.create({ ...args, data: { ...args.data, shop } }),
      deleteMany: (args?: any) => db.translationUsage.deleteMany({ ...args, where: { ...args?.where, shop } }),
      count: (args?: any) => db.translationUsage.count({ ...args, where: { ...args?.where, shop } }),
    },
    translationAlert: {
      findMany: (args?: any) => db.translationAlert.findMany({ ...args, where: { ...args?.where, shop } }),
      create: (args: any) => db.translationAlert.create({ ...args, data: { ...args.data, shop } }),
      update: (args: any) => db.translationAlert.update(args),
      updateMany: (args: any) => db.translationAlert.updateMany({ ...args, where: { ...args?.where, shop } }),
      deleteMany: (args?: any) => db.translationAlert.deleteMany({ ...args, where: { ...args?.where, shop } }),
      count: (args?: any) => db.translationAlert.count({ ...args, where: { ...args?.where, shop } }),
    },
    teamInvite: {
      findMany: (args?: any) => db.teamInvite.findMany({ ...args, where: { ...args?.where, shop } }),
      findFirst: (args?: any) => db.teamInvite.findFirst({ ...args, where: { ...args?.where, shop } }),
      create: (args: any) => db.teamInvite.create({ ...args, data: { ...args.data, shop } }),
      update: (args: any) => db.teamInvite.update(args),
      deleteMany: (args?: any) => db.teamInvite.deleteMany({ ...args, where: { ...args?.where, shop } }),
    },
    teamMember: {
      findMany: (args?: any) => db.teamMember.findMany({ ...args, where: { ...args?.where, shop } }),
      findFirst: (args?: any) => db.teamMember.findFirst({ ...args, where: { ...args?.where, shop } }),
      create: (args: any) => db.teamMember.create({ ...args, data: { ...args.data, shop } }),
      update: (args: any) => db.teamMember.update(args),
      deleteMany: (args?: any) => db.teamMember.deleteMany({ ...args, where: { ...args?.where, shop } }),
    },
    session: {
      findMany: (args?: any) => db.session.findMany({ ...args, where: { ...args?.where, shop } }),
      deleteMany: (args?: any) => db.session.deleteMany({ ...args, where: { ...args?.where, shop } }),
    },
    shopSubscription: {
      findUnique: (args?: any) => db.shopSubscription.findUnique({ where: { shop } }),
      upsert: (args: any) => db.shopSubscription.upsert({ where: { shop }, ...args }),
      update: (args: any) => db.shopSubscription.update({ where: { shop }, ...args }),
      create: (args: any) => db.shopSubscription.create({ ...args, data: { ...args.data, shop } }),
    },
    // Global tables (no shop scoping needed)
    billingPlan: db.billingPlan,
  };
}

export type TenantDb = ReturnType<typeof getTenantDb>;
