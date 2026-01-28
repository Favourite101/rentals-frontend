import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Loader } from '@/components/ui/Loader';
import { bookingsApi } from '@/lib/api/bookings';
import { showToast } from '@/lib/hooks/useToast';
import { handleApiError } from '@/lib/api/axios';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { QUERY_KEYS, BOOKING_STATUS_COLORS, BOOKING_STATUS_LABELS } from '@/constants';
import { Check, X, Eye, Calendar, User, Package } from 'lucide-react';
import type { Booking } from '@/types';

export const BookingManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedBooking, setSelectedBooking] = React.useState<Booking | null>(null);
  const [statusAction, setStatusAction] = React.useState<{ booking: Booking; newStatus: 'confirmed' | 'cancelled' } | null>(null);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: [QUERY_KEYS.ALL_BOOKINGS],
    queryFn: bookingsApi.getAllBookings,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'confirmed' | 'cancelled' }) =>
      bookingsApi.updateStatus(id, { status }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ALL_BOOKINGS] });
      showToast(
        `Booking ${variables.status === 'confirmed' ? 'confirmed' : 'cancelled'} successfully!`,
        'success'
      );
      setStatusAction(null);
    },
    onError: (error) => {
      showToast(handleApiError(error), 'error');
    },
  });

  const handleStatusChange = (booking: Booking, newStatus: 'confirmed' | 'cancelled') => {
    setStatusAction({ booking, newStatus });
  };

  const confirmStatusChange = () => {
    if (statusAction) {
      updateStatusMutation.mutate({
        id: statusAction.booking.id,
        status: statusAction.newStatus,
      });
    }
  };

  // Group bookings by status for summary
  const bookingSummary = React.useMemo(() => {
    return {
      pending: bookings.filter((b) => b.status === 'pending').length,
      confirmed: bookings.filter((b) => b.status === 'confirmed').length,
      cancelled: bookings.filter((b) => b.status === 'cancelled').length,
      total: bookings.length,
    };
  }, [bookings]);

  return (
    <Layout>
      <div className="container-custom py-12">
        <h1 className="text-3xl font-bold mb-8">Booking Management</h1>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{bookingSummary.total}</div>
              <p className="text-sm text-gray-500">Total Bookings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-amber-600">{bookingSummary.pending}</div>
              <p className="text-sm text-gray-500">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{bookingSummary.confirmed}</div>
              <p className="text-sm text-gray-500">Confirmed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">{bookingSummary.cancelled}</div>
              <p className="text-sm text-gray-500">Cancelled</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader size="lg" />
              </div>
            ) : bookings.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No bookings found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">ID</th>
                      <th className="text-left py-3 px-4 font-semibold">Equipment</th>
                      <th className="text-left py-3 px-4 font-semibold">User</th>
                      <th className="text-left py-3 px-4 font-semibold">Dates</th>
                      <th className="text-left py-3 px-4 font-semibold">Total</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-sm">#{booking.id}</td>
                        <td className="py-3 px-4">{booking.equipment.name}</td>
                        <td className="py-3 px-4">{booking.user?.name || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm">
                          {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                        </td>
                        <td className="py-3 px-4 font-semibold">{formatCurrency(booking.total_price)}</td>
                        <td className="py-3 px-4">
                          <Badge className={BOOKING_STATUS_COLORS[booking.status]}>
                            {BOOKING_STATUS_LABELS[booking.status]}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedBooking(booking)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {booking.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 hover:bg-green-50"
                                  onClick={() => handleStatusChange(booking, 'confirmed')}
                                  title="Confirm Booking"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:bg-red-50"
                                  onClick={() => handleStatusChange(booking, 'cancelled')}
                                  title="Cancel Booking"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Details Modal */}
        <Modal
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          title="Booking Details"
          size="md"
        >
          {selectedBooking && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Booking ID</span>
                <span className="font-mono font-semibold">#{selectedBooking.id}</span>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Equipment
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium">{selectedBooking.equipment.name}</p>
                  <p className="text-sm text-gray-500">{selectedBooking.equipment.category.name}</p>
                  <p className="text-sm mt-1">
                    Daily Rate: {formatCurrency(selectedBooking.equipment.daily_rate)}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Customer
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium">{selectedBooking.user?.name || 'N/A'}</p>
                  <p className="text-sm text-gray-500">{selectedBooking.user?.email || 'N/A'}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Rental Period
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p>
                    <span className="text-gray-500">Start:</span>{' '}
                    {formatDate(selectedBooking.start_date)}
                  </p>
                  <p>
                    <span className="text-gray-500">End:</span>{' '}
                    {formatDate(selectedBooking.end_date)}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4 flex items-center justify-between">
                <div>
                  <span className="text-gray-500">Status</span>
                  <div className="mt-1">
                    <Badge className={BOOKING_STATUS_COLORS[selectedBooking.status]}>
                      {BOOKING_STATUS_LABELS[selectedBooking.status]}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-gray-500">Total Price</span>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(selectedBooking.total_price)}
                  </p>
                </div>
              </div>

              {selectedBooking.status === 'pending' && (
                <div className="border-t pt-4 flex justify-end gap-3">
                  <Button
                    variant="outline"
                    className="text-red-600"
                    onClick={() => {
                      setSelectedBooking(null);
                      handleStatusChange(selectedBooking, 'cancelled');
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel Booking
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedBooking(null);
                      handleStatusChange(selectedBooking, 'confirmed');
                    }}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Confirm Booking
                  </Button>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Status Change Confirmation Modal */}
        <Modal
          isOpen={!!statusAction}
          onClose={() => setStatusAction(null)}
          title={statusAction?.newStatus === 'confirmed' ? 'Confirm Booking' : 'Cancel Booking'}
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to{' '}
              <strong>{statusAction?.newStatus === 'confirmed' ? 'confirm' : 'cancel'}</strong> booking{' '}
              <strong>#{statusAction?.booking.id}</strong> for{' '}
              <strong>{statusAction?.booking.equipment.name}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setStatusAction(null)}>
                Go Back
              </Button>
              <Button
                variant={statusAction?.newStatus === 'confirmed' ? 'default' : 'destructive'}
                onClick={confirmStatusChange}
                disabled={updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending ? (
                  <>
                    <Loader size="sm" className="mr-2" />
                    Processing...
                  </>
                ) : statusAction?.newStatus === 'confirmed' ? (
                  'Confirm Booking'
                ) : (
                  'Cancel Booking'
                )}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};
