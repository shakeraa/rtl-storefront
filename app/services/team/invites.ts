/**
 * Team Invitation Service
 * T0016: Team & Access Control — invitation system
 */

export interface TeamInvite {
  id: string;
  shop: string;
  email: string;
  role: string;
  token: string;
  expiresAt: Date;
  accepted: boolean;
}

// In-memory store (production: replace with Prisma/DB)
const inviteStore: Map<string, TeamInvite> = new Map();

/**
 * Generate a cryptographically secure random token.
 */
function generateToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Create a new team invite for the given shop.
 * Expires after 7 days.
 */
export async function createInvite(
  shop: string,
  email: string,
  role: string,
): Promise<TeamInvite> {
  const id = `inv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const invite: TeamInvite = {
    id,
    shop,
    email,
    role,
    token: generateToken(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    accepted: false,
  };
  inviteStore.set(id, invite);
  return invite;
}

/**
 * Accept an invite by token.
 * Throws if token is invalid, already accepted, or expired.
 */
export async function acceptInvite(token: string): Promise<void> {
  const invite = Array.from(inviteStore.values()).find(
    (i) => i.token === token,
  );

  if (!invite) {
    throw new Error("Invalid invite token");
  }
  if (invite.accepted) {
    throw new Error("Invite has already been accepted");
  }
  if (new Date() > invite.expiresAt) {
    throw new Error("Invite has expired");
  }

  invite.accepted = true;
  inviteStore.set(invite.id, invite);
}

/**
 * Return all pending (not accepted, not expired) invites for a shop.
 */
export async function getPendingInvites(shop: string): Promise<TeamInvite[]> {
  const now = new Date();
  return Array.from(inviteStore.values()).filter(
    (i) => i.shop === shop && !i.accepted && i.expiresAt > now,
  );
}

/**
 * Revoke an invite by id. No-ops silently if not found.
 */
export async function revokeInvite(id: string): Promise<void> {
  inviteStore.delete(id);
}
