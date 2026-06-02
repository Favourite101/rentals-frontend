import * as React from 'react';
import { Link } from 'react-router-dom';
import { Equipment } from '@/types';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils/formatters';
import { MapPin, Heart, Package, Star, BadgeCheck } from 'lucide-react';
import { ROUTES } from '@/constants';
import { useWishlist } from '@/lib/hooks/useWishlist';

interface EquipmentCardProps {
  equipment: Equipment;
  compact?: boolean;
}

export const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment, compact = false }) => {
  const detailUrl = ROUTES.EQUIPMENT_DETAIL.replace(':slug', equipment.slug);
  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(equipment.id);

  if (compact) {
    return (
      <Link to={detailUrl} className="group block">
        <div className="relative rounded-xl overflow-hidden aspect-square bg-gray-100 mb-2">
          {equipment.image_url
            ? <img src={equipment.image_url} alt={equipment.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            : <div className="w-full h-full flex items-center justify-center"><Package className="h-8 w-8 text-gray-300" /></div>}
          <div className="absolute top-2 left-2">
            <span className="bg-primary text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">Just added</span>
          </div>
          <button
            className="absolute top-2 right-2 h-6 w-6 rounded-full bg-white/90 flex items-center justify-center hover:scale-110 transition-transform"
            onClick={e => { e.preventDefault(); toggle(equipment.id); }}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Heart className={`h-3 w-3 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
          </button>
        </div>
        <p className="text-xs font-semibold text-gray-900 line-clamp-1">{equipment.name}</p>
        <p className="text-xs text-gray-500">{formatCurrency(equipment.daily_rate)}<span className="text-gray-400">/day</span></p>
      </Link>
    );
  }

  return (
    <div className="group rounded-2xl overflow-hidden bg-white border border-gray-100 hover:shadow-md transition-shadow duration-200">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {equipment.image_url
          ? <img src={equipment.image_url} alt={equipment.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          : <div className="flex h-full items-center justify-center bg-gray-50"><Package className="h-12 w-12 text-gray-200" /></div>}

        {/* Availability badge */}
        <div className="absolute top-2 left-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-white shadow-sm ${equipment.is_available ? 'text-gray-700' : 'text-gray-400'}`}>
            <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${equipment.is_available ? 'bg-emerald-500' : 'bg-gray-400'}`} />
            {equipment.is_available ? 'Available today' : 'Unavailable'}
          </span>
        </div>

        {/* Heart */}
        <button
          className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white shadow-sm flex items-center justify-center hover:scale-110 transition-transform"
          onClick={e => { e.preventDefault(); toggle(equipment.id); }}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`h-3.5 w-3.5 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-0.5 line-clamp-1">{equipment.name}</h3>

        {equipment.owner && (
          <div className="flex items-center gap-1 mb-1">
            <p className="text-xs text-gray-500">by {equipment.owner.name}</p>
            <BadgeCheck className="h-3 w-3 text-primary flex-shrink-0" />
          </div>
        )}

        {equipment.location && (
          <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="line-clamp-1">{equipment.location}</span>
          </div>
        )}

        {/* Rating row */}
        <div className="flex items-center gap-1 mb-2.5">
          <Star className="h-3 w-3 text-amber-400 fill-amber-400 flex-shrink-0" />
          <span className="text-xs font-semibold text-gray-700">4.9</span>
          <span className="text-xs text-gray-400">(24)</span>
        </div>

        <div className="flex items-baseline gap-0.5 mb-2.5">
          <span className="text-sm font-bold text-gray-900">{formatCurrency(equipment.daily_rate)}</span>
          <span className="text-xs text-gray-400 font-normal"> / day</span>
        </div>

        <Link to={detailUrl}>
          <Button className="w-full h-9 text-sm font-medium rounded-xl" disabled={!equipment.is_available}>
            {equipment.is_available ? 'Rent now' : 'Unavailable'}
          </Button>
        </Link>
      </div>
    </div>
  );
};
