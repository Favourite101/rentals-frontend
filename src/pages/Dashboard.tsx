import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Loader';
import { EmptyState } from '@/components/ui/EmptyState';
import { bookingsApi } from '@/lib/api/bookings';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { QUERY_KEYS, ROUTES, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '@/constants';
import { Package, Calendar, Clock, CheckCircle } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: [QUERY_KEYS.MY_BOOKINGS],
    queryFn: bookingsApi.getMyBookings,
  });

  // Track which bookings have had "Book Again" clicked
  const [rebookedIds, setRebookedIds] = React.useState<Set<number>>(() => {
    const stored = localStorage.getItem('rebooked_bookings');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  const handleBookAgain = (bookingId: number) => {
    const newRebookedIds = new Set(rebookedIds);
    newRebookedIds.add(bookingId);
    setRebookedIds(newRebookedIds);
    localStorage.setItem('rebooked_bookings', JSON.stringify([...newRebookedIds]));
  };

  const stats = React.useMemo(() => {
    const total = bookings.length;
    const active = bookings.filter(b => b.status === 'confirmed').length;
    const pending = bookings.filter(b => b.status === 'pending').length;

    return { total, active, pending };
  }, [bookings]);

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
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">Manage your equipment bookings</p>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Package className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Bookings</p>
                  <p className="text-3xl font-bold">{stats.active}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Payment</p>
                  <p className="text-3xl font-bold">{stats.pending}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <Link to={ROUTES.EQUIPMENT}>
            <Button size="lg">
              <Package className="mr-2 h-5 w-5" />
              Browse Equipment
            </Button>
          </Link>
        </div>

        {/* Bookings Table */}
        <Card>
          <CardHeader>
            <CardTitle>My Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Equipment</th>
                      <th className="text-left py-3 px-4 font-semibold">Dates</th>
                      <th className="text-left py-3 px-4 font-semibold">Total</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium">{booking.equipment.name}</div>
                          <div className="text-sm text-gray-600">{booking.equipment.category.name}</div>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div>{formatDate(booking.start_date)}</div>
                          <div className="text-gray-600">to {formatDate(booking.end_date)}</div>
                        </td>
                        <td className="py-3 px-4 font-semibold">{formatCurrency(booking.total_price)}</td>
                        <td className="py-3 px-4">
                          <Badge className={BOOKING_STATUS_COLORS[booking.status]}>
                            {BOOKING_STATUS_LABELS[booking.status]}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {booking.status === 'pending' && (
                            <Link to={`/booking/${booking.id}/payment`}>
                              <Button size="sm">Pay Now</Button>
                            </Link>
                          )}
                          {booking.status === 'expired' && !rebookedIds.has(booking.id) && (
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-500">Payment window expired</span>
                              <Link 
                                to={`/equipment/${booking.equipment.slug}`}
                                onClick={() => handleBookAgain(booking.id)}
                              >
                                <Button size="sm" variant="outline">Book Again</Button>
                              </Link>
                            </div>
                          )}
                          {booking.status === 'expired' && rebookedIds.has(booking.id) && (
                            <span className="text-xs text-gray-500">Rebooked</span>
                          )}
                          {booking.status === 'cancelled' && !rebookedIds.has(booking.id) && (
                            <Link 
                              to={`/equipment/${booking.equipment.slug}`}
                              onClick={() => handleBookAgain(booking.id)}
                            >
                              <Button size="sm" variant="outline">Book Again</Button>
                            </Link>
                          )}
                          {booking.status === 'cancelled' && rebookedIds.has(booking.id) && (
                            <span className="text-xs text-gray-500">Rebooked</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={Calendar}
                title="No bookings yet"
                description="Start by browsing our equipment catalog and make your first booking."
                action={
                  <Link to={ROUTES.EQUIPMENT}>
                    <Button>Browse Equipment</Button>
                  </Link>
                }
              />
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
