/**
 * Remix route: /robots.txt
 *
 * Returns a robots.txt file that:
 * - Allows all locale-prefixed paths
 * - Disallows admin/cart/checkout/account paths
 * - References per-locale sitemaps
 *
 * The route name uses Remix's escape syntax `[robots.txt]` so that the
 * dot is treated as a literal character rather than a route separator.
 */

import type { LoaderFunctionArgs } from "@remix-run/node";
import { generateRobotsTxt } from "../services/seo-infrastructure";

const DEFAULT_LOCALES = ["en", "ar", "he"];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  const content = generateRobotsTxt({
    shop: url.host,
    defaultLocale: DEFAULT_LOCALES[0],
    locales: DEFAULT_LOCALES,
    baseUrl,
  });

  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
};
