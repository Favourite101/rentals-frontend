import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Loader } from '@/components/ui/Loader';
import { Label } from '@/components/ui/Label';
import { bookingsApi } from '@/lib/api/bookings';
import { showToast } from '@/lib/hooks/useToast';
import { handleApiError } from '@/lib/api/axios';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils/formatters';
import { QUERY_KEYS, REFUND_STATUS_COLORS, REFUND_STATUS_LABELS } from '@/constants';
import { Check, X, Eye, Clock, CheckCircle, XCircle, DollarSign, User, Package } from 'lucide-react';
import type { RefundRequest } from '@/types';

export const RefundManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedRefund, setSelectedRefund] = React.useState<RefundRequest | null>(null);
  const [processAction, setProcessAction] = React.useState<{ refund: RefundRequest; approved: boolean } | null>(null);
  const [adminNotes, setAdminNotes] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'pending' | 'all'>('pending');

  const { data: allRefunds = [], isLoading: loadingAll } = useQuery({
    queryKey: [QUERY_KEYS.ALL_REFUNDS],
    queryFn: bookingsApi.getAllRefunds,
  });

  const { data: pendingRefunds = [], isLoading: loadingPending } = useQuery({
    queryKey: [QUERY_KEYS.PENDING_REFUNDS],
    queryFn: bookingsApi.getPendingRefunds,
  });

  const processRefundMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { approved: boolean; admin_notes?: string } }) =>
      bookingsApi.processRefund(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ALL_REFUNDS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PENDING_REFUNDS] });
      showToast(
        `Refund ${variables.data.approved ? 'approved' : 'rejected'} successfully!`,
        'success'
      );
      setProcessAction(null);
      setAdminNotes('');
    },
    onError: (error) => {
      showToast(handleApiError(error), 'error');
    },
  });

  const handleProcess = (refund: RefundRequest, approved: boolean) => {
    setProcessAction({ refund, approved });
    setAdminNotes('');
  };

  const confirmProcess = () => {
    if (processAction) {
      processRefundMutation.mutate({
        id: processAction.refund.id,
        data: {
          approved: processAction.approved,
          admin_notes: adminNotes || undefined,
        },
      });
    }
  };

  const isLoading = activeTab === 'pending' ? loadingPending : loadingAll;
  const refunds = activeTab === 'pending' ? pendingRefunds : allRefunds;

  // Summary stats
  const stats = React.useMemo(() => ({
    pending: allRefunds.filter(r => r.status === 'pending').length,
    approved: allRefunds.filter(r => r.status === 'approved').length,
    rejected: allRefunds.filter(r => r.status === 'rejected').length,
    processed: allRefunds.filter(r => r.status === 'processed').length,
    totalAmount: allRefunds
      .filter(r => r.status === 'processed')
      .reduce((sum, r) => sum + r.amount, 0),
  }), [allRefunds]);

  return (
    <Layout>
      <div className="container-custom py-12">
        <h1 className="text-3xl font-bold mb-8">Refund Management</h1>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-5 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.pending}</div>
                  <p className="text-sm text-gray-500">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.approved}</div>
                  <p className="text-sm text-gray-500">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.rejected}</div>
                  <p className="text-sm text-gray-500">Rejected</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.processed}</div>
                  <p className="text-sm text-gray-500">Processed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xl font-bold">{formatCurrency(stats.totalAmount)}</div>
                  <p className="text-sm text-gray-500">Total Refunded</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'pending' ? 'default' : 'outline'}
            onClick={() => setActiveTab('pending')}
          >
            Pending Review ({stats.pending})
          </Button>
          <Button
            variant={activeTab === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveTab('all')}
          >
            All Refunds
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === 'pending' ? 'Pending Refund Requests' : 'All Refund Requests'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader size="lg" />
              </div>
            ) : refunds.length === 0 ? (
              <p className="text-center py-8 text-gray-500">
                {activeTab === 'pending' ? 'No pending refund requests.' : 'No refund requests found.'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">ID</th>
                      <th className="text-left py-3 px-4 font-semibold">User</th>
                      <th className="text-left py-3 px-4 font-semibold">Equipment</th>
                      <th className="text-left py-3 px-4 font-semibold">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 font-semibold">Requested</th>
                      <th className="text-left py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {refunds.map((refund: RefundRequest) => (
                      <tr key={refund.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-sm">#{refund.id}</td>
                        <td className="py-3 px-4">{refund.user?.name || 'N/A'}</td>
                        <td className="py-3 px-4">{refund.booking.equipment.name}</td>
                        <td className="py-3 px-4 font-semibold">{formatCurrency(refund.amount)}</td>
                        <td className="py-3 px-4">
                          <Badge className={REFUND_STATUS_COLORS[refund.status]}>
                            {REFUND_STATUS_LABELS[refund.status]}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">{formatDate(refund.created_at)}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedRefund(refund)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {refund.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 hover:bg-green-50"
                                  onClick={() => handleProcess(refund, true)}
                                  title="Approve Refund"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:bg-red-50"
                                  onClick={() => handleProcess(refund, false)}
                                  title="Reject Refund"
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

        {/* Refund Details Modal */}
        <Modal
          isOpen={!!selectedRefund}
          onClose={() => setSelectedRefund(null)}
          title="Refund Request Details"
          size="md"
        >
          {selectedRefund && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Request ID</span>
                <span className="font-mono font-semibold">#{selectedRefund.id}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500">Status</span>
                <Badge className={REFUND_STATUS_COLORS[selectedRefund.status]}>
                  {REFUND_STATUS_LABELS[selectedRefund.status]}
                </Badge>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Customer
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium">{selectedRefund.user?.name || 'N/A'}</p>
                  <p className="text-sm text-gray-500">{selectedRefund.user?.email || 'N/A'}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Booking Details
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p><strong>Equipment:</strong> {selectedRefund.booking.equipment.name}</p>
                  <p><strong>Booking ID:</strong> #{selectedRefund.booking.id}</p>
                  <p>
                    <strong>Dates:</strong> {formatDate(selectedRefund.booking.start_date)} - {formatDate(selectedRefund.booking.end_date)}
                  </p>
                  <p><strong>Original Amount:</strong> {formatCurrency(selectedRefund.booking.total_price)}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Refund Reason</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">{selectedRefund.reason}</p>
                </div>
              </div>

              <div className="border-t pt-4 flex items-center justify-between">
                <div>
                  <span className="text-gray-500">Refund Amount</span>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(selectedRefund.amount)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-gray-500 text-sm">Requested</span>
                  <p className="text-sm">{formatDateTime(selectedRefund.created_at)}</p>
                </div>
              </div>

              {selectedRefund.admin_notes && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Admin Notes</h4>
                  <div className={`rounded-lg p-4 ${
                    selectedRefund.status === 'rejected' ? 'bg-red-50' : 'bg-blue-50'
                  }`}>
                    <p>{selectedRefund.admin_notes}</p>
                  </div>
                </div>
              )}

              {selectedRefund.status === 'pending' && (
                <div className="border-t pt-4 flex gap-3">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setSelectedRefund(null);
                      handleProcess(selectedRefund, true);
                    }}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Approve Refund
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => {
                      setSelectedRefund(null);
                      handleProcess(selectedRefund, false);
                    }}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reject Refund
                  </Button>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Process Refund Confirmation Modal */}
        <Modal
          isOpen={!!processAction}
          onClose={() => {
            setProcessAction(null);
            setAdminNotes('');
          }}
          title={processAction?.approved ? 'Approve Refund' : 'Reject Refund'}
          size="sm"
        >
          {processAction && (
            <div className="space-y-4">
              <p className="text-gray-600">
                {processAction.approved
                  ? `Are you sure you want to approve this refund of ${formatCurrency(processAction.refund.amount)}? The amount will be refunded to the customer's original payment method.`
                  : 'Are you sure you want to reject this refund request?'}
              </p>

              <div className="space-y-2">
                <Label htmlFor="adminNotes">
                  {processAction.approved ? 'Notes (optional)' : 'Rejection Reason (recommended)'}
                </Label>
                <textarea
                  id="adminNotes"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                  placeholder={processAction.approved 
                    ? 'Add any notes about this refund...'
                    : 'Explain why this refund is being rejected...'
                  }
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setProcessAction(null);
                    setAdminNotes('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className={`flex-1 ${processAction.approved ? '' : 'bg-red-600 hover:bg-red-700'}`}
                  onClick={confirmProcess}
                  disabled={processRefundMutation.isPending}
                >
                  {processRefundMutation.isPending ? (
                    <Loader size="sm" className="mr-2" />
                  ) : null}
                  {processAction.approved ? 'Approve Refund' : 'Reject Refund'}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};
