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
import { formatDate } from '@/lib/utils/formatters';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { ROUTES } from '@/constants';
import type { NonReturnReport } from '@/types';

export const NonReturnReports: React.FC = () => {
    const queryClient = useQueryClient();
    const [reviewing, setReviewing] = React.useState<NonReturnReport | null>(null);
    const [forfeitDeposit, setForfeitDeposit] = React.useState(false);

    const { data: reports = [], isLoading } = useQuery({
        queryKey: [QUERY_KEYS.NON_RETURN_REPORTS],
        queryFn: () => adminApi.getNonReturnReports(0, 100),
    });

    const processMutation = useMutation({
        mutationFn: ({ id, forfeit }: { id: number; forfeit: boolean }) =>
            adminApi.processNonReturnReport(id, forfeit),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NON_RETURN_REPORTS] });
            showToast('Report processed.', 'success');
            setReviewing(null);
        },
        onError: (error) => showToast(handleApiError(error), 'error'),
    });

    const open = reports.filter(r => r.status === 'open');
    const reviewed = reports.filter(r => r.status === 'reviewed');

    return (
        <Layout>
            <div className="container-custom py-12">
                <BackButton to={ROUTES.ADMIN_DASHBOARD} label="Admin Dashboard" />
                <div className="flex items-center gap-3 mb-8">
                    <AlertTriangle className="h-8 w-8 text-amber-500" />
                    <div>
                        <h1 className="text-3xl font-bold">Non-Return Reports</h1>
                        <p className="text-gray-600">Review cases where equipment was not returned</p>
                    </div>
                </div>

                {/* Open reports */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            Open Reports
                            {open.length > 0 && (
                                <Badge className="bg-red-100 text-red-800">{open.length}</Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center py-8"><Loader size="lg" /></div>
                        ) : open.length === 0 ? (
                            <div className="text-center py-10">
                                <CheckCircle className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
                                <p className="text-gray-500">No open reports.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {open.map((report) => (
                                    <ReportRow
                                        key={report.id}
                                        report={report}
                                        onReview={() => { setReviewing(report); setForfeitDeposit(false); }}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Reviewed */}
                {reviewed.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-gray-500">Reviewed ({reviewed.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {reviewed.map((report) => (
                                    <ReportRow key={report.id} report={report} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Review Modal */}
                <Modal
                    isOpen={!!reviewing}
                    onClose={() => setReviewing(null)}
                    title="Process Non-Return Report"
                    size="md"
                >
                    {reviewing && (
                        <div className="space-y-5">
                            <div className="p-4 bg-gray-50 rounded-lg text-sm space-y-1">
                                <p><span className="text-gray-500">Booking ID:</span> <strong>#{reviewing.booking_id}</strong></p>
                                <p><span className="text-gray-500">Reported:</span> {formatDate(reviewing.created_at)}</p>
                                {reviewing.notes && <p><span className="text-gray-500">Notes:</span> {reviewing.notes}</p>}
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-700">Security Deposit Decision</p>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="radio"
                                            name="deposit"
                                            checked={!forfeitDeposit}
                                            onChange={() => setForfeitDeposit(false)}
                                            className="text-primary"
                                        />
                                        <div>
                                            <p className="text-sm font-medium">Refund deposit to borrower</p>
                                            <p className="text-xs text-gray-500">Equipment was returned / dispute resolved in borrower's favour</p>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 border border-red-200 rounded-lg cursor-pointer hover:bg-red-50">
                                        <input
                                            type="radio"
                                            name="deposit"
                                            checked={forfeitDeposit}
                                            onChange={() => setForfeitDeposit(true)}
                                            className="text-red-600"
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-red-700">Forfeit deposit (pay lender)</p>
                                            <p className="text-xs text-red-500">Equipment not returned — transfer deposit to lender</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2 border-t">
                                <Button variant="outline" onClick={() => setReviewing(null)}>Cancel</Button>
                                <Button
                                    onClick={() => processMutation.mutate({ id: reviewing.id, forfeit: forfeitDeposit })}
                                    disabled={processMutation.isPending}
                                >
                                    {processMutation.isPending ? <><Loader size="sm" className="mr-2" />Processing...</> : 'Mark Reviewed'}
                                </Button>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </Layout>
    );
};

const ReportRow: React.FC<{
    report: NonReturnReport;
    onReview?: () => void;
}> = ({ report, onReview }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
        <div className="space-y-0.5">
            <p className="text-sm font-medium">Booking #{report.booking_id}</p>
            {report.notes && <p className="text-xs text-gray-500 line-clamp-1">{report.notes}</p>}
            <p className="text-xs text-gray-400">{formatDate(report.created_at)}</p>
        </div>
        <div className="flex items-center gap-3">
            <Badge className={report.status === 'open' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}>
                {report.status === 'open' ? 'Open' : 'Reviewed'}
            </Badge>
            {onReview && (
                <Button size="sm" onClick={onReview}>Review</Button>
            )}
        </div>
    </div>
);
