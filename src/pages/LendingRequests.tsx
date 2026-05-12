import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Loader } from '@/components/ui/Loader';
import { EmptyState } from '@/components/ui/EmptyState';
import { bookingsApi } from '@/lib/api/bookings';
import { showToast } from '@/lib/hooks/useToast';
import { handleApiError } from '@/lib/api/axios';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { QUERY_KEYS, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '@/constants';
import { Bell, Eye, X, User as UserIcon, Calendar, Package } from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { ROUTES } from '@/constants';
import type { Booking } from '@/types';

export const LendingRequests: React.FC = () => {
    const queryClient = useQueryClient();
    const [selectedBooking, setSelectedBooking] = React.useState<Booking | null>(null);
    const [cancelAction, setCancelAction] = React.useState<Booking | null>(null);

    const { data: bookings = [], isLoading } = useQuery({
        queryKey: [QUERY_KEYS.LENDING_REQUESTS],
        queryFn: bookingsApi.getMyLendingRequests,
        staleTime: 0,
    });

    const cancelMutation = useMutation({
        mutationFn: (id: number) => bookingsApi.cancel(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LENDING_REQUESTS] });
            showToast('Booking cancelled successfully!', 'success');
            setCancelAction(null);
            setSelectedBooking(null);
        },
        onError: (error) => {
            showToast(handleApiError(error), 'error');
        },
    });

    const handleCancel = (booking: Booking) => {
        setCancelAction(booking);
    };

    const confirmCancel = () => {
        if (cancelAction) {
            cancelMutation.mutate(cancelAction.id);
        }
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="flex justify-center py-20">
                    <Loader size="lg" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container-custom py-12">
                <BackButton to={ROUTES.DASHBOARD} label="Back to Dashboard" />
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Lending Requests</h1>
                    <p className="text-gray-600">Track and manage bookings for items you are lending</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Requests ({bookings.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {bookings.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 font-semibold">Item</th>
                                            <th className="text-left py-3 px-4 font-semibold">Borrower</th>
                                            <th className="text-left py-3 px-4 font-semibold">Dates</th>
                                            <th className="text-left py-3 px-4 font-semibold">Earnings</th>
                                            <th className="text-left py-3 px-4 font-semibold">Status</th>
                                            <th className="text-left py-3 px-4 font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bookings.map((booking) => (
                                            <tr key={booking.id} className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-4 font-medium">{booking.equipment.name}</td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center">
                                                        <UserIcon className="h-4 w-4 mr-1 text-gray-400" />
                                                        {booking.borrower?.name || booking.user?.name || 'Unknown User'}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                                                </td>
                                                <td className="py-3 px-4 font-semibold text-emerald-600">
                                                    {formatCurrency(booking.total_price)}
                                                </td>
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
                                                        >
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            View
                                                        </Button>
                                                        {(booking.status === 'pending' || booking.status === 'confirmed') && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-red-600 hover:bg-red-50"
                                                                onClick={() => handleCancel(booking)}
                                                            >
                                                                <X className="h-4 w-4 mr-1" />
                                                                Cancel
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <EmptyState
                                icon={Bell}
                                title="No lending requests yet"
                                description="When someone borrows one of your listed items, the request will appear here."
                            />
                        )}
                    </CardContent>
                </Card>

                {/* Details Modal */}
                <Modal
                    isOpen={!!selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                    title="Booking Details"
                    size="md"
                >
                    {selectedBooking && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500">Booking Reference</span>
                                <span className="font-mono font-semibold">#{selectedBooking.id}</span>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    Your Item
                                </h4>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="font-medium">{selectedBooking.equipment.name}</p>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <UserIcon className="h-4 w-4" />
                                    Borrower Details
                                </h4>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="font-medium">{selectedBooking.borrower?.name || selectedBooking.user?.name || 'N/A'}</p>
                                    <p className="text-sm text-gray-500">
                                        {selectedBooking.borrower?.email || selectedBooking.user?.email || 'N/A'}
                                    </p>
                                    <a
                                        href={`mailto:${selectedBooking.borrower?.email || selectedBooking.user?.email || ''}`}
                                        className="text-sm text-blue-600 mt-2 hover:underline inline-block"
                                    >
                                        Contact Borrower
                                    </a>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Borrowing Period
                                </h4>
                                <div className="bg-gray-50 rounded-lg p-4 flex justify-between">
                                    <div>
                                        <span className="text-gray-500 text-sm block">Pick up</span>
                                        <span className="font-medium">{formatDate(selectedBooking.start_date)}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-gray-500 text-sm block">Return by</span>
                                        <span className="font-medium">{formatDate(selectedBooking.end_date)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-4 flex items-center justify-between">
                                <div>
                                    <span className="text-gray-500 block text-sm mb-1">Status</span>
                                    <Badge className={BOOKING_STATUS_COLORS[selectedBooking.status]}>
                                        {BOOKING_STATUS_LABELS[selectedBooking.status]}
                                    </Badge>
                                </div>
                                <div className="text-right">
                                    <span className="text-gray-500 block text-sm mb-1">Your Earnings</span>
                                    <p className="text-2xl font-bold text-emerald-600">
                                        {formatCurrency(selectedBooking.total_price)}
                                    </p>
                                </div>
                            </div>

                            {(selectedBooking.status === 'pending' || selectedBooking.status === 'confirmed') && (
                                <div className="border-t pt-4 flex justify-end">
                                    <Button
                                        variant="outline"
                                        className="text-red-600 border-red-200 hover:bg-red-50"
                                        onClick={() => {
                                            handleCancel(selectedBooking);
                                            setSelectedBooking(null);
                                        }}
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Cancel Booking
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </Modal>

                {/* Cancel Confirmation Modal */}
                <Modal
                    isOpen={!!cancelAction}
                    onClose={() => setCancelAction(null)}
                    title="Cancel Booking"
                    size="sm"
                >
                    <div className="space-y-4">
                        <p className="text-gray-600">
                            Are you sure you want to cancel this booking for <strong>{cancelAction?.equipment.name}</strong>?
                        </p>
                        {cancelAction?.status === 'confirmed' && (
                            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                                This booking has been paid. Cancelling will automatically issue a full refund to the borrower via Stripe.
                            </p>
                        )}
                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="outline" onClick={() => setCancelAction(null)}>
                                Go Back
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={confirmCancel}
                                disabled={cancelMutation.isPending}
                            >
                                {cancelMutation.isPending ? <Loader size="sm" className="mr-2" /> : null}
                                Cancel Booking
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        </Layout>
    );
};
