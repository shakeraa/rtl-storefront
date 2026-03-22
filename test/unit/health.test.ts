import { describe, expect, it, vi } from "vitest";

const queryRaw = vi.fn();

vi.mock("../../app/db.server", () => ({
  default: {
    $queryRaw: queryRaw,
  },
}));

const { getHealthCheck } = await import("../../app/services/system/health");
const { loader } = await import("../../app/routes/health");

describe("system health service", () => {
  it("returns ok when the database check succeeds", async () => {
    queryRaw.mockResolvedValueOnce([{ "?column?": 1 }]);

    const result = await getHealthCheck();

    expect(result.status).toBe("ok");
    expect(result.checks.database.status).toBe("ok");
    expect(result.checks.runtime.status).toBe("ok");
    expect(result.checks.runtime.node).toBe(process.version);
  });

  it("returns degraded when the database check fails", async () => {
    queryRaw.mockRejectedValueOnce(new Error("db offline"));

    const result = await getHealthCheck();

    expect(result.status).toBe("degraded");
    expect(result.checks.database.status).toBe("degraded");
  });

  it("returns a non-cached health endpoint response", async () => {
    queryRaw.mockResolvedValueOnce([{ "?column?": 1 }]);

    const response = await loader({
      request: new Request("https://example.com/health"),
      params: {},
      context: {},
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toMatchObject({
      status: "ok",
      checks: {
        database: { status: "ok" },
      },
    });
  });
});
