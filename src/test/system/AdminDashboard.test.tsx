import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { renderAsAdmin } from '@/test/render';
import { server } from '@/test/server';
import { http, HttpResponse } from 'msw';

const BASE = 'http://localhost:8000/api/v1';

function renderAdminDashboard() {
  return renderAsAdmin(
    <Routes>
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<div>Users</div>} />
      <Route path="/admin/listings" element={<div>Listings</div>} />
      <Route path="/admin/bookings" element={<div>Bookings</div>} />
      <Route path="/admin/refunds" element={<div>Refunds</div>} />
      <Route path="/admin/listing-approval" element={<div>Listing Approval</div>} />
      <Route path="/admin/non-return-reports" element={<div>Non-Return Reports</div>} />
      <Route path="/admin/payouts" element={<div>Payouts</div>} />
    </Routes>,
    { initialEntries: ['/admin'] }
  );
}

describe('AdminDashboard â€” stats', () => {
  it('shows admin dashboard heading', async () => {
    renderAdminDashboard();
    await waitFor(() => {
      expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument();
    });
  });

  it('shows total users stat from API', async () => {
    server.use(
      http.get(`${BASE}/admin/stats`, () =>
        HttpResponse.json({ total_users: 42, total_listings: 15, total_bookings: 100, active_bookings: 8, total_revenue: 5000, pending_refunds: 3 })
      )
    );
    renderAdminDashboard();
    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument();
    });
  });

  it('shows active bookings stat', async () => {
    server.use(
      http.get(`${BASE}/admin/stats`, () =>
        HttpResponse.json({ total_users: 10, total_listings: 5, total_bookings: 20, active_bookings: 7, total_revenue: 1000, pending_refunds: 0 })
      )
    );
    renderAdminDashboard();
    await waitFor(() => {
      expect(screen.getByText('7')).toBeInTheDocument();
    });
  });
});

describe('AdminDashboard â€” navigation tiles', () => {
  it('shows all 7 navigation buttons', async () => {
    renderAdminDashboard();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /manage users/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /moderate listings/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /manage bookings/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /manage refunds/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /listing approval/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /non-return reports/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /payouts/i })).toBeInTheDocument();
    });
  });

  it('shows a badge on Manage Refunds when pending refunds exist', async () => {
    server.use(
      http.get(`${BASE}/bookings/admin/refunds/pending`, () =>
        HttpResponse.json([{ id: 1 }, { id: 2 }])
      )
    );
    renderAdminDashboard();
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });
});

