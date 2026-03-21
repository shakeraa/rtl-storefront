import React, { ReactNode } from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { RemixBrowser } from '@remix-run/react';
import { ShopProvider, AppBridgeProvider } from '@shopify/app-bridge-react';
import { PolarisTestProvider } from '@shopify/polaris';

// Custom render function with providers
interface CustomRenderOptions extends RenderOptions {
  shop?: string;
  apiKey?: string;
}

function AllProviders({
  children,
  shop = 'test-store.myshopify.com',
  apiKey = 'test-api-key',
}: {
  children: ReactNode;
  shop?: string;
  apiKey?: string;
}) {
  const config = {
    apiKey,
    host: Buffer.from(shop).toString('base64'),
    forceRedirect: false,
  };

  return (
    <AppBridgeProvider config={config}>
      <ShopProvider shop={shop}>
        <PolarisTestProvider>{children}</PolarisTestProvider>
      </ShopProvider>
    </AppBridgeProvider>
  );
}

export function render(
  ui: React.ReactElement,
  { shop, apiKey, ...options }: CustomRenderOptions = {}
) {
  return rtlRender(ui, {
    wrapper: (props) => <AllProviders {...props} shop={shop} apiKey={apiKey} />,
    ...options,
  });
}

// Helper to create mock loader data
export function createMockLoaderData<T>(data: T) {
  return {
    json: () => Promise.resolve(data),
    status: 200,
    statusText: 'OK',
    headers: new Headers(),
  };
}

// Helper to wait for async operations
export function wait(ms: number = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper to create mock action response
export function createMockActionResponse<T>(
  data: T,
  status: number = 200,
  headers: Record<string, string> = {}
) {
  return {
    data,
    status,
    headers: new Headers(headers),
  };
}

// Re-export everything from testing-library except render
export { 
  screen, 
  waitFor, 
  fireEvent, 
  within,
  cleanup
} from '@testing-library/react';
// Export our custom render as the default
export { render };
