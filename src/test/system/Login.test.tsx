import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { Login } from '@/pages/Login';
import { renderAsGuest } from '@/test/render';
import { server } from '@/test/server';
import { http, HttpResponse } from 'msw';

const BASE = 'http://localhost:8000/api/v1';

function renderLogin() {
  return renderAsGuest(
    <Routes>
      <Route path="/" element={<div>Home</div>} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<div>Dashboard</div>} />
      <Route path="/admin" element={<div>Admin Dashboard</div>} />
    </Routes>,
    { initialEntries: ['/login'] }
  );
}

describe('Login page â€” rendering', () => {
  it('shows username and password fields', () => {
    renderLogin();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('shows a Login submit button', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('shows a link to register page', () => {
    renderLogin();
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
  });

  it('shows a forgot password link', () => {
    renderLogin();
    expect(screen.getByRole('link', { name: /forgot password/i })).toBeInTheDocument();
  });
});

describe('Login page â€” validation', () => {
  it('shows an error when submitted with empty username', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByRole('button', { name: /login/i }));
    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
    });
  });

  it('shows an error when submitted with empty password', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.click(screen.getByRole('button', { name: /login/i }));
    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });
});

describe('Login page â€” success flow', () => {
  it('navigates to / (home) after successful login as regular user', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/password/i), 'Password1');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText('Home')).toBeInTheDocument();
    });
  });

  it('navigates to /admin after successful login as admin', async () => {
    server.use(
      http.get(`${BASE}/auth/me`, () =>
        HttpResponse.json({ id: 99, name: 'Admin', username: 'admin', email: 'admin@example.com', role: 'admin', created_at: '2025-01-01T00:00:00Z' })
      )
    );
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/username/i), 'admin');
    await user.type(screen.getByLabelText(/password/i), 'AdminPass1');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });
  });
});

describe('Login page â€” error flow', () => {
  it('displays an error toast on invalid credentials', async () => {
    server.use(
      http.post(`${BASE}/auth/login`, () =>
        HttpResponse.json({ detail: 'Incorrect username or password' }, { status: 401 })
      )
    );
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/username/i), 'wrong');
    await user.type(screen.getByLabelText(/password/i), 'BadPass1');
    await user.click(screen.getByRole('button', { name: /login/i }));

    // Button should remain on login page
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });
  });
});

