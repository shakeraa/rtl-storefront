/**
 * Team Invitation Service
 * T0016: Team & Access Control — invitation system with email and status tracking
 */

import db from "../../db.server";
import { sendTeamInviteEmail, sendInviteResentEmail } from "../email";

export interface TeamInvite {
  id: string;
  shop: string;
  email: string;
  role: string;
  token: string;
  status: "pending" | "sent" | "accepted" | "expired" | "revoked";
  invitedBy: string;
  invitedAt: Date;
  expiresAt: Date;
  sentAt?: Date;
  acceptedAt?: Date;
  revokedAt?: Date;
  resentAt?: Date;
  resentCount: number;
  emailError?: string;
}

/**
 * Generate a cryptographically secure random token.
 */
function generateToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Build the invite acceptance URL
 */
function buildInviteUrl(shop: string, token: string): string {
  const appUrl = process.env.SHOPIFY_APP_URL || "";
  return `${appUrl}/auth/invite?shop=${encodeURIComponent(shop)}&token=${token}`;
}

/**
 * Create a new team invite and send email
 */
export async function createInvite(
  shop: string,
  email: string,
  role: string,
  invitedBy: string,
): Promise<TeamInvite> {
  // Check if there's an existing pending invite
  const existing = await db.teamInvite.findUnique({
    where: { shop_email: { shop, email } },
  });

  if (existing && existing.status === "pending") {
    throw new Error("An invitation is already pending for this email");
  }

  // Create the invite
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  const invite = await db.teamInvite.create({
    data: {
      shop,
      email,
      role,
      token: generateToken(),
      status: "pending",
      invitedBy,
      expiresAt,
      resentCount: 0,
    },
  });

  // Send invitation email
  try {
    const result = await sendTeamInviteEmail({
      email: invite.email,
      shop: invite.shop,
      role: invite.role,
      inviteUrl: buildInviteUrl(shop, invite.token),
      invitedBy,
      expiresAt: invite.expiresAt,
    });

    if (result.success) {
      // Update invite status to sent
      await db.teamInvite.update({
        where: { id: invite.id },
        data: { status: "sent", sentAt: new Date() },
      });
      invite.status = "sent";
      invite.sentAt = new Date();
    } else {
      // Track email error
      await db.teamInvite.update({
        where: { id: invite.id },
        data: { emailError: result.error || "Unknown error" },
      });
      invite.emailError = result.error || "Unknown error";
    }
  } catch (error) {
    console.error("Failed to send invite email:", error);
    const errorMsg = error instanceof Error ? error.message : "Email failed";
    await db.teamInvite.update({
      where: { id: invite.id },
      data: { emailError: errorMsg },
    });
    invite.emailError = errorMsg;
  }

  return invite as TeamInvite;
}

/**
 * Resend an invitation email
 */
export async function resendInvite(
  inviteId: string,
  invitedBy: string,
): Promise<TeamInvite | null> {
  const invite = await db.teamInvite.findUnique({
    where: { id: inviteId },
  });

  if (!invite) {
    throw new Error("Invite not found");
  }

  if (invite.status === "accepted") {
    throw new Error("Invitation has already been accepted");
  }

  if (invite.status === "revoked") {
    throw new Error("Invitation has been revoked");
  }

  if (new Date() > invite.expiresAt) {
    throw new Error("Invitation has expired");
  }

  // Send resent email
  try {
    const result = await sendInviteResentEmail({
      email: invite.email,
      shop: invite.shop,
      inviteUrl: buildInviteUrl(invite.shop, invite.token),
      expiresAt: invite.expiresAt,
    });

    if (result.success) {
      // Update resent tracking
      const updated = await db.teamInvite.update({
        where: { id: inviteId },
        data: {
          resentAt: new Date(),
          resentCount: { increment: 1 },
          status: "sent",
          emailError: null,
        },
      });
      return updated as TeamInvite;
    } else {
      await db.teamInvite.update({
        where: { id: inviteId },
        data: { emailError: result.error || "Resend failed" },
      });
      throw new Error(result.error || "Failed to resend email");
    }
  } catch (error) {
    console.error("Failed to resend invite:", error);
    throw error;
  }
}

/**
 * Accept an invite by token
 */
export async function acceptInvite(
  token: string,
  userId: string,
  name?: string,
): Promise<TeamInvite> {
  const invite = await db.teamInvite.findUnique({
    where: { token },
  });

  if (!invite) {
    throw new Error("Invalid invite token");
  }

  if (invite.status === "accepted") {
    throw new Error("Invite has already been accepted");
  }

  if (invite.status === "revoked") {
    throw new Error("Invite has been revoked");
  }

  if (new Date() > invite.expiresAt) {
    // Update status to expired
    await db.teamInvite.update({
      where: { id: invite.id },
      data: { status: "expired" },
    });
    throw new Error("Invite has expired");
  }

  // Accept the invite
  const updated = await db.teamInvite.update({
    where: { id: invite.id },
    data: {
      status: "accepted",
      acceptedAt: new Date(),
    },
  });

  // Also create a team member record
  await db.teamMember.create({
    data: {
      shop: invite.shop,
      userId,
      email: invite.email,
      name: name || invite.email,
      role: invite.role,
      invitedBy: invite.invitedBy,
      invitedAt: invite.invitedAt,
      acceptedAt: new Date(),
      status: "active",
    },
  });

  return updated as TeamInvite;
}

/**
 * Return all invites for a shop with their status
 */
export async function getInvites(shop: string): Promise<TeamInvite[]> {
  const invites = await db.teamInvite.findMany({
    where: { shop },
    orderBy: { invitedAt: "desc" },
  });

  return invites as TeamInvite[];
}

/**
 * Return pending (not accepted, not expired, not revoked) invites
 */
export async function getPendingInvites(shop: string): Promise<TeamInvite[]> {
  const now = new Date();
  const invites = await db.teamInvite.findMany({
    where: {
      shop,
      status: { in: ["pending", "sent"] },
      expiresAt: { gt: now },
    },
    orderBy: { invitedAt: "desc" },
  });

  return invites as TeamInvite[];
}

/**
 * Revoke an invite by id
 */
export async function revokeInvite(id: string): Promise<TeamInvite | null> {
  const invite = await db.teamInvite.findUnique({
    where: { id },
  });

  if (!invite) {
    return null;
  }

  if (invite.status === "accepted") {
    throw new Error("Cannot revoke an accepted invitation");
  }

  const updated = await db.teamInvite.update({
    where: { id },
    data: {
      status: "revoked",
      revokedAt: new Date(),
    },
  });

  return updated as TeamInvite;
}

/**
 * Get invite by ID
 */
export async function getInviteById(id: string): Promise<TeamInvite | null> {
  const invite = await db.teamInvite.findUnique({
    where: { id },
  });
  return invite as TeamInvite | null;
}

/**
 * Get invite by token
 */
export async function getInviteByToken(token: string): Promise<TeamInvite | null> {
  const invite = await db.teamInvite.findUnique({
    where: { token },
  });
  return invite as TeamInvite | null;
}

/**
 * Get status badge color for UI
 */
export function getStatusTone(status: string): "success" | "attention" | "info" | "warning" | "critical" {
  switch (status) {
    case "accepted":
      return "success";
    case "sent":
      return "info";
    case "pending":
      return "attention";
    case "expired":
      return "warning";
    case "revoked":
      return "critical";
    default:
      return "attention";
  }
}

/**
 * Format status for display
 */
export function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
