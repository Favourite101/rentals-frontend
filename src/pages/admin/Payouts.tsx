import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Loader } from '@/components/ui/Loader';
import { adminApi } from '@/lib/api/admin';
import { QUERY_KEYS } from '@/constants';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { Banknote, User as UserIcon } from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { ROUTES } from '@/constants';

export const Payouts: React.FC = () => {
    const { data: payoutsData, isLoading } = useQuery({
        queryKey: [QUERY_KEYS.PAYOUTS],
        queryFn: () => adminApi.getPayouts(0, 200),
    });
    const payouts = payoutsData?.items ?? [];

    const totalPaid = payouts.reduce((sum, b) => sum + (b.lender_payout_amount ?? 0), 0);

    return (
        <Layout>
            <div className="container-custom py-12">
                <BackButton to={ROUTES.ADMIN_DASHBOARD} label="Admin Dashboard" />
                <div className="flex items-center gap-3 mb-8">
                    <Banknote className="h-8 w-8 text-emerald-600" />
                    <div>
                        <h1 className="text-3xl font-bold">Payout History</h1>
                        <p className="text-gray-600">All completed lender payouts processed via Paystack</p>
                    </div>
                </div>

                {/* Summary stat */}
                <div className="grid gap-4 md:grid-cols-2 mb-8">
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-sm text-gray-500">Total Paid Out</p>
                            <p className="text-3xl font-bold text-emerald-600">{formatCurrency(totalPaid)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-sm text-gray-500">Payout Transactions</p>
                            <p className="text-3xl font-bold">{payouts.length}</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center py-8"><Loader size="lg" /></div>
                        ) : payouts.length === 0 ? (
                            <div className="text-center py-12">
                                <Banknote className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No payouts processed yet.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 font-semibold">Lender</th>
                                            <th className="text-left py-3 px-4 font-semibold">Equipment</th>
                                            <th className="text-left py-3 px-4 font-semibold">Rental Period</th>
                                            <th className="text-left py-3 px-4 font-semibold">Amount</th>
                                            <th className="text-left py-3 px-4 font-semibold">Reference</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payouts.map((booking) => (
                                            <tr key={booking.id} className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <UserIcon className="h-4 w-4 text-gray-400" />
                                                        {booking.lender?.name ?? `#${booking.lender_id}`}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 font-medium">{booking.equipment.name}</td>
                                                <td className="py-3 px-4 text-gray-600">
                                                    {formatDate(booking.start_date)} – {formatDate(booking.end_date)}
                                                </td>
                                                <td className="py-3 px-4 font-semibold text-emerald-600">
                                                    {formatCurrency(booking.lender_payout_amount ?? 0)}
                                                </td>
                                                <td className="py-3 px-4 text-xs text-gray-400 font-mono">
                                                    {booking.payout_reference ?? '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
};
