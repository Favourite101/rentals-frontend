import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Loader';
import { EmptyState } from '@/components/ui/EmptyState';
import { bookingsApi } from '@/lib/api/bookings';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils/formatters';
import { QUERY_KEYS, ROUTES, REFUND_STATUS_LABELS, REFUND_STATUS_COLORS } from '@/constants';
import { Receipt, ArrowLeft, Package, Calendar, CreditCard } from 'lucide-react';
import type { RefundRequest } from '@/types';

export const MyRefunds: React.FC = () => {
  const { data: refunds = [], isLoading } = useQuery({
    queryKey: [QUERY_KEYS.MY_REFUNDS],
    queryFn: bookingsApi.getMyRefunds,
  });

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
          <Link
            to={ROUTES.DASHBOARD}
            className="inline-flex items-center text-primary hover:underline mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mb-2">My Refund Requests</h1>
          <p className="text-gray-600">Track the status of your refund requests</p>
        </div>

        {refunds.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No refund requests"
            description="You haven't made any refund requests yet."
            action={
              <Link to={ROUTES.DASHBOARD}>
                <Button>Back to Dashboard</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {refunds.map((refund: RefundRequest) => (
              <Card key={refund.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">
                          Refund Request #{refund.id}
                        </h3>
                        <Badge className={REFUND_STATUS_COLORS[refund.status]}>
                          {REFUND_STATUS_LABELS[refund.status]}
                        </Badge>
                      </div>

                      <div className="grid gap-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Package className="h-4 w-4" />
                          <span>Equipment: <strong>{refund.booking.equipment.name}</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Booking: {formatDate(refund.booking.start_date)} - {formatDate(refund.booking.end_date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <CreditCard className="h-4 w-4" />
                          <span>Refund Amount: <strong className="text-primary">{formatCurrency(refund.refund_amount)}</strong></span>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-700">
                          <strong>Reason:</strong> {refund.reason}
                        </p>
                      </div>

                      {refund.admin_notes && (
                        <div className={`rounded-lg p-3 ${
                          refund.status === 'rejected' ? 'bg-red-50' : 'bg-blue-50'
                        }`}>
                          <p className="text-sm">
                            <strong>Admin Response:</strong> {refund.admin_notes}
                          </p>
                        </div>
                      )}

                      <p className="text-xs text-gray-500">
                        Requested on {formatDateTime(refund.created_at)}
                        {refund.processed_at && (
                          <> • Processed on {formatDateTime(refund.processed_at)}</>
                        )}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(refund.refund_amount)}
                      </div>
                      <p className="text-xs text-gray-500">Refund Amount</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};
