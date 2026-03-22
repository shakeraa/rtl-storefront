export interface StaticAssetOptimizationConfig {
  minify: "esbuild";
  cssMinify: boolean;
  reportCompressedSize: boolean;
  sourcemap: boolean;
  assetsInlineLimit: number;
  chunkSizeWarningLimit: number;
  rollupOutput: {
    entryFileNames: string;
    chunkFileNames: string;
    assetFileNames: string;
    manualChunks: (id: string) => string | undefined;
  };
}

export function getStaticAssetOptimizationConfig(
  mode: "development" | "production" = "production",
): StaticAssetOptimizationConfig {
  return {
    minify: "esbuild",
    cssMinify: true,
    reportCompressedSize: true,
    sourcemap: mode !== "production",
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 500,
    rollupOutput: {
      entryFileNames: "assets/[name]-[hash].js",
      chunkFileNames: "assets/[name]-[hash].js",
      assetFileNames: "assets/[name]-[hash][extname]",
      manualChunks(id: string) {
        if (!id.includes("node_modules")) {
          return undefined;
        }

        if (id.includes("@shopify/polaris") || id.includes("@shopify/app-bridge-react")) {
          return "shopify-vendor";
        }

        if (id.includes("react") || id.includes("@remix-run")) {
          return "framework";
        }

        return "vendor";
      },
    },
  };
}

export function getAssetCacheControl(assetPath: string): string {
  return isFingerprintedAsset(assetPath)
    ? "public, max-age=31536000, immutable"
    : "public, max-age=3600, stale-while-revalidate=86400";
}

export function isFingerprintedAsset(assetPath: string): boolean {
  return /-[A-Za-z0-9]{8,}\./.test(assetPath);
}

export function shouldPreloadAsset(assetPath: string): boolean {
  return /\.(css|js)$/.test(assetPath);
}
