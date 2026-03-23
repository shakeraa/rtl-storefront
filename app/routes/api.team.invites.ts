/**
 * Invitations API
 * T0016: Team & Access Control
 *
 * GET    /api/team/invites              — list all invites for the shop
 * POST   /api/team/invites              — create a new invite
 * PATCH  /api/team/invites?id=<id>      — resend an invite
 * DELETE /api/team/invites?id=<id>      — revoke an invite
 */

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import {
  createInvite,
  getInvites,
  resendInvite,
  revokeInvite,
} from "../services/team/invites.server";

// ---------------------------------------------------------------------------
// GET — list all invites
// ---------------------------------------------------------------------------

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const invites = await getInvites(shop);

  return json({ shop, invites });
}

// ---------------------------------------------------------------------------
// POST / PATCH / DELETE
// ---------------------------------------------------------------------------

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const userEmail = session.email || "owner";

  const url = new URL(request.url);
  const inviteId = url.searchParams.get("id");

  // ---- DELETE: revoke by id ----------------------------------------------
  if (request.method === "DELETE") {
    if (!inviteId) {
      return json({ error: "Missing required query parameter: id" }, { status: 400 });
    }

    try {
      const revoked = await revokeInvite(inviteId);
      if (!revoked) {
        return json({ error: "Invite not found" }, { status: 404 });
      }
      return json({ success: true, revoked: revoked.id });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to revoke invite";
      return json({ error: message }, { status: 400 });
    }
  }

  // ---- PATCH: resend invite ----------------------------------------------
  if (request.method === "PATCH") {
    if (!inviteId) {
      return json({ error: "Missing required query parameter: id" }, { status: 400 });
    }

    try {
      const resent = await resendInvite(inviteId, userEmail);
      return json({ success: true, resent: resent?.id });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to resend invite";
      return json({ error: message }, { status: 400 });
    }
  }

  // ---- POST: create invite -----------------------------------------------
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

    try {
      const invite = await createInvite(shop, email, role, userEmail);
      return json({ success: true, invite }, { status: 201 });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create invite";
      return json({ error: message }, { status: 400 });
    }
  }

  return json({ error: "Method not allowed" }, { status: 405 });
}
