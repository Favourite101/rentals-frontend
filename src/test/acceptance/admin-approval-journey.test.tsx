/**
 * Acceptance tests: Admin listing approval journey.
 */
import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { ListingApproval } from '@/pages/admin/ListingApproval';
import { NonReturnReports } from '@/pages/admin/NonReturnReports';
import { renderAsAdmin } from '@/test/render';
import { server } from '@/test/server';
import { http, HttpResponse } from 'msw';
import { makeEquipment, makePaginated, makeNonReturnReport } from '@/test/factories';

const BASE = 'http://localhost:8000/api/v1';

describe('Acceptance: Admin approves a listing', () => {
  it('Admin sees pending listing, approves it, API is called', async () => {
    let approved = false;
    server.use(
      http.get(`${BASE}/admin/listings`, () =>
        HttpResponse.json(makePaginated([makeEquipment({ id: 3, name: 'Boom Mic', status: 'pending_review' })]))
      ),
      http.post(`${BASE}/admin/listings/3/approve`, () => {
        approved = true;
        return HttpResponse.json(makeEquipment({ id: 3, status: 'approved' }));
      })
    );

    const user = userEvent.setup();
    renderAsAdmin(
      <Routes>
        <Route path="/admin/listing-approval" element={<ListingApproval />} />
        <Route path="/admin" element={<div>Admin Dashboard</div>} />
      </Routes>,
      { initialEntries: ['/admin/listing-approval'] }
    );

    await waitFor(() => screen.getByText('Boom Mic'));
    await user.click(screen.getByRole('button', { name: /approve/i }));
    await waitFor(() => expect(approved).toBe(true));
  });
});

describe('Acceptance: Admin rejects a listing with reason', () => {
  it('Admin opens reject modal, types reason, confirms; API gets reason', async () => {
    let rejectionBody: unknown;
    server.use(
      http.get(`${BASE}/admin/listings`, () =>
        HttpResponse.json(makePaginated([makeEquipment({ id: 4, name: 'Suspicious Camera', status: 'pending_review' })]))
      ),
      http.post(`${BASE}/admin/listings/4/reject`, async ({ request }) => {
        rejectionBody = await request.json();
        return HttpResponse.json(makeEquipment({ id: 4, status: 'rejected' }));
      })
    );

    const user = userEvent.setup();
    renderAsAdmin(
      <Routes>
        <Route path="/admin/listing-approval" element={<ListingApproval />} />
        <Route path="/admin" element={<div>Admin Dashboard</div>} />
      </Routes>,
      { initialEntries: ['/admin/listing-approval'] }
    );

    await waitFor(() => screen.getByText('Suspicious Camera'));
    await user.click(screen.getByRole('button', { name: /reject/i }));

    const textarea = await screen.findByPlaceholderText(/image quality too low/i);
    await user.type(textarea, 'Item appears to be stolen property');

    await user.click(screen.getByRole('button', { name: /reject listing/i }));

    await waitFor(() => {
      expect((rejectionBody as { reason: string }).reason).toBe('Item appears to be stolen property');
    });
  });
});

describe('Acceptance: Admin processes a non-return report', () => {
  it('Admin reviews report and forfeits deposit to lender', async () => {
    let processBody: unknown;
    server.use(
      http.get(`${BASE}/admin/non-return-reports`, () =>
        HttpResponse.json([makeNonReturnReport({ id: 20, booking_id: 55, status: 'open', notes: 'Borrower not responding' })])
      ),
      http.patch(`${BASE}/admin/non-return-reports/20`, async ({ request }) => {
        processBody = await request.json();
        return HttpResponse.json(makeNonReturnReport({ id: 20, status: 'reviewed' }));
      })
    );

    const user = userEvent.setup();
    renderAsAdmin(
      <Routes>
        <Route path="/admin/non-return-reports" element={<NonReturnReports />} />
        <Route path="/admin" element={<div>Admin Dashboard</div>} />
      </Routes>,
      { initialEntries: ['/admin/non-return-reports'] }
    );

    await waitFor(() => screen.getByText(/booking #55/i));
    await user.click(screen.getByRole('button', { name: /review/i }));

    const forfeitRadio = await screen.findByRole('radio', { name: /forfeit deposit/i });
    await user.click(forfeitRadio);

    await user.click(screen.getByRole('button', { name: /mark reviewed/i }));

    await waitFor(() => {
      expect((processBody as { forfeit_deposit: boolean }).forfeit_deposit).toBe(true);
    });
  });
});
