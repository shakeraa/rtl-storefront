/**
 * Calendar Events API Route
 * T0005: Regional Calendar - Hijri Calendar & Seasonal Events
 *
 * GET  /api/calendar/events  — Returns upcoming events for the shop's region
 * POST /api/calendar/events  — Creates or updates a custom campaign event
 */

import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import {
  detectUpcomingCampaigns,
  getActiveCampaigns,
  scheduleCampaign,
  getTemplateByType,
  type CampaignEvent,
} from "../services/calendar/events";
import {
  getUpcomingEvents,
  toHijri,
  getDaysUntilRamadan,
  getEidCountdown,
  getNationalDay,
} from "../services/calendar/hijri";

// ---------------------------------------------------------------------------
// GET loader — upcoming events for the shop's region
// ---------------------------------------------------------------------------

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);

  const url = new URL(request.url);
  const country = url.searchParams.get("country") ?? "SA";
  const daysAhead = parseInt(url.searchParams.get("days") ?? "90", 10);
  const includeHijri = url.searchParams.get("hijri") !== "false";

  const now = new Date();

  // Hijri date for today
  const todayHijri = toHijri(now);

  // Upcoming Islamic events
  const upcomingIslamicEvents = getUpcomingEvents(now, daysAhead);

  // Campaign events (upcoming + active)
  const upcomingCampaigns = detectUpcomingCampaigns(now);
  const activeCampaigns = getActiveCampaigns(now);

  // Filter campaigns by country
  const filteredUpcoming = upcomingCampaigns.filter(
    (c) => c.countries.includes(country) || c.countries.length === 0
  );
  const filteredActive = activeCampaigns.filter(
    (c) => c.countries.includes(country) || c.countries.length === 0
  );

  // Countdowns
  const daysUntilRamadan = getDaysUntilRamadan(now);
  const eidCountdown = getEidCountdown(now);

  // National days for the current year
  const nationalDays = {
    UAE: getNationalDay("AE", now.getFullYear()),
    Saudi: getNationalDay("SA", now.getFullYear()),
  };

  return json({
    shop: session.shop,
    country,
    today: {
      gregorian: now.toISOString(),
      hijri: includeHijri ? todayHijri : null,
    },
    countdowns: {
      daysUntilRamadan,
      daysUntilEidFitr: eidCountdown.eidFitr,
      daysUntilEidAdha: eidCountdown.eidAdha,
    },
    islamicEvents: upcomingIslamicEvents.slice(0, 10).map((e) => ({
      id: e.id,
      nameEn: e.nameEn,
      nameAr: e.nameAr,
      gregorianDate: e.gregorianDate?.toISOString() ?? null,
      type: e.type,
    })),
    campaigns: {
      active: filteredActive,
      upcoming: filteredUpcoming,
    },
    nationalDays: {
      UAE: nationalDays.UAE?.toISOString() ?? null,
      Saudi: nationalDays.Saudi?.toISOString() ?? null,
    },
  });
}

// ---------------------------------------------------------------------------
// POST action — create or update a custom event
// ---------------------------------------------------------------------------

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  let body: Partial<CampaignEvent>;

  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Validate required fields
  const { id, name, nameAr, startDate, endDate, type, countries, template } = body;

  if (!id || !name || !startDate || !endDate || !type || !countries || !template) {
    return json(
      {
        error: "Missing required fields: id, name, startDate, endDate, type, countries, template",
      },
      { status: 400 }
    );
  }

  const event: CampaignEvent = {
    id: String(id),
    name: String(name),
    nameAr: nameAr ? String(nameAr) : String(name),
    startDate: new Date(startDate as unknown as string),
    endDate: new Date(endDate as unknown as string),
    type,
    countries: Array.isArray(countries) ? countries : [String(countries)],
    template: String(template),
    autoSchedule: body.autoSchedule ?? false,
    discount: body.discount,
  };

  // Validate dates
  if (isNaN(event.startDate.getTime()) || isNaN(event.endDate.getTime())) {
    return json({ error: "Invalid startDate or endDate" }, { status: 400 });
  }

  if (event.endDate <= event.startDate) {
    return json({ error: "endDate must be after startDate" }, { status: 400 });
  }

  // Schedule the campaign
  const scheduleResult = scheduleCampaign(event);

  // Resolve associated template
  const resolvedTemplate = getTemplateByType(type);

  return json(
    {
      success: scheduleResult.success,
      message: scheduleResult.message,
      shop: session.shop,
      event: {
        ...event,
        startDate: event.startDate.toISOString(),
        endDate: event.endDate.toISOString(),
      },
      template: resolvedTemplate ?? null,
    },
    { status: 201 }
  );
}
