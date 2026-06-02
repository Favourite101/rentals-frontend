/**
 * Acceptance tests: Lender user journeys.
 */
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

describe('Acceptance: Lender approves a booking request', () => {
  it('The lender sees the request, approves it, and API is called', async () => {
    let approved = false;

    server.use(
      http.get(`${BASE}/bookings/my-lending-requests`, () => {
        if (approved) {
          return HttpResponse.json(makePaginated([makeBooking({ id: 1, status: 'pending' })]));
        }
        return HttpResponse.json(makePaginated([makeBooking({ id: 1, status: 'requested' })]));
      }),
      http.post(`${BASE}/bookings/1/approve`, () => {
        approved = true;
        return HttpResponse.json(makeBooking({ id: 1, status: 'pending' }));
      })
    );

    const user = userEvent.setup();
    renderWithProviders(
      <Routes>
        <Route path="/lending-requests" element={<LendingRequests />} />
      </Routes>,
      { initialEntries: ['/lending-requests'] }
    );

    await waitFor(() => {
      expect(screen.getByText(/awaiting your response/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /approve/i }));
    await waitFor(() => expect(approved).toBe(true));
  });
});

describe('Acceptance: Lender declines a booking request', () => {
  it('The lender declines a request and API is called', async () => {
    let declined = false;

    server.use(
      http.get(`${BASE}/bookings/my-lending-requests`, () => {
        if (declined) {
          return HttpResponse.json(makePaginated([makeBooking({ id: 2, status: 'declined' })]));
        }
        return HttpResponse.json(makePaginated([makeBooking({ id: 2, status: 'requested' })]));
      }),
      http.post(`${BASE}/bookings/2/decline`, () => {
        declined = true;
        return HttpResponse.json(makeBooking({ id: 2, status: 'declined' }));
      })
    );

    const user = userEvent.setup();
    renderWithProviders(
      <Routes>
        <Route path="/lending-requests" element={<LendingRequests />} />
      </Routes>,
      { initialEntries: ['/lending-requests'] }
    );

    await waitFor(() => screen.getByRole('button', { name: /decline/i }));
    await user.click(screen.getByRole('button', { name: /decline/i }));
    await waitFor(() => expect(declined).toBe(true));
  });
});

describe('Acceptance: Lender files a non-return report', () => {
  it('Lender reports missing equipment with notes; report is submitted', async () => {
    let reportBody: unknown;

    server.use(
      http.get(`${BASE}/bookings/my-lending-requests`, () =>
        HttpResponse.json(makePaginated([makeBooking({ id: 5, status: 'completed' })]))
      ),
      http.post(`${BASE}/bookings/5/report-non-return`, async ({ request }) => {
        reportBody = await request.json();
        return HttpResponse.json({ id: 1, booking_id: 5, lender_id: 2, status: 'open', created_at: '2025-06-01T00:00:00Z' }, { status: 201 });
      })
    );

    const user = userEvent.setup();
    renderWithProviders(
      <Routes>
        <Route path="/lending-requests" element={<LendingRequests />} />
      </Routes>,
      { initialEntries: ['/lending-requests'] }
    );

    // Button text is "Report"
    await waitFor(() => screen.getByRole('button', { name: /^report$/i }));
    await user.click(screen.getByRole('button', { name: /^report$/i }));

    const textarea = await screen.findByPlaceholderText(/describe the situation/i);
    await user.type(textarea, 'Equipment not returned after 7 days');

    const submitBtn = screen.getByRole('button', { name: /submit report/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect((reportBody as { notes: string }).notes).toBe('Equipment not returned after 7 days');
    });
  });
});
