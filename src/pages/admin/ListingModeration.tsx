import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Loader } from '@/components/ui/Loader';
import { adminApi } from '@/lib/api/admin';
import { showToast } from '@/lib/hooks/useToast';
import { handleApiError } from '@/lib/api/axios';
import { QUERY_KEYS } from '@/constants';
import { formatCurrency } from '@/lib/utils/formatters';
import { ShieldAlert, Package, User as UserIcon } from 'lucide-react';
import type { Equipment } from '@/types';

export const ListingModeration: React.FC = () => {
    const queryClient = useQueryClient();
    const [deleteConfirm, setDeleteConfirm] = React.useState<Equipment | null>(null);

    const { data: listings = [], isLoading } = useQuery({
        queryKey: [QUERY_KEYS.ADMIN_LISTINGS],
        queryFn: adminApi.getListings,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => adminApi.deleteListing(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_LISTINGS] });
            showToast('Listing removed successfully!', 'success');
            setDeleteConfirm(null);
        },
        onError: (error) => {
            showToast(handleApiError(error), 'error');
        },
    });

    return (
        <Layout>
            <div className="container-custom py-12">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Listing Moderation</h1>
                        <p className="text-gray-600">Review and moderate all community items</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Listings ({listings.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader size="lg" />
                            </div>
                        ) : listings.length === 0 ? (
                            <p className="text-center py-8 text-gray-500">No listings found on the platform.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 font-semibold">Item & Owner</th>
                                            <th className="text-left py-3 px-4 font-semibold">Category</th>
                                            <th className="text-left py-3 px-4 font-semibold">Daily Rate</th>
                                            <th className="text-left py-3 px-4 font-semibold">Status</th>
                                            <th className="text-left py-3 px-4 font-semibold flex justify-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {listings.map((item) => (
                                            <tr key={item.id} className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        {item.image_url ? (
                                                            <img
                                                                src={item.image_url}
                                                                alt={item.name}
                                                                className="w-10 h-10 rounded object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                                                                <Package className="h-5 w-5 text-gray-400" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <span className="font-medium block">{item.name}</span>
                                                            <div className="flex items-center text-xs text-gray-500 mt-1">
                                                                <UserIcon className="h-3 w-3 mr-1" />
                                                                {item.owner ? item.owner.name : 'Unknown User'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">{item.category?.name}</td>
                                                <td className="py-3 px-4">{formatCurrency(item.daily_rate)}</td>
                                                <td className="py-3 px-4">
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${item.is_available
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                            }`}
                                                    >
                                                        {item.is_available ? 'Available' : 'Unavailable'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 flex justify-end">
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-red-600 hover:bg-red-50 hover:border-red-200"
                                                            onClick={() => setDeleteConfirm(item)}
                                                        >
                                                            <ShieldAlert className="h-4 w-4 mr-1" />
                                                            Remove Listing
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

                {/* Delete Confirmation Modal */}
                <Modal
                    isOpen={!!deleteConfirm}
                    onClose={() => setDeleteConfirm(null)}
                    title="Remove Listing"
                    size="sm"
                >
                    <div className="space-y-4">
                        <p className="text-gray-600">
                            Are you sure you want to remove <strong>{deleteConfirm?.name}</strong>? This action will permanently delete the item from the platform.
                        </p>
                        <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-800 border border-amber-200">
                            This action is typically taken for violating platform rules or inappropriate content.
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm.id)}
                                disabled={deleteMutation.isPending}
                            >
                                {deleteMutation.isPending ? (
                                    <>
                                        <Loader size="sm" className="mr-2" />
                                        Removing...
                                    </>
                                ) : (
                                    'Remove Listing'
                                )}
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        </Layout>
    );
};
