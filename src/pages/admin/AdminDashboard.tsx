import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { adminApi } from '@/lib/api/admin';
import { bookingsApi } from '@/lib/api/bookings';
import { QUERY_KEYS, ROUTES } from '@/constants';
import { Users, LayoutList, Calendar, Receipt, Activity } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { data: stats } = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_STATS],
    queryFn: adminApi.getStats,
  });

  const { data: pendingRefunds = [] } = useQuery({
    queryKey: [QUERY_KEYS.PENDING_REFUNDS],
    queryFn: bookingsApi.getPendingRefunds,
  });

  return (
    <Layout>
      <div className="container-custom py-12">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold">{stats?.total_users || 0}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Listings</p>
                  <p className="text-3xl font-bold">{stats?.total_listings || 0}</p>
                </div>
                <LayoutList className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Borrows</p>
                  <p className="text-3xl font-bold">{stats?.total_bookings || 0}</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Rentals</p>
                  <p className="text-3xl font-bold">{stats?.active_bookings || 0}</p>
                </div>
                <Activity className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Link to={ROUTES.ADMIN_USERS}>
            <Button className="w-full h-32 text-lg" variant="outline">
              <div className="flex flex-col items-center gap-2">
                <Users className="h-8 w-8" />
                <span>Manage Users</span>
              </div>
            </Button>
          </Link>

          <Link to={ROUTES.ADMIN_LISTINGS}>
            <Button className="w-full h-32 text-lg" variant="outline">
              <div className="flex flex-col items-center gap-2">
                <LayoutList className="h-8 w-8" />
                <span>Moderate Listings</span>
              </div>
            </Button>
          </Link>

          <Link to={ROUTES.ADMIN_BOOKINGS}>
            <Button className="w-full h-32 text-lg" variant="outline">
              <div className="flex flex-col items-center gap-2">
                <Calendar className="h-8 w-8" />
                <span>Manage Bookings</span>
              </div>
            </Button>
          </Link>

          <Link to={ROUTES.ADMIN_REFUNDS}>
            <Button className="w-full h-32 text-lg relative" variant="outline">
              <div className="flex flex-col items-center gap-2">
                <Receipt className="h-8 w-8" />
                <span>Manage Refunds</span>
              </div>
              {pendingRefunds.length > 0 && (
                <Badge className="absolute top-2 right-2 bg-amber-500">
                  {pendingRefunds.length}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};
