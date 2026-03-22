import { describe, expect, it } from "vitest";
import {
  getAssetCacheControl,
  getStaticAssetOptimizationConfig,
  isFingerprintedAsset,
  shouldPreloadAsset,
} from "../../app/services/performance/asset-optimizer";

describe("Static asset optimizer", () => {
  it("returns production-focused minification settings", () => {
    const config = getStaticAssetOptimizationConfig("production");

    expect(config.minify).toBe("esbuild");
    expect(config.cssMinify).toBe(true);
    expect(config.reportCompressedSize).toBe(true);
    expect(config.sourcemap).toBe(false);
    expect(config.assetsInlineLimit).toBe(0);
  });

  it("keeps sourcemaps in development mode", () => {
    const config = getStaticAssetOptimizationConfig("development");
    expect(config.sourcemap).toBe(true);
  });

  it("splits framework and Shopify vendor chunks deterministically", () => {
    const config = getStaticAssetOptimizationConfig("production");
    const chunker = config.rollupOutput.manualChunks;

    expect(chunker("/repo/node_modules/react/index.js")).toBe("framework");
    expect(chunker("/repo/node_modules/@shopify/polaris/build/esm/index.js")).toBe(
      "shopify-vendor",
    );
    expect(chunker("/repo/node_modules/lodash-es/index.js")).toBe("vendor");
    expect(chunker("/repo/app/routes/app.tsx")).toBeUndefined();
  });

  it("detects fingerprinted assets for immutable caching", () => {
    expect(isFingerprintedAsset("/build/assets/app-abc123ef.js")).toBe(true);
    expect(isFingerprintedAsset("/build/assets/app.js")).toBe(false);
  });

  it("returns long-lived cache headers for fingerprinted assets", () => {
    expect(getAssetCacheControl("/build/assets/app-abc123ef.js")).toContain("immutable");
    expect(getAssetCacheControl("/build/assets/app.js")).toContain("stale-while-revalidate");
  });

  it("preloads css and js assets only", () => {
    expect(shouldPreloadAsset("/build/assets/app.css")).toBe(true);
    expect(shouldPreloadAsset("/build/assets/app.js")).toBe(true);
    expect(shouldPreloadAsset("/build/assets/logo.svg")).toBe(false);
  });
});
