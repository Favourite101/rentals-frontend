import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { LendingRequests } from '@/pages/LendingRequests';
import { renderWithProviders } from '@/test/render';
import { server } from '@/test/server';
import { http, HttpResponse } from 'msw';
import { makeBooking, makePaginated } from '@/test/factories';

const BASE = 'http://localhost:8000/api/v1';

function renderLendingRequests() {
  return renderWithProviders(
    <Routes>
      <Route path="/lending-requests" element={<LendingRequests />} />
    </Routes>,
    { initialEntries: ['/lending-requests'] }
  );
}

describe('LendingRequests - requested bookings', () => {
  it('shows "Awaiting Your Response" section for requested bookings', async () => {
    server.use(
      http.get(`${BASE}/bookings/my-lending-requests`, () =>
        HttpResponse.json(makePaginated([makeBooking({ status: 'requested' })]))
      )
    );
    renderLendingRequests();
    await waitFor(() => {
      expect(screen.getByText(/awaiting your response/i)).toBeInTheDocument();
    });
  });

  it('shows Approve and Decline buttons for requested bookings', async () => {
    server.use(
      http.get(`${BASE}/bookings/my-lending-requests`, () =>
        HttpResponse.json(makePaginated([makeBooking({ status: 'requested' })]))
      )
    );
    renderLendingRequests();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /decline/i })).toBeInTheDocument();
    });
  });

  it('calls approve API when Approve is clicked', async () => {
    let approveCalled = false;
    server.use(
      http.get(`${BASE}/bookings/my-lending-requests`, () =>
        HttpResponse.json(makePaginated([makeBooking({ id: 42, status: 'requested' })]))
      ),
      http.post(`${BASE}/bookings/42/approve`, () => {
        approveCalled = true;
        return HttpResponse.json(makeBooking({ id: 42, status: 'pending' }));
      })
    );
    const user = userEvent.setup();
    renderLendingRequests();
    await waitFor(() => screen.getByRole('button', { name: /approve/i }));
    await user.click(screen.getByRole('button', { name: /approve/i }));
    await waitFor(() => expect(approveCalled).toBe(true));
  });

  it('calls decline API when Decline is clicked', async () => {
    let declineCalled = false;
    server.use(
      http.get(`${BASE}/bookings/my-lending-requests`, () =>
        HttpResponse.json(makePaginated([makeBooking({ id: 42, status: 'requested' })]))
      ),
      http.post(`${BASE}/bookings/42/decline`, () => {
        declineCalled = true;
        return HttpResponse.json(makeBooking({ id: 42, status: 'declined' }));
      })
    );
    const user = userEvent.setup();
    renderLendingRequests();
    await waitFor(() => screen.getByRole('button', { name: /decline/i }));
    await user.click(screen.getByRole('button', { name: /decline/i }));
    await waitFor(() => expect(declineCalled).toBe(true));
  });
});

describe('LendingRequests - completed bookings', () => {
  it('shows Report button for completed bookings', async () => {
    server.use(
      http.get(`${BASE}/bookings/my-lending-requests`, () =>
        HttpResponse.json(makePaginated([makeBooking({ status: 'completed' })]))
      )
    );
    renderLendingRequests();
    await waitFor(() => {
      // Button text is "Report" (with AlertTriangle icon)
      expect(screen.getByRole('button', { name: /^report$/i })).toBeInTheDocument();
    });
  });

  it('opens report modal when Report is clicked', async () => {
    server.use(
      http.get(`${BASE}/bookings/my-lending-requests`, () =>
        HttpResponse.json(makePaginated([makeBooking({ status: 'completed' })]))
      )
    );
    const user = userEvent.setup();
    renderLendingRequests();
    await waitFor(() => screen.getByRole('button', { name: /^report$/i }));
    await user.click(screen.getByRole('button', { name: /^report$/i }));
    await waitFor(() => {
      expect(screen.getByText('Report Non-Return')).toBeInTheDocument();
    });
  });

  it('submits non-return report with notes', async () => {
    let reportCalled = false;
    server.use(
      http.get(`${BASE}/bookings/my-lending-requests`, () =>
        HttpResponse.json(makePaginated([makeBooking({ id: 7, status: 'completed' })]))
      ),
      http.post(`${BASE}/bookings/7/report-non-return`, () => {
        reportCalled = true;
        return HttpResponse.json({ id: 1, booking_id: 7, lender_id: 2, status: 'open', created_at: '2025-06-01T00:00:00Z' }, { status: 201 });
      })
    );
    const user = userEvent.setup();
    renderLendingRequests();

    await waitFor(() => screen.getByRole('button', { name: /^report$/i }));
    await user.click(screen.getByRole('button', { name: /^report$/i }));

    const textarea = await screen.findByPlaceholderText(/describe the situation/i);
    await user.type(textarea, 'Borrower has not returned the equipment after 5 days');

    const submitBtn = screen.getByRole('button', { name: /submit report/i });
    await user.click(submitBtn);

    await waitFor(() => expect(reportCalled).toBe(true));
  });
});

describe('LendingRequests - empty state', () => {
  it('shows empty state when no active lending requests', async () => {
    server.use(
      http.get(`${BASE}/bookings/my-lending-requests`, () =>
        HttpResponse.json(makePaginated([]))
      )
    );
    renderLendingRequests();
    await waitFor(() => {
      expect(screen.getByText(/no active lending requests/i)).toBeInTheDocument();
    });
  });
});

