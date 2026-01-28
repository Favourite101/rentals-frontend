import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { equipmentApi } from '@/lib/api/equipment';
import { bookingsApi } from '@/lib/api/bookings';
import { QUERY_KEYS, ROUTES } from '@/constants';
import { Package, Calendar, Layers } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { data: equipment = [] } = useQuery({
    queryKey: [QUERY_KEYS.EQUIPMENT_LIST],
    queryFn: equipmentApi.getAll,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: [QUERY_KEYS.ALL_BOOKINGS],
    queryFn: bookingsApi.getAllBookings,
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
                  <p className="text-sm text-gray-600">Total Equipment</p>
                  <p className="text-3xl font-bold">{equipment.length}</p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Bookings</p>
                  <p className="text-3xl font-bold">{bookings.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Link to={ROUTES.ADMIN_EQUIPMENT}>
            <Button className="w-full h-32 text-lg" variant="outline">
              <div className="flex flex-col items-center gap-2">
                <Package className="h-8 w-8" />
                <span>Manage Equipment</span>
              </div>
            </Button>
          </Link>
          
          <Link to={ROUTES.ADMIN_CATEGORIES}>
            <Button className="w-full h-32 text-lg" variant="outline">
              <div className="flex flex-col items-center gap-2">
                <Layers className="h-8 w-8" />
                <span>Manage Categories</span>
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
        </div>
      </div>
    </Layout>
  );
};
