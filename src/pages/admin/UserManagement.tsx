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
import { QUERY_KEYS } from '@/constants';
import { Trash2, Users, Shield, User as UserIcon } from 'lucide-react';
import { formatDate } from '@/lib/utils/formatters';
import type { User } from '@/types';

export const UserManagement: React.FC = () => {
    const queryClient = useQueryClient();
    const [deleteConfirm, setDeleteConfirm] = React.useState<User | null>(null);

    const { data: users = [], isLoading } = useQuery({
        queryKey: [QUERY_KEYS.ADMIN_USERS],
        queryFn: adminApi.getUsers,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => adminApi.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_USERS] });
            showToast('User deleted successfully!', 'success');
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
                        <h1 className="text-3xl font-bold mb-2">User Management</h1>
                        <p className="text-gray-600">View and manage platform users</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-gray-500" />
                            All Users ({users.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader size="lg" />
                            </div>
                        ) : users.length === 0 ? (
                            <p className="text-center py-8 text-gray-500">No users found.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 font-semibold">User</th>
                                            <th className="text-left py-3 px-4 font-semibold">Username</th>
                                            <th className="text-left py-3 px-4 font-semibold">Role</th>
                                            <th className="text-left py-3 px-4 font-semibold">Joined Date</th>
                                            <th className="text-left py-3 px-4 font-semibold flex justify-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user) => (
                                            <tr key={user.id} className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <UserIcon className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{user.name}</div>
                                                            <div className="text-sm text-gray-500">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">@{user.username}</td>
                                                <td className="py-3 px-4">
                                                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                                        {user.role === 'admin' ? (
                                                            <span className="flex items-center gap-1">
                                                                <Shield className="h-3 w-3" /> Admin
                                                            </span>
                                                        ) : (
                                                            'User'
                                                        )}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-600">
                                                    {user.created_at ? formatDate(user.created_at) : 'N/A'}
                                                </td>
                                                <td className="py-3 px-4 flex justify-end">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-red-600 hover:bg-red-50 hover:border-red-200"
                                                        onClick={() => setDeleteConfirm(user)}
                                                        disabled={user.role === 'admin'}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                        Remove
                                                    </Button>
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
                    title="Remove User"
                    size="sm"
                >
                    <div className="space-y-4">
                        <p className="text-gray-600">
                            Are you sure you want to remove user <strong>{deleteConfirm?.name}</strong>? This will permanently delete their account and associated listings. This action cannot be undone.
                        </p>
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
                                    'Remove User'
                                )}
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        </Layout>
    );
};
