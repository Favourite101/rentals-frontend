import * as React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { CheckCircle } from 'lucide-react';
import { ROUTES } from '@/constants';

export const BookingSuccess: React.FC = () => {
  return (
    <Layout>
      <div className="container-custom py-12 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-6">
          <CheckCircle className="h-12 w-12 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Booking Confirmed!</h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Your booking has been successfully confirmed. You'll receive a confirmation email shortly.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to={ROUTES.DASHBOARD}>
            <Button>View Dashboard</Button>
          </Link>
          <Link to={ROUTES.EQUIPMENT}>
            <Button variant="outline">Browse More Equipment</Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};
