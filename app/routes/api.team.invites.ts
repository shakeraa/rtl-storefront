/**
 * Invitations API
 * T0016: Team & Access Control
 *
 * GET    /api/team/invites          — list pending invites for the shop
 * POST   /api/team/invites          — create a new invite
 * DELETE /api/team/invites?id=<id>  — revoke an invite
 */

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import {
  createInvite,
  getPendingInvites,
  revokeInvite,
} from "../services/team/invites";

// ---------------------------------------------------------------------------
// GET — list pending invites
// ---------------------------------------------------------------------------

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const invites = await getPendingInvites(shop);

  return json({ shop, invites });
}

// ---------------------------------------------------------------------------
// POST / DELETE — create or revoke invite
// ---------------------------------------------------------------------------

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  // ---- DELETE: revoke by id ------------------------------------------------
  if (request.method === "DELETE") {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return json({ error: "Missing required query parameter: id" }, { status: 400 });
    }

    await revokeInvite(id);
    return json({ success: true, revoked: id });
  }

  // ---- POST: create invite -------------------------------------------------
  if (request.method === "POST") {
    let body: { email?: string; role?: string };

    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      body = (await request.json()) as { email?: string; role?: string };
    } else {
      const formData = await request.formData();
      body = {
        email: (formData.get("email") as string | null) ?? undefined,
        role: (formData.get("role") as string | null) ?? undefined,
      };
    }

    const { email, role } = body;

    if (!email || !role) {
      return json(
        { error: "Missing required fields: email, role" },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return json({ error: "Invalid email address" }, { status: 422 });
    }

    const validRoles = ["admin", "manager", "translator", "viewer"];
    if (!validRoles.includes(role)) {
      return json(
        {
          error: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
        },
        { status: 422 },
      );
    }

    const invite = await createInvite(shop, email, role);

    return json({ success: true, invite }, { status: 201 });
  }

  return json({ error: "Method not allowed" }, { status: 405 });
}
