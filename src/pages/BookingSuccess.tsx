import * as React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Loader';
import { bookingsApi } from '@/lib/api/bookings';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { QUERY_KEYS, ROUTES } from '@/constants';
import { CheckCircle, Calendar, Package } from 'lucide-react';

export const BookingSuccess: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: booking, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.BOOKINGS, id],
    queryFn: () => bookingsApi.getById(Number(id)),
    enabled: !!id,
  });

  if (isLoading) {
    return <Layout><PageLoader /></Layout>;
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
                  <span className="text-emerald-600">{formatCurrency(booking.total_price + booking.security_deposit_amount)}</span>
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
