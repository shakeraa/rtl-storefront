/**
 * Catch-all API route for third-party integrations
 * T0014: Integrations - Shopify Ecosystem & Third-Party Apps
 *
 * GET  /api/integrations/:id          — status / info for a single integration
 * GET  /api/integrations              — list all integrations
 * POST /api/integrations/:id/sync     — trigger a sync for the integration
 * POST /api/integrations/:id/translate — translate content via the integration
 *
 * Route file: api.integrations.$.ts  (Remix catch-all via "$" splat)
 */

import {
  json,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { registry } from "../services/integrations/registry";
import { extractPageFlyContent, translatePageFlyPage } from "../services/integrations/pagefly";
import {
  fetchJudgeMeReviews,
  translateJudgeMeReviews,
} from "../services/integrations/judgeme";
import {
  translateKlaviyoTemplate,
  fetchKlaviyoTemplate,
} from "../services/integrations/klaviyo";
import {
  fetchZendeskArticles,
  translateZendeskArticles,
} from "../services/integrations/zendesk";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntegrationPath(pathname: string): {
  integrationId: string | null;
  action: string | null;
} {
  // pathname examples:
  //   /api/integrations
  //   /api/integrations/pagefly
  //   /api/integrations/pagefly/translate
  const segments = pathname.split('/').filter(Boolean);
  // segments[0] === "api", segments[1] === "integrations"
  const integrationId = segments[2] ?? null;
  const action = segments[3] ?? null;
  return { integrationId, action };
}

// ---------------------------------------------------------------------------
// GET loader — status / list
// ---------------------------------------------------------------------------

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);

  const url = new URL(request.url);
  const { integrationId } = parseIntegrationPath(url.pathname);

  if (!integrationId) {
    // Return all registered integrations
    return json({
      integrations: registry.getAll().map((i) => ({
        id: i.id,
        name: i.name,
        enabled: i.enabled,
        category: i.category,
      })),
    });
  }

  const integration = registry.get(integrationId);
  if (!integration) {
    return json({ error: `Integration '${integrationId}' not found` }, { status: 404 });
  }

  return json({
    id: integration.id,
    name: integration.name,
    enabled: integration.enabled,
    category: integration.category,
    status: integration.enabled ? 'connected' : 'available',
  });
}

// ---------------------------------------------------------------------------
// POST action — sync / translate / configure
// ---------------------------------------------------------------------------

