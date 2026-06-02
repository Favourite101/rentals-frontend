import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { server } from '@/test/server';
import { http, HttpResponse } from 'msw';
import { adminApi } from '@/lib/api/admin';
import { setAuthData } from '@/lib/hooks/useAuth';
import { makeAdmin } from '@/test/factories';

const BASE = 'http://localhost:8000/api/v1';

beforeEach(() => {
  setAuthData(makeAdmin(), 'admin-token');
});

afterEach(() => server.resetHandlers());

describe('adminApi.getUsers', () => {
  it('returns a paginated list of users', async () => {
    const result = await adminApi.getUsers();
    expect(Array.isArray(result.items)).toBe(true);
    expect(result.items.length).toBeGreaterThan(0);
  });
});

describe('adminApi.getListings', () => {
  it('returns a paginated list of listings', async () => {
    const result = await adminApi.getListings();
    expect(result).toHaveProperty('items');
    expect(result.items[0].status).toBe('pending_review');
  });
});

describe('adminApi.approveListing', () => {
  it('approves a listing and returns approved equipment', async () => {
    const result = await adminApi.approveListing(1);
    expect(result.status).toBe('approved');
  });
});

describe('adminApi.rejectListing', () => {
  it('rejects a listing with a reason', async () => {
    const result = await adminApi.rejectListing(1, 'Does not meet quality standards');
    expect(result.status).toBe('rejected');
  });

  it('rejects a listing without a reason', async () => {
    const result = await adminApi.rejectListing(1);
    expect(result.status).toBe('rejected');
  });
});

describe('adminApi.getNonReturnReports', () => {
  it('returns an array of non-return reports', async () => {
    const result = await adminApi.getNonReturnReports();
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].status).toBe('open');
  });
});

describe('adminApi.processNonReturnReport', () => {
  it('marks report as reviewed when refunding deposit', async () => {
    const result = await adminApi.processNonReturnReport(1, false);
    expect(result.status).toBe('reviewed');
  });

  it('marks report as reviewed when forfeiting deposit', async () => {
    const result = await adminApi.processNonReturnReport(1, true);
    expect(result.status).toBe('reviewed');
  });
});

describe('adminApi.getPayouts', () => {
  it('returns paginated payout bookings', async () => {
    const result = await adminApi.getPayouts();
    expect(result).toHaveProperty('items');
    expect(result.items[0].payout_status).toBe('paid');
  });
});

describe('adminApi.getStats', () => {
  it('returns platform statistics', async () => {
    const result = await adminApi.getStats();
    expect(result).toHaveProperty('total_users');
    expect(result).toHaveProperty('total_bookings');
    expect(typeof result.total_users).toBe('number');
  });
});

describe('adminApi â€” error handling', () => {
  it('throws on unauthorised listing approval', async () => {
    server.use(
      http.post(`${BASE}/admin/listings/:id/approve`, () =>
        HttpResponse.json({ detail: 'Forbidden' }, { status: 403 })
      )
    );
    await expect(adminApi.approveListing(99)).rejects.toThrow();
  });

  it('handles non-return report processing rejection', async () => {
    server.use(
      http.patch(`${BASE}/admin/non-return-reports/:id`, () =>
        HttpResponse.json({ detail: 'Report already reviewed' }, { status: 400 })
      )
    );
    await expect(adminApi.processNonReturnReport(99, false)).rejects.toThrow();
  });
});
