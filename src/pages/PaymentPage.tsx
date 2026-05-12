import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageLoader, Loader } from '@/components/ui/Loader';
import { bookingsApi } from '@/lib/api/bookings';
import { showToast } from '@/lib/hooks/useToast';
import { handleApiError } from '@/lib/api/axios';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { QUERY_KEYS, ROUTES, STRIPE_PUBLISHABLE_KEY } from '@/constants';
import { CreditCard, Calendar, Package, Shield } from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import type { Booking } from '@/types';

// Initialize Stripe
const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

interface CheckoutFormProps {
  booking: Booking;
  clientSecret: string;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ booking }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Submit the payment form first to validate
      const { error: submitError } = await elements.submit();
      if (submitError) {
        showToast(submitError.message || 'Please check your payment details', 'error');
        setIsProcessing(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}${ROUTES.BOOKING_SUCCESS.replace(':id', String(booking.id))}`,
        },
        redirect: 'if_required',
      });

      if (error) {
        // Handle specific error types
        if (error.type === 'card_error' || error.type === 'validation_error') {
          showToast(error.message || 'Payment failed', 'error');
        } else {
          showToast('An unexpected error occurred. Please try again.', 'error');
        }
      } else if (paymentIntent) {
        if (paymentIntent.status === 'succeeded') {
          // Confirm payment on backend
          try {
            await bookingsApi.confirmPayment(paymentIntent.id, booking.id);
            showToast('Payment successful!', 'success');
            navigate(ROUTES.BOOKING_SUCCESS.replace(':id', String(booking.id)));
          } catch (confirmError) {
            showToast(handleApiError(confirmError), 'error');
          }
        } else if (paymentIntent.status === 'requires_action') {
          // 3D Secure or other authentication required - Stripe handles this automatically
          showToast('Additional authentication required', 'info');
        } else {
          showToast(`Payment status: ${paymentIntent.status}`, 'info');
        }
      }
    } catch {
      showToast('An unexpected error occurred', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-gray-50 rounded-lg">
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Shield className="h-4 w-4" />
        <span>Your payment is secured with SSL encryption</span>
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader size="sm" className="mr-2" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            Pay {formatCurrency(booking.total_price)}
          </>
        )}
      </Button>
    </form>
  );
};

export const PaymentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

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

  // Create payment intent when booking is loaded
  const paymentCreatedRef = React.useRef(false);
  React.useEffect(() => {
    if (booking && booking.status === 'pending' && !paymentCreatedRef.current) {
      paymentCreatedRef.current = true;
      createPaymentMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking]);

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

  if (booking.status !== 'pending') {
    return (
      <Layout>
        <div className="container-custom py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">
            {booking.status === 'confirmed' ? 'Booking Already Paid' : 'Booking Cancelled'}
          </h2>
          <p className="text-gray-600 mb-6">
            {booking.status === 'confirmed'
              ? 'This booking has already been paid for.'
              : 'This booking has been cancelled.'}
          </p>
          <Button onClick={() => navigate(ROUTES.DASHBOARD)}>Go to Dashboard</Button>
        </div>
      </Layout>
    );
  }

  if (!STRIPE_PUBLISHABLE_KEY) {
    return (
      <Layout>
        <div className="container-custom py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Payment Not Available</h2>
          <p className="text-gray-600">Payment processing is not configured.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-custom py-12">
        <BackButton label="Back" />
        <h1 className="text-3xl font-bold mb-6">Complete Payment</h1>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Booking Summary */}
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

              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Rental Period:</span>
                </div>
                <div className="pl-6 text-sm">
                  <p>{formatDate(booking.start_date)} - {formatDate(booking.end_date)}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Daily Rate:</span>
                  <span>{formatCurrency(booking.equipment.daily_rate)}</span>
                </div>
                <div className="flex justify-between items-center mt-2 text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">{formatCurrency(booking.total_price)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Details
              </CardTitle>
              <CardDescription>
                Enter your card information to complete the booking
              </CardDescription>
            </CardHeader>
            <CardContent>
              {createPaymentMutation.isPending ? (
                <div className="flex items-center justify-center py-12">
                  <Loader size="lg" />
                </div>
              ) : createPaymentMutation.data?.client_secret ? (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret: createPaymentMutation.data.client_secret,
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: '#2563eb',
                        borderRadius: '8px',
                      },
                    },
                  }}
                >
                  <CheckoutForm
                    booking={booking}
                    clientSecret={createPaymentMutation.data.client_secret}
                  />
                </Elements>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">Unable to initialize payment</p>
                  <Button onClick={() => createPaymentMutation.mutate()}>
                    Try Again
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};
