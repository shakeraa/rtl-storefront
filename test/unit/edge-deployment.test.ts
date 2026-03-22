import { describe, expect, it } from "vitest";
import {
  getEdgeDeploymentConfig,
  isCloudflareEdgeRuntime,
  shouldEnableCloudflareDevProxy,
} from "../../app/services/performance/edge-deployment";

describe("edge deployment helpers", () => {
  it("detects the Cloudflare runtime from env", () => {
    expect(isCloudflareEdgeRuntime({ EDGE_RUNTIME: "cloudflare" })).toBe(true);
    expect(isCloudflareEdgeRuntime({ EDGE_RUNTIME: "node" })).toBe(false);
  });

  it("enables the dev proxy only when edge runtime is selected", () => {
    expect(
      shouldEnableCloudflareDevProxy({
        EDGE_RUNTIME: "cloudflare",
        ENABLE_CLOUDFLARE_DEV_PROXY: "1",
      }),
    ).toBe(true);
    expect(
      shouldEnableCloudflareDevProxy({
        EDGE_RUNTIME: "cloudflare",
        ENABLE_CLOUDFLARE_DEV_PROXY: "0",
      }),
    ).toBe(false);
    expect(shouldEnableCloudflareDevProxy({ EDGE_RUNTIME: "node" })).toBe(false);
  });

  it("returns explicit edge build and dev commands", () => {
    expect(getEdgeDeploymentConfig()).toEqual({
      runtime: "cloudflare",
      enableDevProxy: false,
      buildCommand: "EDGE_RUNTIME=cloudflare remix vite:build",
      devCommand:
        "EDGE_RUNTIME=cloudflare ENABLE_CLOUDFLARE_DEV_PROXY=1 npm exec remix vite:dev",
    });
  });
});
