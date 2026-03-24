import db from "../db.server";

/**
 * Set the current shop context for PostgreSQL Row-Level Security.
 * Call this at the beginning of every authenticated request.
 *
 * This sets `app.current_shop` in the PostgreSQL session,
 * which RLS policies use to filter data.
 */
export async function setTenantContext(shop: string): Promise<void> {
  if (!shop) return;
  // Set the session-level variable for RLS
  await db.$executeRawUnsafe(
    `SET LOCAL app.current_shop = '${shop.replace(/'/g, "''")}'`
  );
}
