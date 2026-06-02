import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { NonReturnReports } from '@/pages/admin/NonReturnReports';
import { renderAsAdmin } from '@/test/render';
import { server } from '@/test/server';
import { http, HttpResponse } from 'msw';
import { makeNonReturnReport } from '@/test/factories';

const BASE = 'http://localhost:8000/api/v1';

function renderNonReturnReports() {
  return renderAsAdmin(
    <Routes>
      <Route path="/admin/non-return-reports" element={<NonReturnReports />} />
      <Route path="/admin" element={<div>Admin Dashboard</div>} />
    </Routes>,
    { initialEntries: ['/admin/non-return-reports'] }
  );
}

describe('NonReturnReports â€” rendering', () => {
  it('shows the page heading', async () => {
    renderNonReturnReports();
    await waitFor(() => {
      expect(screen.getByText(/non-return reports/i)).toBeInTheDocument();
    });
  });

  it('shows open reports in the Open Reports section', async () => {
    server.use(
      http.get(`${BASE}/admin/non-return-reports`, () =>
        HttpResponse.json([makeNonReturnReport({ booking_id: 99, notes: 'Equipment missing', status: 'open' })])
      )
    );
    renderNonReturnReports();
    await waitFor(() => {
      expect(screen.getByText(/booking #99/i)).toBeInTheDocument();
    });
  });

  it('shows "No open reports" when all reports are reviewed', async () => {
    server.use(
      http.get(`${BASE}/admin/non-return-reports`, () =>
        HttpResponse.json([makeNonReturnReport({ status: 'reviewed' })])
      )
    );
    renderNonReturnReports();
    await waitFor(() => {
      expect(screen.getByText(/no open reports/i)).toBeInTheDocument();
    });
  });

  it('shows open badge count for open reports', async () => {
    server.use(
      http.get(`${BASE}/admin/non-return-reports`, () =>
        HttpResponse.json([
          makeNonReturnReport({ id: 1, status: 'open' }),
          makeNonReturnReport({ id: 2, booking_id: 2, status: 'open' }),
        ])
      )
    );
    renderNonReturnReports();
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });
});

describe('NonReturnReports â€” review flow', () => {
  it('opens review modal when Review button is clicked', async () => {
    server.use(
      http.get(`${BASE}/admin/non-return-reports`, () =>
        HttpResponse.json([makeNonReturnReport({ status: 'open' })])
      )
    );
    const user = userEvent.setup();
    renderNonReturnReports();
    await waitFor(() => screen.getByRole('button', { name: /review/i }));
    await user.click(screen.getByRole('button', { name: /review/i }));
    await waitFor(() => {
      expect(screen.getByText(/security deposit decision/i)).toBeInTheDocument();
    });
  });

  it('processes report with deposit refund', async () => {
    let requestBody: unknown;
    server.use(
      http.get(`${BASE}/admin/non-return-reports`, () =>
        HttpResponse.json([makeNonReturnReport({ id: 10, status: 'open' })])
      ),
      http.patch(`${BASE}/admin/non-return-reports/10`, async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json(makeNonReturnReport({ id: 10, status: 'reviewed' }));
      })
    );
    const user = userEvent.setup();
    renderNonReturnReports();
    await waitFor(() => screen.getByRole('button', { name: /review/i }));
    await user.click(screen.getByRole('button', { name: /review/i }));

    // "Refund deposit to borrower" should already be selected by default
    const markReviewedBtn = await screen.findByRole('button', { name: /mark reviewed/i });
    await user.click(markReviewedBtn);

    await waitFor(() => {
      expect(requestBody).toMatchObject({ forfeit_deposit: false });
    });
  });

  it('processes report with deposit forfeiture', async () => {
    let requestBody: unknown;
    server.use(
      http.get(`${BASE}/admin/non-return-reports`, () =>
        HttpResponse.json([makeNonReturnReport({ id: 11, status: 'open' })])
      ),
      http.patch(`${BASE}/admin/non-return-reports/11`, async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json(makeNonReturnReport({ id: 11, status: 'reviewed' }));
      })
    );
    const user = userEvent.setup();
    renderNonReturnReports();
    await waitFor(() => screen.getByRole('button', { name: /review/i }));
    await user.click(screen.getByRole('button', { name: /review/i }));

    // Select "Forfeit deposit"
    const forfeitRadio = await screen.findByRole('radio', { name: /forfeit deposit/i });
    await user.click(forfeitRadio);

    const markReviewedBtn = screen.getByRole('button', { name: /mark reviewed/i });
    await user.click(markReviewedBtn);

    await waitFor(() => {
      expect(requestBody).toMatchObject({ forfeit_deposit: true });
    });
  });
});

