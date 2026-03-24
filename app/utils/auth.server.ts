import { authenticate } from "../shopify.server";
import { setTenantContext } from "./rls.server";
import { getTenantDb, type TenantDb } from "./tenant.server";

/**
 * Authenticate the request and set up tenant isolation.
 * Use this instead of calling authenticate.admin() directly.
 *
 * Returns the standard Shopify auth context plus a tenant-scoped DB.
 */
export async function authenticateWithTenant(request: Request) {
  const auth = await authenticate.admin(request);
  const shop = auth.session.shop;

  // Set PostgreSQL RLS context
  await setTenantContext(shop).catch(() => {
    // RLS is defense-in-depth; don't block if it fails
    console.warn("Failed to set RLS context for", shop);
  });

  const tenantDb = getTenantDb(shop);

  return { ...auth, shop, tenantDb };
}
