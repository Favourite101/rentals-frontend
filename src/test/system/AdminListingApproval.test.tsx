import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { ListingApproval } from '@/pages/admin/ListingApproval';
import { renderAsAdmin } from '@/test/render';
import { server } from '@/test/server';
import { http, HttpResponse } from 'msw';
import { makeEquipment, makePaginated } from '@/test/factories';

const BASE = 'http://localhost:8000/api/v1';

function renderListingApproval() {
  return renderAsAdmin(
    <Routes>
      <Route path="/admin/listing-approval" element={<ListingApproval />} />
      <Route path="/admin" element={<div>Admin Dashboard</div>} />
    </Routes>,
    { initialEntries: ['/admin/listing-approval'] }
  );
}

describe('ListingApproval - rendering', () => {
  it('shows the page heading', async () => {
    renderListingApproval();
    await waitFor(() => {
      expect(screen.getByText(/listing approval/i)).toBeInTheDocument();
    });
  });

  it('shows pending listings', async () => {
    server.use(
      http.get(`${BASE}/admin/listings`, () =>
        HttpResponse.json(makePaginated([makeEquipment({ status: 'pending_review', name: 'Red Camera' })]))
      )
    );
    renderListingApproval();
    await waitFor(() => {
      expect(screen.getByText('Red Camera')).toBeInTheDocument();
    });
  });

  it('shows Approve and Reject buttons per listing', async () => {
    server.use(
      http.get(`${BASE}/admin/listings`, () =>
        HttpResponse.json(makePaginated([makeEquipment({ status: 'pending_review' })]))
      )
    );
    renderListingApproval();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument();
    });
  });

  it('shows empty state when no pending listings', async () => {
    server.use(
      http.get(`${BASE}/admin/listings`, () =>
        HttpResponse.json(makePaginated([makeEquipment({ status: 'approved' })]))
      )
    );
    renderListingApproval();
    await waitFor(() => {
      expect(screen.getByText(/no listings pending review/i)).toBeInTheDocument();
    });
  });
});

describe('ListingApproval - approve flow', () => {
  it('calls approve API and updates list', async () => {
    let approveCalled = false;
    server.use(
      http.get(`${BASE}/admin/listings`, () =>
        HttpResponse.json(makePaginated([makeEquipment({ id: 5, status: 'pending_review' })]))
      ),
      http.post(`${BASE}/admin/listings/5/approve`, () => {
        approveCalled = true;
        return HttpResponse.json(makeEquipment({ id: 5, status: 'approved' }));
      })
    );
    const user = userEvent.setup();
    renderListingApproval();
    await waitFor(() => screen.getByRole('button', { name: /approve/i }));
    await user.click(screen.getByRole('button', { name: /approve/i }));
    await waitFor(() => expect(approveCalled).toBe(true));
  });
});

describe('ListingApproval - reject flow', () => {
  it('opens reject modal with reason textarea', async () => {
    server.use(
      http.get(`${BASE}/admin/listings`, () =>
        HttpResponse.json(makePaginated([makeEquipment({ status: 'pending_review' })]))
      )
    );
    const user = userEvent.setup();
    renderListingApproval();
    await waitFor(() => screen.getByRole('button', { name: /reject/i }));
    await user.click(screen.getByRole('button', { name: /reject/i }));
    await waitFor(() => {
      // Placeholder in the reject modal textarea
      expect(screen.getByPlaceholderText(/image quality too low/i)).toBeInTheDocument();
    });
  });

  it('calls reject API with reason', async () => {
    let rejectBody: unknown;
    server.use(
      http.get(`${BASE}/admin/listings`, () =>
        HttpResponse.json(makePaginated([makeEquipment({ id: 6, status: 'pending_review' })]))
      ),
      http.post(`${BASE}/admin/listings/6/reject`, async ({ request }) => {
        rejectBody = await request.json();
        return HttpResponse.json(makeEquipment({ id: 6, status: 'rejected' }));
      })
    );
    const user = userEvent.setup();
    renderListingApproval();
    await waitFor(() => screen.getByRole('button', { name: /reject/i }));
    await user.click(screen.getByRole('button', { name: /reject/i }));

    const textarea = await screen.findByPlaceholderText(/image quality too low/i);
    await user.type(textarea, 'Does not meet quality standards');

    // Button is "Reject Listing"
    const confirmBtn = screen.getByRole('button', { name: /reject listing/i });
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(rejectBody).toMatchObject({ reason: 'Does not meet quality standards' });
    });
  });
});

