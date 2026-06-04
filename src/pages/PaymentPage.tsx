import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageLoader, Loader } from '@/components/ui/Loader';
import { bookingsApi } from '@/lib/api/bookings';
import { getCurrentUser } from '@/lib/hooks/useAuth';
import { showToast } from '@/lib/hooks/useToast';
import { handleApiError } from '@/lib/api/axios';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { QUERY_KEYS, ROUTES, PAYSTACK_PUBLIC_KEY } from '@/constants';
import { CreditCard, Calendar, Package, Shield } from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import type { Booking } from '@/types';

declare global {
  interface Window {
    PaystackPop: {
      setup(options: {
        key: string;
        email: string;
        amount: number;
        ref: string;
        currency?: string;
        callback: (response: { reference: string }) => void;
        onClose: () => void;
      }): { openIframe(): void };
    };
  }
}

interface PaymentSummaryProps {
  booking: Booking;
}

const PaymentSummary: React.FC<PaymentSummaryProps> = ({ booking }) => {
  const rentalFee = booking.rental_fee ?? booking.total_price;
  const serviceFee = Math.round(rentalFee * 0.05);
  const deposit = booking.security_deposit_amount ?? 0;
  const grandTotal = rentalFee + serviceFee + deposit;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Booking Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-4">
          {booking.equipment.image_url ? (
            <img
              src={booking.equipment.image_url}
              alt={booking.equipment.name}
              className="w-24 h-24 rounded-lg object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-lg">{booking.equipment.name}</h3>
            <p className="text-sm text-gray-600">{booking.equipment.category?.name}</p>
          </div>
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(booking.start_date)} — {formatDate(booking.end_date)}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Rental fee</span>
            <span>{formatCurrency(rentalFee)}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>Service fee (5%)</span>
            <span>{formatCurrency(serviceFee)}</span>
          </div>
          {deposit > 0 && (
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" /> Deposit (refundable)
              </span>
              <span>{formatCurrency(deposit)}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 border-t text-lg font-bold">
            <span>Total charged</span>
            <span className="text-primary">{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const PaymentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [isProcessing, setIsProcessing] = React.useState(false);

  const { data: booking, isLoading: bookingLoading } = useQuery({
    queryKey: [QUERY_KEYS.BOOKINGS, id],
    queryFn: () => bookingsApi.getById(Number(id)),
    enabled: !!id,
  });

  const createPaymentMutation = useMutation({
    mutationFn: () => bookingsApi.createPayment(Number(id)),
    onError: (error) => {
      showToast(handleApiError(error), 'error');
    },
  });

  const confirmMutation = useMutation({
    mutationFn: ({ reference, bookingId }: { reference: string; bookingId: number }) =>
      bookingsApi.confirmPayment(reference, bookingId),
    onSuccess: () => {
      showToast('Payment successful!', 'success');
      navigate(ROUTES.BOOKING_SUCCESS.replace(':id', String(id)));
    },
    onError: (error) => {
      showToast(handleApiError(error), 'error');
      setIsProcessing(false);
    },
  });

  const handlePayNow = async () => {
    if (!booking || !user) return;

    setIsProcessing(true);
    let paymentData;
    try {
      paymentData = await createPaymentMutation.mutateAsync();
    } catch {
      setIsProcessing(false);
      return;
    }

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: user.email,
      amount: paymentData.amount_kobo,
      ref: paymentData.reference,
      currency: 'NGN',
      callback: (response) => {
        confirmMutation.mutate({ reference: response.reference, bookingId: booking.id });
      },
      onClose: () => {
        showToast('Payment cancelled', 'info');
        setIsProcessing(false);
      },
    });

    handler.openIframe();
  };

  if (bookingLoading) {
    return <Layout><PageLoader /></Layout>;
  }

  if (!booking) {
    return (
      <Layout>
        <div className="container-custom py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Booking Not Found</h2>
          <Button onClick={() => navigate(ROUTES.DASHBOARD)}>Go to Dashboard</Button>
        </div>
      </Layout>
    );
  }

  if (booking.status === 'requested') {
    return (
      <Layout>
        <div className="container-custom py-12 max-w-md mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
            <Calendar className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Awaiting Lender Approval</h2>
          <p className="text-gray-600 mb-2">
            The owner of <strong>{booking.equipment.name}</strong> reviews each request before payment.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            You'll receive an email and notification once they approve or decline. Payment will only be charged after approval.
          </p>
          <Button onClick={() => navigate(ROUTES.DASHBOARD)}>View My Bookings</Button>
        </div>
      </Layout>
    );
  }

  if (booking.status !== 'pending') {
    const messages: Record<string, string> = {
      confirmed: 'This booking has already been paid for.',
      cancelled: 'This booking was cancelled.',
      declined: 'This rental request was declined by the lender.',
      expired: 'This booking expired without payment.',
      failed: 'The payment for this booking failed.',
    };
    return (
      <Layout>
        <div className="container-custom py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">
            {booking.status === 'confirmed' ? 'Booking Already Paid' : 'Booking Unavailable'}
          </h2>
          <p className="text-gray-600 mb-6">
            {messages[booking.status] ?? 'This booking is no longer available for payment.'}
          </p>
          <Button onClick={() => navigate(ROUTES.DASHBOARD)}>Go to Dashboard</Button>
        </div>
      </Layout>
    );
  }

  const rentalFee = booking.rental_fee ?? booking.total_price;
  const serviceFee = Math.round(rentalFee * 0.05);
  const totalCharged = rentalFee + serviceFee + (booking.security_deposit_amount ?? 0);

  return (
    <Layout>
      <div className="container-custom py-12">
        <BackButton label="Back" />
        <h1 className="text-3xl font-bold mb-6">Complete Payment</h1>

        <div className="grid gap-8 lg:grid-cols-2">
          <PaymentSummary booking={booking} />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment
              </CardTitle>
              <CardDescription>
                You will be redirected to Paystack's secure checkout to complete your payment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rental fee</span>
                  <span>{formatCurrency(rentalFee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service fee (5%)</span>
                  <span>{formatCurrency(serviceFee)}</span>
                </div>
                {(booking.security_deposit_amount ?? 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Security deposit (refundable)</span>
                    <span>{formatCurrency(booking.security_deposit_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Total</span>
                  <span>{formatCurrency(totalCharged)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="h-4 w-4 flex-shrink-0" />
                <span>Your payment is secured by Paystack. The security deposit is fully refundable after the rental period.</span>
              </div>

              <Button
                onClick={handlePayNow}
                disabled={isProcessing || confirmMutation.isPending}
                className="w-full"
                size="lg"
              >
                {isProcessing || confirmMutation.isPending ? (
                  <>
                    <Loader size="sm" className="mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Pay {formatCurrency(totalCharged)}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};
