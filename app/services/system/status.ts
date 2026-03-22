export interface PublicStatusPageData {
  service: string;
  status: "operational" | "degraded";
  updatedAt: string;
  components: Array<{
    name: string;
    status: "operational" | "degraded";
    description: string;
  }>;
}

export function getPublicStatusPageData(): PublicStatusPageData {
  const updatedAt = new Date().toISOString();

  return {
    service: "rtl-storefront",
    status: "operational",
    updatedAt,
    components: [
      {
        name: "Admin app",
        status: "operational",
        description: "Embedded Shopify admin experience",
      },
      {
        name: "Translation services",
        status: "operational",
        description: "AI translation, glossary, and translation memory helpers",
      },
      {
        name: "Public storefront routes",
        status: "operational",
        description: "Landing page and localized storefront support",
      },
    ],
  };
}
