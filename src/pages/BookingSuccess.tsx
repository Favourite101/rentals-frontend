import * as React from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Loader';
import { bookingsApi } from '@/lib/api/bookings';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { ROUTES } from '@/constants';
import { CheckCircle, XCircle, Calendar, Package } from 'lucide-react';

type PageStatus = 'loading' | 'success' | 'error';

export const BookingSuccess: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [pageStatus, setPageStatus] = React.useState<PageStatus>('loading');
  const [booking, setBooking] = React.useState<Awaited<ReturnType<typeof bookingsApi.getById>> | null>(null);
  const [errorMessage, setErrorMessage] = React.useState('');

  // Stripe appends these when redirecting after 3D Secure / bank redirects
  const paymentIntentId = searchParams.get('payment_intent');
  const redirectStatus = searchParams.get('redirect_status');

  React.useEffect(() => {
    if (!id) {
      navigate(ROUTES.DASHBOARD);
      return;
    }

    const confirm = async () => {
      try {
        if (paymentIntentId) {
          // Stripe redirect flow (3D Secure, iDEAL, etc.)
          if (redirectStatus === 'failed') {
            setErrorMessage('Your payment was declined. Please try again with a different payment method.');
            setPageStatus('error');
            return;
          }

          if (redirectStatus === 'processing') {
            // Rare — payment is still being processed asynchronously.
            // Webhook will confirm the booking when it completes.
            const fetchedBooking = await bookingsApi.getById(Number(id));
            setBooking(fetchedBooking);
            setPageStatus('success');
            return;
          }

          // redirectStatus === 'succeeded' — confirm on backend
          const confirmedBooking = await bookingsApi.confirmPayment(paymentIntentId, Number(id));
          setBooking(confirmedBooking);
          setPageStatus('success');
        } else {
          // Inline flow — payment was already confirmed before navigating here
          const fetchedBooking = await bookingsApi.getById(Number(id));
          setBooking(fetchedBooking);
          setPageStatus(fetchedBooking.status === 'confirmed' ? 'success' : 'error');
        }
      } catch {
        setErrorMessage('Something went wrong confirming your payment. Please check your dashboard or contact support.');
        setPageStatus('error');
      }
    };

    confirm();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (pageStatus === 'loading') {
    return <Layout><PageLoader /></Layout>;
  }

  if (pageStatus === 'error') {
    return (
      <Layout>
        <div className="container-custom py-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Payment Failed</h1>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {errorMessage || 'Your payment could not be processed.'}
          </p>
          <div className="flex gap-4 justify-center">
            {id && (
              <Link to={`/booking/${id}/payment`}>
                <Button>Try Again</Button>
              </Link>
            )}
            <Link to={ROUTES.DASHBOARD}>
              <Button variant="outline">Go to Dashboard</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-custom py-12">
        <div className="max-w-lg mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-6">
            <CheckCircle className="h-12 w-12 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600 mb-8">
            You'll receive a confirmation email shortly with all the details.
          </p>

          {booking && (
            <div className="bg-gray-50 rounded-xl p-6 text-left mb-8 space-y-4">
              <div className="flex items-center gap-3">
                {booking.equipment.image_url ? (
                  <img
                    src={booking.equipment.image_url}
                    alt={booking.equipment.name}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="font-semibold">{booking.equipment.name}</p>
                  <p className="text-sm text-gray-500">{booking.equipment.category?.name}</p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {formatDate(booking.start_date)} – {formatDate(booking.end_date)}
                  </span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total paid</span>
                  <span className="text-emerald-600">{formatCurrency(booking.total_price)}</span>
                </div>
                {booking.payment_reference && (
                  <p className="text-xs text-gray-400 break-all">
                    Ref: {booking.payment_reference}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <Link to={ROUTES.DASHBOARD}>
              <Button>View My Bookings</Button>
            </Link>
            <Link to={ROUTES.EQUIPMENT}>
              <Button variant="outline">Browse More</Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};
