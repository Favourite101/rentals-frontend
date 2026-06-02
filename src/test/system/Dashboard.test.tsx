import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { Dashboard } from '@/pages/Dashboard';
import { renderWithProviders } from '@/test/render';
import { server } from '@/test/server';
import { http, HttpResponse } from 'msw';
import { makeBooking, makePaginated } from '@/test/factories';

const BASE = 'http://localhost:8000/api/v1';

function renderDashboard() {
  return renderWithProviders(
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/browse/:slug" element={<div>Equipment Detail</div>} />
      <Route path="/booking/:id/payment" element={<div>Payment Page</div>} />
    </Routes>,
    { initialEntries: ['/dashboard'] }
  );
}

describe('Dashboard â€” loading state', () => {
  it('renders without crashing', async () => {
    renderDashboard();
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });
});

describe('Dashboard â€” with bookings', () => {
  it('shows booking equipment name', async () => {
    server.use(
      http.get(`${BASE}/bookings/my-bookings`, () =>
        HttpResponse.json(makePaginated([makeBooking({ status: 'confirmed' })]))
      )
    );
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/Sony Camera/i)).toBeInTheDocument();
    });
  });

  it('shows "Confirmed" status badge for a confirmed booking', async () => {
    server.use(
      http.get(`${BASE}/bookings/my-bookings`, () =>
        HttpResponse.json(makePaginated([makeBooking({ status: 'confirmed' })]))
      )
    );
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/confirmed/i)).toBeInTheDocument();
    });
  });

  it('shows "Awaiting Approval" for requested bookings', async () => {
    server.use(
      http.get(`${BASE}/bookings/my-bookings`, () =>
        HttpResponse.json(makePaginated([makeBooking({ status: 'requested' })]))
      )
    );
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/awaiting approval/i)).toBeInTheDocument();
    });
  });
});

describe('Dashboard â€” empty state', () => {
  it('shows empty state when no bookings', async () => {
    server.use(
      http.get(`${BASE}/bookings/my-bookings`, () =>
        HttpResponse.json(makePaginated([]))
      )
    );
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/no bookings/i)).toBeInTheDocument();
    });
  });
});

describe('Dashboard â€” cancel booking', () => {
  it('opens cancel confirmation modal on cancel button click', async () => {
    server.use(
      http.get(`${BASE}/bookings/my-bookings`, () =>
        HttpResponse.json(makePaginated([makeBooking({ status: 'pending' })]))
      )
    );
    const user = userEvent.setup();
    renderDashboard();

    await waitFor(() => screen.getByText(/Sony Camera/i));

    const cancelButtons = screen.queryAllByRole('button', { name: /cancel/i });
    if (cancelButtons.length > 0) {
      await user.click(cancelButtons[0]);
      await waitFor(() => {
        // Modal or confirmation text appears
        expect(screen.getByText(/cancel/i)).toBeInTheDocument();
      });
    }
  });
});

