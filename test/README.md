# Testing Guide

This project uses **Vitest** for testing with React Testing Library for component tests.

## Test Structure

```
test/
├── setup.ts                 # Test setup and global mocks
├── utils.tsx               # Test utilities and custom render
├── mocks/                  # Mock modules
│   └── shopify.ts          # Shopify API mocks
├── fixtures/               # Test data
│   ├── index.ts            # Fixtures export
│   ├── products.ts         # Product test data
│   ├── collections.ts      # Collection test data
│   ├── shop.ts             # Shop test data
│   └── translations.ts     # Translation test data
├── unit/                   # Unit tests
│   ├── rtl.test.ts         # RTL utility tests
│   ├── translation.test.ts # Translation utility tests
│   ├── db.server.test.ts   # Database tests
│   └── shopify.server.test.ts # Shopify config tests
├── integration/            # Integration tests
│   ├── app._index.test.tsx # App index route tests
│   ├── auth.test.ts        # Authentication tests
│   └── webhooks.test.ts    # Webhook handler tests
└── e2e/                    # E2E tests (future)
```

## Running Tests

```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## Test Types

### Unit Tests
Test individual functions and utilities in isolation.

Examples:
- `test/unit/rtl.test.ts` - Tests RTL utility functions
- `test/unit/translation.test.ts` - Tests translation utilities

### Integration Tests
Test route handlers and API interactions.

Examples:
- `test/integration/app._index.test.tsx` - Tests app dashboard loader
- `test/integration/webhooks.test.ts` - Tests webhook handlers
- `test/integration/auth.test.ts` - Tests authentication flow

### Component Tests
Test React components with proper context providers.

Use the custom `render` function from `test/utils.tsx` which includes:
- AppBridgeProvider
- ShopProvider
- PolarisTestProvider

Example:
```tsx
import { render, screen } from '../utils';
import MyComponent from '../../app/components/MyComponent';

test('renders correctly', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

## Mocks

### Shopify API
Import mocks from `test/mocks/shopify.ts`:
```tsx
import { mockAuthenticate, mockAdminGraphQL } from '../mocks/shopify';

vi.mock('../../app/shopify.server', () => ({
  authenticate: mockAuthenticate,
}));
```

### Fixtures
Import test data from `test/fixtures`:
```tsx
import { mockProduct, mockProducts } from '../fixtures';
```

## Writing Tests

### Unit Test Example
```ts
import { describe, it, expect } from 'vitest';
import { isRTLLanguage } from '../../app/utils/rtl';

describe('RTL Utilities', () => {
  it('detects Arabic as RTL', () => {
    expect(isRTLLanguage('ar')).toBe(true);
  });

  it('detects English as LTR', () => {
    expect(isRTLLanguage('en')).toBe(false);
  });
});
```

### Route Test Example
```ts
import { describe, it, expect, vi } from 'vitest';
import { loader } from '../../app/routes/app._index';

vi.mock('../../app/shopify.server', () => ({
  authenticate: { admin: vi.fn() },
}));

describe('App Index Route', () => {
  it('returns data on success', async () => {
    const response = await loader({ request, params: {}, context: {} });
    expect(response).toBeDefined();
  });
});
```

## Coverage

Coverage reports are generated in the `coverage/` directory.

Current coverage goals:
- Utilities: 90%+
- Routes: 70%+
- Components: 60%+

## Best Practices

1. **Use fixtures** for consistent test data
2. **Mock external APIs** (Shopify, AI translation services)
3. **Test edge cases** (empty inputs, null values, errors)
4. **Group related tests** with `describe` blocks
5. **Clear mocks** in `beforeEach` hooks
6. **Use semantic assertions** (`.toBe()` vs `.toEqual()`)

## Troubleshooting

### "window is not defined"
Use the jsdom environment (default in vitest.config.ts)

### "Cannot find module"
Check import paths use correct relative path `../../app/...`

### Mock not working
Ensure `vi.mock()` is at the top level and use `vi.resetModules()` before dynamic imports
