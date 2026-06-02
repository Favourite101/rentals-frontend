import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Loader } from '@/components/ui/Loader';
import { Badge } from '@/components/ui/Badge';
import { adminApi } from '@/lib/api/admin';
import { showToast } from '@/lib/hooks/useToast';
import { handleApiError } from '@/lib/api/axios';
import { QUERY_KEYS, EQUIPMENT_STATUS_LABELS, EQUIPMENT_STATUS_COLORS } from '@/constants';
import { formatCurrency } from '@/lib/utils/formatters';
import { CheckCircle, XCircle, Package, User as UserIcon, ClipboardList } from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { ROUTES } from '@/constants';
import type { Equipment } from '@/types';

export const ListingApproval: React.FC = () => {
    const queryClient = useQueryClient();
    const [rejectTarget, setRejectTarget] = React.useState<Equipment | null>(null);
    const [rejectReason, setRejectReason] = React.useState('');

    const { data: listingsData, isLoading } = useQuery({
        queryKey: [QUERY_KEYS.ADMIN_LISTINGS, 'pending'],
        queryFn: () => adminApi.getListings(0, 200),
    });
    const pendingListings = (listingsData?.items ?? []).filter(l => l.status === 'pending_review');

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_LISTINGS] });
    };

    const approveMutation = useMutation({
        mutationFn: (id: number) => adminApi.approveListing(id),
        onSuccess: () => { invalidate(); showToast('Listing approved!', 'success'); },
        onError: (error) => showToast(handleApiError(error), 'error'),
    });

    const rejectMutation = useMutation({
        mutationFn: ({ id, reason }: { id: number; reason: string }) =>
            adminApi.rejectListing(id, reason),
        onSuccess: () => {
            invalidate();
            showToast('Listing rejected.', 'success');
            setRejectTarget(null);
            setRejectReason('');
        },
        onError: (error) => showToast(handleApiError(error), 'error'),
    });

    return (
        <Layout>
            <div className="container-custom py-12">
                <BackButton to={ROUTES.ADMIN_DASHBOARD} label="Admin Dashboard" />
                <div className="flex items-center gap-3 mb-8">
                    <ClipboardList className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold">Listing Approval Queue</h1>
                        <p className="text-gray-600">Review and approve new equipment listings</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            Pending Review
                            {pendingListings.length > 0 && (
                                <Badge className="ml-2 bg-amber-100 text-amber-800">{pendingListings.length}</Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center py-8"><Loader size="lg" /></div>
                        ) : pendingListings.length === 0 ? (
                            <div className="text-center py-12">
                                <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
                                <p className="text-gray-500">All caught up — no listings pending review.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 font-semibold">Item</th>
                                            <th className="text-left py-3 px-4 font-semibold">Owner</th>
                                            <th className="text-left py-3 px-4 font-semibold">Category</th>
                                            <th className="text-left py-3 px-4 font-semibold">Rate/day</th>
                                            <th className="text-left py-3 px-4 font-semibold">Status</th>
                                            <th className="text-left py-3 px-4 font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingListings.map((item) => (
                                            <tr key={item.id} className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        {item.image_url ? (
                                                            <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded object-cover" />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                                                                <Package className="h-5 w-5 text-gray-400" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <span className="font-medium block">{item.name}</span>
                                                            {item.description && (
                                                                <span className="text-xs text-gray-400 line-clamp-1">{item.description}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-1">
                                                        <UserIcon className="h-3.5 w-3.5 text-gray-400" />
                                                        {item.owner?.name ?? 'Unknown'}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">{item.category?.name}</td>
                                                <td className="py-3 px-4 font-semibold">{formatCurrency(item.daily_rate)}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${EQUIPMENT_STATUS_COLORS[item.status]}`}>
                                                        {EQUIPMENT_STATUS_LABELS[item.status]}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => approveMutation.mutate(item.id)}
                                                            disabled={approveMutation.isPending}
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-1" />
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-red-600 border-red-200 hover:bg-red-50"
                                                            onClick={() => setRejectTarget(item)}
                                                        >
                                                            <XCircle className="h-4 w-4 mr-1" />
                                                            Reject
                                                        </Button>
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

                {/* Reject Modal */}
                <Modal
                    isOpen={!!rejectTarget}
                    onClose={() => { setRejectTarget(null); setRejectReason(''); }}
                    title="Reject Listing"
                    size="md"
                >
                    {rejectTarget && (
                        <div className="space-y-4">
                            <p className="text-gray-600">
                                Rejecting <strong>{rejectTarget.name}</strong> by {rejectTarget.owner?.name}. Provide a reason so the owner can fix and resubmit.
                            </p>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Reason (optional)</label>
                                <textarea
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                                    placeholder="e.g. Image quality too low, description too vague..."
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => { setRejectTarget(null); setRejectReason(''); }}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => rejectMutation.mutate({ id: rejectTarget.id, reason: rejectReason })}
                                    disabled={rejectMutation.isPending}
                                >
                                    {rejectMutation.isPending ? <><Loader size="sm" className="mr-2" />Rejecting...</> : 'Reject Listing'}
                                </Button>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </Layout>
    );
};
