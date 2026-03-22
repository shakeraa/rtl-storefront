export interface EdgeDeploymentEnv {
  EDGE_RUNTIME?: string;
  ENABLE_CLOUDFLARE_DEV_PROXY?: string;
}

export interface EdgeDeploymentConfig {
  runtime: "cloudflare";
  enableDevProxy: boolean;
  buildCommand: string;
  devCommand: string;
}

export function isCloudflareEdgeRuntime(
  env: EdgeDeploymentEnv = process.env,
): boolean {
  return env.EDGE_RUNTIME === "cloudflare";
}

export function shouldEnableCloudflareDevProxy(
  env: EdgeDeploymentEnv = process.env,
): boolean {
  return (
    isCloudflareEdgeRuntime(env) &&
    env.ENABLE_CLOUDFLARE_DEV_PROXY !== "0"
  );
}

export function getEdgeDeploymentConfig(
  env: EdgeDeploymentEnv = process.env,
): EdgeDeploymentConfig {
  return {
    runtime: "cloudflare",
    enableDevProxy: shouldEnableCloudflareDevProxy(env),
    buildCommand: "EDGE_RUNTIME=cloudflare remix vite:build",
    devCommand:
      "EDGE_RUNTIME=cloudflare ENABLE_CLOUDFLARE_DEV_PROXY=1 npm exec remix vite:dev",
  };
}
