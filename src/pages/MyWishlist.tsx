import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { EquipmentCard } from '@/components/equipment/EquipmentCard';
import { BackButton } from '@/components/ui/BackButton';
import { wishlistApi } from '@/lib/api/wishlist';
import { QUERY_KEYS, ROUTES } from '@/constants';
import { Heart, ChevronRight } from 'lucide-react';

export const MyWishlist: React.FC = () => {
  const { data: items = [], isLoading } = useQuery({
    queryKey: [QUERY_KEYS.WISHLIST],
    queryFn: wishlistApi.getAll,
  });

  return (
    <Layout>
      <div className="container-custom py-8">
        <BackButton label="Back" />
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
          {items.length > 0 && (
            <span className="text-sm text-gray-400 font-medium">{items.length} item{items.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-2xl skeleton" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Heart className="h-8 w-8 text-gray-300" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Nothing saved yet</h2>
            <p className="text-sm text-gray-400 mb-6">Tap the heart on any item to save it here.</p>
            <Link
              to={ROUTES.EQUIPMENT}
              className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              Browse items <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items.map(item => (
              <EquipmentCard key={item.id} equipment={item.equipment} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};
