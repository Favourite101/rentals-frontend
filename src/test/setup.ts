import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll, vi } from 'vitest';
import { server } from './server';

// Start MSW server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

// Reset handlers after each test to avoid state leakage
afterEach(() => {
  server.resetHandlers();
  cleanup();
  localStorage.clear();
});

// Stop server after all tests
afterAll(() => server.close());

// Mock PaystackPop (CDN script not available in test env)
(window as unknown as Record<string, unknown>).PaystackPop = {
  setup: vi.fn(() => ({ openIframe: vi.fn() })),
};
