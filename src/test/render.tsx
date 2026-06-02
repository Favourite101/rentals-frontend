import * as React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom';
import { setAuthData, clearAuthData } from '@/lib/hooks/useAuth';
import { makeUser, makeAdmin } from './factories';
import type { User } from '@/types';

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: MemoryRouterProps['initialEntries'];
  user?: User | null;
}

export function renderWithProviders(
  ui: React.ReactElement,
  { initialEntries = ['/'], user = makeUser(), ...options }: RenderWithProvidersOptions = {}
) {
  // Set up auth state before render
  if (user) {
    setAuthData(user, 'test-token');
  } else {
    clearAuthData();
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0 },
      mutations: { retry: false },
    },
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          {children}
        </MemoryRouter>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

export function renderAsGuest(ui: React.ReactElement, options: Omit<RenderWithProvidersOptions, 'user'> = {}) {
  return renderWithProviders(ui, { ...options, user: null });
}

export function renderAsAdmin(ui: React.ReactElement, options: Omit<RenderWithProvidersOptions, 'user'> = {}) {
  return renderWithProviders(ui, { ...options, user: makeAdmin() });
}

export { makeUser, makeAdmin };
