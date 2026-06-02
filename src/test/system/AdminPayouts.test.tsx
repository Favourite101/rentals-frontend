import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { Payouts } from '@/pages/admin/Payouts';
import { renderAsAdmin } from '@/test/render';
import { server } from '@/test/server';
import { http, HttpResponse } from 'msw';
import { makeBooking, makePaginated } from '@/test/factories';

const BASE = 'http://localhost:8000/api/v1';

function renderPayouts() {
  return renderAsAdmin(
    <Routes>
      <Route path="/admin/payouts" element={<Payouts />} />
      <Route path="/admin" element={<div>Admin Dashboard</div>} />
    </Routes>,
    { initialEntries: ['/admin/payouts'] }
  );
}

describe('Payouts â€” rendering', () => {
  it('shows the page heading', async () => {
    renderPayouts();
    await waitFor(() => {
      expect(screen.getByText(/payout history/i)).toBeInTheDocument();
    });
  });

  it('shows total paid out stat', async () => {
    server.use(
      http.get(`${BASE}/admin/payouts`, () =>
        HttpResponse.json(makePaginated([
          makeBooking({ lender_payout_amount: 135, payout_status: 'paid', payout_reference: 'TRF_abc' }),
          makeBooking({ id: 2, lender_payout_amount: 200, payout_status: 'paid', payout_reference: 'TRF_def' }),
        ]))
      )
    );
    renderPayouts();
    await waitFor(() => {
      // 135 + 200 = 335 shown
      expect(screen.getByText(/335/)).toBeInTheDocument();
    });
  });

  it('shows transaction count', async () => {
    server.use(
      http.get(`${BASE}/admin/payouts`, () =>
        HttpResponse.json(makePaginated([
          makeBooking({ payout_status: 'paid', payout_reference: 'TRF_1' }),
          makeBooking({ id: 2, payout_status: 'paid', payout_reference: 'TRF_2' }),
        ]))
      )
    );
    renderPayouts();
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('shows lender name in the table', async () => {
    server.use(
      http.get(`${BASE}/admin/payouts`, () =>
        HttpResponse.json(makePaginated([
          makeBooking({ lender: { id: 2, name: 'Jane Lender', username: 'janelender', email: 'jane@example.com', role: 'user', created_at: '2025-01-01T00:00:00Z' }, payout_status: 'paid', payout_reference: 'TRF_abc' }),
        ]))
      )
    );
    renderPayouts();
    await waitFor(() => {
      expect(screen.getByText(/Jane Lender/)).toBeInTheDocument();
    });
  });

  it('shows payout reference in the table', async () => {
    server.use(
      http.get(`${BASE}/admin/payouts`, () =>
        HttpResponse.json(makePaginated([
          makeBooking({ payout_status: 'paid', payout_reference: 'TRF_unique_ref' }),
        ]))
      )
    );
    renderPayouts();
    await waitFor(() => {
      expect(screen.getByText('TRF_unique_ref')).toBeInTheDocument();
    });
  });

  it('shows empty state when no payouts', async () => {
    server.use(
      http.get(`${BASE}/admin/payouts`, () =>
        HttpResponse.json(makePaginated([]))
      )
    );
    renderPayouts();
    await waitFor(() => {
      expect(screen.getByText(/no payouts processed yet/i)).toBeInTheDocument();
    });
  });
});

