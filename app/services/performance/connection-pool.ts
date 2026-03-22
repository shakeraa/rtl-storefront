export interface PoolConfig {
  maxConnections: number;
  minConnections: number;
  idleTimeoutMs: number;
  acquireTimeoutMs: number;
}

export interface PoolMetrics {
  active: number;
  idle: number;
  waiting: number;
  total: number;
}

export function getDefaultPoolConfig(): PoolConfig {
  return {
    maxConnections: 10,
    minConnections: 2,
    idleTimeoutMs: 30_000,
    acquireTimeoutMs: 10_000,
  };
}

export function getPoolConfigForEnvironment(
  env: "development" | "production" | "test",
): PoolConfig {
  switch (env) {
    case "production":
      return {
        maxConnections: 20,
        minConnections: 5,
        idleTimeoutMs: 60_000,
        acquireTimeoutMs: 15_000,
      };
    case "test":
      return {
        maxConnections: 3,
        minConnections: 1,
        idleTimeoutMs: 5_000,
        acquireTimeoutMs: 5_000,
      };
    default:
      return getDefaultPoolConfig();
  }
}

export function generatePrismaPoolUrl(
  baseUrl: string,
  poolConfig: PoolConfig,
): string {
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}connection_limit=${poolConfig.maxConnections}&pool_timeout=${Math.round(poolConfig.acquireTimeoutMs / 1000)}`;
}

export function getPoolMetrics(): PoolMetrics {
  // Stub — actual metrics come from the database driver
  return {
    active: 0,
    idle: 0,
    waiting: 0,
    total: 0,
  };
}
