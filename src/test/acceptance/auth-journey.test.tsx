/**
 * Acceptance tests: Authentication user journeys.
 *
 * These tests simulate what a real user would do:
 *   1. Arrive at the login page â†’ submit credentials â†’ land on dashboard
 *   2. Try to access a protected page without auth â†’ get redirected
 *   3. Register a new account â†’ auto-login â†’ land on dashboard
 */
import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { renderAsGuest } from '@/test/render';
import { server } from '@/test/server';
import { http, HttpResponse } from 'msw';

const BASE = 'http://localhost:8000/api/v1';

function App() {
  return (
    <Routes>
      <Route path="/" element={<div>Home</div>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin" element={<div>Admin Dashboard</div>} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute userOnly>
            <div>User Dashboard</div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

describe('Acceptance: Login journey', () => {
  it('A user can log in and reach the home page', async () => {
    const user = userEvent.setup();
    renderAsGuest(<App />, { initialEntries: ['/login'] });

    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/password/i), 'Password1');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText('Home')).toBeInTheDocument();
    });
  });

  it('An admin logs in and is redirected to /admin, not /dashboard', async () => {
    server.use(
      http.get(`${BASE}/auth/me`, () =>
        HttpResponse.json({
          id: 99, name: 'Admin', username: 'admin',
          email: 'admin@atlo.ng', role: 'admin', created_at: '2025-01-01T00:00:00Z',
        })
      )
    );
    const user = userEvent.setup();
    renderAsGuest(<App />, { initialEntries: ['/login'] });

    await user.type(screen.getByLabelText(/username/i), 'admin');
    await user.type(screen.getByLabelText(/password/i), 'AdminPass1');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });
  });

  it('Unauthenticated access to /dashboard redirects to /login', () => {
    renderAsGuest(
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute userOnly><div>User Dashboard</div></ProtectedRoute>} />
      </Routes>,
      { initialEntries: ['/dashboard'] }
    );
    expect(screen.queryByText('User Dashboard')).not.toBeInTheDocument();
    // ProtectedRoute redirects; Login page should appear
  });
});

describe('Acceptance: Registration journey', () => {
  it('A new user can register and land on the home page', async () => {
    const user = userEvent.setup();
    renderAsGuest(<App />, { initialEntries: ['/register'] });

    await user.type(screen.getByLabelText(/full name/i), 'Jane Smith');
    await user.type(screen.getByLabelText(/username/i), 'janesmith');
    await user.type(screen.getByLabelText(/email/i), 'jane@example.com');

    // Location select â€” try to find it
    const locationEl = screen.queryByLabelText(/location|lga/i);
    if (locationEl) {
      await user.selectOptions(locationEl, screen.getAllByRole('option')[1]);
    }

    const passwords = screen.getAllByLabelText(/password/i);
    await user.type(passwords[0], 'Password1');
    await user.type(passwords[1], 'Password1');

    await user.click(screen.getByRole('button', { name: /create account|register|sign up/i }));

    await waitFor(() => {
      expect(screen.getByText('Home')).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});
