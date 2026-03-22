import { describe, it, expect } from "vitest";
import {
  createInvite,
  acceptInvite,
  getPendingInvites,
  revokeInvite,
} from "../../app/services/team/invites";

const SHOP = "invites-service.myshopify.com";

describe("team/invites service", () => {
  it("createInvite returns a valid invite", async () => {
    const invite = await createInvite(SHOP, "alice@example.com", "translator");
    expect(invite.id).toMatch(/^inv_/);
    expect(invite.shop).toBe(SHOP);
    expect(invite.email).toBe("alice@example.com");
    expect(invite.role).toBe("translator");
    expect(invite.accepted).toBe(false);
    expect(invite.token.length).toBe(64);
    expect(invite.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("getPendingInvites lists non-accepted, non-expired invites", async () => {
    const SHOP2 = "invites-list.myshopify.com";
    await createInvite(SHOP2, "b@example.com", "viewer");
    const pending = await getPendingInvites(SHOP2);
    expect(pending.length).toBeGreaterThanOrEqual(1);
    expect(pending[0].accepted).toBe(false);
  });

  it("acceptInvite marks the invite as accepted", async () => {
    const SHOP3 = "invites-accept.myshopify.com";
    const invite = await createInvite(SHOP3, "c@example.com", "admin");
    await acceptInvite(invite.token);
    const pending = await getPendingInvites(SHOP3);
    // Accepted invite should no longer appear in pending list
    const still = pending.find((i) => i.id === invite.id);
    expect(still).toBeUndefined();
  });

  it("acceptInvite throws for an already accepted token", async () => {
    const SHOP4 = "invites-double.myshopify.com";
    const invite = await createInvite(SHOP4, "d@example.com", "manager");
    await acceptInvite(invite.token);
    await expect(acceptInvite(invite.token)).rejects.toThrow("already been accepted");
  });

  it("acceptInvite throws for an invalid token", async () => {
    await expect(acceptInvite("invalid-token")).rejects.toThrow("Invalid invite token");
  });

  it("revokeInvite removes it from pending", async () => {
    const SHOP5 = "invites-revoke.myshopify.com";
    const invite = await createInvite(SHOP5, "e@example.com", "viewer");
    await revokeInvite(invite.id);
    const pending = await getPendingInvites(SHOP5);
    expect(pending.find((i) => i.id === invite.id)).toBeUndefined();
  });

  it("revokeInvite on a non-existent id is a no-op", async () => {
    await expect(revokeInvite("non-existent-id")).resolves.toBeUndefined();
  });
});
