/**
 * GET /api/privacy/export
 *
 * Returns a GDPR-compliant data export for the authenticated shop.
 * Accepts an optional `format` query param: "json" (default) or "csv".
 */

import { type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import {
  exportShopData,
  formatExportAsJson,
  formatExportAsCsv,
} from "../services/privacy/data-export";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  const url = new URL(request.url);
  const format = url.searchParams.get("format") ?? "json";

  const exportData = await exportShopData(shop);

  if (format === "csv") {
    const csv = formatExportAsCsv(exportData);
    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="gdpr-export-${shop}-${exportData.exportedAt.slice(0, 10)}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const jsonStr = formatExportAsJson(exportData);
  return new Response(jsonStr, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="gdpr-export-${shop}-${exportData.exportedAt.slice(0, 10)}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
