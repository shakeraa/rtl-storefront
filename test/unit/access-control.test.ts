import { describe, it, expect, beforeEach } from "vitest";
import {
  hasPermission,
  hasPermissions,
  inviteTeamMember,
  acceptInvite,
  getTeamMembers,
  getPendingInvites,
  getRoleDisplayName,
} from "../../app/services/auth/roles";

// ---------------------------------------------------------------------------
// hasPermission
// ---------------------------------------------------------------------------

describe("hasPermission", () => {
  it("admin has manage on wildcard resource", () => {
    expect(hasPermission("admin", "*", "manage")).toBe(true);
  });

  it("admin has any action on any resource", () => {
    expect(hasPermission("admin", "translation", "create")).toBe(true);
    expect(hasPermission("admin", "billing", "delete")).toBe(true);
  });

  it("translator can create translation", () => {
    expect(hasPermission("translator", "translation", "create")).toBe(true);
  });

  it("translator cannot read billing", () => {
    expect(hasPermission("translator", "billing", "read")).toBe(false);
  });

  it("viewer can only read translation", () => {
    expect(hasPermission("viewer", "translation", "read")).toBe(true);
    expect(hasPermission("viewer", "translation", "create")).toBe(false);
  });

  it("manager can read reports", () => {
    expect(hasPermission("manager", "report", "read")).toBe(true);
  });

  it("manager cannot create translation", () => {
    expect(hasPermission("manager", "translation", "create")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// hasPermissions (bulk check)
// ---------------------------------------------------------------------------

describe("hasPermissions", () => {
  it("returns true when all permissions match", () => {
    expect(
      hasPermissions("translator", [
        { resource: "translation", action: "read" },
        { resource: "translation", action: "create" },
      ]),
    ).toBe(true);
  });

  it("returns false when at least one permission is missing", () => {
    expect(
      hasPermissions("viewer", [
        { resource: "translation", action: "read" },
        { resource: "translation", action: "create" },
      ]),
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Invite flow
// ---------------------------------------------------------------------------

describe("invite flow", () => {
  const SHOP = "test-invite.myshopify.com";

  beforeEach(() => {
    // Clear invites by running a fresh invite then accepting to drain state
    // (the in-memory store persists across tests so we just use unique shops)
  });

  it("inviteTeamMember returns a pending invite", () => {
    const invite = inviteTeamMember("dev@example.com", "translator", SHOP, "owner");
    expect(invite.email).toBe("dev@example.com");
    expect(invite.role).toBe("translator");
    expect(invite.shopId).toBe(SHOP);
    expect(invite.status).toBe("pending");
    expect(invite.token.length).toBeGreaterThan(0);
  });

  it("getPendingInvites lists the new invite", () => {
    const SHOP2 = "pending-list.myshopify.com";
    inviteTeamMember("a@example.com", "viewer", SHOP2, "owner");
    const pending = getPendingInvites(SHOP2);
    expect(pending.length).toBeGreaterThanOrEqual(1);
    expect(pending[0].status).toBe("pending");
  });

  it("acceptInvite creates a team member", () => {
    const SHOP3 = "accept-test.myshopify.com";
    const invite = inviteTeamMember("bob@example.com", "manager", SHOP3, "owner");
    const member = acceptInvite(invite.token, "user_bob", "Bob");
    expect(member).not.toBeNull();
    expect(member!.email).toBe("bob@example.com");
    expect(member!.role).toBe("manager");
    expect(member!.status).toBe("active");
  });

  it("acceptInvite returns null for a used token", () => {
    const SHOP4 = "double-accept.myshopify.com";
    const invite = inviteTeamMember("carol@example.com", "viewer", SHOP4, "owner");
    acceptInvite(invite.token, "u1", "Carol");
    const second = acceptInvite(invite.token, "u2", "Carol2");
    expect(second).toBeNull();
  });

  it("getTeamMembers returns active members for shop", () => {
    const SHOP5 = "member-list.myshopify.com";
    const invite = inviteTeamMember("dan@example.com", "translator", SHOP5, "owner");
    acceptInvite(invite.token, "u_dan", "Dan");
    const members = getTeamMembers(SHOP5);
    expect(members.length).toBeGreaterThanOrEqual(1);
    const dan = members.find((m) => m.email === "dan@example.com");
    expect(dan).toBeDefined();
    expect(dan!.role).toBe("translator");
  });
});

// ---------------------------------------------------------------------------
// getRoleDisplayName
// ---------------------------------------------------------------------------

describe("getRoleDisplayName", () => {
  it("returns English name by default", () => {
    expect(getRoleDisplayName("admin", "en")).toBe("Administrator");
    expect(getRoleDisplayName("translator", "en")).toBe("Translator");
  });

  it("returns Arabic name for ar locale", () => {
    const name = getRoleDisplayName("admin", "ar");
    expect(name).toBe("مدير");
  });

  it("falls back to English for unknown locale", () => {
    expect(getRoleDisplayName("viewer", "de")).toBe("Viewer");
  });
});
