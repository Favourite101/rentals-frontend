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
import { Bell, Eye, X, User as UserIcon, Calendar, Package, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { ROUTES } from '@/constants';
import type { Booking } from '@/types';

export const LendingRequests: React.FC = () => {
    const queryClient = useQueryClient();
    const [selectedBooking, setSelectedBooking] = React.useState<Booking | null>(null);
    const [cancelAction, setCancelAction] = React.useState<Booking | null>(null);
    const [reportBooking, setReportBooking] = React.useState<Booking | null>(null);
    const [reportNotes, setReportNotes] = React.useState('');

    const { data: lendingData, isLoading } = useQuery({
        queryKey: [QUERY_KEYS.LENDING_REQUESTS],
        queryFn: () => bookingsApi.getMyLendingRequests(0, 100),
        staleTime: 0,
    });
    const bookings = lendingData?.items ?? [];

    const requested = bookings.filter(b => b.status === 'requested');
    const active = bookings.filter(b => !['requested', 'declined'].includes(b.status));
    const declined = bookings.filter(b => b.status === 'declined');

    const invalidate = () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LENDING_REQUESTS] });

    const approveMutation = useMutation({
        mutationFn: (id: number) => bookingsApi.approve(id),
        onSuccess: () => { invalidate(); showToast('Booking approved!', 'success'); },
        onError: (error) => showToast(handleApiError(error), 'error'),
    });

    const declineMutation = useMutation({
        mutationFn: (id: number) => bookingsApi.decline(id),
        onSuccess: () => { invalidate(); showToast('Booking declined.', 'success'); },
        onError: (error) => showToast(handleApiError(error), 'error'),
    });

    const cancelMutation = useMutation({
        mutationFn: (id: number) => bookingsApi.cancel(id),
        onSuccess: () => {
            invalidate();
            showToast('Booking cancelled.', 'success');
            setCancelAction(null);
            setSelectedBooking(null);
        },
        onError: (error) => showToast(handleApiError(error), 'error'),
    });

    const reportMutation = useMutation({
        mutationFn: ({ id, notes }: { id: number; notes: string }) =>
            bookingsApi.reportNonReturn(id, notes),
        onSuccess: () => {
            invalidate();
            showToast('Non-return report submitted.', 'success');
            setReportBooking(null);
            setReportNotes('');
        },
        onError: (error) => showToast(handleApiError(error), 'error'),
    });

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
                <BackButton to={ROUTES.HOME} label="Browse Items" />
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Lending Requests</h1>
                    <p className="text-gray-600">Manage bookings for items you are lending</p>
                </div>

                {/* ── Awaiting Your Response ──────────────────── */}
                {requested.length > 0 && (
                    <Card className="mb-6 border-blue-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-800">
                                <Bell className="h-5 w-5" />
                                Awaiting Your Response ({requested.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {requested.map((booking) => (
                                    <div key={booking.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{booking.equipment.name}</p>
                                            <p className="text-sm text-gray-600">
                                                {booking.borrower?.name || 'Unknown'} &bull; {formatDate(booking.start_date)} – {formatDate(booking.end_date)}
                                            </p>
                                            <p className="text-sm font-semibold text-emerald-700 mt-1">{formatCurrency(booking.total_price)}</p>
                                        </div>
                                        <div className="flex gap-2 ml-4 flex-shrink-0">
                                            <Button
                                                size="sm"
                                                onClick={() => approveMutation.mutate(booking.id)}
                                                disabled={approveMutation.isPending || declineMutation.isPending}
                                            >
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                Approve
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-red-600 border-red-200 hover:bg-red-50"
                                                onClick={() => declineMutation.mutate(booking.id)}
                                                disabled={approveMutation.isPending || declineMutation.isPending}
                                            >
                                                <XCircle className="h-4 w-4 mr-1" />
                                                Decline
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => setSelectedBooking(booking)}>
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ── Active / Historical Bookings ────────────── */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>All Requests ({active.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {active.length > 0 ? (
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
                                        {active.map((booking) => (
                                            <tr key={booking.id} className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-4 font-medium">{booking.equipment.name}</td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center">
                                                        <UserIcon className="h-4 w-4 mr-1 text-gray-400" />
                                                        {booking.borrower?.name || booking.user?.name || 'Unknown'}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    {formatDate(booking.start_date)} – {formatDate(booking.end_date)}
                                                </td>
                                                <td className="py-3 px-4 font-semibold text-emerald-600">
                                                    {formatCurrency(booking.lender_payout_amount ?? booking.total_price)}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Badge className={BOOKING_STATUS_COLORS[booking.status] ?? ''}>
                                                        {BOOKING_STATUS_LABELS[booking.status] ?? booking.status}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant="outline" onClick={() => setSelectedBooking(booking)}>
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            View
                                                        </Button>
                                                        {(booking.status === 'pending' || booking.status === 'confirmed') && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-red-600 hover:bg-red-50"
                                                                onClick={() => setCancelAction(booking)}
                                                            >
                                                                <X className="h-4 w-4 mr-1" />
                                                                Cancel
                                                            </Button>
                                                        )}
                                                        {booking.status === 'completed' && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-amber-600 hover:bg-amber-50"
                                                                onClick={() => setReportBooking(booking)}
                                                            >
                                                                <AlertTriangle className="h-4 w-4 mr-1" />
                                                                Report
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
                                title="No active lending requests"
                                description="When someone books one of your listed items, it will appear here."
                            />
                        )}
                    </CardContent>
                </Card>

                {/* ── Declined Bookings ───────────────────────── */}
                {declined.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-gray-500">Declined ({declined.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {declined.map((booking) => (
                                    <div key={booking.id} className="flex items-center justify-between py-3 px-4 rounded-lg bg-gray-50 border border-gray-100 text-sm text-gray-500">
                                        <span>{booking.equipment.name}</span>
                                        <span>{booking.borrower?.name || 'Unknown'}</span>
                                        <span>{formatDate(booking.start_date)} – {formatDate(booking.end_date)}</span>
                                        <Badge className={BOOKING_STATUS_COLORS.declined}>Declined</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ── Booking Details Modal ───────────────────── */}
                <Modal isOpen={!!selectedBooking} onClose={() => setSelectedBooking(null)} title="Booking Details" size="md">
                    {selectedBooking && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500">Booking Reference</span>
                                <span className="font-mono font-semibold">#{selectedBooking.id}</span>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <Package className="h-4 w-4" /> Your Item
                                </h4>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="font-medium">{selectedBooking.equipment.name}</p>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <UserIcon className="h-4 w-4" /> Borrower
                                </h4>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="font-medium">{selectedBooking.borrower?.name || selectedBooking.user?.name || 'N/A'}</p>
                                    <p className="text-sm text-gray-500">{selectedBooking.borrower?.email || selectedBooking.user?.email || 'N/A'}</p>
                                    {(selectedBooking.borrower?.whatsapp_number || selectedBooking.borrower?.whatsapp_number) && (
                                        <a
                                            href={`https://wa.me/${(selectedBooking.borrower?.whatsapp_number || '').replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-green-600 mt-2 hover:underline inline-block"
                                        >
                                            WhatsApp
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" /> Rental Period
                                </h4>
                                <div className="bg-gray-50 rounded-lg p-4 flex justify-between">
                                    <div>
                                        <span className="text-gray-500 text-sm block">From</span>
                                        <span className="font-medium">{formatDate(selectedBooking.start_date)}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-gray-500 text-sm block">To</span>
                                        <span className="font-medium">{formatDate(selectedBooking.end_date)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-4 flex items-center justify-between">
                                <div>
                                    <span className="text-gray-500 block text-sm mb-1">Status</span>
                                    <Badge className={BOOKING_STATUS_COLORS[selectedBooking.status] ?? ''}>
                                        {BOOKING_STATUS_LABELS[selectedBooking.status] ?? selectedBooking.status}
                                    </Badge>
                                </div>
                                <div className="text-right">
                                    <span className="text-gray-500 block text-sm mb-1">Your Payout</span>
                                    <p className="text-2xl font-bold text-emerald-600">
                                        {formatCurrency(selectedBooking.lender_payout_amount ?? selectedBooking.total_price)}
                                    </p>
                                </div>
                            </div>

                            {selectedBooking.status === 'requested' && (
                                <div className="border-t pt-4 flex gap-3 justify-end">
                                    <Button
                                        variant="outline"
                                        className="text-red-600 border-red-200 hover:bg-red-50"
                                        onClick={() => { declineMutation.mutate(selectedBooking.id); setSelectedBooking(null); }}
                                        disabled={declineMutation.isPending}
                                    >
                                        <XCircle className="h-4 w-4 mr-2" /> Decline
                                    </Button>
                                    <Button
                                        onClick={() => { approveMutation.mutate(selectedBooking.id); setSelectedBooking(null); }}
                                        disabled={approveMutation.isPending}
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" /> Approve
                                    </Button>
                                </div>
                            )}

                            {(selectedBooking.status === 'pending' || selectedBooking.status === 'confirmed') && (
                                <div className="border-t pt-4 flex justify-end">
                                    <Button
                                        variant="outline"
                                        className="text-red-600 border-red-200 hover:bg-red-50"
                                        onClick={() => { setCancelAction(selectedBooking); setSelectedBooking(null); }}
                                    >
                                        <X className="h-4 w-4 mr-2" /> Cancel Booking
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </Modal>

                {/* ── Cancel Confirmation ─────────────────────── */}
                <Modal isOpen={!!cancelAction} onClose={() => setCancelAction(null)} title="Cancel Booking" size="sm">
                    <div className="space-y-4">
                        <p className="text-gray-600">
                            Cancel booking for <strong>{cancelAction?.equipment.name}</strong>?
                        </p>
                        {cancelAction?.status === 'confirmed' && (
                            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                                This booking has been paid. Cancelling will automatically issue a full refund to the borrower via Paystack.
                            </p>
                        )}
                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="outline" onClick={() => setCancelAction(null)}>Go Back</Button>
                            <Button
                                variant="destructive"
                                onClick={() => cancelAction && cancelMutation.mutate(cancelAction.id)}
                                disabled={cancelMutation.isPending}
                            >
                                {cancelMutation.isPending ? <Loader size="sm" className="mr-2" /> : null}
                                Cancel Booking
                            </Button>
                        </div>
                    </div>
                </Modal>

                {/* ── Report Non-Return Modal ─────────────────── */}
                <Modal isOpen={!!reportBooking} onClose={() => { setReportBooking(null); setReportNotes(''); }} title="Report Non-Return" size="md">
                    {reportBooking && (
                        <div className="space-y-4">
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                                Only use this if the borrower has not returned <strong>{reportBooking.equipment.name}</strong>. Admin will review and decide on the security deposit.
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Notes (optional)</label>
                                <textarea
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                                    placeholder="Describe the situation..."
                                    value={reportNotes}
                                    onChange={(e) => setReportNotes(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => { setReportBooking(null); setReportNotes(''); }}>Cancel</Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => reportMutation.mutate({ id: reportBooking.id, notes: reportNotes })}
                                    disabled={reportMutation.isPending}
                                >
                                    {reportMutation.isPending ? <><Loader size="sm" className="mr-2" />Submitting...</> : 'Submit Report'}
                                </Button>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </Layout>
    );
};
