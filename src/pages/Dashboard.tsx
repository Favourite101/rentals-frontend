import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Label } from '@/components/ui/Label';
import { PageLoader, Loader } from '@/components/ui/Loader';
import { EmptyState } from '@/components/ui/EmptyState';
import { bookingsApi } from '@/lib/api/bookings';
import { showToast } from '@/lib/hooks/useToast';
import { handleApiError } from '@/lib/api/axios';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { QUERY_KEYS, ROUTES, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '@/constants';
import { Package, Calendar, Clock, CheckCircle, Receipt, List, Bell } from 'lucide-react';
import type { Booking } from '@/types';

export const Dashboard: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: [QUERY_KEYS.MY_BOOKINGS],
    queryFn: bookingsApi.getMyBookings,
  });

  // Refund request state
  const [refundBooking, setRefundBooking] = React.useState<Booking | null>(null);
  const [refundReason, setRefundReason] = React.useState('');

  // Track which bookings have had "Book Again" clicked
  const [rebookedIds, setRebookedIds] = React.useState<Set<number>>(() => {
    const stored = localStorage.getItem('rebooked_bookings');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  // Track which bookings have had refund requested
  const [refundRequestedIds, setRefundRequestedIds] = React.useState<Set<number>>(() => {
    const stored = localStorage.getItem('refund_requested_bookings');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  const refundMutation = useMutation({
    mutationFn: bookingsApi.requestRefund,
    onSuccess: (_, variables) => {
      const newRefundRequestedIds = new Set(refundRequestedIds);
      newRefundRequestedIds.add(variables.booking_id);
      setRefundRequestedIds(newRefundRequestedIds);
      localStorage.setItem('refund_requested_bookings', JSON.stringify([...newRefundRequestedIds]));

      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_BOOKINGS] });
      showToast('Refund request submitted successfully!', 'success');
      setRefundBooking(null);
      setRefundReason('');
    },
    onError: (error) => {
      showToast(handleApiError(error), 'error');
    },
  });

  const handleRefundRequest = () => {
    if (!refundBooking || refundReason.length < 10) return;
    refundMutation.mutate({
      booking_id: refundBooking.id,
      reason: refundReason,
    });
  };

  const handleBookAgain = (bookingId: number) => {
    const newRebookedIds = new Set(rebookedIds);
    newRebookedIds.add(bookingId);
    setRebookedIds(newRebookedIds);
    localStorage.setItem('rebooked_bookings', JSON.stringify([...newRebookedIds]));
  };

  const stats = React.useMemo(() => {
    const total = bookings.length;
    const active = bookings.filter(b => b.status === 'confirmed').length;
    const pending = bookings.filter(b => b.status === 'pending').length;

    return { total, active, pending };
  }, [bookings]);

  if (isLoading) {
    return (
      <Layout>
        <PageLoader />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-custom py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">Your borrowing activity</p>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Package className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Bookings</p>
                  <p className="text-3xl font-bold">{stats.active}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Payment</p>
                  <p className="text-3xl font-bold">{stats.pending}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex flex-wrap gap-4">
          <Link to={ROUTES.EQUIPMENT}>
            <Button size="lg">
              <Package className="mr-2 h-5 w-5" />
              Browse Items
            </Button>
          </Link>
          <Link to={ROUTES.MY_LISTINGS}>
            <Button size="lg" variant="outline">
              <List className="mr-2 h-5 w-5" />
              My Listings
            </Button>
          </Link>
          <Link to={ROUTES.LENDING_REQUESTS}>
            <Button size="lg" variant="outline">
              <Bell className="mr-2 h-5 w-5" />
              Lending Requests
            </Button>
          </Link>
          <Link to={ROUTES.MY_REFUNDS}>
            <Button size="lg" variant="outline">
              <Receipt className="mr-2 h-5 w-5" />
              My Refund Requests
            </Button>
          </Link>
        </div>

        {/* Bookings Table */}
        <Card>
          <CardHeader>
            <CardTitle>My Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Equipment</th>
                      <th className="text-left py-3 px-4 font-semibold">Dates</th>
                      <th className="text-left py-3 px-4 font-semibold">Total</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium">{booking.equipment.name}</div>
                          <div className="text-sm text-gray-600">{booking.equipment.category?.name}</div>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div>{formatDate(booking.start_date)}</div>
                          <div className="text-gray-600">to {formatDate(booking.end_date)}</div>
                        </td>
                        <td className="py-3 px-4 font-semibold">{formatCurrency(booking.total_price)}</td>
                        <td className="py-3 px-4">
                          <Badge className={BOOKING_STATUS_COLORS[booking.status]}>
                            {BOOKING_STATUS_LABELS[booking.status]}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {booking.status === 'pending' && (
                            <Link to={`/booking/${booking.id}/payment`}>
                              <Button size="sm">Pay Now</Button>
                            </Link>
                          )}
                          {booking.status === 'confirmed' && !refundRequestedIds.has(booking.id) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setRefundBooking(booking)}
                            >
                              Request Refund
                            </Button>
                          )}
                          {booking.status === 'confirmed' && refundRequestedIds.has(booking.id) && (
                            <span className="text-xs text-amber-600">Refund Requested</span>
                          )}
                          {booking.status === 'expired' && !rebookedIds.has(booking.id) && (
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-500">Payment window expired</span>
                              <Link
                                to={`/equipment/${booking.equipment.slug}`}
                                onClick={() => handleBookAgain(booking.id)}
                              >
                                <Button size="sm" variant="outline">Book Again</Button>
                              </Link>
                            </div>
                          )}
                          {booking.status === 'expired' && rebookedIds.has(booking.id) && (
                            <span className="text-xs text-gray-500">Rebooked</span>
                          )}
                          {booking.status === 'cancelled' && !rebookedIds.has(booking.id) && (
                            <Link
                              to={`/equipment/${booking.equipment.slug}`}
                              onClick={() => handleBookAgain(booking.id)}
                            >
                              <Button size="sm" variant="outline">Book Again</Button>
                            </Link>
                          )}
                          {booking.status === 'cancelled' && rebookedIds.has(booking.id) && (
                            <span className="text-xs text-gray-500">Rebooked</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={Calendar}
                title="No bookings yet"
                description="Start by browsing our equipment catalog and make your first booking."
                action={
                  <Link to={ROUTES.EQUIPMENT}>
                    <Button>Browse Equipment</Button>
                  </Link>
                }
              />
            )}
          </CardContent>
        </Card>

        {/* Refund Request Modal */}
        <Modal
          isOpen={!!refundBooking}
          onClose={() => {
            setRefundBooking(null);
            setRefundReason('');
          }}
          title="Request Refund"
          size="md"
        >
          {refundBooking && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium">{refundBooking.equipment.name}</p>
                <p className="text-sm text-gray-600">
                  {formatDate(refundBooking.start_date)} - {formatDate(refundBooking.end_date)}
                </p>
                <p className="text-lg font-semibold mt-2">
                  Refund Amount: {formatCurrency(refundBooking.total_price)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="refundReason">
                  Reason for Refund <span className="text-red-500">*</span>
                </Label>
                <textarea
                  id="refundReason"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]"
                  placeholder="Please explain why you are requesting a refund (minimum 10 characters)..."
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                />
                {refundReason.length > 0 && refundReason.length < 10 && (
                  <p className="text-sm text-red-600">
                    Reason must be at least 10 characters ({10 - refundReason.length} more needed)
                  </p>
                )}
              </div>

              <p className="text-sm text-gray-600">
                Your refund request will be reviewed by our team. You'll be notified by email once it's processed.
              </p>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setRefundBooking(null);
                    setRefundReason('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleRefundRequest}
                  disabled={refundReason.length < 10 || refundMutation.isPending}
                >
                  {refundMutation.isPending ? (
                    <>
                      <Loader size="sm" className="mr-2" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};
