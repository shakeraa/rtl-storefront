import db from "../../db.server";

export interface HealthCheckResult {
  status: "ok" | "degraded";
  timestamp: string;
  checks: {
    database: { status: "ok" | "degraded" };
    runtime: { status: "ok" | "degraded"; node: string };
  };
}

export async function getHealthCheck(): Promise<HealthCheckResult> {
  let databaseStatus: "ok" | "degraded" = "ok";

  try {
    await db.$queryRaw`SELECT 1`;
  } catch {
    databaseStatus = "degraded";
  }

  const status = databaseStatus === "ok" ? "ok" : "degraded";

  return {
    status,
    timestamp: new Date().toISOString(),
    checks: {
      database: { status: databaseStatus },
      runtime: {
        status: "ok",
        node: process.version,
      },
    },
  };
}