export async function action({ request }: ActionFunctionArgs) {
  await authenticate.admin(request);

  const url = new URL(request.url);
  const { integrationId, action: routeAction } = parseIntegrationPath(url.pathname);

  if (!integrationId) {
    return json({ error: 'Integration ID is required' }, { status: 400 });
  }

  const integration = registry.get(integrationId);
  if (!integration) {
    return json({ error: `Integration '${integrationId}' not found` }, { status: 404 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    // body may be empty for some actions
  }

  // --- configure ---
  if (routeAction === 'configure') {
    const config = (body.config as Record<string, unknown>) ?? {};
    integration.configure(config);
    return json({ success: true, id: integrationId, enabled: integration.enabled });
  }

  // --- translate ---
  if (routeAction === 'translate') {
    const locale = (body.locale as string) ?? 'ar';
    return handleTranslate(integrationId, body, locale);
  }

  // --- sync ---
  if (routeAction === 'sync' || !routeAction) {
    return handleSync(integrationId, body, integration);
  }

  return json({ error: `Unknown action '${routeAction}'` }, { status: 400 });
}

// ---------------------------------------------------------------------------
// Route-specific translate handlers
// ---------------------------------------------------------------------------

async function handleTranslate(
  integrationId: string,
  body: Record<string, unknown>,
  locale: string
): Promise<Response> {
  switch (integrationId) {
    case 'pagefly': {
      const page = body.page as {
        pageId: string;
        handle: string;
        content: string;
      } | undefined;

      if (!page) {
        return json({ error: 'Missing page object in request body' }, { status: 400 });
      }

      const result = await translatePageFlyPage(page, locale);
      return json({ success: true, result });
    }

    case 'judgeme': {
      const reviews = body.reviews as Array<{
        id: string;
        productId: string;
        productHandle: string;
        author: string;
        rating: number;
        body: string;
        createdAt: string;
      }> | undefined;

      if (!reviews) {
        return json({ error: 'Missing reviews array in request body' }, { status: 400 });
      }

      const translated = await translateJudgeMeReviews(reviews, locale);
      return json({ success: true, translated });
    }

    case 'klaviyo': {
      const template = body.template as {
        id: string;
        name: string;
        subject: string;
        html: string;
        text?: string;
      } | undefined;

      if (!template) {
        return json({ error: 'Missing template object in request body' }, { status: 400 });
      }

      const result = await translateKlaviyoTemplate(template, locale);
      return json({ success: true, result });
    }

    case 'zendesk': {
      const articles = body.articles as Array<{
        id: string;
        title: string;
        body: string;
        locale: string;
      }> | undefined;

      if (!articles) {
        return json({ error: 'Missing articles array in request body' }, { status: 400 });
      }

      const translated = await translateZendeskArticles(articles, locale);
      return json({ success: true, translated });
    }

    default:
      return json(
        { error: `Translation not supported for integration '${integrationId}'` },
        { status: 422 }
      );
  }
}

// ---------------------------------------------------------------------------
// Sync handlers — fetch latest content from the third-party app
// ---------------------------------------------------------------------------

async function handleSync(
  integrationId: string,
  body: Record<string, unknown>,
  _integration: ReturnType<typeof registry.get>
): Promise<Response> {
  switch (integrationId) {
    case 'pagefly': {
      // PageFly content is provided in the request body (sourced from metafields)
      const page = body.page as { pageId: string; handle: string; content: string } | undefined;
      if (!page) {
        return json({ error: 'Missing page in request body' }, { status: 400 });
      }
      const segments = extractPageFlyContent(page);
      return json({ success: true, segments });
    }

    case 'judgeme': {
      const apiConfig = body.config as {
        apiToken: string;
        shopDomain: string;
      } | undefined;

      if (!apiConfig?.apiToken || !apiConfig?.shopDomain) {
        return json(
          { error: 'Missing judgeme config: apiToken and shopDomain are required' },
          { status: 400 }
        );
      }

      const reviews = await fetchJudgeMeReviews(apiConfig, {
        productHandle: body.productHandle as string | undefined,
        page: (body.page as number) ?? 1,
        perPage: (body.perPage as number) ?? 50,
      });

      return json({ success: true, reviews, count: reviews.length });
    }

    case 'klaviyo': {
      const apiConfig = body.config as { apiKey: string } | undefined;
      if (!apiConfig?.apiKey) {
        return json({ error: 'Missing klaviyo config: apiKey is required' }, { status: 400 });
      }

      if (body.templateId) {
        const template = await fetchKlaviyoTemplate(apiConfig, body.templateId as string);
        return json({ success: true, template });
      }

      return json({ success: true, message: 'Provide templateId to fetch a specific template' });
    }

    case 'zendesk': {
      const apiConfig = body.config as {
        subdomain: string;
        email: string;
        apiToken: string;
      } | undefined;

      if (!apiConfig?.subdomain || !apiConfig?.email || !apiConfig?.apiToken) {
        return json(
          { error: 'Missing zendesk config: subdomain, email and apiToken are required' },
          { status: 400 }
        );
      }

      const articles = await fetchZendeskArticles(apiConfig, {
        locale: (body.locale as string) ?? 'en-us',
        sectionId: body.sectionId as string | undefined,
      });

      return json({ success: true, articles, count: articles.length });
    }

    default:
      return json({ success: true, message: `Sync acknowledged for '${integrationId}'` });
  }
}
