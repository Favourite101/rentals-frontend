import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { server } from '@/test/server';
import { http, HttpResponse } from 'msw';
import { bookingsApi } from '@/lib/api/bookings';
import { setAuthData } from '@/lib/hooks/useAuth';
import { makeUser, makeBooking, makePaginated } from '@/test/factories';

const BASE = 'http://localhost:8000/api/v1';

beforeEach(() => {
  setAuthData(makeUser(), 'test-token');
});

afterEach(() => server.resetHandlers());

describe('bookingsApi.getMyBookings', () => {
  it('returns a PaginatedResponse with items array', async () => {
    const result = await bookingsApi.getMyBookings();
    expect(Array.isArray(result.items)).toBe(true);
    expect(typeof result.total).toBe('number');
  });
});

describe('bookingsApi.getMyLendingRequests', () => {
  it('returns paginated lending requests', async () => {
    const result = await bookingsApi.getMyLendingRequests();
    expect(result).toHaveProperty('items');
    expect(result.items[0].status).toBe('requested');
  });
});

describe('bookingsApi.create', () => {
  it('creates a booking and returns a Booking object', async () => {
    const result = await bookingsApi.create({
      equipment_id: 1,
      start_date: '2025-06-20',
      end_date: '2025-06-25',
    });
    expect(result).toHaveProperty('id');
    expect(result.status).toBe('pending');
  });
});

describe('bookingsApi.approve / decline', () => {
  it('approve changes status to pending', async () => {
    const result = await bookingsApi.approve(1);
    expect(result.status).toBe('pending');
  });

  it('decline changes status to declined', async () => {
    const result = await bookingsApi.decline(1);
    expect(result.status).toBe('declined');
  });
});

describe('bookingsApi.reportNonReturn', () => {
  it('creates a non-return report and returns it', async () => {
    const result = await bookingsApi.reportNonReturn(1, 'Equipment not returned after 3 days');
    expect(result).toHaveProperty('id');
    expect(result.booking_id).toBe(1);
    expect(result.status).toBe('open');
  });
});

describe('bookingsApi.createPayment', () => {
  it('returns Paystack payment init data', async () => {
    const result = await bookingsApi.createPayment(1);
    expect(result).toHaveProperty('reference');
    expect(result).toHaveProperty('amount_kobo');
    expect(typeof result.amount_kobo).toBe('number');
  });
});

describe('bookingsApi.confirmPayment', () => {
  it('confirms payment and returns confirmed booking', async () => {
    const result = await bookingsApi.confirmPayment('ref_xyz', 1);
    expect(result.status).toBe('confirmed');
  });
});

describe('bookingsApi.cancel', () => {
  it('cancels a booking', async () => {
    const result = await bookingsApi.cancel(1);
    expect(result.status).toBe('cancelled');
  });
});

describe('bookingsApi â€” API error handling', () => {
  it('throws on 404', async () => {
    server.use(
      http.get(`${BASE}/bookings/my-bookings`, () =>
        HttpResponse.json({ detail: 'Not found' }, { status: 404 })
      )
    );
    await expect(bookingsApi.getMyBookings()).rejects.toThrow();
  });

  it('throws on 403 (NIN gate)', async () => {
    server.use(
      http.post(`${BASE}/bookings/`, () =>
        HttpResponse.json({ detail: 'NIN verification required' }, { status: 403 })
      )
    );
    await expect(
      bookingsApi.create({ equipment_id: 1, start_date: '2025-06-20', end_date: '2025-06-25' })
    ).rejects.toThrow();
  });
});

describe('bookingsApi.getAllBookings', () => {
  it('returns paginated all bookings for admin', async () => {
    const booking = makeBooking({ status: 'confirmed' });
    server.use(
      http.get(`${BASE}/bookings/all`, () =>
        HttpResponse.json(makePaginated([booking]))
      )
    );
    const result = await bookingsApi.getAllBookings();
    expect(result.items[0].status).toBe('confirmed');
  });
});
