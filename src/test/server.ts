import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { makeUser, makeEquipment, makeBooking, makeAdmin, makePaginated, makeNonReturnReport, makeRefundRequest } from './factories';

const BASE = 'http://localhost:8000/api/v1';

export const handlers = [
  // Auth
  http.post(`${BASE}/auth/login`, () =>
    HttpResponse.json({ access_token: 'test-token', token_type: 'bearer' })
  ),
  http.post(`${BASE}/auth/register`, () => HttpResponse.json({ id: 1 }, { status: 201 })),
  http.get(`${BASE}/auth/me`, () => HttpResponse.json(makeUser())),
  http.patch(`${BASE}/auth/me`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json(makeUser(body as Partial<ReturnType<typeof makeUser>>));
  }),
  http.post(`${BASE}/auth/me/avatar`, () => HttpResponse.json(makeUser({ avatar_url: 'https://cdn.example.com/avatar.jpg' }))),
  http.post(`${BASE}/auth/me/verify-nin`, () => HttpResponse.json(makeUser({ nin_verified: true }))),
  http.post(`${BASE}/auth/me/change-password`, () => HttpResponse.json({})),
  http.delete(`${BASE}/auth/me`, () => HttpResponse.json({})),
  http.post(`${BASE}/auth/forgot-password`, () => HttpResponse.json({ message: 'Reset email sent' })),
  http.post(`${BASE}/auth/reset-password`, () => HttpResponse.json({ message: 'Password reset successful' })),

  // Equipment
  http.get(`${BASE}/equipment/`, () =>
    HttpResponse.json(makePaginated([makeEquipment(), makeEquipment({ id: 2, slug: 'drone-2', name: 'DJI Drone' })]))
  ),
  http.get(`${BASE}/equipment/search`, () =>
    HttpResponse.json(makePaginated([makeEquipment()]))
  ),
  http.get(`${BASE}/equipment/categories`, () =>
    HttpResponse.json([{ id: 1, name: 'Audio', created_at: '2025-01-01T00:00:00Z' }])
  ),
  http.get(`${BASE}/equipment/my-listings`, () =>
    HttpResponse.json([makeEquipment({ owner_id: 1 })])
  ),
  http.get(`${BASE}/equipment/:slug`, ({ params }) =>
    HttpResponse.json(makeEquipment({ slug: params.slug as string }))
  ),
  http.post(`${BASE}/equipment/`, () => HttpResponse.json(makeEquipment(), { status: 201 })),
  http.put(`${BASE}/equipment/:id`, () => HttpResponse.json(makeEquipment())),
  http.delete(`${BASE}/equipment/:id`, () => HttpResponse.json({})),

  // Bookings — specific paths must come before parameterised /:id
  http.get(`${BASE}/bookings/my-bookings`, () =>
    HttpResponse.json(makePaginated([makeBooking()]))
  ),
  http.get(`${BASE}/bookings/my-lending-requests`, () =>
    HttpResponse.json(makePaginated([makeBooking({ status: 'requested' })]))
  ),
  http.get(`${BASE}/bookings/all`, () =>
    HttpResponse.json(makePaginated([makeBooking()]))
  ),
  http.get(`${BASE}/bookings/my-refunds`, () => HttpResponse.json([makeRefundRequest()])),
  http.get(`${BASE}/bookings/equipment/:id/availability`, () =>
    HttpResponse.json({ equipment_id: 1, unavailable_dates: [] })
  ),
  http.get(`${BASE}/bookings/:id`, ({ params }) =>
    HttpResponse.json(makeBooking({ id: Number(params.id) }))
  ),
  http.post(`${BASE}/bookings/`, () => HttpResponse.json(makeBooking({ status: 'pending' }), { status: 201 })),
  http.post(`${BASE}/bookings/confirm-payment`, () =>
    HttpResponse.json(makeBooking({ status: 'confirmed' }))
  ),
  http.post(`${BASE}/bookings/refund-request`, () => HttpResponse.json(makeRefundRequest(), { status: 201 })),
  http.post(`${BASE}/bookings/:id/cancel`, ({ params }) =>
    HttpResponse.json(makeBooking({ id: Number(params.id), status: 'cancelled' }))
  ),
  http.post(`${BASE}/bookings/:id/approve`, ({ params }) =>
    HttpResponse.json(makeBooking({ id: Number(params.id), status: 'pending' }))
  ),
  http.post(`${BASE}/bookings/:id/decline`, ({ params }) =>
    HttpResponse.json(makeBooking({ id: Number(params.id), status: 'declined' }))
  ),
  http.post(`${BASE}/bookings/:id/create-payment`, () =>
    HttpResponse.json({ authorization_url: 'https://paystack.com/pay/test', access_code: 'abc', reference: 'ref_xyz', amount_kobo: 25000 })
  ),
  http.post(`${BASE}/bookings/:id/report-non-return`, ({ params }) =>
    HttpResponse.json(makeNonReturnReport({ booking_id: Number(params.id) }), { status: 201 })
  ),

  // Refunds (admin)
  http.get(`${BASE}/bookings/admin/refunds`, () => HttpResponse.json([makeRefundRequest()])),
  http.get(`${BASE}/bookings/admin/refunds/pending`, () => HttpResponse.json([])),
  http.post(`${BASE}/bookings/admin/refunds/:id/process`, () =>
    HttpResponse.json(makeRefundRequest({ status: 'approved' }))
  ),

  // Admin
  http.get(`${BASE}/admin/stats`, () =>
    HttpResponse.json({ total_users: 10, total_listings: 5, total_bookings: 20, active_bookings: 3, total_revenue: 1000, pending_refunds: 1 })
  ),
  http.get(`${BASE}/admin/users`, () =>
    HttpResponse.json(makePaginated([makeUser(), makeAdmin()]))
  ),
  http.get(`${BASE}/admin/listings`, () =>
    HttpResponse.json(makePaginated([makeEquipment({ status: 'pending_review' })]))
  ),
  http.post(`${BASE}/admin/listings/:id/approve`, ({ params }) =>
    HttpResponse.json(makeEquipment({ id: Number(params.id), status: 'approved' }))
  ),
  http.post(`${BASE}/admin/listings/:id/reject`, ({ params }) =>
    HttpResponse.json(makeEquipment({ id: Number(params.id), status: 'rejected' }))
  ),
  http.get(`${BASE}/admin/non-return-reports`, () =>
    HttpResponse.json([makeNonReturnReport()])
  ),
  http.patch(`${BASE}/admin/non-return-reports/:id`, ({ params }) =>
    HttpResponse.json(makeNonReturnReport({ id: Number(params.id), status: 'reviewed' }))
  ),
  http.get(`${BASE}/admin/payouts`, () =>
    HttpResponse.json(makePaginated([makeBooking({ payout_status: 'paid', payout_reference: 'TRF_abc123' })]))
  ),

  // Notifications
  http.get(`${BASE}/notifications/`, () => HttpResponse.json([])),
  http.get(`${BASE}/notifications/unread-count`, () => HttpResponse.json({ count: 0 })),

  // Wishlist
  http.get(`${BASE}/wishlist/`, () => HttpResponse.json([])),
  http.get(`${BASE}/wishlist/ids`, () => HttpResponse.json({ ids: [] })),
];

export const server = setupServer(...handlers);
