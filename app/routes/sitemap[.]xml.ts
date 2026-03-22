/**
 * Remix route: /sitemap.xml
 *
 * Returns a multi-language XML sitemap for the storefront.
 * Content-Type is set to application/xml.
 *
 * In production the loader would query Shopify for real products,
 * collections and pages, then generate per-locale entries.  This
 * implementation provides the correct structure and can be extended
 * with live data by replacing the `staticPages` array.
 */

import type { LoaderFunctionArgs } from "@remix-run/node";
import { generateSitemapXml } from "../services/sitemap/generator";

const DEFAULT_LOCALES = ["en", "ar", "he"];
const DEFAULT_BASE_URL = process.env.SHOPIFY_APP_URL ?? "https://example.myshopify.com";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  // Static page set — extend with dynamic Shopify data in production.
  const staticPages = [
    { path: "/", priority: 1.0, changefreq: "daily" as const },
    { path: "/products", priority: 0.9, changefreq: "daily" as const },
    { path: "/collections", priority: 0.8, changefreq: "weekly" as const },
    { path: "/pages/about", priority: 0.5, changefreq: "monthly" as const },
    { path: "/pages/contact", priority: 0.5, changefreq: "monthly" as const },
  ];

  const xml = generateSitemapXml({
    pages: staticPages,
    config: {
      baseUrl,
      defaultLocale: DEFAULT_LOCALES[0],
      locales: DEFAULT_LOCALES,
    },
  });

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
};
