import * as React from 'react';
import { Link } from 'react-router-dom';
import { Equipment } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils/formatters';
import { Package, MapPin, User as UserIcon } from 'lucide-react';

interface EquipmentCardProps {
  equipment: Equipment;
}

export const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment }) => {
  return (
    <Card className="group overflow-hidden card-hover">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {equipment.image_url ? (
          <img
            src={equipment.image_url}
            alt={equipment.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <Package className="h-16 w-16 text-gray-400" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge variant={equipment.is_available ? 'success' : 'destructive'}>
            {equipment.is_available ? 'Available' : 'Unavailable'}
          </Badge>
        </div>
      </div>

      <CardContent className="p-5">
        <div className="mb-2 flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            {equipment.category?.name}
          </Badge>
          {equipment.condition && (
            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200">
              {equipment.condition}
            </Badge>
          )}
        </div>
        <h3 className="text-lg font-bold mb-1 line-clamp-1">{equipment.name}</h3>

        {equipment.owner && (
          <div className="flex items-center text-xs text-gray-500 mb-2">
            <UserIcon className="h-3 w-3 mr-1" />
            <span>Listed by {equipment.owner.name}</span>
          </div>
        )}

        {equipment.location && (
          <div className="flex items-center text-xs text-gray-500 mb-3">
            <MapPin className="h-3 w-3 mr-1" />
            <span className="line-clamp-1">{equipment.location}</span>
          </div>
        )}

        {equipment.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{equipment.description}</p>
        )}
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-primary">
            {formatCurrency(equipment.daily_rate)}
          </span>
          <span className="text-sm text-gray-600">/day</span>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Link to={`/equipment/${equipment.slug}`} className="w-full">
          <Button className="w-full" disabled={!equipment.is_available}>
            {equipment.is_available ? 'View Details' : 'Unavailable'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
