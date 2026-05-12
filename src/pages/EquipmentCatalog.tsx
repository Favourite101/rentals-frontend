import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { EquipmentCard } from '@/components/equipment/EquipmentCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Loader';
import { EmptyState } from '@/components/ui/EmptyState';
import { equipmentApi } from '@/lib/api/equipment';
import { QUERY_KEYS, ROUTES } from '@/constants';
import { Search, Package, Filter } from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { debounce } from '@/lib/utils/helpers';

export const EquipmentCatalog: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<number | null>(null);
  const [showAvailableOnly, setShowAvailableOnly] = React.useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES],
    queryFn: equipmentApi.getAllCategories,
  });

  const { data: equipment = [], isLoading } = useQuery({
    queryKey: [QUERY_KEYS.EQUIPMENT_LIST],
    queryFn: equipmentApi.getAll,
  });

  const filteredEquipment = React.useMemo(() => {
    let filtered = equipment;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter((item) => item.category_id === selectedCategory);
    }

    // Availability filter
    if (showAvailableOnly) {
      filtered = filtered.filter((item) => item.is_available);
    }

    return filtered;
  }, [equipment, searchQuery, selectedCategory, showAvailableOnly]);

  const handleSearch = React.useMemo(
    () =>
      debounce((value: string) => {
        setSearchQuery(value);
      }, 300),
    []
  );

  if (isLoading) {
    return (
      <Layout>
        <PageLoader />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gradient-to-br from-primary/5 via-white to-secondary/5 py-12">
        <div className="container-custom">
          <BackButton to={ROUTES.DASHBOARD} label="Back to Dashboard" />
          <div className="text-center mb-12">
            <h1 className="heading-lg mb-4">Browse Items</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find and borrow items from people in your community
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="grid gap-4 md:grid-cols-[1fr_auto_auto]">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search items..."
                  className="pl-10"
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              {/* Category Filter */}
              <select
                className="h-11 rounded-lg border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={selectedCategory || ''}
                onChange={(e) =>
                  setSelectedCategory(e.target.value ? Number(e.target.value) : null)
                }
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category?.name}
                  </option>
                ))}
              </select>

              {/* Availability Toggle */}
              <Button
                variant={showAvailableOnly ? 'default' : 'outline'}
                onClick={() => setShowAvailableOnly(!showAvailableOnly)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Available Only
              </Button>
            </div>

            {/* Active Filters */}
            {(searchQuery || selectedCategory || showAvailableOnly) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {searchQuery && (
                  <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                    Search: {searchQuery}
                    <button onClick={() => setSearchQuery('')} className="hover:text-primary/70">
                      ×
                    </button>
                  </div>
                )}
                {selectedCategory && (
                  <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                    {categories.find((c) => c.id === selectedCategory)?.name}
                    <button onClick={() => setSelectedCategory(null)} className="hover:text-primary/70">
                      ×
                    </button>
                  </div>
                )}
                {showAvailableOnly && (
                  <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                    Available Only
                    <button onClick={() => setShowAvailableOnly(false)} className="hover:text-primary/70">
                      ×
                    </button>
                  </div>
                )}
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory(null);
                    setShowAvailableOnly(false);
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900 underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Showing {filteredEquipment.length} of {equipment.length} items
            </p>
          </div>

          {/* Equipment Grid */}
          {filteredEquipment.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredEquipment.map((item) => (
                <EquipmentCard key={item.id} equipment={item} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Package}
              title="No items found"
              description="Try adjusting your filters or search query to find what you're looking for."
              action={
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory(null);
                    setShowAvailableOnly(false);
                  }}
                >
                  Clear Filters
                </Button>
              }
            />
          )}
        </div>
      </div>
    </Layout>
  );
};
