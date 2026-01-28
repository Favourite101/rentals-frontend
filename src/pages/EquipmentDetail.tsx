import * as React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Loader';
import { equipmentApi } from '@/lib/api/equipment';
import { QUERY_KEYS, ROUTES } from '@/constants';
import { formatCurrency } from '@/lib/utils/formatters';
import { Package, ArrowLeft, Calendar } from 'lucide-react';
import { isAuthenticated, isAdmin } from '@/lib/hooks/useAuth';

export const EquipmentDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const adminUser = isAdmin();

  const { data: equipment, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.EQUIPMENT, slug],
    queryFn: () => equipmentApi.getBySlug(slug!),
    enabled: !!slug,
  });

  const handleBook = () => {
    if (!authenticated) {
      navigate(ROUTES.LOGIN, { state: { from: { pathname: `/equipment/${slug}/book` } } });
    } else {
      navigate(`/equipment/${slug}/book`);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <PageLoader />
      </Layout>
    );
  }

  if (!equipment) {
    return (
      <Layout>
        <div className="container-custom py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Equipment Not Found</h2>
            <Link to={ROUTES.EQUIPMENT}>
              <Button>Browse Equipment</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-custom py-12">
        <Link to={ROUTES.EQUIPMENT} className="inline-flex items-center text-primary hover:underline mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Equipment
        </Link>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Image */}
          <div className="rounded-xl overflow-hidden bg-gray-100">
            {equipment.image_url ? (
              <img
                src={equipment.image_url}
                alt={equipment.name}
                className="w-full h-full object-cover aspect-square"
              />
            ) : (
              <div className="flex items-center justify-center h-full min-h-[400px] bg-gradient-to-br from-gray-100 to-gray-200">
                <Package className="h-32 w-32 text-gray-400" />
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="mb-4">
              <Badge variant="outline">{equipment.category.name}</Badge>
            </div>
            
            <h1 className="text-4xl font-bold mb-4">{equipment.name}</h1>
            
            <div className="mb-6">
              <Badge variant={equipment.is_available ? 'success' : 'destructive'}>
                {equipment.is_available ? 'Available' : 'Unavailable'}
              </Badge>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-primary">
                  {formatCurrency(equipment.daily_rate)}
                </span>
                <span className="text-xl text-gray-600">/day</span>
              </div>
            </div>

            {equipment.description && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{equipment.description}</p>
              </div>
            )}

            <div className="space-y-4">
              {adminUser ? (
                <Button
                  onClick={() => navigate(-1)}
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Go Back
                </Button>
              ) : (
                <Button
                  onClick={handleBook}
                  disabled={!equipment.is_available}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  {equipment.is_available ? 'Book Now' : 'Currently Unavailable'}
                </Button>
              )}
              
              {!authenticated && equipment.is_available && (
                <p className="text-sm text-gray-600">
                  Please log in to book this equipment
                </p>
              )}
            </div>

            <div className="mt-12 p-6 bg-gray-50 rounded-xl">
              <h3 className="font-semibold mb-3">Rental Information</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Minimum rental period: 1 day</li>
                <li>• Payment required at booking</li>
                <li>• Collection arranged after confirmation</li>
                <li>• Full refund for cancellations 48h+ before start date</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
